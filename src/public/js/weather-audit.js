const API_BASE = '/api/v1';

let tempChartInstance = null;
let gaugeChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAudits();
    
    const form = document.getElementById('auditForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await runAudit();
        });
    }
});

async function loadAudits() {
    const tableBody = document.getElementById('auditBody');
    tableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE}/audits`);
        if (!response.ok) throw new Error('Failed to fetch audits');
        const audits = await response.json();
        
        const weatherAudits = audits.filter(a => a.auditId && a.auditId.startsWith('audit-weather-'));
        renderHistory(weatherAudits);
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="6" style="color: red;">Error loading audits: ${err.message}</td></tr>`;
    }
}

function renderHistory(audits) {
    const tableBody = document.getElementById('auditBody');
    tableBody.innerHTML = '';

    if (audits.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No weather audits found.</td></tr>';
        return;
    }

    audits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    audits.forEach(audit => {
        const date = new Date(audit.createdAt).toLocaleString();
        const city = audit.metadata?.city || 'Unknown';
        const threshold = audit.metadata?.threshold?.value !== undefined 
            ? `${audit.metadata.threshold.operator} ${audit.metadata.threshold.value}°C` 
            : '-';
        const weeks = audit.metadata?.summary?.totalWeeks || 0;
        const percentage = audit.metadata?.summary?.compliancePercentage !== undefined 
            ? `${audit.metadata.summary.compliancePercentage}%` 
            : '-';
        const isCompliant = audit.compliant;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${city}</td>
            <td>${threshold}</td>
            <td>${weeks}</td>
            <td>${percentage}</td>
            <td>
                <span class="status-badge ${isCompliant ? 'status-pass' : 'status-fail'}">${isCompliant ? 'Passed' : 'Failed'}</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function runAudit() {
    const btn = document.getElementById('runAuditBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Analyzing...';
    
    const city = document.getElementById('city').value;
    const latitude = parseFloat(document.getElementById('lat').value);
    const longitude = parseFloat(document.getElementById('lon').value);
    const threshold = parseFloat(document.getElementById('threshold').value);
    const operator = document.getElementById('operator').value;
    const weeks = parseInt(document.getElementById('weeks').value);

    try {
        const response = await fetch(`${API_BASE}/audits/weather`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city, latitude, longitude, threshold, operator, weeks })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to run audit');
        }
        
        const result = await response.json();
        
        renderResults(result);
        await loadAudits();
    } catch (err) {
        alert('Error running audit: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function renderResults(audit) {
    document.getElementById('resultsArea').style.display = 'block';
    
    const evidences = audit.evidences || [];
    const thresholdVal = audit.metadata.threshold.value;
    
    const labels = evidences.map(e => `W${e.week}`);
    const dataPoints = evidences.map(e => e.averageTemperature);
    const thresholdLine = evidences.map(() => thresholdVal);
    
    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    
    if (tempChartInstance) tempChartInstance.destroy();

    tempChartInstance = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Avg Temperature (°C)',
                    data: dataPoints,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Threshold',
                    data: thresholdLine,
                    borderColor: 'rgb(255, 99, 132)',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const ev = evidences[index];
                            return `${ev.startDate} to ${ev.endDate} (${ev.isCompliant ? 'Pass' : 'Fail'})`;
                        }
                    }
                }
            }
        }
    });

    const compliancePercent = audit.metadata.summary.compliancePercentage;
    const isCompliant = audit.compliant;
    
    const ctxGauge = document.getElementById('gaugeChart').getContext('2d');
    
    if (gaugeChartInstance) gaugeChartInstance.destroy();
    
    gaugeChartInstance = new Chart(ctxGauge, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Non-Compliant'],
            datasets: [{
                data: [compliancePercent, 100 - compliancePercent],
                backgroundColor: [
                    'rgb(75, 192, 192)',
                    'rgb(255, 99, 132)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
    
    document.getElementById('complianceText').textContent = `${compliancePercent}%`;
    document.getElementById('complianceText').style.color = isCompliant ? 'var(--chart-1)' : 'var(--destructive)';
    document.getElementById('complianceStatus').textContent = isCompliant 
        ? 'PASSED AUDIT' 
        : 'FAILED AUDIT';
}
