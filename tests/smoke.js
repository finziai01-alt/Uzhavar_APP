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

// Mock SupabaseData for test environment
global.SupabaseData = {
  getProducts: () => Promise.resolve([]),
  getOrders: () => Promise.resolve([]),
  getRiderProfiles: () => Promise.resolve([]),
  getInventoryLog: () => Promise.resolve([]),
  getCoupons: () => Promise.resolve([]),
  getProfiles: () => Promise.resolve([]),
  createProduct: () => Promise.resolve(),
  createOrder: () => Promise.resolve(),
  createRiderProfile: () => Promise.resolve(),
  createInventoryLog: () => Promise.resolve(),
  updateProduct: () => Promise.resolve(),
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

// Shared form values store for mock FormData
let formValues = {};
global.FormData = class TestFormData {
  constructor() { this.values = { ...formValues }; formValues = {}; }
  get(key) { return this.values[key] || ''; }
};

function submitForm(formId, values) {
  formValues = values;
  listeners.submit({ target: { id: formId }, preventDefault() {} });
}

require('../auth.js');
require('../app.js');

function click(selector, dataset) {
  listeners.click({ target: { closest: (candidate) => candidate === selector ? { dataset } : null } });
}
function openView(view) { click('[data-view]', { view }); }

// Wait for async initApp to complete, then run tests
setTimeout(() => {
  try {
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
    submitForm('new-order-form', {
      customer: 'Smoke Test Buyer', mode: 'Prepaid', area: 'Demo address', pin: '600001', slot: '18:30 – 19:15', weight: '2.3', total: '18.50'
    });
    assert.match(markup, /Smoke Test Buyer/);
    // Order ID starts from 9841 (no seed data, base is 9840)
    assert.match(markup, /FG-984[1-9]/);

    console.log('FreshGrocer admin panel smoke tests passed: routes, product modal, inventory tabs, live order creation.');
  } catch (err) {
    console.error('Smoke test failed:', err.message);
    process.exit(1);
  }
}, 500);
