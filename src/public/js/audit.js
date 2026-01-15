const API_BASE = '/api/v1';

document.addEventListener('DOMContentLoaded', () => {
    loadAudits();
    
    const runBtn = document.getElementById('runAuditBtn');
    if(runBtn) runBtn.addEventListener('click', runAudit);
});

async function loadAudits() {
    const tableBody = document.getElementById('auditBody');
    tableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE}/audits`);
        if (!response.ok) throw new Error('Failed to fetch audits');
        const audits = await response.json();
        renderAudits(audits);
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="6" style="color: red;">Error loading audits: ${err.message}</td></tr>`;
    }
}

function renderAudits(audits) {
    const tableBody = document.getElementById('auditBody');
    tableBody.innerHTML = '';

    if (audits.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No audits found.</td></tr>';
        return;
    }

    audits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    audits.forEach(audit => {
        const date = new Date(audit.createdAt).toLocaleString();
        const totalIssues = audit.metadata?.totalIssues || 0;
        const bugIssues = audit.metadata?.issuesWithBugInTitle || 0;
        const ratio = audit.metadata?.ratioWithBugInTitle ? (audit.metadata.ratioWithBugInTitle * 100).toFixed(2) + '%' : '0%';
        const isCompliant = audit.compliant;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${audit.auditId}</td>
            <td>${date}</td>
            <td>
                <span class="status-badge ${isCompliant ? 'status-pass' : 'status-fail'}">${isCompliant ? 'Pass' : 'Fail'}</span>
            </td>
            <td>${totalIssues}</td>
            <td>${bugIssues}</td>
            <td>${ratio}</td>
        `;
        tableBody.appendChild(row);
    });
}

async function runAudit() {
    const btn = document.getElementById('runAuditBtn');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Running...';
    
    try {
        const response = await fetch(`${API_BASE}/audits/issues`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to run audit');
        await loadAudits();
    } catch (err) {
        alert('Error running audit: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}
