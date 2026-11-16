const assert = require('node:assert/strict');

let markup = '';
const appRoot = { set innerHTML(value) { markup = value; }, get innerHTML() { return markup; } };
const listeners = {};
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, value) => { storage[key] = value; },
  removeItem: (key) => { delete storage[key]; },
};
global.window = {
  scrollTo() {},
  FRESHGROCER_CONFIG: { demoMode: { enabled: true }, supabaseUrl: '', supabaseAnonKey: '' },
};
global.document = {
  title: '',
  getElementById: (id) => id === 'app' ? appRoot : null,
  addEventListener: (name, fn) => { listeners[name] = fn; },
};
require('../auth.js');
require('../app.js');

function click(selector, dataset) {
  listeners.click({ target: { closest: (candidate) => candidate === selector ? { dataset } : null } });
}
function openView(view) { click('[data-view]', { view }); }

assert.match(markup, /Dashboard &amp; Analytics/);
const views = [
  ['products', /Vegetable Catalog &amp; Variants/],
  ['orders', /Dispatch &amp; Order Pipeline/],
  ['inventory', /Stock Control, Replenishment/],
  ['riders', /Rider Fleet &amp; Shift Tracker/],
  ['customers', /Customer Directory/],
  ['marketing', /Promotions &amp; Banners/],
  ['finance', /Payments &amp; P&amp;L/],
  ['settings', /Store &amp; Admin Settings/],
];
for (const [view, expected] of views) {
  openView(view);
  assert.match(markup, expected, `${view} route should render`);
}

openView('products');
click('[data-action]', { action: 'add-product' });
assert.match(markup, /Add New Vegetable/);

for (const [tab, expected] of [
  ['inward', /Inbound Crates/],
  ['adjust', /Stock Adjustments &amp; Wastage Log/],
  ['supplier', /Verified Farm Supplier Directory/],
  ['overview', /Cold Vault Stock Ledger/],
]) {
  openView('inventory');
  click('[data-inventory-tab]', { inventoryTab: tab });
  assert.match(markup, expected, `inventory ${tab} tab should render its content`);
}

click('[data-action]', { action: 'quick-order' });
assert.match(markup, /Create Demo Order/);
class TestFormData {
  constructor() { this.values = { customer: 'Smoke Test Buyer', mode: 'Prepaid', area: 'Demo address', pin: '600001', slot: '18:30 – 19:15', weight: '2.3', total: '18.50' }; }
  get(key) { return this.values[key] || ''; }
}
global.FormData = TestFormData;
listeners.submit({ target: { id: 'new-order-form' }, preventDefault() {} });
assert.match(markup, /Smoke Test Buyer/);
assert.match(markup, /FG-9843/);
assert.ok(storage['freshgrocer-ops-demo-v1']);

console.log('FreshGrocer admin panel smoke tests passed: routes, product modal, inventory tabs, local demo order creation.');
