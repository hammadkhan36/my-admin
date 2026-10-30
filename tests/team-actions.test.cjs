const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const ACTOR = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TARGET = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function setup({ actorRole = 'admin', targetRole = 'manager' } = {}) {
  const writes = [];
  const authCalls = [];
  const db = {
    auth: { admin: {
      async createUser(input) { authCalls.push(['createUser', input]); return { data: { user: { id: TARGET } }, error: null }; },
      async updateUserById(id) { authCalls.push(['updateUserById', id]); return { data: {}, error: null }; },
      async deleteUser(id) { authCalls.push(['deleteUser', id]); return { data: {}, error: null }; },
    } },
    from(table) {
      let selecting = false;
      const chain = {
        select() { selecting = true; return chain; },
        insert(row) { writes.push({ table, op: 'insert', row }); return chain; },
        update(row) { writes.push({ table, op: 'update', row }); return chain; },
        upsert(row) { writes.push({ table, op: 'upsert', row }); return chain; },
        delete() { writes.push({ table, op: 'delete' }); return chain; },
        eq() { return chain; },
        async maybeSingle() { return { data: selecting ? { role: targetRole } : null, error: null }; },
        then(resolve) { resolve({ error: null }); },
      };
      return chain;
    },
  };

  const cache = {};
  function load(file) {
    if (cache[file]) return cache[file];
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    cache[file] = exports;
    const mocks = {
      'server-only': {},
      '@/lib/supabase-admin': { createAdminClient: () => db },
      'next/cache': { revalidatePath() {} },
      'next/navigation': { unstable_rethrow() {} },
      '@/lib/auth/server': { requirePermission: async () => ({ id: ACTOR, role: actorRole }) },
      '@/lib/activity-log': { logActivity: async () => {} },
    };
    const local = {
      '@/lib/auth/roles': 'lib/auth/roles.ts',
      '@/lib/auth/member-guard': 'lib/auth/member-guard.ts',
      '@/lib/action-state': 'lib/action-state.ts',
    };
    vm.runInNewContext(js, {
      exports,
      // Ek hi Error class, taake getErrorMessage ka instanceof alag contexts mein bhi chale.
      Error,
      FormData,
      require: id => (id in local ? load(local[id]) : id in mocks ? mocks[id] : require(id)),
      console: { error() {} },
    });
    return exports;
  }

  return {
    roles: load('lib/auth/roles.ts'),
    staff: load('app/(admin)/team/staff/actions.ts'),
    perms: load('app/(admin)/team/permissions/actions.ts'),
    writes,
    authCalls,
  };
}

function form(fields) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const empty = { ok: false, message: '' };

test('rank helpers', () => {
  const { roles } = setup();
  assert.equal(roles.canManageRole('admin', 'admin'), false);
  assert.equal(roles.canManageRole('admin', 'manager'), true);
  assert.equal(roles.canManageRole('owner', 'admin'), true);
  assert.deepEqual([...roles.assignableRoles('admin')], ['manager', 'supervisor', 'staff']);
  assert.deepEqual([...roles.assignableRoles('owner')], ['admin', 'manager', 'supervisor', 'staff']);
  assert.deepEqual([...roles.assignableRoles('staff')], []);
  assert.equal(roles.canGrantPermissionKey('admin', 'roles.manage_overrides'), false);
  assert.equal(roles.canGrantPermissionKey('admin', 'staff.create'), false);
  assert.equal(roles.canGrantPermissionKey('admin', 'leads.view'), true);
  assert.equal(roles.canGrantPermissionKey('owner', 'roles.manage_overrides'), true);
});

test('SEC-01: admin cannot reset password, deactivate or delete another admin', async () => {
  const s = setup({ actorRole: 'admin', targetRole: 'admin' });

  const pw = await s.staff.updateMemberPasswordSafe(empty, form({ memberId: TARGET, password: 'Secret12345' }));
  assert.equal(pw.ok, false);
  assert.match(pw.message, /equal or higher role/);

  const active = await s.staff.setMemberActiveSafe(empty, form({ memberId: TARGET, isActive: 'true' }));
  assert.equal(active.ok, false);

  const del = await s.staff.deleteTeamMemberSafe(empty, form({ memberId: TARGET }));
  assert.equal(del.ok, false);

  assert.equal(s.writes.length, 0);
  assert.equal(s.authCalls.length, 0);
});

test('SEC-01: owner can reset an admin password', async () => {
  const s = setup({ actorRole: 'owner', targetRole: 'admin' });
  const result = await s.staff.updateMemberPasswordSafe(empty, form({ memberId: TARGET, password: 'Secret12345' }));
  assert.equal(result.ok, true);
  assert.deepEqual(s.authCalls, [['updateUserById', TARGET]]);
});

test('SEC-01: admin can manage a manager', async () => {
  const s = setup({ actorRole: 'admin', targetRole: 'manager' });
  const result = await s.staff.setMemberActiveSafe(empty, form({ memberId: TARGET, isActive: 'true' }));
  assert.equal(result.ok, true);
  assert.equal(s.writes[0].row.is_active, false);
});

test('staff actions reject self-edit', async () => {
  const s = setup({ actorRole: 'owner', targetRole: 'owner' });
  const result = await s.staff.updateMemberPasswordSafe(empty, form({ memberId: ACTOR, password: 'Secret12345' }));
  assert.equal(result.ok, false);
  assert.match(result.message, /own account/);
  assert.equal(s.authCalls.length, 0);
});

test('createTeamMember: admin cannot create admin, can create manager (full_name field accepted)', async () => {
  const fields = { email: 'new@example.invalid', password: 'Secret12345' };

  const denied = setup({ actorRole: 'admin' });
  const r1 = await denied.staff.createTeamMember({}, form({ ...fields, fullName: 'New Admin', role: 'admin' }));
  assert.equal(r1.success, false);
  assert.equal(denied.authCalls.length, 0);

  const allowed = setup({ actorRole: 'admin' });
  const r2 = await allowed.staff.createTeamMember({}, form({ ...fields, full_name: 'New Manager', role: 'manager' }));
  assert.equal(r2.success, true);
  assert.equal(allowed.authCalls[0][0], 'createUser');
});

test('SEC-06: role change rejects self, equal rank and promotion to own rank', async () => {
  const self = setup({ actorRole: 'admin', targetRole: 'admin' });
  const r1 = await self.perms.updateMemberRole(empty, form({ memberId: ACTOR, role: 'manager' }));
  assert.equal(r1.ok, false);
  assert.match(r1.message, /own account/);

  const peer = setup({ actorRole: 'admin', targetRole: 'admin' });
  assert.equal((await peer.perms.updateMemberRole(empty, form({ memberId: TARGET, role: 'staff' }))).ok, false);

  const promote = setup({ actorRole: 'admin', targetRole: 'manager' });
  const r3 = await promote.perms.updateMemberRole(empty, form({ memberId: TARGET, role: 'admin' }));
  assert.equal(r3.ok, false);
  assert.match(r3.message, /equal or higher role/);

  for (const s of [self, peer, promote]) assert.equal(s.writes.length, 0);
});

test('SEC-06: admin can change a manager to supervisor', async () => {
  const s = setup({ actorRole: 'admin', targetRole: 'manager' });
  const result = await s.perms.updateMemberRole(empty, form({ memberId: TARGET, role: 'supervisor' }));
  assert.equal(result.ok, true);
  assert.deepEqual({ ...s.writes[0].row }, { role: 'supervisor' });
});

test('SEC-06: overrides reject self-edit and sensitive keys for non-owners', async () => {
  const self = setup({ actorRole: 'manager', targetRole: 'manager' });
  const r1 = await self.perms.setPermissionOverride(empty, form({ memberId: ACTOR, permissionKey: 'leads.view', allowed: 'true' }));
  assert.equal(r1.ok, false);

  const sensitive = setup({ actorRole: 'admin', targetRole: 'staff' });
  const r2 = await sensitive.perms.setPermissionOverride(empty, form({ memberId: TARGET, permissionKey: 'roles.manage_overrides', allowed: 'true' }));
  assert.equal(r2.ok, false);
  assert.match(r2.message, /Only the owner/);

  for (const s of [self, sensitive]) assert.equal(s.writes.length, 0);
});

test('SEC-06: owner may grant a sensitive key, admin may grant a normal key', async () => {
  const owner = setup({ actorRole: 'owner', targetRole: 'admin' });
  assert.equal((await owner.perms.setPermissionOverride(empty, form({ memberId: TARGET, permissionKey: 'staff.create', allowed: 'true' }))).ok, true);
  assert.equal(owner.writes[0].op, 'upsert');

  const admin = setup({ actorRole: 'admin', targetRole: 'staff' });
  assert.equal((await admin.perms.setPermissionOverride(empty, form({ memberId: TARGET, permissionKey: 'leads.view', allowed: 'true' }))).ok, true);
});

test('removePermissionOverride is guarded (owner target, self)', async () => {
  const onOwner = setup({ actorRole: 'admin', targetRole: 'owner' });
  const r1 = await onOwner.perms.removePermissionOverride(empty, form({ memberId: TARGET, permissionKey: 'leads.view' }));
  assert.equal(r1.ok, false);

  const self = setup({ actorRole: 'admin', targetRole: 'admin' });
  const r2 = await self.perms.removePermissionOverride(empty, form({ memberId: ACTOR, permissionKey: 'leads.view' }));
  assert.equal(r2.ok, false);

  for (const s of [onOwner, self]) assert.equal(s.writes.length, 0);
});

test('permissions actions return a failure state instead of throwing on bad input', async () => {
  const s = setup();
  const result = await s.perms.updateMemberRole(empty, form({ memberId: 'not-a-uuid', role: 'staff' }));
  assert.deepEqual({ ...result }, { ok: false, message: 'Invalid role data.' });
});
