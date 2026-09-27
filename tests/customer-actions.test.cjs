const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup(options = {}) {
  const writes = [];
  const permissions = [];
  const refreshed = [];
  const db = {
    async rpc() { return { data: "22222222-2222-4222-8222-222222222222", error: null }; },
    from(table) {
      if (table === 'communication_settings') return {
        select: () => ({ eq: () => ({ single: async () => ({
          data: { contact_mode: options.mode || 'email' }, error: null,
        }) }) }),
      };
      const chain = {
        insert(row) { writes.push(row); return chain; },
        update(row) { writes.push(row); return chain; },
        delete() { writes.push({ deleted: true }); return chain; },
        eq() { return chain; },
        select() { return chain; },
        async single() { return response(); },
        async maybeSingle() { return response(); },
      };
      function response() {
        return { data: options.missing ? null : { id: '11111111-1111-4111-8111-111111111111' }, error: options.dbError || null };
      }
      return chain;
    },
  };
  function load(file, additional = {}) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    const mocks = {
      'server-only': {},
      '@/lib/supabase-admin': { createAdminClient: () => db },
      'next/cache': { revalidatePath: p => refreshed.push(p) },
      '@/lib/auth/server': { requirePermission: async p => {
        permissions.push(p);
        if (options.denied) throw new Error('Forbidden');
        return { id: 'actor-id' };
      } },
      '@/lib/notifications': { createNotification: async () => { if (options.auditFailure) throw new Error('Notification unavailable'); } },
      '@/lib/activity-log': { logActivity: async () => { if (options.auditFailure) throw new Error('Audit unavailable'); } },
      ...additional,
    };
    vm.runInNewContext(js, { exports, require: id => id in mocks ? mocks[id] : require(id), console: { error() {} } });
    return exports;
  }
  const contact = load('lib/contacts/server.ts');
  const actions = load(options.lead ? 'app/(admin)/crm/leads/actions.ts' : 'app/(admin)/crm/customers/actions.ts', { '@/lib/contacts/server': contact });
  return { actions, writes, permissions, refreshed };
}

function form(fields = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: 'Test customer', phone: '', email: 'TEST@example.invalid', ...fields })) data.set(key, value);
  return data;
}

test('email-only customer saves normalized contact and checks permission', async () => {
  const s = setup();
  const result = await s.actions.createCustomer({}, form());
  assert.equal(result.success, true);
  assert.equal(s.writes[0].phone, null);
  assert.equal(s.writes[0].email, 'test@example.invalid');
  assert.deepEqual(s.permissions, ['customers.create']);
  assert.ok(s.refreshed.includes('/crm/customers'));
});

test('phone mode rejects missing phone without writing', async () => {
  const s = setup({ mode: 'phone' });
  assert.equal((await s.actions.createCustomer({}, form())).success, false);
  assert.equal(s.writes.length, 0);
});

test('denied permission never writes', async () => {
  const s = setup({ denied: true });
  await assert.rejects(s.actions.createCustomer({}, form()), /Forbidden/);
  assert.equal(s.writes.length, 0);
});

test('duplicate contact reports failure', async () => {
  const s = setup({ dbError: { code: '23505', message: 'duplicate' } });
  const result = await s.actions.createCustomer({}, form());
  assert.equal(result.success, false);
  assert.match(result.message, /already exists/);
});

test('audit outage does not turn a saved customer into a failed submission', async () => {
  const s = setup({ auditFailure: true });
  assert.equal((await s.actions.createCustomer({}, form())).success, true);
});

test('updating a missing customer does not report success', async () => {
  const s = setup({ missing: true });
  const result = await s.actions.updateCustomer({}, form({ id: '11111111-1111-4111-8111-111111111111' }));
  assert.equal(result.success, false);
  assert.match(result.message, /not found/);
});


test('email-only lead saves a nullable phone and links the resolved customer', async () => {
  const s = setup({ lead: true });
  const result = await s.actions.createLead({}, form());
  assert.equal(result.success, true);
  assert.equal(s.writes[0].phone, null);
  assert.equal(s.writes[0].customer_id, '22222222-2222-4222-8222-222222222222');
  assert.deepEqual(s.permissions, ['leads.create']);
});

test('lead without the configured primary contact is rejected', async () => {
  const s = setup({ lead: true, mode: 'phone' });
  assert.equal((await s.actions.createLead({}, form())).success, false);
  assert.equal(s.writes.length, 0);
});

test('saved lead stays successful if notification/audit follow-up fails', async () => {
  const s = setup({ lead: true, auditFailure: true });
  assert.equal((await s.actions.createLead({}, form())).success, true);
});
