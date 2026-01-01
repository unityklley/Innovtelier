// ========================================
// CLIENT INLINE EDITING FUNCTIONS
// ========================================

let currentClientEditingCell = null;

// Edit Client Organization Name
function editClientOrgName(orgId, event) {
    event.stopPropagation();

    const cell = event.currentTarget;
    if (cell.classList.contains('editing')) return;

    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const org = organizations.find(o => o.id === orgId);
    if (!org) return;

    const currentValue = org.name;

    currentClientEditingCell = cell;
    cell.classList.add('editing');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-edit-input';
    input.value = currentValue;
    input.style.fontWeight = '600';

    input.onblur = () => {
        setTimeout(() => saveClientOrgName(orgId, input.value, cell, currentValue), 100);
    };

    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            saveClientOrgName(orgId, input.value, cell, currentValue);
        } else if (e.key === 'Escape') {
            cancelClientEdit(cell, `<div style="font-weight: 600; color: #111827;">${currentValue}</div>`);
        }
    };

    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();
}

function saveClientOrgName(orgId, newName, cell, oldName) {
    newName = newName.trim();

    if (!newName || newName === oldName) {
        cancelClientEdit(cell, `<div style="font-weight: 600; color: #111827;">${oldName}</div>`);
        return;
    }

    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const orgIndex = organizations.findIndex(o => o.id === orgId);

    if (orgIndex === -1) return;

    organizations[orgIndex].name = newName;
    localStorage.setItem('organizations', JSON.stringify(organizations));

    cell.classList.remove('editing');
    cell.innerHTML = `<div style="font-weight: 600; color: #111827;">${newName}</div>`;
    currentClientEditingCell = null;

    // Show success feedback
    cell.style.backgroundColor = '#d1fae5';
    setTimeout(() => { cell.style.backgroundColor = ''; }, 1000);
}

// Edit Client Status
function editClientStatus(orgId, event) {
    event.stopPropagation();

    const cell = event.currentTarget;
    if (cell.classList.contains('editing')) return;

    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const org = organizations.find(o => o.id === orgId);
    if (!org) return;

    const currentValue = org.status || 'active';

    currentClientEditingCell = cell;
    cell.classList.add('editing');

    const select = document.createElement('select');
    select.className = 'inline-edit-select';
    select.innerHTML = `
        <option value="active" ${currentValue === 'active' ? 'selected' : ''}>Active</option>
        <option value="inactive" ${currentValue === 'inactive' ? 'selected' : ''}>Inactive</option>
        <option value="pending" ${currentValue === 'pending' ? 'selected' : ''}>Pending</option>
    `;

    select.onchange = () => saveClientStatus(orgId, select.value, cell, currentValue);
    select.onblur = () => {
        setTimeout(() => {
            const statusClass = currentValue === 'active' ? 'status-badge-active' : 'status-badge-inactive';
            const statusBadge = `<span class="${statusClass}">${currentValue}</span>`;
            cancelClientEdit(cell, statusBadge);
        }, 100);
    };
    select.onkeydown = (e) => {
        if (e.key === 'Escape') {
            const statusClass = currentValue === 'active' ? 'status-badge-active' : 'status-badge-inactive';
            const statusBadge = `<span class="${statusClass}">${currentValue}</span>`;
            cancelClientEdit(cell, statusBadge);
        }
    };

    cell.innerHTML = '';
    cell.appendChild(select);
    select.focus();
}

function saveClientStatus(orgId, newStatus, cell, oldStatus) {
    if (newStatus === oldStatus) {
        const statusClass = oldStatus === 'active' ? 'status-badge-active' : 'status-badge-inactive';
        const statusBadge = `<span class="${statusClass}">${oldStatus}</span>`;
        cancelClientEdit(cell, statusBadge);
        return;
    }

    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const orgIndex = organizations.findIndex(o => o.id === orgId);

    if (orgIndex === -1) return;

    organizations[orgIndex].status = newStatus;
    localStorage.setItem('organizations', JSON.stringify(organizations));

    cell.classList.remove('editing');
    const statusClass = newStatus === 'active' ? 'status-badge-active' : 'status-badge-inactive';
    const statusBadge = `<span class="${statusClass}">${newStatus}</span>`;
    cell.innerHTML = statusBadge;
    currentClientEditingCell = null;

    // Refresh stats
    if (typeof loadClientDashboard === 'function') {
        const stats = getClientStatistics();
        document.getElementById('activeClientsCount').textContent = stats.activeClients;
    }

    // Show success feedback
    cell.style.backgroundColor = '#d1fae5';
    setTimeout(() => { cell.style.backgroundColor = ''; }, 1000);
}

// Edit Client Contact (Assign Admin)
function editClientContact(orgId, event) {
    event.stopPropagation();

    const cell = event.currentTarget;
    if (cell.classList.contains('editing')) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const orgUsers = users.filter(u => u.organizationId === orgId);

    if (orgUsers.length === 0) {
        alert('No users found for this organization. Please add users first.');
        return;
    }

    const currentContact = orgUsers.find(u => u.role === 'client_admin');
    const currentValue = currentContact ? currentContact.id : '';

    currentClientEditingCell = cell;
    cell.classList.add('editing');

    const select = document.createElement('select');
    select.className = 'inline-edit-select';
    select.innerHTML = `
        <option value="">-- Select Admin --</option>
        ${orgUsers.map(user => {
        const userName = `${user.firstName} ${user.lastName}`;
        const isSelected = user.id === currentValue;
        return `<option value="${user.id}" ${isSelected ? 'selected' : ''}>${userName}</option>`;
    }).join('')}
    `;

    select.onchange = () => saveClientContact(orgId, select.value, cell, currentValue);
    select.onblur = () => {
        setTimeout(() => {
            const contactInfo = currentContact
                ? `<div style="line-height: 1.4;">
                    <div style="font-weight: 500; color: #111827;">${currentContact.firstName} ${currentContact.lastName}</div>
                    <div style="font-size: 0.75rem; color: #6b7280;">${currentContact.email}</div>
                   </div>`
                : '<span style="display: inline-flex; align-items: center; gap: 0.25rem; color: #f59e0b; font-size: 0.875rem;"><i class="fas fa-exclamation-circle"></i> Assign Admin</span>';
            cancelClientEdit(cell, contactInfo);
        }, 100);
    };
    select.onkeydown = (e) => {
        if (e.key === 'Escape') {
            const contactInfo = currentContact
                ? `<div style="line-height: 1.4;">
                    <div style="font-weight: 500; color: #111827;">${currentContact.firstName} ${currentContact.lastName}</div>
                    <div style="font-size: 0.75rem; color: #6b7280;">${currentContact.email}</div>
                   </div>`
                : '<span style="display: inline-flex; align-items: center; gap: 0.25rem; color: #f59e0b; font-size: 0.875rem;"><i class="fas fa-exclamation-circle"></i> Assign Admin</span>';
            cancelClientEdit(cell, contactInfo);
        }
    };

    cell.innerHTML = '';
    cell.appendChild(select);
    select.focus();
}

function saveClientContact(orgId, newContactId, cell, oldContactId) {
    if (!newContactId || newContactId === oldContactId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentContact = users.find(u => u.id === oldContactId);
        const contactInfo = currentContact
            ? `<div style="line-height: 1.4;">
                <div style="font-weight: 500; color: #111827;">${currentContact.firstName} ${currentContact.lastName}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">${currentContact.email}</div>
               </div>`
            : '<span style="display: inline-flex; align-items: center; gap: 0.25rem; color: #f59e0b; font-size: 0.875rem;"><i class="fas fa-exclamation-circle"></i> Assign Admin</span>';
        cancelClientEdit(cell, contactInfo);
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Remove admin role from old contact
    if (oldContactId) {
        const oldContactIndex = users.findIndex(u => u.id === oldContactId);
        if (oldContactIndex !== -1) {
            users[oldContactIndex].role = 'client-user';
        }
    }

    // Add admin role to new contact
    const newContactIndex = users.findIndex(u => u.id === newContactId);
    if (newContactIndex === -1) return;

    users[newContactIndex].role = 'client_admin';
    localStorage.setItem('users', JSON.stringify(users));

    const newContact = users[newContactIndex];
    const contactInfo = `<div style="line-height: 1.4;">
        <div style="font-weight: 500; color: #111827;">${newContact.firstName} ${newContact.lastName}</div>
        <div style="font-size: 0.75rem; color: #6b7280;">${newContact.email}</div>
       </div>`;

    cell.classList.remove('editing');
    cell.innerHTML = contactInfo;
    currentClientEditingCell = null;

    // Refresh the table to update admin counts
    if (typeof loadClientOrganizations === 'function') {
        loadClientOrganizations();
    }

    // Show success feedback
    cell.style.backgroundColor = '#d1fae5';
    setTimeout(() => { cell.style.backgroundColor = ''; }, 1000);
}

function cancelClientEdit(cell, originalContent) {
    if (!cell) return;
    cell.classList.remove('editing');
    cell.innerHTML = originalContent;
    currentClientEditingCell = null;
}

// Expose functions
window.editClientOrgName = editClientOrgName;
window.editClientStatus = editClientStatus;
window.editClientContact = editClientContact;
