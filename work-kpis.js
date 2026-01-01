// ========================================
// WORK TAB KPI CALCULATIONS
// ========================================

function calculateWorkKPIs() {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Total projects
    const totalProjects = cases.length;

    // Active projects
    const activeProjects = cases.filter(c => c.status === 'active').length;

    // Due this week
    const dueThisWeek = cases.filter(c => {
        if (!c.nextDeadline) return false;
        const deadline = new Date(c.nextDeadline);
        return deadline >= now && deadline <= oneWeekFromNow;
    }).length;

    // Overdue
    const overdue = cases.filter(c => {
        if (!c.nextDeadline) return false;
        const deadline = new Date(c.nextDeadline);
        return deadline < now && c.status === 'active';
    }).length;

    // By type
    const legalProjects = cases.filter(c => c.type === 'legal').length;
    const nonprofitProjects = cases.filter(c => c.type === 'nonprofit').length;
    const otherProjects = cases.filter(c => c.type === 'other').length;

    return {
        totalProjects,
        activeProjects,
        dueThisWeek,
        overdue,
        legalProjects,
        nonprofitProjects,
        otherProjects
    };
}

function updateWorkKPIs() {
    const kpis = calculateWorkKPIs();

    const totalEl = document.getElementById('totalProjectsCount');
    const activeEl = document.getElementById('activeProjectsCount');
    const dueWeekEl = document.getElementById('dueThisWeekCount');
    const overdueEl = document.getElementById('overdueCount');
    const legalEl = document.getElementById('legalProjectsCount');
    const nonprofitEl = document.getElementById('nonprofitProjectsCount');
    const otherEl = document.getElementById('otherProjectsCount');

    if (totalEl) totalEl.textContent = kpis.totalProjects;
    if (activeEl) activeEl.textContent = kpis.activeProjects;
    if (dueWeekEl) dueWeekEl.textContent = kpis.dueThisWeek;
    if (overdueEl) overdueEl.textContent = kpis.overdue;
    if (legalEl) legalEl.textContent = kpis.legalProjects;
    if (nonprofitEl) nonprofitEl.textContent = kpis.nonprofitProjects;
    if (otherEl) otherEl.textContent = kpis.otherProjects;
}

// Expose functions
window.calculateWorkKPIs = calculateWorkKPIs;
window.updateWorkKPIs = updateWorkKPIs;
