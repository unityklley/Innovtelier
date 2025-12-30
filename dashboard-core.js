// Unified Dashboard - Role-Based Access Control
// v4 - Robust with Defensive Checks

const Dashboard = {
    currentUser: null,

    init() {
        console.log('Dashboard init started');
        // alert('Debug: Dashboard Core JS Loaded');

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
        const safeSetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
            else console.warn('Missing UserInfo ID:', id);
        };

        safeSetText('userName', `${this.currentUser.firstName} ${this.currentUser.lastName}`);
        safeSetText('userRole', this.currentUser.role === 'master-admin' ? 'Master Admin' : 'Client Admin');

        if (this.currentUser.organizationName) {
            const orgEl = document.getElementById('userOrg');
            if (orgEl) {
                orgEl.textContent = this.currentUser.organizationName;
                orgEl.style.display = 'inline';
            }
        }
    },

    loadMasterAdminDashboard() {
        const safeStyle = (id, display) => {
            const el = document.getElementById(id);
            if (el) el.style.display = display;
        };

        safeStyle('clientPortalPanel', 'none');
        safeStyle('masterAdminPanel', 'block');
        safeStyle('clientSidebar', 'none');
        safeStyle('masterAdminSidebar', 'flex');
        safeStyle('topBar', 'flex');

        const title = document.getElementById('pageTitle');
        if (title) title.textContent = 'Master Admin Portal';

        safeStyle('dashboardContent', 'block');

        // Initialize Default View
        this.switchMasterAdminTab('home');

        // Load Master Admin data
        this.loadAdminStats();
        this.loadPendingApprovals();
        this.loadAllUsers();
        this.loadOrganizations();
    },

    loadClientDashboard() {
        const safeStyle = (id, display) => {
            const el = document.getElementById(id);
            if (el) el.style.display = display;
        };

        safeStyle('masterAdminPanel', 'none');
        safeStyle('clientPortalPanel', 'block');
        safeStyle('clientSidebar', 'flex');
        safeStyle('topBar', 'flex');

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

        const safeStyle = (id, style, type = 'display') => {
            const el = document.getElementById(id);
            if (!el) return;
            if (type === 'display') el.style.display = style;
            if (type === 'classAdd') el.classList.add(style);
            if (type === 'classRemove') el.classList.remove(style);
        };

        // Hide all views first
        safeStyle('dashboardContent', 'none');
        safeStyle('iframeCases', 'active', 'classRemove');
        safeStyle('iframeReports', 'active', 'classRemove');

        // Hide internal client views
        safeStyle('clientHomeView', 'none');
        safeStyle('clientDocsView', 'none');
        safeStyle('clientAdminView', 'none');

        const pageTitle = document.getElementById('pageTitle');
        const setTitle = (t) => { if (pageTitle) pageTitle.textContent = t; };

        switch (tabName) {
            case 'home':
                safeStyle('dashboardContent', 'block');
                safeStyle('clientHomeView', 'block');
                setTitle('Client Portal');
                break;
            case 'cases':
                safeStyle('iframeCases', 'active', 'classAdd');
                const casesFrame = document.getElementById('iframeCases');
                if (casesFrame && !casesFrame.getAttribute('src')) {
                    casesFrame.src = 'paralegal-dashboard-content.html';
                }
                setTitle('Case Management');
                break;
            case 'reports':
                safeStyle('iframeReports', 'active', 'classAdd');
                const reportFrame = document.getElementById('iframeReports');
                if (reportFrame && !reportFrame.getAttribute('src')) {
                    reportFrame.src = 'reports-dashboard-content.html';
                }
                setTitle('Reports & Analytics');
                break;
            case 'docs':
                safeStyle('dashboardContent', 'block');
                safeStyle('clientDocsView', 'block');
                setTitle('Internal Documents');
                break;
            case 'admin':
                safeStyle('dashboardContent', 'block');
                safeStyle('clientAdminView', 'block');
                setTitle('Admin Settings');
                break;
        }
    },

    switchMasterAdminTab(tabName) {
        // Update active nav item
        document.querySelectorAll('#masterAdminSidebar .nav-item').forEach(item => item.classList.remove('active'));
        const activeItem = document.querySelector(`#masterAdminSidebar .nav-item[onclick="switchMasterAdminTab('${tabName}')"]`);
        if (activeItem) activeItem.classList.add('active');

        // Helper function to safely set display
        const safeStyle = (id, display) => {
            const el = document.getElementById(id);
            if (el) el.style.display = display;
        };

        // Hide all Master Admin views
        safeStyle('masterAdminHomeView', 'none');
        safeStyle('masterAdminUsersView', 'none');
        safeStyle('masterAdminDocumentsView', 'none');
        safeStyle('masterAdminOrganizationsView', 'none');
        safeStyle('masterAdminSettingsView', 'none');

        // Hide iframes
        const hideIframe = (id) => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
        };
        hideIframe('iframeMasterCases');
        hideIframe('iframeMasterReports');

        // Helper to set page title
        const setTitle = (title) => {
            const titleEl = document.getElementById('pageTitle');
            if (titleEl) titleEl.textContent = title;
        };

        // Show selected view
        switch (tabName) {
            case 'home':
                safeStyle('masterAdminHomeView', 'block');
                setTitle('Master Admin Dashboard');
                break;
            case 'cases':
                const casesFrame = document.getElementById('iframeMasterCases');
                if (casesFrame) {
                    casesFrame.classList.add('active');
                    if (!casesFrame.getAttribute('src')) {
                        casesFrame.src = 'paralegal-dashboard-content.html';
                    }
                }
                setTitle('Case Management');
                break;
            case 'reports':
                const reportsFrame = document.getElementById('iframeMasterReports');
                if (reportsFrame) {
                    reportsFrame.classList.add('active');
                    if (!reportsFrame.getAttribute('src')) {
                        reportsFrame.src = 'reports-dashboard-content.html';
                    }
                }
                setTitle('Reports & Analytics');
                break;
            case 'documents':
                safeStyle('masterAdminDocumentsView', 'block');
                setTitle('Document Library');
                this.loadDocuments();
                break;
            case 'users':
                safeStyle('masterAdminUsersView', 'block');
                setTitle('User Management');
                this.loadPendingApprovals();
                this.loadAllUsers();
                break;
            case 'organizations':
                safeStyle('masterAdminOrganizationsView', 'block');
                setTitle('Organizations');
                this.loadOrganizationsTable();
                break;
            case 'settings':
                safeStyle('masterAdminSettingsView', 'block');
                setTitle('System Settings');
                this.loadMasterAdminSettings();
                break;
        }
    },

    loadClientTeam() {
        const users = this.getOrganizationUsers();
        const tbody = document.getElementById('clientTeamTable');

        if (!tbody) {
            console.error('Missing ID: clientTeamTable');
            return;
        }

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
        const display = document.getElementById('userDomainDisplay');
        if (display) display.textContent = domain;

        const modal = document.getElementById('addClientUserModal');
        if (modal) modal.classList.add('active');

        // Clear inputs
        const clear = (id, val = '') => { const el = document.getElementById(id); if (el) el.value = val; };
        clear('newMemberFirstName');
        clear('newMemberLastName');
        clear('newMemberEmail');
        clear('newMemberRole', 'client-user');
    },

    confirmAddClientUser() {
        const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

        const firstName = getVal('newMemberFirstName');

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
        this.loadPendingApprovals();
        this.loadAllUsers();

        this.closeModal();
        this.loadClientTeam(); // Refresh table
        this.loadClientStats(); // Refresh stats

        alert(`User ${firstName} ${lastName} added successfully! Default password is 'welcome123'.`);
    },

    // ============ MASTER ADMIN FUNCTIONS ============

    loadAdminStats() {
        const safeSetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
            else console.error('Missing AdminStat ID:', id);
        };

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');

        const pendingUsers = users.filter(u => u.status === 'pending');
        const activeUsers = users.filter(u => u.status === 'active');

        safeSetText('pendingCount', pendingUsers.length);
        safeSetText('activeCount', activeUsers.length);
        safeSetText('orgCount', organizations.length);
        safeSetText('totalCount', users.length);
    },

    loadPendingApprovals() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const pendingUsers = users.filter(u => u.status === 'pending');
        const container = document.getElementById('pendingApprovals');

        if (!container) return;

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

        if (!tbody) return;

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

        if (!select) return;

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
            const orgNameEl = document.getElementById('newOrgName');
            if (orgNameEl) orgNameEl.value = user.organizationName;

            const orgGroup = document.getElementById('newOrgGroup');
            if (orgGroup) orgGroup.style.display = 'block';
        }

        const modal = document.getElementById('approvalModal');
        if (modal) modal.classList.add('active');
    },

    rejectUser(userId) {
        this.selectedUserId = userId;
        const modal = document.getElementById('rejectionModal');
        if (modal) modal.classList.add('active');
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
        const safeSetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
            else console.error('Missing ClientStat ID:', id);
        };

        // Get only this organization's data
        const projects = this.getOrganizationProjects();
        const invoices = this.getOrganizationInvoices();
        const users = this.getOrganizationUsers();

        safeSetText('clientProjectCount', projects.length);
        safeSetText('clientInvoiceCount', invoices.length);
        safeSetText('clientTeamCount', users.length);

        // Calculate total amount from invoices
        const totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
        safeSetText('clientTotalAmount', '$' + totalAmount.toFixed(2));
    },

    loadClientProjects() {
        const projects = this.getOrganizationProjects();
        const container = document.getElementById('clientProjects');

        if (!container) return;

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

        if (!tbody) return;

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
        const isActive = (id) => document.getElementById(id)?.classList.remove('active');
        isActive('approvalModal');
        isActive('rejectionModal');
        isActive('addClientUserModal');

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
        setVal('approvalNotes', '');
        setVal('rejectionReason', '');
        setVal('assignOrganization', 'new');

        const orgGroup = document.getElementById('newOrgGroup');
        if (orgGroup) orgGroup.style.display = 'block';
    },

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
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
    },

    loadOrganizationsTable() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const organizations = {};

        // Group users by organization
        users.forEach(user => {
            if (user.organization) {
                if (!organizations[user.organization]) {
                    organizations[user.organization] = {
                        name: user.organization,
                        type: user.organizationType || 'Unknown',
                        users: [],
                        status: 'Active'
                    };
                }
                organizations[user.organization].users.push(user);
            }
        });

        const tbody = document.getElementById('organizationsTable');
        if (!tbody) return;

        const orgArray = Object.values(organizations);
        const orgCount = document.getElementById('orgCount');
        if (orgCount) orgCount.textContent = orgArray.length;

        if (orgArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">No organizations found</td></tr>';
            return;
        }

        tbody.innerHTML = orgArray.map(org => {
            const primaryContact = org.users.find(u => u.role === 'client_admin') || org.users[0];
            const createdDate = primaryContact ? new Date(primaryContact.createdAt || Date.now()).toLocaleDateString() : 'N/A';

            return `
                <tr>
                    <td><strong>${org.name}</strong></td>
                    <td>${org.type}</td>
                    <td>${primaryContact ? primaryContact.name : 'N/A'}<br><small style="color: #6b7280;">${primaryContact ? primaryContact.email : ''}</small></td>
                    <td>${org.users.length}</td>
                    <td><span class="badge badge-active">${org.status}</span></td>
                    <td>${createdDate}</td>
                    <td>
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;" onclick="alert('View organization details coming soon!')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    loadMasterAdminSettings() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        const nameInput = document.getElementById('masterAdminName');
        const emailInput = document.getElementById('masterAdminEmail');

        if (nameInput) nameInput.value = currentUser.name || '';
        if (emailInput) emailInput.value = currentUser.email || '';
    },

    async uploadDocument() {
        const fileInput = document.getElementById('documentFileInput');
        const category = document.getElementById('documentCategory').value;

        if (!fileInput.files || !fileInput.files[0]) {
            alert('Please select a file to upload');
            return;
        }

        const file = fileInput.files[0];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let driveFile = null;

        // Upload to Google Drive if connected
        if (typeof GoogleDrive !== 'undefined' && GoogleDrive.isSignedIn) {
            const uploadBtn = document.querySelector('button[onclick="uploadDocument()"]');
            const originalText = uploadBtn.innerHTML;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading to Drive...';
            uploadBtn.disabled = true;

            try {
                driveFile = await GoogleDrive.uploadFile(file, category);
            } catch (error) {
                console.error('Drive upload failed:', error);
                alert('Failed to upload to Google Drive');
                uploadBtn.innerHTML = originalText;
                uploadBtn.disabled = false;
                return;
            }

            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
        }

        // Create document object
        const newDoc = {
            id: driveFile ? driveFile.id : 'doc_' + Date.now(),
            name: file.name,
            type: file.name.split('.').pop().toLowerCase(),
            size: file.size,
            category: category,
            uploadedBy: currentUser.id,
            uploadedAt: new Date().toISOString(),
            sharedWith: [], // Array of organization IDs
            // Use Drive link if available, otherwise local blob (for demo/fallback)
            url: driveFile ? driveFile.webViewLink : URL.createObjectURL(file),
            thumbnail: driveFile ? driveFile.thumbnailLink : null,
            isDriveFile: !!driveFile,
            permissions: {
                canDownload: true,
                canComment: false
            }
        };

        // Save to localStorage
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        documents.push(newDoc);
        localStorage.setItem('documents', JSON.stringify(documents));

        // Clear input
        fileInput.value = '';

        // Reload documents
        this.loadDocuments();

        let successMsg = `Document "${file.name}" uploaded successfully!`;
        if (driveFile) {
            successMsg += `\n\nLocation: Google Drive`;
            successMsg += `\nFolder ID: ${driveFile.parents ? driveFile.parents[0] : 'Root/Unknown'}`;
            // We can't make the link clickable in alert, but we can show it
            console.log('File Link:', driveFile.webViewLink);
        }
        alert(successMsg);

        if (driveFile && driveFile.webViewLink) {
            window.open(driveFile.webViewLink, '_blank');
        }
    },

    loadDocuments() {
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        const grid = document.getElementById('documentsGrid');

        if (!grid) return;

        if (documents.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-folder-open"></i>
                    <p>No documents uploaded yet</p>
                    <p style="font-size: 0.875rem;">Upload your first document to get started</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = documents.map(doc => {
            const uploadDate = new Date(doc.uploadedAt).toLocaleDateString();
            const fileSize = (doc.size / 1024).toFixed(1) + ' KB';
            const sharedCount = doc.sharedWith.length;

            return `
                <div class="document-card">
                    <div class="document-icon">
                        <i class="${this.getFileIcon(doc.type)}"></i>
                    </div>
                    <div class="document-name">${doc.name}</div>
                    <div class="document-meta">
                        <div><i class="fas fa-tag"></i> ${doc.category}</div>
                        <div><i class="fas fa-calendar"></i> ${uploadDate}</div>
                        <div><i class="fas fa-file"></i> ${fileSize}</div>
                        ${sharedCount > 0 ? `<div><i class="fas fa-share-alt"></i> Shared with ${sharedCount} org(s)</div>` : ''}
                    </div>
                    <div class="document-actions">
                        <button class="btn-secondary" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;" onclick="shareDocument('${doc.id}')">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                        <button class="btn-secondary" style="padding: 0.5rem; font-size: 0.875rem;" onclick="downloadDocument('${doc.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-secondary" style="padding: 0.5rem; font-size: 0.875rem; color: #dc2626;" onclick="deleteDocument('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    getFileIcon(fileType) {
        const icons = {
            'pdf': 'fas fa-file-pdf',
            'doc': 'fas fa-file-word',
            'docx': 'fas fa-file-word',
            'xls': 'fas fa-file-excel',
            'xlsx': 'fas fa-file-excel',
            'ppt': 'fas fa-file-powerpoint',
            'pptx': 'fas fa-file-powerpoint',
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'gif': 'fas fa-file-image',
            'zip': 'fas fa-file-archive',
            'rar': 'fas fa-file-archive',
            'txt': 'fas fa-file-alt',
        };
        return icons[fileType] || 'fas fa-file';
    },

    shareDocument(documentId) {
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        const document = documents.find(d => d.id === documentId);

        if (!document) {
            alert('Document not found');
            return;
        }

        // Get all organizations
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const organizations = {};
        users.forEach(user => {
            if (user.organization && user.role === 'client_admin') {
                if (!organizations[user.organization]) {
                    organizations[user.organization] = {
                        name: user.organization,
                        id: user.organization
                    };
                }
            }
        });

        const orgArray = Object.values(organizations);

        if (orgArray.length === 0) {
            alert('No client organizations found');
            return;
        }

        // Create simple prompt for organization selection
        let orgList = orgArray.map((org, idx) => `${idx + 1}. ${org.name}`).join('\n');
        let selection = prompt(`Share "${document.name}" with:\n\n${orgList}\n\nEnter organization number(s) separated by commas (e.g., 1,2,3):`);

        if (!selection) return;

        // Parse selection
        const selectedIndices = selection.split(',').map(s => parseInt(s.trim()) - 1);
        const selectedOrgs = selectedIndices
            .filter(idx => idx >= 0 && idx < orgArray.length)
            .map(idx => orgArray[idx].id);

        if (selectedOrgs.length === 0) {
            alert('No valid organizations selected');
            return;
        }

        // Update document
        document.sharedWith = [...new Set([...document.sharedWith, ...selectedOrgs])];
        localStorage.setItem('documents', JSON.stringify(documents));

        this.loadDocuments();
        alert(`Document shared with ${selectedOrgs.length} organization(s)!`);
    },

    downloadDocument(documentId) {
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        const document = documents.find(d => d.id === documentId);

        if (!document) {
            alert('Document not found');
            return;
        }

        // Open actual file link if available
        if (document.url) {
            window.open(document.url, '_blank');
            return;
        }

        // Fallback for mock data without URLs
        alert(`Downloading: ${document.name}\n\nIn a production environment, this would download the actual file.`);
    },

    deleteDocument(documentId) {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        const filtered = documents.filter(d => d.id !== documentId);
        localStorage.setItem('documents', JSON.stringify(filtered));

        this.loadDocuments();
        alert('Document deleted successfully');
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

// Global function wrappers for onclick handlers
function switchMasterAdminTab(tabName) {
    Dashboard.switchMasterAdminTab(tabName);
}

function uploadDocument() {
    Dashboard.uploadDocument();
}

function shareDocument(docId) {
    Dashboard.shareDocument(docId);
}

function downloadDocument(docId) {
    Dashboard.downloadDocument(docId);
}

function deleteDocument(docId) {
    Dashboard.deleteDocument(docId);
}

// Setup organization selector
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing Dashboard');
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

// Explicitly expose functions to window to ensure HTML access
window.uploadDocument = uploadDocument;
window.shareDocument = shareDocument;
window.deleteDocument = deleteDocument;
console.log('Global functions exposed to window');
