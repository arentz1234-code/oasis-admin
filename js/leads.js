// Oasis Admin Portal - Leads Logic

let supabase = null;
let leads = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Check if logged in
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize Supabase
    if (!CONFIG.USE_MOCK) {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        } else {
            console.error('Supabase library not loaded properly!');
        }
    }

    // Load leads
    await loadLeads();

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
    document.getElementById('refresh-btn').addEventListener('click', loadLeads);

    // Search
    document.getElementById('search-input').addEventListener('input', filterLeads);

    // Status filter
    document.getElementById('status-filter').addEventListener('change', filterLeads);
}

// Filter leads based on search and status
function filterLeads() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const status = document.getElementById('status-filter').value;

    const filtered = leads.filter(lead => {
        const matchesQuery =
            (lead.company || '').toLowerCase().includes(query) ||
            (lead.industry || '').toLowerCase().includes(query) ||
            (lead.location || '').toLowerCase().includes(query) ||
            (lead.email || '').toLowerCase().includes(query);

        const matchesStatus = !status || lead.status === status;

        return matchesQuery && matchesStatus;
    });

    renderLeads(filtered);
}

// Load leads from Supabase
async function loadLeads() {
    showLoading(true);

    try {
        if (!supabase) {
            console.error('Supabase client not initialized!');
            leads = [];
        } else {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            leads = data || [];
        }

        renderLeads(leads);
        updateStats(leads);
    } catch (error) {
        console.error('Error loading leads:', error);
        leads = [];
        renderLeads([]);
    }

    showLoading(false);
}

// Render leads table
function renderLeads(leadsToRender) {
    const tbody = document.getElementById('leads-tbody');
    const emptyState = document.getElementById('empty-state');
    const table = document.querySelector('.sites-table');

    if (leadsToRender.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        table.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    table.style.display = 'table';

    tbody.innerHTML = leadsToRender.map(lead => `
        <tr>
            <td class="business-name">
                <div>
                    <strong>${escapeHtml(lead.company)}</strong>
                    ${lead.website ? `<br><a href="${escapeHtml(lead.website)}" target="_blank" style="font-size:0.8em;color:#6b7280;">${shortenUrl(lead.website)}</a>` : ''}
                </div>
            </td>
            <td>${escapeHtml(lead.industry || 'N/A')}</td>
            <td>${escapeHtml(lead.location || 'N/A')}</td>
            <td>
                ${lead.email ? `<a href="mailto:${escapeHtml(lead.email)}" style="color:#3b82f6;">${escapeHtml(lead.email)}</a>` : ''}
                ${lead.phone ? `<br><span style="font-size:0.85em;color:#6b7280;">${escapeHtml(lead.phone)}</span>` : ''}
            </td>
            <td>
                <span class="score-badge ${getScoreClass(lead.score)}" title="${(lead.score_reasons || []).join(', ')}">
                    ${lead.score || 0}
                </span>
            </td>
            <td>
                <span class="status-badge ${lead.status || 'new'}">
                    <span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span>
                    ${formatStatus(lead.status)}
                </span>
            </td>
            <td>
                ${lead.demo_url ? `<a href="${escapeHtml(lead.demo_url)}" target="_blank" class="btn-small">View Demo</a>` : '<span style="color:#9ca3af;">-</span>'}
            </td>
            <td>
                <div class="action-buttons">
                    ${lead.website ? `
                    <button class="btn-action" onclick="window.open('${escapeHtml(lead.website)}', '_blank')" title="Visit website">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                    </button>
                    ` : ''}
                    <button class="btn-action" onclick="updateLeadStatus('${lead.id}')" title="Update status">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update stats cards
function updateStats(leads) {
    const total = leads.length;
    const hot = leads.filter(l => (l.score || 0) >= 70).length;
    const newLeads = leads.filter(l => l.status === 'new' || !l.status).length;
    const demoSent = leads.filter(l => l.status === 'demo_sent' || l.demo_url).length;

    document.getElementById('total-leads').textContent = total;
    document.getElementById('hot-leads').textContent = hot;
    document.getElementById('new-leads').textContent = newLeads;
    document.getElementById('demo-sent').textContent = demoSent;
}

// Update lead status
async function updateLeadStatus(leadId) {
    const statuses = ['new', 'contacted', 'demo_sent', 'interested', 'closed', 'not_interested'];
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const currentIndex = statuses.indexOf(lead.status || 'new');
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    try {
        const { error } = await supabase
            .from('leads')
            .update({ status: newStatus })
            .eq('id', leadId);

        if (error) throw error;

        // Update local state
        lead.status = newStatus;
        renderLeads(leads);
        updateStats(leads);
    } catch (error) {
        console.error('Error updating lead:', error);
        alert('Failed to update lead status');
    }
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

function getScoreClass(score) {
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
}

function formatStatus(status) {
    const statusMap = {
        'new': 'New',
        'contacted': 'Contacted',
        'demo_sent': 'Demo Sent',
        'interested': 'Interested',
        'closed': 'Closed',
        'not_interested': 'Not Interested'
    };
    return statusMap[status] || 'New';
}
