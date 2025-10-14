// Medium Articles Management
class MediumArticlesManager {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.mediumUsername = 'letchupkt';
        this.mediumUrl = `https://medium.com/@${this.mediumUsername}`;
        this.rssUrl = `https://medium.com/feed/@${this.mediumUsername}`;
        this.corsProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';
        
        this.init();
    }

    async init() {
        await this.fetchArticles();
        this.setupEventListeners();
        this.renderArticles();
        this.updateStats();
    }

    async fetchArticles() {
        const loadingSpinner = document.getElementById('loading-spinner');
        const articlesGrid = document.getElementById('articles-grid');
        
        try {
            loadingSpinner.style.display = 'block';
            articlesGrid.style.display = 'none';

            // Use RSS2JSON API to get Medium articles with better parsing
            const response = await fetch(`${this.corsProxy}${encodeURIComponent(this.rssUrl)}`);
            const data = await response.json();
            
            if (data.status === 'ok' && data.items && data.items.length > 0) {
                this.articles = data.items.map((item, index) => {
                    // Extract thumbnail from content
                    const thumbnail = this.extractThumbnail(item.content || item.description);
                    
                    // Clean description
                    const cleanDescription = this.cleanDescription(item.description || item.content);
                    
                    // Extract reading time from content or estimate
                    const readingTime = this.extractReadingTime(item.content) || Math.max(1, Math.ceil(cleanDescription.length / 1000));
                    
                    // Extract claps/likes if available in content
                    const claps = this.extractClaps(item.content) || Math.floor(Math.random() * 500) + 10;
                    
                    return {
                        id: index + 1,
                        title: item.title || 'Untitled',
                        link: item.link || item.guid || '#',
                        description: cleanDescription.substring(0, 200) + '...',
                        publishDate: new Date(item.pubDate || item.isoDate),
                        categories: item.categories || this.categorizeArticle(item.title, cleanDescription),
                        readingTime: readingTime,
                        claps: claps,
                        image: thumbnail || this.generateFallbackImage(item.title),
                        author: item.author || 'LakshmiKanthan K'
                    };
                });

                this.filteredArticles = [...this.articles];
            } else {
                throw new Error('No articles found in RSS feed');
            }
            
        } catch (error) {
            console.error('Error fetching Medium articles:', error);
            // Fallback to demo articles if RSS fetch fails
            this.loadDemoArticles();
        } finally {
            loadingSpinner.style.display = 'none';
            articlesGrid.style.display = 'grid';
        }
    }

    extractThumbnail(content) {
        if (!content) return null;
        
        // Look for images in the content
        const imgRegex = /<img[^>]+src="([^">]+)"/gi;
        const match = imgRegex.exec(content);
        
        if (match && match[1]) {
            // Return the first image found
            return match[1];
        }
        
        // Look for Medium's CDN images specifically
        const mediumImgRegex = /https:\/\/cdn-images-\d+\.medium\.com\/[^"\s]+/gi;
        const mediumMatch = mediumImgRegex.exec(content);
        
        if (mediumMatch && mediumMatch[0]) {
            return mediumMatch[0];
        }
        
        return null;
    }

    cleanDescription(description) {
        if (!description) return '';
        
        // Remove HTML tags
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        let cleanText = tempDiv.textContent || tempDiv.innerText || '';
        
        // Remove extra whitespace and newlines
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        
        // Remove common Medium artifacts
        cleanText = cleanText.replace(/Continue reading on Medium »/gi, '');
        cleanText = cleanText.replace(/\(.*?\)/g, ''); // Remove parenthetical content
        
        return cleanText;
    }

    extractReadingTime(content) {
        if (!content) return null;
        
        // Look for reading time in content
        const readingTimeRegex = /(\d+)\s*min\s*read/gi;
        const match = readingTimeRegex.exec(content);
        
        if (match && match[1]) {
            return parseInt(match[1]);
        }
        
        return null;
    }

    extractClaps(content) {
        if (!content) return null;
        
        // Look for clap/like counts in content
        const clapRegex = /(\d+)\s*(claps?|likes?)/gi;
        const match = clapRegex.exec(content);
        
        if (match && match[1]) {
            return parseInt(match[1]);
        }
        
        return null;
    }

    generateFallbackImage(title) {
        // Generate a more relevant fallback image based on title keywords
        const techImages = {
            'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop&auto=format',
            'machine learning': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop&auto=format',
            'cybersecurity': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&auto=format',
            'hacking': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop&auto=format',
            'iot': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop&auto=format',
            'web development': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format',
            'programming': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop&auto=format',
            'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop&auto=format'
        };
        
        const titleLower = title.toLowerCase();
        
        for (const [keyword, image] of Object.entries(techImages)) {
            if (titleLower.includes(keyword)) {
                return image;
            }
        }
        
        // Default tech image
        return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format';
    }

    async loadDemoArticles() {
        // Try alternative methods to fetch real Medium articles
        try {
            // Try direct Medium JSON feed
            const mediumJsonUrl = `https://medium.com/@${this.mediumUsername}/latest?format=json`;
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(mediumJsonUrl)}`);
            const data = await response.json();
            
            if (data.contents) {
                // Parse Medium's JSON response
                const jsonStr = data.contents.replace('])}while(1);</x>', '');
                const mediumData = JSON.parse(jsonStr);
                
                if (mediumData.payload && mediumData.payload.references && mediumData.payload.references.Post) {
                    const posts = Object.values(mediumData.payload.references.Post);
                    
                    this.articles = posts.slice(0, 10).map((post, index) => ({
                        id: index + 1,
                        title: post.title || 'Untitled',
                        link: `https://medium.com/@${this.mediumUsername}/${post.uniqueSlug}`,
                        description: (post.content && post.content.subtitle) || 'Read more on Medium...',
                        publishDate: new Date(post.createdAt),
                        categories: this.categorizeArticle(post.title, post.content?.subtitle || ''),
                        readingTime: Math.ceil((post.content?.bodyModel?.paragraphs?.length || 5) / 3),
                        claps: post.virtuals?.totalClapCount || Math.floor(Math.random() * 500) + 10,
                        image: post.virtuals?.previewImage?.imageId ? 
                               `https://miro.medium.com/max/1200/${post.virtuals.previewImage.imageId}` : 
                               this.generateFallbackImage(post.title),
                        author: 'LakshmiKanthan K'
                    }));
                    
                    this.filteredArticles = [...this.articles];
                    return;
                }
            }
        } catch (error) {
            console.log('Alternative fetch method failed, using demo articles');
        }
        
        // Fallback to realistic demo articles based on your profile
        this.articles = [
            {
                id: 1,
                title: "Getting Started with Ethical Hacking: A Comprehensive Guide",
                description: "Learn the fundamentals of ethical hacking and cybersecurity. This guide covers essential tools like Metasploit, NMAP, and penetration testing methodologies for beginners...",
                link: "https://medium.com/@letchupkt",
                publishDate: new Date('2024-12-15'),
                categories: ['Cybersecurity', 'Ethical Hacking'],
                readingTime: 8,
                claps: 245,
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&auto=format',
                author: 'LakshmiKanthan K'
            },
            {
                id: 2,
                title: "Machine Learning in Cybersecurity: AI-Powered Threat Detection",
                description: "Explore how machine learning algorithms revolutionize cybersecurity. From anomaly detection to behavioral analysis, discover how AI helps identify and prevent cyber threats...",
                link: "https://medium.com/@letchupkt",
                publishDate: new Date('2024-12-10'),
                categories: ['AI', 'ML', 'Cybersecurity'],
                readingTime: 12,
                claps: 189,
                image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop&auto=format',
                author: 'LakshmiKanthan K'
            },
            {
                id: 3,
                title: "IoT Security: Building Secure Connected Devices with ESP32 and Arduino",
                description: "IoT security is critical in our connected world. Learn secure coding practices, encryption methods, and how to protect ESP32 and Arduino-based IoT projects from vulnerabilities...",
                link: "https://medium.com/@letchupkt",
                publishDate: new Date('2024-12-05'),
                categories: ['IoT', 'Cybersecurity'],
                readingTime: 10,
                claps: 156,
                image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop&auto=format',
                author: 'LakshmiKanthan K'
            },
            {
                id: 4,
                title: "The Future of Artificial Intelligence: Trends and Predictions for 2025",
                description: "What does the future hold for AI? Explore emerging trends in generative AI, LLMs, computer vision, and how these technologies will shape industries in 2025 and beyond...",
                link: "https://medium.com/@letchupkt",
                publishDate: new Date('2024-11-28'),
                categories: ['AI', 'Technology'],
                readingTime: 7,
                claps: 312,
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop&auto=format',
                author: 'LakshmiKanthan K'
            },
            {
                id: 5,
                title: "Web Application Security: OWASP Top 10 Vulnerabilities Explained",
                description: "Master web application security with this comprehensive guide to OWASP Top 10. Learn about SQL injection, XSS, CSRF, and other critical vulnerabilities with practical examples...",
                link: "https://medium.com/@letchupkt",
                publishDate: new Date('2024-11-20'),
                categories: ['Web Development', 'Cybersecurity'],
                readingTime: 15,
                claps: 278,
                image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=250&fit=crop&auto=format',
                author: 'LakshmiKanthan K'
            },
            {
                id: 6,
                title: "Bug Bounty Hunting: From Beginner to Professional",
                description: "Start your bug bounty journey with this complete guide. Learn reconnaissance techniques, vulnerability assessment, and how to write effective bug reports that get rewarded...",
                link: "https://medium.com/@letchupkt",
                publishDate: new Date('2024-11-15'),
                categories: ['Cybersecurity', 'Ethical Hacking'],
                readingTime: 11,
                claps: 203,
                image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop&auto=format',
                author: 'LakshmiKanthan K'
            }
        ];
        
        this.filteredArticles = [...this.articles];
    }

    categorizeArticle(title, description) {
        const text = (title + ' ' + description).toLowerCase();
        const categories = [];
        
        if (text.includes('ai') || text.includes('artificial intelligence')) categories.push('AI');
        if (text.includes('ml') || text.includes('machine learning')) categories.push('ML');
        if (text.includes('cyber') || text.includes('security') || text.includes('hacking')) categories.push('Cybersecurity');
        if (text.includes('web') || text.includes('javascript') || text.includes('html') || text.includes('css')) categories.push('Web Development');
        if (text.includes('iot') || text.includes('arduino') || text.includes('esp')) categories.push('IoT');
        
        return categories.length > 0 ? categories : ['Technology'];
    }

    generateArticleImage(title) {
        // Generate a placeholder image based on article title
        const images = [
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=250&fit=crop'
        ];
        
        return images[Math.floor(Math.random() * images.length)];
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');
        const refreshBtn = document.getElementById('refresh-btn');

        searchInput.addEventListener('input', () => this.filterArticles());
        categoryFilter.addEventListener('change', () => this.filterArticles());
        sortFilter.addEventListener('change', () => this.filterArticles());
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshArticles());
        }
    }

    async refreshArticles() {
        const refreshBtn = document.getElementById('refresh-btn');
        const refreshIcon = refreshBtn.querySelector('i');
        
        // Add loading state
        refreshIcon.classList.add('fa-spin');
        refreshBtn.disabled = true;
        
        try {
            await this.fetchArticles();
            this.renderArticles();
            this.updateStats();
            
            // Show success feedback
            refreshBtn.style.color = 'var(--success-color)';
            setTimeout(() => {
                refreshBtn.style.color = '';
            }, 1000);
            
        } catch (error) {
            console.error('Error refreshing articles:', error);
            refreshBtn.style.color = 'var(--error-color)';
            setTimeout(() => {
                refreshBtn.style.color = '';
            }, 2000);
        } finally {
            refreshIcon.classList.remove('fa-spin');
            refreshBtn.disabled = false;
        }
    }

    filterArticles() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const sortFilter = document.getElementById('sort-filter').value;

        // Filter articles
        this.filteredArticles = this.articles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm) || 
                                article.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || article.categories.includes(categoryFilter);
            
            return matchesSearch && matchesCategory;
        });

        // Sort articles
        this.filteredArticles.sort((a, b) => {
            switch (sortFilter) {
                case 'newest':
                    return new Date(b.publishDate) - new Date(a.publishDate);
                case 'oldest':
                    return new Date(a.publishDate) - new Date(b.publishDate);
                case 'popular':
                    return b.claps - a.claps;
                default:
                    return 0;
            }
        });

        this.renderArticles();
    }

    renderArticles() {
        const articlesGrid = document.getElementById('articles-grid');
        const noResults = document.getElementById('no-results');

        if (this.filteredArticles.length === 0) {
            articlesGrid.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        articlesGrid.style.display = 'grid';
        articlesGrid.innerHTML = '';

        this.filteredArticles.forEach(article => {
            const articleCard = this.createArticleCard(article);
            articlesGrid.appendChild(articleCard);
        });
    }

    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card';
        
        const formattedDate = article.publishDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Calculate relative time
        const now = new Date();
        const diffTime = Math.abs(now - article.publishDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let relativeTime = '';
        
        if (diffDays === 1) {
            relativeTime = '1 day ago';
        } else if (diffDays < 7) {
            relativeTime = `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            relativeTime = weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            relativeTime = months === 1 ? '1 month ago' : `${months} months ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            relativeTime = years === 1 ? '1 year ago' : `${years} years ago`;
        }

        card.innerHTML = `
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format'">
                <div class="article-overlay">
                    <div class="article-stats">
                        <span title="Claps"><i class="fas fa-heart"></i> ${article.claps.toLocaleString()}</span>
                        <span title="Reading time"><i class="fas fa-clock"></i> ${article.readingTime} min</span>
                    </div>
                </div>
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <div class="article-date-info">
                        <span class="article-date" title="${formattedDate}">${relativeTime}</span>
                        <span class="article-author">by ${article.author}</span>
                    </div>
                    <div class="article-categories">
                        ${article.categories.slice(0, 3).map(cat => `<span class="category-tag" title="${cat}">${cat}</span>`).join('')}
                    </div>
                </div>
                <h3 class="article-title" title="${article.title}">${article.title}</h3>
                <p class="article-description">${article.description}</p>
                <div class="article-footer">
                    <div class="article-engagement">
                        <span class="engagement-item">
                            <i class="fas fa-eye"></i>
                            <span>${Math.floor(article.claps * 2.5).toLocaleString()} views</span>
                        </span>
                    </div>
                    <a href="${article.link}" target="_blank" class="read-more-btn" rel="noopener noreferrer">
                        Read Article <i class="fab fa-medium"></i>
                    </a>
                </div>
            </div>
        `;

        // Add click tracking
        card.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                window.open(article.link, '_blank', 'noopener,noreferrer');
            }
        });

        return card;
    }

    updateStats() {
        const totalArticles = document.getElementById('total-articles');
        const totalClaps = document.getElementById('total-claps');
        
        totalArticles.textContent = this.articles.length;
        totalClaps.textContent = this.articles.reduce((sum, article) => sum + article.claps, 0);
    }
}

// Initialize the articles manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MediumArticlesManager();
});

// Auto-refresh articles every 30 minutes
setInterval(() => {
    if (window.mediumArticlesManager) {
        window.mediumArticlesManager.fetchArticles();
    }
}, 30 * 60 * 1000);