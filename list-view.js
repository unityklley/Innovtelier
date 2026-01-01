// ========================================
// LIST VIEW - Sortable & Groupable Table
// ========================================

let currentListGroupBy = 'status'; // default grouping
let currentListSort = { field: 'nextDeadline', direction: 'asc' };

// Render List View
function renderListView() {
    const container = document.getElementById('listView');
    if (!container) return;

    // Get cases
    let cases = JSON.parse(localStorage.getItem('cases') || '[]');

    // Filter cases (optional - if we want to share search/filters with other views)
    // For now, let's just use all cases

    // Sort cases first
    cases.sort((a, b) => {
        let valA = a[currentListSort.field] || '';
        let valB = b[currentListSort.field] || '';

        if (currentListSort.field === 'nextDeadline' || currentListSort.field === 'createdAt') {
            valA = new Date(valA).getTime() || 0;
            valB = new Date(valB).getTime() || 0;
        }

        if (valA < valB) return currentListSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentListSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Group cases
    const groups = groupCases(cases, currentListGroupBy);

    container.innerHTML = `
        <div class="list-view-container">
            <div class="list-view-header">
                <div class="list-view-controls">
                    <label style="font-weight: 500; font-size: 0.875rem;">Group by:</label>
                    <select class="group-selector" onchange="changeListGrouping(this.value)">
                        <option value="status" ${currentListGroupBy === 'status' ? 'selected' : ''}>Status</option>
                        <option value="priority" ${currentListGroupBy === 'priority' ? 'selected' : ''}>Priority</option>
                        <option value="type" ${currentListGroupBy === 'type' ? 'selected' : ''}>Type</option>
                        <option value="clientOrganizationName" ${currentListGroupBy === 'clientOrganizationName' ? 'selected' : ''}>Client</option>
                    </select>
                </div>
                <div style="font-size: 0.875rem; color: #6b7280;">
                    ${cases.length} items
                </div>
            </div>
            
            <div class="list-view-body">
                ${Object.keys(groups).map(groupName => renderListGroup(groupName, groups[groupName])).join('')}
            </div>
        </div>
    `;
}

// Group cases helper
function groupCases(cases, groupByField) {
    return cases.reduce((acc, c) => {
        let key = c[groupByField] || 'Unassigned';

        // Format keys for display
        if (groupByField === 'status' || groupByField === 'priority' || groupByField === 'type') {
            key = key.charAt(0).toUpperCase() + key.slice(1);
        }

        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
    }, {});
}

// Render a single group
function renderListGroup(groupName, groupCases) {
    const groupId = `group-${groupName.replace(/\s+/g, '-')}`;

    return `
        <div class="list-group expanded" id="${groupId}">
            <div class="list-group-header" onclick="toggleListGroup('${groupId}')">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="list-group-toggle"><i class="fas fa-chevron-right"></i></span>
                    <span style="font-weight: 600;">${groupName}</span>
                    <span style="background: #e5e7eb; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.75rem;">${groupCases.length}</span>
                </div>
            </div>
            <div class="list-group-content">
                <table class="data-table" style="margin: 0; border: none;">
                    <thead>
                        <tr>
                            <th width="30%">Project Name</th>
                            <th>Client</th>
                            <th>Type</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Deadline</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${groupCases.map(c => renderListRow(c)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Render a single row
function renderListRow(c) {
    const statusClass = c.status === 'active' ? 'status-active' :
        c.status === 'pending' ? 'status-pending' :
            c.status === 'closed' ? 'status-closed' : 'status-paused';

    const priorityClass = `priority-${c.priority || 'medium'}`;
    const deadline = c.nextDeadline ? new Date(c.nextDeadline).toLocaleDateString() : '-';

    return `
        <tr>
            <td>
                <div style="font-weight: 600; color: #111827;">${c.name}</div>
            </td>
            <td>${c.clientOrganizationName || 'N/A'}</td>
            <td><span class="badge" style="background: #f3f4f6;">${c.type || 'other'}</span></td>
            <td><span class="badge ${priorityClass}">${c.priority || 'medium'}</span></td>
            <td><span class="status-badge ${statusClass}">${c.status || 'active'}</span></td>
            <td>${deadline}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewCaseDetails('${c.id}')"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `;
}

// Toggle group expansion
function toggleListGroup(groupId) {
    const group = document.getElementById(groupId);
    if (group) {
        group.classList.toggle('expanded');
    }
}

// Change grouping
function changeListGrouping(value) {
    currentListGroupBy = value;
    renderListView();
}

// Expose functions
window.renderListView = renderListView;
window.changeListGrouping = changeListGrouping;
window.toggleListGroup = toggleListGroup;
