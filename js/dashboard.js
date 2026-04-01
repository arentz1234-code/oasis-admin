// Oasis Admin Portal - Dashboard Logic

let supabase = null;
let sites = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Check if logged in
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize Supabase if configured
    console.log('USE_MOCK:', CONFIG.USE_MOCK);
    console.log('Supabase available:', typeof window.supabase);
    if (!CONFIG.USE_MOCK) {
        // UMD build exposes supabase.createClient directly
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            console.log('Supabase client initialized (UMD)');
        } else {
            console.error('Supabase library not loaded properly!');
            console.log('window.supabase:', window.supabase);
        }
    } else {
        console.log('Using mock data');
    }

    // Load sites
    await loadSites();

    // Setup event listeners
    setupEventListeners();
});

// Check if user is logged in
function isLoggedIn() {
    const sessionData = localStorage.getItem(CONFIG.SESSION_KEY);
    if (!sessionData) return false;

    try {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        const elapsed = now - session.timestamp;
        return session.loggedIn && elapsed < CONFIG.SESSION_DURATION;
    } catch (e) {
        return false;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem(CONFIG.SESSION_KEY);
        window.location.href = 'index.html';
    });

    // Refresh
    document.getElementById('refresh-btn').addEventListener('click', loadSites);

    // Search
    document.getElementById('search-input').addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        renderSites(sites.filter(site =>
            (site.business_name || '').toLowerCase().includes(query) ||
            (site.location || '').toLowerCase().includes(query) ||
            (site.deployment_url || '').toLowerCase().includes(query)
        ));
    });
}

// Load sites from Supabase or mock data
async function loadSites() {
    showLoading(true);

    try {
        if (CONFIG.USE_MOCK) {
            // Use mock data
            console.log('Loading mock data');
            sites = MOCK_SITES;
        } else if (!supabase) {
            console.error('Supabase client not initialized!');
            sites = [];
        } else {
            // Fetch from Supabase
            console.log('Fetching from Supabase...');
            console.log('Supabase client:', supabase);
            const response = await supabase
                .from('sites')
                .select('*')
                .order('created_at', { ascending: false });

            console.log('Full response:', response);
            const { data, error } = response;

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            console.log('Received data:', data);
            sites = data || [];
        }

        console.log('Rendering', sites.length, 'sites');
        renderSites(sites);
        updateStats(sites);
    } catch (error) {
        console.error('Error loading sites:', error);
        sites = [];
        renderSites([]);
    }

    showLoading(false);
}

// Render sites table
function renderSites(sitesToRender) {
    const tbody = document.getElementById('sites-tbody');
    const emptyState = document.getElementById('empty-state');
    const table = document.querySelector('.sites-table');

    if (sitesToRender.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        table.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    table.style.display = 'table';

    tbody.innerHTML = sitesToRender.map(site => `
        <tr>
            <td class="business-name">${escapeHtml(site.business_name)}</td>
            <td class="deployment-url">
                <a href="${escapeHtml(site.deployment_url)}" target="_blank">
                    ${shortenUrl(site.deployment_url)}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                </a>
            </td>
            <td class="date">${formatDate(site.created_at)}</td>
            <td class="location">${escapeHtml(site.location || 'N/A')}</td>
            <td>
                <span class="status-badge ${site.status}">
                    <span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span>
                    ${site.status === 'live' ? 'Live' : 'Pending'}
                </span>
            </td>
            <td>
                ${site.internal_views !== undefined ? `
                <div class="view-counts">
                    <span class="view-badge internal" title="Your team's views">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        ${site.internal_views || 0}
                    </span>
                    <span class="view-badge client ${(site.client_views || 0) > 0 ? 'has-views' : ''}" title="Client views">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        ${site.client_views || 0}
                    </span>
                </div>
                ` : `
                <span class="viewed-badge ${site.viewed ? 'yes' : 'no'}">
                    ${site.viewed ? 'Yes (' + (site.view_count || 1) + ')' : 'Not yet'}
                </span>
                `}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action" onclick="window.open('${escapeHtml(site.deployment_url)}', '_blank')" title="Visit site">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="btn-action" onclick="window.open('${escapeHtml(site.github_url || '#')}', '_blank')" title="View GitHub">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                        </svg>
                    </button>
                    <button class="btn-action" onclick="copyToClipboard('${escapeHtml(site.deployment_url)}')" title="Copy URL">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update stats cards
function updateStats(sites) {
    const total = sites.length;
    // Check if new columns exist, otherwise use old viewed field
    const viewed = sites.filter(s =>
        s.client_views !== undefined ? (s.client_views || 0) > 0 : s.viewed
    ).length;
    const pending = sites.filter(s => s.status === 'pending').length;
    const emailsSent = sites.filter(s => s.email_sent).length;

    document.getElementById('total-sites').textContent = total;
    document.getElementById('viewed-sites').textContent = viewed;
    document.getElementById('pending-sites').textContent = pending;
    document.getElementById('emails-sent').textContent = emailsSent;
}

// Show/hide loading state
function showLoading(show) {
    const loading = document.getElementById('loading-state');
    const table = document.querySelector('.sites-table');
    const empty = document.getElementById('empty-state');

    if (show) {
        loading.style.display = 'block';
        table.style.display = 'none';
        empty.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

// Helper functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function shortenUrl(url) {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Could add a toast notification here
        alert('URL copied to clipboard!');
    });
}