// Admin Dashboard JavaScript
const AdminDashboard = {
    currentUser: null,
    selectedUserId: null,

    init() {
        // Check if user is master admin
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

        if (!this.currentUser || this.currentUser.role !== 'master-admin') {
            alert('Access denied. Master admin privileges required.');
            window.location.href = 'auth.html';
            return;
        }

        // Display admin name
        document.getElementById('adminName').textContent =
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;

        // Load dashboard data
        this.loadStats();
        this.loadPendingApprovals();
        this.loadAllUsers();
        this.loadOrganizations();

        // Setup organization selector change handler
        document.getElementById('assignOrganization').addEventListener('change', (e) => {
            const newOrgGroup = document.getElementById('newOrgGroup');
            if (e.target.value === 'new') {
                newOrgGroup.style.display = 'block';
            } else {
                newOrgGroup.style.display = 'none';
            }
        });
    },

    loadStats() {
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
                    <button class="btn btn-approve" onclick="AdminDashboard.approveUser('${user.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-reject" onclick="AdminDashboard.rejectUser('${user.id}')">
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

        // Keep "Create New Organization" option
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
            // Pre-fill organization name if creating new
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

        // Handle organization assignment
        if (assignOrg === 'new') {
            const newOrgName = document.getElementById('newOrgName').value.trim();
            if (!newOrgName) {
                alert('Please enter an organization name');
                return;
            }

            // Create new organization
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

        // Update user
        users[userIndex].status = 'active';
        users[userIndex].organizationId = organizationId;
        users[userIndex].approvedAt = new Date().toISOString();
        users[userIndex].approvedBy = this.currentUser.id;
        users[userIndex].approvalNotes = notes;

        localStorage.setItem('users', JSON.stringify(users));

        // Log approval action
        this.logAction('approve', users[userIndex]);

        // Close modal and refresh
        this.closeModal();
        this.refresh();

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

        // Update user
        users[userIndex].status = 'rejected';
        users[userIndex].rejectedAt = new Date().toISOString();
        users[userIndex].rejectedBy = this.currentUser.id;
        users[userIndex].rejectionReason = reason;

        localStorage.setItem('users', JSON.stringify(users));

        // Log rejection action
        this.logAction('reject', users[userIndex]);

        // Close modal and refresh
        this.closeModal();
        this.refresh();

        alert(`User ${users[userIndex].firstName} ${users[userIndex].lastName} has been rejected.`);
    },

    logAction(action, user) {
        const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
        logs.push({
            id: 'log_' + Date.now(),
            action,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            adminId: this.currentUser.id,
            adminName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('adminLogs', JSON.stringify(logs));
    },

    closeModal() {
        document.getElementById('approvalModal').classList.remove('active');
        document.getElementById('rejectionModal').classList.remove('active');

        // Clear forms
        document.getElementById('approvalNotes').value = '';
        document.getElementById('rejectionReason').value = '';
        document.getElementById('assignOrganization').value = 'new';
        document.getElementById('newOrgGroup').style.display = 'block';
    },

    refresh() {
        this.loadStats();
        this.loadPendingApprovals();
        this.loadAllUsers();
        this.loadOrganizations();
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
    AdminDashboard.closeModal();
}

function confirmApproval() {
    AdminDashboard.confirmApproval();
}

function confirmRejection() {
    AdminDashboard.confirmRejection();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();
});
