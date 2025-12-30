// Blog Data Management System
// This file handles all blog data storage and retrieval using localStorage

const BlogData = {
    // Initialize blog data structure
    init() {
        if (!localStorage.getItem('innovtelierBlog')) {
            const initialData = {
                posts: [
                    {
                        id: 1,
                        title: "Welcome to the Innovtelier Blog",
                        slug: "welcome-to-innovtelier-blog",
                        author: "Innovtelier Team",
                        date: "2025-01-28",
                        category: "Company News",
                        tags: ["welcome", "announcement"],
                        excerpt: "We're excited to launch our new blog where we'll share insights on legal technology, nonprofit management, and organizational productivity.",
                        content: `<p>Welcome to the Innovtelier blog! We're thrilled to have you here.</p>
                        
                        <p>This blog is your go-to resource for:</p>
                        <ul>
                            <li>Legal technology tips and best practices</li>
                            <li>Nonprofit management strategies</li>
                            <li>Organizational productivity insights</li>
                            <li>Industry news and updates</li>
                            <li>Case studies and success stories</li>
                        </ul>
                        
                        <p>Our team of experts will be sharing valuable content to help you streamline your operations, leverage technology effectively, and achieve your organizational goals.</p>
                        
                        <p>Stay tuned for regular updates, and don't hesitate to reach out if you have topics you'd like us to cover!</p>`,
                        image: "hero-background.jpeg",
                        featured: true,
                        published: true
                    }
                ],
                categories: [
                    "Legal Tech",
                    "Nonprofit",
                    "Productivity",
                    "Company News",
                    "Tips & Tricks",
                    "Case Studies"
                ],
                images: [], // Store uploaded images
                settings: {
                    adminPassword: "admin123", // Change this in admin panel
                    postsPerPage: 9,
                    siteName: "Innovtelier Blog",
                    siteDescription: "Insights on legal technology, nonprofit management, and organizational productivity"
                }
            };
            localStorage.setItem('innovtelierBlog', JSON.stringify(initialData));
        }
    },

    // Get all blog data
    getData() {
        return JSON.parse(localStorage.getItem('innovtelierBlog'));
    },

    // Save blog data
    saveData(data) {
        localStorage.setItem('innovtelierBlog', JSON.stringify(data));
    },

    // Get all posts
    getPosts(filters = {}) {
        const data = this.getData();
        let posts = data.posts.filter(post => post.published);

        // Filter by category
        if (filters.category && filters.category !== 'all') {
            posts = posts.filter(post => post.category === filters.category);
        }

        // Filter by tag
        if (filters.tag) {
            posts = posts.filter(post => post.tags.includes(filters.tag));
        }

        // Search
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            posts = posts.filter(post =>
                post.title.toLowerCase().includes(searchTerm) ||
                post.excerpt.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        return posts;
    },

    // Get single post by slug
    getPostBySlug(slug) {
        const data = this.getData();
        return data.posts.find(post => post.slug === slug);
    },

    // Get featured posts
    getFeaturedPosts(limit = 1) {
        const data = this.getData();
        return data.posts
            .filter(post => post.featured && post.published)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },

    // Get related posts
    getRelatedPosts(currentPostId, category, limit = 3) {
        const data = this.getData();
        return data.posts
            .filter(post =>
                post.id !== currentPostId &&
                post.category === category &&
                post.published
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },

    // Get all categories
    getCategories() {
        const data = this.getData();
        return data.categories;
    },

    // Add new post
    addPost(post) {
        const data = this.getData();
        const newPost = {
            ...post,
            id: Date.now(),
            slug: post.slug || this.generateSlug(post.title),
            published: typeof post.published !== 'undefined' ? post.published : true
        };
        data.posts.push(newPost);
        this.saveData(data);
        return newPost;
    },

    // Update post
    updatePost(id, updatedPost) {
        const data = this.getData();
        const index = data.posts.findIndex(post => post.id === id);
        if (index !== -1) {
            data.posts[index] = {
                ...data.posts[index],
                ...updatedPost,
                slug: updatedPost.slug || this.generateSlug(updatedPost.title)
            };
            this.saveData(data);
            return data.posts[index];
        }
        return null;
    },

    // Delete post (move to recycle bin)
    deletePost(id) {
        const data = this.getData();
        const post = data.posts.find(p => p.id === id);

        if (post) {
            // Initialize recycle bin if it doesn't exist
            if (!data.recycleBin) {
                data.recycleBin = { posts: [], media: [] };
            }

            // Add deletion metadata
            post.deletedAt = new Date().toISOString();
            post.deletedType = 'post';

            // Move to recycle bin
            data.recycleBin.posts.push(post);

            // Remove from active posts
            data.posts = data.posts.filter(p => p.id !== id);

            this.saveData(data);
        }
    },

    // Permanently delete post from recycle bin
    permanentlyDeletePost(id) {
        const data = this.getData();
        if (data.recycleBin && data.recycleBin.posts) {
            data.recycleBin.posts = data.recycleBin.posts.filter(p => p.id !== id);
            this.saveData(data);
        }
    },

    // Restore post from recycle bin
    restorePost(id) {
        const data = this.getData();
        if (data.recycleBin && data.recycleBin.posts) {
            const post = data.recycleBin.posts.find(p => p.id === id);
            if (post) {
                // Remove deletion metadata
                delete post.deletedAt;
                delete post.deletedType;

                // Move back to active posts
                data.posts.push(post);
                data.recycleBin.posts = data.recycleBin.posts.filter(p => p.id !== id);

                this.saveData(data);
            }
        }
    },

    // Get single post by ID
    getPost(id) {
        const data = this.getData();
        return data.posts.find(post => post.id === id);
    },

    // Generate URL-friendly slug from title
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    },

    // Export blog data as JSON
    exportData() {
        const data = this.getData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `innovtelier-blog-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    },

    // Import blog data from JSON
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.saveData(data);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    // Check admin password
    checkPassword(password) {
        const data = this.getData();
        return data.settings.adminPassword === password;
    },

    // Update admin password
    updatePassword(newPassword) {
        const data = this.getData();
        data.settings.adminPassword = newPassword;
        this.saveData(data);
    },

    // Image Management Functions

    // Add image to gallery
    addImage(imageData) {
        const data = this.getData();
        if (!data.images) {
            data.images = [];
        }

        const newImage = {
            id: Date.now(),
            url: imageData.url,
            name: imageData.name,
            size: imageData.size || 0,
            uploadDate: new Date().toISOString()
        };

        data.images.push(newImage);
        this.saveData(data);
        return newImage;
    },

    // Get all images
    getImages() {
        const data = this.getData();
        return (data.images || []).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    },

    // Delete image (move to recycle bin)
    deleteImage(id) {
        const data = this.getData();
        const image = data.images?.find(img => img.id === id);

        if (image) {
            // Initialize recycle bin if it doesn't exist
            if (!data.recycleBin) {
                data.recycleBin = { posts: [], media: [] };
            }

            // Add deletion metadata
            image.deletedAt = new Date().toISOString();
            image.deletedType = 'media';

            // Move to recycle bin
            data.recycleBin.media.push(image);

            // Remove from active images
            data.images = data.images.filter(img => img.id !== id);

            this.saveData(data);
        }
    },

    // Permanently delete media from recycle bin
    permanentlyDeleteMedia(id) {
        const data = this.getData();
        if (data.recycleBin?.media) {
            data.recycleBin.media = data.recycleBin.media.filter(img => img.id !== id);
            this.saveData(data);
        }
    },

    // Restore media from recycle bin
    restoreMedia(id) {
        const data = this.getData();
        if (data.recycleBin?.media) {
            const image = data.recycleBin.media.find(img => img.id === id);
            if (image) {
                // Remove deletion metadata
                delete image.deletedAt;
                delete image.deletedType;

                // Move back to active images
                if (!data.images) data.images = [];
                data.images.push(image);
                data.recycleBin.media = data.recycleBin.media.filter(img => img.id !== id);

                this.saveData(data);
            }
        }
    },

    // Get recycle bin contents
    getRecycleBin() {
        const data = this.getData();
        if (!data.recycleBin) {
            data.recycleBin = { posts: [], media: [] };
            this.saveData(data);
        }
        return data.recycleBin;
    },

    // Empty recycle bin
    emptyRecycleBin() {
        const data = this.getData();
        data.recycleBin = { posts: [], media: [] };
        this.saveData(data);
    },

    // Get storage usage
    getStorageUsage() {
        const data = JSON.stringify(this.getData());
        const bytes = new Blob([data]).size;
        const mb = (bytes / (1024 * 1024)).toFixed(2);
        const limit = 5; // Approximate localStorage limit in MB
        const percentage = ((bytes / (limit * 1024 * 1024)) * 100).toFixed(1);

        return {
            bytes,
            mb,
            percentage,
            limit
        };
    },

    // Settings Management
    saveSettings(category, settings) {
        const data = this.getData();
        if (!data.settings) {
            data.settings = {};
        }
        data.settings[category] = settings;
        this.saveData(data);
    },

    getSettings(category) {
        const data = this.getData();
        return data.settings?.[category] || {};
    }
};

// Initialize blog data on page load
BlogData.init();
