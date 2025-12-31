// Excel Export Functionality for User Management

// Export users to Excel
function exportUsersToExcel() {
    // Get current filter values
    const searchTerm = document.getElementById('userSearchInput')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('userRoleFilter')?.value || '';
    const statusFilter = document.getElementById('userStatusFilter')?.value || '';

    // Check if filters are applied
    const filtersApplied = searchTerm || roleFilter || statusFilter;

    // Get all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Filter users if filters are applied
    let usersToExport = users;
    if (filtersApplied) {
        usersToExport = users.filter(user => {
            const matchesSearch = !searchTerm ||
                (user.firstName?.toLowerCase().includes(searchTerm) ||
                    user.lastName?.toLowerCase().includes(searchTerm) ||
                    user.email?.toLowerCase().includes(searchTerm));

            const matchesRole = !roleFilter || user.role === roleFilter;
            const matchesStatus = !statusFilter || user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }

    if (usersToExport.length === 0) {
        alert('No users to export.');
        return;
    }

    // Prepare data for Excel
    const excelData = usersToExport.map(user => ({
        'First Name': user.firstName || '',
        'Last Name': user.lastName || '',
        'Email': user.email || '',
        'Job Title': user.jobTitle || '',
        'Phone': user.phone || '',
        'Organization': user.organizationName || '',
        'Role': formatRoleForExport(user.role),
        'Status': capitalizeFirst(user.status || ''),
        'Authorizing Contact Name': user.authorizingContactName || '',
        'Authorizing Contact Email': user.authorizingContactEmail || '',
        'Date Created': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
        'Last Modified': user.modifiedAt ? new Date(user.modifiedAt).toLocaleDateString() : 'Never'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 30 }, // Email
        { wch: 20 }, // Job Title
        { wch: 15 }, // Phone
        { wch: 25 }, // Organization
        { wch: 15 }, // Role
        { wch: 12 }, // Status
        { wch: 25 }, // Auth Contact Name
        { wch: 30 }, // Auth Contact Email
        { wch: 15 }, // Date Created
        { wch: 15 }  // Last Modified
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filterSuffix = filtersApplied ? '_filtered' : '_all';
    const filename = `users_export${filterSuffix}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);

    // Show success message
    const message = filtersApplied
        ? `Exported ${usersToExport.length} filtered user(s) to ${filename}`
        : `Exported all ${usersToExport.length} user(s) to ${filename}`;
    alert(message);
}

// Helper function to format role for export
function formatRoleForExport(role) {
    if (!role) return '';
    const roleMap = {
        'master_admin': 'Master Admin',
        'client_admin': 'Client Admin',
        'client_user': 'Client User'
    };
    return roleMap[role] || role;
}

// Helper function to capitalize first letter
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Expose to window
window.exportUsersToExcel = exportUsersToExcel;
