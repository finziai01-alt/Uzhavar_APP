// FreshGrocer Ops Core — Authentication & Session Management
// Handles login, session persistence, and role-based access control.
// Supports both demo mode (localStorage-based) and live Supabase Auth.

(() => {
  'use strict';

  const config = window.FRESHGROCER_CONFIG || {
    demoMode: { enabled: true },
    supabaseUrl: '',
    supabaseAnonKey: '',
  };

  // Default demo user
  const DEMO_USER = {
    id: 'ADMIN-001',
    email: 'admin@freshgrocer.example.test',
    name: 'Ops Lead',
    role: 'admin',
    hub: 'Metro Hub #04',
    hubCode: 'MH-04',
    avatar: 'assets/images/ops-lead-avatar.jpg',
    phone: '+91 98765 44128',
  };

  // Role-based permissions
  const ROLE_PERMISSIONS = {
    admin: [
      'products.read', 'products.write', 'products.delete',
      'orders.read', 'orders.write', 'orders.dispatch',
      'inventory.read', 'inventory.write', 'inventory.adjust',
      'riders.read', 'riders.write',
      'customers.read',
      'promotions.read', 'promotions.write',
      'finance.read',
      'settings.read', 'settings.write',
    ],
    manager: [
      'products.read', 'products.write',
      'orders.read', 'orders.write',
      'inventory.read', 'inventory.write',
      'riders.read',
      'customers.read',
      'promotions.read', 'promotions.write',
      'finance.read',
      'settings.read',
    ],
    operator: [
      'products.read',
      'orders.read', 'orders.write',
      'inventory.read', 'inventory.adjust',
      'riders.read',
      'customers.read',
      'finance.read',
    ],
    viewer: [
      'products.read',
      'orders.read',
      'inventory.read',
      'riders.read',
      'customers.read',
      'finance.read',
    ],
  };

  const Auth = {
    user: null,
    isAuthenticated: false,
    isDemoMode: true,
    listeners: [],

    init() {
      const saved = localStorage.getItem('freshgrocer-auth');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.user = data.user;
          this.isAuthenticated = true;
          this.isDemoMode = data.isDemoMode !== false;
        } catch (e) {
          console.warn('Failed to load saved auth state', e);
        }
      } else if (config.demoMode.enabled) {
        // Auto-sign in demo user
        this.user = { ...DEMO_USER };
        this.isAuthenticated = true;
        this.isDemoMode = true;
        this._persist();
      }
    },

    _persist() {
      try {
        localStorage.setItem('freshgrocer-auth', JSON.stringify({
          user: this.user,
          isAuthenticated: this.isAuthenticated,
          isDemoMode: this.isDemoMode,
        }));
      } catch (e) {
        console.warn('Failed to persist auth state', e);
      }
    },

    _notify() {
      this.listeners.forEach(fn => fn(this.user, this.isAuthenticated));
    },

    onAuthChange(fn) {
      this.listeners.push(fn);
      // Immediate callback with current state
      fn(this.user, this.isAuthenticated);
      return () => {
        this.listeners = this.listeners.filter(f => f !== fn);
      };
    },

    async login(email, password) {
      // In demo mode, accept any credentials
      if (config.demoMode.enabled) {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 600));
        this.user = { ...DEMO_USER, email };
        this.isAuthenticated = true;
        this.isDemoMode = true;
        this._persist();
        this._notify();
        return { success: true, user: this.user };
      }

      // Live mode: call Supabase Auth
      if (config.supabaseUrl && config.supabaseAnonKey) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          this.user = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email,
            role: data.user.user_metadata?.role || 'operator',
            hub: data.user.user_metadata?.hub || 'Metro Hub #04',
            hubCode: data.user.user_metadata?.hub_code || 'MH-04',
            avatar: data.user.user_metadata?.avatar_url,
            phone: data.user.phone,
          };
          this.isAuthenticated = true;
          this.isDemoMode = false;
          this._persist();
          this._notify();
          return { success: true, user: this.user };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: false, error: 'Authentication not configured' };
    },

    async logout() {
      if (config.supabaseUrl && config.supabaseAnonKey && !this.isDemoMode) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Logout error', e);
        }
      }
      this.user = null;
      this.isAuthenticated = false;
      this.isDemoMode = config.demoMode.enabled;
      localStorage.removeItem('freshgrocer-auth');
      this._notify();
    },

    hasPermission(permission) {
      if (!this.isAuthenticated || !this.user) return false;
      const rolePermissions = ROLE_PERMISSIONS[this.user.role] || [];
      return rolePermissions.includes(permission);
    },

    can(action) {
      return this.hasPermission(action);
    },

    getCurrentUser() {
      return this.user;
    },

    isAuthenticatedUser() {
      return this.isAuthenticated;
    },

    isInDemoMode() {
      return this.isDemoMode;
    },
  };

  // Initialize immediately (runs in both browser and test environments)
  Auth.init();

  // Expose globally
  window.Auth = Auth;
})();
