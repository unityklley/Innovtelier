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
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');

        const pendingCount = users.filter(u => u.status === 'pending').length;
        const activeCount = users.filter(u => u.status === 'active').length;

        const safeSetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = text;
            } else {
                console.warn('Missing AdminStat ID:', id);
            }
        };

        // Use 'master' prefix to match HTML IDs
        safeSetText('masterPendingCount', pendingCount);
        safeSetText('masterActiveCount', activeCount);
        safeSetText('masterOrgCount', organizations.length);
        safeSetText('masterTotalCount', users.length);
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
                <td style="display: flex; gap: 0.5rem;">
                    <button class="btn-sm btn-primary" onclick="Dashboard.editUser('${user.id}')" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-reject" onclick="Dashboard.deleteUser('${user.id}')" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    deleteUser(userId) {
        console.log('Attempting to delete user:', userId);
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) return;

        // Prevent deleting yourself
        if (users[userIndex].id === this.currentUser.id) {
            alert('You cannot delete your own account.');
            return;
        }

        const deletedUser = users[userIndex];
        users.splice(userIndex, 1);
        localStorage.setItem('users', JSON.stringify(users));

        this.loadAllUsers();
        this.loadAdminStats();

        alert(`User ${deletedUser.firstName} ${deletedUser.lastName} deleted successfully.`);
    },

    filterUsers() {
        const searchTerm = document.getElementById('userSearchInput')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('userRoleFilter')?.value || '';
        const statusFilter = document.getElementById('userStatusFilter')?.value || '';

        const users = JSON.parse(localStorage.getItem('users') || '[]');

        const filteredUsers = users.filter(user => {
            // Search filter (name or email)
            const matchesSearch = !searchTerm ||
                user.firstName.toLowerCase().includes(searchTerm) ||
                user.lastName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);

            // Role filter
            const matchesRole = !roleFilter || user.role === roleFilter;

            // Status filter
            const matchesStatus = !statusFilter || user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });

        // Update table with filtered results
        const tbody = document.getElementById('allUsersTable');
        if (!tbody) return;

        tbody.innerHTML = filteredUsers.map(user => `
            <tr>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.organizationName || '-'}</td>
                <td>${this.formatRole(user.role)}</td>
                <td><span class="badge badge-${user.status}">${user.status}</span></td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td style="display: flex; gap: 0.5rem;">
                    <button class="btn-sm btn-primary" onclick="Dashboard.editUser('${user.id}')" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-reject" onclick="Dashboard.deleteUser('${user.id}')" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    editUser(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);

        if (!user) {
            alert('User not found.');
            return;
        }

        // Populate modal fields
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserFirstName').value = user.firstName || '';
        document.getElementById('editUserLastName').value = user.lastName || '';
        document.getElementById('editUserEmail').value = user.email || '';
        document.getElementById('editUserJobTitle').value = user.jobTitle || '';
        document.getElementById('editUserPhone').value = user.phone || '';
        document.getElementById('editUserRole').value = user.role || '';
        document.getElementById('editUserStatus').value = user.status || 'active';
        document.getElementById('editUserAuthName').value = user.authorizingContactName || '';
        document.getElementById('editUserAuthEmail').value = user.authorizingContactEmail || '';
        document.getElementById('editUserCreatedAt').value = this.formatDate(user.createdAt);
        document.getElementById('editUserModifiedAt').value = user.modifiedAt ? this.formatDate(user.modifiedAt) : 'Never';

        // Populate organization dropdown
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
        const orgSelect = document.getElementById('editUserOrganization');
        if (orgSelect) {
            orgSelect.innerHTML = '<option value="">No Organization</option>' +
                organizations.map(org =>
                    `<option value="${org.id}" ${user.organizationId === org.id ? 'selected' : ''}>${org.name}</option>`
                ).join('');
        }

        // Show modal
        const modal = document.getElementById('editUserModal');
        if (modal) modal.classList.add('active');
    },

    saveUserEdits() {
        const userId = document.getElementById('editUserId').value;
        const firstName = document.getElementById('editUserFirstName').value.trim();
        const lastName = document.getElementById('editUserLastName').value.trim();
        const email = document.getElementById('editUserEmail').value.trim();
        const jobTitle = document.getElementById('editUserJobTitle').value.trim();
        const phone = document.getElementById('editUserPhone').value.trim();
        const role = document.getElementById('editUserRole').value;
        const status = document.getElementById('editUserStatus').value;
        const organizationId = document.getElementById('editUserOrganization').value;
        const authName = document.getElementById('editUserAuthName').value.trim();
        const authEmail = document.getElementById('editUserAuthEmail').value.trim();

        // Validation
        if (!firstName || !lastName || !email || !role) {
            alert('Please fill in all required fields.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            alert('User not found.');
            return;
        }

        // Check for duplicate email (excluding current user)
        const emailExists = users.some(u => u.id !== userId && u.email === email);
        if (emailExists) {
            alert('A user with this email already exists.');
            return;
        }

        // Get organization name if organizationId is provided
        let organizationName = '';
        if (organizationId) {
            const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
            const org = organizations.find(o => o.id === organizationId);
            organizationName = org ? org.name : '';
        }

        // Update user
        users[userIndex] = {
            ...users[userIndex],
            firstName,
            lastName,
            email,
            jobTitle: jobTitle || null,
            phone: phone || null,
            role,
            status,
            organizationId: organizationId || null,
            organizationName: organizationName || null,
            authorizingContactName: authName || null,
            authorizingContactEmail: authEmail || null,
            modifiedAt: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify(users));

        // Close modal and refresh
        this.closeModal();
        this.loadAllUsers();
        this.loadAdminStats();

        alert('User updated successfully!');
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

    openAddNewClientModal() {
        const modal = document.getElementById('addNewClientModal');
        if (modal) modal.classList.add('active');
    },

    async createNewClient() {
        const fullName = document.getElementById('newClientFullName').value.trim();
        const email = document.getElementById('newClientEmail').value.trim();
        const orgName = document.getElementById('newClientOrgName').value.trim();
        const jobTitle = document.getElementById('newClientJobTitle').value.trim();
        const roleRequested = document.getElementById('newClientRoleRequested').value;
        const phone = document.getElementById('newClientPhone').value.trim();
        const authName = document.getElementById('newClientAuthName').value.trim();
        const authEmail = document.getElementById('newClientAuthEmail').value.trim();
        const btn = document.getElementById('btnCreateClient');

        if (!fullName || !email || !orgName || !jobTitle || !roleRequested || !authName || !authEmail) {
            alert('Please fill in all required fields');
            return;
        }

        // Check for duplicate email locally first
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (existingUsers.some(u => u.email === email)) {
            alert('A user with this email address already exists.');
            return;
        }

        // Show loading state
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;
        }

        try {
            // 1. Generate Folder Structure in Google Drive
            const simpleId = 'CL-' + Math.floor(1000 + Math.random() * 9000); // e.g. CL-1234
            let driveFolderId = null;
            let driveStatusMsg = '';

            if (typeof GoogleDrive !== 'undefined') {
                // Check if already signed in, otherwise skip Drive folder creation
                if (GoogleDrive.isSignedIn) {
                    console.log('Generating Drive folders...');
                    try {
                        driveFolderId = await GoogleDrive.createClientFolderStructure(orgName, simpleId);
                        if (driveFolderId) {
                            driveStatusMsg = '\n\n✅ Google Drive Folders Created.';
                        } else {
                            driveStatusMsg = '\n\n⚠️ Failed to create folders (API Error). Check console.';
                        }
                    } catch (driveErr) {
                        console.error('Drive creation error:', driveErr);
                        driveStatusMsg = '\n\n⚠️ Drive Error: ' + driveErr.message;
                    }
                } else {
                    console.warn('Google Drive not connected.');
                    driveStatusMsg = '\n\n(Note: Google Drive was not connected, so folders were not created. Please sign in to Drive from Document Library.)';
                }
            }

            // 2. Create Organization Record
            const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
            const newOrg = {
                id: 'org_' + Date.now(),
                name: orgName,
                clientId: simpleId,
                type: 'client',
                status: 'active',
                driveFolderId: driveFolderId, // Link to the root folder
                createdAt: new Date().toISOString()
            };
            organizations.push(newOrg);
            localStorage.setItem('organizations', JSON.stringify(organizations));

            // 3. Create Client Admin User
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const names = fullName.split(' ');
            const firstName = names[0];
            const lastName = names.slice(1).join(' ') || '';

            const newUser = {
                id: 'user_' + Date.now(),
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: 'welcome123',
                organizationId: newOrg.id,
                organizationName: orgName,
                jobTitle: jobTitle,
                phone: phone || null,
                roleRequested: roleRequested,
                authorizingContactName: authName,
                authorizingContactEmail: authEmail,
                role: roleRequested,  // Grant the requested role
                status: 'active',
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // 4. Cleanup & Refresh
            // Clear form inputs
            document.getElementById('newClientFullName').value = '';
            document.getElementById('newClientEmail').value = '';
            document.getElementById('newClientOrgName').value = '';
            document.getElementById('newClientJobTitle').value = '';
            document.getElementById('newClientRoleRequested').value = '';
            document.getElementById('newClientPhone').value = '';
            document.getElementById('newClientAuthName').value = '';
            document.getElementById('newClientAuthEmail').value = '';

            this.closeModal(); // Visual close

            // Allow UI to update before showing success
            setTimeout(() => {
                this.loadAllUsers();
                this.loadOrganizations();
                this.loadAdminStats();

                // Show Success Modal
                const successModal = document.getElementById('onboardingSuccessModal');
                const driveBadge = document.getElementById('driveSuccessBadge');

                if (successModal) {
                    if (!driveFolderId) {
                        driveBadge.style.display = 'none'; // Hide if drive failed
                    } else {
                        driveBadge.style.display = 'inline-block';
                    }

                    successModal.classList.add('active');

                    // Auto close after 3 seconds
                    setTimeout(() => {
                        successModal.classList.remove('active');
                    }, 3000);
                } else {
                    alert(`Client "${orgName}" onboarded successfully!${driveStatusMsg}`);
                }
            }, 100);

        } catch (error) {
            console.error('Error creating client:', error);
            alert('Failed to complete onboarding: ' + error.message);
        } finally {
            if (btn) {
                btn.innerHTML = '<i class="fas fa-magic"></i> Create Client & Folders';
                btn.disabled = false;
            }
        }
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
        isActive('addNewClientModal');
        isActive('editUserModal');

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

            if (!driveFile) {
                console.log('Upload cancelled or failed silently');
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

        alert(`Document "${file.name}" uploaded successfully!`);
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

// Setup organization selector and filter listeners
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

    // Add event listeners for user filters
    const userSearchInput = document.getElementById('userSearchInput');
    const userRoleFilter = document.getElementById('userRoleFilter');
    const userStatusFilter = document.getElementById('userStatusFilter');

    if (userSearchInput) {
        userSearchInput.addEventListener('input', () => Dashboard.filterUsers());
    }
    if (userRoleFilter) {
        userRoleFilter.addEventListener('change', () => Dashboard.filterUsers());
    }
    if (userStatusFilter) {
        userStatusFilter.addEventListener('change', () => Dashboard.filterUsers());
    }
});

// Explicitly expose Dashboard object to window for HTML onclick handlers
window.Dashboard = Dashboard;

// Explicitly expose functions to window to ensure HTML access
window.uploadDocument = uploadDocument;
window.shareDocument = shareDocument;
window.deleteDocument = deleteDocument;

// Expose new client functions
window.openAddNewClientModal = () => Dashboard.openAddNewClientModal();
window.createNewClient = () => Dashboard.createNewClient();
window.deleteUser = (id) => Dashboard.deleteUser(id);
window.editUser = (id) => Dashboard.editUser(id);
window.saveUserEdits = () => Dashboard.saveUserEdits();
window.filterUsers = () => Dashboard.filterUsers();
window.closeModal = () => Dashboard.closeModal();

console.log('Global functions exposed to window');
