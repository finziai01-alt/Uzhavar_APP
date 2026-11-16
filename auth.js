// FreshGrocer Ops Core — Authentication & Session Management
// Handles login, session persistence, and role-based access control.
// Supports both demo mode (localStorage-based) and live Supabase Auth.
// Uses fetch-based Supabase REST API (no external CDN dependencies).

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

  // Supabase REST API helpers
  const supabaseRequest = async (method, path, body, headers = {}) => {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Supabase not configured');
    }
    const url = config.supabaseUrl.endsWith('/')
      ? config.supabaseUrl + path
      : config.supabaseUrl + path;
    const res = await fetch(url, {
      method,
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Supabase ${res.status}: ${err}`);
    }
    return res.json();
  };

  const supabaseAuth = async (endpoint, body) => {
    return supabaseRequest('POST', `/auth/v1/${endpoint}`, body);
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
      fn(this.user, this.isAuthenticated);
      return () => {
        this.listeners = this.listeners.filter(f => f !== fn);
      };
    },

    async login(email, password) {
      // Demo mode: accept any credentials
      if (config.demoMode.enabled) {
        await new Promise(r => setTimeout(r, 600));
        this.user = { ...DEMO_USER, email };
        this.isAuthenticated = true;
        this.isDemoMode = true;
        this._persist();
        this._notify();
        return { success: true, user: this.user };
      }

      // Live mode: Supabase email/password sign-in
      if (config.supabaseUrl && config.supabaseAnonKey) {
        try {
          const data = await supabaseAuth('token?grant_type=password', {
            email,
            password,
          });
          if (data.error) throw new Error(data.error.message || 'Sign in failed');

          const user = data.user;
          const { data: profile } = await supabaseRequest(
            'GET',
            `/rest/v1/profiles?id=eq.${user.id}&select=*`,
            null,
            { 'Authorization': `Bearer ${data.access_token}` }
          );

          const profileRow = Array.isArray(profile) ? profile[0] : null;

          this.user = {
            id: user.id,
            email: user.email,
            name: profileRow?.full_name || user.email,
            role: profileRow?.role || 'operator',
            hub: profileRow?.hub_name || 'Metro Hub #04',
            hubCode: profileRow?.hub_code || 'MH-04',
            avatar: profileRow?.avatar_url,
            phone: profileRow?.phone || user.phone,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
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

    async signup(email, password, fullName, role = 'operator') {
      if (config.demoMode.enabled) {
        return { success: false, error: 'Signup disabled in demo mode' };
      }

      if (config.supabaseUrl && config.supabaseAnonKey) {
        try {
          const data = await supabaseAuth('signup', {
            email,
            password,
            options: {
              data: { full_name: fullName, role },
            },
          });
          if (data.error) throw new Error(data.error.message || 'Signup failed');

          return { success: true, user: data.user };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: false, error: 'Authentication not configured' };
    },

    async resetPassword(email) {
      if (config.demoMode.enabled) {
        return { success: false, error: 'Password reset disabled in demo mode' };
      }

      if (config.supabaseUrl && config.supabaseAnonKey) {
        try {
          await supabaseRequest('POST', '/auth/v1/recover', {
            email,
            options: {
              redirectTo: `${window.location.origin}/reset-password.html`,
            },
          });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: false, error: 'Authentication not configured' };
    },

    async updatePassword(newPassword) {
      if (config.demoMode.enabled) {
        return { success: false, error: 'Password update disabled in demo mode' };
      }

      if (config.supabaseUrl && config.supabaseAnonKey && this.user?.accessToken) {
        try {
          await supabaseRequest('PUT', '/auth/v1/user', {
            password: newPassword,
          }, {
            'Authorization': `Bearer ${this.user.accessToken}`,
          });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: false, error: 'Authentication not configured' };
    },

    async logout() {
      if (config.supabaseUrl && config.supabaseAnonKey && !this.isDemoMode && this.user?.accessToken) {
        try {
          await supabaseRequest('POST', '/auth/v1/logout', null, {
            'Authorization': `Bearer ${this.user.accessToken}`,
          });
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

  // Initialize immediately
  Auth.init();

  // Expose globally
  window.Auth = Auth;
})();