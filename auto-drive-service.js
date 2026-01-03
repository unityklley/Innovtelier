/**
 * Auto Drive Service
 * Centralized logic for creating Folder Structures and Default Files
 * for Clients and Cases in Google Drive.
 */

const AutoDriveAutomation = {

    // ==========================================
    // 1. PUBLIC INTERFACE
    // ==========================================

    /**
     * Create Full Folder Structure for a New Client
     * @param {Object} org - Organization object { id, name, ... }
     * @returns {Promise<string|null>} - The Drive Folder ID or null
     */
    async createClientStructure(org) {
        console.log('[AutoDrive] Creating Client Structure for:', org.name);
        if (!this.checkAuth()) return this.createLocalSimulation(org.id, `${org.name} Root`, 'client');

        try {
            // 1. Root Folder
            const rootId = await GoogleDrive.createFolder(`${org.name} Root`);
            if (!rootId) return null;

            // 2. Subfolders
            await GoogleDrive.createFolder('General_Contracts', rootId);
            await GoogleDrive.createFolder('Invoices', rootId);
            await GoogleDrive.createFolder('Company_Docs', rootId);

            // 3. Welcome File
            await GoogleDrive.createFile(
                'Welcome_Packet.pdf',
                'application/pdf',
                'Welcome to Innovtelier Platform...',
                rootId
            );

            return rootId;
        } catch (e) {
            console.error('[AutoDrive] Client Creation Failed:', e);
            return null;
        }
    },

    /**
     * Create Full Folder Structure for a New Case
     * @param {Object} caseItem - Case object
     * @returns {Promise<string|null>} - The Drive Folder ID
     */
    async createCaseStructure(caseItem) {
        const clientName = (caseItem.clientOrganizationName || caseItem.personalInfo?.lastName || 'Client').trim();
        const caseLabel = caseItem.id || 'New_Case';
        console.log('[AutoDrive] Creating Case Structure for:', caseLabel);

        // Fallback or Real?
        if (!this.checkAuth()) {
            return this.createLocalSimulation(caseItem.id || 'temp', `${clientName} Case Repository`, 'case', caseItem);
        }

        try {
            // 1. Create Root Case Folder
            // Ideally this should be inside the Client's Root Folder if we knew it.
            // For now, we create it at the top level or in the Master Folder.
            const content = `${clientName} Case Repository`;
            const rootId = await GoogleDrive.createFolder(content);

            if (!rootId) return null;

            // 2. Generate Files based on Service Type
            const serviceLower = (caseItem.services || caseItem.caseInfo?.type || '').toLowerCase();
            const dateStr = new Date().toISOString().split('T')[0];
            const safeName = clientName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');

            // -- Common Files --
            await GoogleDrive.createFile(
                `${safeName}_Intake_Form.pdf`,
                'application/pdf',
                'Intake Form Data Placeholder',
                rootId
            );

            // -- Conditional Logic --
            if (serviceLower.includes('litigation') || serviceLower.includes('trial') || serviceLower.includes('defense')) {
                // Folder Structure
                const pId = await GoogleDrive.createFolder('Pleadings', rootId);
                const dId = await GoogleDrive.createFolder('Discovery', rootId);
                await GoogleDrive.createFolder('Evidence', rootId);

                // Files
                await GoogleDrive.createFile(`${safeName}_Strategy.docx`, 'application/vnd.google-apps.document', 'Strategy', rootId);

            } else if (serviceLower.includes('formation') || serviceLower.includes('business')) {
                await GoogleDrive.createFile(`${safeName}_Articles.pdf`, 'application/pdf', 'Articles', rootId);
                await GoogleDrive.createFile(`${safeName}_Bylaws.docx`, 'application/vnd.google-apps.document', 'Bylaws', rootId);

            } else if (serviceLower.includes('family') || serviceLower.includes('divorce')) {
                await GoogleDrive.createFolder('Financials', rootId);
                await GoogleDrive.createFolder('Court_Filings', rootId);
                await GoogleDrive.createFile(`${safeName}_Petition.docx`, 'application/vnd.google-apps.document', 'Petition', rootId);

            } else {
                // Generic
                await GoogleDrive.createFolder('Correspondence', rootId);
                await GoogleDrive.createFolder('Research', rootId);
                await GoogleDrive.createFile(`${safeName}_Notes.docx`, 'application/vnd.google-apps.document', 'Notes', rootId);
            }

            console.log('[AutoDrive] Case Structure Created:', rootId);
            return rootId;

        } catch (e) {
            console.error('[AutoDrive] Case Creation Failed:', e);
            return null;
        }
    },

    // ==========================================
    // 2. HELPERS
    // ==========================================

    checkAuth() {
        return (typeof GoogleDrive !== 'undefined' && GoogleDrive.isSignedIn && !GoogleDrive.demoMode);
    },

    // Simulate creation in LocalStorage so UI looks correct even without Real Drive
    createLocalSimulation(idKey, folderName, type, contextData = {}) {
        return 'folder_' + idKey;
        // Note: The UI usually checks 'demoDriveFolders' itself. 
        // If we want to centralize that writing, we should do it here.
        // For now, returning the ID is often enough for the calling code to fall back to its own simulation logic
        // OR we can move the simulation write here:
        /*
        const driveFolders = JSON.parse(localStorage.getItem('demoDriveFolders') || '{}');
        const folderId = 'folder_' + idKey;
        if (!driveFolders[folderId]) {
            driveFolders[folderId] = {
                name: folderName,
                files: this.getSimulationFiles(type, contextData)
            };
            localStorage.setItem('demoDriveFolders', JSON.stringify(driveFolders));
        }
        return folderId;
        */
    }
};
