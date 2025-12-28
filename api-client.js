// API Client for communicating with the backend
const API_BASE_URL = 'http://localhost:3000/api';

// Get stored auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set auth token
function setAuthToken(token) {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Set current user
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Make API request
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                setAuthToken(null);
                setCurrentUser(null);
                // Redirect to login if not already there
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
            }
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Authentication API
const authAPI = {
    async register(username, email, password, role = 'paralegal') {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, role })
        });
    },

    async login(username, password) {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.token) {
            setAuthToken(response.token);
            setCurrentUser(response.user);
        }
        
        return response;
    },

    logout() {
        setAuthToken(null);
        setCurrentUser(null);
    }
};

// Cases API
const casesAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        
        const query = params.toString();
        return apiRequest(`/cases${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/cases/${id}`);
    },

    async create(caseData) {
        return apiRequest('/cases', {
            method: 'POST',
            body: JSON.stringify(caseData)
        });
    },

    async update(id, updates) {
        return apiRequest(`/cases/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },

    async delete(id) {
        return apiRequest(`/cases/${id}`, {
            method: 'DELETE'
        });
    },

    async addNote(caseId, content) {
        return apiRequest(`/cases/${caseId}/notes`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }
};

// Time Entries API
const timeEntriesAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.caseId) params.append('caseId', filters.caseId);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const query = params.toString();
        return apiRequest(`/time-entries${query ? '?' + query : ''}`);
    },

    async create(entry) {
        return apiRequest('/time-entries', {
            method: 'POST',
            body: JSON.stringify(entry)
        });
    },

    async delete(id) {
        return apiRequest(`/time-entries/${id}`, {
            method: 'DELETE'
        });
    }
};

// Expenses API
const expensesAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.caseId) params.append('caseId', filters.caseId);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const query = params.toString();
        return apiRequest(`/expenses${query ? '?' + query : ''}`);
    },

    async create(expense) {
        return apiRequest('/expenses', {
            method: 'POST',
            body: JSON.stringify(expense)
        });
    },

    async delete(id) {
        return apiRequest(`/expenses/${id}`, {
            method: 'DELETE'
        });
    }
};

// Invoices API
const invoicesAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.caseId) params.append('caseId', filters.caseId);
        if (filters.status) params.append('status', filters.status);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const query = params.toString();
        return apiRequest(`/invoices${query ? '?' + query : ''}`);
    },

    async create(invoice) {
        return apiRequest('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoice)
        });
    },

    async update(id, updates) {
        return apiRequest(`/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }
};

// Trust Transactions API
const trustAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.caseId) params.append('caseId', filters.caseId);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const query = params.toString();
        return apiRequest(`/trust${query ? '?' + query : ''}`);
    },

    async create(transaction) {
        return apiRequest('/trust', {
            method: 'POST',
            body: JSON.stringify(transaction)
        });
    },

    async delete(id) {
        return apiRequest(`/trust/${id}`, {
            method: 'DELETE'
        });
    }
};

// Export API objects
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authAPI,
        casesAPI,
        timeEntriesAPI,
        expensesAPI,
        invoicesAPI,
        trustAPI,
        getAuthToken,
        getCurrentUser
    };
}


