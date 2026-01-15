const API_BASE = '/api/v1';

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupEventListeners();
});

function setupEventListeners() {
    const btnRunAudit = document.getElementById('btn-run-audit');
    const btnSyncGithub = document.getElementById('btn-sync-github');
    const inputOwner = document.getElementById('repo-owner');
    const inputName = document.getElementById('repo-name');

    if (btnSyncGithub) {
        btnSyncGithub.addEventListener('click', async () => {
            const owner = inputOwner.value.trim();
            const name = inputName.value.trim();
            
            if (!owner || !name) {
                alert('Please enter both Repository Owner and Name');
                return;
            }

            btnSyncGithub.disabled = true;
            btnSyncGithub.textContent = 'Syncing...';
            
            try {
                const response = await fetch(`${API_BASE}/issues/fetch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ repository: { owner, name } })
                });
                
                if (!response.ok) throw new Error('Sync failed');
                
                let data = [];
                try {
                    data = await response.json();
                } catch (e) { }

                alert(`Successfully synced issues from ${owner}/${name}`);
                
            } catch (error) {
                console.error('Sync error:', error);
                alert('Failed to sync issues from GitHub. Check inputs or server logs.');
            } finally {
                btnSyncGithub.disabled = false;
                btnSyncGithub.textContent = 'Sync Issues';
            }
        });
    }

    if (btnRunAudit) {
        btnRunAudit.addEventListener('click', async () => {
            btnRunAudit.disabled = true;
            btnRunAudit.textContent = 'Running...';
            try {
                const response = await fetch(`${API_BASE}/audits/issues`, { method: 'POST' });
                if (!response.ok) throw new Error('Audit failed');
                await initDashboard(); 
            } catch (error) {
                console.error('Audit execution error:', error);
                alert('Failed to execute audit');
            } finally {
                btnRunAudit.disabled = false;
                btnRunAudit.textContent = 'Run Audit';
            }
        });
    }
}

async function initDashboard() {
    try {
        const allAudits = await fetchData(`${API_BASE}/audits?limit=50`);
        const audits = allAudits.filter(a => !a.auditId.startsWith('audit-weather-'));
        
        audits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        updateStats(audits);
        renderCharts(audits);
        renderRecentActivity(audits);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        document.getElementById('stat-last-result').textContent = 'Error loading data';
    }
}

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return await response.json();
}

function updateStats(audits) {
    if (!audits || audits.length === 0) {
        document.getElementById('stat-last-result').textContent = 'No Data';
        document.getElementById('stat-last-time').textContent = 'Run an audit to see results';
        return;
    }

    const lastAudit = audits[0];
    const totalAudits = audits.length;
    const compliantCount = audits.filter(a => a.compliant).length;
    
    const complianceRate = Math.round((compliantCount / totalAudits) * 100);
    
    const totalRatio = audits.reduce((sum, a) => sum + (a.metadata?.ratioWithBugInTitle || 0), 0);
    const avgRatio = ((totalRatio / totalAudits) * 100).toFixed(1);

    const resultEl = document.getElementById('stat-last-result');
    resultEl.textContent = lastAudit.compliant ? 'PASSED' : 'FAILED';
    resultEl.className = `stat-value ${lastAudit.compliant ? 'text-green' : 'text-red'}`;
    resultEl.style.color = lastAudit.compliant ? '#16a34a' : '#dc2626';

    document.getElementById('stat-last-time').textContent = new Date(lastAudit.createdAt).toLocaleString();
    document.getElementById('stat-compliance-rate').textContent = `${complianceRate}%`;
    document.getElementById('stat-avg-bug-ratio').textContent = `${avgRatio}%`;
    document.getElementById('stat-total-audits').textContent = totalAudits;
}

function renderCharts(audits) {
    const historyCanvas = document.getElementById('chart-history');
    const compositionCanvas = document.getElementById('chart-composition');

    if (Chart.getChart(historyCanvas)) Chart.getChart(historyCanvas).destroy();
    if (Chart.getChart(compositionCanvas)) Chart.getChart(compositionCanvas).destroy();

    if (!audits || audits.length === 0) return;

    const historyData = [...audits].reverse();
    const labels = historyData.map(a => new Date(a.createdAt).toLocaleDateString());
    const ratioData = historyData.map(a => (a.metadata?.ratioWithBugInTitle || 0) * 100);

    if (historyCanvas) {
        new Chart(historyCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bug Ratio (%)',
                    data: ratioData,
                    borderColor: 'oklch(0.205 0 0)',
                    backgroundColor: 'oklch(0.205 0 0 / 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }

    const lastAudit = audits[0];
    const ratioVal = (lastAudit.metadata?.ratioWithBugInTitle || 0) * 100;
    const remainder = 100 - ratioVal;

    if (compositionCanvas) {
        new Chart(compositionCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Bugs', 'Other Issues'],
                datasets: [{
                    data: [ratioVal, remainder],
                    backgroundColor: [
                        '#ef4444', 
                        '#e4e4e7'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

function renderRecentActivity(audits) {
    const tbody = document.getElementById('recent-activity-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const recent = audits.slice(0, 5); 

    recent.forEach(audit => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(audit.createdAt).toLocaleDateString() + ' ' + new Date(audit.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const resultCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.textContent = audit.compliant ? 'Pass' : 'Fail';
        badge.className = `status-badge ${audit.compliant ? 'status-pass' : 'status-fail'}`;
        badge.style.backgroundColor = audit.compliant ? '#dcfce7' : '#fee2e2';
        badge.style.color = audit.compliant ? '#166534' : '#991b1b';
        badge.style.padding = '4px 12px';
        badge.style.borderRadius = '20px';
        badge.style.fontWeight = '600';
        badge.style.fontSize = '0.75rem';
        
        resultCell.appendChild(badge);

        const bugsCell = document.createElement('td');
        const bugCount = audit.metadata?.issuesWithBugInTitle ?? '-';
        const totalCount = audit.metadata?.totalIssues ?? '-';
        bugsCell.textContent = `${bugCount} / ${totalCount}`;

        const ratioCell = document.createElement('td');
        const ratioPc = (audit.metadata?.ratioWithBugInTitle || 0) * 100;
        ratioCell.textContent = ratioPc.toFixed(1) + '%';

        row.appendChild(dateCell);
        row.appendChild(resultCell);
        row.appendChild(bugsCell);
        row.appendChild(ratioCell);
        tbody.appendChild(row);
    });
}
