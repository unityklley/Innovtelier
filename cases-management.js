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

    // Update work KPIs
    if (typeof updateWorkKPIs === 'function') {
        updateWorkKPIs();
    }
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
        const deadlineUrgent = isDeadlineUrgent(caseItem.nextDeadline);
        const activityStale = isActivityStale(caseItem.lastActivity);

        return `
            <tr style="cursor: pointer;" onmouseenter="this.style.background='#f9fafb'" onmouseleave="this.style.background='white'">
                <td onclick="openCaseDetail('${caseItem.id}')" style="font-weight: 500; color: #1f2937;">
                    ${caseItem.name}
                </td>
                <td onclick="openCaseDetail('${caseItem.id}')">${caseItem.clientOrganizationName}</td>
                <td class="editable-cell" onclick="editType('${caseItem.id}', event)" title="Click to edit">
                    ${getTypeBadge(caseItem.type)}
                </td>
                <td class="editable-cell" onclick="editStatus('${caseItem.id}', event)" title="Click to edit">
                    ${getStatusBadge(caseItem.status)}
                </td>
                <td class="editable-cell" onclick="editPriority('${caseItem.id}', event)" title="Click to edit">
                    ${getPriorityIcon(caseItem.priority)}
                </td>
                <td class="editable-cell" onclick="editLead('${caseItem.id}', event)" title="Click to edit">${caseItem.caseLeadName}</td>
                <td class="editable-cell" onclick="editDeadline('${caseItem.id}', event)" title="Click to edit" style="${deadlineUrgent ? 'color: #dc2626; font-weight: 500;' : ''}">
                    ${formatDeadline(caseItem.nextDeadline)}
                </td>
                <td onclick="openCaseDetail('${caseItem.id}')" style="${activityStale ? 'color: #9ca3af;' : ''}">
                    ${formatLastActivity(caseItem.lastActivity)}
                </td>
                <td onclick="event.stopPropagation()">
                    <div class="dropdown" style="position: relative;">
                        <button onclick="toggleCaseMenu('${caseItem.id}', event)" style="background: none; border: none; cursor: pointer; padding: 0.25rem 0.5rem; font-size: 1.25rem; color: #6b7280;">
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
    // Redirect to the full edit/view detail modal
    if (typeof openEditCaseModal === 'function') {
        openEditCaseModal(caseId);
    } else {
        console.error('openEditCaseModal function is missing!');
        const cases = JSON.parse(localStorage.getItem('cases') || '[]');
        const caseItem = cases.find(c => c.id === caseId);
        if (caseItem) {
            alert(`Case Detail:\n\nName: ${caseItem.name}\nClient: ${caseItem.clientOrganizationName}\nType: ${caseItem.type}\nStatus: ${caseItem.status}`);
        }
    }
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
    const clientType = document.getElementById('newCaseClientType').value;
    const services = document.getElementById('newCaseServices').value;
    const priority = document.getElementById('newCasePriority').value;
    const status = document.getElementById('newCaseStatus').value;
    const startDate = document.getElementById('newCaseStartDate').value;
    const deadline = document.getElementById('newCaseDeadline').value;
    const description = document.getElementById('newCaseDescription').value.trim();

    // Validation
    if (!caseName || !clientId || !clientType || !services || !priority || !status) {
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

    // Get service display name
    const serviceSelect = document.getElementById('newCaseServices');
    const serviceDisplayName = serviceSelect.options[serviceSelect.selectedIndex].text;

    // Create new case object
    const newCase = {
        id: 'case_' + Date.now(),
        name: caseName,
        clientOrganizationId: clientId,
        clientOrganizationName: clientOrg.name,
        clientType: clientType,
        services: services,
        servicesDisplayName: serviceDisplayName,
        type: clientType, // Keep for backward compatibility with table
        status: status,
        priority: priority,
        caseLeadId: currentUser.id || null,
        caseLeadName: caseLeadName,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        nextDeadline: deadline ? new Date(deadline).toISOString() : null,

        // Analytics Fields
        createdDate: new Date().toISOString(),         // Inflow Rate
        originalDeadline: deadline ? new Date(deadline).toISOString() : null, // Slippage baseline
        lastStageChange: new Date().toISOString(),     // Stagnation
        completedDate: (status === 'closed' || status === 'done') ? new Date().toISOString() : null, // Cycle Time

        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        description: description,
        tags: []
    };

    // AUTOMATION: Create Linked Google Drive Folder
    // Make async now to support real API calls
    createAutomatedCaseFolder(newCase).then(driveFolderId => {
        newCase.googleDriveFolderId = driveFolderId;

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
    });
}

// Helper: Auto-create Drive Folder Structure (Async)
async function createAutomatedCaseFolder(caseItem) {
    const clientId = caseItem.clientOrganizationId || 'unknown_client';
    const clientName = caseItem.clientOrganizationName || 'Client';

    // Default to Local ID
    let finalFolderId = 'folder_' + clientId;

    // Generate intelligent default files based on Service Type
    let defaultFiles = [];
    const dateStr = new Date().toLocaleDateString();
    const safeClientName = clientName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');

    // 1. Common Base Files
    defaultFiles.push(
        { name: `${safeClientName}_Intake_Form.pdf`, type: 'pdf', icon: '<i class="far fa-file-pdf" style="color: #ef4444; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/pdf', content: 'Placeholder PDF Content' }
    );

    // 2. Service-Specific Files
    const serviceLower = (caseItem.services || '').toLowerCase();

    if (serviceLower.includes('litigation') || serviceLower.includes('discovery') || serviceLower.includes('trial')) {
        defaultFiles.push({ name: '1. Pleadings', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' });
        defaultFiles.push({ name: '2. Discovery', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' });
        defaultFiles.push({ name: '3. Evidence', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' });
        defaultFiles.push({ name: `${safeClientName}_Case_Strategy.docx`, type: 'doc', icon: '<i class="far fa-file-word" style="color: #2563eb; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/vnd.google-apps.document', content: 'Strategy Doc Placeholder' });

    } else if (serviceLower.includes('formation') || serviceLower.includes('incorporation')) {
        defaultFiles.push({ name: `${safeClientName}_Articles_of_Incorporation.pdf`, type: 'pdf', icon: '<i class="far fa-file-pdf" style="color: #ef4444; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/pdf', content: 'Articles Placeholder' });
        defaultFiles.push({ name: `${safeClientName}_Bylaws_Draft.docx`, type: 'doc', icon: '<i class="far fa-file-word" style="color: #2563eb; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/vnd.google-apps.document', content: 'Bylaws Placeholder' });

    } else {
        defaultFiles.push({ name: 'Correspondence', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' });
        defaultFiles.push({ name: 'Legal_Research', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' });
        defaultFiles.push({ name: `${safeClientName}_Engagement_Letter.pdf`, type: 'pdf', icon: '<i class="far fa-file-pdf" style="color: #ef4444; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/pdf', content: 'Engagement Letter Placeholder' });
        defaultFiles.push({ name: `${safeClientName}_Case_Notes.docx`, type: 'doc', icon: '<i class="far fa-file-word" style="color: #2563eb; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/vnd.google-apps.document', content: 'Notes Placeholder' });
    }

    // 1. Try to create REAL Folder if connected
    if (typeof GoogleDrive !== 'undefined' && GoogleDrive.isSignedIn && !GoogleDrive.demoMode) {
        try {
            console.log('Accessing Real Google Drive API...');
            const realFolderId = await GoogleDrive.createFolder(`${clientName} Repository`);
            console.log('Created real Drive folder:', realFolderId);

            // Use the Real ID if successful
            if (realFolderId) {
                finalFolderId = realFolderId;

                // UPLOAD FILES TO REAL API
                console.log('Uploading default files to Drive...');
                for (const file of defaultFiles) {
                    if (file.type === 'folder') {
                        await GoogleDrive.createFolder(file.name, realFolderId);
                    } else {
                        // Create placeholder file
                        await GoogleDrive.createFile(file.name, file.mime || 'application/octet-stream', file.content || 'Placeholder', realFolderId);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to create real Drive folder, falling back to local simulation', err);
        }
    }

    // 2. ALWAYS Generate Local Structure (for UI display)
    // We map this structure to whatever ID we decided on (Real or Local)
    // This ensures the user sees the "Template Files" immediately in the portal
    const driveFolders = JSON.parse(localStorage.getItem('demoDriveFolders') || '{}');

    // If it already exists, return it
    if (driveFolders[finalFolderId]) {
        console.log('Folder structure already exists:', finalFolderId);
        return finalFolderId;
    }

    // Save structure
    driveFolders[finalFolderId] = {
        name: `${clientName} Repository`,
        files: defaultFiles
    };

    localStorage.setItem('demoDriveFolders', JSON.stringify(driveFolders));
    return finalFolderId;
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

// Open Edit Case Modal
function openEditCaseModal(caseId) {
    try {
        console.log('Attempting to open edit modal for case:', caseId);

        const modal = document.getElementById('editCaseModal');
        if (!modal) {
            console.error('Edit modal not found in DOM');
            return;
        }

        const cases = JSON.parse(localStorage.getItem('cases') || '[]');
        const caseItem = cases.find(c => c.id === caseId);

        if (!caseItem) {
            console.error('Case not found:', caseId);
            return;
        }

        // SELF-HEALING: If case has no specific folder linked, try to link it via Client ID now
        if (!caseItem.googleDriveFolderId && caseItem.clientOrganizationId) {
            console.log('Fixing missing folder link for case:', caseItem.name);
            const fixedFolderId = createAutomatedCaseFolder(caseItem); // This will get-or-create based on Client ID
            caseItem.googleDriveFolderId = fixedFolderId;
            // Update storage
            const caseIndex = cases.findIndex(c => c.id === caseId);
            if (caseIndex !== -1) {
                cases[caseIndex] = caseItem;
                localStorage.setItem('cases', JSON.stringify(cases));
            }
        }

        // Populate client dropdown
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
        const clientOrgs = organizations.filter(org => org.type === 'client');
        const clientSelect = document.getElementById('editCaseClient');

        if (clientSelect) {
            clientSelect.innerHTML = '<option value="">Select a client...</option>';
            let matchFound = false;

            clientOrgs.forEach(org => {
                const option = document.createElement('option');
                option.value = org.id;
                option.textContent = org.name;

                // 1. Try match by ID (loose equality)
                if (caseItem.clientOrganizationId && org.id == caseItem.clientOrganizationId) {
                    option.selected = true;
                    matchFound = true;
                }
                // 2. Fallback: Match by name (Case-insensitive, Trimmed)
                else if (!matchFound && caseItem.clientOrganizationName &&
                    (org.name === caseItem.clientOrganizationName ||
                        org.name.trim().toLowerCase() === caseItem.clientOrganizationName.trim().toLowerCase())) {
                    option.selected = true;
                    matchFound = true;
                }

                clientSelect.appendChild(option);
            });

            // Dynamic Fallback: Create option if no match found
            if (!matchFound && (caseItem.clientOrganizationId || caseItem.clientOrganizationName)) {
                const fallbackOption = document.createElement('option');
                fallbackOption.value = caseItem.clientOrganizationId || `temp-${Date.now()}`;
                fallbackOption.textContent = caseItem.clientOrganizationName || 'Unknown Client';
                fallbackOption.selected = true;
                clientSelect.appendChild(fallbackOption);
            }
        }

        // Populate fields
        document.getElementById('editCaseId').value = caseItem.id;
        document.getElementById('editCaseName').value = caseItem.name || '';
        document.getElementById('editCaseClientType').value = caseItem.clientType || caseItem.type || 'legal';

        // Services: Advanced Matching (Value or Text)
        const servicesSelect = document.getElementById('editCaseServices');
        const savedService = caseItem.services || '';
        servicesSelect.value = ''; // Reset
        let serviceMatched = false;

        // Try exact match first
        if (savedService) {
            servicesSelect.value = savedService;
            if (servicesSelect.value === savedService) {
                serviceMatched = true;
            }

            // Fallback: Fuzzy Text Match logic for Services
            if (!serviceMatched) {
                for (let i = 0; i < servicesSelect.options.length; i++) {
                    const opt = servicesSelect.options[i];
                    // Check if option text contains the saved service string (or vice versa)
                    if (opt.text.toLowerCase().includes(savedService.toLowerCase()) ||
                        savedService.toLowerCase().includes(opt.text.toLowerCase())) {
                        servicesSelect.value = opt.value;
                        serviceMatched = true;
                        break;
                    }
                }
            }

            // Dynamic Fallback: Create option if no match found
            if (!serviceMatched && savedService) {
                const fallbackOption = document.createElement('option');
                fallbackOption.value = savedService;
                fallbackOption.textContent = savedService;
                fallbackOption.selected = true;
                servicesSelect.appendChild(fallbackOption);
            }
        }

        document.getElementById('editCasePriority').value = caseItem.priority || 'medium';
        document.getElementById('editCaseStatus').value = caseItem.status || 'active';

        // Dates (convert ISO to YYYY-MM-DD for input[type=date])
        if (caseItem.startDate) {
            document.getElementById('editCaseStartDate').value = caseItem.startDate.split('T')[0];
        } else {
            document.getElementById('editCaseStartDate').value = '';
        }

        if (caseItem.nextDeadline) {
            document.getElementById('editCaseDeadline').value = caseItem.nextDeadline.split('T')[0];
        } else {
            document.getElementById('editCaseDeadline').value = '';
        }

        document.getElementById('editCaseDescription').value = caseItem.description || '';

        // Analytics Fields Population
        document.getElementById('editCaseCreatedDate').value = caseItem.createdDate ? caseItem.createdDate.split('T')[0] : '';
        document.getElementById('editCaseOriginalDeadline').value = caseItem.originalDeadline ? caseItem.originalDeadline.split('T')[0] : '';
        document.getElementById('editCaseCompletedDate').value = caseItem.completedDate ? caseItem.completedDate.split('T')[0] : '';

        // Populate Documents Section
        const folderNameEl = document.getElementById('docFolderName');
        const folderSubtextEl = document.getElementById('docFolderSubtext');
        const btnOpen = document.getElementById('btnOpenDriveFolder');
        const btnConnect = document.getElementById('btnConnectDrive');
        const fileListContainer = document.getElementById('docFileList');
        const fileListContent = document.getElementById('docFileListContent');

        // Use Global GoogleDrive object state
        const isDriveConnected = (typeof GoogleDrive !== 'undefined' && GoogleDrive.isSignedIn) || localStorage.getItem('googleDriveConnected') === 'true';

        // UI References
        const signInContainer = document.getElementById('googleSignInModalContainer');

        if (folderNameEl) {
            folderNameEl.textContent = caseItem.name ? `${caseItem.name} Files` : 'Project Assets';
        }

        if (fileListContainer) {
            if (isDriveConnected) {
                // Connected State: Show Files
                if (btnConnect) btnConnect.style.display = 'none';
                if (signInContainer) signInContainer.style.display = 'none';

                fileListContainer.style.display = 'block';

                // Get User Info
                const googleUser = JSON.parse(localStorage.getItem('googleUser') || '{}');
                const userEmail = googleUser.email || 'demo@innovtelier.com';

                if (folderSubtextEl) {
                    folderSubtextEl.innerHTML = `Google Drive • <span style="color: #059669;">Connected</span> • <span style="font-weight: 500;">${userEmail}</span>`;
                }

                // DYNAMIC RENDERING LOGIC:
                let displayFiles = [];

                // 1. Check for specific linked folder (New System)
                if (caseItem.googleDriveFolderId) {
                    const driveFolders = JSON.parse(localStorage.getItem('demoDriveFolders') || '{}');
                    const linkedFolder = driveFolders[caseItem.googleDriveFolderId];
                    if (linkedFolder && linkedFolder.files) {
                        displayFiles = linkedFolder.files;
                        console.log('Loaded linked folder:', linkedFolder.name);
                    }
                }

                // 2. Fallback to name-based matching (Legacy System)
                if (displayFiles.length === 0) {
                    const uniquePrefix = caseItem.clientOrganizationName ? caseItem.clientOrganizationName.split(' ')[0] : 'Client';
                    const caseRef = caseItem.name.split(' ')[0];
                    displayFiles = [
                        { name: `${uniquePrefix}_Intake_Form.pdf`, type: 'pdf', icon: '<i class="far fa-file-pdf" style="color: #ef4444; margin-right: 0.75rem;"></i>', date: new Date().toLocaleDateString() },
                        { name: `${caseRef}_Service_Agreement.docx`, type: 'doc', icon: '<i class="far fa-file-word" style="color: #2563eb; margin-right: 0.75rem;"></i>', date: new Date().toLocaleDateString() },
                        { name: '1. Motions_and_Pleadings', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' },
                        { name: '2. Discovery_Materials', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' }
                    ];
                }

                fileListContent.innerHTML = displayFiles.map(file => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #f3f4f6; cursor: pointer;" onmouseenter="this.style.background='#f9fafb'" onmouseleave="this.style.background='white'">
                        <div style="display: flex; align-items: center; color: #374151; font-size: 0.875rem;">
                            ${file.icon} ${file.name}
                        </div>
                        <div style="color: #9ca3af; font-size: 0.75rem;">
                            ${file.type === 'folder' ? 'Folder' : (file.date || new Date().toLocaleDateString())}
                        </div>
                    </div>
                `).join('') + `
                    <div style="padding: 0.75rem 1rem; background: #f9fafb; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e5e7eb;">
                         <div style="font-size: 0.75rem; color: #6b7280; display: flex; align-items: center; gap: 0.5rem;">
                            <img src="${googleUser.picture || 'https://lh3.googleusercontent.com/a/default-user=s40-c'}" style="width: 20px; height: 20px; border-radius: 50%;">
                            <span>Using account: <strong>${userEmail}</strong></span>
                        </div>
                        <a href="#" onclick="alert('Opening full folder view...');" style="color: #2563eb; font-size: 0.75rem; text-decoration: none; font-weight: 500;">
                            View in Drive <i class="fas fa-external-link-alt" style="margin-left: 0.25rem;"></i>
                        </a>
                    </div>
                `;

            } else {
                // Not Connected State: Show Google Sign-In Button
                if (btnConnect) btnConnect.style.display = 'none'; // Hide custom button
                fileListContainer.style.display = 'none';
                if (folderSubtextEl) folderSubtextEl.textContent = 'Google Drive • Not Connected';

                if (signInContainer) {
                    signInContainer.style.display = 'flex';
                    // Render official button if SDK is ready
                    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                        google.accounts.id.renderButton(
                            signInContainer,
                            {
                                theme: 'outline',
                                size: 'large',
                                type: 'standard', // or 'icon'
                                text: 'signin_with',
                                shape: 'pill',
                                width: '250'
                            }
                        );
                    } else {
                        // Fallback if SDK not loaded (e.g. offline dev) - Show Demo Button logic
                        signInContainer.innerHTML = `
                            <button class="btn-secondary" onclick="document.getElementById('btnConnectDrive').click()">
                                <i class="fab fa-google"></i> Connect Drive (Demo)
                            </button>
                        `;
                        // Re-enable custom button handler to trigger demo
                        if (btnConnect) {
                            btnConnect.style.display = 'none'; // Keep hidden, use content in container
                            // Ensure the global handler is attached if needed, or inline above
                        }
                    }
                }
            }
        }

        // Populate Contacts Section
        const caseLeadEl = document.getElementById('contactCaseLead');
        if (caseLeadEl) {
            caseLeadEl.textContent = caseItem.caseLeadName || 'Unassigned';
        }

        // Open modal
        if (modal) modal.classList.add('active');

    } catch (error) {
        console.error('Error opening edit case modal:', error);
        alert('An error occurred while trying to open the edit window: ' + error.message);
    }
}

// Close Edit Case Modal
function closeEditCaseModal() {
    const modal = document.getElementById('editCaseModal');
    if (modal) modal.classList.remove('active');
}

// Google Drive Integration Helpers
function connectGoogleDrive() {
    // Check if GoogleDrive library is loaded
    if (typeof GoogleDrive !== 'undefined') {
        GoogleDrive.enableDemoMode(); // Use the standardized demo login

        // Refresh UI after short delay to allow state update
        setTimeout(() => {
            const caseId = document.getElementById('editCaseId').value;
            if (caseId) openEditCaseModal(caseId);
        }, 500);
    } else {
        // Fallback if script missing
        if (confirm('Connect to Google Drive (Simulated)?')) {
            localStorage.setItem('googleDriveConnected', 'true');
            const caseId = document.getElementById('editCaseId').value;
            if (caseId) openEditCaseModal(caseId);
        }
    }
}

function openGoogleDriveFolder() {
    // Deprecated in favor of embedded view, but kept as helper
    const caseName = document.getElementById('editCaseName').value;
    alert(`Opening Google Drive folder for: ${caseName || 'Project'}`);
}

// Save Case Changes
function saveCaseChanges() {
    const caseId = document.getElementById('editCaseId').value;
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const index = cases.findIndex(c => c.id === caseId);

    if (index === -1) {
        alert('Error saving: Case not found.');
        return;
    }

    // Get values
    const name = document.getElementById('editCaseName').value.trim();
    const clientId = document.getElementById('editCaseClient').value;
    const clientType = document.getElementById('editCaseClientType').value;
    const services = document.getElementById('editCaseServices').value;
    const priority = document.getElementById('editCasePriority').value;
    const status = document.getElementById('editCaseStatus').value;
    const startDate = document.getElementById('editCaseStartDate').value;
    const deadline = document.getElementById('editCaseDeadline').value;
    const description = document.getElementById('editCaseDescription').value.trim();

    // Analytics Fields
    const createdDate = document.getElementById('editCaseCreatedDate').value;
    const originalDeadline = document.getElementById('editCaseOriginalDeadline').value;
    const completedDate = document.getElementById('editCaseCompletedDate').value;

    if (!name || !clientId) {
        alert('Please fill in required fields.');
        return;
    }

    // Get client name
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const clientOrg = organizations.find(org => org.id === clientId);

    // Service display name
    const serviceSelect = document.getElementById('editCaseServices');
    const serviceDisplayName = serviceSelect.options[serviceSelect.selectedIndex].text;

    // Update object
    cases[index].name = name;
    cases[index].clientOrganizationId = clientId;
    cases[index].clientOrganizationName = clientOrg ? clientOrg.name : cases[index].clientOrganizationName;
    cases[index].clientType = clientType;
    cases[index].type = clientType; // Sync
    cases[index].services = services;
    cases[index].servicesDisplayName = serviceDisplayName;
    cases[index].servicesDisplayName = serviceDisplayName;
    cases[index].priority = priority;
    cases[index].status = status;
    cases[index].startDate = startDate ? new Date(startDate).toISOString() : null;
    cases[index].nextDeadline = deadline ? new Date(deadline).toISOString() : null;

    // Save Analytics Fields
    cases[index].createdDate = createdDate ? new Date(createdDate).toISOString() : cases[index].createdDate;

    // Only update original deadline if it's explicitly edited, otherwise keep existing
    if (originalDeadline) {
        cases[index].originalDeadline = new Date(originalDeadline).toISOString();
    }

    // Handle Completed Date Logic
    if (completedDate) {
        cases[index].completedDate = new Date(completedDate).toISOString();
    } else if ((status === 'closed' || status === 'done') && !cases[index].completedDate) {
        // Auto-set if status is closed but no date provided
        cases[index].completedDate = new Date().toISOString();
    } else if (status !== 'closed' && status !== 'done') {
        // Clear if re-opened and field is empty
        cases[index].completedDate = null;
    }

    cases[index].description = description;
    cases[index].lastActivity = new Date().toISOString();

    // Save
    localStorage.setItem('cases', JSON.stringify(cases));

    // Close & Refresh
    closeEditCaseModal();

    if (typeof renderCasesTable === 'function') renderCasesTable();
    if (typeof renderKanbanView === 'function') renderKanbanView();
    if (typeof renderCalendarView === 'function') renderCalendarView();
    if (typeof renderListView === 'function') renderListView();
    if (typeof updateWorkKPIs === 'function') updateWorkKPIs();

    // Show modest success indicator (optional) or just close
}

// Export functions already exposed in case-action-menu.js

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
window.openEditCaseModal = openEditCaseModal;
window.closeEditCaseModal = closeEditCaseModal;
window.saveCaseChanges = saveCaseChanges;
