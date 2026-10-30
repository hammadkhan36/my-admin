const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup({ role = 'staff', rows = [{ state: 'active', plan: 'monthly', end_date: '2026-01-10', grace_end_date: '2026-01-17' }], rpcError = null } = {}) {
  const errors = [];
  const rpcCalls = [];
  const profile = { id: 'u1', email: 'u@example.test', full_name: null, avatar_url: null, role, is_active: true };
  const userClient = {
    auth: { async getUser() { return { data: { user: { id: 'u1' } } }; } },
    from() {
      const chain = { select() { return chain; }, eq() { return chain; }, async maybeSingle() { return { data: profile, error: null }; } };
      return chain;
    },
    async rpc(name) { rpcCalls.push(name); return { data: true, error: null }; },
  };
  const adminClient = {
    async rpc(name) { rpcCalls.push(name); return rpcError ? { data: null, error: { message: rpcError } } : { data: rows, error: null }; },
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
      react: { cache: fn => fn },
      'next/navigation': { redirect(url) { throw new Error(`REDIRECT:${url}`); } },
      '@/lib/supabase-server': { createClient: async () => userClient },
      '@/lib/supabase-admin': { createAdminClient: () => adminClient },
    };
    const local = {
      '@/lib/auth/roles': 'lib/auth/roles.ts',
      '@/lib/auth/server': 'lib/auth/server.ts',
      '@/lib/subscription/server': 'lib/subscription/server.ts',
    };
    vm.runInNewContext(js, {
      exports,
      Error,
      Array,
      require: id => (id in local ? load(local[id]) : id in mocks ? mocks[id] : require(id)),
      console: { error: (...args) => errors.push(args.join(' ')) },
    });
    return exports;
  }

  return { auth: load('lib/auth/server.ts'), sub: load('lib/subscription/server.ts'), errors, rpcCalls };
}

const expired = [{ state: 'expired', plan: 'monthly', end_date: '2026-01-10', grace_end_date: '2026-01-17' }];

test('expired subscription sends staff to /subscription from requireProfile and requirePermission', async () => {
  const { auth, rpcCalls } = setup({ role: 'staff', rows: expired });
  await assert.rejects(auth.requireProfile(), /REDIRECT:\/subscription/);
  await assert.rejects(auth.requirePermission('leads.view'), /REDIRECT:\/subscription/);
  assert.ok(!rpcCalls.includes('has_permission'), 'permission RPC must not run once expired');
});

test('owner is blocked by expiry too, but allowExpiredSubscription lets the renewal page load', async () => {
  const { auth } = setup({ role: 'owner', rows: expired });
  await assert.rejects(auth.requireProfile(), /REDIRECT:\/subscription/);
  const profile = await auth.requireProfile({ allowExpiredSubscription: true });
  assert.equal(profile.role, 'owner');
});

test('superadmin is never blocked, and requireSuperAdmin works while expired', async () => {
  const { auth } = setup({ role: 'superadmin', rows: expired });
  assert.equal((await auth.requireProfile()).role, 'superadmin');
  assert.equal((await auth.requireSuperAdmin()).role, 'superadmin');
});

test('active and grace subscriptions pass', async () => {
  for (const state of ['active', 'grace']) {
    const { auth } = setup({ role: 'staff', rows: [{ state, plan: 'monthly', end_date: null, grace_end_date: null }] });
    assert.equal((await auth.requireProfile()).role, 'staff');
  }
});

test('a failing subscription_status RPC is logged and let through, a missing row blocks', async () => {
  const failing = setup({ role: 'staff', rpcError: 'connection reset' });
  assert.equal((await failing.auth.requireProfile()).role, 'staff');
  assert.ok(failing.errors.some(e => e.includes('subscription_status failed') && e.includes('connection reset')));
  assert.equal(await failing.sub.isSubscriptionUsable(), true);

  const missing = setup({ role: 'staff', rows: [] });
  await assert.rejects(missing.auth.requireProfile(), /REDIRECT:\/subscription/);
  assert.equal(await missing.sub.isSubscriptionUsable(), false);
});

test('isSubscriptionUsable is false only when expired', async () => {
  assert.equal(await setup({ rows: expired }).sub.isSubscriptionUsable(), false);
  assert.equal(await setup({ rows: [{ state: 'grace' }] }).sub.isSubscriptionUsable(), true);
});
