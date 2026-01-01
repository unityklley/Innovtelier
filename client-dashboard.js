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

    return {
        totalClients: clientOrgs.length,
        activeClients: activeClients,
        totalUsers: clientUsers.length,
        recentSignups: recentSignups
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
            ? `${primaryContact.firstName} ${primaryContact.lastName}<br><small style="color: #6b7280;">${primaryContact.email}</small>`
            : '<span style="color: #9ca3af;">No admin assigned</span>';

        // Format date
        const dateJoined = org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A';

        // Status badge
        const statusClass = org.status === 'active' ? 'status-badge-active' : 'status-badge-inactive';
        const statusBadge = `<span class="${statusClass}">${org.status || 'active'}</span>`;

        return `
            <tr>
                <td><strong>${org.clientId || 'N/A'}</strong></td>
                <td><strong>${org.name}</strong></td>
                <td>${totalUsers}</td>
                <td>${adminCount}</td>
                <td>${activeUserCount}</td>
                <td>${contactInfo}</td>
                <td>${dateJoined}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="viewClientDetails('${org.id}')" 
                        style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">
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
            ? `${primaryContact.firstName} ${primaryContact.lastName}<br><small style="color: #6b7280;">${primaryContact.email}</small>`
            : '<span style="color: #9ca3af;">No admin assigned</span>';

        const dateJoined = org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A';
        const statusClass = org.status === 'active' ? 'status-badge-active' : 'status-badge-inactive';
        const statusBadge = `<span class="${statusClass}">${org.status || 'active'}</span>`;

        return `
            <tr>
                <td><strong>${org.clientId || 'N/A'}</strong></td>
                <td><strong>${org.name}</strong></td>
                <td>${totalUsers}</td>
                <td>${adminCount}</td>
                <td>${activeUserCount}</td>
                <td>${contactInfo}</td>
                <td>${dateJoined}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="viewClientDetails('${org.id}')" 
                        style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">
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
