// Paralegal Dashboard JavaScript

let allCases = [];
let filteredCases = [];
let currentView = 'list';
let currentCaseId = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    loadCases();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Filters
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('urgencyFilter').addEventListener('change', applyFilters);
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            displayCases();
        });
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', function () {
        this.classList.add('spinning');
        loadCases();
        setTimeout(() => this.classList.remove('spinning'), 500);
    });

    // Update case button
    document.getElementById('updateCaseBtn').addEventListener('click', openUpdateStatusModal);
    document.getElementById('confirmStatusUpdateBtn').addEventListener('click', confirmStatusUpdate);
}

// Load cases from localStorage
function loadCases() {
    const cases = localStorage.getItem('legalCases');
    let rawCases = cases ? JSON.parse(cases) : [];

    // Auth & Access Control
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!currentUser) return; // Should be handled by auth check in HTML

    if (currentUser.role === 'master-admin') {
        // Master Admin sees ALL cases
        allCases = rawCases;
    } else {
        // Client Admin sees ONLY their organization's cases
        // Cases without organizationId are hidden from clients for security
        allCases = rawCases.filter(c => c.organizationId && c.organizationId === currentUser.organizationId);
    }

    // Sort by timestamp (newest first)
    allCases.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    updateStats();
    applyFilters();
}

// Update dashboard statistics
function updateStats() {
    const stats = {
        pending: allCases.filter(c => c.status === 'pending').length,
        active: allCases.filter(c => c.status === 'active').length,
        completed: allCases.filter(c => c.status === 'completed' || c.status === 'closed').length,
        total: allCases.length
    };

    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('activeCount').textContent = stats.active;
    document.getElementById('completedCount').textContent = stats.completed;
    document.getElementById('totalCount').textContent = stats.total;
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        filteredCases = [...allCases];
    } else {
        filteredCases = allCases.filter(caseItem => {
            const fullName = `${caseItem.personalInfo.firstName} ${caseItem.personalInfo.lastName}`.toLowerCase();
            const caseType = getCaseTypeLabel(caseItem.caseInfo.type).toLowerCase();
            const caseId = caseItem.id.toLowerCase();

            return fullName.includes(searchTerm) ||
                caseType.includes(searchTerm) ||
                caseId.includes(searchTerm) ||
                caseItem.caseInfo.description.toLowerCase().includes(searchTerm);
        });
    }

    displayCases();
}

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const urgencyFilter = document.getElementById('urgencyFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    filteredCases = allCases.filter(caseItem => {
        // Status filter
        if (statusFilter && caseItem.status !== statusFilter) {
            return false;
        }

        // Type filter
        if (typeFilter && caseItem.caseInfo.type !== typeFilter) {
            return false;
        }

        // Urgency filter
        if (urgencyFilter && caseItem.caseInfo.urgency !== urgencyFilter) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const fullName = `${caseItem.personalInfo.firstName} ${caseItem.personalInfo.lastName}`.toLowerCase();
            const caseType = getCaseTypeLabel(caseItem.caseInfo.type).toLowerCase();
            const caseId = caseItem.id.toLowerCase();

            if (!fullName.includes(searchTerm) &&
                !caseType.includes(searchTerm) &&
                !caseId.includes(searchTerm) &&
                !caseItem.caseInfo.description.toLowerCase().includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    displayCases();
}

// Clear all filters
function clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('urgencyFilter').value = '';
    document.getElementById('searchInput').value = '';
    applyFilters();
}

// Display cases
function displayCases() {
    const container = document.getElementById('casesContainer');
    const emptyState = document.getElementById('emptyState');

    if (filteredCases.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    if (currentView === 'list') {
        container.className = 'cases-container list-view';
        container.innerHTML = filteredCases.map(caseItem => createCaseCard(caseItem)).join('');
    } else {
        container.className = 'cases-container grid-view';
        container.innerHTML = filteredCases.map(caseItem => createCaseCard(caseItem)).join('');
    }

    // Add event listeners to case cards
    container.querySelectorAll('.case-card').forEach(card => {
        card.addEventListener('click', function () {
            const caseId = this.dataset.caseId;
            openCaseModal(caseId);
        });
    });
}

// Create case card
function createCaseCard(caseItem) {
    const statusClass = getStatusClass(caseItem.status);
    const statusLabel = getStatusLabel(caseItem.status);
    const urgencyClass = getUrgencyClass(caseItem.caseInfo.urgency);
    const urgencyLabel = getUrgencyLabel(caseItem.caseInfo.urgency);
    const caseType = getCaseTypeLabel(caseItem.caseInfo.type);
    const date = new Date(caseItem.timestamp).toLocaleDateString();
    const time = new Date(caseItem.timestamp).toLocaleTimeString();
    const fileCount = caseItem.files ? caseItem.files.length : 0;

    return `
        <div class="case-card" data-case-id="${caseItem.id}">
            <div class="case-card-header">
                <div class="case-id">${caseItem.id}</div>
                <div class="case-status ${statusClass}">${statusLabel}</div>
            </div>
            <div class="case-card-body">
                <h3 class="case-client-name">${caseItem.personalInfo.firstName} ${caseItem.personalInfo.lastName}</h3>
                <div class="case-meta">
                    <span class="case-type">
                        <i class="fas fa-folder"></i>
                        ${caseType}
                    </span>
                    <span class="case-urgency ${urgencyClass}">
                        <i class="fas fa-exclamation-circle"></i>
                        ${urgencyLabel}
                    </span>
                </div>
                <p class="case-description">${truncateText(caseItem.caseInfo.description, 150)}</p>
                <div class="case-footer">
                    <div class="case-info">
                        <span class="case-date">
                            <i class="fas fa-calendar"></i>
                            ${date}
                        </span>
                        ${fileCount > 0 ? `
                            <span class="case-files">
                                <i class="fas fa-paperclip"></i>
                                ${fileCount} file${fileCount > 1 ? 's' : ''}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Open case detail modal
function openCaseModal(caseId) {
    currentCaseId = caseId;
    const caseItem = allCases.find(c => c.id === caseId);
    if (!caseItem) return;

    const modal = document.getElementById('caseModal');
    const modalBody = document.getElementById('modalCaseBody');
    const modalTitle = document.getElementById('modalCaseTitle');

    modalTitle.textContent = `Case: ${caseItem.id}`;

    modalBody.innerHTML = generateCaseDetailsHTML(caseItem);
    modal.style.display = 'flex';

    // Add event listeners for file downloads
    modalBody.querySelectorAll('.file-download').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            downloadFile(this.dataset.fileIndex, caseId);
        });
    });

    // Add event listener for adding notes
    const addNoteBtn = modalBody.querySelector('#addNoteBtn');
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', addNoteToCase);
    }
}

// Generate case details HTML
function generateCaseDetailsHTML(caseItem) {
    const statusClass = getStatusClass(caseItem.status);
    const statusLabel = getStatusLabel(caseItem.status);
    const urgencyClass = getUrgencyClass(caseItem.caseInfo.urgency);
    const urgencyLabel = getUrgencyLabel(caseItem.caseInfo.urgency);
    const caseType = getCaseTypeLabel(caseItem.caseInfo.type);
    const date = new Date(caseItem.timestamp).toLocaleString();
    const lastUpdated = new Date(caseItem.lastUpdated).toLocaleString();
    const fileCount = caseItem.files ? caseItem.files.length : 0;
    const notes = caseItem.notes || [];

    return `
        <div class="case-details">
            <div class="case-details-header">
                <div class="case-status-badge ${statusClass}">${statusLabel}</div>
                <div class="case-urgency-badge ${urgencyClass}">${urgencyLabel}</div>
            </div>
            
            <div class="case-details-section">
                <h4><i class="fas fa-user"></i> Client Information</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <label>Name:</label>
                        <span>${caseItem.personalInfo.firstName} ${caseItem.personalInfo.lastName}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email:</label>
                        <span><a href="mailto:${caseItem.personalInfo.email}">${caseItem.personalInfo.email}</a></span>
                    </div>
                    <div class="detail-item">
                        <label>Phone:</label>
                        <span><a href="tel:${caseItem.personalInfo.phone}">${caseItem.personalInfo.phone}</a></span>
                    </div>
                    <div class="detail-item">
                        <label>Address:</label>
                        <span>${caseItem.personalInfo.address || 'N/A'}, ${caseItem.personalInfo.city || ''}, ${caseItem.personalInfo.state || ''} ${caseItem.personalInfo.zipCode || ''}</span>
                    </div>
                </div>
            </div>
            
            <div class="case-details-section">
                <h4><i class="fas fa-folder-open"></i> Case Information</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <label>Case Type:</label>
                        <span>${caseType}</span>
                    </div>
                    <div class="detail-item">
                        <label>Urgency:</label>
                        <span class="${urgencyClass}">${urgencyLabel}</span>
                    </div>
                    <div class="detail-item">
                        <label>Submitted:</label>
                        <span>${date}</span>
                    </div>
                    <div class="detail-item">
                        <label>Last Updated:</label>
                        <span>${lastUpdated}</span>
                    </div>
                </div>
                <div class="detail-item full-width">
                    <label>Description:</label>
                    <p class="case-description-full">${caseItem.caseInfo.description}</p>
                </div>
                ${caseItem.caseInfo.previousAttorney === 'yes' ? `
                    <div class="detail-item full-width">
                        <label>Previous Attorney:</label>
                        <p>${caseItem.caseInfo.previousAttorneyInfo || 'N/A'}</p>
                    </div>
                ` : ''}
            </div>
            
            ${caseItem.additionalInfo.referralSource ? `
                <div class="case-details-section">
                    <h4><i class="fas fa-info-circle"></i> Additional Information</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Referral Source:</label>
                            <span>${caseItem.additionalInfo.referralSource}</span>
                        </div>
                        ${caseItem.additionalInfo.notes ? `
                            <div class="detail-item full-width">
                                <label>Notes:</label>
                                <p>${caseItem.additionalInfo.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${fileCount > 0 ? `
                <div class="case-details-section">
                    <h4><i class="fas fa-paperclip"></i> Attached Files (${fileCount})</h4>
                    <div class="files-list">
                        ${caseItem.files.map((file, index) => `
                            <div class="file-item-detail">
                                <div class="file-info-detail">
                                    <i class="fas fa-file"></i>
                                    <div>
                                        <span class="file-name-detail">${file.name}</span>
                                        <span class="file-size-detail">${formatFileSize(file.size)}</span>
                                    </div>
                                </div>
                                <button class="file-download" data-file-index="${index}">
                                    <i class="fas fa-download"></i>
                                    Download
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="case-details-section">
                <div class="section-header-with-action">
                    <h4><i class="fas fa-sticky-note"></i> Case Notes</h4>
                    <button class="btn-secondary btn-sm" onclick="toggleEditCaseDetails()" id="editCaseBtn">
                        <i class="fas fa-edit"></i> Edit Case Details
                    </button>
                </div>
                <div class="notes-container">
                    ${notes.length > 0 ? `
                        <div class="notes-list">
                            ${notes.map((note, index) => `
                                <div class="note-item" data-note-index="${index}">
                                    <div class="note-header">
                                        <div>
                                            <span class="note-date">${new Date(note.timestamp).toLocaleString()}</span>
                                            ${note.author ? `<span class="note-author">by ${note.author}</span>` : ''}
                                        </div>
                                        <div class="note-actions">
                                            <button class="btn-icon-sm" onclick="editNote(${index})" title="Edit Note">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-icon-sm btn-danger" onclick="deleteNote(${index})" title="Delete Note">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <p class="note-content" id="note-content-${index}">${note.content}</p>
                                    <div class="note-edit-form" id="note-edit-${index}" style="display: none;">
                                        <textarea class="note-edit-textarea" id="note-edit-text-${index}" rows="3">${note.content}</textarea>
                                        <div class="note-edit-actions">
                                            <button class="btn-primary btn-sm" onclick="saveNote(${index})">
                                                <i class="fas fa-save"></i> Save
                                            </button>
                                            <button class="btn-secondary btn-sm" onclick="cancelEditNote(${index})">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="no-notes">No notes added yet.</p>'}
                    <div class="add-note-form">
                        <textarea id="newNoteContent" rows="3" placeholder="Add a note about this case..."></textarea>
                        <button class="btn-primary" id="addNoteBtn">
                            <i class="fas fa-plus"></i>
                            Add Note
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="case-details-section" id="editCaseSection" style="display: none;">
                <h4><i class="fas fa-edit"></i> Edit Case Details</h4>
                <form id="editCaseForm" class="edit-case-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editCaseStatus">Status *</label>
                            <select id="editCaseStatus" required>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="on-hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editCaseUrgency">Urgency *</label>
                            <select id="editCaseUrgency" required>
                                <option value="emergency">Emergency</option>
                                <option value="urgent">Urgent</option>
                                <option value="normal">Normal</option>
                                <option value="low">Low Priority</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editCaseDescription">Case Description *</label>
                        <textarea id="editCaseDescription" rows="4" required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editCaseFirstName">First Name *</label>
                            <input type="text" id="editCaseFirstName" required>
                        </div>
                        <div class="form-group">
                            <label for="editCaseLastName">Last Name *</label>
                            <input type="text" id="editCaseLastName" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editCaseEmail">Email *</label>
                            <input type="email" id="editCaseEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="editCasePhone">Phone *</label>
                            <input type="tel" id="editCasePhone" required>
                        </div>
                    </div>
                    <div class="edit-case-actions">
                        <button type="button" class="btn-primary" onclick="saveCaseDetails()">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                        <button type="button" class="btn-secondary" onclick="cancelEditCaseDetails()">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            <div class="case-details-section">
                <div class="section-header-with-action">
                    <h4><i class="fas fa-file-alt"></i> Documents</h4>
                    <button class="btn-secondary btn-sm" onclick="openUploadDocumentModal()">
                        <i class="fas fa-upload"></i> Upload Document
                    </button>
                </div>
                <div class="documents-container" id="documentsContainer">
                    ${fileCount > 0 ? `
                        <div class="documents-list">
                            ${caseItem.files.map((file, index) => `
                                <div class="document-item">
                                    <div class="document-info">
                                        <i class="fas fa-file-pdf"></i>
                                        <div>
                                            <span class="document-name">${file.name}</span>
                                            <span class="document-meta">${formatFileSize(file.size)} • ${new Date(file.lastModified || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div class="document-actions">
                                        <button class="btn-icon-sm" onclick="downloadFile(${index}, '${caseItem.id}')" title="Download">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button class="btn-icon-sm btn-danger" onclick="deleteDocument(${index}, '${caseItem.id}')" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="no-documents">No documents uploaded yet.</p>'}
                </div>
            </div>
        </div>
    `;
}

// Add note to case
function addNoteToCase() {
    const noteContent = document.getElementById('newNoteContent').value.trim();
    if (!noteContent) {
        alert('Please enter a note.');
        return;
    }

    const caseItem = allCases.find(c => c.id === currentCaseId);
    if (!caseItem) return;

    if (!caseItem.notes) {
        caseItem.notes = [];
    }

    caseItem.notes.push({
        content: noteContent,
        timestamp: new Date().toISOString(),
        author: 'Paralegal' // In a real app, this would be the logged-in user
    });

    caseItem.lastUpdated = new Date().toISOString();

    saveCases();
    openCaseModal(currentCaseId);
}

// Download file
function downloadFile(fileIndex, caseId) {
    const caseItem = allCases.find(c => c.id === caseId);
    if (!caseItem || !caseItem.files[fileIndex]) return;

    const file = caseItem.files[fileIndex];
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Open update status modal
function openUpdateStatusModal() {
    const caseItem = allCases.find(c => c.id === currentCaseId);
    if (!caseItem) return;

    document.getElementById('newStatus').value = caseItem.status;
    document.getElementById('statusNotes').value = '';
    document.getElementById('updateStatusModal').style.display = 'flex';
}

// Confirm status update
function confirmStatusUpdate() {
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value.trim();

    if (!newStatus) {
        alert('Please select a status.');
        return;
    }

    const caseItem = allCases.find(c => c.id === currentCaseId);
    if (!caseItem) return;

    const oldStatus = caseItem.status;
    caseItem.status = newStatus;
    caseItem.lastUpdated = new Date().toISOString();

    // Add note about status change
    if (!caseItem.notes) {
        caseItem.notes = [];
    }

    caseItem.notes.push({
        content: `Status changed from ${getStatusLabel(oldStatus)} to ${getStatusLabel(newStatus)}. ${notes ? 'Note: ' + notes : ''}`,
        timestamp: new Date().toISOString(),
        author: 'Paralegal'
    });

    saveCases();
    closeUpdateStatusModal();
    openCaseModal(currentCaseId);
    loadCases(); // Refresh to update stats
}

// Close case modal
function closeCaseModal() {
    document.getElementById('caseModal').style.display = 'none';
    currentCaseId = null;
}

// Close update status modal
function closeUpdateStatusModal() {
    document.getElementById('updateStatusModal').style.display = 'none';
}

// Save cases to localStorage
function saveCases() {
    localStorage.setItem('legalCases', JSON.stringify(allCases));
}

// Helper functions
function getStatusClass(status) {
    const classes = {
        'pending': 'status-pending',
        'active': 'status-active',
        'on-hold': 'status-on-hold',
        'completed': 'status-completed',
        'closed': 'status-closed'
    };
    return classes[status] || 'status-pending';
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pending',
        'active': 'Active',
        'on-hold': 'On Hold',
        'completed': 'Completed',
        'closed': 'Closed'
    };
    return labels[status] || 'Pending';
}

function getUrgencyClass(urgency) {
    const classes = {
        'emergency': 'urgency-emergency',
        'urgent': 'urgency-urgent',
        'normal': 'urgency-normal',
        'low': 'urgency-low'
    };
    return classes[urgency] || 'urgency-normal';
}

function getUrgencyLabel(urgency) {
    const labels = {
        'emergency': 'Emergency',
        'urgent': 'Urgent',
        'normal': 'Normal',
        'low': 'Low Priority'
    };
    return labels[urgency] || 'Normal';
}

function getCaseTypeLabel(type) {
    const labels = {
        'family-law': 'Family Law',
        'criminal-defense': 'Criminal Defense',
        'personal-injury': 'Personal Injury',
        'employment': 'Employment Law',
        'immigration': 'Immigration',
        'housing': 'Housing',
        'estate-planning': 'Estate Planning',
        'business': 'Business Law',
        'other': 'Other'
    };
    return labels[type] || type;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Export cases
function exportCases() {
    const dataStr = JSON.stringify(allCases, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cases-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Edit note
function editNote(noteIndex) {
    const editForm = document.getElementById(`note-edit-${noteIndex}`);
    const noteContent = document.getElementById(`note-content-${noteIndex}`);

    if (!editForm || !noteContent) return;

    // Hide content, show edit form
    noteContent.style.display = 'none';
    editForm.style.display = 'block';

    // Focus on textarea
    const textarea = document.getElementById(`note-edit-text-${noteIndex}`);
    if (textarea) {
        textarea.focus();
    }
}

// Save edited note
function saveNote(noteIndex) {
    const caseItem = allCases.find(c => c.id === currentCaseId);
    if (!caseItem || !caseItem.notes || !caseItem.notes[noteIndex]) return;

    const textarea = document.getElementById(`note-edit-text-${noteIndex}`);
    if (!textarea) return;

    const newContent = textarea.value.trim();
    if (!newContent) {
        alert('Note content cannot be empty.');
        return;
    }

    // Update note
    caseItem.notes[noteIndex].content = newContent;
    caseItem.notes[noteIndex].timestamp = new Date().toISOString();
    caseItem.notes[noteIndex].edited = true;

    caseItem.lastUpdated = new Date().toISOString();

    saveCases();
    openCaseModal(currentCaseId);
}

// Cancel note edit
function cancelEditNote(noteIndex) {
    const editForm = document.getElementById(`note-edit-${noteIndex}`);
    const noteContent = document.getElementById(`note-content-${noteIndex}`);

    if (!editForm || !noteContent) return;

    // Show content, hide edit form
    noteContent.style.display = 'block';
    editForm.style.display = 'none';
}

// Delete note
function deleteNote(noteIndex) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    const caseItem = allCases.find(c => c.id === currentCaseId);
    if (!caseItem || !caseItem.notes) return;

    caseItem.notes.splice(noteIndex, 1);
    caseItem.lastUpdated = new Date().toISOString();

    saveCases();
    openCaseModal(currentCaseId);
}

// Toggle edit case details section
function toggleEditCaseDetails() {
    const editSection = document.getElementById('editCaseSection');
    const caseItem = allCases.find(c => c.id === currentCaseId);
    if (!caseItem || !editSection) return;

    if (editSection.style.display === 'none' || !editSection.style.display) {
        // Populate form with current case data
        document.getElementById('editCaseStatus').value = caseItem.status;
        document.getElementById('editCaseUrgency').value = caseItem.caseInfo.urgency;
        document.getElementById('editCaseDescription').value = caseItem.caseInfo.description;
        document.getElementById('editCaseFirstName').value = caseItem.personalInfo.firstName;
        document.getElementById('editCaseLastName').value = caseItem.personalInfo.lastName;
        document.getElementById('editCaseEmail').value = caseItem.personalInfo.email;
        document.getElementById('editCasePhone').value = caseItem.personalInfo.phone;

        editSection.style.display = 'block';
        editSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        editSection.style.display = 'none';
    }
}

// Save case details
function saveCaseDetails() {
    const caseItem = allCases.find(c => c.id === currentCaseId);
    if (!caseItem) return;

    // Validate required fields
    const status = document.getElementById('editCaseStatus').value;
    const urgency = document.getElementById('editCaseUrgency').value;
    const description = document.getElementById('editCaseDescription').value;
    const firstName = document.getElementById('editCaseFirstName').value;
    const lastName = document.getElementById('editCaseLastName').value;
    const email = document.getElementById('editCaseEmail').value;
    const phone = document.getElementById('editCasePhone').value;

    if (!status || !urgency || !description || !firstName || !lastName || !email || !phone) {
        alert('Please fill in all required fields.');
        return;
    }

    // Update case details
    caseItem.status = status;
    caseItem.caseInfo.urgency = urgency;
    caseItem.caseInfo.description = description;
    caseItem.personalInfo.firstName = firstName;
    caseItem.personalInfo.lastName = lastName;
    caseItem.personalInfo.email = email;
    caseItem.personalInfo.phone = phone;
    caseItem.lastUpdated = new Date().toISOString();

    saveCases();
    openCaseModal(currentCaseId);
    loadCases(); // Refresh the cases list
}

// Cancel edit case details
function cancelEditCaseDetails() {
    const editSection = document.getElementById('editCaseSection');
    if (editSection) {
        editSection.style.display = 'none';
    }
}

// Open upload document modal
function openUploadDocumentModal() {
    // Create a simple file input trigger
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt';

    input.onchange = async function (e) {
        const files = Array.from(e.target.files);
        await uploadDocuments(files);
    };

    input.click();
}

// Upload documents
async function uploadDocuments(files) {
    const caseItem = allCases.find(c => c.id === currentCaseId);
    if (!caseItem) return;

    if (!caseItem.files) {
        caseItem.files = [];
    }

    for (const file of files) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert(`File "${file.name}" is too large. Maximum file size is 10MB.`);
            continue;
        }

        // Convert to base64
        const fileData = await fileToBase64(file);

        caseItem.files.push({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            data: fileData
        });
    }

    caseItem.lastUpdated = new Date().toISOString();
    saveCases();
    openCaseModal(currentCaseId);
}

// Delete document
function deleteDocument(fileIndex, caseId) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }

    const caseItem = allCases.find(c => c.id === caseId);
    if (!caseItem || !caseItem.files) return;

    caseItem.files.splice(fileIndex, 1);
    caseItem.lastUpdated = new Date().toISOString();

    saveCases();
    openCaseModal(caseId);
}

// File to base64 helper
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


