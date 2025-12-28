// Authentication JavaScript

// Tab switching
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetTab = this.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update active form
            forms.forEach(f => f.classList.remove('active'));
            document.getElementById(`${targetTab}Form`).classList.add('active');
        });
    });

    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Registration form submission
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Forgot password link
    document.getElementById('forgotPasswordLink').addEventListener('click', function (e) {
        e.preventDefault();
        alert('Password reset functionality would be implemented here. For demo purposes, please use the registration form to create a new account.');
    });

    // OAuth buttons (demo only)
    document.querySelectorAll('.oauth-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            alert('OAuth integration would be implemented here. For demo purposes, please use the email/password forms.');
        });
    });
});

// Handle login
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorElement = document.getElementById('loginError');

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('innovtelierUsers') || '[]');

    // Find user
    const user = users.find(u => u.email === email);

    if (!user) {
        showError(errorElement, 'No account found with this email address.');
        return;
    }

    // Simple password check (in production, use proper hashing)
    if (user.password !== btoa(password)) {
        showError(errorElement, 'Incorrect password. Please try again.');
        return;
    }

    // Set authentication
    const session = {
        isAuthenticated: true,
        user: {
            email: user.email,
            fullName: user.fullName,
            firmName: user.firmName
        },
        loginTime: new Date().toISOString(),
        rememberMe: rememberMe
    };

    localStorage.setItem('innovtelierSession', JSON.stringify(session));

    // Redirect to dashboard
    window.location.href = 'paralegal-dashboard.html';
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();

    const firmName = document.getElementById('firmName').value;
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    const errorElement = document.getElementById('registerError');

    // Validation
    if (!acceptTerms) {
        showError(errorElement, 'You must accept the Terms of Service and Privacy Policy.');
        return;
    }

    if (password.length < 8) {
        showError(errorElement, 'Password must be at least 8 characters long.');
        return;
    }

    if (password !== confirmPassword) {
        showError(errorElement, 'Passwords do not match.');
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('innovtelierUsers') || '[]');

    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showError(errorElement, 'An account with this email already exists. Please login instead.');
        return;
    }

    // Create new user (simple base64 encoding for demo - use proper hashing in production)
    const newUser = {
        firmName,
        fullName,
        email,
        password: btoa(password), // Simple encoding for demo
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('innovtelierUsers', JSON.stringify(users));

    // Auto-login after registration
    const session = {
        isAuthenticated: true,
        user: {
            email: newUser.email,
            fullName: newUser.fullName,
            firmName: newUser.firmName
        },
        loginTime: new Date().toISOString(),
        rememberMe: false
    };

    localStorage.setItem('innovtelierSession', JSON.stringify(session));

    // Redirect to dashboard
    window.location.href = 'paralegal-dashboard.html';
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');

    // Hide after 5 seconds
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// Logout function (to be called from other pages)
function logout() {
    localStorage.removeItem('innovtelierSession');
    window.location.href = 'index.html';
}

// Check authentication (to be called from protected pages)
function checkAuth() {
    const session = JSON.parse(localStorage.getItem('innovtelierSession') || 'null');

    if (!session || !session.isAuthenticated) {
        window.location.href = 'auth.html';
        return false;
    }

    return session;
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { logout, checkAuth };
}
