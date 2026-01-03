// Client Intake Form JavaScript

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeForm();
    loadDraft();
});

// Initialize form event listeners
function initializeForm() {
    const form = document.getElementById('intakeForm');
    const caseTypeSelect = document.getElementById('caseType');
    const previousAttorneySelect = document.getElementById('previousAttorney');
    const fileUpload = document.getElementById('fileUpload');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const saveDraftBtn = document.getElementById('saveDraftBtn');

    // Handle case type change
    caseTypeSelect.addEventListener('change', function () {
        const otherGroup = document.getElementById('otherCaseTypeGroup');
        const familyLawSection = document.getElementById('familyLawSection');

        if (this.value === 'other') {
            otherGroup.style.display = 'block';
            document.getElementById('otherCaseType').required = true;
        } else {
            otherGroup.style.display = 'none';
            document.getElementById('otherCaseType').required = false;
        }

        // Show/hide family law section
        if (this.value === 'family-law') {
            familyLawSection.style.display = 'block';
        } else {
            familyLawSection.style.display = 'none';
        }
    });

    // Handle previous attorney change
    previousAttorneySelect.addEventListener('change', function () {
        const detailsGroup = document.getElementById('previousAttorneyDetails');
        if (this.value === 'yes') {
            detailsGroup.style.display = 'block';
        } else {
            detailsGroup.style.display = 'none';
        }
    });

    // Handle children involved change
    const childrenInvolvedRadios = document.querySelectorAll('input[name="childrenInvolved"]');
    childrenInvolvedRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            const numberOfChildrenGroup = document.getElementById('numberOfChildrenGroup');
            if (this.value === 'yes') {
                numberOfChildrenGroup.style.display = 'block';
            } else {
                numberOfChildrenGroup.style.display = 'none';
            }
        });
    });

    // Handle file upload
    fileUpload.addEventListener('change', handleFileSelect);

    // Drag and drop for files
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('drop', handleFileDrop);
    fileUploadArea.addEventListener('click', () => fileUpload.click());

    // Save draft
    saveDraftBtn.addEventListener('click', saveDraft);

    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // Auto-save draft every 30 seconds
    setInterval(saveDraft, 30000);
}

// Handle file selection
let selectedFiles = [];

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('fileUploadArea').classList.add('drag-over');
}

// Handle file drop
function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('fileUploadArea').classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files);
    const allowedTypes = ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png', 'text/plain'];

    const validFiles = files.filter(file => {
        return allowedTypes.includes(file.type) ||
            file.name.match(/\.(pdf|doc|docx|jpg|jpeg|png|txt)$/i);
    });

    if (validFiles.length !== files.length) {
        alert('Some files were not added. Only PDF, DOC, DOCX, JPG, PNG, and TXT files are allowed.');
    }

    addFiles(validFiles);
}

// Add files to the list
function addFiles(files) {
    files.forEach(file => {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert(`File "${file.name}" is too large. Maximum file size is 10MB.`);
            return;
        }

        // Check if file already exists
        if (selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
            return;
        }

        selectedFiles.push(file);
    });

    updateFileList();
}

// Update file list display
function updateFileList() {
    const fileList = document.getElementById('fileList');

    if (selectedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }

    fileList.innerHTML = selectedFiles.map((file, index) => {
        const fileSize = formatFileSize(file.size);
        return `
            <div class="file-item">
                <div class="file-info">
                    <i class="fas fa-file"></i>
                    <div>
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${fileSize}</span>
                    </div>
                </div>
                <button type="button" class="file-remove" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Remove file
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();

    // Update file input
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    document.getElementById('fileUpload').files = dataTransfer.files;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Save draft to localStorage
function saveDraft() {
    const formData = new FormData(document.getElementById('intakeForm'));
    const draft = {};

    for (let [key, value] of formData.entries()) {
        draft[key] = value;
    }

    // Save file names (not the actual files)
    draft.fileNames = selectedFiles.map(f => f.name);

    localStorage.setItem('intakeDraft', JSON.stringify(draft));

    // Show save notification
    showNotification('Draft saved', 'success');
}

// Load draft from localStorage
function loadDraft() {
    const draft = localStorage.getItem('intakeDraft');
    if (!draft) return;

    try {
        const data = JSON.parse(draft);
        Object.keys(data).forEach(key => {
            if (key === 'fileNames') return; // Skip file names

            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key] === 'on' || data[key] === true;
                } else {
                    element.value = data[key];
                }
            }
        });

        // Trigger change events to show conditional fields
        document.getElementById('caseType').dispatchEvent(new Event('change'));
        document.getElementById('previousAttorney').dispatchEvent(new Event('change'));

        // Trigger children involved change if applicable
        const childrenInvolvedRadio = document.querySelector('input[name="childrenInvolved"]:checked');
        if (childrenInvolvedRadio) {
            childrenInvolvedRadio.dispatchEvent(new Event('change'));
        }

        showNotification('Draft loaded', 'info');
    } catch (e) {
        console.error('Error loading draft:', e);
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = document.getElementById('intakeForm');
    const formData = new FormData(form);

    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Get current user for ownership
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const organizationId = currentUser ? currentUser.organizationId : null;

    // Prepare case data
    const caseData = {
        id: generateCaseId(),
        organizationId: organizationId, // Link case to organization
        timestamp: new Date().toISOString(),
        status: 'pending',
        personalInfo: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zipCode: formData.get('zipCode')
        },
        caseInfo: {
            type: formData.get('caseType'),
            otherType: formData.get('otherCaseType') || '',
            urgency: formData.get('urgency'),
            description: formData.get('caseDescription'),
            previousAttorney: formData.get('previousAttorney'),
            previousAttorneyInfo: formData.get('previousAttorneyInfo') || ''
        },
        familyLawDetails: formData.get('caseType') === 'family-law' ? {
            county: formData.get('county') || '',
            judgeAssigned: formData.get('judgeAssigned') || '',
            childrenInvolved: formData.get('childrenInvolved') || 'no',
            numberOfChildren: formData.get('childrenInvolved') === 'yes' ? (formData.get('numberOfChildren') || 0) : 0,
            domesticViolence: formData.get('domesticViolence') === 'on'
        } : null,
        additionalInfo: {
            referralSource: formData.get('referralSource') || '',
            notes: formData.get('additionalNotes') || ''
        },
        files: [],
        notes: [],
        assignedTo: null,
        lastUpdated: new Date().toISOString()
    };

    // Process files
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            data: await fileToBase64(file)
        };
        caseData.files.push(fileData);
    }

    // AUTOMATION: Create Linked Google Drive Folder
    // using the centralized helper logic
    try {
        const driveFolderId = await createAutomatedCaseFolder(caseData);
        if (driveFolderId) {
            caseData.googleDriveFolderId = driveFolderId;
        }
    } catch (err) {
        console.error('Error creating automated folder:', err);
    }

    // Save case to storage
    saveCase(caseData);

    // Clear draft
    localStorage.removeItem('intakeDraft');

    // Show success modal
    document.getElementById('submittedCaseNumber').textContent = caseData.id;
    document.getElementById('successModal').style.display = 'flex';

    // Reset form
    form.reset();
    selectedFiles = [];
    updateFileList();
}

// Helper: Auto-create Drive Folder Structure (Async)
// Duplicated/Shared logic from cases-management.js to ensure independence
async function createAutomatedCaseFolder(caseItem) {
    // Determine Client Name (Personal Info for Intake)
    const clientName = `${caseItem.personalInfo.firstName} ${caseItem.personalInfo.lastName}`;
    const clientId = caseItem.id; // Use Case ID as unique identifier since Organization might be null for new intakes

    // Default to Local ID
    let finalFolderId = 'folder_' + clientId;

    // Generate intelligent default files based on Service Type
    let defaultFiles = [];
    const dateStr = new Date().toLocaleDateString();
    const safeClientName = clientName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');

    // 1. Common Base Files 
    defaultFiles.push(
        { name: `${safeClientName}_Intake_Form.pdf`, type: 'pdf', icon: '<i class="far fa-file-pdf" style="color: #ef4444; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/pdf', content: 'Intake Form Placeholder' }
    );

    // 2. Service-Specific Files
    const serviceLower = (caseItem.caseInfo.type || '').toLowerCase();

    if (serviceLower.includes('family') || serviceLower.includes('divorce')) {
        defaultFiles.push({ name: 'Court_Documents', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' });
        defaultFiles.push({ name: 'Financial_Disclosures', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' });
        defaultFiles.push({ name: `${safeClientName}_Petition.docx`, type: 'doc', icon: '<i class="far fa-file-word" style="color: #2563eb; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/vnd.google-apps.document', content: 'Petition Placeholder' });

    } else if (serviceLower.includes('estate') || serviceLower.includes('probate')) {
        defaultFiles.push({ name: `${safeClientName}_Last_Will.docx`, type: 'doc', icon: '<i class="far fa-file-word" style="color: #2563eb; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/vnd.google-apps.document', content: 'Will Placeholder' });
        defaultFiles.push({ name: `${safeClientName}_Trust_Deed.pdf`, type: 'pdf', icon: '<i class="far fa-file-pdf" style="color: #ef4444; margin-right: 0.75rem;"></i>', date: dateStr, mime: 'application/pdf', content: 'Trust Placeholder' });

    } else {
        defaultFiles.push({ name: 'Correspondence', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' });
        defaultFiles.push({ name: 'Evidence', type: 'folder', icon: '<i class="fas fa-folder" style="color: #60a5fa; margin-right: 0.75rem;"></i>' });
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

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Generate case ID
function generateCaseId() {
    const prefix = 'CASE';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// Save case to localStorage
function saveCase(caseData) {
    let cases = getCases();
    cases.push(caseData);
    localStorage.setItem('legalCases', JSON.stringify(cases));
}

// Get all cases from localStorage
function getCases() {
    const cases = localStorage.getItem('legalCases');
    return cases ? JSON.parse(cases) : [];
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    window.location.href = 'index.html';
}


