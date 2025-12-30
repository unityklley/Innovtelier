// Reports Dashboard JavaScript

let allCases = [];
let filteredCases = [];
let charts = {};
let dateRange = { start: null, end: null };

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    loadCases();
    initializeEventListeners();
    setDefaultDateRange('all');
});

// Initialize event listeners
function initializeEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', function () {
        this.classList.add('spinning');
        loadCases();
        setTimeout(() => this.classList.remove('spinning'), 500);
    });

    // Date range apply button
    document.getElementById('applyDateRange').addEventListener('click', applyCustomDateRange);

    // Quick filter buttons
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            setDefaultDateRange(this.dataset.range);
        });
    });

    // Export buttons
    document.getElementById('exportPDF').addEventListener('click', exportAsPDF);
    document.getElementById('exportCSV').addEventListener('click', exportAsCSV);
    document.getElementById('exportJSON').addEventListener('click', exportAsJSON);
}

// Load cases from localStorage
function loadCases() {
    const cases = localStorage.getItem('legalCases');
    let rawCases = cases ? JSON.parse(cases) : [];

    // Auth & Access Control
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!currentUser) return; // Should be handled by auth check in HTML

    if (currentUser.role === 'master-admin') {
        // Master Admin sees ALL cases
        allCases = rawCases;
    } else {
        // Client Admin sees ONLY their organization's cases
        allCases = rawCases.filter(c => c.organizationId && c.organizationId === currentUser.organizationId);
    }

    applyDateFilter();
}

// Set default date range
function setDefaultDateRange(range) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
        case 'today':
            dateRange.start = today;
            dateRange.end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            dateRange.start = weekStart;
            dateRange.end = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            dateRange.start = new Date(now.getFullYear(), now.getMonth(), 1);
            dateRange.end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            break;
        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            dateRange.start = new Date(now.getFullYear(), quarter * 3, 1);
            dateRange.end = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59);
            break;
        case 'year':
            dateRange.start = new Date(now.getFullYear(), 0, 1);
            dateRange.end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            break;
        default: // 'all'
            dateRange.start = null;
            dateRange.end = null;
    }

    // Update date inputs
    if (dateRange.start) {
        document.getElementById('startDate').value = dateRange.start.toISOString().split('T')[0];
    } else {
        document.getElementById('startDate').value = '';
    }

    if (dateRange.end) {
        document.getElementById('endDate').value = dateRange.end.toISOString().split('T')[0];
    } else {
        document.getElementById('endDate').value = '';
    }

    applyDateFilter();
}

// Apply custom date range
function applyCustomDateRange() {
    const startInput = document.getElementById('startDate').value;
    const endInput = document.getElementById('endDate').value;

    if (startInput) {
        dateRange.start = new Date(startInput);
    } else {
        dateRange.start = null;
    }

    if (endInput) {
        dateRange.end = new Date(endInput);
        dateRange.end.setHours(23, 59, 59);
    } else {
        dateRange.end = null;
    }

    // Deactivate quick filters
    document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));

    applyDateFilter();
}

// Apply date filter
function applyDateFilter() {
    if (!dateRange.start && !dateRange.end) {
        filteredCases = [...allCases];
    } else {
        filteredCases = allCases.filter(caseItem => {
            const caseDate = new Date(caseItem.timestamp);

            if (dateRange.start && caseDate < dateRange.start) {
                return false;
            }

            if (dateRange.end && caseDate > dateRange.end) {
                return false;
            }

            return true;
        });
    }

    updateDashboard();
}

// Update dashboard
function updateDashboard() {
    if (filteredCases.length === 0) {
        document.getElementById('reportsGrid').style.display = 'none';
        document.getElementById('summaryCards').style.display = 'none';
        document.getElementById('noDataMessage').style.display = 'block';
        return;
    }

    document.getElementById('reportsGrid').style.display = 'grid';
    document.getElementById('summaryCards').style.display = 'grid';
    document.getElementById('noDataMessage').style.display = 'none';

    updateSummaryCards();
    updateCharts();
    updateMetrics();
}

// Update summary cards
function updateSummaryCards() {
    const stats = {
        total: filteredCases.length,
        pending: filteredCases.filter(c => c.status === 'pending').length,
        active: filteredCases.filter(c => c.status === 'active').length,
        completed: filteredCases.filter(c => c.status === 'completed' || c.status === 'closed').length
    };

    const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;

    const summaryHTML = `
        <div class="summary-card">
            <h4>Total Cases</h4>
            <div class="value">${stats.total}</div>
            <div class="change">In selected period</div>
        </div>
        <div class="summary-card">
            <h4>Active Cases</h4>
            <div class="value">${stats.active}</div>
            <div class="change">${stats.pending} pending review</div>
        </div>
        <div class="summary-card">
            <h4>Completed</h4>
            <div class="value">${stats.completed}</div>
            <div class="change">${completionRate}% completion rate</div>
        </div>
        <div class="summary-card">
            <h4>Urgent Cases</h4>
            <div class="value">${filteredCases.filter(c => c.caseInfo.urgency === 'emergency' || c.caseInfo.urgency === 'urgent').length}</div>
            <div class="change">Require attention</div>
        </div>
    `;

    document.getElementById('summaryCards').innerHTML = summaryHTML;
}

// Update charts
function updateCharts() {
    updateStatusChart();
    updateTypeChart();
    updateUrgencyChart();
    updateTimelineChart();
    updateFamilyLawCharts();

}

// Update status chart
function updateStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;

    const statusCounts = {
        'Pending': filteredCases.filter(c => c.status === 'pending').length,
        'Active': filteredCases.filter(c => c.status === 'active').length,
        'On Hold': filteredCases.filter(c => c.status === 'on-hold').length,
        'Completed': filteredCases.filter(c => c.status === 'completed').length,
        'Closed': filteredCases.filter(c => c.status === 'closed').length
    };

    // Destroy existing chart
    if (charts.status) {
        charts.status.destroy();
    }

    charts.status = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#fbbf24', // Pending - amber
                    '#3b82f6', // Active - blue
                    '#6b7280', // On Hold - gray
                    '#10b981', // Completed - green
                    '#8b5cf6'  // Closed - purple
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Update type chart
function updateTypeChart() {
    const ctx = document.getElementById('typeChart');
    if (!ctx) return;

    const typeCounts = {};
    filteredCases.forEach(c => {
        const type = getCaseTypeLabel(c.caseInfo.type);
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Destroy existing chart
    if (charts.type) {
        charts.type.destroy();
    }

    charts.type = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(typeCounts),
            datasets: [{
                label: 'Number of Cases',
                data: Object.values(typeCounts),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update urgency chart
function updateUrgencyChart() {
    const ctx = document.getElementById('urgencyChart');
    if (!ctx) return;

    const urgencyCounts = {
        'Emergency': filteredCases.filter(c => c.caseInfo.urgency === 'emergency').length,
        'Urgent': filteredCases.filter(c => c.caseInfo.urgency === 'urgent').length,
        'Normal': filteredCases.filter(c => c.caseInfo.urgency === 'normal').length,
        'Low Priority': filteredCases.filter(c => c.caseInfo.urgency === 'low').length
    };

    // Destroy existing chart
    if (charts.urgency) {
        charts.urgency.destroy();
    }

    charts.urgency = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(urgencyCounts),
            datasets: [{
                data: Object.values(urgencyCounts),
                backgroundColor: [
                    '#ef4444', // Emergency - red
                    '#f59e0b', // Urgent - orange
                    '#3b82f6', // Normal - blue
                    '#10b981'  // Low - green
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Update timeline chart
function updateTimelineChart() {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;

    // Group cases by month
    const monthCounts = {};
    filteredCases.forEach(c => {
        const date = new Date(c.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    // Sort by date
    const sortedMonths = Object.keys(monthCounts).sort();
    const labels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    const data = sortedMonths.map(m => monthCounts[m]);

    // Destroy existing chart
    if (charts.timeline) {
        charts.timeline.destroy();
    }

    charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cases Submitted',
                data: data,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update metrics
function updateMetrics() {
    // Key metrics
    const avgCasesPerMonth = calculateAvgCasesPerMonth();
    const mostCommonType = getMostCommonCaseType();
    const avgResponseTime = calculateAvgResponseTime();

    const metricsHTML = `
        <li class="metric-item">
            <span class="metric-label">Average Cases/Month</span>
            <span class="metric-value">${avgCasesPerMonth}</span>
        </li>
        <li class="metric-item">
            <span class="metric-label">Most Common Case Type</span>
            <span class="metric-value">${mostCommonType}</span>
        </li>
        <li class="metric-item">
            <span class="metric-label">Total Case Notes</span>
            <span class="metric-value">${getTotalNotes()}</span>
        </li>
        <li class="metric-item">
            <span class="metric-label">Cases with Attachments</span>
            <span class="metric-value">${getCasesWithFiles()}</span>
        </li>
    `;

    document.getElementById('metricsList').innerHTML = metricsHTML;

    // Resolution metrics
    const completedCases = filteredCases.filter(c => c.status === 'completed' || c.status === 'closed');
    const avgResolutionDays = calculateAvgResolutionTime(completedCases);

    const resolutionHTML = `
        <li class="metric-item">
            <span class="metric-label">Completed Cases</span>
            <span class="metric-value positive">${completedCases.length}</span>
        </li>
        <li class="metric-item">
            <span class="metric-label">Average Resolution Time</span>
            <span class="metric-value">${avgResolutionDays} days</span>
        </li>
        <li class="metric-item">
            <span class="metric-label">Fastest Resolution</span>
            <span class="metric-value positive">${getFastestResolution(completedCases)} days</span>
        </li>
        <li class="metric-item">
            <span class="metric-label">Pending Cases</span>
            <span class="metric-value">${filteredCases.filter(c => c.status === 'pending').length}</span>
        </li>
    `;

    document.getElementById('resolutionMetrics').innerHTML = resolutionHTML;
}

// Helper functions
function calculateAvgCasesPerMonth() {
    if (filteredCases.length === 0) return 0;

    const months = new Set();
    filteredCases.forEach(c => {
        const date = new Date(c.timestamp);
        months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });

    return (filteredCases.length / months.size).toFixed(1);
}

function getMostCommonCaseType() {
    if (filteredCases.length === 0) return 'N/A';

    const typeCounts = {};
    filteredCases.forEach(c => {
        const type = c.caseInfo.type;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const mostCommon = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    return mostCommon ? getCaseTypeLabel(mostCommon[0]) : 'N/A';
}

function calculateAvgResponseTime() {
    // This would calculate time from submission to first status change
    // For now, return a placeholder
    return 'N/A';
}

function getTotalNotes() {
    return filteredCases.reduce((total, c) => {
        return total + (c.notes ? c.notes.length : 0);
    }, 0);
}

function getCasesWithFiles() {
    return filteredCases.filter(c => c.files && c.files.length > 0).length;
}

function calculateAvgResolutionTime(completedCases) {
    if (completedCases.length === 0) return 0;

    const totalDays = completedCases.reduce((sum, c) => {
        const start = new Date(c.timestamp);
        const end = new Date(c.lastUpdated);
        const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
        return sum + days;
    }, 0);

    return Math.round(totalDays / completedCases.length);
}

function getFastestResolution(completedCases) {
    if (completedCases.length === 0) return 0;

    const resolutionTimes = completedCases.map(c => {
        const start = new Date(c.timestamp);
        const end = new Date(c.lastUpdated);
        return Math.floor((end - start) / (1000 * 60 * 60 * 24));
    });

    return Math.min(...resolutionTimes);
}

function getCaseTypeLabel(type) {
    const labels = {
        'family-law': 'Family Law',
        'criminal-defense': 'Criminal Defense',
        'personal-injury': 'Personal Injury',
        'employment': 'Employment Law',
        'immigration': 'Immigration',
        'housing': 'Housing',
        'estate-planning': 'Estate Planning',
        'business': 'Business Law',
        'other': 'Other'
    };
    return labels[type] || type;
}

// Export functions
function exportAsPDF() {
    alert('PDF export functionality would be implemented with a library like jsPDF. For now, use the CSV export.');
}

function exportAsCSV() {
    const headers = ['Case ID', 'Client Name', 'Type', 'Status', 'Urgency', 'Submitted Date', 'Last Updated'];
    const rows = filteredCases.map(c => [
        c.id,
        `${c.personalInfo.firstName} ${c.personalInfo.lastName}`,
        getCaseTypeLabel(c.caseInfo.type),
        c.status,
        c.caseInfo.urgency,
        new Date(c.timestamp).toLocaleDateString(),
        new Date(c.lastUpdated).toLocaleDateString()
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cases-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportAsJSON() {
    const reportData = {
        generatedAt: new Date().toISOString(),
        dateRange: {
            start: dateRange.start ? dateRange.start.toISOString() : null,
            end: dateRange.end ? dateRange.end.toISOString() : null
        },
        summary: {
            totalCases: filteredCases.length,
            pending: filteredCases.filter(c => c.status === 'pending').length,
            active: filteredCases.filter(c => c.status === 'active').length,
            completed: filteredCases.filter(c => c.status === 'completed' || c.status === 'closed').length
        },
        cases: filteredCases
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cases-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Family Law Specific Charts and Metrics
function updateFamilyLawCharts() {
    const familyLawCases = filteredCases.filter(c => c.caseInfo.type === 'family-law' && c.familyLawDetails);

    if (familyLawCases.length === 0) {
        document.getElementById('familyLawMetricsSection').style.display = 'none';
        return;
    }

    document.getElementById('familyLawMetricsSection').style.display = 'block';

    updateCountyChart(familyLawCases);
    updateJudgeChart(familyLawCases);
    updateChildrenChart(familyLawCases);
    updateFamilyLawMetrics(familyLawCases);
}

// Update county chart
function updateCountyChart(familyLawCases) {
    const ctx = document.getElementById('countyChart');
    if (!ctx) return;

    const countyCounts = {};
    familyLawCases.forEach(c => {
        const county = c.familyLawDetails.county || 'Not Specified';
        if (county) {
            countyCounts[county] = (countyCounts[county] || 0) + 1;
        }
    });

    // Destroy existing chart
    if (charts.county) {
        charts.county.destroy();
    }

    charts.county = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(countyCounts),
            datasets: [{
                label: 'Number of Cases',
                data: Object.values(countyCounts),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update judge chart
function updateJudgeChart(familyLawCases) {
    const ctx = document.getElementById('judgeChart');
    if (!ctx) return;

    const judgeCounts = {};
    familyLawCases.forEach(c => {
        const judge = c.familyLawDetails.judgeAssigned || 'Not Assigned';
        if (judge && judge.trim()) {
            judgeCounts[judge] = (judgeCounts[judge] || 0) + 1;
        }
    });

    // Destroy existing chart
    if (charts.judge) {
        charts.judge.destroy();
    }

    charts.judge = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(judgeCounts),
            datasets: [{
                label: 'Number of Cases',
                data: Object.values(judgeCounts),
                backgroundColor: 'rgba(118, 75, 162, 0.8)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update children chart
function updateChildrenChart(familyLawCases) {
    const ctx = document.getElementById('childrenChart');
    if (!ctx) return;

    const childrenCounts = {
        'With Children': familyLawCases.filter(c => c.familyLawDetails.childrenInvolved === 'yes').length,
        'No Children': familyLawCases.filter(c => c.familyLawDetails.childrenInvolved === 'no').length
    };

    // Destroy existing chart
    if (charts.children) {
        charts.children.destroy();
    }

    charts.children = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(childrenCounts),
            datasets: [{
                data: Object.values(childrenCounts),
                backgroundColor: [
                    '#f59e0b', // With children - orange
                    '#3b82f6'  // No children - blue
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Update family law metrics
function updateFamilyLawMetrics(familyLawCases) {
    const withChildren = familyLawCases.filter(c => c.familyLawDetails.childrenInvolved === 'yes');
    const totalChildren = withChildren.reduce((sum, c) => sum + parseInt(c.familyLawDetails.numberOfChildren || 0), 0);
    const avgChildren = withChildren.length > 0 ? (totalChildren / withChildren.length).toFixed(1) : 0;
    const dvCases = familyLawCases.filter(c => c.familyLawDetails.domesticViolence === true).length;
    const dvPercentage = familyLawCases.length > 0 ? ((dvCases / familyLawCases.length) * 100).toFixed(1) : 0;

    const metricsHTML = `
        <li class="metric-item">
            <span class="metric-label">Total Family Law Cases</span>
            <span class="metric-value">${familyLawCases.length}</span>
        </li>
        <li class="metric-item">
            <span class="metric-label">Cases with Children</span>
            <span class="metric-value">${withChildren.length}</span>
        </li>
        <li class="metric-item">
            <span class="metric-label">Average Children per Case</span>
            <span class="metric-value">${avgChildren}</span>
        </li>
        <li class="metric-item">
            <span class="metric-label">Domestic Violence Cases</span>
            <span class="metric-value ${dvCases > 0 ? 'negative' : ''}">${dvCases} (${dvPercentage}%)</span>
        </li>
    `;

    document.getElementById('familyLawMetricsList').innerHTML = metricsHTML;
}
