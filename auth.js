// Access Control & Authentication System
const AuthSystem = {
    // Initialize the system
    init() {
        this.setupEventListeners();
        this.checkAuth();
    },

    // Setup form event listeners
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const tabs = document.querySelectorAll('.auth-tab');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    },

    // Switch between login and register tabs
    switchTab(tabName) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        forms.forEach(form => {
            if (form.id === `${tabName}Form`) {
                form.classList.add('active');
            } else {
                form.classList.remove('active');
            }
        });
    },

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');

        // Get all users
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Find user
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            this.showError(errorEl, 'Invalid email or password');
            return;
        }

        // Check if user is pending approval
        if (user.status === 'pending') {
            this.showError(errorEl, 'Your account is pending approval. You will receive an email once approved.');
            return;
        }

        // Check if user is rejected
        if (user.status === 'rejected') {
            this.showError(errorEl, 'Your account registration was not approved. Please contact support for more information.');
            return;
        }

        // Check if user is suspended
        if (user.status === 'suspended') {
            this.showError(errorEl, 'Your account has been suspended. Please contact support.');
            return;
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        const userIndex = users.findIndex(u => u.id === user.id);
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));

        // Set current user
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Redirect to unified dashboard
        window.location.href = 'dashboard.html';
    },

    // Handle registration
    async handleRegister(e) {
        e.preventDefault();
        const errorEl = document.getElementById('registerError');

        // Get form values
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const organizationName = document.getElementById('organizationName').value;
        const organizationType = document.getElementById('organizationType').value;
        const accessReason = document.getElementById('accessReason').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            this.showError(errorEl, 'Passwords do not match');
            return;
        }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            this.showError(errorEl, 'An account with this email already exists');
            return;
        }

        // Create new user with pending status
        const newUser = {
            id: 'user_' + Date.now(),
            email,
            password, // In production, this should be hashed
            firstName,
            lastName,
            organizationName,
            organizationType,
            accessReason,
            role: 'client-admin', // Will be client-admin once approved
            organizationId: null, // Will be assigned upon approval
            status: 'pending',
            createdAt: new Date().toISOString(),
            approvedAt: null,
            approvedBy: null,
            lastLogin: null
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Create pending approval notification for master admin
        this.createApprovalNotification(newUser);

        // Show success message
        alert('Registration submitted successfully! Your account is pending approval. You will receive an email notification once your account has been reviewed.');

        // Switch to login tab
        this.switchTab('login');

        // Clear form
        document.getElementById('registerForm').reset();
    },

    // Create approval notification
    createApprovalNotification(user) {
        const notifications = JSON.parse(localStorage.getItem('pendingApprovals') || '[]');
        notifications.push({
            id: 'approval_' + Date.now(),
            userId: user.id,
            type: 'registration',
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('pendingApprovals', JSON.stringify(notifications));
    },

    // Show error message
    showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    },

    // Check if user is already logged in
    checkAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser && currentUser.status === 'active') {
            // Redirect to unified dashboard
            window.location.href = 'dashboard.html';
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AuthSystem.init();

    // Initialize master admin if no users exist
    initializeMasterAdmin();
});

// Initialize master admin account
function initializeMasterAdmin() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if master admin exists
    const masterAdmin = users.find(u => u.role === 'master-admin');

    if (!masterAdmin) {
        // Create default master admin account
        const admin = {
            id: 'user_master_admin',
            email: 'admin@innovtelier.com',
            password: 'admin123', // CHANGE THIS IN PRODUCTION
            firstName: 'Master',
            lastName: 'Admin',
            organizationName: 'Innovtelier',
            organizationType: 'vendor',
            role: 'master-admin',
            organizationId: null,
            status: 'active',
            createdAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
            approvedBy: null,
            lastLogin: null
        };

        users.push(admin);
        localStorage.setItem('users', JSON.stringify(users));

        console.log('Master admin account created:');
        console.log('Email: admin@innovtelier.com');
        console.log('Password: admin123');
        console.log('PLEASE CHANGE THIS PASSWORD IMMEDIATELY');
    }
}
