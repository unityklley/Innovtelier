// Blog Admin Functions
// Handles all admin panel functionality for blog management

const BlogAdmin = {
    currentEditId: null,

    // Check if user is logged in
    isLoggedIn() {
        return sessionStorage.getItem('blogAdminLoggedIn') === 'true';
    },

    // Login
    login(password) {
        if (BlogData.checkPassword(password)) {
            sessionStorage.setItem('blogAdminLoggedIn', 'true');
            return true;
        }
        return false;
    },

    // Logout
    logout() {
        sessionStorage.removeItem('blogAdminLoggedIn');
        window.location.reload();
    },

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification notification-${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },

    // Render posts list in admin dashboard
    renderPostsList() {
        const container = document.getElementById('posts-list');
        if (!container) return;

        const data = BlogData.getData();
        const posts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (posts.length === 0) {
            container.innerHTML = '<p class="no-posts-admin">No posts yet. Create your first post!</p>';
            return;
        }

        const postsHTML = posts.map(post => `
            <div class="admin-post-item">
                <div class="admin-post-info">
                    <h3 class="admin-post-title">${post.title}</h3>
                    <div class="admin-post-meta">
                        <span class="admin-post-category">${post.category}</span>
                        <span class="admin-post-date">${new Date(post.date).toLocaleDateString()}</span>
                        <span class="admin-post-status ${post.published ? 'published' : 'draft'}">
                            ${post.published ? 'Published' : 'Draft'}
                        </span>
                        ${post.featured ? '<span class="admin-post-featured">⭐ Featured</span>' : ''}
                    </div>
                </div>
                <div class="admin-post-actions">
                    <button onclick="BlogAdmin.editPost(${post.id})" class="btn-edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="BlogAdmin.deletePost(${post.id})" class="btn-delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = postsHTML;
    },

    // Show add/edit form
    showForm(postId = null) {
        document.getElementById('dashboard-view').style.display = 'none';
        document.getElementById('form-view').style.display = 'block';

        const formTitle = document.getElementById('form-title');
        const form = document.getElementById('post-form');

        if (postId) {
            // Edit mode
            this.currentEditId = postId;
            formTitle.textContent = 'Edit Post';
            const post = BlogData.getPost(BlogData.getData().posts.find(p => p.id === postId).slug);

            document.getElementById('post-title-input').value = post.title;
            document.getElementById('post-author-input').value = post.author;
            document.getElementById('post-category-input').value = post.category;
            document.getElementById('post-tags-input').value = post.tags.join(', ');
            document.getElementById('post-excerpt-input').value = BlogUI.stripHTML(post.excerpt);
            document.getElementById('post-content-input').value = post.content;
            document.getElementById('post-image-input').value = post.image;
            document.getElementById('post-featured-input').checked = post.featured;
            document.getElementById('post-date-input').value = post.date;
        } else {
            // Add mode
            this.currentEditId = null;
            formTitle.textContent = 'Add New Post';
            form.reset();
            document.getElementById('post-date-input').value = new Date().toISOString().split('T')[0];
            document.getElementById('post-author-input').value = 'Innovtelier Team';
        }
    },

    // Hide form and show dashboard
    hideForm() {
        document.getElementById('form-view').style.display = 'none';
        document.getElementById('dashboard-view').style.display = 'block';
        this.currentEditId = null;
    },

    // Edit post
    editPost(postId) {
        this.showForm(postId);
    },

    // Delete post
    deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        BlogData.deletePost(postId);
        this.renderPostsList();
        this.showNotification('Post deleted successfully', 'success');
    },

    // Save post (add or update)
    savePost(event) {
        event.preventDefault();

        const postData = {
            title: document.getElementById('post-title-input').value.trim(),
            author: document.getElementById('post-author-input').value.trim(),
            category: document.getElementById('post-category-input').value,
            tags: document.getElementById('post-tags-input').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            excerpt: document.getElementById('post-excerpt-input').value.trim(),
            content: document.getElementById('post-content-input').value.trim(),
            image: document.getElementById('post-image-input').value.trim(),
            featured: document.getElementById('post-featured-input').checked,
            date: document.getElementById('post-date-input').value
        };

        // Validation
        if (!postData.title || !postData.content || !postData.excerpt) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (this.currentEditId) {
            // Update existing post
            BlogData.updatePost(this.currentEditId, postData);
            this.showNotification('Post updated successfully', 'success');
        } else {
            // Add new post
            BlogData.addPost(postData);
            this.showNotification('Post created successfully', 'success');
        }

        this.hideForm();
        this.renderPostsList();
    },

    // Preview post
    previewPost() {
        const title = document.getElementById('post-title-input').value.trim();
        const content = document.getElementById('post-content-input').value.trim();
        const image = document.getElementById('post-image-input').value.trim();

        if (!title || !content) {
            this.showNotification('Please add title and content to preview', 'error');
            return;
        }

        const previewWindow = window.open('', 'Preview', 'width=800,height=600');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title} - Preview</title>
                <style>
                    body {
                        font-family: 'Poppins', sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 2rem;
                        line-height: 1.8;
                    }
                    h1 {
                        font-size: 2.5rem;
                        margin-bottom: 1rem;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                        margin: 2rem 0;
                    }
                    p {
                        margin-bottom: 1.5rem;
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

    // Export blog data
    exportData() {
        BlogData.exportData();
        this.showNotification('Blog data exported successfully', 'success');
    },

    // Import blog data
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                if (BlogData.importData(event.target.result)) {
                    this.showNotification('Blog data imported successfully', 'success');
                    this.renderPostsList();
                } else {
                    this.showNotification('Error importing data. Please check the file format.', 'error');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    },

    // Change password
    changePassword() {
        const newPassword = prompt('Enter new admin password:');
        if (newPassword && newPassword.length >= 6) {
            BlogData.updatePassword(newPassword);
            this.showNotification('Password updated successfully', 'success');
        } else if (newPassword) {
            this.showNotification('Password must be at least 6 characters', 'error');
        }
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
        this.renderPostsList();
    }
};

// Handle login
function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('admin-password').value;

    if (BlogAdmin.login(password)) {
        BlogAdmin.init();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    BlogAdmin.init();
});
