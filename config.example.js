// FreshGrocer Ops Core — Configuration Example
// Copy this file to config.js and fill in your values before connecting to a live backend.
// Never commit config.js with real secrets.

const config = {
  // Supabase project configuration (shared across all three apps)
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY',

  // Application settings
  appName: 'FreshGrocer Ops Core',
  appVersion: '1.0.0',

  // Feature flags
  features: {
    demoMode: true,           // Set to false when connected to live backend
    enableRefunds: false,     // Requires secure payment service before enabling
    enableLiveLocation: false, // Requires rider GPS integration
    enableEmailNotifications: false, // Requires SMTP/email provider
  },

  // Demo mode settings
  demoMode: {
    enabled: true,
    message: 'Running in local demo mode. No live backend connected.',
  },

  // Supabase auth settings
  auth: {
    provider: 'email', // email/password only
    redirectTo: window.location.origin + '/reset-password.html',
  },
};

// Expose globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else {
  window.FRESHGROCER_CONFIG = config;
}
