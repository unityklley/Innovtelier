// ========================================
// INLINE EDITING FUNCTIONS
// ========================================

let currentEditingCell = null;

// Edit Status Inline
function editStatus(caseId, event) {
    event.stopPropagation();

    const cell = event.currentTarget;
    if (cell.classList.contains('editing')) return;

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const currentValue = caseItem.status;

    // Save current cell
    currentEditingCell = cell;
    cell.classList.add('editing');

    // Create select
    const select = document.createElement('select');
    select.className = 'inline-edit-select';
    select.innerHTML = `
        <option value="active" ${currentValue === 'active' ? 'selected' : ''}>Active</option>
        <option value="paused" ${currentValue === 'paused' ? 'selected' : ''}>Paused</option>
        <option value="closed" ${currentValue === 'closed' ? 'selected' : ''}>Closed</option>
        <option value="archived" ${currentValue === 'archived' ? 'selected' : ''}>Archived</option>
    `;

    // Save on change
    select.onchange = () => saveInlineStatus(caseId, select.value, cell, currentValue);

    // Cancel on blur
    select.onblur = () => {
        setTimeout(() => cancelInlineEdit(cell, getStatusBadge(currentValue)), 100);
    };

    // Cancel on ESC
    select.onkeydown = (e) => {
        if (e.key === 'Escape') {
            cancelInlineEdit(cell, getStatusBadge(currentValue));
        }
    };

    cell.innerHTML = '';
    cell.appendChild(select);
    select.focus();
}

function saveInlineStatus(caseId, newStatus, cell, oldStatus) {
    if (newStatus === oldStatus) {
        cancelInlineEdit(cell, getStatusBadge(oldStatus));
        return;
    }

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    cases[caseIndex].status = newStatus;
    cases[caseIndex].lastActivity = new Date().toISOString();
    localStorage.setItem('cases', JSON.stringify(cases));

    // Log activity
    if (typeof logActivity === 'function') {
        logActivity(caseId, 'status_changed', {
            previousValue: oldStatus,
            newValue: newStatus
        });
    }

    // Update cell
    cell.classList.remove('editing');
    cell.innerHTML = getStatusBadge(newStatus);
    currentEditingCell = null;
}

// Edit Type Inline
function editType(caseId, event) {
    event.stopPropagation();

    const cell = event.currentTarget;
    if (cell.classList.contains('editing')) return;

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const currentValue = caseItem.type;

    currentEditingCell = cell;
    cell.classList.add('editing');

    const select = document.createElement('select');
    select.className = 'inline-edit-select';
    select.innerHTML = `
        <option value="legal" ${currentValue === 'legal' ? 'selected' : ''}>Legal</option>
        <option value="nonprofit" ${currentValue === 'nonprofit' ? 'selected' : ''}>Nonprofit</option>
        <option value="other" ${currentValue === 'other' ? 'selected' : ''}>Other</option>
    `;

    select.onchange = () => saveInlineType(caseId, select.value, cell, currentValue);
    select.onblur = () => {
        setTimeout(() => cancelInlineEdit(cell, getTypeBadge(currentValue)), 100);
    };
    select.onkeydown = (e) => {
        if (e.key === 'Escape') {
            cancelInlineEdit(cell, getTypeBadge(currentValue));
        }
    };

    cell.innerHTML = '';
    cell.appendChild(select);
    select.focus();
}

function saveInlineType(caseId, newType, cell, oldType) {
    if (newType === oldType) {
        cancelInlineEdit(cell, getTypeBadge(oldType));
        return;
    }

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    cases[caseIndex].type = newType;
    cases[caseIndex].clientType = newType; // Keep both for compatibility
    cases[caseIndex].lastActivity = new Date().toISOString();
    localStorage.setItem('cases', JSON.stringify(cases));

    if (typeof logActivity === 'function') {
        logActivity(caseId, 'type_changed', {
            previousValue: oldType,
            newValue: newType
        });
    }

    cell.classList.remove('editing');
    cell.innerHTML = getTypeBadge(newType);
    currentEditingCell = null;
}

// Edit Priority Inline
function editPriority(caseId, event) {
    event.stopPropagation();

    const cell = event.currentTarget;
    if (cell.classList.contains('editing')) return;

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const currentValue = caseItem.priority;

    currentEditingCell = cell;
    cell.classList.add('editing');

    const select = document.createElement('select');
    select.className = 'inline-edit-select';
    select.innerHTML = `
        <option value="low" ${currentValue === 'low' ? 'selected' : ''}>Low</option>
        <option value="medium" ${currentValue === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="high" ${currentValue === 'high' ? 'selected' : ''}>High</option>
        <option value="critical" ${currentValue === 'critical' ? 'selected' : ''}>Critical</option>
    `;

    select.onchange = () => saveInlinePriority(caseId, select.value, cell, currentValue);
    select.onblur = () => {
        setTimeout(() => cancelInlineEdit(cell, getPriorityIcon(currentValue)), 100);
    };
    select.onkeydown = (e) => {
        if (e.key === 'Escape') {
            cancelInlineEdit(cell, getPriorityIcon(currentValue));
        }
    };

    cell.innerHTML = '';
    cell.appendChild(select);
    select.focus();
}

function saveInlinePriority(caseId, newPriority, cell, oldPriority) {
    if (newPriority === oldPriority) {
        cancelInlineEdit(cell, getPriorityIcon(oldPriority));
        return;
    }

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    cases[caseIndex].priority = newPriority;
    cases[caseIndex].lastActivity = new Date().toISOString();
    localStorage.setItem('cases', JSON.stringify(cases));

    if (typeof logActivity === 'function') {
        logActivity(caseId, 'priority_changed', {
            previousValue: oldPriority,
            newValue: newPriority
        });
    }

    cell.classList.remove('editing');
    cell.innerHTML = getPriorityIcon(newPriority);
    currentEditingCell = null;
}

// Edit Deadline Inline
function editDeadline(caseId, event) {
    event.stopPropagation();

    const cell = event.currentTarget;
    if (cell.classList.contains('editing')) return;

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const currentValue = caseItem.nextDeadline;
    const currentFormatted = formatDeadline(currentValue);

    currentEditingCell = cell;
    cell.classList.add('editing');

    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'inline-edit-input';

    if (currentValue) {
        const date = new Date(currentValue);
        input.value = date.toISOString().split('T')[0];
    }

    input.onchange = () => saveInlineDeadline(caseId, input.value, cell, currentValue);
    input.onblur = () => {
        setTimeout(() => cancelInlineEdit(cell, currentFormatted), 100);
    };
    input.onkeydown = (e) => {
        if (e.key === 'Escape') {
            cancelInlineEdit(cell, currentFormatted);
        } else if (e.key === 'Enter') {
            saveInlineDeadline(caseId, input.value, cell, currentValue);
        }
    };

    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
}

function saveInlineDeadline(caseId, newDeadline, cell, oldDeadline) {
    const newDeadlineISO = newDeadline ? new Date(newDeadline).toISOString() : null;

    if (newDeadlineISO === oldDeadline) {
        cancelInlineEdit(cell, formatDeadline(oldDeadline));
        return;
    }

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    cases[caseIndex].nextDeadline = newDeadlineISO;
    cases[caseIndex].lastActivity = new Date().toISOString();
    localStorage.setItem('cases', JSON.stringify(cases));

    if (typeof logActivity === 'function') {
        logActivity(caseId, 'deadline_changed', {
            previousValue: oldDeadline,
            newValue: newDeadline
        });
    }

    cell.classList.remove('editing');
    const isUrgent = isDeadlineUrgent(newDeadlineISO);
    cell.style.color = isUrgent ? '#dc2626' : '';
    cell.style.fontWeight = isUrgent ? '500' : '';
    cell.innerHTML = formatDeadline(newDeadlineISO);
    currentEditingCell = null;
}

// Edit Lead Inline
function editLead(caseId, event) {
    event.stopPropagation();

    const cell = event.currentTarget;
    if (cell.classList.contains('editing')) return;

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const currentValue = caseItem.caseLeadName;
    const currentLeadId = caseItem.caseLeadId;

    currentEditingCell = cell;
    cell.classList.add('editing');

    // Get all users for dropdown
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const select = document.createElement('select');
    select.className = 'inline-edit-select';

    // Add current user if not in users list
    let userOptions = [...users];
    if (currentUser.id && !users.find(u => u.id === currentUser.id)) {
        userOptions.unshift(currentUser);
    }

    select.innerHTML = userOptions.map(user => {
        const userName = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email || 'Unknown User';
        const isSelected = user.id === currentLeadId || userName === currentValue;
        return `<option value="${user.id}" ${isSelected ? 'selected' : ''}>${userName}</option>`;
    }).join('');

    select.onchange = () => saveInlineLead(caseId, select.value, cell, currentLeadId, currentValue);
    select.onblur = () => {
        setTimeout(() => cancelInlineEdit(cell, currentValue), 100);
    };
    select.onkeydown = (e) => {
        if (e.key === 'Escape') {
            cancelInlineEdit(cell, currentValue);
        }
    };

    cell.innerHTML = '';
    cell.appendChild(select);
    select.focus();
}

function saveInlineLead(caseId, newLeadId, cell, oldLeadId, oldLeadName) {
    if (newLeadId === oldLeadId) {
        cancelInlineEdit(cell, oldLeadName);
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    let newLead = users.find(u => u.id === newLeadId);
    if (!newLead && currentUser.id === newLeadId) {
        newLead = currentUser;
    }

    if (!newLead) {
        cancelInlineEdit(cell, oldLeadName);
        return;
    }

    const newLeadName = newLead.firstName && newLead.lastName
        ? `${newLead.firstName} ${newLead.lastName}`
        : newLead.email || 'Unknown User';

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    cases[caseIndex].caseLeadId = newLeadId;
    cases[caseIndex].caseLeadName = newLeadName;
    cases[caseIndex].lastActivity = new Date().toISOString();
    localStorage.setItem('cases', JSON.stringify(cases));

    if (typeof logActivity === 'function') {
        logActivity(caseId, 'lead_changed', {
            previousValue: oldLeadName,
            newValue: newLeadName
        });
    }

    cell.classList.remove('editing');
    cell.innerHTML = newLeadName;
    currentEditingCell = null;
}

function cancelInlineEdit(cell, originalContent) {
    if (!cell) return;
    cell.classList.remove('editing');
    cell.innerHTML = originalContent;
    currentEditingCell = null;
}

// Expose functions
window.editStatus = editStatus;
window.editType = editType;
window.editPriority = editPriority;
window.editLead = editLead;
window.editDeadline = editDeadline;
