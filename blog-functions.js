// Blog Frontend Functions
// Handles display and interaction for blog.html and blog-post.html

const BlogUI = {
    // Format date for display
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    // Truncate text to specified length
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // Strip HTML tags from content
    stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    },

    // Generate post card HTML
    generatePostCard(post) {
        const excerpt = this.stripHTML(post.excerpt);
        return `
            <article class="blog-card">
                <a href="blog-post.html?slug=${post.slug}" class="blog-card-link">
                    <div class="blog-card-image">
                        <img src="${post.image || 'hero-background.jpeg'}" alt="${post.title}" loading="lazy">
                    </div>
                    <div class="blog-card-content">
                        <div class="blog-card-meta">
                            <span class="blog-card-category">${post.category}</span>
                            <span class="blog-card-date">${this.formatDate(post.date)}</span>
                        </div>
                        <h3 class="blog-card-title">${post.title}</h3>
                        <p class="blog-card-excerpt">${this.truncateText(excerpt, 150)}</p>
                        <div class="blog-card-author">
                            <span>By ${post.author}</span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    },

    // Generate featured post HTML
    generateFeaturedPost(post) {
        const excerpt = this.stripHTML(post.excerpt);
        return `
            <div class="featured-post">
                <a href="blog-post.html?slug=${post.slug}" class="featured-post-link">
                    <div class="featured-post-image">
                        <img src="${post.image || 'hero-background.jpeg'}" alt="${post.title}">
                    </div>
                    <div class="featured-post-content">
                        <span class="featured-label">Featured Post</span>
                        <h2 class="featured-post-title">${post.title}</h2>
                        <p class="featured-post-excerpt">${this.truncateText(excerpt, 200)}</p>
                        <div class="featured-post-meta">
                            <span class="featured-post-author">By ${post.author}</span>
                            <span class="featured-post-date">${this.formatDate(post.date)}</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
    },

    // Render blog posts grid
    renderPosts(posts, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = '<p class="no-posts">No posts found.</p>';
            return;
        }

        const postsHTML = posts.map(post => this.generatePostCard(post)).join('');
        container.innerHTML = postsHTML;
    },

    // Render featured post
    renderFeaturedPost(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const featuredPosts = BlogData.getFeaturedPosts(1);
        if (featuredPosts.length > 0) {
            container.innerHTML = this.generateFeaturedPost(featuredPosts[0]);
        }
    },

    // Render categories filter
    renderCategories(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const categories = BlogData.getCategories();
        const categoriesHTML = `
            <button class="category-btn active" data-category="all">All Posts</button>
            ${categories.map(cat =>
            `<button class="category-btn" data-category="${cat}">${cat}</button>`
        ).join('')}
        `;
        container.innerHTML = categoriesHTML;

        // Add click event listeners
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Filter posts
                const category = e.target.dataset.category;
                const filters = category === 'all' ? {} : { category };
                const posts = BlogData.getPosts(filters);
                this.renderPosts(posts, 'blog-posts-grid');
            });
        });
    },

    // Setup search functionality
    setupSearch(searchInputId, resultsContainerId) {
        const searchInput = document.getElementById(searchInputId);
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            const filters = searchTerm ? { search: searchTerm } : {};
            const posts = BlogData.getPosts(filters);
            this.renderPosts(posts, resultsContainerId);
        });
    },

    // Load and display single blog post
    loadBlogPost() {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (!slug) {
            window.location.href = 'blog.html';
            return;
        }

        const post = BlogData.getPostBySlug(slug);
        if (!post) {
            document.getElementById('post-content').innerHTML = '<p>Post not found.</p>';
            return;
        }

        // Update page title
        document.title = `${post.title} - Innovtelier Blog`;

        // Render post
        document.getElementById('post-category').textContent = post.category;
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-date').textContent = this.formatDate(post.date);
        document.getElementById('post-author').textContent = `By ${post.author}`;
        document.getElementById('post-image').src = post.image || 'hero-background.jpeg';
        document.getElementById('post-image').alt = post.title;
        document.getElementById('post-content').innerHTML = post.content;

        // Render tags
        const tagsContainer = document.getElementById('post-tags');
        if (tagsContainer && post.tags.length > 0) {
            tagsContainer.innerHTML = post.tags.map(tag =>
                `<span class="post-tag">${tag}</span>`
            ).join('');
        }

        // Render sidebar related posts
        this.renderSidebarRelatedPosts(post.id, post.category);

        // Setup sidebar search
        this.setupSidebarSearch();

        // Setup newsletter form
        this.setupNewsletterForm();

        // Render related posts (bottom section - kept for backwards compatibility)
        this.renderRelatedPosts(post.id, post.category);

        // Setup social sharing
        this.setupSocialSharing(post);
    },

    // Render related posts
    renderRelatedPosts(postId, category) {
        const container = document.getElementById('related-posts');
        if (!container) return;

        const relatedPosts = BlogData.getRelatedPosts(postId, category, 3);
        if (relatedPosts.length === 0) {
            container.style.display = 'none';
            return;
        }

        const relatedHTML = relatedPosts.map(post => this.generatePostCard(post)).join('');
        container.querySelector('.related-posts-grid').innerHTML = relatedHTML;
    },

    // Render sidebar related posts (compact version)
    renderSidebarRelatedPosts(postId, category) {
        const container = document.getElementById('sidebar-related-posts');
        if (!container) return;

        const relatedPosts = BlogData.getRelatedPosts(postId, category, 4);
        if (relatedPosts.length === 0) {
            container.innerHTML = '<p style="color: var(--text-light); font-size: 0.875rem;">No related posts found.</p>';
            return;
        }

        const sidebarHTML = relatedPosts.map(post => `
            <a href="blog-post.html?slug=${post.slug}" class="sidebar-post-item">
                <img src="${post.image || 'hero-background.jpeg'}" alt="${post.title}" class="sidebar-post-image">
                <div class="sidebar-post-content">
                    <div class="sidebar-post-title">${post.title}</div>
                    <div class="sidebar-post-date">${this.formatDate(post.date)}</div>
                </div>
            </a>
        `).join('');

        container.innerHTML = sidebarHTML;
    },

    // Setup sidebar search
    setupSidebarSearch() {
        const searchInput = document.getElementById('sidebar-search-input');
        if (!searchInput) return;

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    window.location.href = `blog.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
    },

    // Setup newsletter subscription
    setupNewsletterForm() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('newsletter-email');
            const messageDiv = document.getElementById('newsletter-message');
            const email = emailInput.value.trim();

            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                messageDiv.className = 'newsletter-message error';
                messageDiv.textContent = 'Please enter a valid email address.';
                messageDiv.style.display = 'block';
                return;
            }

            // Check if already subscribed
            const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
            if (subscribers.includes(email)) {
                messageDiv.className = 'newsletter-message error';
                messageDiv.textContent = 'This email is already subscribed!';
                messageDiv.style.display = 'block';
                return;
            }

            // Add to subscribers (demo mode - using localStorage)
            subscribers.push(email);
            localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));

            // Show success message
            messageDiv.className = 'newsletter-message success';
            messageDiv.textContent = 'Successfully subscribed! Thank you.';
            messageDiv.style.display = 'block';

            // Clear form
            emailInput.value = '';

            // Hide message after 5 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        });
    },

    // Setup social sharing buttons
    setupSocialSharing(post) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(post.title);
        const excerpt = encodeURIComponent(this.stripHTML(post.excerpt));

        // Main share buttons
        document.getElementById('share-twitter')?.setAttribute('href',
            `https://twitter.com/intent/tweet?url=${url}&text=${title}`
        );
        document.getElementById('share-linkedin')?.setAttribute('href',
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        );
        document.getElementById('share-email')?.setAttribute('href',
            `mailto:?subject=${title}&body=${excerpt}%20${url}`
        );

        // Sidebar share buttons
        document.getElementById('sidebar-share-twitter')?.setAttribute('href',
            `https://twitter.com/intent/tweet?url=${url}&text=${title}`
        );
        document.getElementById('sidebar-share-linkedin')?.setAttribute('href',
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        );
        document.getElementById('sidebar-share-email')?.setAttribute('href',
            `mailto:?subject=${title}&body=${excerpt}%20${url}`
        );
    }
};

// Initialize blog page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on blog.html
    if (document.getElementById('blog-posts-grid')) {
        BlogUI.renderFeaturedPost('featured-post-container');
        BlogUI.renderCategories('categories-filter');
        BlogUI.renderPosts(BlogData.getPosts(), 'blog-posts-grid');
        BlogUI.setupSearch('blog-search', 'blog-posts-grid');
    }

    // Check if we're on blog-post.html
    if (document.getElementById('post-content')) {
        BlogUI.loadBlogPost();
    }
});
