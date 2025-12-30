// Blog Admin V2 - Squarespace-Style CMS
// Enhanced admin panel with rich text editor and professional UI

const AdminV2 = {
    currentEditId: null,
    quillEditor: null,
    autoSaveInterval: null,

    // Google Drive API Configuration
    // Demo credentials - users can replace with their own for production
    googleDriveConfig: {
        apiKey: 'AIzaSyDemoKey123456789', // Demo - replace for production
        clientId: '1234567890-demo.apps.googleusercontent.com', // Demo - replace for production
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        pickerApiLoaded: false,
        gapiInited: false,
        gisInited: false,
        tokenClient: null
    },

    // Initialize admin panel
    init() {
        // Check if logged in
        if (!this.isLoggedIn()) {
            document.getElementById('login-view').style.display = 'flex';
            document.getElementById('admin-panel').style.display = 'none';
            return;
        }

        document.getElementById('login-view').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';

        // Initialize Quill editor
        this.initQuillEditor();

        // Load saved view or default to dashboard
        const lastView = localStorage.getItem('blogAdminLastView');
        this.showView(lastView || 'dashboard');

        // Set default date
        document.getElementById('post-date').value = new Date().toISOString().split('T')[0];
    },

    // Custom confirmation dialog (replaces native confirm)
    customConfirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-modal-title');
            const messageEl = document.getElementById('confirm-modal-message');
            const confirmBtn = document.getElementById('confirm-modal-confirm');
            const cancelBtn = document.getElementById('confirm-modal-cancel');

            // Set content
            titleEl.textContent = title;
            messageEl.textContent = message;

            // Show modal
            modal.classList.add('show');

            // Handle confirm
            const handleConfirm = () => {
                cleanup();
                resolve(true);
            };

            // Handle cancel
            const handleCancel = () => {
                cleanup();
                resolve(false);
            };

            // Cleanup function
            const cleanup = () => {
                modal.classList.remove('show');
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            // Add event listeners
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);

            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    handleCancel();
                }
            });
        });
    },

    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('blogAdminLoggedIn') === 'true';
    },

    // Handle login
    handleLogin(event) {
        event.preventDefault();
        const password = document.getElementById('admin-password').value;

        if (BlogData.checkPassword(password)) {
            localStorage.setItem('blogAdminLoggedIn', 'true');
            this.init();
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    },

    // Logout
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('blogAdminLoggedIn');
            window.location.reload();
        }
    },

    // Initialize Quill Rich Text Editor
    initQuillEditor() {
        const toolbarOptions = [
            [{ 'header': [2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ];

        // Configure modules
        const modules = {
            toolbar: toolbarOptions
        };

        // Add image resize module if available
        if (window.ImageResize) {
            modules.imageResize = {
                displaySize: true,
                modules: ['Resize', 'DisplaySize', 'Toolbar']
            };
        }

        this.quillEditor = new Quill('#post-content-editor', {
            theme: 'snow',
            modules: modules,
            placeholder: 'Write your blog post content here...'
        });

        // Auto-save on content change
        this.quillEditor.on('text-change', () => {
            this.scheduleAutoSave();
        });

        // Fallback: If ImageResize module didn't load, use custom implementation
        if (!window.ImageResize) {
            console.log('Using custom image resize implementation');
            this.enableCustomImageResizing();
        }
    },

    // Schedule auto-save
    scheduleAutoSave() {
        if (this.autoSaveInterval) {
            clearTimeout(this.autoSaveInterval);
        }

        this.autoSaveInterval = setTimeout(() => {
            this.autoSavePost();
        }, 3000); // Auto-save after 3 seconds of inactivity
    },

    // Auto-save post
    autoSavePost() {
        const title = document.getElementById('post-title').value.trim();
        if (!title) return; // Don't auto-save without title

        // Save to localStorage as draft
        const draftData = {
            title,
            excerpt: document.getElementById('post-excerpt').value.trim(),
            content: this.quillEditor.root.innerHTML,
            author: document.getElementById('post-author').value.trim(),
            category: document.getElementById('post-category').value,
            tags: document.getElementById('post-tags').value,
            image: document.getElementById('post-image').value.trim(),
            featured: document.getElementById('post-featured').checked,
            status: document.getElementById('post-status').value,
            date: document.getElementById('post-date').value
        };

        localStorage.setItem('blog_autosave', JSON.stringify(draftData));
        this.showToast('Auto-saved', 'info', 1000);
    },

    // Load auto-saved data
    loadAutoSave() {
        const saved = localStorage.getItem('blog_autosave');
        if (saved && confirm('Found auto-saved data. Would you like to restore it?')) {
            const data = JSON.parse(saved);
            document.getElementById('post-title').value = data.title || '';
            document.getElementById('post-excerpt').value = data.excerpt || '';
            this.quillEditor.root.innerHTML = data.content || '';
            document.getElementById('post-author').value = data.author || 'Innovtelier Team';
            document.getElementById('post-category').value = data.category || 'Legal Tech';
            document.getElementById('post-tags').value = data.tags || '';
            document.getElementById('post-image').value = data.image || '';
            document.getElementById('post-featured').checked = data.featured || false;
            document.getElementById('post-status').value = data.status || 'draft';
            document.getElementById('post-date').value = data.date || new Date().toISOString().split('T')[0];
        }
    },

    // Clear auto-save
    clearAutoSave() {
        localStorage.removeItem('blog_autosave');
    },

    // Show view
    showView(viewName) {
        // Save state
        localStorage.setItem('blogAdminLastView', viewName);

        // Hide all views
        document.querySelectorAll('.admin-view').forEach(view => {
            view.classList.add('hidden');
        });

        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Activate current nav item
        const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Show selected view
        const viewElement = document.getElementById(`view-${viewName}`);
        if (viewElement) {
            viewElement.classList.remove('hidden');
        }

        // Load view content
        switch (viewName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'posts':
                this.loadAllPosts();
                break;
            case 'new-post':
                // Only reset form if not editing (currentEditId is null)
                if (!this.currentEditId) {
                    this.resetPostForm();
                    this.loadAutoSave();
                }
                break;
            case 'media':
                this.loadMediaLibrary();
                break;
            case 'recycle-bin':
                this.loadRecycleBin();
                break;
        }
    },

    // Load dashboard
    loadDashboard() {
        const data = BlogData.getData();
        const recycleBin = BlogData.getRecycleBin();
        const storage = BlogData.getStorageUsage();

        // Update stats cards
        const totalPosts = document.getElementById('stat-total-posts');
        if (totalPosts) totalPosts.textContent = data.posts.length;

        const published = document.getElementById('stat-published');
        if (published) published.textContent = data.posts.filter(p => p.status === 'published' || p.published).length;

        const drafts = document.getElementById('stat-drafts');
        if (drafts) drafts.textContent = data.posts.filter(p => p.status === 'draft' || (!p.published && !p.status)).length;

        const categories = document.getElementById('stat-categories');
        if (categories) categories.textContent = data.categories.length;

        // Performance metrics
        const storageMb = document.getElementById('dashboard-storage-mb');
        if (storageMb) storageMb.textContent = storage.mb + ' MB';

        const storageBar = document.getElementById('dashboard-storage-bar');
        if (storageBar) storageBar.style.width = storage.percentage + '%';

        const storagePercent = document.getElementById('dashboard-storage-percent');
        if (storagePercent) storagePercent.textContent = storage.percentage + '% of ' + storage.limit + 'MB limit';

        const mediaCount = document.getElementById('dashboard-media-count');
        if (mediaCount) mediaCount.textContent = (data.images || []).length;

        // Calculate average post length
        const totalWords = data.posts.reduce((sum, post) => {
            const text = post.content.replace(/<[^>]*>/g, '');
            return sum + text.split(/\s+/).length;
        }, 0);
        const avgLength = data.posts.length > 0 ? Math.round(totalWords / data.posts.length) : 0;

        const avgLengthEl = document.getElementById('dashboard-avg-length');
        if (avgLengthEl) avgLengthEl.textContent = avgLength;

        // Recycle bin count
        const recycleBinTotal = (recycleBin.posts?.length || 0) + (recycleBin.media?.length || 0);
        const recycleCount = document.getElementById('dashboard-recycle-count');
        if (recycleCount) recycleCount.textContent = recycleBinTotal;

        // Render charts
        this.renderDashboardStatusBreakdown(data.posts);
        this.renderDashboardCategoryDistribution(data.posts);
        this.renderDashboardRecentPosts(data.posts);
    },

    renderDashboardStatusBreakdown(posts) {
        const container = document.getElementById('dashboard-status-chart');
        if (!container) return;

        const statusCounts = {
            'draft': 0,
            'for-review': 0,
            'for-publishing': 0,
            'published': 0,
            'on-hold': 0
        };

        posts.forEach(post => {
            const status = post.status || (post.published ? 'published' : 'draft');
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });

        const total = posts.length || 1;

        const html = Object.entries(statusCounts).map(([status, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const colors = {
                'draft': '#fbbf24',
                'for-review': '#60a5fa',
                'for-publishing': '#8b5cf6',
                'published': '#34d399',
                'on-hold': '#9ca3af'
            };

            return `
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="text-transform: capitalize;">${status.replace(/-/g, ' ')}</span>
                        <span style="font-weight: 600;">${count} (${percentage}%)</span>
                    </div>
                    <div style="height: 8px; background: var(--admin-border); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; background: ${colors[status]}; width: ${percentage}%; transition: width 0.3s;"></div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    },

    renderDashboardCategoryDistribution(posts) {
        const container = document.getElementById('dashboard-category-chart');
        if (!container) return;

        const categoryCounts = {};

        posts.forEach(post => {
            const category = post.category || 'Uncategorized';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        const total = posts.length || 1;

        const html = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => {
                const percentage = ((count / total) * 100).toFixed(1);
                return `
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>${category}</span>
                            <span style="font-weight: 600;">${count} (${percentage}%)</span>
                        </div>
                        <div style="height: 8px; background: var(--admin-border); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); width: ${percentage}%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('');

        container.innerHTML = html || '<p style="color: var(--admin-text-light);">No posts yet</p>';
    },

    renderDashboardRecentPosts(posts) {
        const container = document.getElementById('dashboard-recent-posts');
        if (!container) return;

        const recentPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        if (recentPosts.length === 0) {
            container.innerHTML = '<p style="color: var(--admin-text-light);">No posts yet</p>';
            return;
        }

        const html = recentPosts.map(post => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--admin-border);">
                <img src="${post.image}" alt="" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${post.title}</div>
                    <small style="color: var(--admin-text-light);">${new Date(post.date).toLocaleDateString()} • ${post.category}</small>
                </div>
                <div>
                    ${this.getStatusBadge(post.status || (post.published ? 'published' : 'draft'))}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    // Load all posts
    loadAllPosts() {
        const data = BlogData.getData();
        this.renderPostsTable('all-posts-table', data.posts);
    },

    // Get status badge HTML
    getStatusBadge(status) {
        const statusConfig = {
            'draft': { class: 'badge-warning', icon: 'fa-file-alt', text: 'Draft' },
            'for-review': { class: 'badge-info', icon: 'fa-eye', text: 'For Review' },
            'for-publishing': { class: 'badge-primary', icon: 'fa-calendar-check', text: 'For Publishing' },
            'published': { class: 'badge-success', icon: 'fa-check', text: 'Published' },
            'on-hold': { class: 'badge-secondary', icon: 'fa-pause', text: 'On Hold' }
        };

        const config = statusConfig[status] || statusConfig['draft'];
        return `<span class="badge ${config.class}"><i class="fas ${config.icon}"></i> ${config.text}</span>`;
    },

    // Render posts table
    renderPostsTable(tableId, posts) {
        const table = document.getElementById(tableId);

        if (posts.length === 0) {
            table.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>No posts yet</h3><p>Create your first blog post to get started!</p></div>';
            return;
        }

        const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        const tableHTML = `
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${sortedPosts.map(post => `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <img src="${post.image}" alt="" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
                                <div>
                                    <div style="font-weight: 600;">${post.title}</div>
                                    ${post.featured ? '<span class="badge badge-featured"><i class="fas fa-star"></i> Featured</span>' : ''}
                                </div>
                            </div>
                        </td>
                        <td>${post.category}</td>
                        <td>
                            ${this.getStatusBadge(post.status || (post.published ? 'published' : 'draft'))}
                        </td>
                        <td>${new Date(post.date).toLocaleDateString()}</td>
                        <td>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="AdminV2.editPost('${post.id}')" class="btn btn-sm btn-secondary" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="AdminV2.duplicatePost('${post.id}')" class="btn btn-sm btn-info" title="Duplicate">
                                    <i class="fas fa-copy"></i>
                                </button>
                                <button onclick="AdminV2.deletePost('${post.id}')" class="btn btn-sm btn-danger" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        table.innerHTML = tableHTML;
    },

    // Reset post form
    resetPostForm() {
        this.currentEditId = null;
        document.getElementById('post-editor-title').textContent = 'Add New Post';
        document.getElementById('post-title').value = '';
        document.getElementById('post-excerpt').value = '';
        this.quillEditor.setContents([]);
        document.getElementById('post-author').value = 'Innovtelier Team';
        document.getElementById('post-category').value = 'Legal Tech';
        document.getElementById('post-tags').value = '';
        document.getElementById('post-image').value = '';
        document.getElementById('post-featured').checked = false;
        document.getElementById('post-status').value = 'published';
        document.getElementById('post-date').value = new Date().toISOString().split('T')[0];

        // Hide image preview
        document.getElementById('image-preview-container').style.display = 'none';
    },

    // Edit post
    editPost(postId) {
        const id = Number(postId);
        const data = BlogData.getData();
        const post = data.posts.find(p => p.id === id);

        if (!post) return;

        this.currentEditId = id;
        this.showView('new-post');

        document.getElementById('post-editor-title').textContent = 'Edit Post';
        document.getElementById('post-title').value = post.title || '';
        document.getElementById('post-excerpt').value = BlogUI.stripHTML(post.excerpt || '');

        document.getElementById('post-excerpt').value = BlogUI.stripHTML(post.excerpt || '');

        // Fix for "wiped" content on local file system (file:// protocol)
        // Quill's clipboard module uses an iframe which gets blocked by browser security
        // on local files. Direct innerHTML assignment to the editor DOM node bypasses this.
        const existingContent = post.content || '';
        const editorElement = document.querySelector('#post-content-editor .ql-editor');

        if (editorElement) {
            editorElement.innerHTML = existingContent;
        } else if (existingContent) {
            // Fallback if DOM node not found (unlikely)
            try {
                this.quillEditor.root.innerHTML = existingContent;
            } catch (e) {
                console.error('Could not load content', e);
            }
        } else {
            if (editorElement) {
                editorElement.innerHTML = '<p><br></p>';
            } else {
                this.quillEditor.setText('');
            }
        }
        document.getElementById('post-author').value = post.author || '';
        document.getElementById('post-category').value = post.category || 'Legal Tech';
        document.getElementById('post-tags').value = (post.tags || []).join(', ');
        document.getElementById('post-image').value = post.image || '';
        document.getElementById('post-featured').checked = post.featured || false;

        // Use the status field if it exists, otherwise fall back to published boolean
        const status = post.status || (post.published ? 'published' : 'draft');
        document.getElementById('post-status').value = status;

        // Update the pipeline to reflect current status
        this.updateStatusPipeline(status);

        document.getElementById('post-date').value = post.date;

        // Load SEO fields
        if (post.seo) {
            document.getElementById('post-meta-title').value = post.seo.metaTitle || '';
            document.getElementById('post-meta-description').value = post.seo.metaDescription || '';
            document.getElementById('post-focus-keyword').value = post.seo.focusKeyword || '';
            document.getElementById('post-slug').value = post.seo.slug || '';

            // Update character counts
            this.updateCharacterCount('post-meta-title', 'meta-title-count');
            this.updateCharacterCount('post-meta-description', 'meta-description-count');
        }
    },

    // Delete post
    async deletePost(postId) {
        const confirmed = await this.customConfirm(
            'Are you sure you want to delete this post? It will be moved to the recycle bin.',
            'Delete Post'
        );

        if (!confirmed) {
            return;
        }

        BlogData.deletePost(Number(postId));
        this.showToast('Post moved to recycle bin', 'success');
        this.loadDashboard();
        this.loadAllPosts();
    },

    // Duplicate post
    duplicatePost(postId) {
        const post = BlogData.getPost(Number(postId));
        if (!post) {
            this.showToast('Post not found', 'error');
            return;
        }

        // Create a copy with modified title and draft status
        const duplicatedPost = {
            ...post,
            title: `Copy of ${post.title}`,
            status: 'draft',
            published: false,
            date: new Date().toISOString().split('T')[0]
        };

        // Remove the old ID from the object
        delete duplicatedPost.id;

        // Add the duplicated post
        const newPost = BlogData.addPost(duplicatedPost);

        this.showToast('Post duplicated successfully', 'success');
        this.loadDashboard();
        this.loadAllPosts();

        // Optionally, open the duplicated post for editing
        if (confirm('Post duplicated! Would you like to edit it now?')) {
            this.editPost(newPost.id);
        }
    },

    // Save post
    savePost() {
        const title = document.getElementById('post-title').value.trim();
        const excerpt = document.getElementById('post-excerpt').value.trim();
        const content = this.quillEditor.root.innerHTML;

        if (!title || !excerpt || !content || content === '<p><br></p>') {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const status = document.getElementById('post-status').value;

        // Generate slug from title if not provided
        let slug = document.getElementById('post-slug').value.trim();
        if (!slug) {
            slug = this.generateSlug(title);
        }

        const postData = {
            title,
            slug, // Pass explicit slug
            excerpt,
            content,
            author: document.getElementById('post-author').value.trim(),
            category: document.getElementById('post-category').value,
            tags: document.getElementById('post-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            image: document.getElementById('post-image').value.trim(),
            featured: document.getElementById('post-featured').checked,
            status: status,  // Save the actual status
            published: status === 'published',  // Keep for backwards compatibility
            date: document.getElementById('post-date').value,
            // SEO fields
            seo: {
                metaTitle: document.getElementById('post-meta-title').value.trim() || title,
                metaDescription: document.getElementById('post-meta-description').value.trim() || excerpt,
                focusKeyword: document.getElementById('post-focus-keyword').value.trim(),
                slug: slug
            }
        };

        if (this.currentEditId) {
            // Update existing post
            BlogData.updatePost(this.currentEditId, postData);
            this.showToast('Post updated successfully', 'success');
        } else {
            // Add new post
            BlogData.addPost(postData);
            this.showToast('Post created successfully', 'success');
        }

        this.clearAutoSave();
        this.showView('dashboard');
    },

    // Generate URL-friendly slug from title
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
    },

    // Preview post
    previewPost() {
        const title = document.getElementById('post-title').value.trim();
        const content = this.quillEditor.root.innerHTML;
        const image = document.getElementById('post-image').value.trim();

        if (!title || !content) {
            this.showToast('Please add title and content to preview', 'error');
            return;
        }

        const previewWindow = window.open('', 'Preview', 'width=900,height=700');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title} - Preview</title>
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700&family=Poppins:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Poppins', sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 3rem 2rem;
                        line-height: 1.8;
                        color: #1a1a1a;
                    }
                    h1 {
                        font-size: 3rem;
                        font-weight: 700;
                        margin-bottom: 2rem;
                        font-family: 'Manrope', sans-serif;
                        line-height: 1.2;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                        margin: 2rem 0;
                        border-radius: 12px;
                    }
                    p {
                        margin-bottom: 1.5rem;
                        font-size: 1.125rem;
                    }
                    h2 {
                        font-size: 2rem;
                        font-weight: 700;
                        margin: 2.5rem 0 1rem;
                        font-family: 'Manrope', sans-serif;
                    }
                    h3 {
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin: 2rem 0 1rem;
                        font-family: 'Manrope', sans-serif;
                    }
                    ul, ol {
                        margin: 1.5rem 0 1.5rem 2rem;
                    }
                    li {
                        margin-bottom: 0.75rem;
                    }
                    blockquote {
                        border-left: 4px solid #AFB38E;
                        padding-left: 1.5rem;
                        margin: 2rem 0;
                        font-style: italic;
                        color: #666;
                    }
                    code {
                        background: #f5f5f5;
                        padding: 0.2rem 0.5rem;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                    }
                    pre {
                        background: #f5f5f5;
                        padding: 1.5rem;
                        border-radius: 8px;
                        overflow-x: auto;
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                ${image ? `<img src="${image}" alt="${title}">` : ''}
                <div>${content}</div>
            </body>
            </html>
        `);
    },

    // Change password
    changePassword() {
        const newPassword = prompt('Enter new admin password (minimum 6 characters):');
        if (newPassword && newPassword.length >= 6) {
            BlogData.updatePassword(newPassword);
            this.showToast('Password updated successfully', 'success');
        } else if (newPassword) {
            this.showToast('Password must be at least 6 characters', 'error');
        }
    },

    // Export data
    exportData() {
        BlogData.exportData();
        this.showToast('Blog data exported successfully', 'success');
    },

    // Import data
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                if (BlogData.importData(event.target.result)) {
                    this.showToast('Blog data imported successfully', 'success');
                    this.loadDashboard();
                } else {
                    this.showToast('Error importing data. Please check the file format.', 'error');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    },

    // Show toast notification
    showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast');
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
        toast.className = `toast toast-${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    // Update featured image preview
    updateImagePreview() {
        const imageUrl = document.getElementById('post-image').value.trim();
        const previewContainer = document.getElementById('image-preview-container');
        const previewImg = document.getElementById('image-preview');

        if (imageUrl) {
            previewImg.src = imageUrl;
            previewImg.onerror = () => {
                previewContainer.style.display = 'none';
                this.showToast('Invalid image URL', 'error');
            };
            previewImg.onload = () => {
                previewContainer.style.display = 'block';
            };
        } else {
            previewContainer.style.display = 'none';
        }
    },

    // Switch between image tabs
    switchImageTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.image-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.image-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`image-tab-${tabName}`).style.display = 'block';

        // Load gallery if switching to gallery tab
        if (tabName === 'gallery') {
            this.loadImageGallery();
        }
    },

    // Handle image file upload
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select an image file', 'error');
            return;
        }



        // Check storage usage
        const storage = BlogData.getStorageUsage();
        if (parseFloat(storage.percentage) > 90) {
            this.showToast('Storage almost full! Consider deleting old images.', 'error');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;

            // Save to gallery
            const imageData = {
                url: imageUrl,
                name: file.name,
                size: file.size
            };

            BlogData.addImage(imageData);

            // Set as featured image
            this.setFeaturedImage(imageUrl);

            this.showToast('Image uploaded successfully', 'success');
        };

        reader.readAsDataURL(file);
    },

    // Load image gallery
    loadImageGallery() {
        const images = BlogData.getImages();
        const gallery = document.getElementById('image-gallery-grid');

        if (images.length === 0) {
            gallery.innerHTML = `
                <div class="gallery-empty">
                    <i class="fas fa-images"></i>
                    <p>No images in gallery</p>
                    <small>Upload images to build your gallery</small>
                </div>
            `;
            return;
        }

        gallery.innerHTML = images.map(img => `
            <div class="gallery-image-item" data-image-id="${img.id}" onclick="AdminV2.selectGalleryImage('${this.escapeHtml(img.url)}', ${img.id})">
                <img src="${img.url}" alt="${this.escapeHtml(img.name)}">
                <button class="gallery-image-delete" onclick="event.stopPropagation(); AdminV2.deleteGalleryImage(${img.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    },

    // Select image from gallery
    selectGalleryImage(imageUrl, imageId) {
        // Remove previous selection
        document.querySelectorAll('.gallery-image-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to clicked image
        document.querySelector(`[data-image-id="${imageId}"]`).classList.add('selected');

        // Set as featured image
        this.setFeaturedImage(imageUrl);
    },

    // Delete image from gallery
    deleteGalleryImage(imageId) {
        if (!confirm('Delete this image from gallery?')) return;

        BlogData.deleteImage(imageId);
        this.loadImageGallery();
        this.showToast('Image deleted from gallery', 'success');
    },

    // Set image from URL
    setImageFromUrl() {
        const url = document.getElementById('post-image-url').value.trim();

        if (!url) {
            this.showToast('Please enter an image URL', 'error');
            return;
        }

        this.setFeaturedImage(url);
    },

    // Set featured image and show preview
    setFeaturedImage(imageUrl) {
        document.getElementById('post-image').value = imageUrl;

        const previewContainer = document.getElementById('image-preview-container');
        const previewImg = document.getElementById('image-preview');

        previewImg.src = imageUrl;
        previewImg.onerror = () => {
            previewContainer.style.display = 'none';
            this.showToast('Invalid image URL', 'error');
        };
        previewImg.onload = () => {
            previewContainer.style.display = 'block';
        };
    },

    // Clear selected image
    clearSelectedImage() {
        document.getElementById('post-image').value = '';
        document.getElementById('image-preview-container').style.display = 'none';

        // Clear gallery selection
        document.querySelectorAll('.gallery-image-item').forEach(item => {
            item.classList.remove('selected');
        });
    },

    // Status Management Functions
    handleStatusChange() {
        const status = document.getElementById('post-status').value;
        this.updateStatusPipeline(status);
        this.updateStatusTimestamp(status);
    },

    updateStatusPipeline(status) {
        // Update pipeline visual
        const steps = document.querySelectorAll('.pipeline-step');
        const connectors = document.querySelectorAll('.pipeline-connector');

        // Define status order
        const statusOrder = ['draft', 'for-review', 'for-publishing', 'published'];
        const currentIndex = statusOrder.indexOf(status);

        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < currentIndex) {
                step.classList.add('completed');
            } else if (index === currentIndex) {
                step.classList.add('active');
            }
        });

        connectors.forEach((connector, index) => {
            connector.classList.remove('active');
            if (index < currentIndex) {
                connector.classList.add('active');
            }
        });

        // Update status text
        const statusText = {
            'draft': 'Draft',
            'for-review': 'For Review',
            'for-publishing': 'For Publishing',
            'published': 'Published',
            'on-hold': 'On Hold'
        };

        document.getElementById('pipeline-status-text').textContent =
            `Current status: ${statusText[status] || status}`;
    },

    updateStatusTimestamp(status) {
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const statusText = {
            'draft': 'Draft',
            'for-review': 'For Review',
            'for-publishing': 'For Publishing',
            'published': 'Published',
            'on-hold': 'On Hold'
        };

        document.getElementById('status-timestamp').textContent =
            `Changed to ${statusText[status]} on ${timestamp}`;
    },

    // Save Functions
    saveDraft() {
        // Just save the post with current status
        this.savePost();
    },

    saveAndPublish() {
        document.getElementById('post-status').value = 'published';
        this.savePost();
    },

    // Category Modal Save
    saveCategoryChanges() {
        this.showToast('Categories saved successfully', 'success');
        this.closeCategoryModal();
    },

    // Settings Functions
    saveGeneralSettings() {
        const settings = {
            siteName: document.getElementById('setting-site-name').value,
            siteDescription: document.getElementById('setting-site-description').value,
            defaultAuthor: document.getElementById('setting-default-author').value
        };

        BlogData.saveSettings('general', settings);
        this.showToast('General settings saved', 'success');
    },

    savePublishingSettings() {
        const settings = {
            postsPerPage: document.getElementById('setting-posts-per-page').value,
            defaultStatus: document.getElementById('setting-default-status').value
        };

        BlogData.saveSettings('publishing', settings);
        this.showToast('Publishing settings saved', 'success');
    },

    saveSEOSettings() {
        const settings = {
            metaTitle: document.getElementById('setting-meta-title').value,
            metaDescription: document.getElementById('setting-meta-description').value
        };

        BlogData.saveSettings('seo', settings);
        this.showToast('SEO settings saved', 'success');
    },

    clearAllData() {
        if (!confirm('⚠️ WARNING: This will permanently delete ALL posts, categories, images, and settings. This action cannot be undone. Are you absolutely sure?')) {
            return;
        }

        if (!confirm('This is your last chance. Type "DELETE" in the next prompt to confirm.')) {
            return;
        }

        const confirmation = prompt('Type DELETE to confirm:');
        if (confirmation === 'DELETE') {
            localStorage.clear();
            this.showToast('All data cleared', 'success');
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            this.showToast('Deletion cancelled', 'info');
        }
    },

    // Auto-save status indicator
    showAutoSaveStatus(status) {
        const indicator = document.getElementById('auto-save-status');
        if (!indicator) return;

        if (status === 'saving') {
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        } else if (status === 'saved') {
            indicator.innerHTML = '<i class="fas fa-check"></i> Saved';
            setTimeout(() => {
                indicator.innerHTML = '';
            }, 2000);
        }
    },

    // Recycle Bin Functions
    loadRecycleBin() {
        const recycleBin = BlogData.getRecycleBin();
        this.renderRecyclePosts(recycleBin.posts);
        this.renderRecycleMedia(recycleBin.media);
    },

    switchRecycleBinTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.image-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.image-tab').classList.add('active');

        // Show/hide tab content
        document.getElementById('recycle-posts-tab').style.display = tab === 'posts' ? 'block' : 'none';
        document.getElementById('recycle-media-tab').style.display = tab === 'media' ? 'block' : 'none';
    },

    renderRecyclePosts(posts) {
        const container = document.getElementById('recycle-posts-list');

        if (posts.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>No deleted posts</h3><p>Deleted posts will appear here</p></div>';
            return;
        }

        const html = posts.map(post => `
            <div class="recycle-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--admin-border); border-radius: 8px; margin-bottom: 1rem;">
                <img src="${post.image}" alt="" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0;">${post.title}</h4>
                    <small style="color: var(--admin-text-light);">
                        Deleted on ${new Date(post.deletedAt).toLocaleString()}
                    </small>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="AdminV2.restorePost('${post.id}')" class="btn btn-sm btn-success" title="Restore">
                        <i class="fas fa-undo"></i> Restore
                    </button>
                    <button onclick="AdminV2.permanentlyDeletePost('${post.id}')" class="btn btn-sm btn-danger" title="Delete Forever">
                        <i class="fas fa-trash"></i> Delete Forever
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    renderRecycleMedia(media) {
        const container = document.getElementById('recycle-media-list');

        if (media.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>No deleted media</h3><p>Deleted media will appear here</p></div>';
            return;
        }

        const html = media.map(img => `
            <div class="recycle-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--admin-border); border-radius: 8px; margin-bottom: 1rem;">
                <img src="${img.url}" alt="" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0;">${img.name}</h4>
                    <small style="color: var(--admin-text-light);">
                        Deleted on ${new Date(img.deletedAt).toLocaleString()}
                    </small>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="AdminV2.restoreMedia('${img.id}')" class="btn btn-sm btn-success" title="Restore">
                        <i class="fas fa-undo"></i> Restore
                    </button>
                    <button onclick="AdminV2.permanentlyDeleteMedia('${img.id}')" class="btn btn-sm btn-danger" title="Delete Forever">
                        <i class="fas fa-trash"></i> Delete Forever
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    restorePost(id) {
        if (confirm('Restore this post?')) {
            BlogData.restorePost(Number(id));
            this.showToast('Post restored successfully', 'success');
            this.loadRecycleBin();
            this.loadDashboard();
            this.loadAllPosts();
        }
    },

    restoreMedia(id) {
        if (confirm('Restore this media file?')) {
            BlogData.restoreMedia(Number(id));
            this.showToast('Media restored successfully', 'success');
            this.loadRecycleBin();
            this.loadMediaLibrary();
        }
    },

    permanentlyDeletePost(id) {
        if (confirm('⚠️ WARNING: This will permanently delete this post. This action cannot be undone. Are you sure?')) {
            BlogData.permanentlyDeletePost(Number(id));
            this.showToast('Post permanently deleted', 'success');
            this.loadRecycleBin();
        }
    },

    permanentlyDeleteMedia(id) {
        if (confirm('⚠️ WARNING: This will permanently delete this media file. This action cannot be undone. Are you sure?')) {
            BlogData.permanentlyDeleteMedia(Number(id));
            this.showToast('Media permanently deleted', 'success');
            this.loadRecycleBin();
        }
    },

    async emptyRecycleBin() {
        const confirmed1 = await this.customConfirm(
            'This will permanently delete ALL items in the recycle bin. This action cannot be undone. Are you sure?',
            '⚠️ WARNING'
        );

        if (!confirmed1) {
            return;
        }

        const confirmed2 = await this.customConfirm(
            'This is your last chance. All deleted posts and media will be permanently removed. Continue?',
            'Final Confirmation'
        );

        if (!confirmed2) {
            return;
        }

        BlogData.emptyRecycleBin();
        this.showToast('Recycle bin emptied', 'success');
        this.loadRecycleBin();
    },


    // Update character count for input fields
    updateCharacterCount(inputId, countId) {
        const input = document.getElementById(inputId);
        const counter = document.getElementById(countId);
        if (input && counter) {
            counter.textContent = input.value.length;
        }
    },

    // Open category management modal
    manageCategoriesModal() {
        const modal = document.getElementById('category-modal');
        modal.classList.add('show');
        this.loadCategories();
    },

    // Close category management modal
    closeCategoryModal() {
        const modal = document.getElementById('category-modal');
        modal.classList.remove('show');
        document.getElementById('new-category-input').value = '';
    },

    // Load categories into modal
    loadCategories() {
        const data = BlogData.getData();
        const categories = data.categories || [];
        const categoryList = document.getElementById('category-list');

        if (categories.length === 0) {
            categoryList.innerHTML = '<li style="text-align: center; color: var(--admin-text-light); padding: 1rem;">No categories yet</li>';
            return;
        }

        categoryList.innerHTML = categories.map((category, index) => `
            <li class="category-item" draggable="true" data-category="${this.escapeHtml(category)}" data-index="${index}">
                <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                    <i class="fas fa-grip-vertical" style="cursor: grab; color: var(--admin-text-light);"></i>
                    <span class="category-name">${this.escapeHtml(category)}</span>
                </div>
                <div class="category-actions">
                    <button class="btn btn-sm btn-secondary edit-category-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-category-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');

        // Add event listeners after rendering
        this.attachCategoryEventListeners();
        this.enableCategoryDragSort();
    },

    // Escape HTML to prevent XSS and onclick issues
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Attach event listeners to category buttons
    attachCategoryEventListeners() {
        document.querySelectorAll('.edit-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryItem = e.target.closest('.category-item');
                const category = categoryItem.dataset.category;
                this.editCategory(category);
            });
        });

        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryItem = e.target.closest('.category-item');
                const category = categoryItem.dataset.category;
                this.deleteCategory(category);
            });
        });
    },

    // Enable drag-and-drop sorting for categories
    enableCategoryDragSort() {
        const categoryItems = document.querySelectorAll('.category-item');
        let draggedItem = null;

        categoryItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                if (draggedItem !== item) {
                    const rect = item.getBoundingClientRect();
                    const midpoint = rect.top + rect.height / 2;

                    if (e.clientY < midpoint) {
                        item.parentNode.insertBefore(draggedItem, item);
                    } else {
                        item.parentNode.insertBefore(draggedItem, item.nextSibling);
                    }
                }
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();

                // Get new order
                const items = Array.from(document.querySelectorAll('.category-item'));
                const newOrder = items.map(item => item.dataset.category);

                // Save new order
                const data = BlogData.getData();
                data.categories = newOrder;
                BlogData.saveData(data);

                // Update dropdown
                this.updateCategoryDropdown();
                this.showToast('Category order updated', 'success');
            });
        });
    },

    // Add new category
    addCategory() {
        const input = document.getElementById('new-category-input');
        const newCategory = input.value.trim();

        if (!newCategory) {
            this.showToast('Please enter a category name', 'error');
            return;
        }

        const data = BlogData.getData();
        if (!data.categories) {
            data.categories = [];
        }

        if (data.categories.includes(newCategory)) {
            this.showToast('Category already exists', 'error');
            return;
        }

        data.categories.push(newCategory);
        BlogData.saveData(data);

        // Update category dropdown
        this.updateCategoryDropdown();

        // Reload category list in modal
        this.loadCategories();

        // Clear input
        input.value = '';

        this.showToast('Category added successfully', 'success');
    },

    // Edit category
    editCategory(oldCategory) {
        const newCategory = prompt('Enter new category name:', oldCategory);
        if (!newCategory || newCategory === oldCategory) return;

        const data = BlogData.getData();
        const index = data.categories.indexOf(oldCategory);

        if (index !== -1) {
            data.categories[index] = newCategory;

            // Update all posts with this category
            data.posts.forEach(post => {
                if (post.category === oldCategory) {
                    post.category = newCategory;
                }
            });

            BlogData.saveData(data);
            this.updateCategoryDropdown();
            this.loadCategories();
            this.showToast('Category updated successfully', 'success');
        }
    },

    // Delete category
    deleteCategory(category) {
        if (!confirm(`Are you sure you want to delete "${category}"? Posts with this category will need to be recategorized.`)) {
            return;
        }

        const data = BlogData.getData();
        data.categories = data.categories.filter(c => c !== category);

        // Check if any posts use this category
        const postsWithCategory = data.posts.filter(p => p.category === category);
        if (postsWithCategory.length > 0) {
            const defaultCategory = data.categories[0] || 'Uncategorized';
            postsWithCategory.forEach(post => {
                post.category = defaultCategory;
            });
            this.showToast(`Category deleted. ${postsWithCategory.length} post(s) moved to "${defaultCategory}"`, 'info', 4000);
        } else {
            this.showToast('Category deleted successfully', 'success');
        }

        BlogData.saveData(data);
        this.updateCategoryDropdown();
        this.loadCategories();
    },

    // Update category dropdown
    updateCategoryDropdown() {
        const data = BlogData.getData();
        const select = document.getElementById('post-category');
        const currentValue = select.value;

        select.innerHTML = data.categories.map(category =>
            `<option value="${category}">${category}</option>`
        ).join('');

        // Restore previous selection if it still exists
        if (data.categories.includes(currentValue)) {
            select.value = currentValue;
        }
    },

    // Enable custom image resizing with visual handles
    enableCustomImageResizing() {
        let selectedImage = null;
        let resizeHandles = null;

        // Create resize handles
        const createResizeHandles = (img) => {
            // Remove any existing handles
            removeResizeHandles();

            // Create container for handles
            const container = document.createElement('div');
            container.className = 'image-resize-container';
            container.style.cssText = `
                position: absolute;
                border: 2px solid var(--gold-accent, #AFB38E);
                pointer-events: none;
                z-index: 100;
            `;

            // Create corner handles
            const positions = ['nw', 'ne', 'sw', 'se'];
            positions.forEach(pos => {
                const handle = document.createElement('div');
                handle.className = `resize-handle resize-handle-${pos}`;
                handle.style.cssText = `
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: var(--gold-accent, #AFB38E);
                    border: 2px solid white;
                    border-radius: 50%;
                    pointer-events: all;
                    cursor: ${pos.includes('n') ? (pos.includes('w') ? 'nw' : 'ne') : (pos.includes('w') ? 'sw' : 'se')}-resize;
                    ${pos.includes('n') ? 'top: -6px;' : 'bottom: -6px;'}
                    ${pos.includes('w') ? 'left: -6px;' : 'right: -6px;'}
                `;

                // Add resize functionality
                handle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startResize(e, img, pos);
                });

                container.appendChild(handle);
            });

            document.body.appendChild(container);
            resizeHandles = container;
            updateHandlePosition(img);

            return container;
        };

        // Update handle position
        const updateHandlePosition = (img) => {
            if (!resizeHandles || !img) return;

            const rect = img.getBoundingClientRect();
            resizeHandles.style.left = rect.left + window.scrollX + 'px';
            resizeHandles.style.top = rect.top + window.scrollY + 'px';
            resizeHandles.style.width = rect.width + 'px';
            resizeHandles.style.height = rect.height + 'px';
        };

        // Remove resize handles
        const removeResizeHandles = () => {
            if (resizeHandles) {
                resizeHandles.remove();
                resizeHandles = null;
            }
            if (selectedImage) {
                selectedImage.classList.remove('image-selected');
                selectedImage = null;
            }
        };

        // Start resize
        const startResize = (e, img, position) => {
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = img.offsetWidth;
            const startHeight = img.offsetHeight;
            const aspectRatio = startWidth / startHeight;

            const onMouseMove = (e) => {
                let newWidth, newHeight;

                if (position.includes('e')) {
                    newWidth = startWidth + (e.clientX - startX);
                } else {
                    newWidth = startWidth - (e.clientX - startX);
                }

                // Maintain aspect ratio
                newHeight = newWidth / aspectRatio;

                // Set minimum size
                if (newWidth < 50) newWidth = 50;
                if (newHeight < 50) newHeight = 50;

                // Set maximum size (editor width)
                const editorWidth = this.quillEditor.root.offsetWidth - 32; // padding
                if (newWidth > editorWidth) newWidth = editorWidth;

                img.style.width = newWidth + 'px';
                img.style.height = 'auto';
                updateHandlePosition(img);
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        // Add click handler to images
        const addImageClickHandler = () => {
            const images = this.quillEditor.root.querySelectorAll('img');
            images.forEach(img => {
                // Remove old listeners
                img.replaceWith(img.cloneNode(true));
            });

            // Re-query after cloning
            this.quillEditor.root.querySelectorAll('img').forEach(img => {
                img.style.cursor = 'pointer';

                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (selectedImage === img) {
                        // Deselect
                        removeResizeHandles();
                    } else {
                        // Select this image
                        selectedImage = img;
                        img.classList.add('image-selected');
                        createResizeHandles(img);
                    }
                });
            });
        };

        // Listen for new images
        this.quillEditor.on('text-change', () => {
            setTimeout(() => {
                addImageClickHandler();
                if (selectedImage && resizeHandles) {
                    updateHandlePosition(selectedImage);
                }
            }, 100);
        });

        // Click outside to deselect
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ql-editor') && !e.target.closest('.image-resize-container')) {
                removeResizeHandles();
            }
        });

        // Scroll handler to update position
        window.addEventListener('scroll', () => {
            if (selectedImage) {
                updateHandlePosition(selectedImage);
            }
        });

        // Initial setup
        addImageClickHandler();
    },

    // Media Library Functions

    // Load media library
    loadMediaLibrary() {
        const images = BlogData.getImages();
        const grid = document.getElementById('media-library-grid');
        const emptyState = document.getElementById('media-empty-state');

        // Update storage info
        this.updateStorageInfo();

        if (images.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = images.map(img => `
            <div class="media-item" data-image-id="${img.id}">
                <img src="${img.url}" alt="${this.escapeHtml(img.name)}" class="media-item-image">
                <div class="media-item-info">
                    <div class="media-item-name" title="${this.escapeHtml(img.name)}">${this.escapeHtml(img.name)}</div>
                    <div class="media-item-meta">
                        <span>${this.formatFileSize(img.size)}</span>
                        <span>${this.formatDate(img.uploadDate)}</span>
                    </div>
                </div>
                <div class="media-item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="AdminV2.copyImageUrl('${this.escapeHtml(img.url)}')" title="Copy URL">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="AdminV2.deleteMediaImage(${img.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Update storage info
    updateStorageInfo() {
        const storage = BlogData.getStorageUsage();
        const images = BlogData.getImages();

        document.getElementById('storage-usage-text').textContent = `${storage.mb} MB / ${storage.limit} MB`;
        document.getElementById('storage-items-count').textContent = `${images.length} image${images.length !== 1 ? 's' : ''} uploaded`;

        const fill = document.getElementById('storage-bar-fill');
        fill.style.width = `${storage.percentage}%`;

        // Update color based on usage
        fill.className = 'storage-bar-fill';
        if (parseFloat(storage.percentage) > 90) {
            fill.classList.add('danger');
        } else if (parseFloat(storage.percentage) > 70) {
            fill.classList.add('warning');
        }
    },

    // Filter media
    filterMedia() {
        const searchTerm = document.getElementById('media-search').value.toLowerCase();
        const sortBy = document.getElementById('media-sort').value;

        let images = BlogData.getImages();

        // Filter by search
        if (searchTerm) {
            images = images.filter(img =>
                img.name.toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        switch (sortBy) {
            case 'oldest':
                images.reverse();
                break;
            case 'largest':
                images.sort((a, b) => b.size - a.size);
                break;
            case 'smallest':
                images.sort((a, b) => a.size - b.size);
                break;
            // 'newest' is default from BlogData.getImages()
        }

        // Re-render with filtered/sorted images
        const grid = document.getElementById('media-library-grid');
        grid.innerHTML = images.map(img => `
            <div class="media-item" data-image-id="${img.id}">
                <img src="${img.url}" alt="${this.escapeHtml(img.name)}" class="media-item-image">
                <div class="media-item-info">
                    <div class="media-item-name" title="${this.escapeHtml(img.name)}">${this.escapeHtml(img.name)}</div>
                    <div class="media-item-meta">
                        <span>${this.formatFileSize(img.size)}</span>
                        <span>${this.formatDate(img.uploadDate)}</span>
                    </div>
                </div>
                <div class="media-item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="AdminV2.copyImageUrl('${this.escapeHtml(img.url)}')" title="Copy URL">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="AdminV2.deleteMediaImage(${img.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Open media uploader
    openMediaUploader() {
        document.getElementById('image-file-input').click();
    },

    // Delete media image
    async deleteMediaImage(imageId) {
        const confirmed = await this.customConfirm(
            'Delete this image from media library? It will be moved to the recycle bin.',
            'Delete Image'
        );

        if (!confirmed) return;

        BlogData.deleteImage(imageId);
        this.loadMediaLibrary();
        this.showToast('Image moved to recycle bin', 'success');
    },

    // Copy image URL
    copyImageUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('URL copied to clipboard', 'success');
        }).catch(() => {
            this.showToast('Failed to copy URL', 'error');
        });
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString();
    },

    // Google Drive Functions

    // Initialize Google Drive APIs
    async initGoogleDrive() {
        try {
            // Initialize Google API client
            if (typeof gapi !== 'undefined') {
                gapi.load('client:picker', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: this.googleDriveConfig.apiKey,
                            discoveryDocs: this.googleDriveConfig.discoveryDocs,
                        });
                        this.googleDriveConfig.gapiInited = true;
                        this.googleDriveConfig.pickerApiLoaded = true;
                        console.log('Google Drive API initialized');
                    } catch (error) {
                        console.log('Google API init (using demo credentials):', error.message);
                        // Still mark as initialized to allow attempts
                        this.googleDriveConfig.gapiInited = true;
                        this.googleDriveConfig.pickerApiLoaded = true;
                    }
                });
            }

            // Initialize Google Identity Services with a small delay
            setTimeout(() => {
                if (typeof google !== 'undefined' && google.accounts) {
                    this.googleDriveConfig.tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: this.googleDriveConfig.clientId,
                        scope: this.googleDriveConfig.scope,
                        callback: '', // Will be set in openGoogleDrivePicker
                    });
                    this.googleDriveConfig.gisInited = true;
                    console.log('Google Identity Services initialized');
                }
            }, 1000);
        } catch (error) {
            console.log('Google Drive initialization:', error.message);
        }
    },

    // Open Google Drive Picker with automatic Sign in with Google
    openGoogleDrivePicker() {
        // Check if Google APIs are loaded, with retry
        if (!this.googleDriveConfig.gisInited || !this.googleDriveConfig.pickerApiLoaded) {
            // Try to initialize again
            if (!this.googleDriveConfig.gisInited && typeof google !== 'undefined' && google.accounts) {
                this.googleDriveConfig.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this.googleDriveConfig.clientId,
                    scope: this.googleDriveConfig.scope,
                    callback: '',
                });
                this.googleDriveConfig.gisInited = true;
            }

            // Check again
            if (!this.googleDriveConfig.gisInited || !this.googleDriveConfig.pickerApiLoaded) {
                this.showToast('Google Drive is still loading... Please wait a few seconds and try again.', 'info', 3000);
                return;
            }
        }

        // Show loading message
        this.showToast('Opening Google Drive - Sign in required...', 'info', 2000);

        // Set the callback for the token client
        this.googleDriveConfig.tokenClient.callback = async (response) => {
            if (response.error !== undefined) {
                this.showToast('Google sign-in cancelled or failed', 'error');
                return;
            }

            // We have the access token, now show the picker
            this.showDrivePicker(response.access_token);
        };

        // Check if we already have a token
        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent
            // This will show "Sign in with Google" dialog
            this.googleDriveConfig.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip display of account chooser and consent dialog for an existing session
            this.googleDriveConfig.tokenClient.requestAccessToken({ prompt: '' });
        }
    },

    // Show Google Drive Picker
    showDrivePicker(accessToken) {
        if (!this.googleDriveConfig.pickerApiLoaded) {
            this.showToast('Google Picker not ready', 'error');
            return;
        }

        try {
            const picker = new google.picker.PickerBuilder()
                .addView(google.picker.ViewId.DOCS_IMAGES)
                .addView(google.picker.ViewId.DOCS_IMAGES_AND_VIDEOS)
                .addView(new google.picker.DocsUploadView())
                .setOAuthToken(accessToken)
                .setDeveloperKey(this.googleDriveConfig.apiKey)
                .setCallback(this.pickerCallback.bind(this))
                .setTitle('Select an image from Google Drive')
                .build();

            picker.setVisible(true);
        } catch (error) {
            console.log('Picker error:', error);
            this.showToast('Could not open Google Drive. Using demo credentials - may not work.', 'error', 4000);
        }
    },

    // Handle picker selection
    async pickerCallback(data) {
        if (data.action === google.picker.Action.PICKED) {
            const file = data.docs[0];

            // Check if it's an image
            if (!file.mimeType || !file.mimeType.startsWith('image/')) {
                this.showToast('Please select an image file', 'error');
                return;
            }

            this.showToast('Loading image from Google Drive...', 'info');

            try {
                // Try to get the file using Drive API
                const response = await gapi.client.drive.files.get({
                    fileId: file.id,
                    fields: 'webContentLink,thumbnailLink',
                    supportsAllDrives: true
                });

                // Try to get a direct link to the image
                let imageUrl = null;

                // Option 1: Use thumbnail link (works for most images)
                if (response.result.thumbnailLink) {
                    // Get the largest thumbnail
                    imageUrl = response.result.thumbnailLink.replace(/=s\d+/, '=s2000');
                }

                // Option 2: Use webContentLink if available
                if (!imageUrl && response.result.webContentLink) {
                    imageUrl = response.result.webContentLink;
                }

                // Option 3: Construct a direct link
                if (!imageUrl) {
                    imageUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
                }

                if (imageUrl) {
                    this.setFeaturedImage(imageUrl);
                    this.showToast('Image selected from Google Drive!', 'success');
                } else {
                    this.showToast('Could not get image URL', 'error');
                }
            } catch (error) {
                console.log('Error getting file:', error);
                // Fallback: use the direct link
                const fallbackUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
                this.setFeaturedImage(fallbackUrl);
                this.showToast('Image selected from Google Drive!', 'success');
            }
        }
    },

    // Show Google Drive setup instructions
    showGoogleDriveSetupInstructions() {
        const instructions = `
🔧 Google Drive Integration

Currently using DEMO credentials for testing.

To use with your own Google account for production:

1. Go to Google Cloud Console (console.cloud.google.com)
2. Create a new project
3. Enable "Google Drive API" and "Google Picker API"
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized JavaScript origins:
   - http://localhost
   - file://
   - Your production domain
6. Copy Client ID and API Key
7. Replace in blog-admin-v2.js:
   - googleDriveConfig.clientId
   - googleDriveConfig.apiKey

📚 Full guide: developers.google.com/drive/picker/guides/overview

Note: Demo credentials may not work due to domain restrictions.
For full functionality, set up your own credentials.
        `;

        alert(instructions);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AdminV2.init();

    // Initialize Google Drive if API is loaded
    if (typeof gapi !== 'undefined') {
        AdminV2.initGoogleDrive();
    }

    // Add event listeners for SEO character counting
    const metaTitleInput = document.getElementById('post-meta-title');
    const metaDescInput = document.getElementById('post-meta-description');

    if (metaTitleInput) {
        metaTitleInput.addEventListener('input', () => {
            AdminV2.updateCharacterCount('post-meta-title', 'meta-title-count');
        });
    }

    if (metaDescInput) {
        metaDescInput.addEventListener('input', () => {
            AdminV2.updateCharacterCount('post-meta-description', 'meta-description-count');
        });
    }
});

// Expose AdminV2 to global scope
window.AdminV2 = AdminV2;
