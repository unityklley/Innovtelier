// Google Drive Integration
// Simplified version - works in demo mode without credentials

const GoogleDrive = {
    CLIENT_ID: '449386559636-rvq9i6h15h3p0vjj5j1nhkqv6bs498i6.apps.googleusercontent.com',
    SCOPES: 'https://www.googleapis.com/auth/drive', // Full Drive access to use existing folders
    MASTER_FOLDER_ID: '1aE8vaRZ3TQ5rVcuf4Kd11BMz6__GUv7K', // User defined master folder
    tokenClient: null,
    accessToken: null,
    isSignedIn: false,
    demoMode: true, // Enable demo mode by default

    init() {
        // Check if we have a valid client ID
        if (!this.CLIENT_ID || this.CLIENT_ID.includes('placeholder')) {
            console.log('Running in demo mode - Google Drive features simulated');
            this.demoMode = true;
            this.renderDemoButton();
            return;
        }

        // Real Google Drive initialization (when credentials are available)
        gapi.load('client', () => {
            gapi.client.init({
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            }).then(() => {
                console.log('Google Drive API initialized');
            });
        });

        google.accounts.id.initialize({
            client_id: this.CLIENT_ID,
            callback: this.handleCredentialResponse.bind(this)
        });

        google.accounts.id.renderButton(
            document.getElementById('googleSignInButton'),
            {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular'
            }
        );

        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: (response) => {
                if (response.error !== undefined) {
                    throw (response);
                }
                this.accessToken = response.access_token;
                this.isSignedIn = true;
                this.demoMode = false;
                this.updateUI();
            },
        });
    },

    renderDemoButton() {
        const buttonContainer = document.getElementById('googleSignInButton');
        if (buttonContainer) {
            buttonContainer.innerHTML = `
                <button class="btn-primary" onclick="GoogleDrive.enableDemoMode()" style="padding: 0.75rem 1.5rem;">
                    <i class="fab fa-google"></i> Use Demo Mode (No Google Account Needed)
                </button>
                <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                    Files will be stored locally. Add Google Client ID for real Drive integration.
                </p>
            `;
        }
    },

    enableDemoMode() {
        this.isSignedIn = true;
        this.demoMode = true;
        localStorage.setItem('googleUser', JSON.stringify({
            email: 'demo@innovtelier.com',
            name: 'Demo User',
            picture: ''
        }));
        this.updateUI();
        alert('Demo mode enabled! Files will be stored locally in your browser.');
    },

    handleCredentialResponse(response) {
        // Decode the JWT token to get user info
        const userInfo = this.parseJwt(response.credential);

        // Store user info
        localStorage.setItem('googleUser', JSON.stringify({
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
        }));

        // Update UI immediately to show we are logged in
        this.isSignedIn = true;
        this.demoMode = false;
        this.updateUI();

        // Request Drive API access (for uploading files)
        // This triggers the second permission popup
        this.tokenClient.requestAccessToken();
    },

    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    },

    updateUI() {
        const googleUser = JSON.parse(localStorage.getItem('googleUser') || '{}');

        if (this.isSignedIn && googleUser.email) {
            document.getElementById('googleSignInButton').style.display = 'none';
            document.getElementById('googleUserInfo').style.display = 'block';
            document.getElementById('googleUserEmail').textContent = googleUser.email;
        } else {
            document.getElementById('googleSignInButton').style.display = 'block';
            document.getElementById('googleUserInfo').style.display = 'none';
        }
    },

    signOut() {
        this.isSignedIn = false;
        this.accessToken = null;
        localStorage.removeItem('googleUser');
        google.accounts.id.disableAutoSelect();
        this.updateUI();
        alert('Disconnected from Google Drive');
    },

    async getOrCreateFolder(folderName) {
        if (!this.isSignedIn || !this.accessToken) return null;

        try {
            // 1. Search for existing folder
            const searchResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false&fields=files(id, name)`,
                {
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                }
            );
            const searchResult = await searchResponse.json();

            if (searchResult.files && searchResult.files.length > 0) {
                return searchResult.files[0].id;
            }

            // 2. Create folder if not found
            const metadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder'
            };

            const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            });

            const createResult = await createResponse.json();
            return createResult.id;

        } catch (error) {
            console.error('Error getting/creating folder:', error);
            return null;
        }
    },

    async uploadFile(file, category) {
        console.log('Starting uploadFile...', file.name);

        if (!this.isSignedIn) {
            alert('Please sign in to Google Drive first. If you are signed in, try refreshing the page.');
            return null;
        }

        // Demo mode - simulate upload with localStorage
        if (this.demoMode) {
            try {
                const fileData = {
                    id: 'demo_' + Date.now(),
                    name: file.name,
                    mimeType: file.type,
                    size: file.size,
                    webViewLink: '#',
                    thumbnailLink: '',
                    modifiedTime: new Date().toISOString()
                };

                // Store file metadata
                const demoFiles = JSON.parse(localStorage.getItem('demoFiles') || '[]');
                demoFiles.push(fileData);
                localStorage.setItem('demoFiles', JSON.stringify(demoFiles));

                return fileData;
            } catch (error) {
                console.error('Demo upload error:', error);
                alert('Failed to upload file in demo mode');
                return null;
            }
        }

        // Real Google Drive upload
        try {
            // Use the specific master folder provided by user
            const folderId = this.MASTER_FOLDER_ID;

            const metadata = {
                name: file.name,
                mimeType: file.type,
                description: `Category: ${category}`,
                parents: [folderId] // Always upload to the master folder
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink,size,mimeType&supportsAllDrives=true', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: form
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('Drive API Error:', response.status, errorBody);
                throw new Error(`API Error ${response.status}: ${errorBody}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error uploading to Drive:', error);
            // Alert specific error to help debugging
            const errorMessage = error.message || (error.result && error.result.error && error.result.error.message) || JSON.stringify(error);
            alert(`Failed to upload to Google Drive: ${errorMessage}`);
            return null;
        }
    },

    async shareFile(fileId, email) {
        if (!this.isSignedIn || !this.accessToken) {
            alert('Please sign in to Google Drive first');
            return false;
        }

        try {
            const permission = {
                type: 'user',
                role: 'reader',
                emailAddress: email
            };

            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(permission)
            });

            if (!response.ok) {
                throw new Error('Sharing failed');
            }

            return true;
        } catch (error) {
            console.error('Error sharing file:', error);
            alert('Failed to share file. Please try again.');
            return false;
        }
    },

    async getFile(fileId) {
        if (!this.isSignedIn || !this.accessToken) {
            return null;
        }

        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,thumbnailLink,size,mimeType,modifiedTime`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get file');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting file:', error);
            return null;
        }
    }
};

// Global function for sign out button
function signOutGoogle() {
    GoogleDrive.signOut();
}

// Initialize on page load
window.addEventListener('load', () => {
    GoogleDrive.init();
});
