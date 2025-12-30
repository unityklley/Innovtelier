// Unified Dashboard - Role-Based Access Control
const Dashboard = {
    currentUser: null,

    init() {
        console.log('Dashboard init started');
        // alert('Debug: Dashboard JS v3 Loaded'); // Uncomment for debugging if needed

        try {
            // Get current user
            this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

            if (!this.currentUser || this.currentUser.status !== 'active') {
                window.location.href = 'auth.html';
                return;
            }

            // Display user info
            this.displayUserInfo();

            // Load appropriate dashboard based on role
            if (this.currentUser.role === 'master-admin') {
                this.loadMasterAdminDashboard();
            } else {
                this.loadClientDashboard();
            }
        } catch (error) {
            console.error('Dashboard Error:', error);
            alert('Dashboard Error: ' + error.message);
        }
    },

    displayUserInfo() {
        document.getElementById('userName').textContent =
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.getElementById('userRole').textContent =
            this.currentUser.role === 'master-admin' ? 'Master Admin' : 'Client Admin';

        if (this.currentUser.organizationName) {
            document.getElementById('userOrg').textContent = this.currentUser.organizationName;
            document.getElementById('userOrg').style.display = 'inline';
        }
    },

    loadMasterAdminDashboard() {
        // Show admin sections
        document.getElementById('masterAdminPanel').style.display = 'block';
        document.getElementById('clientPortalPanel').style.display = 'none';

        // Ensure Client Sidebar is hidden (Master Admin view)
        document.getElementById('clientSidebar').style.display = 'none';
        document.getElementById('pageTitle').textContent = 'Master Admin Portal';

        // Ensure standard content container is visible
        document.getElementById('dashboardContent').style.display = 'block';

        // Load admin data
        this.loadAdminStats();
        this.loadPendingApprovals();
        this.loadAllUsers();
        this.loadOrganizations();
    },

    loadClientDashboard() {
        // Show client sections
        document.getElementById('masterAdminPanel').style.display = 'none';
        document.getElementById('clientPortalPanel').style.display = 'block';

        // Show Sidebar for Client
        document.getElementById('clientSidebar').style.display = 'flex';
        document.getElementById('topBar').style.display = 'flex'; // Ensure top bar is visible

        // Initialize Default View
        this.switchTab('home');

        // Load client data (filtered by organization)
        this.loadClientStats();
        this.loadClientProjects();
        this.loadClientInvoices();
        this.loadClientTeam();
    },

    switchTab(tabName) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const activeItem = document.querySelector(`.nav-item[onclick="switchTab('${tabName}')"]`);
        if (activeItem) activeItem.classList.add('active');

        // Hide all views first
        document.getElementById('dashboardContent').style.display = 'none';
        document.getElementById('iframeCases').classList.remove('active');
        document.getElementById('iframeReports').classList.remove('active');

        // Hide internal client views
        document.getElementById('clientHomeView').style.display = 'none';
        document.getElementById('clientDocsView').style.display = 'none';
        document.getElementById('clientAdminView').style.display = 'none';

        const pageTitle = document.getElementById('pageTitle');

        switch (tabName) {
            case 'home':
                document.getElementById('dashboardContent').style.display = 'block';
                document.getElementById('clientHomeView').style.display = 'block';
                pageTitle.textContent = 'Client Portal';
                break;
            case 'cases':
                document.getElementById('iframeCases').classList.add('active');
                if (!document.getElementById('iframeCases').src) {
                    document.getElementById('iframeCases').src = 'paralegal-dashboard.html';
                }
                pageTitle.textContent = 'Case Management';
                break;
            case 'reports':
                document.getElementById('iframeReports').classList.add('active');
                if (!document.getElementById('iframeReports').src) {
                    document.getElementById('iframeReports').src = 'reports-dashboard.html';
                }
                pageTitle.textContent = 'Reports & Analytics';
                break;
            case 'docs':
                document.getElementById('dashboardContent').style.display = 'block';
                document.getElementById('clientDocsView').style.display = 'block';
                pageTitle.textContent = 'Internal Documents';
                break;
            case 'admin':
                document.getElementById('dashboardContent').style.display = 'block';
                document.getElementById('clientAdminView').style.display = 'block';
                pageTitle.textContent = 'Admin Settings';
                break;
        }
    },

    loadClientTeam() {
        const users = this.getOrganizationUsers();
        const tbody = document.getElementById('clientTeamTable');

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">
                        No team members yet
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${this.formatRole(user.role)}</td>
                <td><span class="badge badge-${user.status}">${user.status}</span></td>
                <td>${this.formatDate(user.createdAt)}</td>
            </tr>
        `).join('');
    },

    openAddClientUserModal() {
        const domain = this.currentUser.email.split('@')[1];
        document.getElementById('userDomainDisplay').textContent = domain;
        document.getElementById('addClientUserModal').classList.add('active');

        // Clear inputs
        document.getElementById('newMemberFirstName').value = '';
        document.getElementById('newMemberLastName').value = '';
        document.getElementById('newMemberEmail').value = '';
        document.getElementById('newMemberRole').value = 'client-user';
    },

    confirmAddClientUser() {
        const firstName = document.getElementById('newMemberFirstName').value.trim();
        const lastName = document.getElementById('newMemberLastName').value.trim();
        const email = document.getElementById('newMemberEmail').value.trim();
        const role = document.getElementById('newMemberRole').value;

        if (!firstName || !lastName || !email) {
            alert('Please fill in all fields');
            return;
        }

        // Domain Validation
        const adminDomain = this.currentUser.email.split('@')[1];
        const userDomain = email.split('@')[1];

        if (userDomain !== adminDomain) {
            alert(`Email domain must match your organization's domain (@${adminDomain})`);
            return;
        }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            alert('A user with this email already exists.');
            return;
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            firstName,
            lastName,
            email,
            password: 'welcome123', // Default password
            organizationId: this.currentUser.organizationId,
            organizationName: this.currentUser.organizationName,
            organizationType: this.currentUser.organizationType || 'business', // Inherit type
            role: role,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.closeModal();
        this.loadClientTeam(); // Refresh table
        this.loadClientStats(); // Refresh stats

        alert(`User ${firstName} ${lastName} added successfully! Default password is 'welcome123'.`);
    },

    // ============ MASTER ADMIN FUNCTIONS ============

    loadAdminStats() {
        // ... (rest of file)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');

        const pendingUsers = users.filter(u => u.status === 'pending');
        const activeUsers = users.filter(u => u.status === 'active');

        document.getElementById('pendingCount').textContent = pendingUsers.length;
        document.getElementById('activeCount').textContent = activeUsers.length;
        document.getElementById('orgCount').textContent = organizations.length;
        document.getElementById('totalCount').textContent = users.length;
    },

    loadPendingApprovals() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const pendingUsers = users.filter(u => u.status === 'pending');
        const container = document.getElementById('pendingApprovals');

        if (pendingUsers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>No pending approvals</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pendingUsers.map(user => `
            <div class="pending-user">
                <div class="pending-user-header">
                    <div class="pending-user-info">
                        <h3>${user.firstName} ${user.lastName}</h3>
                        <p><i class="fas fa-envelope"></i> ${user.email}</p>
                        <p><i class="fas fa-clock"></i> Registered ${this.formatDate(user.createdAt)}</p>
                    </div>
                    <span class="badge badge-pending">Pending</span>
                </div>
                
                <div class="pending-user-details">
                    <div class="detail-item">
                        <strong>Organization</strong>
                        <span>${user.organizationName}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Type</strong>
                        <span>${this.formatOrgType(user.organizationType)}</span>
                    </div>
                </div>

                <div class="detail-item" style="margin-bottom: 1rem;">
                    <strong>Access Request Reason</strong>
                    <span>${user.accessReason || 'No reason provided'}</span>
                </div>

                <div class="pending-user-actions">
                    <button class="btn btn-approve" onclick="Dashboard.approveUser('${user.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-reject" onclick="Dashboard.rejectUser('${user.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    },

    loadAllUsers() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const tbody = document.getElementById('allUsersTable');

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.organizationName || '-'}</td>
                <td>${this.formatRole(user.role)}</td>
                <td><span class="badge badge-${user.status}">${user.status}</span></td>
                <td>${this.formatDate(user.createdAt)}</td>
            </tr>
        `).join('');
    },

    loadOrganizations() {
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
        const select = document.getElementById('assignOrganization');

        const existingOptions = organizations.map(org =>
            `<option value="${org.id}">${org.name}</option>`
        ).join('');

        select.innerHTML = `
            <option value="new">Create New Organization</option>
            ${existingOptions}
        `;
    },

    approveUser(userId) {
        this.selectedUserId = userId;
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);

        if (user) {
            document.getElementById('newOrgName').value = user.organizationName;
            document.getElementById('newOrgGroup').style.display = 'block';
        }

        document.getElementById('approvalModal').classList.add('active');
    },

    rejectUser(userId) {
        this.selectedUserId = userId;
        document.getElementById('rejectionModal').classList.add('active');
    },

    confirmApproval() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.selectedUserId);

        if (userIndex === -1) return;

        const assignOrg = document.getElementById('assignOrganization').value;
        const notes = document.getElementById('approvalNotes').value;
        let organizationId;

        if (assignOrg === 'new') {
            const newOrgName = document.getElementById('newOrgName').value.trim();
            if (!newOrgName) {
                alert('Please enter an organization name');
                return;
            }

            const newOrg = {
                id: 'org_' + Date.now(),
                name: newOrgName,
                type: users[userIndex].organizationType,
                status: 'active',
                primaryContact: this.selectedUserId,
                createdAt: new Date().toISOString()
            };

            const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
            organizations.push(newOrg);
            localStorage.setItem('organizations', JSON.stringify(organizations));

            organizationId = newOrg.id;
        } else {
            organizationId = assignOrg;
        }

        users[userIndex].status = 'active';
        users[userIndex].organizationId = organizationId;
        users[userIndex].approvedAt = new Date().toISOString();
        users[userIndex].approvedBy = this.currentUser.id;
        users[userIndex].approvalNotes = notes;

        localStorage.setItem('users', JSON.stringify(users));

        this.closeModal();
        this.loadMasterAdminDashboard();

        alert(`User ${users[userIndex].firstName} ${users[userIndex].lastName} has been approved!`);
    },

    confirmRejection() {
        const reason = document.getElementById('rejectionReason').value.trim();

        if (!reason) {
            alert('Please provide a reason for rejection');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.selectedUserId);

        if (userIndex === -1) return;

        users[userIndex].status = 'rejected';
        users[userIndex].rejectedAt = new Date().toISOString();
        users[userIndex].rejectedBy = this.currentUser.id;
        users[userIndex].rejectionReason = reason;

        localStorage.setItem('users', JSON.stringify(users));

        this.closeModal();
        this.loadMasterAdminDashboard();

        alert(`User ${users[userIndex].firstName} ${users[userIndex].lastName} has been rejected.`);
    },

    // ============ CLIENT ADMIN FUNCTIONS ============

    loadClientStats() {
        // Get only this organization's data
        const projects = this.getOrganizationProjects();
        const invoices = this.getOrganizationInvoices();
        const users = this.getOrganizationUsers();

        document.getElementById('clientProjectCount').textContent = projects.length;
        document.getElementById('clientInvoiceCount').textContent = invoices.length;
        document.getElementById('clientTeamCount').textContent = users.length;

        // Calculate total amount from invoices
        const totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
        document.getElementById('clientTotalAmount').textContent = '$' + totalAmount.toFixed(2);
    },

    loadClientProjects() {
        const projects = this.getOrganizationProjects();
        const container = document.getElementById('clientProjects');

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No projects yet</p>
                    <button class="btn btn-primary" onclick="alert('Project creation coming soon!')">
                        <i class="fas fa-plus"></i> Create Project
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="project-card">
                <h4>${project.name}</h4>
                <p>${project.description || 'No description'}</p>
                <span class="badge badge-${project.status}">${project.status}</span>
            </div>
        `).join('');
    },

    loadClientInvoices() {
        const invoices = this.getOrganizationInvoices();
        const tbody = document.getElementById('clientInvoicesTable');

        if (invoices.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; color: #6b7280;">
                        No invoices yet
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = invoices.map(invoice => `
            <tr>
                <td>${invoice.number || 'N/A'}</td>
                <td>${this.formatDate(invoice.date)}</td>
                <td>$${parseFloat(invoice.amount || 0).toFixed(2)}</td>
                <td><span class="badge badge-${invoice.status}">${invoice.status}</span></td>
            </tr>
        `).join('');
    },

    // Helper functions to filter by organization
    getOrganizationProjects() {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        return projects.filter(p => p.organizationId === this.currentUser.organizationId);
    },

    getOrganizationInvoices() {
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        return invoices.filter(i => i.organizationId === this.currentUser.organizationId);
    },

    getOrganizationUsers() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.filter(u => u.organizationId === this.currentUser.organizationId);
    },

    // ============ SHARED FUNCTIONS ============

    closeModal() {
        document.getElementById('approvalModal').classList.remove('active');
        document.getElementById('rejectionModal').classList.remove('active');
        document.getElementById('addClientUserModal').classList.remove('active');

        document.getElementById('approvalNotes').value = '';
        document.getElementById('rejectionReason').value = '';
        document.getElementById('assignOrganization').value = 'new';
        document.getElementById('newOrgGroup').style.display = 'block';
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatOrgType(type) {
        const types = {
            'legal': 'Legal / Law Firm',
            'nonprofit': 'Non-Profit',
            'business': 'Business / Corporate',
            'other': 'Other'
        };
        return types[type] || type;
    },

    formatRole(role) {
        const roles = {
            'master-admin': 'Master Admin',
            'client-admin': 'Client Admin',
            'pending': 'Pending'
        };
        return roles[role] || role;
    }
};

// Global functions
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}

function closeModal() {
    Dashboard.closeModal();
}

function confirmApproval() {
    Dashboard.confirmApproval();
}

function confirmRejection() {
    Dashboard.confirmRejection();
}

function openAddClientUserModal() {
    Dashboard.openAddClientUserModal();
}

function confirmAddClientUser() {
    Dashboard.confirmAddClientUser();
}

function switchTab(tabName) {
    Dashboard.switchTab(tabName);
}

// Setup organization selector
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();

    const orgSelect = document.getElementById('assignOrganization');
    if (orgSelect) {
        orgSelect.addEventListener('change', (e) => {
            const newOrgGroup = document.getElementById('newOrgGroup');
            if (e.target.value === 'new') {
                newOrgGroup.style.display = 'block';
            } else {
                newOrgGroup.style.display = 'none';
            }
        });
    }
});
