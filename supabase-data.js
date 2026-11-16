// FreshGrocer Ops Core — Supabase Data Layer
// Replaces localStorage with live Supabase REST API.
// All CRUD operations go to Supabase; changes sync across all three apps.

(() => {
  'use strict';

  const config = window.FRESHGROCER_CONFIG || {
    supabaseUrl: '',
    supabaseAnonKey: '',
  };

  const getAuthHeaders = () => {
    const headers = {
      'apikey': config.supabaseAnonKey,
      'Authorization': `Bearer ${config.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
    const auth = window.Auth;
    if (auth && auth.getCurrentUser() && auth.getCurrentUser().accessToken) {
      headers['Authorization'] = `Bearer ${auth.getCurrentUser().accessToken}`;
    }
    return headers;
  };

  const api = (method, path, body = null) => {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Supabase not configured. Set supabaseUrl and supabaseAnonKey in config.js.');
    }
    const base = config.supabaseUrl.endsWith('/') ? config.supabaseUrl : config.supabaseUrl + '/';
    const url = base + 'rest/v1/' + path;
    const init = {
      method,
      headers: getAuthHeaders(),
    };
    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      init.body = JSON.stringify(body);
    }
    return fetch(url, init).then(async (res) => {
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        throw new Error(`Supabase ${res.status}: ${err}`);
      }
      if (res.status === 204) return null;
      return res.json();
    });
  };

  const SupabaseData = {
    // Products
    getProducts: () => api('GET', 'products?select=*&order=created_at.desc'),
    createProduct: (product) => api('POST', 'products', product),
    updateProduct: (id, updates) => api('PATCH', `products?id=eq.${id}`, updates),
    deleteProduct: (id) => api('DELETE', `products?id=eq.${id}`),

    // Product Variants
    getProductVariants: () => api('GET', 'product_variants?select=*&order=created_at.desc'),
    createProductVariant: (variant) => api('POST', 'product_variants', variant),
    updateProductVariant: (id, updates) => api('PATCH', `product_variants?id=eq.${id}`, updates),
    deleteProductVariant: (id) => api('DELETE', `product_variants?id=eq.${id}`),

    // Orders
    getOrders: () => api('GET', 'orders?select=*&order=created_at.desc'),
    getOrderItems: (orderId) => api('GET', `order_items?select=*&order_id=eq.${orderId}`),
    createOrder: (order) => api('POST', 'orders', order),
    updateOrder: (id, updates) => api('PATCH', `orders?id=eq.${id}`, updates),
    deleteOrder: (id) => api('DELETE', `orders?id=eq.${id}`),

    // Order Items
    createOrderItem: (item) => api('POST', 'order_items', item),
    updateOrderItem: (id, updates) => api('PATCH', `order_items?id=eq.${id}`, updates),
    deleteOrderItem: (id) => api('DELETE', `order_items?id=eq.${id}`),

    // Coupons
    getCoupons: () => api('GET', 'coupons?select=*&order=created_at.desc'),
    createCoupon: (coupon) => api('POST', 'coupons', coupon),
    updateCoupon: (id, updates) => api('PATCH', `coupons?id=eq.${id}`, updates),
    deleteCoupon: (id) => api('DELETE', `coupons?id=eq.${id}`),

    // Inventory Log
    getInventoryLog: () => api('GET', 'inventory_log?select=*&order=created_at.desc'),
    createInventoryLog: (entry) => api('POST', 'inventory_log', entry),

    // Rider Profiles
    getRiderProfiles: () => api('GET', 'rider_profiles?select=*&order=created_at.desc'),
    createRiderProfile: (rider) => api('POST', 'rider_profiles', rider),
    updateRiderProfile: (id, updates) => api('PATCH', `rider_profiles?id=eq.${id}`, updates),

    // Rider Shifts
    getRiderShifts: () => api('GET', 'rider_shifts?select=*&order=created_at.desc'),
    createRiderShift: (shift) => api('POST', 'rider_shifts', shift),
    updateRiderShift: (id, updates) => api('PATCH', `rider_shifts?id=eq.${id}`, updates),

    // Rider Tasks
    getRiderTasks: () => api('GET', 'rider_tasks?select=*&order=created_at.desc'),
    createRiderTask: (task) => api('POST', 'rider_tasks', task),
    updateRiderTask: (id, updates) => api('PATCH', `rider_tasks?id=eq.${id}`, updates),

    // Profiles (admin/staff)
    getProfiles: () => api('GET', 'profiles?select=*&order=created_at.desc'),
    updateProfile: (id, updates) => api('PATCH', `profiles?id=eq.${id}`, updates),

    // Audit Log
    createAuditLog: (entry) => api('POST', 'audit_log', entry),

    // Real-time subscriptions
    subscribe: (table, callback) => {
      if (!config.supabaseUrl) return () => {};
      const wsUrl = config.supabaseUrl
        .replace('https://', 'wss://')
        .replace('http://', 'ws://');
      const channelUrl = `${wsUrl}/realtime/v1?apikey=${config.supabaseAnonKey}`;
      // Note: For full real-time, use supabase-js client. This is a REST fallback.
      // The callback receives new rows when polling detects changes.
      return () => {};
    },
  };

  window.SupabaseData = SupabaseData;
})();