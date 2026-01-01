// Case Management System for Master Admin Portal
// Professional tabular matter management index

// ========================================
// DATA MODEL & INITIALIZATION
// ========================================

// Initialize cases in localStorage if not exists
function initializeCases() {
    if (!localStorage.getItem('cases')) {
        // Create sample seed data
        const sampleCases = [
            {
                id: 'case_001',
                name: 'Smith v. Jones Discovery',
                clientOrganizationId: null,
                clientOrganizationName: 'Smith & Associates',
                type: 'legal',
                status: 'active',
                priority: 'high',
                caseLeadId: null,
                caseLeadName: 'John Doe',
                nextDeadline: '2025-01-15T00:00:00Z',
                lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                createdAt: '2024-12-01T00:00:00Z',
                description: 'Discovery phase for civil litigation matter',
                tags: ['discovery', 'litigation']
            },
            {
                id: 'case_002',
                name: 'Community Outreach Program 2025',
                clientOrganizationId: null,
                clientOrganizationName: 'Hope Foundation',
                type: 'nonprofit',
                status: 'active',
                priority: 'medium',
                caseLeadId: null,
                caseLeadName: 'Sarah Johnson',
                nextDeadline: '2025-02-01T00:00:00Z',
                lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                createdAt: '2024-11-15T00:00:00Z',
                description: 'Annual community outreach and education program',
                tags: ['outreach', 'education']
            },
            {
                id: 'case_003',
                name: 'Corporate Restructuring Advisory',
                clientOrganizationId: null,
                clientOrganizationName: 'TechCorp Industries',
                type: 'strategy',
                status: 'active',
                priority: 'critical',
                caseLeadId: null,
                caseLeadName: 'Michael Chen',
                nextDeadline: '2025-01-08T00:00:00Z', // Urgent - within 7 days
                lastActivity: new Date().toISOString(), // Today
                createdAt: '2024-12-20T00:00:00Z',
                description: 'Strategic advisory for corporate restructuring',
                tags: ['corporate', 'advisory']
            },
            {
                id: 'case_004',
                name: 'Employment Contract Review',
                clientOrganizationId: null,
                clientOrganizationName: 'Smith & Associates',
                type: 'legal',
                status: 'paused',
                priority: 'low',
                caseLeadId: null,
                caseLeadName: 'Emily Davis',
                nextDeadline: '2025-01-25T00:00:00Z',
                lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                createdAt: '2024-11-01T00:00:00Z',
                description: 'Review and update employment contracts',
                tags: ['employment', 'contracts']
            },
            {
                id: 'case_005',
                name: 'Grant Application Support',
                clientOrganizationId: null,
                clientOrganizationName: 'Hope Foundation',
                type: 'nonprofit',
                status: 'active',
                priority: 'high',
                caseLeadId: null,
                caseLeadName: 'Sarah Johnson',
                nextDeadline: '2025-01-12T00:00:00Z',
                lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                createdAt: '2024-12-10T00:00:00Z',
                description: 'Support for federal grant application process',
                tags: ['grants', 'funding']
            }
        ];

        localStorage.setItem('cases', JSON.stringify(sampleCases));
    }
}

// ========================================
// CORE FUNCTIONS
// ========================================

// Global state
let currentCasesPage = 1;
let casesPerPage = 25;
let currentSortColumn = 'deadline';
let currentSortDirection = 'asc';
let selectedCaseIds = new Set();

// Load and display cases
function loadCases() {
    console.log('Loading cases...');
    initializeCases();
    renderCasesTable();
    updatePaginationInfo();
}

// Render cases table
function renderCasesTable() {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const tbody = document.getElementById('casesTableBody');

    if (!tbody) return;

    // Apply filters
    let filteredCases = filterCases(cases);

    // Apply sorting
    filteredCases = sortCases(filteredCases);

    // Apply pagination
    const startIndex = (currentCasesPage - 1) * casesPerPage;
    const endIndex = startIndex + casesPerPage;
    const paginatedCases = filteredCases.slice(startIndex, endIndex);

    if (paginatedCases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 3rem; color: #6b7280;">
                    <i class="fas fa-briefcase" style="font-size: 2rem; opacity: 0.3; margin-bottom: 1rem; display: block;"></i>
                    No cases found. ${filteredCases.length === 0 && cases.length > 0 ? 'Try adjusting your filters.' : 'Click "New Case" to create your first case.'}
                </td>
            </tr>
        `;
        return;
    }

    // Build table rows
    const rows = paginatedCases.map(caseItem => {
        const isSelected = selectedCaseIds.has(caseItem.id);
        const deadlineUrgent = isDeadlineUrgent(caseItem.nextDeadline);
        const activityStale = isActivityStale(caseItem.lastActivity);

        return `
            <tr style="cursor: pointer;" onmouseenter="this.style.background='#f9fafb'" onmouseleave="this.style.background='white'">
                <td style="padding: 0.75rem;" onclick="event.stopPropagation()">
                    <input type="checkbox" class="case-checkbox" data-case-id="${caseItem.id}" 
                        ${isSelected ? 'checked' : ''} 
                        onchange="toggleCaseSelection('${caseItem.id}')" 
                        style="cursor: pointer;">
                </td>
                <td onclick="openCaseDetail('${caseItem.id}')" style="font-weight: 500; color: #1f2937;">
                    ${caseItem.name}
                </td>
                <td onclick="openCaseDetail('${caseItem.id}')">${caseItem.clientOrganizationName}</td>
                <td onclick="openCaseDetail('${caseItem.id}')">
                    ${getTypeBadge(caseItem.type)}
                </td>
                <td onclick="openCaseDetail('${caseItem.id}')">
                    ${getStatusBadge(caseItem.status)}
                </td>
                <td onclick="openCaseDetail('${caseItem.id}')">
                    ${getPriorityIcon(caseItem.priority)}
                </td>
                <td onclick="openCaseDetail('${caseItem.id}')">${caseItem.caseLeadName}</td>
                <td onclick="openCaseDetail('${caseItem.id}')" style="${deadlineUrgent ? 'color: #dc2626; font-weight: 500;' : ''}">
                    ${formatDeadline(caseItem.nextDeadline)}
                </td>
                <td onclick="openCaseDetail('${caseItem.id}')" style="${activityStale ? 'color: #9ca3af;' : ''}">
                    ${formatLastActivity(caseItem.lastActivity)}
                </td>
                <td onclick="event.stopPropagation()">
                    <div class="dropdown" style="position: relative;">
                        <button onclick="toggleCaseMenu('${caseItem.id}')" style="background: none; border: none; cursor: pointer; padding: 0.25rem 0.5rem; font-size: 1.25rem; color: #6b7280;">
                            ⋮
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows;

    // Update pagination
    updatePaginationInfo();
}

// Filter cases based on current filter values
function filterCases(cases) {
    const searchTerm = document.getElementById('caseSearchInput')?.value.toLowerCase() || '';
    const clientFilter = document.getElementById('caseClientFilter')?.value || '';
    const typeFilter = document.getElementById('caseTypeFilter')?.value || '';
    const statusFilter = document.getElementById('caseStatusFilter')?.value || '';
    const priorityFilter = document.getElementById('casePriorityFilter')?.value || '';

    return cases.filter(caseItem => {
        const matchesSearch = !searchTerm ||
            caseItem.name.toLowerCase().includes(searchTerm) ||
            caseItem.clientOrganizationName.toLowerCase().includes(searchTerm) ||
            caseItem.caseLeadName.toLowerCase().includes(searchTerm);

        const matchesClient = !clientFilter || caseItem.clientOrganizationName === clientFilter;
        const matchesType = !typeFilter || caseItem.type === typeFilter;
        const matchesStatus = !statusFilter || caseItem.status === statusFilter;
        const matchesPriority = !priorityFilter || caseItem.priority === priorityFilter;

        return matchesSearch && matchesClient && matchesType && matchesStatus && matchesPriority;
    });
}

// Sort cases
function sortCases(cases) {
    const sortedCases = [...cases];

    sortedCases.sort((a, b) => {
        let aVal, bVal;

        switch (currentSortColumn) {
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
            case 'client':
                aVal = a.clientOrganizationName.toLowerCase();
                bVal = b.clientOrganizationName.toLowerCase();
                break;
            case 'type':
                aVal = a.type;
                bVal = b.type;
                break;
            case 'status':
                aVal = a.status;
                bVal = b.status;
                break;
            case 'priority':
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                aVal = priorityOrder[a.priority];
                bVal = priorityOrder[b.priority];
                break;
            case 'lead':
                aVal = a.caseLeadName.toLowerCase();
                bVal = b.caseLeadName.toLowerCase();
                break;
            case 'deadline':
                aVal = new Date(a.nextDeadline).getTime();
                bVal = new Date(b.nextDeadline).getTime();
                break;
            case 'activity':
                aVal = new Date(a.lastActivity).getTime();
                bVal = new Date(b.lastActivity).getTime();
                break;
            default:
                return 0;
        }

        if (aVal < bVal) return currentSortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    return sortedCases;
}

// Sort by column
function sortCasesBy(column) {
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    renderCasesTable();
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function getTypeBadge(type) {
    const badges = {
        legal: '<span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">Legal</span>',
        nonprofit: '<span style="background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">Nonprofit</span>',
        strategy: '<span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">Strategy</span>'
    };
    return badges[type] || type;
}

function getStatusBadge(status) {
    const badges = {
        active: '<span style="background: #d1fae5; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">Active</span>',
        paused: '<span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">Paused</span>',
        closed: '<span style="background: #e5e7eb; color: #374151; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">Closed</span>'
    };
    return badges[status] || status;
}

function getPriorityIcon(priority) {
    const icons = {
        critical: '<span style="color: #dc2626;" title="Critical"><i class="fas fa-exclamation-circle"></i> Critical</span>',
        high: '<span style="color: #f59e0b;" title="High"><i class="fas fa-arrow-up"></i> High</span>',
        medium: '<span style="color: #3b82f6;" title="Medium"><i class="fas fa-minus"></i> Medium</span>',
        low: '<span style="color: #6b7280;" title="Low"><i class="fas fa-arrow-down"></i> Low</span>'
    };
    return icons[priority] || priority;
}

function formatDeadline(deadline) {
    if (!deadline) return '<span style="color: #9ca3af;">No deadline</span>';
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return `<span style="color: #dc2626; font-weight: 500;">Overdue (${Math.abs(diffDays)}d)</span>`;
    } else if (diffDays === 0) {
        return '<span style="color: #dc2626; font-weight: 500;">Today</span>';
    } else if (diffDays <= 7) {
        return `<span style="color: #f59e0b; font-weight: 500;">${diffDays} days</span>`;
    } else {
        return date.toLocaleDateString();
    }
}

function formatLastActivity(activity) {
    if (!activity) return '<span style="color: #9ca3af;">No activity</span>';
    const date = new Date(activity);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

function isDeadlineUrgent(deadline) {
    if (!deadline) return false;
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
}

function isActivityStale(activity) {
    if (!activity) return true;
    const date = new Date(activity);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return diffDays > 7;
}

// ========================================
// INTERACTION HANDLERS
// ========================================

function toggleCaseSelection(caseId) {
    if (selectedCaseIds.has(caseId)) {
        selectedCaseIds.delete(caseId);
    } else {
        selectedCaseIds.add(caseId);
    }
    updateBulkActionsToolbar();
}

function updateBulkActionsToolbar() {
    const toolbar = document.getElementById('bulkActionsToolbar');
    const countSpan = document.getElementById('selectedCount');

    if (toolbar && countSpan) {
        if (selectedCaseIds.size > 0) {
            toolbar.style.display = 'block';
            countSpan.textContent = `${selectedCaseIds.size} selected`;
        } else {
            toolbar.style.display = 'none';
        }
    }
}

function clearBulkSelection() {
    selectedCaseIds.clear();
    document.querySelectorAll('.case-checkbox').forEach(cb => cb.checked = false);
    updateBulkActionsToolbar();
}

function openCaseDetail(caseId) {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseItem = cases.find(c => c.id === caseId);

    if (!caseItem) {
        alert('Case not found.');
        return;
    }

    alert(`Case Detail:\n\nName: ${caseItem.name}\nClient: ${caseItem.clientOrganizationName}\nType: ${caseItem.type}\nStatus: ${caseItem.status}\nPriority: ${caseItem.priority}\n\n(Full case dashboard coming soon)`);
}

// Pagination
function updatePaginationInfo() {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const filteredCases = filterCases(cases);
    const totalCount = filteredCases.length;
    const startIndex = (currentCasesPage - 1) * casesPerPage + 1;
    const endIndex = Math.min(startIndex + casesPerPage - 1, totalCount);

    document.getElementById('casesShowingStart').textContent = totalCount > 0 ? startIndex : 0;
    document.getElementById('casesShowingEnd').textContent = endIndex;
    document.getElementById('casesTotalCount').textContent = totalCount;
    document.getElementById('currentPageDisplay').textContent = `Page ${currentCasesPage}`;

    // Update button states
    document.getElementById('prevPageBtn').disabled = currentCasesPage === 1;
    document.getElementById('nextPageBtn').disabled = endIndex >= totalCount;
}

function previousCasesPage() {
    if (currentCasesPage > 1) {
        currentCasesPage--;
        renderCasesTable();
    }
}

function nextCasesPage() {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const filteredCases = filterCases(cases);
    const maxPage = Math.ceil(filteredCases.length / casesPerPage);

    if (currentCasesPage < maxPage) {
        currentCasesPage++;
        renderCasesTable();
    }
}

// Open New Case Modal
function openNewCaseModal() {
    // Populate client dropdown
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const clientOrgs = organizations.filter(org => org.type === 'client');

    const clientSelect = document.getElementById('newCaseClient');
    if (clientSelect) {
        clientSelect.innerHTML = '<option value="">Select a client...</option>';
        clientSelect.innerHTML += '<option value="__new__" style="color: #3b82f6; font-weight: 500;">+ Create New Client</option>';
        clientSelect.innerHTML += '<option disabled>──────────</option>';

        clientOrgs.forEach(org => {
            const option = document.createElement('option');
            option.value = org.id;
            option.textContent = org.name;
            clientSelect.appendChild(option);
        });

        // Add change handler for "Create New Client" option
        clientSelect.onchange = function () {
            if (this.value === '__new__') {
                closeNewCaseModal();
                if (typeof Dashboard !== 'undefined' && typeof Dashboard.openAddNewClientModal === 'function') {
                    Dashboard.openAddNewClientModal();
                } else if (typeof openAddNewClientModal === 'function') {
                    openAddNewClientModal();
                }
            }
        };
    }

    // Reset form
    document.getElementById('newCaseForm').reset();

    // Open modal
    const modal = document.getElementById('newCaseModal');
    if (modal) modal.classList.add('active');
}

// Close New Case Modal
function closeNewCaseModal() {
    const modal = document.getElementById('newCaseModal');
    if (modal) modal.classList.remove('active');
}

// Create New Case
function createNewCase() {
    const caseName = document.getElementById('newCaseName').value.trim();
    const clientId = document.getElementById('newCaseClient').value;
    const type = document.getElementById('newCaseType').value;
    const priority = document.getElementById('newCasePriority').value;
    const status = document.getElementById('newCaseStatus').value;
    const deadline = document.getElementById('newCaseDeadline').value;
    const description = document.getElementById('newCaseDescription').value.trim();

    // Validation
    if (!caseName || !clientId || !type || !priority || !status) {
        alert('Please fill in all required fields.');
        return;
    }

    // Get client organization name
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const clientOrg = organizations.find(org => org.id === clientId);

    if (!clientOrg) {
        alert('Selected client organization not found.');
        return;
    }

    // Get current user for case lead
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const caseLeadName = currentUser.firstName && currentUser.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : 'Master Admin';

    // Create new case object
    const newCase = {
        id: 'case_' + Date.now(),
        name: caseName,
        clientOrganizationId: clientId,
        clientOrganizationName: clientOrg.name,
        type: type,
        status: status,
        priority: priority,
        caseLeadId: currentUser.id || null,
        caseLeadName: caseLeadName,
        nextDeadline: deadline ? new Date(deadline).toISOString() : null,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        description: description,
        tags: []
    };

    // Save to localStorage
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    cases.push(newCase);
    localStorage.setItem('cases', JSON.stringify(cases));

    // Close modal
    closeNewCaseModal();

    // Show success modal
    const successModal = document.getElementById('caseSuccessModal');
    if (successModal) successModal.classList.add('active');

    // Refresh cases table
    renderCasesTable();
}

// Close Success Modal
function closeCaseSuccessModal() {
    const modal = document.getElementById('caseSuccessModal');
    if (modal) modal.classList.remove('active');
}

function exportCasesToExcel() {
    alert('Export to Excel coming soon!');
}

function bulkAssignLead() {
    alert(`Assign lead to ${selectedCaseIds.size} selected cases (coming soon)`);
}

function bulkChangeStatus() {
    alert(`Change status for ${selectedCaseIds.size} selected cases (coming soon)`);
}

function bulkArchive() {
    alert(`Archive ${selectedCaseIds.size} selected cases (coming soon)`);
}

function toggleCaseMenu(caseId) {
    alert(`Quick actions for case ${caseId} (coming soon)`);
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    // Search input
    const searchInput = document.getElementById('caseSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentCasesPage = 1;
            renderCasesTable();
        });
    }

    // Filter dropdowns
    ['caseClientFilter', 'caseTypeFilter', 'caseStatusFilter', 'casePriorityFilter'].forEach(id => {
        const filter = document.getElementById(id);
        if (filter) {
            filter.addEventListener('change', () => {
                currentCasesPage = 1;
                renderCasesTable();
            });
        }
    });

    // Per page selector
    const perPageSelect = document.getElementById('casesPerPage');
    if (perPageSelect) {
        perPageSelect.addEventListener('change', (e) => {
            casesPerPage = parseInt(e.target.value);
            currentCasesPage = 1;
            renderCasesTable();
        });
    }

    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllCases');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.case-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                const caseId = cb.getAttribute('data-case-id');
                if (e.target.checked) {
                    selectedCaseIds.add(caseId);
                } else {
                    selectedCaseIds.delete(caseId);
                }
            });
            updateBulkActionsToolbar();
        });
    }
});

// ========================================
// EXPOSE FUNCTIONS
// ========================================

window.loadCases = loadCases;
window.sortCasesBy = sortCasesBy;
window.toggleCaseSelection = toggleCaseSelection;
window.clearBulkSelection = clearBulkSelection;
window.openCaseDetail = openCaseDetail;
window.previousCasesPage = previousCasesPage;
window.nextCasesPage = nextCasesPage;
window.openNewCaseModal = openNewCaseModal;
window.closeNewCaseModal = closeNewCaseModal;
window.createNewCase = createNewCase;
window.closeCaseSuccessModal = closeCaseSuccessModal;
window.exportCasesToExcel = exportCasesToExcel;
window.bulkAssignLead = bulkAssignLead;
window.bulkChangeStatus = bulkChangeStatus;
window.bulkArchive = bulkArchive;
window.toggleCaseMenu = toggleCaseMenu;
