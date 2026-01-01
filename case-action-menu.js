// ========================================
// CASE ACTION MENU SYSTEM
// Comprehensive contextual menu for case management
// ========================================

// Global state
let activeCaseMenuId = null;
let currentMenuElement = null;

// Permission matrix
const PERMISSIONS = {
    'view_dashboard': ['master-admin', 'admin', 'paralegal', 'client-admin'],
    'view_activity_log': ['master-admin', 'admin', 'paralegal'],
    'view_documents': ['master-admin', 'admin', 'paralegal', 'client-admin'],
    'add_activity': ['master-admin', 'admin', 'paralegal'],
    'create_task': ['master-admin', 'admin', 'paralegal'],
    'send_message': ['master-admin', 'admin', 'paralegal'],
    'upload_document': ['master-admin', 'admin', 'paralegal'],
    'change_status': ['master-admin', 'admin'],
    'update_priority': ['master-admin', 'admin'],
    'set_deadline': ['master-admin', 'admin'],
    'assign_lead': ['master-admin', 'admin'],
    'manage_tags': ['master-admin', 'admin', 'paralegal'],
    'flag_risk': ['master-admin', 'admin'],
    'escalate_case': ['master-admin', 'admin'],
    'compliance_note': ['master-admin', 'admin'],
    'lock_case': ['master-admin', 'admin'],
    'export_summary': ['master-admin', 'admin', 'paralegal'],
    'generate_report': ['master-admin', 'admin'],
    'share_link': ['master-admin', 'admin'],
    'duplicate_case': ['master-admin', 'admin'],
    'archive_case': ['master-admin', 'admin'],
    'restore_case': ['master-admin', 'admin'],
    'delete_case': ['master-admin']
};

// ========================================
// MENU CONTROL
// ========================================

function toggleCaseMenu(caseId, event) {
    if (event) {
        event.stopPropagation();
    }

    // Close existing menu if different case
    if (activeCaseMenuId && activeCaseMenuId !== caseId) {
        closeCaseMenu();
    }

    // Toggle current menu
    if (activeCaseMenuId === caseId) {
        closeCaseMenu();
        return;
    }

    // Open new menu
    openCaseMenu(caseId, event);
}

function openCaseMenu(caseId, event) {
    const buttonElement = event ? event.target.closest('button') : null;
    if (!buttonElement) return;

    // Create menu if doesn't exist
    let menuElement = document.getElementById(`case-menu-${caseId}`);
    if (!menuElement) {
        menuElement = createCaseMenuElement(caseId);
        buttonElement.parentElement.appendChild(menuElement);
    }

    // Position and show menu
    menuElement.classList.add('active');
    activeCaseMenuId = caseId;
    currentMenuElement = menuElement;

    // Show overlay
    let overlay = document.getElementById('case-menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'case-menu-overlay';
        overlay.className = 'menu-overlay';
        overlay.onclick = closeCaseMenu;
        document.body.appendChild(overlay);
    }
    overlay.classList.add('active');

    // Focus first menu item
    const firstItem = menuElement.querySelector('.menu-item:not(.disabled)');
    if (firstItem) firstItem.focus();
}

function closeCaseMenu() {
    if (currentMenuElement) {
        currentMenuElement.classList.remove('active');
    }

    const overlay = document.getElementById('case-menu-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }

    activeCaseMenuId = null;
    currentMenuElement = null;
}

function createCaseMenuElement(caseId) {
    const menu = document.createElement('div');
    menu.id = `case-menu-${caseId}`;
    menu.className = 'case-action-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Case actions');

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userRole = currentUser.role || 'client-admin';

    menu.innerHTML = `
        <!-- Section 1: Case Access -->
        <div class="menu-section">
            <div class="menu-section-header">Case Access</div>
            ${createMenuItem('view_dashboard', caseId, 'fas fa-th-large', 'View Case Dashboard', userRole)}
            ${createMenuItem('view_activity_log', caseId, 'fas fa-history', 'Open Activity Log', userRole)}
            ${createMenuItem('view_documents', caseId, 'fas fa-folder-open', 'View Documents', userRole)}
        </div>
        
        <!-- Section 2: Work & Collaboration -->
        <div class="menu-section">
            <div class="menu-section-header">Work & Collaboration</div>
            ${createMenuItem('add_activity', caseId, 'fas fa-sticky-note', 'Add Activity / Log Note', userRole)}
            ${createMenuItem('create_task', caseId, 'fas fa-tasks', 'Create Task', userRole)}
            ${createMenuItem('send_message', caseId, 'fas fa-comment', 'Send Internal Message', userRole)}
            ${createMenuItem('upload_document', caseId, 'fas fa-upload', 'Upload Document', userRole)}
        </div>
        
        <!-- Section 3: Case Management -->
        <div class="menu-section">
            <div class="menu-section-header">Case Management</div>
            ${createMenuItem('change_status', caseId, 'fas fa-exchange-alt', 'Change Status', userRole)}
            ${createMenuItem('update_priority', caseId, 'fas fa-flag', 'Update Priority', userRole)}
            ${createMenuItem('set_deadline', caseId, 'fas fa-calendar', 'Set / Update Deadline', userRole)}
            ${createMenuItem('assign_lead', caseId, 'fas fa-user-tie', 'Assign / Reassign Lead', userRole)}
            ${createMenuItem('manage_tags', caseId, 'fas fa-tags', 'Add / Edit Tags', userRole)}
        </div>
        
        <!-- Section 4: Risk & Compliance -->
        <div class="menu-section">
            <div class="menu-section-header">Risk & Compliance</div>
            ${createMenuItem('flag_risk', caseId, 'fas fa-exclamation-triangle', 'Flag as At Risk', userRole, 'warning')}
            ${createMenuItem('escalate_case', caseId, 'fas fa-arrow-up', 'Escalate Case', userRole, 'warning')}
            ${createMenuItem('compliance_note', caseId, 'fas fa-shield-alt', 'Add Compliance Note', userRole)}
            ${createMenuItem('lock_case', caseId, 'fas fa-lock', 'Lock Case (Legal Hold)', userRole, 'warning')}
        </div>
        
        <!-- Section 5: Reporting & Export -->
        <div class="menu-section">
            <div class="menu-section-header">Reporting & Export</div>
            ${createMenuItem('export_summary', caseId, 'fas fa-file-pdf', 'Export Case Summary (PDF)', userRole)}
            ${createMenuItem('generate_report', caseId, 'fas fa-chart-bar', 'Generate Status Report', userRole)}
            ${createMenuItem('share_link', caseId, 'fas fa-share-alt', 'Share Read-Only Link', userRole)}
        </div>
        
        <!-- Section 6: Administrative -->
        <div class="menu-section">
            <div class="menu-section-header">Administrative</div>
            ${createMenuItem('duplicate_case', caseId, 'fas fa-copy', 'Duplicate Case', userRole)}
            ${createMenuItem('archive_case', caseId, 'fas fa-archive', 'Archive Case', userRole, 'warning')}
            ${createMenuItem('restore_case', caseId, 'fas fa-undo', 'Restore Case', userRole, 'success')}
            ${createMenuItem('delete_case', caseId, 'fas fa-trash', 'Delete Case', userRole, 'danger')}
        </div>
    `;

    // Add keyboard navigation
    menu.addEventListener('keydown', handleMenuKeyboard);

    return menu;
}

function createMenuItem(action, caseId, icon, label, userRole, variant = '') {
    const hasPermission = canPerformAction(action, userRole);
    const disabled = !hasPermission;
    const variantClass = variant ? ` ${variant}` : '';
    const disabledClass = disabled ? ' disabled' : '';

    return `
        <div class="menu-item${variantClass}${disabledClass}" 
             role="menuitem" 
             tabindex="${disabled ? '-1' : '0'}"
             data-action="${action}"
             data-case-id="${caseId}"
             ${disabled ? 'title="You don\'t have permission for this action"' : ''}
             ${!disabled ? `onclick="handleMenuAction('${action}', '${caseId}')"` : ''}>
            <i class="${icon}"></i>
            <span>${label}</span>
        </div>
    `;
}

function canPerformAction(action, userRole) {
    const allowedRoles = PERMISSIONS[action];
    return allowedRoles && allowedRoles.includes(userRole);
}

function handleMenuKeyboard(event) {
    const items = Array.from(event.currentTarget.querySelectorAll('.menu-item:not(.disabled)'));
    const currentIndex = items.indexOf(document.activeElement);

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex].focus();
            break;
        case 'ArrowUp':
            event.preventDefault();
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            items[prevIndex].focus();
            break;
        case 'Enter':
        case ' ':
            event.preventDefault();
            const action = document.activeElement.getAttribute('data-action');
            const caseId = document.activeElement.getAttribute('data-case-id');
            if (action && caseId) {
                handleMenuAction(action, caseId);
            }
            break;
        case 'Escape':
            event.preventDefault();
            closeCaseMenu();
            break;
    }
}

// ========================================
// ACTION HANDLERS
// ========================================

function handleMenuAction(action, caseId) {
    closeCaseMenu();

    switch (action) {
        // Section 1: Case Access
        case 'view_dashboard':
            viewCaseDashboard(caseId);
            break;
        case 'view_activity_log':
            viewActivityLog(caseId);
            break;
        case 'view_documents':
            viewCaseDocuments(caseId);
            break;

        // Section 2: Work & Collaboration
        case 'add_activity':
            openAddActivityModal(caseId);
            break;
        case 'create_task':
            openCreateTaskModal(caseId);
            break;
        case 'send_message':
            openSendMessageModal(caseId);
            break;
        case 'upload_document':
            openUploadDocumentModal(caseId);
            break;

        // Section 3: Case Management
        case 'change_status':
            openChangeStatusModal(caseId);
            break;
        case 'update_priority':
            openUpdatePriorityModal(caseId);
            break;
        case 'set_deadline':
            openSetDeadlineModal(caseId);
            break;
        case 'assign_lead':
            openAssignLeadModal(caseId);
            break;
        case 'manage_tags':
            openManageTagsModal(caseId);
            break;

        // Section 4: Risk & Compliance
        case 'flag_risk':
            openFlagRiskModal(caseId);
            break;
        case 'escalate_case':
            openEscalateCaseModal(caseId);
            break;
        case 'compliance_note':
            openComplianceNoteModal(caseId);
            break;
        case 'lock_case':
            lockCase(caseId);
            break;

        // Section 5: Reporting & Export
        case 'export_summary':
            exportCaseSummary(caseId);
            break;
        case 'generate_report':
            generateStatusReport(caseId);
            break;
        case 'share_link':
            shareReadOnlyLink(caseId);
            break;

        // Section 6: Administrative
        case 'duplicate_case':
            duplicateCase(caseId);
            break;
        case 'archive_case':
            archiveCase(caseId);
            break;
        case 'restore_case':
            restoreCase(caseId);
            break;
        case 'delete_case':
            deleteCaseWithConfirmation(caseId);
            break;
    }
}

// ========================================
// ACTIVITY LOGGING SYSTEM
// ========================================

function logActivity(caseId, action, details = {}) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userName = currentUser.firstName && currentUser.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : 'Unknown User';

    const activity = {
        id: 'activity_' + Date.now(),
        caseId: caseId,
        userId: currentUser.id || null,
        userName: userName,
        timestamp: new Date().toISOString(),
        action: action,
        previousValue: details.previousValue || null,
        newValue: details.newValue || null,
        reason: details.reason || null,
        metadata: details.metadata || {}
    };

    // Get existing activities
    const activities = JSON.parse(localStorage.getItem('caseActivities') || '[]');
    activities.push(activity);
    localStorage.setItem('caseActivities', JSON.stringify(activities));

    return activity;
}

function getCaseActivities(caseId) {
    const activities = JSON.parse(localStorage.getItem('caseActivities') || '[]');
    return activities.filter(a => a.caseId === caseId).sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );
}

// ========================================
// SECTION 1: CASE ACCESS ACTIONS
// ========================================

function viewCaseDashboard(caseId) {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);

    if (!caseItem) {
        alert('Case not found.');
        return;
    }

    // For now, show alert with case details
    // TODO: Implement full case dashboard modal/page
    alert(`Case Dashboard\n\nCase: ${caseItem.name}\nClient: ${caseItem.clientOrganizationName}\nStatus: ${caseItem.status}\nPriority: ${caseItem.priority}\n\n(Full dashboard coming soon)`);

    logActivity(caseId, 'viewed_dashboard');
}

function viewActivityLog(caseId) {
    const modal = document.getElementById('activityLogModal');
    if (!modal) return;

    const activities = getCaseActivities(caseId);
    const tbody = document.getElementById('activityLogBody');

    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #9ca3af;">No activity logged yet</td></tr>';
    } else {
        tbody.innerHTML = activities.map(activity => `
            <tr>
                <td>${new Date(activity.timestamp).toLocaleString()}</td>
                <td>${activity.userName}</td>
                <td>${formatActionName(activity.action)}</td>
                <td>${formatActivityDetails(activity)}</td>
            </tr>
        `).join('');
    }

    modal.classList.add('active');
}

function viewCaseDocuments(caseId) {
    alert('Document viewer coming soon!\n\nThis will show all documents uploaded to this case.');
    logActivity(caseId, 'viewed_documents');
}

// ========================================
// SECTION 2: WORK & COLLABORATION ACTIONS
// ========================================

function openAddActivityModal(caseId) {
    const modal = document.getElementById('addActivityModal');
    if (!modal) return;

    modal.setAttribute('data-case-id', caseId);
    document.getElementById('activityNote').value = '';
    modal.classList.add('active');
}

function saveActivity() {
    const modal = document.getElementById('addActivityModal');
    const caseId = modal.getAttribute('data-case-id');
    const note = document.getElementById('activityNote').value.trim();

    if (!note) {
        alert('Please enter a note.');
        return;
    }

    logActivity(caseId, 'added_note', { metadata: { note } });

    modal.classList.remove('active');
    alert('Activity logged successfully!');
}

function openCreateTaskModal(caseId) {
    alert('Create Task modal coming soon!\n\nThis will allow you to create tasks linked to this case.');
    logActivity(caseId, 'viewed_create_task');
}

function openSendMessageModal(caseId) {
    alert('Send Message modal coming soon!\n\nThis will allow you to send internal messages to team members.');
    logActivity(caseId, 'viewed_send_message');
}

function openUploadDocumentModal(caseId) {
    alert('Upload Document modal coming soon!\n\nThis will integrate with Google Drive to upload case documents.');
    logActivity(caseId, 'viewed_upload_document');
}

// ========================================
// SECTION 3: CASE MANAGEMENT ACTIONS
// ========================================

function openChangeStatusModal(caseId) {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const modal = document.getElementById('changeStatusModal');
    if (!modal) return;

    modal.setAttribute('data-case-id', caseId);
    document.getElementById('newStatus').value = caseItem.status;
    modal.classList.add('active');
}

function saveStatusChange() {
    const modal = document.getElementById('changeStatusModal');
    const caseId = modal.getAttribute('data-case-id');
    const newStatus = document.getElementById('newStatus').value;

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    const previousStatus = cases[caseIndex].status;
    cases[caseIndex].status = newStatus;
    cases[caseIndex].lastActivity = new Date().toISOString();

    localStorage.setItem('cases', JSON.stringify(cases));

    logActivity(caseId, 'status_changed', {
        previousValue: previousStatus,
        newValue: newStatus
    });

    modal.classList.remove('active');
    renderCasesTable();
    alert('Status updated successfully!');
}

function openUpdatePriorityModal(caseId) {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const modal = document.getElementById('updatePriorityModal');
    if (!modal) return;

    modal.setAttribute('data-case-id', caseId);
    document.getElementById('newPriority').value = caseItem.priority;
    modal.classList.add('active');
}

function savePriorityChange() {
    const modal = document.getElementById('updatePriorityModal');
    const caseId = modal.getAttribute('data-case-id');
    const newPriority = document.getElementById('newPriority').value;

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    const previousPriority = cases[caseIndex].priority;
    cases[caseIndex].priority = newPriority;
    cases[caseIndex].lastActivity = new Date().toISOString();

    localStorage.setItem('cases', JSON.stringify(cases));

    logActivity(caseId, 'priority_changed', {
        previousValue: previousPriority,
        newValue: newPriority
    });

    modal.classList.remove('active');
    renderCasesTable();
    alert('Priority updated successfully!');
}

function openSetDeadlineModal(caseId) {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const modal = document.getElementById('setDeadlineModal');
    if (!modal) return;

    modal.setAttribute('data-case-id', caseId);

    if (caseItem.nextDeadline) {
        const date = new Date(caseItem.nextDeadline);
        document.getElementById('newDeadline').value = date.toISOString().split('T')[0];
    } else {
        document.getElementById('newDeadline').value = '';
    }

    modal.classList.add('active');
}

function saveDeadlineChange() {
    const modal = document.getElementById('setDeadlineModal');
    const caseId = modal.getAttribute('data-case-id');
    const newDeadline = document.getElementById('newDeadline').value;

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    const previousDeadline = cases[caseIndex].nextDeadline;
    cases[caseIndex].nextDeadline = newDeadline ? new Date(newDeadline).toISOString() : null;
    cases[caseIndex].lastActivity = new Date().toISOString();

    localStorage.setItem('cases', JSON.stringify(cases));

    logActivity(caseId, 'deadline_changed', {
        previousValue: previousDeadline,
        newValue: newDeadline
    });

    modal.classList.remove('active');
    renderCasesTable();
    alert('Deadline updated successfully!');
}

function openAssignLeadModal(caseId) {
    alert('Assign Lead modal coming soon!\n\nThis will allow you to assign or reassign the case lead.');
    logActivity(caseId, 'viewed_assign_lead');
}

function openManageTagsModal(caseId) {
    alert('Manage Tags modal coming soon!\n\nThis will allow you to add and edit case tags.');
    logActivity(caseId, 'viewed_manage_tags');
}

// ========================================
// SECTION 4: RISK & COMPLIANCE ACTIONS
// ========================================

function openFlagRiskModal(caseId) {
    const modal = document.getElementById('flagRiskModal');
    if (!modal) return;

    modal.setAttribute('data-case-id', caseId);
    document.getElementById('riskReason').value = '';
    modal.classList.add('active');
}

function saveFlagRisk() {
    const modal = document.getElementById('flagRiskModal');
    const caseId = modal.getAttribute('data-case-id');
    const reason = document.getElementById('riskReason').value.trim();

    if (!reason) {
        alert('Please provide a reason for flagging this case as at risk.');
        return;
    }

    logActivity(caseId, 'flagged_at_risk', {
        reason: reason,
        metadata: { requiresAdminNotification: true }
    });

    modal.classList.remove('active');
    alert('Case flagged as at risk. Admin has been notified.');
}

function openEscalateCaseModal(caseId) {
    alert('Escalate Case modal coming soon!\n\nThis will escalate the case to leadership/compliance.');
    logActivity(caseId, 'viewed_escalate');
}

function openComplianceNoteModal(caseId) {
    alert('Compliance Note modal coming soon!\n\nThis will create a restricted audit note.');
    logActivity(caseId, 'viewed_compliance_note');
}

function lockCase(caseId) {
    if (!confirm('Are you sure you want to lock this case for legal hold?\n\nThis will prevent further edits.')) {
        return;
    }

    logActivity(caseId, 'case_locked', {
        metadata: { legalHold: true }
    });

    alert('Case locked for legal hold.');
}

// ========================================
// SECTION 5: REPORTING & EXPORT ACTIONS
// ========================================

function exportCaseSummary(caseId) {
    alert('Export Case Summary coming soon!\n\nThis will generate a PDF summary of the case.');
    logActivity(caseId, 'exported_summary');
}

function generateStatusReport(caseId) {
    alert('Generate Status Report coming soon!\n\nThis will produce a formatted status report.');
    logActivity(caseId, 'generated_report');
}

function shareReadOnlyLink(caseId) {
    alert('Share Read-Only Link coming soon!\n\nThis will create a limited-access view link.');
    logActivity(caseId, 'shared_link');
}

// ========================================
// SECTION 6: ADMINISTRATIVE ACTIONS
// ========================================

function duplicateCase(caseId) {
    if (!confirm('Duplicate this case?\n\nThis will copy the case structure only (no documents or activities).')) {
        return;
    }

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);

    if (!caseItem) return;

    const newCase = {
        ...caseItem,
        id: 'case_' + Date.now(),
        name: caseItem.name + ' (Copy)',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    };

    cases.push(newCase);
    localStorage.setItem('cases', JSON.stringify(cases));

    logActivity(caseId, 'case_duplicated', {
        metadata: { newCaseId: newCase.id }
    });

    renderCasesTable();
    alert('Case duplicated successfully!');
}

function archiveCase(caseId) {
    if (!confirm('Archive this case?\n\nThe case will be removed from active lists but can be restored later.')) {
        return;
    }

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    cases[caseIndex].status = 'archived';
    cases[caseIndex].lastActivity = new Date().toISOString();

    localStorage.setItem('cases', JSON.stringify(cases));

    logActivity(caseId, 'case_archived');

    renderCasesTable();
    alert('Case archived successfully!');
}

function restoreCase(caseId) {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex === -1) return;

    cases[caseIndex].status = 'active';
    cases[caseIndex].lastActivity = new Date().toISOString();

    localStorage.setItem('cases', JSON.stringify(cases));

    logActivity(caseId, 'case_restored');

    renderCasesTable();
    alert('Case restored successfully!');
}

function deleteCaseWithConfirmation(caseId) {
    if (!confirm('⚠️ DELETE CASE PERMANENTLY?\n\nThis action CANNOT be undone.\n\nAll case data, activities, and documents will be permanently deleted.')) {
        return;
    }

    if (!confirm('Are you absolutely sure?\n\nType DELETE in the next prompt to confirm.')) {
        return;
    }

    const confirmation = prompt('Type DELETE to confirm permanent deletion:');
    if (confirmation !== 'DELETE') {
        alert('Deletion cancelled.');
        return;
    }

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const filteredCases = cases.filter(c => c.id !== caseId);

    localStorage.setItem('cases', JSON.stringify(filteredCases));

    // Log before deleting
    logActivity(caseId, 'case_deleted', {
        metadata: { permanentDeletion: true }
    });

    renderCasesTable();
    alert('Case deleted permanently.');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatActionName(action) {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatActivityDetails(activity) {
    if (activity.previousValue && activity.newValue) {
        return `Changed from "${activity.previousValue}" to "${activity.newValue}"`;
    }
    if (activity.reason) {
        return activity.reason;
    }
    if (activity.metadata && activity.metadata.note) {
        return activity.metadata.note;
    }
    return '-';
}

// Close menu on ESC key globally
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeCaseMenuId) {
        closeCaseMenu();
    }
});

// ========================================
// EXPOSE FUNCTIONS
// ========================================

window.toggleCaseMenu = toggleCaseMenu;
window.closeCaseMenu = closeCaseMenu;
window.handleMenuAction = handleMenuAction;
window.saveActivity = saveActivity;
window.saveStatusChange = saveStatusChange;
window.savePriorityChange = savePriorityChange;
window.saveDeadlineChange = saveDeadlineChange;
window.saveFlagRisk = saveFlagRisk;
window.viewActivityLog = viewActivityLog;
