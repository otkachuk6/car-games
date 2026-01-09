// ===== CAR GAMES MAIN APPLICATION =====
const CarGames = {
    // Configuration
    config: {
        siteName: 'Car Games',
        apiBase: '/data',
        adRefreshInterval: 30000, // 30 seconds
        gamesPerPage: 12,
        maxFavorites: 50,
        defaultTheme: 'dark',
        revenue: {
            cpm: 2.5, // Estimated CPM rate
            dailyVisitors: 10000,
            conversionRate: 0.02 // 2% conversion
        }
    },

    // State
    state: {
        user: {
            id: null,
            preferences: {},
            favorites: new Set(),
            playHistory: []
        },
        games: [],
        categories: [],
        filteredGames: [],
        currentPage: 1,
        searchQuery: '',
        activeFilter: 'all',
        theme: 'dark',
        revenue: {
            today: 0,
            monthly: 0,
            total: 0
        }
    },

    // Initialize application
    async init() {
        console.log('🚗 Car Games Initializing...');

        // Load user preferences
        this.loadUserPreferences();

        // Load game data
        await this.loadGames();
        await this.loadCategories();

        // Determine current page and initialize accordingly
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);

        if (path.includes('game.html')) {
            const gameId = parseInt(searchParams.get('id'));
            this.initGamePage(gameId);
        } else if (path.includes('category.html')) {
            const categoryId = searchParams.get('id');
            this.initCategoryPage(categoryId);
        } else {
            // Default to Home Page
            this.initUI();
        }

        // Common listeners
        this.initEventListeners();
        this.initRevenueTracking();

        // Show preloader briefly
        setTimeout(() => {
            this.hidePreloader();
        }, 500);

        console.log('✅ Car Games Ready!');
    },

    // ===== PAGE SPECIFIC INIT =====
    initGamePage(gameId) {
        if (!gameId) {
            window.location.href = '/';
            return;
        }

        const game = this.state.games.find(g => g.id === gameId);
        if (!game) {
            console.error('Game not found'); // Handle 404 gracefully in production
            return;
        }

        // Update Page Title
        document.title = `${game.title} - Play Free on Car Games`;

        // Update Metadata
        document.getElementById('game-title').textContent = game.title;
        document.getElementById('game-description').textContent = game.description;
        document.getElementById('game-category').textContent = game.category;
        document.getElementById('game-rating').textContent = game.rating.toFixed(1);
        document.getElementById('game-plays').textContent = this.formatNumber(game.plays);

        // Load Iframe
        const frameContainer = document.getElementById('game-frame-container');
        if (frameContainer) {
            frameContainer.innerHTML = `<iframe src="${game.embedUrl}" allowfullscreen frameborder="0" scrolling="no"></iframe>`;
        }

        // Load Related Games
        this.renderRelatedGames(game);
    },

    initCategoryPage(categoryId) {
        if (!categoryId) {
            window.location.href = '/';
            return;
        }

        // Capitalize first letter for display
        const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

        // Update Title
        const titleEl = document.getElementById('category-title');
        if (titleEl) titleEl.textContent = `${categoryName} Games`;
        document.title = `${categoryName} Games - Car Games`;

        // Filter and Render
        this.filterGames(categoryId); // This updates state.filteredGames

        // Render to category grid
        const container = document.getElementById('categoryGamesGrid');
        if (container) {
            container.innerHTML = this.state.filteredGames.map(game => this.createGameCard(game)).join('');
        }
    },

    renderRelatedGames(currentGame) {
        const container = document.getElementById('relatedGames');
        if (!container) return;

        // Filter games in same category, exclude current
        const related = this.state.games
            .filter(g => g.category === currentGame.category && g.id !== currentGame.id)
            .slice(0, 5); // Take top 5

        container.innerHTML = related.map(game => `
            <a href="/game.html?id=${game.id}" class="sidebar-game-card">
                <img src="${game.image}" alt="${game.title}" class="sidebar-game-img">
                <div class="sidebar-game-info">
                    <h4>${game.title}</h4>
                    <span>${this.formatNumber(game.plays)} plays</span>
                </div>
            </a>
        `).join('');
    },

    // ===== DATA MANAGEMENT =====
    async loadGames() {
        try {
            const response = await fetch('data/games.json');
            this.state.games = await response.json();
            this.state.filteredGames = [...this.state.games];
            this.updateGameCount();
        } catch (error) {
            console.error('Error loading games:', error);
            // Load fallback games
            this.loadFallbackGames();
        }
    },

    async loadCategories() {
        try {
            const response = await fetch('data/categories.json');
            this.state.categories = await response.json();
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            // Fallback for local execution without server
            this.loadFallbackCategories();
        }
    },

    loadFallbackCategories() {
        this.state.categories = [
            {
                "id": "racing",
                "name": "Racing",
                "icon": "fas fa-flag-checkered",
                "count": "150+"
            },
            {
                "id": "drifting",
                "name": "Drifting",
                "icon": "fas fa-tachometer-alt",
                "count": "85+"
            },
            {
                "id": "parking",
                "name": "Parking",
                "icon": "fas fa-parking",
                "count": "60+"
            },
            {
                "id": "monster-truck",
                "name": "Monster Truck",
                "icon": "fas fa-truck-monster",
                "count": "45+"
            },
            {
                "id": "offroad",
                "name": "Offroad",
                "icon": "fas fa-mountain",
                "count": "40+"
            },
            {
                "id": "simulation",
                "name": "Simulation",
                "icon": "fas fa-steering-wheel",
                "count": "70+"
            },
            {
                "id": "arcade",
                "name": "Arcade",
                "icon": "fas fa-gamepad",
                "count": "100+"
            },
            {
                "id": "multiplayer",
                "name": "Multiplayer",
                "icon": "fas fa-users",
                "count": "30+"
            }
        ];
        this.renderCategories();
    },

    loadFallbackGames() {
        console.warn('Using fallback game data (Local mode)');
        // Full game data for local functioning
        this.state.games = [
            {
                "id": 1,
                "title": "Extreme Drift Racing",
                "category": "Drifting",
                "description": "Master the art of drifting in this high-octane racing game. Customize your car and hit the tracks!",
                "rating": 4.8,
                "plays": 45200,
                "image": "https://images.unsplash.com/photo-1547754980-3df97fed72a8?w=500&h=300&fit=crop",
                "embedUrl": "https://www.addictinggames.com/embed/html5-games/23635",
                "featured": true
            },
            {
                "id": 2,
                "title": "City Car Stunt 4",
                "category": "Racing",
                "description": "Perform amazing stunts in the city! Race against time and gravity in this thrilling 3D game.",
                "rating": 4.6,
                "plays": 32100,
                "image": "https://images.unsplash.com/photo-1511994714008-b6d68a8b32a2?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/f8045a5713494ac88e025ec3c4314c62/",
                "featured": false
            },
            {
                "id": 3,
                "title": "Parking Fury 3D",
                "category": "Parking",
                "description": "Test your parking skills in complex 3D environments. Don't scratch the paint!",
                "rating": 4.5,
                "plays": 28900,
                "image": "https://images.unsplash.com/photo-1506469717960-433cebe3f07d?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/5d75752697a840e698822003c2317614/",
                "featured": false
            },
            {
                "id": 4,
                "title": "Monster Truck Destroyer",
                "category": "Monster Truck",
                "description": "Crush everything in your path with massive monster trucks. total destruction awaits!",
                "rating": 4.7,
                "plays": 56000,
                "image": "https://images.unsplash.com/photo-1621360841013-c768371e93cf?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/835427d2d3cb41b1836a9924de137684/",
                "featured": true
            },
            {
                "id": 5,
                "title": "Highway Racer 3D",
                "category": "Racing",
                "description": "Speed down the highway, dodging traffic and escaping the police.",
                "rating": 4.4,
                "plays": 89000,
                "image": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/9796010536414705ba86343588961726/",
                "featured": false
            },
            {
                "id": 6,
                "title": "Drift Hunters",
                "category": "Drifting",
                "description": "The ultimate free-to-play drifting simulator. Tune your car and drift for points.",
                "rating": 4.9,
                "plays": 150000,
                "image": "https://images.unsplash.com/photo-1626245353841-3af1bd0e4caf?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/6241a7d65691452994c979d375357288/",
                "featured": true
            },
            {
                "id": 7,
                "title": "Madalin Stunt Cars 2",
                "category": "Racing",
                "description": "Perform insane stunts with over 30 cars in an open world environment.",
                "rating": 4.8,
                "plays": 200000,
                "image": "https://images.unsplash.com/photo-1580273916550-e323be2ebeed?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/c3a726615b3941af9055819777174691/",
                "featured": true
            },
            {
                "id": 8,
                "title": "Bus Parking 3D",
                "category": "Parking",
                "description": "Driving a bus is hard, but parking it is even harder. Can you master the challenge?",
                "rating": 4.2,
                "plays": 18500,
                "image": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/39a667362d2948c2b7371c26b4737233/",
                "featured": false
            },
            {
                "id": 9,
                "title": "Offroad 4x4 Jeep",
                "category": "Offroad",
                "description": "Take your jeep offroad and conquer difficult terrain in this simulator.",
                "rating": 4.5,
                "plays": 41000,
                "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/4e92a10d8697479c948404543594806a/",
                "featured": false
            },
            {
                "id": 10,
                "title": "Formula Racer 2024",
                "category": "Racing",
                "description": "Experience the thrill of Formula racing. Top speeds and tight corners!",
                "rating": 4.6,
                "plays": 67000,
                "image": "https://images.unsplash.com/photo-1532906611030-9b63484f3ccb?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/15286595505c48b789182390f772592d/",
                "featured": false
            },
            {
                "id": 11,
                "title": "Neon Rider",
                "category": "Arcade",
                "description": "A retro-futuristic arcade racer with neon visuals and synthwave soundtrack.",
                "rating": 4.3,
                "plays": 22000,
                "image": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/59383842145b46d7a46f906411514751/",
                "featured": false
            },
            {
                "id": 12,
                "title": "Taxi Driver Simulator",
                "category": "Simulation",
                "description": "Pick up passengers and drop them off at their destination. Hurry up!",
                "rating": 4.4,
                "plays": 35000,
                "image": "https://images.unsplash.com/photo-1512413996525-4cd95ffc0600?w=500&h=300&fit=crop",
                "embedUrl": "https://html5.gamedistribution.com/c64703a15264421b9247657930113f0a/",
                "featured": false
            }
        ];
        this.state.filteredGames = [...this.state.games];
        this.updateGameCount();
    },

    // ===== UI RENDERING =====
    initUI() {
        // Render initial game grid
        this.renderGames();

        // Render categories
        this.renderCategories();

        // Set initial theme
        this.setTheme(this.state.theme);

        // Update stats
        this.updateStats();
    },

    renderGames() {
        const container = document.getElementById('newGamesGrid');
        if (!container) return;

        const start = (this.state.currentPage - 1) * this.config.gamesPerPage;
        const end = start + this.config.gamesPerPage;
        const gamesToShow = this.state.filteredGames.slice(start, end);

        container.innerHTML = gamesToShow.map(game => this.createGameCard(game)).join('');

        // Update load more button
        this.updateLoadMoreButton();
    },

    createGameCard(game) {
        const isFavorite = this.state.user.favorites.has(game.id);

        return `
            <div class="game-card" data-id="${game.id}" data-category="${game.category}">
                <div class="game-card-image-container">
                    <img src="${game.image}" alt="${game.title}" class="game-card-image" loading="lazy">
                    ${game.featured ? '<div class="featured-badge">FEATURED</div>' : ''}
                    <button class="btn-favorite ${isFavorite ? 'active' : ''}" 
                            data-id="${game.id}"
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="game-card-content">
                    <div class="game-card-header">
                        <div>
                            <h3 class="game-card-title">${game.title}</h3>
                            <span class="game-card-category">${game.category}</span>
                        </div>
                        <div class="game-card-rating">
                            ${this.generateStars(game.rating)}
                            <span>${game.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <p class="game-card-description">${game.description}</p>
                    <div class="game-card-stats">
                        <span class="game-card-plays">
                            <i class="fas fa-play-circle"></i> ${this.formatNumber(game.plays)} plays
                        </span>
                        <div class="game-card-actions">
                            <button class="btn-quick-view" data-id="${game.id}" title="Quick View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <a href="/game.html?id=${game.id}" class="btn-play-now">
                                <i class="fas fa-play"></i> Play Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }

        return stars;
    },

    renderCategories() {
        const quickCategories = document.getElementById('quickCategories');
        const categoriesMenu = document.getElementById('categoriesMenu');

        if (quickCategories) {
            quickCategories.innerHTML = this.state.categories.map(cat => `
                <div class="category-card" data-category="${cat.id}">
                    <div class="category-icon">
                        <i class="${cat.icon}"></i>
                    </div>
                    <div class="category-name">${cat.name}</div>
                    <div class="category-count">${cat.count || '50+'} games</div>
                </div>
            `).join('');
        }

        if (categoriesMenu) {
            categoriesMenu.innerHTML = this.state.categories.map(cat => `
                <a href="/category.html?id=${cat.id}" class="category-item">
                    <i class="${cat.icon}"></i>
                    <span>${cat.name}</span>
                    <span class="category-count">${cat.count || '50+'}</span>
                </a>
            `).join('');
        }
    },

    // ===== FILTERING & SEARCH =====
    filterGames(category) {
        this.state.activeFilter = category;
        this.state.currentPage = 1;

        if (category === 'all') {
            this.state.filteredGames = [...this.state.games];
        } else {
            this.state.filteredGames = this.state.games.filter(game =>
                game.category.toLowerCase() === category.toLowerCase()
            );
        }

        this.renderGames();
        this.updateActiveTab(category);
    },

    searchGames(query) {
        this.state.searchQuery = query.toLowerCase();

        if (!query.trim()) {
            this.state.filteredGames = [...this.state.games];
        } else {
            this.state.filteredGames = this.state.games.filter(game =>
                game.title.toLowerCase().includes(query) ||
                game.description.toLowerCase().includes(query) ||
                game.category.toLowerCase().includes(query)
            );
        }

        this.renderSearchResults();
        this.state.currentPage = 1;
        this.renderGames();
    },

    renderSearchResults() {
        const searchResults = document.querySelector('.search-results');
        if (!searchResults) return;

        if (!this.state.searchQuery.trim()) {
            searchResults.style.display = 'none';
            return;
        }

        const results = this.state.filteredGames.slice(0, 5);

        searchResults.innerHTML = results.map(game => `
            <a href="/game.html?id=${game.id}" class="search-result-item">
                <img src="${game.image}" alt="${game.title}">
                <div class="search-result-info">
                    <div class="search-result-title">${game.title}</div>
                    <div class="search-result-category">${game.category}</div>
                </div>
            </a>
        `).join('');

        searchResults.style.display = 'block';
    },

    // ===== USER INTERACTION =====
    initEventListeners() {
        // Search
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchGames(e.target.value);
            });
        }

        // Category filtering
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-card')) {
                const category = e.target.closest('.category-card').dataset.category;
                this.filterGames(category);
            }

            if (e.target.closest('.tab-btn')) {
                const filter = e.target.closest('.tab-btn').dataset.filter;
                this.filterGames(filter);
            }

            // Favorite toggle
            if (e.target.closest('.btn-favorite')) {
                const gameId = parseInt(e.target.closest('.btn-favorite').dataset.id);
                this.toggleFavorite(gameId);
            }

            // Quick view
            if (e.target.closest('.btn-quick-view')) {
                const gameId = parseInt(e.target.closest('.btn-quick-view').dataset.id);
                this.showQuickView(gameId);
            }
        });

        // Load more games
        const loadMoreBtn = document.getElementById('loadMoreGames');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreGames();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Random game
        const randomBtn = document.getElementById('playRandomBtn');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.playRandomGame();
            });
        }

        // Window events
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    },

    // ===== GAME MANAGEMENT =====
    loadMoreGames() {
        this.state.currentPage++;
        const start = (this.state.currentPage - 1) * this.config.gamesPerPage;
        const end = start + this.config.gamesPerPage;
        const gamesToShow = this.state.filteredGames.slice(start, end);

        const container = document.getElementById('newGamesGrid');
        container.innerHTML += gamesToShow.map(game => this.createGameCard(game)).join('');

        this.updateLoadMoreButton();
    },

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreGames');
        if (!loadMoreBtn) return;

        const remaining = this.state.filteredGames.length - (this.state.currentPage * this.config.gamesPerPage);

        if (remaining <= 0) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i> Load More (${remaining} games remaining)
            `;
            loadMoreBtn.style.display = 'block';
        }
    },

    playRandomGame() {
        if (this.state.games.length === 0) return;

        const randomIndex = Math.floor(Math.random() * this.state.games.length);
        const randomGame = this.state.games[randomIndex];

        // Track this action
        this.trackUserAction('play_random', { gameId: randomGame.id });

        // Redirect to game page
        window.location.href = `/game.html?id=${randomGame.id}`;
    },

    showQuickView(gameId) {
        const game = this.state.games.find(g => g.id === gameId);
        if (!game) return;

        const modal = document.getElementById('gameQuickView');
        const content = document.querySelector('.quick-view-content');

        content.innerHTML = `
            <div class="quick-view-game">
                <img src="${game.image}" alt="${game.title}" class="quick-view-image">
                <div class="quick-view-info">
                    <h3>${game.title}</h3>
                    <div class="quick-view-meta">
                        <span class="category">${game.category}</span>
                        <span class="rating">${this.generateStars(game.rating)} ${game.rating.toFixed(1)}</span>
                        <span class="plays">${this.formatNumber(game.plays)} plays</span>
                    </div>
                    <p class="quick-view-description">${game.description}</p>
                    <div class="quick-view-actions">
                        <a href="/game.html?id=${game.id}" class="btn-primary">
                            <i class="fas fa-play"></i> Play Now
                        </a>
                        <button class="btn-secondary btn-favorite ${this.state.user.favorites.has(game.id) ? 'active' : ''}" 
                                data-id="${game.id}">
                            <i class="fas fa-heart"></i> Favorite
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');

        // Close modal when clicking outside or on close button
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.classList.remove('active');
            }
        });
    },

    // ===== USER PREFERENCES =====
    loadUserPreferences() {
        try {
            const preferences = localStorage.getItem('carGamesPreferences');
            if (preferences) {
                const parsed = JSON.parse(preferences);
                this.state.user = { ...this.state.user, ...parsed };
                this.state.user.favorites = new Set(parsed.favorites || []);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    },

    saveUserPreferences() {
        try {
            const preferences = {
                ...this.state.user,
                favorites: Array.from(this.state.user.favorites)
            };
            localStorage.setItem('carGamesPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    },

    toggleFavorite(gameId) {
        if (this.state.user.favorites.has(gameId)) {
            this.state.user.favorites.delete(gameId);
        } else {
            if (this.state.user.favorites.size >= this.config.maxFavorites) {
                this.showNotification('Maximum favorites reached!', 'warning');
                return;
            }
            this.state.user.favorites.add(gameId);
        }

        // Update UI
        const favoriteBtns = document.querySelectorAll(`.btn-favorite[data-id="${gameId}"]`);
        favoriteBtns.forEach(btn => {
            btn.classList.toggle('active');
            btn.title = btn.classList.contains('active')
                ? 'Remove from favorites'
                : 'Add to favorites';
        });

        // Update badge
        this.updateFavoritesBadge();

        // Save preferences
        this.saveUserPreferences();

        // Track this action
        this.trackUserAction('toggle_favorite', {
            gameId,
            isFavorite: this.state.user.favorites.has(gameId)
        });
    },

    updateFavoritesBadge() {
        const badge = document.querySelector('#favoritesBtn .badge');
        if (badge) {
            badge.textContent = this.state.user.favorites.size;
            badge.style.display = this.state.user.favorites.size > 0 ? 'flex' : 'none';
        }
    },

    // ===== THEME MANAGEMENT =====
    setTheme(theme) {
        this.state.theme = theme;
        document.documentElement.className = theme + '-theme';
        localStorage.setItem('carGamesTheme', theme);
    },

    toggleTheme() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);

        // Update toggle button icon
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = newTheme === 'dark'
                ? '<i class="fas fa-moon"></i>'
                : '<i class="fas fa-sun"></i>';
        }
    },

    // ===== REVENUE OPTIMIZATION =====
    initRevenueTracking() {
        // Load revenue data from localStorage
        const savedRevenue = localStorage.getItem('carGamesRevenue');
        if (savedRevenue) {
            this.state.revenue = JSON.parse(savedRevenue);
        }

        // Update revenue display periodically
        setInterval(() => {
            this.updateRevenue();
        }, 60000); // Every minute
    },

    updateRevenue() {
        // Simulate revenue generation (in a real app, this would come from your ad network)
        const simulatedEarnings = Math.random() * 0.5; // $0.00 - $0.50 per update
        this.state.revenue.today += simulatedEarnings;
        this.state.revenue.total += simulatedEarnings;

        // Save to localStorage
        localStorage.setItem('carGamesRevenue', JSON.stringify(this.state.revenue));

        // Update display if admin panel is open
        this.updateRevenueDisplay();
    },

    updateRevenueDisplay() {
        const revenueElements = document.querySelectorAll('.revenue-display');
        revenueElements.forEach(el => {
            if (el.classList.contains('today')) {
                el.textContent = `$${this.state.revenue.today.toFixed(2)}`;
            } else if (el.classList.contains('total')) {
                el.textContent = `$${this.state.revenue.total.toFixed(2)}`;
            }
        });
    },

    calculateProjectedRevenue() {
        const daily = this.config.revenue.dailyVisitors * this.config.revenue.cpm / 1000;
        const monthly = daily * 30;
        const yearly = monthly * 12;

        return {
            daily: daily.toFixed(2),
            monthly: monthly.toFixed(2),
            yearly: yearly.toFixed(2)
        };
    },

    // ===== ANALYTICS & TRACKING =====
    trackUserAction(action, data = {}) {
        const eventData = {
            action,
            timestamp: new Date().toISOString(),
            userId: this.state.user.id || 'anonymous',
            ...data
        };

        // Send to analytics (in a real app, this would be to your analytics service)
        console.log('📊 User Action:', eventData);

        // Store locally for offline tracking
        this.storeAnalyticsEvent(eventData);
    },

    storeAnalyticsEvent(event) {
        // Get existing events
        const events = JSON.parse(localStorage.getItem('carGamesAnalytics') || '[]');

        // Add new event
        events.push(event);

        // Keep only last 1000 events
        if (events.length > 1000) {
            events.splice(0, events.length - 1000);
        }

        // Save back to localStorage
        localStorage.setItem('carGamesAnalytics', JSON.stringify(events));
    },

    // ===== UTILITIES =====
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    updateGameCount() {
        const countElement = document.getElementById('totalGames');
        if (countElement) {
            countElement.textContent = `${this.state.games.length}+`;
        }
    },

    updateStats() {
        const dailyPlayers = document.getElementById('dailyPlayers');
        if (dailyPlayers) {
            // Simulate growing player count
            const basePlayers = 10000000;
            const randomGrowth = Math.floor(Math.random() * 10000);
            dailyPlayers.textContent = `${this.formatNumber(basePlayers + randomGrowth)}+`;
        }
    },

    hidePreloader() {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
    },

    handleScroll() {
        // Show/hide back to top button
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const backToTopBtn = document.querySelector('.fab-option[title="Back to Top"]');

        if (backToTopBtn) {
            if (scrollTop > 500) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        }

        // Lazy load images
        this.lazyLoadImages();
    },

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');

        images.forEach(img => {
            if (img.getBoundingClientRect().top < window.innerHeight + 100) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    },

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            const modal = document.getElementById('gameQuickView');
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        }

        // R for random game
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            this.playRandomGame();
        }
    },

    updateActiveTab(filter) {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
};

// ===== GLOBAL EXPORT =====
window.CarGames = CarGames;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Car Games
    CarGames.init();

    // Initialize analytics
    if (typeof Analytics !== 'undefined') {
        Analytics.init();
    }

    // Initialize ads
    if (typeof AdManager !== 'undefined') {
        AdManager.init();
    }
});

// ===== SERVICE WORKER (PROGRESSIVE WEB APP) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registered:', registration);
        }).catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// ===== OFFLINE SUPPORT =====
window.addEventListener('online', () => {
    document.documentElement.classList.remove('offline');
    CarGames.showNotification('You are back online!', 'success');
});

window.addEventListener('offline', () => {
    document.documentElement.classList.add('offline');
    CarGames.showNotification('You are offline. Some features may be limited.', 'warning');
});

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = window.performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;

        console.log(`🚀 Page loaded in ${loadTime}ms`);

        // Send to analytics if load time is too slow
        if (loadTime > 3000) {
            console.warn('⚠️ Page load time is high');
        }
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);

    // Send to error tracking service
    if (typeof ErrorTracker !== 'undefined') {
        ErrorTracker.captureException(event.error);
    }
});

// ===== EXPORT FUNCTIONS =====
// End of file
