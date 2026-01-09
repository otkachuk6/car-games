// ===== ADVANCED AD MANAGEMENT SYSTEM =====
class AdManager {
    constructor() {
        this.config = {
            enabled: true,
            networks: {
                google: {
                    enabled: true,
                    clientId: 'ca-pub-YOUR_PUBLISHER_ID',
                    slots: {
                        leaderboard: '1234567890',
                        rectangle: '0987654321',
                        skyscraper: '1122334455'
                    }
                },
                mediavine: {
                    enabled: false,
                    siteId: 'YOUR_SITE_ID'
                },
                propeller: {
                    enabled: false,
                    siteId: 'YOUR_SITE_ID'
                },
                adsterra: {
                    enabled: false,
                    siteId: 'YOUR_SITE_ID'
                }
            },
            refresh: {
                enabled: true,
                interval: 30000, // 30 seconds
                maxPerSession: 10
            },
            targeting: {
                keywords: ['car games', 'racing games', 'free games'],
                category: 'gaming',
                pageType: 'index'
            },
            fallback: {
                enabled: true,
                image: 'assets/images/fallback-ad.jpg',
                link: '/advertise',
                cta: 'Advertise Here'
            }
        };
        
        this.state = {
            adsLoaded: 0,
            adsClicked: 0,
            revenue: 0,
            networkPriority: ['google', 'mediavine', 'propeller', 'adsterra'],
            currentNetworkIndex: 0
        };
        
        this.ads = new Map();
    }
    
    init() {
        if (!this.config.enabled) return;
        
        console.log('🤑 Ad Manager Initializing...');
        
        // Check for ad blocker
        this.detectAdBlocker().then(blocked => {
            if (blocked) {
                this.handleAdBlocker();
            } else {
                this.loadAds();
            }
        });
        
        // Setup refresh intervals
        if (this.config.refresh.enabled) {
            this.setupRefreshInterval();
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize revenue tracking
        this.initRevenueTracking();
        
        console.log('✅ Ad Manager Ready!');
    }
    
    async detectAdBlocker() {
        return new Promise(resolve => {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            testAd.style.position = 'absolute';
            testAd.style.left = '-9999px';
            testAd.style.top = '-9999px';
            testAd.style.height = '1px';
            document.body.appendChild(testAd);
            
            setTimeout(() => {
                const blocked = testAd.offsetHeight === 0;
                testAd.remove();
                resolve(blocked);
            }, 100);
        });
    }
    
    handleAdBlocker() {
        console.log('⚠️ Ad blocker detected');
        
        // Show anti-ad blocker message
        this.showAdBlockerMessage();
        
        // Try alternative monetization
        this.loadAlternativeMonetization();
    }
    
    showAdBlockerMessage() {
        const message = document.createElement('div');
        message.className = 'adblock-message';
        message.innerHTML = `
            <div class="adblock-content">
                <div class="adblock-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Please Disable Ad Blocker</h3>
                </div>
                <div class="adblock-body">
                    <p>Car Games is free thanks to advertisements. By disabling your ad blocker, you help support:</p>
                    <ul>
                        <li><i class="fas fa-check"></i> Adding new games daily</li>
                        <li><i class="fas fa-check"></i> Improving server performance</li>
                        <li><i class="fas fa-check"></i> Maintaining the website</li>
                    </ul>
                    <div class="adblock-actions">
                        <button class="btn-adblock-whitelist">Whitelist This Site</button>
                        <button class="btn-adblock-close">Continue Anyway</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Add event listeners
        message.querySelector('.btn-adblock-close').addEventListener('click', () => {
            message.remove();
        });
        
        message.querySelector('.btn-adblock-whitelist').addEventListener('click', () => {
            this.showWhitelistInstructions();
        });
    }
    
    showWhitelistInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'whitelist-instructions';
        instructions.innerHTML = `
            <div class="instructions-content">
                <h3>How to Whitelist This Site</h3>
                <div class="instructions-steps">
                    <div class="step">
                        <h4>uBlock Origin</h4>
                        <p>Click the uBlock icon → Click the power button to turn it off for this site</p>
                    </div>
                    <div class="step">
                        <h4>AdBlock Plus</h4>
                        <p>Click the ABP icon → Disable on "car-games.com"</p>
                    </div>
                    <div class="step">
                        <h4>AdBlock</h4>
                        <p>Click the AdBlock icon → Don't run on pages on this domain</p>
                    </div>
                </div>
                <button class="btn-instructions-close">I've Whitelisted the Site</button>
            </div>
        `;
        
        document.body.appendChild(instructions);
        
        instructions.querySelector('.btn-instructions-close').addEventListener('click', () => {
            instructions.remove();
            location.reload(); // Reload to detect changes
        });
    }
    
    loadAds() {
        const adElements = document.querySelectorAll('[data-ad-slot]');
        
        adElements.forEach((element, index) => {
            // Delay loading for better performance
            setTimeout(() => {
                this.loadAd(element, index);
            }, index * 500);
        });
    }
    
    loadAd(element, index) {
        const slot = element.dataset.adSlot;
        const size = this.getAdSize(element);
        
        // Store ad element
        this.ads.set(slot, {
            element,
            slot,
            size,
            loaded: false,
            impressions: 0,
            clicks: 0
        });
        
        // Try to load ad from primary network
        const network = this.getNextAvailableNetwork();
        
        if (network) {
            this.loadAdFromNetwork(element, network, slot, size);
        } else {
            this.loadFallbackAd(element);
        }
    }
    
    getNextAvailableNetwork() {
        for (const networkName of this.state.networkPriority) {
            const network = this.config.networks[networkName];
            if (network && network.enabled) {
                return networkName;
            }
        }
        return null;
    }
    
    loadAdFromNetwork(element, network, slot, size) {
        switch (network) {
            case 'google':
                this.loadGoogleAd(element, slot, size);
                break;
            case 'mediavine':
                this.loadMediavineAd(element, slot, size);
                break;
            case 'propeller':
                this.loadPropellerAd(element, slot, size);
                break;
            case 'adsterra':
                this.loadAdsterraAd(element, slot, size);
                break;
            default:
                this.loadFallbackAd(element);
        }
    }
    
    loadGoogleAd(element, slot, size) {
        const adId = `google-ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        element.innerHTML = `
            <ins class="adsbygoogle"
                 style="display:block;"
                 data-ad-client="${this.config.networks.google.clientId}"
                 data-ad-slot="${this.config.networks.google.slots[this.getAdType(element)] || 'auto'}"
                 data-ad-format="${this.getAdFormat(size)}"
                 data-full-width-responsive="true"></ins>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
        `;
        
        // Track this ad
        this.trackAdLoad(slot, 'google');
        
        // Add click tracking
        element.addEventListener('click', () => {
            this.trackAdClick(slot, 'google');
        });
    }
    
    loadFallbackAd(element) {
        if (!this.config.fallback.enabled) return;
        
        const adData = this.config.fallback;
        
        element.innerHTML = `
            <a href="${adData.link}" target="_blank" class="fallback-ad" data-ad-type="fallback">
                <img src="${adData.image}" alt="Advertisement">
                <div class="fallback-overlay">
                    <span class="fallback-cta">${adData.cta}</span>
                    <span class="fallback-badge">Your Ad Here</span>
                </div>
            </a>
        `;
        
        // Track fallback impression
        this.trackAdLoad(element.dataset.adSlot, 'fallback');
    }
    
    setupRefreshInterval() {
        let refreshCount = 0;
        
        const refreshAds = () => {
            if (refreshCount >= this.config.refresh.maxPerSession) {
                console.log('Max ad refreshes reached for this session');
                return;
            }
            
            const visibleAds = this.getVisibleAds();
            
            visibleAds.forEach(ad => {
                if (ad.loaded && this.shouldRefreshAd(ad)) {
                    this.refreshAd(ad);
                    refreshCount++;
                }
            });
        };
        
        // Initial refresh after page load
        setTimeout(refreshAds, this.config.refresh.interval);
        
        // Subsequent refreshes
        setInterval(refreshAds, this.config.refresh.interval);
    }
    
    getVisibleAds() {
        const visible = [];
        
        this.ads.forEach(ad => {
            if (this.isElementVisible(ad.element)) {
                visible.push(ad);
            }
        });
        
        return visible;
    }
    
    isElementVisible(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    shouldRefreshAd(ad) {
        // Don't refresh if ad was recently clicked
        const lastClick = ad.lastClick || 0;
        const timeSinceClick = Date.now() - lastClick;
        
        if (timeSinceClick < 60000) { // 1 minute
            return false;
        }
        
        // Check viewability
        return this.isElementVisible(ad.element);
    }
    
    refreshAd(ad) {
        console.log(`Refreshing ad: ${ad.slot}`);
        
        // Clear current ad
        ad.element.innerHTML = '';
        
        // Load new ad
        const network = this.getNextAvailableNetwork();
        if (network) {
            this.loadAdFromNetwork(ad.element, network, ad.slot, ad.size);
        }
        
        // Update ad data
        ad.loaded = false;
        ad.lastRefresh = Date.now();
    }
    
    setupEventListeners() {
        // Track ad visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adElement = entry.target;
                    const slot = adElement.dataset.adSlot;
                    const ad = this.ads.get(slot);
                    
                    if (ad && !ad.impressionTracked) {
                        this.trackAdImpression(slot);
                        ad.impressionTracked = true;
                    }
                }
            });
        }, { threshold: 0.5 });
        
        // Observe all ad elements
        document.querySelectorAll('[data-ad-slot]').forEach(el => {
            observer.observe(el);
        });
    }
    
    trackAdLoad(slot, network) {
        console.log(`Ad loaded: ${slot} from ${network}`);
        
        const ad = this.ads.get(slot);
        if (ad) {
            ad.loaded = true;
            ad.loadTime = Date.now();
            ad.network = network;
        }
        
        this.state.adsLoaded++;
        
        // Send to analytics
        this.sendAnalyticsEvent('ad_load', { slot, network });
    }
    
    trackAdImpression(slot) {
        const ad = this.ads.get(slot);
        if (ad) {
            ad.impressions++;
        }
        
        // Calculate revenue (simulated)
        this.calculateRevenue(slot);
        
        // Send to analytics
        this.sendAnalyticsEvent('ad_impression', { slot });
    }
    
    trackAdClick(slot, network) {
        const ad = this.ads.get(slot);
        if (ad) {
            ad.clicks++;
            ad.lastClick = Date.now();
        }
        
        this.state.adsClicked++;
        
        // Calculate revenue (higher for clicks)
        this.calculateRevenue(slot, true);
        
        // Send to analytics
        this.sendAnalyticsEvent('ad_click', { slot, network });
    }
    
    calculateRevenue(slot, isClick = false) {
        // Simplified revenue calculation
        // In reality, this would come from your ad network
        
        const ad = this.ads.get(slot);
        if (!ad) return;
        
        let revenue = 0;
        
        if (isClick) {
            // CPC (Cost Per Click) model
            revenue = 0.05 + Math.random() * 0.15; // $0.05 - $0.20 per click
        } else {
            // CPM (Cost Per Mille) model
            revenue = 0.001 + Math.random() * 0.005; // $0.001 - $0.006 per impression
        }
        
        this.state.revenue += revenue;
        
        // Update display
        this.updateRevenueDisplay();
        
        // Save to localStorage
        this.saveRevenueData();
    }
    
    updateRevenueDisplay() {
        // Update any revenue display elements on page
        const revenueElements = document.querySelectorAll('.revenue-display');
        revenueElements.forEach(el => {
            el.textContent = `$${this.state.revenue.toFixed(2)}`;
        });
        
        // Update in CarGames state
        if (window.CarGames) {
            window.CarGames.state.revenue.today = this.state.revenue;
        }
    }
    
    saveRevenueData() {
        try {
            localStorage.setItem('adRevenue', JSON.stringify({
                total: this.state.revenue,
                adsLoaded: this.state.adsLoaded,
                adsClicked: this.state.adsClicked,
                lastUpdated: Date.now()
            }));
        } catch (error) {
            console.error('Error saving revenue data:', error);
        }
    }
    
    initRevenueTracking() {
        // Load previous revenue data
        try {
            const saved = localStorage.getItem('adRevenue');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.revenue = data.total || 0;
                this.state.adsLoaded = data.adsLoaded || 0;
                this.state.adsClicked = data.adsClicked || 0;
            }
        } catch (error) {
            console.error('Error loading revenue data:', error);
        }
        
        // Update display
        this.updateRevenueDisplay();
    }
    
    sendAnalyticsEvent(event, data) {
        // Send to your analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', event, data);
        }
        
        // Log for debugging
        console.log(`📊 Ad Analytics: ${event}`, data);
    }
    
    getAdSize(element) {
        if (element.classList.contains('leaderboard')) return '728x90';
        if (element.classList.contains('rectangle')) return '300x250';
        if (element.classList.contains('skyscraper')) return '160x600';
        return 'auto';
    }
    
    getAdType(element) {
        if (element.classList.contains('leaderboard')) return 'leaderboard';
        if (element.classList.contains('rectangle')) return 'rectangle';
        if (element.classList.contains('skyscraper')) return 'skyscraper';
        return 'auto';
    }
    
    getAdFormat(size) {
        switch(size) {
            case '728x90': return 'horizontal';
            case '300x250': return 'rectangle';
            case '160x600': return 'vertical';
            default: return 'auto';
        }
    }
    
    loadAlternativeMonetization() {
        // Alternative monetization when ads are blocked
        this.showDonationOption();
        this.showPremiumOption();
        this.showAffiliateOffers();
    }
    
    showDonationOption() {
        const donationBanner = document.createElement('div');
        donationBanner.className = 'donation-banner';
        donationBanner.innerHTML = `
            <div class="donation-content">
                <h4>❤️ Support Car Games</h4>
                <p>Consider donating to help keep the site free and ad-free!</p>
                <div class="donation-options">
                    <button class="donation-option" data-amount="3">$3</button>
                    <button class="donation-option" data-amount="5">$5</button>
                    <button class="donation-option" data-amount="10">$10</button>
                    <button class="donation-option" data-amount="20">$20</button>
                </div>
                <button class="donation-custom">Custom Amount</button>
            </div>
        `;
        
        document.body.appendChild(donationBanner);
        
        // Add event listeners
        donationBanner.querySelectorAll('.donation-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.dataset.amount;
                this.processDonation(amount);
            });
        });
    }
    
    processDonation(amount) {
        // In a real implementation, this would connect to a payment processor
        console.log(`Processing donation: $${amount}`);
        
        // Show thank you message
        alert(`Thank you for your $${amount} donation! ❤️`);
        
        // Track donation
        this.sendAnalyticsEvent('donation', { amount });
    }
    
    showPremiumOption() {
        // Show option for premium ad-free experience
        const premiumBanner = document.createElement('div');
        premiumBanner.className = 'premium-banner';
        premiumBanner.innerHTML = `
            <div class="premium-content">
                <h4>🚀 Go Premium!</h4>
                <p>Get an ad-free experience and exclusive features for just $2.99/month</p>
                <button class="btn-premium">Upgrade Now</button>
            </div>
        `;
        
        document.body.appendChild(premiumBanner);
        
        premiumBanner.querySelector('.btn-premium').addEventListener('click', () => {
            this.showPremiumModal();
        });
    }
    
    showPremiumModal() {
        // Show premium subscription modal
        const modal = document.createElement('div');
        modal.className = 'premium-modal';
        modal.innerHTML = `
            <div class="premium-modal-content">
                <h3>Premium Membership</h3>
                <div class="premium-features">
                    <p><i class="fas fa-check"></i> Ad-free gaming experience</p>
                    <p><i class="fas fa-check"></i> Exclusive games</p>
                    <p><i class="fas fa-check"></i> Early access to new games</p>
                    <p><i class="fas fa-check"></i> Priority support</p>
                    <p><i class="fas fa-check"></i> Custom themes</p>
                </div>
                <div class="premium-pricing">
                    <div class="pricing-option">
                        <h4>Monthly</h4>
                        <div class="price">$2.99<span>/month</span></div>
                        <button class="btn-subscribe" data-plan="monthly">Subscribe</button>
                    </div>
                    <div class="pricing-option featured">
                        <div class="popular-badge">MOST POPULAR</div>
                        <h4>Yearly</h4>
                        <div class="price">$29.99<span>/year</span></div>
                        <div class="savings">Save 16%</div>
                        <button class="btn-subscribe" data-plan="yearly">Subscribe</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    showAffiliateOffers() {
        // Show affiliate offers as alternative monetization
        const offers = [
            {
                title: "Racing Wheel Sale",
                description: "Get 20% off premium racing wheels",
                image: "assets/images/affiliate/wheel.jpg",
                link: "https://example.com/affiliate/wheel",
                commission: 15
            },
            {
                title: "Gaming Chair",
                description: "Ergonomic chair for long gaming sessions",
                image: "assets/images/affiliate/chair.jpg",
                link: "https://example.com/affiliate/chair",
                commission: 12
            }
        ];
        
        // Replace some ad slots with affiliate offers
        document.querySelectorAll('.ad-unit').forEach((unit, index) => {
            if (index < offers.length) {
                const offer = offers[index];
                unit.innerHTML = `
                    <a href="${offer.link}" class="affiliate-offer" target="_blank">
                        <img src="${offer.image}" alt="${offer.title}">
                        <div class="offer-content">
                            <h5>${offer.title}</h5>
                            <p>${offer.description}</p>
                            <span class="commission">Earn $${offer.commission} commission</span>
                        </div>
                    </a>
                `;
            }
        });
    }
}

// ===== GLOBAL EXPORT =====
window.AdManager = AdManager;

// ===== AUTOMATED AD PLACEMENT OPTIMIZATION =====
class AdOptimizer {
    constructor() {
        this.placementTests = [];
        this.currentTest = 0;
        this.results = {};
    }
    
    testPlacements() {
        // Test different ad placements to find optimal positions
        const placements = [
            { position: 'top', format: 'leaderboard' },
            { position: 'mid-content', format: 'rectangle' },
            { position: 'sidebar', format: 'skyscraper' },
            { position: 'between-games', format: 'rectangle' },
            { position: 'bottom', format: 'leaderboard' }
        ];
        
        placements.forEach((placement, index) => {
            setTimeout(() => {
                this.runPlacementTest(placement, index);
            }, index * 60000); // Test each placement for 1 minute
        });
    }
    
    runPlacementTest(placement, testId) {
        console.log(`Testing ad placement: ${placement.position}`);
        
        // Create test ad
        const testAd = this.createTestAd(placement);
        
        // Track performance
        this.trackPlacementPerformance(testId, testAd);
    }
    
    trackPlacementPerformance(testId, adElement) {
        let impressions = 0;
        let clicks = 0;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    impressions++;
                }
            });
        });
        
        observer.observe(adElement);
        
        adElement.addEventListener('click', () => {
            clicks++;
        });
        
        // After 1 minute, calculate CTR
        setTimeout(() => {
            const ctr = clicks / impressions * 100;
            this.results[testId] = { impressions, clicks, ctr };
            
            console.log(`Placement test ${testId} results:`, this.results[testId]);
            
            // Save optimal placement
            this.saveOptimalPlacement(testId, ctr);
        }, 60000);
    }
    
    saveOptimalPlacement(testId, ctr) {
        const optimalPlacements = JSON.parse(localStorage.getItem('optimalAdPlacements') || '{}');
        
        if (!optimalPlacements.best || ctr > optimalPlacements.best.ctr) {
            optimalPlacements.best = {
                testId,
                ctr,
                timestamp: Date.now()
            };
            
            localStorage.setItem('optimalAdPlacements', JSON.stringify(optimalPlacements));
            
            // Apply optimal placement
            this.applyOptimalPlacement();
        }
    }
    
    applyOptimalPlacement() {
        const optimalPlacements = JSON.parse(localStorage.getItem('optimalAdPlacements') || '{}');
        
        if (optimalPlacements.best) {
            console.log('Applying optimal ad placement:', optimalPlacements.best);
            
            // In a real implementation, you would adjust ad placements
            // based on the optimal configuration
        }
    }
    
    createTestAd(placement) {
        const ad = document.createElement('div');
        ad.className = `test-ad ad-${placement.position}`;
        ad.innerHTML = 'Test Advertisement';
        
        // Position the ad
        switch(placement.position) {
            case 'top':
                document.querySelector('.hero-section').after(ad);
                break;
            case 'mid-content':
                document.querySelector('.new-games').before(ad);
                break;
            // ... other positions
        }
        
        return ad;
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Ad Manager
    if (typeof AdManager !== 'undefined') {
        const adManager = new AdManager();
        adManager.init();
    }
    
    // Initialize Ad Optimizer (only in admin mode)
    if (window.location.search.includes('admin=1')) {
        const optimizer = new AdOptimizer();
        optimizer.testPlacements();
    }
});
