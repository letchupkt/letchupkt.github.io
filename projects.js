// Projects Management
class ProjectsManager {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.technologies = new Set();
        
        this.init();
    }

    async init() {
        await this.fetchProjects();
        this.setupEventListeners();
        this.handleUrlParameters();
        this.renderProjects();
        this.updateStats();
    }

    handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        if (category) {
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                categoryFilter.value = category;
                this.filterProjects();
            }
        }
    }

    async fetchProjects() {
        const loadingSpinner = document.getElementById('loading-spinner');
        const projectsGrid = document.getElementById('projects-grid');
        
        try {
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            if (projectsGrid) projectsGrid.style.display = 'none';

            // Try to fetch from projects.json with cache busting
            const response = await fetch(`projects.json?v=${Date.now()}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (Array.isArray(data) && data.length > 0) {
                    this.projects = data.map((project, index) => ({
                        ...project,
                        id: index + 1,
                        createdDate: project.createdDate ? new Date(project.createdDate) : new Date(),
                        category: project.category || this.categorizeProject(project.name, project.description),
                        image: project.image || this.generateProjectImage(project.category || 'default'),
                        status: project.status || 'Completed'
                    }));
                    
                    // Extract all technologies
                    this.projects.forEach(project => {
                        if (project.technologies && Array.isArray(project.technologies)) {
                            project.technologies.forEach(tech => this.technologies.add(tech));
                        }
                    });
                    
                    this.filteredProjects = [...this.projects];
                    console.log(`Successfully loaded ${this.projects.length} projects from JSON`);
                } else {
                    throw new Error('Invalid or empty projects data');
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Error fetching projects from JSON:', error);
            console.warn('Falling back to demo projects');
            this.loadDemoProjects();
        } finally {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (projectsGrid) projectsGrid.style.display = 'grid';
        }
    }

    loadDemoProjects() {
        // Fallback with all real projects hardcoded if JSON fails to load
        console.warn('Using fallback hardcoded projects - projects.json failed to load');
        
        this.projects = [
            {
                id: 1,
                name: "Vaulto",
                description: "A zero-knowledge, secure password manager built with client-side encryption, biometric authentication, and PWA/browser extension support. Designed for enterprise-grade security with a consumer-friendly experience.",
                category: "Cybersecurity",
                technologies: ["React", "TypeScript", "PWA", "Cybersecurity", "Encryption"],
                githubLink: "https://github.com/letchupkt/vaulto",
                externalLink: "https://vaulto.vgrow.tech",
                image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-12-01'),
                status: "Completed",
                featured: true
            },
            {
                id: 2,
                name: "FlowPilotAI",
                description: "An AI-powered workflow automation platform that integrates with APIs, SaaS tools, and custom scripts to build intelligent, no-code workflows. Designed to boost productivity and streamline complex processes.",
                category: "AI/ML",
                technologies: ["React", "Node.js", "AI", "Automation", "API", "Machine Learning"],
                githubLink: "https://github.com/letchupkt/flowpilotai",
                externalLink: "https://flowpilotai.vercel.app",
                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-11-15'),
                status: "Completed",
                featured: true
            },
            {
                id: 3,
                name: "WebRaptor",
                description: "Automated bug bounty and recon tool that integrates Nmap, Nuclei, Amass, Subzy, and more. Features a shell-like interface and vulnerability detection system for full-scope scanning.",
                category: "Cybersecurity",
                technologies: ["Python", "Cybersecurity", "Automation", "CLI", "Nmap", "Nuclei"],
                githubLink: "https://github.com/letchupkt/webraptor",
                externalLink: "https://github.com/letchupkt/webraptor",
                image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-10-20'),
                status: "Completed",
                featured: true
            },
            {
                id: 4,
                name: "Site Security Inspector",
                description: "A real-time vulnerability and technology scanner for any website. Analyze security headers, detect CMS/frameworks, and track exposed endpoints with detailed insights.",
                category: "Cybersecurity",
                technologies: ["Python", "Web Security", "Recon", "CLI", "Flask"],
                githubLink: "https://github.com/letchupkt/site-security-inspector",
                externalLink: "https://ssi.vgrow.tech",
                image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-09-25'),
                status: "Completed",
                featured: false
            },
            {
                id: 5,
                name: "CyberRecon Arsenal",
                description: "Advanced open-source reconnaissance toolkit for ethical hackers, OSINT researchers, and cybersecurity analysts.",
                category: "Cybersecurity",
                technologies: ["JavaScript", "Vite", "React", "Cybersecurity", "OSINT"],
                githubLink: "https://github.com/letchupkt/cyberrecon-arsenal",
                externalLink: "https://cyberreconarsenal.vgrow.tech",
                image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-08-30'),
                status: "Completed",
                featured: false
            },
            {
                id: 6,
                name: "SRCE College Website",
                description: "Developed the official website for SRCE College, providing a central hub for information about academics, admissions, faculty, events, and college life.",
                category: "Web Development",
                technologies: ["React", "JavaScript", "HTML", "CSS", "Responsive Design"],
                githubLink: "https://github.com/letchupkt/SRCE-college-web",
                externalLink: "https://srcebyletchu.netlify.app",
                image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-07-15'),
                status: "Completed",
                featured: false
            },
            {
                id: 7,
                name: "RepoShield",
                description: "AI-powered GitHub Repository Security & Code Quality Scanner. RepoShield helps developers keep their repositories secure, clean, and production-ready with automated security analysis and code insights.",
                category: "AI/ML",
                technologies: ["Python", "AI", "Cybersecurity", "GitHub API", "Machine Learning"],
                githubLink: "https://github.com/letchupkt/reposhield",
                externalLink: "https://github.com/letchupkt/reposhield",
                image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-06-20'),
                status: "Completed",
                featured: false
            },
            {
                id: 8,
                name: "Legal Contract Analysis Bot",
                description: "An AI-powered web application that helps small business owners in India understand complex legal contracts through automated analysis, risk assessment, and plain-language explanations.",
                category: "AI/ML",
                technologies: ["Python", "Flask", "AI", "NLP", "LegalTech", "Machine Learning"],
                githubLink: "https://github.com/letchupkt/Legal-Contract-Analysis-Bot",
                externalLink: "https://github.com/letchupkt/Legal-Contract-Analysis-Bot",
                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-05-10'),
                status: "Completed",
                featured: false
            },
            {
                id: 9,
                name: "NetSuck WebFlasher",
                description: "A web based tool to upload My Firmware to ESP boards.",
                category: "IoT",
                technologies: ["HTML", "JavaScript", "React", "ESP32", "Web Development", "IoT"],
                githubLink: "https://github.com/letchupkt/netsuck-webflasher",
                externalLink: "https://netsuck.vgrow.tech",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-04-25'),
                status: "Completed",
                featured: false
            },
            {
                id: 10,
                name: "Sophish",
                description: "A social engineering tool for phishing attacks with payload generation and social engineering techniques.",
                category: "Cybersecurity",
                technologies: ["Python", "Social Engineering", "Networking", "Cybersecurity"],
                githubLink: "https://github.com/letchupkt/sophish",
                externalLink: "https://github.com/letchupkt/sophish",
                image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-03-15'),
                status: "Completed",
                featured: false
            },
            {
                id: 11,
                name: "CamHunt",
                description: "A tool to perform camera reconnaissance and find devices in a network.",
                category: "Cybersecurity",
                technologies: ["Python", "Networking", "Reconnaissance", "Cybersecurity"],
                githubLink: "https://github.com/letchupkt/Camhunt",
                externalLink: "https://github.com/letchupkt/Camhunt",
                image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-02-20'),
                status: "Completed",
                featured: false
            },
            {
                id: 12,
                name: "LETCHU SCRIPTOR",
                description: "Convert DuckyScript to Keyboard Scripts.",
                category: "Web Development",
                technologies: ["JavaScript", "Web Development", "HTML", "CSS"],
                githubLink: "https://github.com/letchupkt/letchuscriptor",
                externalLink: "https://letchuscriptor.netlify.app",
                image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2024-01-30'),
                status: "Completed",
                featured: false
            },
            {
                id: 13,
                name: "Wi-Fi Bruter",
                description: "A Python-based software to perform dictionary attack on Wi-Fi.",
                category: "Cybersecurity",
                technologies: ["Python", "Networking", "Security", "Cybersecurity"],
                githubLink: "https://github.com/letchupkt/wifi-bruter",
                externalLink: "https://github.com/letchupkt/wifi-bruter",
                image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2023-12-10'),
                status: "Completed",
                featured: false
            },
            {
                id: 14,
                name: "L3TCHU S3T-TOOL KIT",
                description: "A Web Based social engineering tool.",
                category: "Cybersecurity",
                technologies: ["Web Development", "JavaScript", "HTML", "CSS"],
                githubLink: "https://github.com/letchupkt/LETCHU-SET",
                externalLink: "https://github.com/letchupkt/LETCHU-SET",
                image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2023-11-15'),
                status: "Completed",
                featured: false
            },
            {
                id: 15,
                name: "IP Tracker",
                description: "IP tracking software built using Python.",
                category: "Cybersecurity",
                technologies: ["Python", "Networking", "CLI"],
                githubLink: "https://github.com/letchupkt/iptracker",
                externalLink: "https://github.com/letchupkt/iptracker",
                image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2023-10-20'),
                status: "Completed",
                featured: false
            },
            {
                id: 16,
                name: "Bg Remover",
                description: "A Web-Based background remover made using Python.",
                category: "AI/ML",
                technologies: ["Python", "Web Development", "AI", "Image Processing"],
                githubLink: "https://github.com/letchupkt/Bgremover-python",
                externalLink: "https://bgremoverbyletchu.netlify.app",
                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2023-09-25'),
                status: "Completed",
                featured: false
            },
            {
                id: 17,
                name: "Web Builder Website",
                description: "A website to build static websites.",
                category: "Web Development",
                technologies: ["HTML", "CSS", "JavaScript", "Web Development"],
                githubLink: "https://github.com/letchupkt/webbuilder",
                externalLink: "https://webbuilderbyletchu.netlify.app",
                image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2023-08-30'),
                status: "Completed",
                featured: false
            },
            {
                id: 18,
                name: "Link List",
                description: "A Web Based Link List site like link tree.",
                category: "Web Development",
                technologies: ["HTML", "CSS", "JavaScript", "Web Development"],
                githubLink: "https://github.com/letchupkt/linklist",
                externalLink: "https://linklistbyletchu.netlify.app",
                image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format",
                createdDate: new Date('2023-07-15'),
                status: "Completed",
                featured: false
            }
        ];
        
        // Extract technologies
        this.projects.forEach(project => {
            if (project.technologies && Array.isArray(project.technologies)) {
                project.technologies.forEach(tech => this.technologies.add(tech));
            }
        });
        
        this.filteredProjects = [...this.projects];
        console.log(`Loaded ${this.projects.length} fallback projects`);
    }

    categorizeProject(name, description) {
        const text = (name + ' ' + description).toLowerCase();
        
        if (text.includes('security') || text.includes('hack') || text.includes('vulnerability') || text.includes('penetration')) {
            return 'Cybersecurity';
        }
        if (text.includes('ai') || text.includes('ml') || text.includes('machine learning') || text.includes('neural')) {
            return 'AI/ML';
        }
        if (text.includes('iot') || text.includes('arduino') || text.includes('esp') || text.includes('hardware')) {
            return 'IoT';
        }
        if (text.includes('web') || text.includes('react') || text.includes('node') || text.includes('javascript')) {
            return 'Web Development';
        }
        
        return 'Other';
    }

    generateProjectImage(category) {
        const categoryImages = {
            'Cybersecurity': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&auto=format',
            'AI/ML': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop&auto=format',
            'IoT': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop&auto=format',
            'Web Development': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format',
            'default': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format'
        };
        
        return categoryImages[category] || categoryImages['default'];
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const techFilter = document.getElementById('tech-filter');
        const sortFilter = document.getElementById('sort-filter');
        const refreshBtn = document.getElementById('refresh-btn');

        searchInput.addEventListener('input', () => this.filterProjects());
        categoryFilter.addEventListener('change', () => this.filterProjects());
        techFilter.addEventListener('change', () => this.filterProjects());
        sortFilter.addEventListener('change', () => this.filterProjects());
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshProjects());
        }

        // Populate technology filter
        this.populateTechFilter();
    }

    populateTechFilter() {
        const techFilter = document.getElementById('tech-filter');
        const currentValue = techFilter.value;
        
        // Clear existing options except "All Technologies"
        while (techFilter.children.length > 1) {
            techFilter.removeChild(techFilter.lastChild);
        }
        
        // Add technology options
        Array.from(this.technologies).sort().forEach(tech => {
            const option = document.createElement('option');
            option.value = tech;
            option.textContent = tech;
            techFilter.appendChild(option);
        });
        
        techFilter.value = currentValue;
    }

    filterProjects() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const techFilter = document.getElementById('tech-filter').value;
        const sortFilter = document.getElementById('sort-filter').value;

        // Filter projects
        this.filteredProjects = this.projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm) || 
                                project.description.toLowerCase().includes(searchTerm) ||
                                project.technologies.some(tech => tech.toLowerCase().includes(searchTerm));
            const matchesCategory = !categoryFilter || project.category === categoryFilter;
            const matchesTech = !techFilter || project.technologies.includes(techFilter);
            
            return matchesSearch && matchesCategory && matchesTech;
        });

        // Sort projects
        this.filteredProjects.sort((a, b) => {
            switch (sortFilter) {
                case 'newest':
                    return new Date(b.createdDate) - new Date(a.createdDate);
                case 'oldest':
                    return new Date(a.createdDate) - new Date(b.createdDate);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });

        this.renderProjects();
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        const noResults = document.getElementById('no-results');

        if (this.filteredProjects.length === 0) {
            projectsGrid.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        projectsGrid.style.display = 'grid';
        projectsGrid.innerHTML = '';

        this.filteredProjects.forEach(project => {
            const projectCard = this.createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card enhanced';
        
        const statusClass = project.status === 'Completed' ? 'completed' : 'in-progress';
        
        card.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format'">
                <div class="project-overlay">
                    <div class="project-category">${project.category}</div>
                    <div class="project-status ${statusClass}">${project.status}</div>
                </div>
            </div>
            <div class="project-content">
                <div class="project-header">
                    <h3 class="project-title">${project.name}</h3>
                    <div class="project-links">
                        <a href="${project.githubLink}" target="_blank" title="View Code" rel="noopener noreferrer">
                            <i class="fab fa-github"></i>
                        </a>
                        <a href="${project.externalLink}" target="_blank" title="Live Demo" rel="noopener noreferrer">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-footer">
                    <span class="project-date">${project.createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                </div>
            </div>
        `;

        return card;
    }

    updateStats() {
        const totalProjects = document.getElementById('total-projects');
        const totalTechnologies = document.getElementById('total-technologies');
        
        if (totalProjects) totalProjects.textContent = this.projects.length;
        if (totalTechnologies) totalTechnologies.textContent = this.technologies.size;
    }

    async refreshProjects() {
        const refreshBtn = document.getElementById('refresh-btn');
        const refreshIcon = refreshBtn.querySelector('i');
        
        refreshIcon.classList.add('fa-spin');
        refreshBtn.disabled = true;
        
        try {
            await this.fetchProjects();
            this.renderProjects();
            this.updateStats();
            this.populateTechFilter();
            
            refreshBtn.style.color = 'var(--success-color)';
            setTimeout(() => {
                refreshBtn.style.color = '';
            }, 1000);
            
        } catch (error) {
            console.error('Error refreshing projects:', error);
            refreshBtn.style.color = 'var(--error-color)';
            setTimeout(() => {
                refreshBtn.style.color = '';
            }, 2000);
        } finally {
            refreshIcon.classList.remove('fa-spin');
            refreshBtn.disabled = false;
        }
    }
}

// Initialize the projects manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ProjectsManager();
});