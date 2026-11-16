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

setTimeout(() => {
  try {
    assert.ok(window.Auth, 'Auth module is exposed globally');
    assert.ok(typeof window.Auth.login === 'function', 'Auth.login exists');
    assert.ok(typeof window.Auth.logout === 'function', 'Auth.logout exists');
    assert.ok(typeof window.Auth.hasPermission === 'function', 'Auth.hasPermission exists');
    assert.ok(typeof window.Auth.isAuthenticatedUser === 'function', 'Auth.isAuthenticatedUser exists');

    assert.ok(window.Auth.isAuthenticatedUser(), 'Demo mode auto-signs in');
    assert.equal(window.Auth.getCurrentUser().role, 'admin', 'Demo user is admin');

    const auth = window.Auth;
    assert.ok(auth.hasPermission('products.write'), 'Admin can write products');
    assert.ok(auth.hasPermission('orders.dispatch'), 'Admin can dispatch orders');
    assert.ok(auth.hasPermission('settings.write'), 'Admin can write settings');
    assert.ok(auth.hasPermission('finance.read'), 'Admin can read finance');

    assert.ok(!markup.includes('Sign in'), 'Login page not shown when authenticated');
    assert.match(markup, /Dashboard &amp; Analytics/, 'Dashboard renders when authenticated');

    openView('products');
    assert.match(markup, /Vegetable Catalog &amp; Variants/, 'Products route renders');

    openView('products');
    click('[data-action]', { action: 'add-product' });
    assert.match(markup, /Add New Vegetable/, 'Product add modal opens');

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

    openView('products');
    click('[data-action]', { action: 'quick-order' });
    assert.match(markup, /Create Order/, 'Quick order modal opens');
    submitForm('new-order-form', {
      customer: 'CRUD Test Buyer', mode: 'Prepaid', area: 'Test address', pin: '600001', slot: '18:30 – 19:15', weight: '2.3', total: '18.50'
    });
    assert.match(markup, /CRUD Test Buyer/, 'Order created with customer name');
    assert.match(markup, /FG-984[1-9]/, 'Order ID generated from server sequence');

    click('[data-action]', { action: 'logout' });
    assert.ok(markup.includes('Sign in'), 'Login page shows after logout');
    assert.ok(!window.Auth.isAuthenticatedUser(), 'Auth user is logged out');

    console.log('Auth and CRUD tests passed: authentication, role permissions, product modal, inventory tabs, live order creation, logout.');
  } catch (err) {
    console.error('Auth/CRUD test failed:', err.message);
    process.exit(1);
  }
}, 500);
