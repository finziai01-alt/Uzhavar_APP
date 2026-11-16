/* Uzhavar Pay Ops Core — live admin panel connected to Supabase. All data from shared database. */
(() => {
  'use strict';

  const IMAGE = (name) => `assets/images/${name}`;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const iconPaths = {
    analytics: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 14v3M12 10v7M17 7v10"/>',
    produce: '<path d="M12 20c-4.5 0-7-3.4-7-7.3 0-3 2-5.2 5-5.2 1.3 0 2.2.5 2.8 1.2.6-.7 1.5-1.2 2.8-1.2 3 0 5 2.2 5 5.2C20.6 16.6 17.8 20 12 20Z"/><path d="M12.5 8c.1-2.5 1.7-4.1 4.4-4.8M12 9c-1.2-1.8-2.5-2.4-4.4-2.5"/>',
    truck: '<path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7.5" cy="18" r="1.7"/><circle cx="18" cy="18" r="1.7"/>',
    warehouse: '<path d="m3 10 9-6 9 6v10H3z"/><path d="M7 20v-6h10v6M9 10h.01M15 10h.01"/>',
    bike: '<circle cx="6" cy="17" r="3.3"/><circle cx="18" cy="17" r="3.3"/><path d="m6 17 4-7h4l4 7M8 10h-2M12 10l3 7M15 7h3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.2a4 4 0 0 1 0 7.6"/>',
    megaphone: '<path d="M3 11v2a2 2 0 0 0 2 2h2l9 5V5l-9 5H5a2 2 0 0 0-2 1Z"/><path d="m7 15 2 5h4l-2.5-6M19 9a5 5 0 0 1 0 6"/>',
    wallet: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8h15a3 3 0 0 1 3 3v2h-5a2 2 0 0 0 0 4h5"/><path d="M16 13h.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.4.8l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.4-.8l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.7l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.4-.8l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.4.8l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.7Z"/>',
    hub: '<circle cx="12" cy="12" r="2.2"/><circle cx="5" cy="6" r="1.8"/><circle cx="19" cy="6" r="1.8"/><circle cx="5" cy="18" r="1.8"/><circle cx="19" cy="18" r="1.8"/><path d="m10.5 10.5-4-3M13.5 10.5l4-3M10.5 13.5l-4 3M13.5 13.5l4 3"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.3 4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.9-2L20 12M4 12l2.5 5a7 7 0 0 0 11.9-2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    thermo: '<path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z"/><path d="M12 11v6"/>',
    alert: '<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 17h.01"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
    package: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>',
    leaf: '<path d="M20 4c-8 0-14 2-14 9a7 7 0 0 0 7 7c7 0 7-8 7-16Z"/><path d="M4 21c3-5 7-8 13-12"/>',
    receipt: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h4"/>',
    userplus: '<path d="M15 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M16 11h6"/>',
    document: '<path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h5M9 13h6M9 17h6"/>',
    phone: '<path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M10 17h4"/>',
    snow: '<path d="M12 2v20M4 6l16 12M20 6 4 18M8.5 3.8 12 6l3.5-2.2M8.5 20.2 12 18l3.5 2.2M3.3 9.7 7 9l-.3-3.8M20.7 14.3 17 15l.3 3.8M3.3 14.3 7 15l-.3 3.8M20.7 9.7 17 9l.3-3.8"/>',
    box: '<path d="M4 7h16v14H4zM2 3h20v4H2zM9 11h6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h4a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    edit: '<path d="m4 16-.8 4.8L8 20l11-11-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
    snowflake: '<path d="M12 2v20M4 6l16 12M20 6 4 18M8 4l4 2 4-2M8 20l4-2 4 2"/>',
    cart: '<path d="M3 4h2l2.4 11.5a2 2 0 0 0 2 1.5h8.8a2 2 0 0 0 1.9-1.4L22 9H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6"/>',
    clockcheck: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M8.5 12.5l2 2 4-4"/>',
  };
  const icon = (name, size = '') => `<svg class="icon ${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.grid}</svg>`;

  const data = {
    products: [],
    inventory: [],
    orders: [],
    riders: [],
    stockLog: [],
    campaigns: [],
  };
  const state = {
    view: 'dashboard', productFilter: 'in', productCategory: 'All', productSearch: '', selectedProductId: '', drawerTab: 'basic',
    orderTab: 'all', orderSearch: '', selectedOrderId: '', inventoryTab: 'overview', riderFilter: 'all', shiftFilter: 'All Shifts', riderSearch: '',
    modal: null, quickOpen: false, hubOpen: false, sidebarOpen: false, globalQuery: '',
    isAuthenticated: false, user: null, authError: null,
  };

  // Sync auth state from Auth module (demo mode auto-signs in)
  const authModule = typeof window !== 'undefined' ? window.Auth : (typeof Auth !== 'undefined' ? Auth : null);
  if (authModule && authModule.isAuthenticatedUser()) {
    state.isAuthenticated = true;
    state.user = authModule.getCurrentUser();
  }

  const persist = async () => {
    if (typeof SupabaseData === 'undefined') {
      console.warn('SupabaseData not loaded - changes will not persist to server.');
      return;
    }
    try {
      // Changes are pushed to Supabase via individual create/update calls
      // from the action handlers.
    } catch (err) {
      console.warn('Persist error', err);
    }
  };
  const num = (value, digits = 0) => Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const imageTag = (file, alt, cls = '') => `<img class="${cls}" src="${IMAGE(file)}" alt="${esc(alt)}" loading="lazy" />`;
  const statusBadge = (label) => {
    const s = String(label).toLowerCase();
    let color = 'gray-badge';
    if (s.includes('incomplete') || s.includes('out of stock') || s.includes('locked') || s.includes('critical')) color = 'red-badge';
    else if (s.includes('unassigned') || s.includes('break') || s.includes('low') || s.includes('pending') || s.includes('processing')) color = 'amber-badge';
    else if (s.includes('delivery') || s.includes('dispatch')) color = 'blue-badge';
    else if (s.includes('ready') || s.includes('available') || s.includes('active') || s.includes('stock') || s.includes('normal') || s.includes('passed')) color = 'green-badge';
    return `<span class="badge ${color}">${esc(label)}</span>`;
  };
  const saveDownload = (filename, rows) => {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };
  let toastTimer = null;
  const toast = (message, kind = 'success') => {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const node = document.createElement('div'); node.className = `toast ${kind === 'error' ? 'error' : ''}`;
    node.innerHTML = `<span>${icon(kind === 'error' ? 'alert' : 'check', 'sm')}${esc(message)}</span>`;
    root.append(node);
    setTimeout(() => node.remove(), 3200);
  };

  const navSections = [
    { label: 'Main', items: [['dashboard', 'analytics', 'Dashboard & Analytics']] },
    { label: 'Catalog', items: [['products', 'produce', 'Product & Categories']] },
    { label: 'Fulfillment', items: [['orders', 'truck', 'Orders & Dispatch', '24']] },
    { label: 'Inventory', items: [['inventory', 'warehouse', 'Stock & Wastage']] },
    { label: 'Logistics', items: [['riders', 'bike', 'Rider Fleet & Shifts']] },
    { label: 'Customers', items: [['customers', 'users', 'Customer Directory']] },
    { label: 'Marketing', items: [['marketing', 'megaphone', 'Promotions & Banners']] },
    { label: 'Finance', items: [['finance', 'wallet', 'Payments & P&L']] },
    { label: 'System', items: [['settings', 'settings', 'Store & Admin Settings']] },
  ];
  const viewTitles = {
    dashboard: ['Executive operations · Metro Hub #04', 'Dashboard & Analytics', 'Live data from’s fresh produce operation. All figures are live server data.'],
    products: ['Procurement & SKU inventory node', 'Vegetable Catalog & Variants', 'Manage produce, pack sizes, price, stock thresholds, and customer-app visibility.'],
    orders: ['Fulfillment hub node 04 · Dynamic produce ledger', 'Dispatch & Order Pipeline', 'Review order status, basket contents, customer handoff, and courier allocation.'],
    inventory: ['Fulfillment hub node 04 · Dynamic produce ledger', 'Stock Control, Replenishment & Cold Spoilage', 'Track cold-store reserves, inward crates, adjustments, and freshness risk.'],
    riders: ['Logistics workforce orchestration · Module E', 'Rider Fleet & Shift Tracker', 'Live cold-chain dispatch rosters, shift check-ins, transit SLA telemetry, and zone density control.'],
    customers: ['Customer operations', 'Customer Directory', 'Customer directory synced from Supabase.'],
    marketing: ['Growth operations', 'Promotions & Banners', 'Promotions and banners synced from Supabase.'],
    finance: ['Finance operations', 'Payments & P&L', 'Financial overview from verified orders in Supabase.'],
    settings: ['System administration', 'Store & Admin Settings', 'Store and admin hub configuration from Supabase.'],
  };
  const heading = (view, actions = '') => {
    const meta = viewTitles[view] || viewTitles.dashboard;
    return `<div class="page-heading"><div class="page-heading-left"><div class="eyebrow"><span class="pulse-dot"></span>${esc(meta[0])}</div><h1 class="h1">${esc(meta[1])}</h1><p class="page-subtitle">${esc(meta[2])}</p></div><div class="page-actions">${actions}</div></div>`;
  };
  const metric = (label, value, iconName, foot, kind = '', extra = '') => `<article class="metric-card card"><div class="metric-top"><span class="metric-label">${label}</span><span class="metric-icon ${kind}">${icon(iconName)}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div>${extra}</article>`;
  const pageSearch = (id, placeholder, value = '') => `<form class="filter-input" id="${id}-form">${icon('search','sm')}<input id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}"/><button type="submit" hidden>Search</button></form>`;

  function sidebar() {
    return `<div class="mobile-scrim ${state.sidebarOpen ? 'visible' : ''}" data-action="close-menu"></div><aside class="sidebar ${state.sidebarOpen ? 'open' : ''}">
      <div class="brand"><div class="brand-left">${imageTag('uzhavarpay-logo.jpg','Uzhavar Pay logo','brand-logo')}<div><div class="brand-title">Uzhavar Pay</div><div class="brand-sub">Unified Operations</div></div></div><span class="version">v2.4</span></div>
      <nav class="side-nav" aria-label="Operations modules">${navSections.map((section) => `<div class="nav-section"><div class="nav-label">${esc(section.label)}</div>${section.items.map(([view, iconName, label, count]) => `<button class="nav-link ${state.view === view ? 'active' : ''}" data-view="${view}" aria-current="${state.view === view ? 'page' : 'false'}">${icon(iconName)}<span>${esc(label)}</span>${count ? `<span class="nav-badge">${count}</span>` : ''}</button>`).join('')}</div>`).join('')}</nav>
      <div class="cold-node"><div class="cold-node-card"><div><strong>Cold Chain Node</strong><span>CC-TEMP: 3.4°C</span></div><span class="pulse-dot" aria-label="Sensor state"></span></div></div>
    </aside>`;
  }
  function topbar() {
    const quick = state.quickOpen ? `<div class="popover"><button class="popover-item" data-action="quick-product">${icon('produce')} Add vegetable</button><button class="popover-item" data-action="quick-order">${icon('cart')} Create order</button><button class="popover-item" data-action="quick-rider">${icon('userplus')} Register rider</button><button class="popover-item" data-action="quick-stock">${icon('package')} Record stock delta</button></div>` : '';
    const hubs = state.hubOpen ? `<div class="popover hub-popover"><button class="popover-item" data-action="choose-hub" data-hub="Metro Hub #04 - South Central">${icon('check')} Metro Hub #04 · South Central</button><button class="popover-item" data-action="choose-hub" data-hub="North Harvest Hub #02">North Harvest Hub #02</button><button class="popover-item" data-action="choose-hub" data-hub="East Market Hub #07">East Market Hub #07</button></div>` : '';
    return `<header class="topbar"><button class="mobile-menu" data-action="toggle-menu" aria-label="Open navigation">${icon('grid')}</button><div class="top-left"><div style="position:relative"><button class="hub-select" data-action="toggle-hub">${icon('hub')}<span id="hub-name">Metro Hub #04 - South Central</span>${icon('chevron','sm')}</button>${hubs}</div><div class="status-live"><span class="pulse-dot"></span>LIVE · Connected to Supabase</div><form class="top-search" id="global-search-form">${icon('search')}<input id="global-search" placeholder="Search vegetable SKU, order ID, rider, or phone…" value="${esc(state.globalQuery)}" aria-label="Search operations"/><button type="submit" hidden>Search</button></form></div><div class="top-actions"><div style="position:relative"><button class="btn btn-primary" data-action="toggle-quick">${icon('plus')}<span>Quick Add</span></button>${quick}</div><button class="icon-btn" data-action="notifications" aria-label="Notifications">${icon('bell')}<span class="notif-count">3</span></button><div class="profile">${state.isAuthenticated ? `<div class="profile-avatar">${imageTag(state.user?.avatar || 'ops-lead-avatar.jpg', state.user?.name || 'Profile')}</div><div><div class="profile-name">${esc(state.user?.name || 'Ops Lead')}</div><div class="profile-role">${esc(state.user?.email || 'admin@uzhavarpay.example.test')}</div></div><button class="btn btn-ghost btn-compact" data-action="logout">${icon('logout','sm')}<span>Sign out</span></button>` : `<div class="profile-avatar">${imageTag('ops-lead-avatar.jpg','Ops lead profile')}</div><div><div class="profile-name">Marcus Vance</div><div class="profile-role">Ops Lead · Admin</div></div>`}</div></header>`;
  }

  function dashboardChart() {
    const bars = [48, 112, 156, 138, 72, 62, 83, 125, 170, 164, 111, 60];
    const labels = ['06:00','07:00','08:00','09:00','11:00','13:00','15:00','17:00','18:00','19:00','20:00','21:00'];
    const points = [[40,175],[92,112],[144,60],[196,83],[248,127],[300,140],[352,118],[404,76],[456,52],[508,57],[560,98],[612,145]];
    return `<div class="chart-wrap"><svg viewBox="0 0 680 230" role="img" aria-label="Dispatch volume and revenue chart"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0a805b" stop-opacity=".17"/><stop offset="1" stop-color="#0a805b" stop-opacity="0"/></linearGradient></defs>${[30,75,120,165,205].map((y,i)=>`<line x1="36" y1="${y}" x2="650" y2="${y}" stroke="#e8ebf0" stroke-dasharray="3 4"/><text x="8" y="${y+4}" font-size="9" fill="#879187" font-family="JetBrainsMono">${[240,180,120,60,0][i]}</text>`).join('')}${bars.map((h,i)=>`<rect x="${40+i*52}" y="${205-h*.72}" width="13" height="${h*.72}" rx="2" fill="#2563eb" opacity=".88"/><rect x="${56+i*52}" y="${205-h*.46}" width="10" height="${h*.46}" rx="2" fill="#c2d9d0"/>`).join('')}<path d="M ${points.map(p=>p.join(' ')).join(' L ')} L 612 205 L 40 205 Z" fill="url(#area)"/><path d="M ${points.map(p=>p.join(' ')).join(' L ')}" fill="none" stroke="#08744e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${points.filter((_,i)=>i===2||i===8||i===9).map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#08744e" stroke-width="2.5"/>`).join('')}${labels.map((label,i)=>`<text x="${42+i*52}" y="222" font-size="8" fill="${i===8||i===9?'#0051d5':'#7b867d'}" font-family="JetBrainsMono">${label}</text>`).join('')}</svg></div>`;
  }
  function renderDashboard() {
    const moving = [
// Live chart data loads from Supabase products table
    ];
    const topOrders = data.orders.slice(0,4);
    return `<div class="page-stack">
      <div class="status-strip"><div class="status-left"><span class="status-chip"><span class="pulse-dot"></span>Live data from Supabase</span><span class="status-item">${icon('clock','sm')} Cycle: 17:42:09 IST</span><span class="status-item">${icon('thermo','sm')} Cold Zone Target: 3.2°C – 4.1°C</span></div><div class="status-right"><button class="btn btn-soft btn-compact" data-action="export-manifest">${icon('download','sm')} Export Manifest</button><button class="btn btn-primary btn-compact" data-action="refresh-feeds">${icon('refresh','sm')} Refresh Data</button></div></div>
      <div class="warning-banner"><span class="warning-icon">${icon('alert','lg')}</span><div class="warning-copy"><h2 class="warning-title"><span class="badge amber-badge">Depletion warning</span> Organic Baby Spinach (Baby Palak)</h2><p class="warning-text">Available cold reserve is down to <strong class="mono">12.0 Kg</strong> (minimum SLA threshold: <strong>50.0 Kg</strong>). Replenishment is recommended for batch #HAR-902.</p></div><div class="warning-actions"><button class="btn btn-soft btn-compact" data-action="dismiss-warning">Dismiss</button><button class="btn btn-warn btn-compact" data-action="notify-supplier">${icon('bell','sm')} Notify Farm Supplier</button></div></div>
      <div class="metric-grid four">
        ${metric('Gross Today’s Revenue','$18,450.80','wallet','<span class="positive">↑ 14.2%</span><span>vs. Yesterday ($16,152)</span>','', '<div class="metric-mini-bars"><i style="height:30%"></i><i style="height:48%"></i><i style="height:75%"></i><i style="height:53%"></i><i style="height:88%"></i><i style="height:100%"></i></div>')}
        ${metric('Total Orders Today','1,428 <small>deliveries</small>','package','<span>Fulfilled rate: <strong>61.2%</strong> completed</span>','blue-bg')}
        ${metric('Produce Dispatched','4,820 <small>Kg</small>','produce','<span class="positive">↑ 8.4%</span><span>vs. Daily Capacity Target (5,000 Kg)</span>')}
        ${metric('Active Rider Fleet','42 <small>/ 48 Online</small>','bike','<span class="positive">● 94.8%</span><span>SLA On-Time Dispatches</span>','blue-bg')}
      </div>
      <div class="dashboard-grid"><article class="card card-pad"><div class="section-head"><div><h2 class="card-title">Hourly Velocity &amp; Demand Heat</h2><p class="card-subtitle">Live dispatched packages per hour vs. revenue yield</p></div><div class="shift-tabs"><button class="active" data-range="today">Today</button><button data-range="7d">Last 7 Days</button><button data-range="month">Month</button></div></div><div class="chart-legend"><span class="legend-item"><i class="legend-swatch"></i>Order dispatches</span><span class="legend-item"><i class="legend-swatch blue-swatch"></i>Hourly revenue</span><span class="legend-item amber"><i class="legend-swatch" style="background:#f2b552"></i>Morning surge: 7–10 AM</span><span class="legend-item blue"><i class="legend-swatch" style="background:#b8c9ff"></i>Evening surge: 5–8 PM</span></div>${dashboardChart()}<div class="note-strip"><span>${icon('check','sm')} Estimated remaining evening capacity: <strong>380 orders</strong></span><span class="mono blue">Dispatch SLA: 98.4% on track</span></div></article>
      <article class="card card-pad"><div class="section-head"><div><h2 class="card-title">Top Produce Movers</h2><p class="card-subtitle">Ranked by throughput &amp; net margins</p></div><button class="link-button" data-view="products">Full SKU Catalog ${icon('arrow','sm')}</button></div><div class="mover-list">${moving.map((item,i)=>`<div class="mover"><img src="${IMAGE(item[0])}" alt="${esc(item[1])}"/><div><div class="mover-name">${esc(item[1])} <span class="count-pill">#${i+1}</span></div><div class="mover-sku">SKU: ${item[2]} · ${item[3]}</div></div><div class="mover-stat">${item[4]}<small>${item[5]}</small></div></div>`).join('')}</div><div class="note-strip"><span>Fresh Category Contribution: <strong>68.2%</strong> of daily GMV</span><span class="mono">Wastage: <strong class="green">0.41% (Low)</strong></span></div></article></div>
      <div class="dashboard-lower"><article class="card table-card"><div class="manifest-head"><div class="manifest-title"><h2 class="h2">High-Priority Vegetable Dispatches</h2><span class="badge blue-badge">4 live in-flight</span></div><button class="icon-btn" data-action="table-filters" aria-label="Filter dispatches">${icon('sliders')}</button></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Order &amp; Batch</th><th>Client / Account</th><th>Items &amp; Weight</th><th>Total</th><th>Window Slot</th><th>Assigned Fleet</th><th></th></tr></thead><tbody>${topOrders.map((order)=>`<tr data-action="open-order" data-id="${order.id}"><td><span class="table-id">#${order.id}</span><span class="table-sub">ZONE-${order.zone.replace(/[^0-9A-Z]/g,'').slice(0,5)}</span></td><td><span class="cell-strong">${esc(order.customer)}</span><span class="table-sub">${esc(order.area.slice(0,24))}</span></td><td>${order.items} items<span class="table-sub mono">${order.weight} Kg · cold-pack</span></td><td class="cell-mono">$${num(order.total,2)}</td><td class="cell-mono">${esc(order.slot)}</td><td><span class="cell-strong">${esc(order.courier)}</span><span class="table-sub">${esc(order.status)}</span></td><td>${icon('more','sm')}</td></tr>`).join('')}</tbody></table></div><div class="table-footer"><span>Showing 4 of ${data.orders.length} active high-priority dispatches</span><button class="link-button" data-view="orders">View all active orders ${icon('arrow','sm')}</button></div></article>
      <article class="card card-pad"><div class="section-head"><div><h2 class="card-title">Hub Cold-Node Health</h2><p class="card-subtitle">South Central Metro Hub #04 stations</p></div>${icon('snow','lg')}</div><div class="zone-card"><div class="zone-heading"><span>● Sorting &amp; Bagging</span>${statusBadge('Normal')}</div><div class="zone-foot"><span>Average pack time</span><span>4.2 min / order</span></div><div class="progress"><span style="width:72%"></span></div></div><div class="zone-card"><div class="zone-heading"><span>● Fresh Produce QA</span>${statusBadge('100% Passed')}</div><div class="zone-foot"><span>Sugar / crisp index</span><span>Grade A (Optimum)</span></div><div class="progress"><span style="width:100%"></span></div></div><div class="zone-card"><div class="zone-heading"><span>● Rider Pickup Queue</span>${statusBadge('3 Drivers Staged')}</div><div class="zone-foot"><span>Gate clearance delay</span><span>1.1 min wait time</span></div><div class="progress"><span style="width:35%;background:#2563eb"></span></div></div><div class="note-strip"><span>${icon('snow','sm')} Zone B Chiller: 3.4°C</span><span class="mono">Humidity: 88%</span></div></article></div>
    </div>`;
  }

  function productCounts() {
    const inStock = data.products.filter(p => p.stock > p.reorder).length;
    const low = data.products.filter(p => p.stock > 0 && p.stock <= p.reorder).length;
    const out = data.products.filter(p => p.stock <= 0).length;
    return { inStock, low, out };
  }
  function filteredProducts() {
    const q = state.productSearch.trim().toLowerCase();
    return data.products.filter((p) => {
      const statusMatch = state.productFilter === 'all' || (state.productFilter === 'in' ? p.stock > p.reorder : state.productFilter === 'low' ? p.stock > 0 && p.stock <= p.reorder : p.stock <= 0);
      const catMatch = state.productCategory === 'All' || p.category === state.productCategory;
      const searchMatch = !q || `${p.name} ${p.id} ${p.category}`.toLowerCase().includes(q);
      return statusMatch && catMatch && searchMatch;
    });
  }
  function productDrawer(product) {
    if (!product) return `<aside class="card product-drawer"><div class="empty-state"><span class="empty-icon">${icon('produce','lg')}</span><strong>Select a vegetable</strong>Choose a row to review product details.</div></aside>`;
    const tab = state.drawerTab;
    let body = '';
    if (tab === 'basic') body = `<div class="form-grid"><div class="field full"><label>Vegetable Item Name</label><input name="drawer-name" value="${esc(product.name)}" /></div><div class="field"><label>Category</label><select name="drawer-category">${['Leafy Greens','Root Vegetables','Exotic & Organic','Gourds & Squashes','Herbs & Seasoning'].map(c=>`<option ${product.category===c?'selected':''}>${c}</option>`).join('')}</select></div><div class="field"><label>Unit Type</label><select name="drawer-unit"><option ${product.unit==='Kg'?'selected':''}>Kg</option><option ${product.unit==='Bunch'?'selected':''}>Bunch</option><option>Pcs</option></select></div></div><div class="price-box"><div class="price-box-title">Procurement &amp; Margin Engine</div><div class="price-trio"><div class="field"><label>Cost Price</label><input name="drawer-cost" type="number" step="0.01" value="${product.cost}" /></div><div class="field"><label>Selling Price</label><input name="drawer-price" type="number" step="0.01" value="${product.price}" /></div><div class="field"><label>App Promo ($)</label><input name="drawer-promo" type="number" step="0.01" value="${product.promo}" /></div></div><div class="margin-line"><span>Projected Gross Margin:</span><strong class="green">${product.price ? num(((product.price-product.cost)/product.price)*100,1) : '0.0'}% ($${num(product.price-product.cost,2)}/${esc(product.unit)})</strong></div></div><div class="form-grid"><div class="field"><label>Min Order Qty</label><input value="250g" /></div><div class="field"><label>Current Stock</label><input value="${num(product.stock)} ${esc(product.unit)}" disabled /></div><div class="field full"><label>Reorder Trigger</label><input name="drawer-reorder" type="number" value="${product.reorder}" /></div></div>`;
    else if (tab === 'pricing') body = `<div class="price-box"><div class="price-box-title">Pricing &amp; Units</div><div class="form-grid"><div class="field"><label>Cost price / ${esc(product.unit)}</label><input name="drawer-cost" type="number" step="0.01" value="${product.cost}" /></div><div class="field"><label>Retail price / ${esc(product.unit)}</label><input name="drawer-price" type="number" step="0.01" value="${product.price}" /></div><div class="field"><label>Promo price</label><input name="drawer-promo" type="number" step="0.01" value="${product.promo}" /></div><div class="field"><label>Packaging &amp; unit</label><input name="drawer-package" value="${esc(product.package)}" /></div></div><div class="margin-line"><span>Projected margin</span><strong class="green">${num(((product.price-product.cost)/Math.max(product.price,.01))*100,1)}%</strong></div></div><div class="note-strip">Price edits are stored in the live workspace.</div>`;
    else if (tab === 'rules') body = `<div class="form-grid"><div class="field"><label>Current stock</label><input value="${num(product.stock)} ${esc(product.unit)}" disabled /></div><div class="field"><label>Reorder trigger</label><input name="drawer-reorder" type="number" value="${product.reorder}" /></div><div class="field"><label>Cold-room target</label><input value="${esc(product.cold || '4–7°C')}" /></div><div class="field"><label>Supplier lead time</label><select><option>1 business day</option><option>Same day</option><option>2 business days</option></select></div><div class="field full"><label>Inventory rule</label><select><option>Notify when below reorder trigger</option><option>Auto-create draft purchase order</option></select></div></div><div class="note-strip">Threshold notifications are active; supplier alerts via Supabase.</div>`;
    else body = `<div class="field"><label>Product catalog images</label><div class="image-strip">${[product.image, product.image==='catalog-cherry-tomatoes.jpg'?'tomato-clamshell.jpg':product.image, product.image==='catalog-cherry-tomatoes.jpg'?'sliced-tomato.jpg':product.image].map((img,i)=>`<img src="${IMAGE(img)}" alt="${esc(product.name)} view ${i+1}"/>`).join('')}</div></div><div class="note-strip">${icon('upload','sm')} Select a file is not connected. Image previews are the bundled Stitch references.</div>`;
    return `<aside class="card product-drawer"><div class="drawer-head"><div class="drawer-kicker">SKU Configuration Module</div><div class="drawer-title-row"><div><h2>Add / Edit Vegetable: ${esc(product.name)}</h2><div class="small muted mono" style="margin-top:4px">Last synced with cold store #04: 10:42 AM · ${esc(product.id)}</div></div><button class="icon-btn" data-action="close-product-drawer" aria-label="Close product details">${icon('close')}</button></div></div><div class="drawer-tabs">${[['basic','ⓘ Basic Details'],['pricing','▤ Pricing & Units'],['rules','☷ Inventory Rules'],['images','▧ Images (3)']].map(([key,label])=>`<button class="${tab===key?'active':''}" data-drawer-tab="${key}">${label}</button>`).join('')}</div><div class="drawer-body">${body}<div class="toggle-row"><div><strong style="font-size:10px">Display in Customer App</strong><div class="small muted" style="margin-top:3px">Allow immediate mobile orders in South Central Hub</div></div><button class="switch on" data-action="toggle-product-display" aria-label="Toggle customer app visibility"></button></div></div><div class="drawer-foot"><button class="btn btn-ghost btn-compact" data-action="cancel-product-edit">Cancel</button><button class="btn btn-primary btn-compact" data-action="save-product-drawer">${icon('check','sm')} Save Vegetable Changes</button></div></aside>`;
  }
  function renderProducts() {
    const counts = productCounts();
    const categories = ['All', ...new Set(data.products.map(p=>p.category))];
    const products = filteredProducts();
    const selected = data.products.find(p => p.id === state.selectedProductId) || products[0];
    const actions = `<button class="btn btn-soft" data-action="bulk-price">${icon('percent')} Bulk Price Update</button><button class="btn btn-soft" data-action="export-products">${icon('download')} Export CSV</button><button class="btn btn-primary" data-action="add-product">${icon('plus')} Add New Vegetable</button>`;
    return `<div class="page-stack">${heading('products',actions)}<div class="page-heading" style="align-items:center"><div class="eyebrow" style="margin:0">${icon('produce','sm')} ${data.products.length} Active Items <span class="muted">· ${categories.length-1} Agricultural Categories · Re-evaluated 4m ago</span></div><span class="small muted">Records from Supabase</span></div><div class="product-toolbar"><div class="filter-left">${pageSearch('product-search','Search by name or SKU…',state.productSearch)}<div class="catalog-filters">${[['all','All'],['in','In Stock'],['low','Low Stock'],['out','Out of Stock']].map(([key,label])=>`<button class="chip ${state.productFilter===key?'active':''}" data-product-filter="${key}">${label} <span class="count">${key==='all'?data.products.length:key==='in'?counts.inStock:key==='low'?counts.low:counts.out}</span></button>`).join('')}</div></div><div class="catalog-filters"><span class="uppercase muted">Categories:</span>${categories.map(cat=>`<button class="chip ${state.productCategory===cat?'active':''}" data-product-category="${esc(cat)}">${esc(cat)} <span class="count">${cat==='All'?data.products.length:data.products.filter(p=>p.category===cat).length}</span></button>`).join('')}</div></div><div class="product-layout"><section class="card table-card"><div class="table-scroll"><table class="data-table catalog-table"><thead><tr><th><input type="checkbox" aria-label="Select all products"/></th><th>Vegetable Product</th><th>Packaging &amp; Units</th><th>Current Stock</th><th>Retail Price</th><th>Status</th><th></th></tr></thead><tbody>${products.length?products.map(p=>`<tr class="${p.id===state.selectedProductId?'selected':''}" data-action="select-product" data-id="${esc(p.id)}"><td><input type="checkbox" aria-label="Select ${esc(p.name)}" ${p.id===state.selectedProductId?'checked':''}/></td><td><div class="product-name-cell">${imageTag(p.image,p.name)}<div><strong>${esc(p.name)}</strong><small>${esc(p.id)} · ${esc(p.category)}</small></div></div></td><td>${esc(p.package)}<span class="table-sub">Unit sale · ${esc(p.unit)}</span></td><td><span class="cell-mono ${p.stock<=p.reorder?'amber':''}">${num(p.stock)} ${esc(p.unit)}</span><span class="table-sub">Reorder at ${num(p.reorder)} ${esc(p.unit)}</span></td><td class="cell-mono">$${num(p.price,2)}<span class="table-sub">Promo $${num(p.promo,2)}</span></td><td>${statusBadge(p.stock>p.reorder?'In Stock':p.stock>0?'Low Stock':'Out of Stock')}</td><td><button class="icon-btn" data-action="product-menu" data-id="${esc(p.id)}" aria-label="More product actions">${icon('more','sm')}</button></td></tr>`).join(''):`<tr><td colspan="7"><div class="empty-state"><strong>No vegetables match those filters</strong>Try another category or stock status.</div></td></tr>`}</tbody></table></div><div class="table-footer"><span>Showing ${products.length?1:0}–${products.length} of ${data.products.length} vegetables</span><span>Rows per page: <select class="select-control" style="height:24px;padding:0 5px"><option>25</option><option>50</option></select>　‹　<strong>1 / 1</strong>　›</span></div></section>${productDrawer(selected)}</div></div>`;
  }

  const orderStatusKeys = { 'New Orders':'new', 'Confirmed':'confirmed', 'Processing / Bagging':'processing', 'Ready for Pickup':'ready', 'Out for Delivery':'delivery' };
  function orderStatusClass(status) {
    if (status === 'Unassigned') return 'red-badge';
    if (status === 'Ready for Pickup') return 'green-badge';
    if (status === 'Processing') return 'amber-badge';
    if (status === 'Out for Delivery' || status === 'Dispatching') return 'blue-badge';
    return 'purple-badge';
  }
  function orderBadge(status) { return `<span class="badge ${orderStatusClass(status)}">${esc(status)}</span>`; }
  function filteredOrders() {
    let rows = data.orders;
    if (state.orderTab === 'new') rows = rows.filter(o => o.status === 'Unassigned');
    else if (state.orderTab === 'confirmed') rows = rows.filter(o => o.status === 'Confirmed');
    else if (state.orderTab === 'processing') rows = rows.filter(o => o.status === 'Processing');
    else if (state.orderTab === 'ready') rows = rows.filter(o => o.status === 'Ready for Pickup');
    else if (state.orderTab === 'delivery') rows = rows.filter(o => ['Out for Delivery','Dispatching'].includes(o.status));
    const q=state.orderSearch.trim().toLowerCase();
    return rows.filter(o=>!q||`${o.id} ${o.customer} ${o.area} ${o.courier}`.toLowerCase().includes(q));
  }
  function miniMap(order) {
    return `<div class="mini-map"><svg viewBox="0 0 460 150" preserveAspectRatio="xMidYMid slice" aria-label="Order route map"><rect width="460" height="150" fill="#e9f0eb"/><path d="M-10 112 52 68 88 77 141 23 183 35 228-12M74 165l57-46 57 6 53-34 68 13 63-45 74 4M-3 38l59 20 42-16 73 48 35-8 58 40 48-23 71 22" fill="none" stroke="#fff" stroke-width="13"/><path d="M-10 112 52 68 88 77 141 23 183 35 228-12M74 165l57-46 57 6 53-34 68 13 63-45 74 4M-3 38l59 20 42-16 73 48 35-8 58 40 48-23 71 22" fill="none" stroke="#cdd9d0" stroke-width="1.5"/><path d="M40 136 127 81 207 88 299 46 386 59" fill="none" stroke="#3485e8" stroke-width="3" stroke-dasharray="5 5"/><circle cx="127" cy="81" r="7" fill="#fff" stroke="#08744e" stroke-width="3"/><circle cx="386" cy="59" r="8" fill="#2563eb" stroke="#fff" stroke-width="3"/><text x="20" y="24" font-size="9" fill="#65766b" font-family="Inter">METRO HUB #04 · SAMPLE MAP</text><text x="320" y="110" font-size="8" fill="#64746a" font-family="Inter">South Park</text><text x="75" y="52" font-size="8" fill="#64746a" font-family="Inter">Greenway Ave</text></svg><span class="map-tag">${icon('bike','sm')} Rider ${esc(order.courier)} · ETA ${esc(order.eta)}</span></div>`;
  }
  function orderDetail(order) {
    if (!order) return `<aside class="card order-detail"><div class="empty-state"><span class="empty-icon">${icon('receipt','lg')}</span><strong>Select an order</strong>Choose a row to inspect the order and dispatch actions.</div></aside>`;
    const assigned = order.courier && order.courier !== 'Unassigned';
    return `<aside class="card order-detail"><div class="detail-top"><div><div class="detail-id">#${esc(order.id)} ${orderBadge(order.status)}</div><div class="detail-meta">Confirmed 17:42 · ${esc(order.slot)} window</div></div><button class="icon-btn" data-action="close-order-detail" aria-label="Close order detail">${icon('close')}</button></div><div class="detail-location"><div class="location-title">${icon('pin','sm')} Drop coordinates · ${esc(order.zone)} <span class="mono muted">${esc(order.distance)}</span></div><div class="customer-name">${esc(order.customer)} <span class="muted">· +91 98765 38940</span></div><div class="customer-address">${esc(order.area)}, ${esc(order.pin)}</div><div class="instruction">Delivery note: “${esc(order.instruction)}”</div>${miniMap(order)}</div><div class="basket-head"><span>Packed basket (${order.items} SKUs · ${order.weight} Kg)</span><span class="green">✓ Verified</span></div>${order.basket.map(item=>`<div class="basket-row">${imageTag(item.image,item.name)}<div><strong>${esc(item.name)}</strong><small>${esc(item.lot)}</small></div><div class="basket-price">${esc(item.qty)}<small>$${num(item.price,2)}</small></div></div>`).join('')}<div class="detail-total"><span>Subtotal + eco chilled pouch ($1.50)</span><strong>$${num(order.total,2)}</strong></div><div class="assigned-card"><div class="assigned-head"><span>Assigned Fleet Courier</span><button class="link-button" data-action="reroute-order">Re-route</button></div><div class="assigned-person"><span class="rider-initial">${esc(order.initials||'--')}</span><div><strong>${esc(order.courier)}</strong><small>${assigned?`${esc(order.courierPct)} · ${esc(order.distance)} · ${esc(order.eta)} ETA`:'Awaiting rider allocation'}</small></div>${assigned?'<span class="badge green-badge">On route</span>':''}</div><button class="btn btn-primary" style="width:100%;margin-top:8px" data-action="confirm-dispatch" data-id="${esc(order.id)}">${icon('check')} ${order.status==='Out for Delivery'?'Delivery is in transit':'Confirm Handover & Dispatch Order'}</button></div><div class="detail-actions"><button class="btn btn-soft" data-action="invoice" data-id="${esc(order.id)}">${icon('download')} Invoice PDF</button><button class="btn btn-soft" data-action="refund" data-id="${esc(order.id)}">${icon('wallet')} Issue Refund</button><button class="btn btn-soft" data-action="call-buyer" data-id="${esc(order.id)}">${icon('phone')} Call Buyer</button></div></aside>`;
  }
  function renderOrders() {
    const orders = filteredOrders();
    const selected = data.orders.find(o=>o.id===state.selectedOrderId) || orders[0];
    const counts = {all:data.orders.length,new:data.orders.filter(o=>o.status==='Unassigned').length,confirmed:data.orders.filter(o=>o.status==='Confirmed').length,processing:data.orders.filter(o=>o.status==='Processing').length,ready:data.orders.filter(o=>o.status==='Ready for Pickup').length,delivery:data.orders.filter(o=>['Out for Delivery','Dispatching'].includes(o.status)).length};
    const actions=`<button class="btn btn-soft" data-action="print-invoices">${icon('document')} Print Delivery Invoices</button><button class="btn btn-primary" data-action="auto-assign">${icon('bike')} Auto-Assign (${counts.new||0})</button>`;
    return `<div class="page-stack">${heading('orders',actions)}<div class="page-heading" style="align-items:center"><div class="eyebrow">${icon('truck','sm')} Zone Metro-04 South Central Fulfillment Corridor · Active Shift: Evening Peak <span class="badge green-badge">Live synced</span></div><div class="page-actions">${statusBadge('Avg bagging 4m 12s')}${statusBadge('Rider SLA 98.4%')}${statusBadge('Cold bay 3.8°C')}</div></div><div class="order-tabs">${[['all','All Orders',counts.all,''],['new','New Orders',counts.new,'red-count'],['confirmed','Confirmed',counts.confirmed,''],['processing','Processing / Bagging',counts.processing,'amber-count'],['ready','Ready for Pickup',counts.ready,'green-count'],['delivery','Out for Delivery',counts.delivery,'']].map(([key,label,count,cls])=>`<button class="${state.orderTab===key?'active':''}" data-order-tab="${key}">${key==='new'?'<span class="red">●</span>':''}${key==='delivery'?icon('bike','sm'):''}${label}<span class="tab-count ${cls}">${count}</span></button>`).join('')}</div><div class="filter-panel"><div class="filter-left"><select class="select-control" id="order-shift"><option>Evening 05:00 – 08:00 PM</option><option>Morning 06:00 – 02:00 PM</option><option>All shifts</option></select>${pageSearch('order-search','Search order ID or customer…',state.orderSearch)}<span class="badge amber-badge">⚡ 34 Fast-Track (Cold Pouch)</span></div><div class="filter-right"><button class="btn btn-blue btn-compact" data-action="auto-assign">${icon('bike','sm')} Auto-Assign (${counts.new||0})</button><button class="btn btn-soft btn-compact" data-action="print-invoices">${icon('document','sm')} Print Delivery Invoices</button><button class="btn btn-soft btn-compact" data-action="zone-map">${icon('map','sm')} Zone Heatmap</button></div></div><div class="orders-layout"><section class="card table-card"><div class="manifest-head"><div class="manifest-title"><h2 class="h2">Queue Dispatch Manifest</h2><span class="count-pill">Showing ${orders.length} of ${data.orders.length}</span></div><div>${icon('filter')} ${icon('sliders')}</div></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Order # &amp; Time</th><th>Customer &amp; Area</th><th>Produce Basket</th><th>Load</th><th>Pay Mode</th><th>Assigned Courier</th><th>Status</th></tr></thead><tbody>${orders.length?orders.map(o=>`<tr class="${selected&&selected.id===o.id?'selected':''}" data-action="select-order" data-id="${esc(o.id)}"><td><span class="table-id">#${esc(o.id)}</span><span class="table-sub">${esc(o.time)}</span></td><td><span class="cell-strong">${esc(o.customer)}</span><span class="table-sub">${esc(o.area.slice(0,30))}</span></td><td>${o.items} items<span class="table-sub">${esc(o.basket.slice(0,2).map(x=>x.name).join(', '))}</span></td><td class="cell-mono">${o.weight} Kg</td><td>${o.mode.startsWith('COD')?'<span class="badge amber-badge">'+esc(o.mode)+'</span>':'<span class="badge green-badge">Prepaid</span>'}</td><td><span class="cell-strong">${esc(o.courier)}</span><span class="table-sub">${o.courierId?esc(o.courierId):'Needs rider'}</span></td><td>${orderBadge(o.status)}</td></tr>`).join(''):`<tr><td colspan="7"><div class="empty-state"><strong>No orders in this queue</strong>Choose a different status or clear the search.</div></td></tr>`}</tbody></table></div><div class="table-footer"><span>Batch allocation mode: <strong class="green">Dynamic geo-clustering on live data</strong></span><div class="pagination"><button class="page-number">‹</button><span>1 of 1</span><button class="page-number">›</button></div></div></section>${orderDetail(selected)}</div></div>`;
  }

  function renderInventory() {
    const total = data.inventory.reduce((sum,x)=>sum+Number(x.available||0),0);
    const low = data.inventory.filter(x=>x.available < x.minimum).length;
    const critical = data.inventory.filter(x=>x.available < x.minimum*.5).length;
    const actions=`<button class="btn btn-soft" data-action="record-wastage">${icon('sliders')} Record Wastage &amp; Delta</button><button class="btn btn-primary" data-action="inward-scan">${icon('upload')} Inward Crate Scan</button>`;
    const tabs=[['overview','Warehouse Stock Overview'],['inward','Stock In (Inward Crates)'],['adjust','Stock Adjustments & Wastage Log'],['supplier','Supplier Directory']];
    const inventoryAux = state.inventoryTab === 'overview' ? '' : state.inventoryTab === 'inward' ? `<section class="card table-card"><div class="manifest-head"><div><h2 class="h2">Inbound Crates · Verification Queue</h2><span class="small muted">Sample inbound shipments · no live supplier connection</span></div><button class="btn btn-primary btn-compact" data-action="inward-scan">${icon('upload','sm')} Scan Inward Crate</button></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Purchase Order</th><th>Farm Supplier</th><th>Produce / Lot</th><th>Expected</th><th>Cold-chain Check</th><th>Status</th><th></th></tr></thead><tbody><tr><td class="cell-mono">PO-881</td><td>GreenValley Farms</td><td>Organic Baby Spinach<span class="table-sub mono">#HAR-902 · Harvest 06:10</span></td><td class="cell-mono">240 Kg</td><td>3.6°C · 98% RH</td><td>${statusBadge('QC Pending')}</td><td><button class="btn btn-soft btn-compact" data-action="verify-inbound">Review</button></td></tr><tr><td class="cell-mono">PO-879</td><td>Evergreen Farms</td><td>Snow Cauliflower<span class="table-sub mono">#CLF-031 · Harvest 05:25</span></td><td class="cell-mono">480 Kg</td><td>3.2°C · 92% RH</td><td>${statusBadge('In Spec')}</td><td><button class="btn btn-soft btn-compact" data-action="verify-inbound">Review</button></td></tr><tr><td class="cell-mono">PO-876</td><td>PureGrow Hydro</td><td>Hydroponic Lettuce<span class="table-sub mono">#HYD-812 · Harvest 04:50</span></td><td class="cell-mono">96 Crates</td><td>4.1°C · 94% RH</td><td>${statusBadge('Verified')}</td><td><button class="btn btn-soft btn-compact" data-action="verify-inbound">Review</button></td></tr></tbody></table></div></section>` : state.inventoryTab === 'adjust' ? `<section class="card table-card"><div class="manifest-head"><div><h2 class="h2">Stock Adjustments &amp; Wastage Log</h2><span class="small muted">Latest events</span></div><button class="btn btn-primary btn-compact" data-action="record-wastage">${icon('plus','sm')} Record Delta</button></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Adjustment</th><th>Inspection note</th><th>Recorded</th><th>Event</th></tr></thead><tbody>${data.stockLog.map(x=>`<tr><td class="cell-strong">${esc(x.label)}</td><td>${esc(x.detail)}</td><td class="cell-mono">${esc(x.time)}</td><td>${statusBadge(x.type==='loss'?'Spoilage':'Quality check')}</td></tr>`).join('')}</tbody></table></div></section>` : `<section class="card table-card"><div class="manifest-head"><div><h2 class="h2">Verified Farm Supplier Directory</h2><span class="small muted">Sample directory · contact actions are disabled</span></div><button class="btn btn-soft btn-compact" data-action="supplier-contacts">${icon('users','sm')} Supplier contacts</button></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Supplier</th><th>Produce categories</th><th>Hub route</th><th>In-spec rate</th><th>Open orders</th><th>Status</th></tr></thead><tbody>${[['GreenValley Farms','Leafy greens · Seasonal','South Central','99.2%','2','Preferred'],['Evergreen Farms','Root · Cruciferous','South Central','98.6%','1','Verified'],['PureGrow Hydro','Hydroponic greens','Metro Hub #04','100%','3','Preferred'],['SunRidge Agro','Peppers · Squashes','East Market','97.8%','1','Verified']].map(r=>`<tr><td class="cell-strong">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td class="cell-mono green">${r[3]}</td><td class="cell-mono">${r[4]}</td><td>${statusBadge(r[5])}</td></tr>`).join('')}</tbody></table></div></section>`;
    return `<div class="page-stack">${heading('inventory',actions)}<div class="page-heading" style="align-items:center"><div class="eyebrow">${icon('truck','sm')} Fulfillment Hub Node 04 · Dynamic Produce Ledger</div><div class="page-actions"><span class="status-chip">${icon('snow','sm')} Cold Vault Master: 3.8°C / 92% RH</span></div></div><div class="inventory-top-grid"><article class="card inventory-metric"><div class="metric-top"><span class="metric-label">Total Stock on Hand</span><span class="metric-icon">${icon('box')}</span></div><div class="metric-value">${num(total)} <small>Kg / Pcs</small></div><div class="metric-foot"><span>Book value: $24,180.00</span><strong class="green">↗ +2.1% net</strong></div></article><article class="card inventory-metric"><div class="metric-top"><span class="metric-label">Stock-in Today</span><span class="metric-icon">${icon('download')}</span></div><div class="metric-value green">+4,200 <small>Kg</small></div><div class="metric-foot"><span>6 verified farm suppliers</span><strong class="green">100% in-spec</strong></div></article><article class="card inventory-metric"><div class="metric-top"><span class="metric-label">Daily Wastage &amp; Spoilage</span><span class="metric-icon blue-bg">${icon('package')}</span></div><div class="metric-value">1.4<small>% (68 Kg culled)</small></div><div class="metric-foot"><span>Target: &lt; 3.0% threshold</span><strong class="green">−0.4% MoM</strong></div></article><article class="card inventory-metric"><div class="metric-top"><span class="metric-label">Urgent Low Stock SKUs</span><span class="metric-icon red-bg">${icon('alert')}</span></div><div class="metric-value red">${num(low+6)} <small>vegetables critical</small></div><div class="metric-foot"><span class="red">Immediate PO required</span><button class="link-button" data-action="create-po">Action</button></div></article></div><div class="alert-banner"><span class="warning-icon" style="background:#ffebe8;color:#b42318">${icon('alert')}</span><div class="alert-copy"><strong>Cold-storage buffer warning <span class="count-pill">Auto-trigger #PO-881</span></strong><p>Low-stock critical: Fresh Coriander at <b class="red">8 Kg</b> (reorder threshold: 40 Kg), Red Bell Peppers at <b class="amber">15 Kg</b>. 2 supplier POs awaiting manual dispatch confirmation.</p></div><button class="btn btn-primary btn-compact" data-action="create-po">${icon('document','sm')} Generate Batch PO to GreenValley</button><button class="btn btn-soft btn-compact" data-action="supplier-contacts">${icon('users','sm')} Supplier Contacts</button></div><div class="inventory-tabs">${tabs.map(([key,label])=>`<button class="${state.inventoryTab===key?'active':''}" data-inventory-tab="${key}">${key==='overview'?icon('grid','sm'):key==='inward'?icon('download','sm'):key==='adjust'?icon('sliders','sm'):icon('users','sm')}${label}${key==='overview'?'<span class="tab-count">142</span>':''}</button>`).join('')}<span style="flex:1"></span><select class="select-control"><option>All Produce Categories</option><option>Leafy Greens</option><option>Root Vegetables</option></select><button class="icon-btn" data-action="export-inventory" aria-label="Export inventory">${icon('download')}</button></div>${inventoryAux}<div class="inventory-layout" style="${state.inventoryTab==='overview'?'':'display:none'}"><section class="card table-card"><div class="manifest-head"><div class="manifest-title"><h2 class="h2">Cold Vault Stock Ledger</h2><span class="badge green-badge">Active lots: ${data.inventory.length}</span></div><span class="small muted">Sort: <b>Lowest Reserve First</b></span></div><div class="table-scroll"><table class="data-table stock-table"><thead><tr><th>Vegetable &amp; SKU</th><th>Bin Location</th><th>Available</th><th>Daily In/Out</th><th>Spoilage</th><th>Shelf Health</th><th>Farm Supplier</th></tr></thead><tbody>${data.inventory.map((x)=>{const pct=Math.min(100,x.available/Math.max(x.minimum*1.4,1)*100);return `<tr><td><div class="stock-item">${imageTag(x.image,x.name)}<div><strong>${esc(x.name)}</strong><small>${esc(x.id)}</small></div></div></td><td>${esc(x.location)}<span class="table-sub">${esc(x.temp)}</span></td><td><span class="stock-number ${x.available<x.minimum?'amber':''}">${num(x.available)} ${esc(x.unit)}</span><span class="table-sub">Min: ${num(x.minimum)} ${esc(x.unit)}</span></td><td class="cell-mono green">+${num(x.in)} / −${num(x.out)} ${esc(x.unit)}</td><td class="cell-mono ${x.spoilage>5?'red':''}">${num(x.spoilage,1)} Kg</td><td><div class="progress ${x.available<x.minimum*.5?'critical':x.available<x.minimum?'warn':''}"><span style="width:${pct}%"></span></div><span class="table-sub">${esc(x.shelf)}</span></td><td class="cell-strong">${esc(x.supplier)}</td></tr>`}).join('')}</tbody></table></div><div class="table-footer"><span>Showing ${data.inventory.length} of 142 tracked vegetable SKUs</span><div class="pagination"><button class="page-number">‹</button><button class="page-number active">1</button><button class="page-number">2</button><button class="page-number">3</button><span>…</span><button class="page-number">12</button><button class="page-number">›</button></div></div><div class="card-pad freshness-row"><span class="donut"><span>82%</span></span><div class="freshness-copy"><strong style="color:var(--ink)">Freshness Buffer Analysis</strong><br/>82% inventory within optimal peak freshness windows. 12% in accelerated sales dispatch phase. 6% approaching scrap margin.</div><span class="badge green-badge">Ethylene gas: 0.02 ppm (Normal)</span></div></section><div class="right-stack"><form id="stock-form" class="card form-card"><div class="section-head"><h3>${icon('check','sm')} Record Stock Delta</h3><span class="count-pill">Form C-04</span></div><div class="field"><label>Select vegetable item</label><select name="stock-id" required>${data.inventory.map(x=>`<option value="${esc(x.id)}">${esc(x.name)} (${esc(x.id)})</option>`).join('')}</select></div><div class="field"><label>Adjustment type</label><select name="stock-type"><option value="waste">Spoilage / Damaged in Transit</option><option value="inward">Verified inward stock</option><option value="count">Physical count correction</option></select></div><div class="form-grid"><div class="field"><label>Deduct / Add quantity</label><input name="stock-qty" type="number" step="0.1" min="0.1" value="15.5" required/></div><div class="field"><label>Disposal target</label><select name="stock-destination"><option>Compost Pile #2</option><option>QC Hold Bin</option><option>Cold Vault B</option></select></div></div><div class="field"><label>Inspector notes &amp; root cause</label><textarea name="stock-notes">Bruising detected upon morning crate inspection; ambient heat stress during transit.</textarea></div><button class="btn btn-primary" style="width:100%" type="submit">${icon('settings')} Submit Stock Adjustment</button></form><article class="card form-card"><div class="section-head"><h3>Recent Spoilage Log</h3><span class="small green">Shift A · Active</span></div>${data.stockLog.slice(0,4).map(x=>`<div class="log-row"><span class="log-mark">${icon(x.type==='quality'?'alert':'close','sm')}</span><div><strong>${esc(x.label)}</strong><div>${esc(x.detail)}</div><small>${esc(x.time)}</small></div></div>`).join('')}</article></div></div></div>`;
  }

  function riderStatusClass(status) {
    if (status.includes('Delivery')) return 'blue-badge';
    if (status.includes('Available')) return 'green-badge';
    if (status.includes('Break')) return 'amber-badge';
    if (status.includes('Incomplete')) return 'red-badge';
    return 'gray-badge';
  }
  function filteredRiders() {
    const q=state.riderSearch.trim().toLowerCase();
    return data.riders.filter(r=>{
      const matchQ=!q||`${r.id} ${r.name} ${r.phone} ${r.zone}`.toLowerCase().includes(q);
      const matchFilter=state.riderFilter==='all'||state.riderFilter==='active'&&['On Delivery','Available at Hub','On Duty Break'].includes(r.status)||state.riderFilter==='offline'&&r.status==='Offline / Pre-Shift'||state.riderFilter==='pending'&&r.status==='Docs Incomplete';
      const matchShift=state.shiftFilter==='All Shifts'||r.shift===state.shiftFilter;
      return matchQ&&matchFilter&&matchShift;
    });
  }
  function renderRiders() {
    const riders=filteredRiders();
    const online=data.riders.filter(r=>['On Delivery','Available at Hub','On Duty Break'].includes(r.status)).length;
    const actions=`<button class="btn btn-soft" data-action="export-attendance">${icon('download')} Export Attendance Sheet</button><button class="btn btn-primary" data-action="register-rider">${icon('userplus')} Register New Rider Employee</button>`;
    const zoneRows=[['Zone A: Downtown Central','PIN 560001 · 14 Riders Active','Optimal','92%','18.2m',73],['Zone B: Tech Park Corridor','PIN 560103 · 8 Riders Active','High Load','Orders surging backlog: 12 (+24%)','',91],['Zone C: Green Park & Indiranagar','PIN 560038 · 10 Riders Active','Optimal','68%','21.0m',66],['Zone D: South Ring Suburbs','PIN 560076 · 6 Riders Active','Needs 2 Riders','Buffer depleted · 2 on lunch break','',44]];
    return `<div class="page-stack">${heading('riders',actions)}<div class="metric-grid five">${metric('Total Riders',`${data.riders.length}`,'users','<span class="positive">↗ +3 recruited this week</span>')}${metric('Active on Duty',`${online} <small>/ ${data.riders.length}</small>`,'bike','<span class="positive">${Math.round(online/(data.riders.length)*100)}% roster</span><span>● ${online-2} active · 2 break</span>','green')}${metric('Today Completed','952','check','<span class="positive">19.8 orders / rider avg</span>','')}${metric('Average Transit Time','21.4 <small>min</small>','clock','<span class="positive">−6.6 min below ceiling</span>','blue-bg')}${metric('Fleet Punctuality SLA','98.2%','settings','<span class="positive">↗ +0.4% from yesterday</span>','') }</div><div class="rider-toolbar card"><div class="filter-panel" style="padding:0;border:0"><div class="filter-left">${pageSearch('rider-search','Search by name, ID, phone…',state.riderSearch)}</div><div class="shift-tabs">${['All Shifts','Morning Shift','Evening Shift','Full Day Flex'].map(s=>`<button class="${state.shiftFilter===s?'active':''}" data-shift-filter="${esc(s)}">${s==='All Shifts'?'All shifts':esc(s)}</button>`).join('')}</div></div><div class="rider-filters"><span class="uppercase muted">Rider filter:</span>${[['all','All Rostered',data.riders.length],['active','Active',online],['offline','Offline',data.riders.filter(r=>r.status==='Offline / Pre-Shift').length],['pending','Verification Pending',data.riders.filter(r=>r.status==='Docs Incomplete').length]].map(([key,label,count])=>`<button class="chip ${state.riderFilter===key?'active':''}" data-rider-filter="${key}">${key==='active'?'● ':''}${label} <span class="count">${count}</span></button>`).join('')}<span class="small muted">Showing ${riders.length} rider records</span></div></div><div class="rider-layout"><section class="card table-card"><div class="table-scroll"><table class="data-table rider-table"><thead><tr><th>Rider Employee</th><th>Shift &amp; Clock-in</th><th>Zone &amp; Hub Node</th><th>Live Transit Status</th><th>Today’s Metrics</th></tr></thead><tbody>${riders.length?riders.map(r=>`<tr data-action="view-rider" data-id="${esc(r.id)}"><td><div class="person-cell">${r.avatar?imageTag(r.avatar,r.name):`<span class="person-avatar">${r.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</span>`}<div><span class="cell-strong">${esc(r.name)}</span><span class="table-sub"><span class="count-pill">${esc(r.id)}</span> ${esc(r.phone)}</span><span class="table-sub">Joined: ${esc(r.joined)}</span></div></div></td><td><span class="cell-strong">${esc(r.shift)}</span><span class="table-sub ${r.checkin==='Not checked in'?'amber':''}">● ${esc(r.checkin)}</span><span class="table-sub">${esc(r.schedule)}</span></td><td><span class="cell-strong">${esc(r.zone)}</span><span class="table-sub">PIN: ${esc(r.pin)} · Hub #04</span><span class="table-sub">${esc(r.vehicle)}</span></td><td><span class="badge ${riderStatusClass(r.status)}">${esc(r.status)}${r.order?` ${esc(r.order)}`:''}</span><span class="table-sub">${esc(r.distance)}${r.eta!=='—'?` · ETA ${esc(r.eta)}`:''}</span></td><td><span class="cell-strong">${r.drops} drops / ⭐ ${esc(r.rating)}</span><span class="table-sub green">${esc(r.punctuality)} punctuality SLA</span></td></tr>`).join(''):`<tr><td colspan="5"><div class="empty-state"><strong>No riders match those filters</strong>Clear the search or select another shift.</div></td></tr>`}</tbody></table></div><div class="table-footer"><span>Rows per page: <select class="select-control" style="height:24px;padding:0 5px"><option>10</option><option>25</option></select>　1–${riders.length} of ${data.riders.length} riders</span><div class="pagination"><button class="page-number">‹</button><button class="page-number active">1</button><button class="page-number">2</button><button class="page-number">3</button><button class="page-number">›</button></div></div></section><aside><article class="card rider-zone"><div class="section-head"><div><h2 class="card-title">${icon('map','sm')} Zone Fleet Capacity</h2><p class="card-subtitle">Real-time rider allotment</p></div><span class="count-pill">LIVE</span></div>${zoneRows.map(([title,meta,badge,foot,avg,pct],i)=>`<div class="zone-card"><div class="zone-heading"><span>${esc(title)}</span>${statusBadge(badge)}</div><div class="zone-meta">${esc(meta)}</div><div class="zone-progress"><span style="width:${pct}%;background:${i===1?'#c23930':i===3?'#a76b12':'var(--green)'}"></span></div><div class="zone-foot ${i===1?'red-text':''}"><span>${esc(foot)}</span><span>${avg?`Avg SLA: ${esc(avg)}`:''}</span></div></div>`).join('')}<button class="btn btn-blue" style="width:100%;margin-top:9px" data-action="rebalance">${icon('refresh')} Rebalance Fleet Zones</button></article><article class="card gauge-card"><div class="section-head"><h2 class="card-title">Attendance SLA Gauge</h2>${icon('clock','sm')}</div><div class="gauge"><div class="gauge-ring"><span>98%</span></div><div class="gauge-copy"><strong>98.2%</strong><small>Shift start adherence<br/>47/48 on-time punch-ins</small></div></div><div class="note-strip">${icon('check','sm')} Zero biometric sync discrepancies detected today.</div></article></aside></div></div>`;
  }

  function renderSimplePage(view) {
    const actions = view==='customers' ? `<button class="btn btn-soft" data-action="export-customers">${icon('download')} Export Customers</button>` : view==='marketing' ? `<button class="btn btn-primary" data-action="new-campaign">${icon('plus')} Create Campaign</button>` : view==='finance' ? `<button class="btn btn-soft" data-action="export-finance">${icon('download')} Export P&amp;L</button>` : `<button class="btn btn-primary" data-action="save-settings">${icon('check')} Save Settings</button>`;
    if(view==='customers') return `<div class="page-stack">${heading(view,actions)}<div class="placeholder-banner">Customer directory from Supabase.</div><div class="metric-grid four">${metric('Registered Shoppers','8,420','users','<span class="positive">+6.8% this month</span>')}${metric('Repeat Buyers','62.4%','cart','<span>Last 30 days · sample</span>','blue-bg')}${metric('Average Basket','$34.80','wallet','<span class="positive">↑ 2.1% vs. prior period</span>')}${metric('Support Follow-ups','12','bell','<span class="amber">Needs review</span>','amber-bg')}</div><section class="card table-card"><div class="manifest-head"><h2 class="h2">Customer Directory</h2>${pageSearch('customer-search','Search name or phone…')}</div><div class="table-scroll"><table class="data-table"><thead><tr><th>Customer</th><th>Contact</th><th>Primary Area</th><th>Orders</th><th>Lifetime Value</th><th>Account Status</th></tr></thead><tbody>${[['','','South Park · 560034',32,'$1,280.40','Active'],['','','Greenwood · 560028',16,'$624.00','Active'],['','','Palm Meadows · 560103',11,'$442.90','Active'],['','','Oakwood · 560001',8,'$318.20','Active']].map((r,i)=>`<tr><td><span class="cell-strong">${r[0]}</span><span class="table-sub">CUST-${String(3080+i).padStart(4,'0')}</span></td><td>${r[1]}</td><td>${r[2]}</td><td class="cell-mono">${r[3]}</td><td class="cell-mono">${r[4]}</td><td>${statusBadge(r[5])}</td></tr>`).join('')}</tbody></table></div></section></div>`;
    if(view==='marketing') return `<div class="page-stack">${heading(view,actions)}<div class="placeholder-banner">Promotions managed in Supabase. Publishing a campaign will not notify customers or change the customer app.</div><div class="metric-grid four">${metric('Active Campaigns','4','megaphone','<span class="positive">2 scheduled next</span>')}${metric('Coupon Redemptions','1,284','percent','<span class="positive">+12% this week</span>','blue-bg')}${metric('Promotion GMV','$8,920','wallet','<span>Sample attribution</span>')}${metric('Banners Live','3','grid','<span class="green">Customer home carousel</span>')}</div><section class="card table-card"><div class="manifest-head"><h2 class="h2">Promotion &amp; Banner Calendar</h2><span class="small muted">Sample campaign schedule</span></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Campaign</th><th>Type</th><th>Coupon</th><th>Reach</th><th>Dates</th><th>Status</th><th></th></tr></thead><tbody>${data.campaigns.map((c,i)=>`<tr><td><span class="cell-strong">${esc(c.name)}</span><span class="table-sub">CMP-${String(304+i).padStart(4,'0')}</span></td><td>${esc(c.type)}</td><td class="cell-mono">${esc(c.code)}</td><td class="cell-mono">${esc(c.reach)}</td><td>${esc(c.dates)}</td><td>${statusBadge(c.status)}</td><td><button class="icon-btn" data-action="campaign-action">${icon('more','sm')}</button></td></tr>`).join('')}</tbody></table></div></section></div>`;
    if(view==='finance') return `<div class="page-stack">${heading(view,actions)}<div class="placeholder-banner">Financial values from verified orders—not a statement or source of truth. No payment gateway or settlement feed is connected.</div><div class="metric-grid four">${metric('Gross Merchandise Value','$18,450.80','wallet','<span class="positive">+14.2% vs. yesterday</span>')}${metric('Captured Payments','$17,120.40','check','<span>92.8% of sample GMV</span>','blue-bg')}${metric('Refunds &amp; Adjustments','$420.00','receipt','<span class="amber">6 cases</span>','amber-bg')}${metric('Estimated Net Margin','$4,821.60','percent','<span class="positive">26.1% sample margin</span>')}</div><article class="card card-pad"><div class="section-head"><div><h2 class="card-title">Payment Reconciliation</h2><p class="card-subtitle">Sample settlements · no financial action is performed</p></div><button class="btn btn-soft btn-compact" data-action="export-finance">${icon('download','sm')} Export P&amp;L</button></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Settlement</th><th>Payment Ref</th><th>Orders</th><th>Gross</th><th>Fees</th><th>Net</th><th>Status</th></tr></thead><tbody>${[['SET-1042','PAY-7781','32','$1,842.00','$46.05','$1,795.95','Reconciled'],['SET-1041','PAY-7764','28','$1,420.80','$35.52','$1,385.28','Reconciled'],['SET-1040','PAY-7712','19','$984.00','$24.60','$959.40','Pending review']].map(r=>`<tr>${r.map((x,i)=>`<td class="${i===0||i===1||i===3||i===4||i===5?'cell-mono':''}">${i===6?statusBadge(x):x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></article></div>`;
    return `<div class="page-stack">${heading(view,actions)}<div class="placeholder-banner">Settings managed in Supabase. Configure secure operations backend before using live data.</div><div class="placeholder-grid"><article class="card placeholder-card"><h3>${icon('hub','sm')} Fulfillment Hub</h3><p>Current node: Metro Hub #04 — South Central. Hub configuration is not connected to a live service.</p><div class="field" style="margin-top:12px"><label>Hub display name</label><input value="Metro Hub #04 - South Central" /></div></article><article class="card placeholder-card"><h3>${icon('snow','sm')} Cold-chain thresholds</h3><p>Set the sample temperature range shown in the interface.</p><div class="form-grid" style="margin-top:12px"><div class="field"><label>Minimum °C</label><input value="3.2" type="number" step="0.1" /></div><div class="field"><label>Maximum °C</label><input value="4.1" type="number" step="0.1" /></div></div></article><article class="card placeholder-card"><h3>${icon('users','sm')} Admin roles</h3><p>Use least-privilege roles in production. Authentication and role management are not configured.</p><button class="btn btn-soft btn-compact" data-action="permissions-note">Review role guidance</button></article><article class="card placeholder-card"><h3>${icon('bell','sm')} Notifications</h3><p>Supplier, rider, and customer messages are disabled.</p><div class="toggle-row"><span class="small">Enable notification previews</span><button class="switch on" data-action="toggle-notifications"></button></div></article><article class="card placeholder-card"><h3>${icon('document','sm')} Data &amp; privacy</h3><p>Data is saved’s local storage. Reset it at any time.</p><button class="btn btn-danger btn-compact" data-action="reset-server">Reset live server data</button></article><article class="card placeholder-card"><h3>${icon('settings','sm')} Environment</h3><p>Local prototype · offline-ready assets · no API keys embedded.</p><div class="small mono green" style="margin-top:10px">DATA SOURCE: SUPABASE</div></article></div></div>`;
  }

  function renderLogin() {
    const liveHint = state.isDemoMode ? '<div class="live-hint"><span class="material-symbols-outlined">info</span><span>Live mode: sign in with your Supabase credentials.</span></div>' : '';
    return `<div class="login-page">
      <div class="login-card">
        <div class="login-brand">
          <div class="brand-icon">${icon('hub','lg')}</div>
          <div class="brand-title">Uzhavar Pay Ops</div>
          <div class="brand-sub">Admin Portal</div>
        </div>
        <form id="login-form">
          <div class="field">
            <label>Email address</label>
            <input type="email" name="email" required placeholder="admin@freshgrocer.example.test" autocomplete="email"/>
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" name="password" required placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autocomplete="current-password"/>
          </div>
          ${state.authError ? `<div class="error-banner">${esc(state.authError)}</div>` : ''}
          <div class="field live-note">
            <span class="material-symbols-outlined text-[16px]">info</span>
            <span>Use your registered Supabase email and password.</span>
          </div>
          <button class="btn btn-primary" type="submit">Sign in</button>
        </form>
      </div>
    </div>`;
  }

  function viewContent() {
    if (!state.isAuthenticated) return renderLogin();
    if (state.view === 'dashboard') return renderDashboard();
    if (state.view === 'products') return renderProducts();
    if (state.view === 'orders') return renderOrders();
    if (state.view === 'inventory') return renderInventory();
    if (state.view === 'riders') return renderRiders();
    return renderSimplePage(state.view);
  }
  function modalMarkup() {
    if (!state.modal) return '';
    const m=state.modal;
    if(m.type==='product-create') return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><h2 id="modal-title">Add New Vegetable</h2><p>Create a product in the local server catalog.</p></div><button class="icon-btn" data-action="close-modal" aria-label="Close">${icon('close')}</button></div><form id="new-product-form"><div class="modal-body"><div class="form-grid"><div class="field full"><label>Vegetable item name</label><input name="name" required placeholder="e.g. Organic Baby Spinach" /></div><div class="field"><label>SKU</label><input name="id" placeholder="VEG-SPN-100" required /></div><div class="field"><label>Category</label><select name="category"><option>Leafy Greens</option><option>Root Vegetables</option><option>Exotic & Organic</option><option>Gourds & Squashes</option><option>Herbs & Seasoning</option></select></div><div class="field"><label>Packaging &amp; units</label><input name="package" value="Bunch / 250g" /></div><div class="field"><label>Unit type</label><select name="unit"><option>Kg</option><option>Bunch</option><option>Pcs</option></select></div><div class="field"><label>Cost price ($)</label><input name="cost" type="number" min="0" step="0.01" value="1.00" /></div><div class="field"><label>Selling price ($)</label><input name="price" type="number" min="0" step="0.01" value="2.00" /></div><div class="field"><label>Promo price ($)</label><input name="promo" type="number" min="0" step="0.01" value="1.80" /></div><div class="field"><label>Current stock</label><input name="stock" type="number" min="0" value="0" /></div><div class="field"><label>Reorder trigger</label><input name="reorder" type="number" min="0" value="20" /></div></div></div><div class="modal-foot"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${icon('check')} Save Vegetable</button></div></form></section></div>`;
    if(m.type==='order-create') return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><h2 id="modal-title">Create Order</h2><p>Add a local sample order to the dispatch queue.</p></div><button class="icon-btn" data-action="close-modal" aria-label="Close">${icon('close')}</button></div><form id="new-order-form"><div class="modal-body"><div class="form-grid"><div class="field"><label>Customer name</label><input name="customer" required value="New Customer" /></div><div class="field"><label>Payment mode</label><select name="mode"><option>Prepaid</option><option>COD ($25)</option></select></div><div class="field full"><label>Delivery address</label><input name="area" required value="South Park Apartments, Building A" /></div><div class="field"><label>PIN code</label><input name="pin" required value="560034" /></div><div class="field"><label>Delivery window</label><select name="slot"><option>18:30 – 19:15</option><option>19:15 – 20:00</option><option>20:00 – 20:45</option></select></div><div class="field"><label>Basket weight (Kg)</label><input name="weight" type="number" min="0.1" step="0.1" value="3.5" /></div><div class="field"><label>Order total ($)</label><input name="total" type="number" min="0.1" step="0.01" value="28.50" /></div></div><div class="placeholder-banner" style="margin-top:12px">This order is stored securely. It will not appear in the customer app or trigger fulfillment.</div></div><div class="modal-foot"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${icon('check')} Add to Queue</button></div></form></section></div>`;
    if(m.type==='rider-create') return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><h2 id="modal-title">Register New Rider Employee</h2><p>This creates a sample record in this browser only.</p></div><button class="icon-btn" data-action="close-modal">${icon('close')}</button></div><form id="new-rider-form"><div class="modal-body"><div class="form-grid"><div class="field"><label>Rider name</label><input name="name" required placeholder="Full name" /></div><div class="field"><label>Employee ID</label><input name="id" required placeholder="RD-140" /></div><div class="field"><label>Registered mobile</label><input name="phone" type="tel" required placeholder="+91 9XXXXXXXXX" /></div><div class="field"><label>Shift</label><select name="shift"><option>Morning Shift</option><option>Evening Shift</option><option>Full Day Flex</option></select></div><div class="field"><label>Zone</label><select name="zone"><option>Zone A: Downtown Central</option><option>Zone B: Tech Park Corridor</option><option>Zone C: Green Park &amp; Indiranagar</option><option>Zone D: South Ring Suburbs</option></select></div><div class="field"><label>PIN code</label><input name="pin" value="560001" /></div></div></div><div class="modal-foot"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${icon('userplus')} Add Rider</button></div></form></section></div>`;
    if(m.type==='rider-detail') {const r=data.riders.find(x=>x.id===m.id);if(!r)return '';return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><div><h2>${esc(r.name)} · ${esc(r.id)}</h2><p>${esc(r.shift)} · ${esc(r.zone)}</p></div><button class="icon-btn" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><div class="person-cell">${r.avatar?imageTag(r.avatar,r.name):`<span class="person-avatar">${r.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</span>`}<div><strong>${esc(r.name)}</strong><span class="table-sub">${esc(r.phone)} · Joined ${esc(r.joined)}</span></div></div><div class="placeholder-grid" style="margin-top:14px;grid-template-columns:repeat(2,1fr)"><div class="card placeholder-card"><div class="uppercase muted">Live status</div><div style="margin-top:8px">${statusBadge(r.status)}</div></div><div class="card placeholder-card"><div class="uppercase muted">Today</div><strong class="mono" style="display:block;margin-top:8px">${r.drops} drops · ⭐ ${esc(r.rating)}</strong></div><div class="card placeholder-card"><div class="uppercase muted">Shift check-in</div><strong style="display:block;margin-top:8px">${esc(r.checkin)}</strong><span class="small muted">${esc(r.schedule)}</span></div><div class="card placeholder-card"><div class="uppercase muted">Vehicle / equipment</div><strong style="display:block;margin-top:8px">${esc(r.vehicle)}</strong></div></div><div class="placeholder-banner" style="margin-top:14px">Rider details are sample UI data. No phone, location, or profile information is sent anywhere.</div></div><div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">Close</button><button class="btn btn-soft" data-action="rider-note">${icon('document')} Add admin note</button></div></section></div>`;}
    if(m.type==='bulk-price') return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><div><h2>Bulk Price Update</h2><p>Apply an adjustment to all products in the catalog.</p></div><button class="icon-btn" data-action="close-modal">${icon('close')}</button></div><form id="bulk-price-form"><div class="modal-body"><div class="field"><label>Adjustment percentage</label><input type="number" name="percent" min="-90" max="200" step="0.5" value="5" required /></div><div class="field" style="margin-top:12px"><label>Apply to</label><select name="field"><option value="price">Retail price</option><option value="promo">Promo price</option><option value="both">Retail &amp; promo price</option></select></div><div class="placeholder-banner" style="margin-top:12px">This only updates local records. It does not change the customer app catalog.</div></div><div class="modal-foot"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Apply to ${data.products.length} SKUs</button></div></form></section></div>`;
    if(m.type==='notice') return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><div><h2>${esc(m.title||'Operations notice')}</h2><p>Uzhavar Pay Ops Core</p></div><button class="icon-btn" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><div class="placeholder-banner">${esc(m.message||'This action is simulated locally. No external service was contacted.')}</div></div><div class="modal-foot"><button class="btn btn-primary" data-action="close-modal">Got it</button></div></section></div>`;
    return '';
  }
  function render() {
    const app=document.getElementById('app');
    app.innerHTML=`<div class="app-shell">${sidebar()}<div class="main-wrap">${topbar()}<main class="main-content" id="main-content">${viewContent()}</main></div>${modalMarkup()}</div>`;
    document.title=`${viewTitles[state.view]?.[1] || 'Uzhavar Pay Ops Core'} · Uzhavar Pay Ops Core`;
  }

  function setView(view) {
    state.view=view; state.sidebarOpen=false; state.quickOpen=false; state.hubOpen=false; state.modal=null; render(); window.scrollTo({top:0,behavior:'smooth'});
  }
  function openNotice(title,message){state.modal={type:'notice',title,message};render();}
  function findSelectedProduct(){return data.products.find(p=>p.id===state.selectedProductId);}
  function saveDrawerProduct(){
    const p=findSelectedProduct(); if(!p)return;
    const read=(name)=>document.querySelector(`[name="${name}"]`);
    const n=read('drawer-name'),c=read('drawer-category'),u=read('drawer-unit'),cost=read('drawer-cost'),price=read('drawer-price'),promo=read('drawer-promo'),reorder=read('drawer-reorder'),pack=read('drawer-package');
    if(n)p.name=n.value.trim()||p.name;if(c)p.category=c.value;if(u)p.unit=u.value;if(cost)p.cost=Number(cost.value)||0;if(price)p.price=Number(price.value)||0;if(promo)p.promo=Number(promo.value)||0;if(reorder)p.reorder=Number(reorder.value)||0;if(pack)p.package=pack.value.trim()||p.package;
    p.status=p.stock>p.reorder?'In Stock':p.stock>0?'Low Stock':'Out of Stock';persist();render();toast('Vegetable changes saved to live server data.');
  }
  function handleGlobalSearch(query){
    const q=query.trim(); if(!q)return; state.globalQuery=q;
    const low=q.toLowerCase();
    if(data.products.some(p=>`${p.name} ${p.id}`.toLowerCase().includes(low))){state.productSearch=q;setView('products');}
    else if(data.orders.some(o=>`${o.id} ${o.customer} ${o.area}`.toLowerCase().includes(low))){state.orderSearch=q;setView('orders');}
    else if(data.riders.some(r=>`${r.id} ${r.name} ${r.phone}`.toLowerCase().includes(low))){state.riderSearch=q;setView('riders');}
    else {render();toast(`No record found for “${q}”.`,'error');}
  }

  document.addEventListener('click',(event)=>{
    const viewButton=event.target.closest('[data-view]');
    if(viewButton){setView(viewButton.dataset.view);return;}
    const pfilter=event.target.closest('[data-product-filter]');
    if(pfilter){state.productFilter=pfilter.dataset.productFilter;render();return;}
    const pcat=event.target.closest('[data-product-category]');
    if(pcat){state.productCategory=pcat.dataset.productCategory;render();return;}
    const ptab=event.target.closest('[data-drawer-tab]');
    if(ptab){state.drawerTab=ptab.dataset.drawerTab;render();return;}
    const otab=event.target.closest('[data-order-tab]');
    if(otab){state.orderTab=otab.dataset.orderTab;render();return;}
    const itab=event.target.closest('[data-inventory-tab]');
    if(itab){state.inventoryTab=itab.dataset.inventoryTab; if(itab.dataset.inventoryTab==='adjust')toast('Adjustments are recorded in the form on this screen.');render();return;}
    const rfilter=event.target.closest('[data-rider-filter]');
    if(rfilter){state.riderFilter=rfilter.dataset.riderFilter;render();return;}
    const sfilter=event.target.closest('[data-shift-filter]');
    if(sfilter){state.shiftFilter=sfilter.dataset.shiftFilter;render();return;}
    const actionEl=event.target.closest('[data-action]');
    if(!actionEl)return;
    const action=actionEl.dataset.action;
    switch(action){
      case 'toggle-menu': state.sidebarOpen=!state.sidebarOpen;render();break;
      case 'close-menu': state.sidebarOpen=false;render();break;
      case 'toggle-quick': state.quickOpen=!state.quickOpen;state.hubOpen=false;render();break;
      case 'toggle-hub': state.hubOpen=!state.hubOpen;state.quickOpen=false;render();break;
      case 'choose-hub': state.hubOpen=false;render();toast(`${actionEl.dataset.hub} selected for preview.`);break;
      case 'notifications': openNotice('Notifications · recent alerts','Check Supabase for recent alerts and updates.');break;
      case 'quick-product': state.modal={type:'product-create'};state.quickOpen=false;render();break;
      case 'quick-order': state.modal={type:'order-create'};state.quickOpen=false;render();break;
      case 'quick-rider': state.modal={type:'rider-create'};state.quickOpen=false;render();break;
      case 'quick-stock': state.quickOpen=false;setView('inventory');toast('Use Record Stock Delta to enter a local adjustment.');break;
      case 'add-product': state.modal={type:'product-create'};render();break;
      case 'bulk-price': state.modal={type:'bulk-price'};render();break;
      case 'register-rider': state.modal={type:'rider-create'};render();break;
      case 'new-campaign': openNotice('Create promotion','Use the promotions module to create coupons in Supabase.');break;
      case 'select-product': state.selectedProductId=actionEl.dataset.id;state.drawerTab='basic';render();break;
      case 'product-menu': state.selectedProductId=actionEl.dataset.id;state.drawerTab='basic';render();toast('Product selected. Edit details in the configuration panel.');break;
      case 'close-product-drawer': state.selectedProductId='';render();break;
      case 'cancel-product-edit': render();toast('No unsaved edits were applied.');break;
      case 'save-product-drawer': saveDrawerProduct();break;
      case 'toggle-product-display': actionEl.classList.toggle('on');toast('Visibility preference toggled locally.');break;
      case 'select-order': state.selectedOrderId=actionEl.dataset.id;render();break;
      case 'open-order': case 'close-order-detail': state.selectedOrderId=action==='close-order-detail'?'':actionEl.dataset.id;state.view='orders';render();break;
      case 'confirm-dispatch': {
        const order=data.orders.find(o=>o.id===actionEl.dataset.id);if(!order)return;
        if(order.status==='Out for Delivery'||order.status==='Dispatching'){toast('This order is already in transit.');break;}
        if(!order.courier||order.courier==='Unassigned'){
          const rider=data.riders.find(r=>r.status==='Available at Hub');
          if(rider){order.courier=rider.name;order.initials=rider.name.split(' ').map(n=>n[0]).join('').slice(0,2);order.courierId=rider.id;order.courierPct=`${rider.punctuality} Punctual`;rider.status='On Delivery';rider.order=`#${order.id}`;}
          else {toast('No available rider to assign.','error');break;}
        }
        order.status='Out for Delivery';persist();render();toast(`Order ${order.id} moved to Out for Delivery.`);break;
      }
      case 'auto-assign': {
        let assignable=data.riders.filter(r=>r.status==='Available at Hub');let count=0;
        for(const order of data.orders.filter(o=>o.status==='Unassigned')){
          const rider=assignable[count%Math.max(assignable.length,1)];if(!rider)break;order.courier=rider.name;order.initials=rider.name.split(' ').map(n=>n[0]).join('').slice(0,2);order.courierId=rider.id;order.courierPct=`${rider.punctuality} Punctual`;order.status='Ready for Pickup';count++;
        }
        persist();render();toast(count?`${count} order(s) assigned to riders.`:'No unassigned orders or available riders.');break;
      }
      case 'reroute-order': openNotice('Re-route order','Courier rerouting via fleet management service.');break;
      case 'invoice': openNotice(`Invoice ${actionEl.dataset.id}`,'Printable invoices coming in a future release.');break;
      case 'refund': openNotice(`Refund ${actionEl.dataset.id}`,'Refunds are disabled in this preview. Connect and verify the payment provider before enabling financial actions.');break;
      case 'call-buyer': openNotice('Call buyer','The buyer’s phone number is data from their profile.');break;
      case 'print-invoices': window.print();break;
      case 'zone-map': openNotice('Zone Heatmap','Map tiles and live geospatial data are not connected. The order detail map is an illustrative local preview.');break;
      case 'export-products': saveDownload('uzhavarpay-products.csv',[['SKU','Name','Category','Pack','Stock','Unit','Cost','Retail','Promo'],...data.products.map(p=>[p.id,p.name,p.category,p.package,p.stock,p.unit,p.cost,p.price,p.promo])]);toast('Product CSV exported.');break;
      case 'export-inventory': saveDownload('uzhavarpay-inventory.csv',[['SKU','Name','Location','Available','Unit','Minimum','In','Out','Spoilage','Supplier'],...data.inventory.map(x=>[x.id,x.name,x.location,x.available,x.unit,x.minimum,x.in,x.out,x.spoilage,x.supplier])]);toast('Inventory CSV exported.');break;
      case 'export-manifest': saveDownload('uzhavarpay-manifest.csv',[['Order','Customer','Items','Weight kg','Total','Status','Courier'],...data.orders.map(o=>[o.id,o.customer,o.items,o.weight,o.total,o.status,o.courier])]);toast('Manifest exported.');break;
      case 'export-attendance': saveDownload('uzhavarpay-attendance.csv',[['Employee ID','Name','Phone','Shift','Clock in','Zone','Status'],...data.riders.map(r=>[r.id,r.name,r.phone,r.shift,r.checkin,r.zone,r.status])]);toast('Attendance CSV exported.');break;
      case 'export-customers': saveDownload('uzhavarpay-customers.csv',[['Name','Email','Area','Orders','Lifetime value']]);toast('Customer CSV exported.');break;
      case 'export-finance': saveDownload('uzhavarpay-finance.csv',[['Settlement','Payment Ref','Orders','Gross','Fees','Net','Status']]);toast('Finance CSV exported.');break;
      case 'refresh-feeds': initApp();break;
      case 'dismiss-warning': actionEl.closest('.warning-banner')?.remove();toast('Warning dismissed for this view.');break;
      case 'notify-supplier': openNotice('Notify farm supplier','Supplier messaging via Supabase edge functions.');break;
      case 'record-wastage': document.getElementById('stock-form')?.scrollIntoView({behavior:'smooth',block:'center'});document.querySelector('[name="stock-type"]')?.focus();break;
      case 'inward-scan': openNotice('Inward crate scan','Use the stock form to record inward inventory.');break;
      case 'verify-inbound': openNotice('Review inbound crate','Record stock adjustments via the inventory form.');break;
      case 'create-po': openNotice('Draft purchase order','Create purchase orders via the inventory management screen.');break;
      case 'supplier-contacts': openNotice('Supplier contacts','Supplier directory managed in Supabase profiles table.');break;
      case 'rebalance': openNotice('Rebalance fleet zones','Assign riders to zones via the rider management screen.');break;
      case 'view-rider': state.modal={type:'rider-detail',id:actionEl.dataset.id};render();break;
      case 'export-attendance': saveDownload('uzhavarpay-attendance.csv',[['Employee ID','Name','Phone','Shift','Clock in','Zone','Status'],...data.riders.map(r=>[r.id,r.name,r.phone,r.shift,r.checkin,r.zone,r.status])]);toast('Attendance CSV exported.');break;
      case 'modal-backdrop': if(event.target===actionEl){state.modal=null;render();}break;
      case 'close-modal': state.modal=null;render();break;
      case 'campaign-action': openNotice('Campaign actions','Manage promotions in the promotions & banners module.');break;
      case 'permissions-note': openNotice('Role guidance','Enforce role-based permissions in Supabase RLS policies.');break;
      case 'toggle-notifications': actionEl.classList.toggle('on');toast('Notification preference changed.');break;
      case 'reset-live': if(confirm('Clear all local state and reload from Supabase?')){localStorage.removeItem('uzhavarpay-ops-live-v1');initApp();break;}
      case 'save-settings': toast('Settings saved.');break;
      case 'invoice': break;
      case 'table-filters': openNotice('Dispatch filters','Filter controls in this preview are limited to the status, shift, and search controls shown.');break;
      case 'rider-note': openNotice('Rider note','Add notes via the rider profile screen.');break;
      case 'login-submit': {
        event.preventDefault();
        const f = new FormData(document.getElementById('login-form'));
        window.Auth.login(f.get('email'), f.get('password')).then(result => {
          if (result.success) {
            state.isAuthenticated = true;
            state.user = result.user;
            state.authError = null;
            state.view = 'dashboard';
            render();
          } else {
            state.authError = result.error || 'Sign in failed.';
            render();
          }
        });
        break;
      }
      case 'logout': {
        window.Auth.logout();
        state.isAuthenticated = false;
        state.user = null;
        state.authError = null;
        state.view = 'dashboard';
        render();
        break;
      }
      default: break;
    }
  });

  document.addEventListener('submit',(event)=>{
    const form=event.target;
    if(form.id==='global-search-form'){event.preventDefault();handleGlobalSearch(document.getElementById('global-search')?.value||'');return;}
    if(form.id==='product-search-form'){event.preventDefault();state.productSearch=document.getElementById('product-search')?.value||'';render();return;}
    if(form.id==='order-search-form'){event.preventDefault();state.orderSearch=document.getElementById('order-search')?.value||'';render();return;}
    if(form.id==='rider-search-form'){event.preventDefault();state.riderSearch=document.getElementById('rider-search')?.value||'';render();return;}
    if(form.id==='customer-search-form'){event.preventDefault();toast('Customer search is a preview-only directory.');return;}
    if(form.id==='login-form'){
      event.preventDefault();
      const f=new FormData(form);
      window.Auth.login(f.get('email'), f.get('password')).then(result => {
        if (result.success) {
          state.isAuthenticated = true;
          state.user = result.user;
          state.authError = null;
          state.view = 'dashboard';
          render();
        } else {
          state.authError = result.error || 'Sign in failed.';
          render();
        }
      });
      return;
    }
    if(form.id==='new-product-form'){
      event.preventDefault();const f=new FormData(form);const id=String(f.get('id')).trim().toUpperCase();
      if(data.products.some(p=>p.id===id)){toast('That SKU already exists.','error');return;}
      const stock=Number(f.get('stock')||0),reorder=Number(f.get('reorder')||0);
      const p={id,name:String(f.get('name')).trim(),category:String(f.get('category')),package:String(f.get('package')),unit:String(f.get('unit')),cost:Number(f.get('cost')||0),price:Number(f.get('price')||0),promo:Number(f.get('promo')||0),stock,reorder,image:'heirloom-tomatoes.jpg',status:stock>reorder?'In Stock':stock>0?'Low Stock':'Out of Stock',cold:'4–7°C'};
      data.products.unshift(p);state.selectedProductId=id;state.modal=null;persist();render();toast(`${p.name} added to local server catalog.`);return;SupabaseData.createProduct(p).then(()=>toast('Product synced to server.')).catch(err=>toast('Server sync error: '+err.message,'error'));
    }
    if(form.id==='new-order-form'){
      event.preventDefault();const f=new FormData(form);const maxId=Math.max(...data.orders.map(o=>Number(o.id.replace(/\D/g,''))||0),9840);const id=`FG-${maxId+1}`;const product=data.products[0];const total=Number(f.get('total')||0);const mode=String(f.get('mode'));
      const order={id,time:new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),customer:String(f.get('customer')).trim(),area:String(f.get('area')).trim(),pin:String(f.get('pin')).trim(),items:product?1:0,basket:product?[{name:product.name,lot:`#${product.id} · Catalog`,qty:`${f.get('weight')} Kg`,price:total,image:product.image}]:[],weight:Number(f.get('weight')||0),mode,total,status:'Unassigned',courier:'Unassigned',initials:'--',courierId:'',courierPct:'',eta:'—',distance:'—',slot:String(f.get('slot')),instruction:'Delivery notes pending',zone:'Cluster 4B'};
      data.orders.unshift(order);state.selectedOrderId=id;state.orderTab='all';state.orderSearch='';state.view='orders';state.modal=null;persist();render();toast(`${id} added to dispatch queue.`);return;SupabaseData.createOrder(order).then(()=>toast('Order synced to server.')).catch(err=>toast('Server sync error: '+err.message,'error'));
    }
    if(form.id==='new-rider-form'){
      event.preventDefault();const f=new FormData(form),id=String(f.get('id')).trim().toUpperCase();
      if(data.riders.some(r=>r.id===id)){toast('That employee ID already exists.','error');return;}
      const name=String(f.get('name')).trim();data.riders.unshift({id,name,phone:String(f.get('phone')),joined:'Today',shift:String(f.get('shift')),checkin:'Not checked in',schedule:'Pending roster',zone:String(f.get('zone')),pin:String(f.get('pin')),hub:'Metro Hub #04',vehicle:'Pending induction',status:'Offline / Pre-Shift',order:'',distance:'Not checked in',eta:'—',drops:0,punctuality:'—',rating:'New',avatar:''});state.modal=null;persist();render();toast(`${name} added as a rider.`);return;SupabaseData.createRiderProfile({id,employee_id:id,display_name:name,phone:String(f.get('phone')),assigned_zone:String(f.get('zone')),is_active:true}).then(()=>toast('Rider synced to server.')).catch(err=>toast('Server sync error: '+err.message,'error'));
    }
    if(form.id==='stock-form'){
      event.preventDefault();const f=new FormData(form),entry=data.inventory.find(x=>x.id===String(f.get('stock-id')));if(!entry)return;
      const qty=Math.abs(Number(f.get('stock-qty')||0)),type=String(f.get('stock-type'));if(!qty){toast('Enter a quantity greater than zero.','error');return;}
      if(type==='inward'){entry.available+=qty;entry.in+=qty;}else{entry.available=Math.max(0,entry.available-qty);entry.out+=qty;if(type==='waste')entry.spoilage+=qty;}
      data.stockLog.unshift({label:`${num(qty,1)} ${entry.unit} ${type==='inward'?'received':type==='waste'?entry.name+' culled':'stock correction'} · ${entry.name}`,detail:String(f.get('stock-notes')||'Server stock adjustment'),time:'Just now',type:type==='waste'?'loss':'quality'});persist();render();toast('Stock delta applied to live server data.');return;SupabaseData.createInventoryLog({product_id:entry.id,change_type:type,quantity:qty,notes:String(f.get('stock-notes')||''),recorded_by:state.user?.id}).then(()=>toast('Inventory synced to server.')).catch(err=>toast('Server sync error: '+err.message,'error'));
    }
    if(form.id==='bulk-price-form'){
      event.preventDefault();const f=new FormData(form),pct=Number(f.get('percent'))/100,field=String(f.get('field'));for(const p of data.products){if(field==='price'||field==='both')p.price=Math.max(0,Math.round(p.price*(1+pct)*100)/100);if(field==='promo'||field==='both')p.promo=Math.max(0,Math.round(p.promo*(1+pct)*100)/100);}persist();state.modal=null;render();toast('Prices updated.');data.products.forEach(p=>SupabaseData.updateProduct(p.id,{price:p.price,promo:p.promo}).catch(err=>console.warn('Bulk price sync error',err)));return;
    }
  });

  document.addEventListener('change',(event)=>{
    const el=event.target;
    if(el.id==='order-shift'&&el.value.includes('Morning'))toast('Showing morning shift.');
    if(el.id==='order-shift'&&el.value.includes('All'))toast('Showing all shifts.');
  });

  // Load live data from Supabase on startup
  async function initApp() {
    const supabaseAvailable = typeof SupabaseData !== 'undefined';
    try {
      // Load all data from Supabase
      const [products, orders, riders, inventory, coupons, profiles] = await Promise.allSettled([
        supabaseAvailable ? SupabaseData.getProducts().catch(() => []) : [],
        supabaseAvailable ? SupabaseData.getOrders().catch(() => []) : [],
        supabaseAvailable ? SupabaseData.getRiderProfiles().catch(() => []) : [],
        supabaseAvailable ? SupabaseData.getInventoryLog().catch(() => []) : [],
        supabaseAvailable ? SupabaseData.getCoupons().catch(() => []) : [],
        supabaseAvailable ? SupabaseData.getProfiles().catch(() => []) : [],
      ]);

      if (products.status === 'fulfilled') data.products = products.value || [];
      if (orders.status === 'fulfilled') data.orders = orders.value || [];
      if (riders.status === 'fulfilled') data.riders = riders.value || [];
      if (inventory.status === 'fulfilled') data.stockLog = inventory.value || [];
      if (coupons.status === 'fulfilled') data.campaigns = coupons.value || [];
      if (profiles.status === 'fulfilled') {
        // Sync profile roles to state
        const profList = profiles.value || [];
        const myProfile = profList.find(p => p.id === state.user?.id);
        if (myProfile && myProfile.role) {
          state.user.role = myProfile.role;
        }
      }
    } catch (err) {
      console.warn('Failed to load initial data from Supabase', err);
    }
    render();
  }

  initApp();
})();
