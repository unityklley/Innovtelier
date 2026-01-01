// Client Dashboard Functions for Master Admin

// Load Client Dashboard
function loadClientDashboard() {
    console.log('Loading Client Dashboard...');

    // Load statistics
    const stats = getClientStatistics();
    document.getElementById('totalClientsCount').textContent = stats.totalClients;
    document.getElementById('activeClientsCount').textContent = stats.activeClients;
    document.getElementById('totalClientUsersCount').textContent = stats.totalUsers;
    document.getElementById('recentSignupsCount').textContent = stats.recentSignups;

    // New metrics
    const inactiveEl = document.getElementById('inactiveClientsCount');
    const needAdminEl = document.getElementById('clientsNeedingAdminCount');
    const avgUsersEl = document.getElementById('avgUsersPerClientCount');

    if (inactiveEl) inactiveEl.textContent = stats.inactiveClients;
    if (needAdminEl) needAdminEl.textContent = stats.clientsNeedingAdmin;
    if (avgUsersEl) avgUsersEl.textContent = stats.avgUsersPerClient;

    // Load client organizations table
    loadClientOrganizations();
}

// Get Client Statistics
function getClientStatistics() {
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Filter only client organizations
    const clientOrgs = organizations.filter(org => org.type === 'client');

    // Count active clients
    const activeClients = clientOrgs.filter(org => org.status === 'active').length;

    // Count inactive clients
    const inactiveClients = clientOrgs.filter(org => org.status === 'inactive').length;

    // Count total users in client organizations
    const clientOrgIds = clientOrgs.map(org => org.id);
    const clientUsers = users.filter(user => clientOrgIds.includes(user.organizationId));

    // Count recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSignups = clientOrgs.filter(org => {
        const createdDate = new Date(org.createdAt);
        return createdDate >= thirtyDaysAgo;
    }).length;

    // Count clients needing admin assignment
    const clientsNeedingAdmin = clientOrgs.filter(org => {
        const orgUsers = users.filter(u => u.organizationId === org.id);
        const hasAdmin = orgUsers.some(u => u.role === 'client_admin');
        return !hasAdmin;
    }).length;

    // Calculate average users per client
    const avgUsersPerClient = clientOrgs.length > 0
        ? (clientUsers.length / clientOrgs.length).toFixed(1)
        : 0;

    return {
        totalClients: clientOrgs.length,
        activeClients: activeClients,
        inactiveClients: inactiveClients,
        totalUsers: clientUsers.length,
        recentSignups: recentSignups,
        clientsNeedingAdmin: clientsNeedingAdmin,
        avgUsersPerClient: avgUsersPerClient
    };
}

// Load Client Organizations Table
function loadClientOrganizations() {
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tableBody = document.getElementById('clientOrganizationsTableBody');

    if (!tableBody) return;

    // Filter only client organizations
    const clientOrgs = organizations.filter(org => org.type === 'client');

    if (clientOrgs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: #6b7280;">
                    No client organizations found
                </td>
            </tr>
        `;
        return;
    }

    // Build table rows
    const rows = clientOrgs.map(org => {
        // Get organization metrics
        const orgUsers = users.filter(u => u.organizationId === org.id);
        const totalUsers = orgUsers.length;
        const adminCount = orgUsers.filter(u => u.role === 'client_admin').length;
        const activeUserCount = orgUsers.filter(u => u.status === 'active').length;

        // Get primary contact (first client admin)
        const primaryContact = orgUsers.find(u => u.role === 'client_admin');
        const contactInfo = primaryContact
            ? `<div style="line-height: 1.4;">
                <div style="font-weight: 500; color: #111827;">${primaryContact.firstName} ${primaryContact.lastName}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">${primaryContact.email}</div>
               </div>`
            : '<span style="display: inline-flex; align-items: center; gap: 0.25rem; color: #f59e0b; font-size: 0.875rem;"><i class="fas fa-exclamation-circle"></i> Assign Admin</span>';

        // Format date
        const dateJoined = org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A';

        // Status badge
        const statusClass = org.status === 'active' ? 'status-badge-active' : 'status-badge-inactive';
        const statusBadge = `<span class="${statusClass}">${org.status || 'active'}</span>`;

        return `
            <tr style="transition: all 0.2s;" onmouseenter="this.style.backgroundColor='#f9fafb'" onmouseleave="this.style.backgroundColor='white'">
                <td style="font-family: 'Courier New', monospace; color: #6b7280; font-size: 0.875rem;">${org.clientId || 'N/A'}</td>
                <td class="editable-cell" onclick="editClientOrgName('${org.id}', event)" title="Click to edit">
                    <div style="font-weight: 600; color: #111827;">${org.name}</div>
                </td>
                <td><span style="display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; padding: 0.25rem 0.5rem; background: #eff6ff; color: #3b82f6; border-radius: 4px; font-weight: 500;">${totalUsers}</span></td>
                <td><span style="display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; padding: 0.25rem 0.5rem; background: ${adminCount > 0 ? '#f0fdf4' : '#fef2f2'}; color: ${adminCount > 0 ? '#16a34a' : '#dc2626'}; border-radius: 4px; font-weight: 500;">${adminCount}</span></td>
                <td><span style="display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; padding: 0.25rem 0.5rem; background: #f3f4f6; color: #374151; border-radius: 4px; font-weight: 500;">${activeUserCount}</span></td>
                <td class="editable-cell" onclick="editClientContact('${org.id}', event)" title="Click to assign/change admin">${contactInfo}</td>
                <td style="color: #6b7280; font-size: 0.875rem;">${dateJoined}</td>
                <td class="editable-cell" onclick="editClientStatus('${org.id}', event)" title="Click to edit">${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewClientDetails('${org.id}')" 
                        style="padding: 0.375rem 0.875rem; font-size: 0.875rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}

// Filter Client Organizations
function filterClientOrganizations() {
    const searchTerm = document.getElementById('clientSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('clientStatusFilter')?.value || '';

    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tableBody = document.getElementById('clientOrganizationsTableBody');

    if (!tableBody) return;

    // Filter client organizations
    let clientOrgs = organizations.filter(org => org.type === 'client');

    // Apply filters
    if (searchTerm) {
        clientOrgs = clientOrgs.filter(org =>
            org.name?.toLowerCase().includes(searchTerm) ||
            org.clientId?.toLowerCase().includes(searchTerm)
        );
    }

    if (statusFilter) {
        clientOrgs = clientOrgs.filter(org => org.status === statusFilter);
    }

    if (clientOrgs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: #6b7280;">
                    No matching client organizations found
                </td>
            </tr>
        `;
        return;
    }

    // Build filtered table rows (same logic as loadClientOrganizations)
    const rows = clientOrgs.map(org => {
        const orgUsers = users.filter(u => u.organizationId === org.id);
        const totalUsers = orgUsers.length;
        const adminCount = orgUsers.filter(u => u.role === 'client_admin').length;
        const activeUserCount = orgUsers.filter(u => u.status === 'active').length;

        const primaryContact = orgUsers.find(u => u.role === 'client_admin');
        const contactInfo = primaryContact
            ? `<div style="line-height: 1.4;">
                <div style="font-weight: 500; color: #111827;">${primaryContact.firstName} ${primaryContact.lastName}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">${primaryContact.email}</div>
               </div>`
            : '<span style="display: inline-flex; align-items: center; gap: 0.25rem; color: #f59e0b; font-size: 0.875rem;"><i class="fas fa-exclamation-circle"></i> Assign Admin</span>';

        const dateJoined = org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A';
        const statusClass = org.status === 'active' ? 'status-badge-active' : 'status-badge-inactive';
        const statusBadge = `<span class="${statusClass}">${org.status || 'active'}</span>`;

        return `
            <tr style="transition: all 0.2s;" onmouseenter="this.style.backgroundColor='#f9fafb'" onmouseleave="this.style.backgroundColor='white'">
                <td style="font-family: 'Courier New', monospace; color: #6b7280; font-size: 0.875rem;">${org.clientId || 'N/A'}</td>
                <td class="editable-cell" onclick="editClientOrgName('${org.id}', event)" title="Click to edit">
                    <div style="font-weight: 600; color: #111827;">${org.name}</div>
                </td>
                <td><span style="display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; padding: 0.25rem 0.5rem; background: #eff6ff; color: #3b82f6; border-radius: 4px; font-weight: 500;">${totalUsers}</span></td>
                <td><span style="display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; padding: 0.25rem 0.5rem; background: ${adminCount > 0 ? '#f0fdf4' : '#fef2f2'}; color: ${adminCount > 0 ? '#16a34a' : '#dc2626'}; border-radius: 4px; font-weight: 500;">${adminCount}</span></td>
                <td><span style="display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; padding: 0.25rem 0.5rem; background: #f3f4f6; color: #374151; border-radius: 4px; font-weight: 500;">${activeUserCount}</span></td>
                <td class="editable-cell" onclick="editClientContact('${org.id}', event)" title="Click to assign/change admin">${contactInfo}</td>
                <td style="color: #6b7280; font-size: 0.875rem;">${dateJoined}</td>
                <td class="editable-cell" onclick="editClientStatus('${org.id}', event)" title="Click to edit">${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewClientDetails('${org.id}')" 
                        style="padding: 0.375rem 0.875rem; font-size: 0.875rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}

// View Client Details (placeholder for future implementation)
function viewClientDetails(orgId) {
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const org = organizations.find(o => o.id === orgId);

    if (!org) {
        alert('Organization not found.');
        return;
    }

    alert(`Client Details:\n\nOrganization: ${org.name}\nClient ID: ${org.clientId}\nStatus: ${org.status}\n\n(Detailed view coming soon)`);
}

// Export Clients to Excel
function exportClientsToExcel() {
    const searchTerm = document.getElementById('clientSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('clientStatusFilter')?.value || '';

    const filtersApplied = searchTerm || statusFilter;

    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Filter client organizations
    let clientOrgs = organizations.filter(org => org.type === 'client');

    if (filtersApplied) {
        if (searchTerm) {
            clientOrgs = clientOrgs.filter(org =>
                org.name?.toLowerCase().includes(searchTerm) ||
                org.clientId?.toLowerCase().includes(searchTerm)
            );
        }
        if (statusFilter) {
            clientOrgs = clientOrgs.filter(org => org.status === statusFilter);
        }
    }

    if (clientOrgs.length === 0) {
        alert('No client organizations to export.');
        return;
    }

    // Prepare data for Excel
    const excelData = clientOrgs.map(org => {
        const orgUsers = users.filter(u => u.organizationId === org.id);
        const totalUsers = orgUsers.length;
        const adminCount = orgUsers.filter(u => u.role === 'client_admin').length;
        const activeUserCount = orgUsers.filter(u => u.status === 'active').length;

        const primaryContact = orgUsers.find(u => u.role === 'client_admin');
        const contactName = primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : '';
        const contactEmail = primaryContact ? primaryContact.email : '';

        return {
            'Client ID': org.clientId || '',
            'Organization Name': org.name || '',
            'Total Users': totalUsers,
            'Admins': adminCount,
            'Active Users': activeUserCount,
            'Primary Contact Name': contactName,
            'Primary Contact Email': contactEmail,
            'Date Joined': org.createdAt ? new Date(org.createdAt).toLocaleDateString() : '',
            'Status': org.status || 'active',
            'Drive Folder ID': org.driveFolderId || ''
        };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
        { wch: 12 }, // Client ID
        { wch: 30 }, // Organization Name
        { wch: 12 }, // Total Users
        { wch: 10 }, // Admins
        { wch: 12 }, // Active Users
        { wch: 25 }, // Primary Contact Name
        { wch: 30 }, // Primary Contact Email
        { wch: 15 }, // Date Joined
        { wch: 10 }, // Status
        { wch: 20 }  // Drive Folder ID
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Client Organizations');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filterSuffix = filtersApplied ? '_filtered' : '_all';
    const filename = `client_organizations${filterSuffix}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);

    // Show success message
    const message = filtersApplied
        ? `Exported ${clientOrgs.length} filtered client organization(s) to ${filename}`
        : `Exported all ${clientOrgs.length} client organization(s) to ${filename}`;
    alert(message);
}

// Expose functions to window
window.loadClientDashboard = loadClientDashboard;
window.filterClientOrganizations = filterClientOrganizations;
window.viewClientDetails = viewClientDetails;
window.exportClientsToExcel = exportClientsToExcel;

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Client search input
    const clientSearchInput = document.getElementById('clientSearchInput');
    if (clientSearchInput) {
        clientSearchInput.addEventListener('input', filterClientOrganizations);
    }

    // Client status filter
    const clientStatusFilter = document.getElementById('clientStatusFilter');
    if (clientStatusFilter) {
        clientStatusFilter.addEventListener('change', filterClientOrganizations);
    }
});
