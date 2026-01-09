// ===== REVENUE OPTIMIZATION STRATEGIES =====
class RevenueOptimizer {
    constructor() {
        this.strategies = {
            adPlacement: {
                name: 'Optimal Ad Placement',
                description: 'Place ads in high-visibility areas without affecting UX',
                implementation: this.optimizeAdPlacement.bind(this),
                estimatedIncrease: '20-30%'
            },
            adRefresh: {
                name: 'Smart Ad Refresh',
                description: 'Refresh ads at optimal intervals',
                implementation: this.optimizeAdRefresh.bind(this),
                estimatedIncrease: '15-25%'
            },
            affiliate: {
                name: 'Affiliate Integration',
                description: 'Add relevant affiliate products',
                implementation: this.addAffiliateProducts.bind(this),
                estimatedIncrease: '10-20%'
            },
            premium: {
                name: 'Premium Features',
                description: 'Offer premium ad-free experience',
                implementation: this.setupPremiumFeatures.bind(this),
                estimatedIncrease: '5-15%'
            },
            emailMonetization: {
                name: 'Email Monetization',
                description: 'Monetize through email marketing',
                implementation: this.setupEmailMonetization.bind(this),
                estimatedIncrease: '8-12%'
            }
        };
        
        this.metrics = {
            dailyVisitors: 0,
            adRevenue: 0,
            affiliateRevenue: 0,
            premiumRevenue: 0,
            totalRevenue: 0
        };
        
        this.loadMetrics();
    }
    
    // ===== AD PLACEMENT OPTIMIZATION =====
    optimizeAdPlacement() {
        // 1. Above the Fold - Most valuable position
        this.placeAd('leaderboard', 'header', {
            priority: 1,
            maxWidth: '728px',
            minViewability: 0.8
        });
        
        // 2. Between Content - High engagement
        this.placeAd('rectangle', 'content-break', {
            priority: 2,
            maxWidth: '300px',
            minViewability: 0.6
        });
        
        // 3. Sidebar - Persistent visibility
        this.placeAd('skyscraper', 'sidebar', {
            priority: 3,
            maxWidth: '160px',
            sticky: true
        });
        
        // 4. End of Content - Final impression
        this.placeAd('leaderboard', 'footer', {
            priority: 4,
            maxWidth: '728px',
            minViewability: 0.5
        });
        
        // 5. In-content native ads
        this.createNativeAds();
    }
    
    placeAd(format, position, options) {
        const adElement = document.createElement('div');
        adElement.className = `ad-unit ${format} ad-${position}`;
        adElement.dataset.adSlot = `${format}-${position}`;
        
        // Set styles based on options
        if (options.sticky) {
            adElement.style.position = 'sticky';
            adElement.style.top = '100px';
        }
        
        // Insert into DOM based on position
        switch(position) {
            case 'header':
                document.querySelector('.header-actions').after(adElement);
                break;
            case 'content-break':
                this.placeBetweenContent(adElement);
                break;
            case 'sidebar':
                document.querySelector('.game-sidebar')?.prepend(adElement);
                break;
            case 'footer':
                document.querySelector('.newsletter-section').after(adElement);
                break;
        }
        
        // Track placement
        this.trackPlacement(position, format);
    }
    
    placeBetweenContent(adElement) {
        // Place ad after every 3rd game card
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach((card, index) => {
            if ((index + 1) % 3 === 0 && index !== gameCards.length - 1) {
                card.parentNode.insertBefore(adElement.cloneNode(true), card.nextSibling);
            }
        });
    }
    
    createNativeAds() {
        // Create sponsored content that looks native
        const nativeAd = document.createElement('div');
        nativeAd.className = 'native-ad';
        nativeAd.innerHTML = `
            <div class="native-ad-content">
                <div class="native-ad-badge">Sponsored</div>
                <h4>🚗 Upgrade Your Racing Experience</h4>
                <p>Check out our recommended racing gear for the ultimate gaming setup.</p>
                <a href="/recommended-gear" class="native-ad-link">See Recommendations →</a>
            </div>
        `;
        
        // Insert in strategic locations
        const locations = [
            '.trending-games',
            '.new-games',
            '.recommended-games'
        ];
        
        locations.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                container.appendChild(nativeAd.cloneNode(true));
            }
        });
    }
    
    // ===== AD REFRESH OPTIMIZATION =====
    optimizeAdRefresh() {
        const refreshRules = {
            viewabilityThreshold: 0.5, // 50% visible
            timeThreshold: 30000, // 30 seconds
            maxRefreshes: 5,
            cooldownAfterClick: 60000 // 1 minute
        };
        
        // Monitor ad viewability
        this.monitorAdViewability(refreshRules);
        
        // Setup smart refresh intervals
        this.setupSmartRefresh(refreshRules);
    }
    
    monitorAdViewability(rules) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const ad = entry.target;
                    const viewability = this.calculateViewability(ad);
                    
                    if (viewability >= rules.viewabilityThreshold) {
                        this.scheduleAdRefresh(ad, rules);
                    }
                }
            });
        }, { threshold: [0.1, 0.5, 0.8] });
        
        document.querySelectorAll('.ad-unit').forEach(ad => {
            observer.observe(ad);
        });
    }
    
    scheduleAdRefresh(ad, rules) {
        let refreshCount = 0;
        
        const refreshAd = () => {
            if (refreshCount >= rules.maxRefreshes) return;
            
            // Check if ad was recently clicked
            const lastClick = parseInt(ad.dataset.lastClick || '0');
            if (Date.now() - lastClick < rules.cooldownAfterClick) {
                return; // Skip refresh if recently clicked
            }
            
            // Perform refresh
            this.refreshAdContent(ad);
            refreshCount++;
            
            // Schedule next refresh
            setTimeout(refreshAd, rules.timeThreshold);
        };
        
        // Initial refresh after threshold
        setTimeout(refreshAd, rules.timeThreshold);
    }
    
    refreshAdContent(ad) {
        // Store current ad content
        const currentContent = ad.innerHTML;
        
        // Load new ad
        if (typeof AdManager !== 'undefined') {
            AdManager.refreshAd(ad);
        }
        
        // Track refresh
        this.trackAdRefresh(ad);
    }
    
    // ===== AFFILIATE MONETIZATION =====
    addAffiliateProducts() {
        const affiliateProducts = [
            {
                category: 'racing',
                products: [
                    {
                        name: 'Logitech G29 Racing Wheel',
                        price: '$299.99',
                        commission: '$45',
                        link: 'https://amzn.to/racing-wheel',
                        image: 'assets/images/affiliate/wheel.jpg',
                        description: 'Force feedback racing wheel for realistic experience'
                    },
                    {
                        name: 'Next Level Racing Cockpit',
                        price: '$499.99',
                        commission: '$75',
                        link: 'https://amzn.to/racing-cockpit',
                        image: 'assets/images/affiliate/cockpit.jpg',
                        description: 'Professional racing simulator cockpit'
                    }
                ]
            },
            {
                category: 'gaming',
                products: [
                    {
                        name: 'Razer BlackWidow Keyboard',
                        price: '$129.99',
                        commission: '$19',
                        link: 'https://amzn.to/gaming-keyboard',
                        image: 'assets/images/affiliate/keyboard.jpg',
                        description: 'Mechanical gaming keyboard with RGB'
                    },
                    {
                        name: 'NVIDIA GeForce RTX 3080',
                        price: '$799.99',
                        commission: '$80',
                        link: 'https://amzn.to/gaming-gpu',
                        image: 'assets/images/affiliate/gpu.jpg',
                        description: 'High-performance graphics card for gaming'
                    }
                ]
            }
        ];
        
        // Create affiliate sections
        this.createAffiliateSection('Racing Gear', affiliateProducts[0].products);
        this.createAffiliateSection('Gaming Accessories', affiliateProducts[1].products);
        
        // Add affiliate links to relevant pages
        this.addContextualAffiliateLinks();
    }
    
    createAffiliateSection(title, products) {
        const section = document.createElement('section');
        section.className = 'affiliate-section';
        section.innerHTML = `
            <div class="container">
                <h2 class="section-title">${title}</h2>
                <p class="section-subtitle">Recommended products for better gaming experience</p>
                <div class="affiliate-grid">
                    ${products.map(product => `
                        <div class="affiliate-product">
                            <a href="${product.link}" target="_blank" class="product-link">
                                <img src="${product.image}" alt="${product.name}" class="product-image">
                                <div class="product-info">
                                    <h4 class="product-name">${product.name}</h4>
                                    <p class="product-description">${product.description}</p>
                                    <div class="product-meta">
                                        <span class="product-price">${product.price}</span>
                                        <span class="product-commission">Earn ${product.commission}</span>
                                    </div>
                                    <span class="affiliate-badge">Affiliate Link</span>
                                </div>
                            </a>
                        </div>
                    `).join('')}
                </div>
                <p class="affiliate-disclaimer">We earn commission from qualifying purchases. This helps support the site.</p>
            </div>
        `;
        
        // Insert after game sections
        document.querySelector('.recommended-games').after(section);
    }
    
    addContextualAffiliateLinks() {
        // Add affiliate links to game descriptions
        const gameDescriptions = document.querySelectorAll('.game-card-description');
        
        const affiliateKeywords = {
            'racing': 'Check out our recommended <a href="/racing-gear" class="affiliate-link">racing wheels</a> for better control.',
            'simulation': 'Enhance your experience with a <a href="/gaming-chair" class="affiliate-link">gaming chair</a>.',
            'graphics': 'Upgrade your <a href="/graphics-card" class="affiliate-link">graphics card</a> for better visuals.'
        };
        
        gameDescriptions.forEach(desc => {
            const text = desc.textContent.toLowerCase();
            
            Object.keys(affiliateKeywords).forEach(keyword => {
                if (text.includes(keyword)) {
                    const link = document.createElement('p');
                    link.className = 'affiliate-suggestion';
                    link.innerHTML = affiliateKeywords[keyword];
                    desc.parentNode.appendChild(link);
                }
            });
        });
    }
    
    // ===== PREMIUM FEATURES =====
    setupPremiumFeatures() {
        // Create premium subscription options
        const premiumPlans = [
            {
                name: 'Basic',
                price: '$2.99/month',
                features: [
                    'Ad-free experience',
                    'Priority support',
                    'Basic themes'
                ],
                cta: 'Start Free Trial'
            },
            {
                name: 'Pro',
                price: '$5.99/month',
                features: [
                    'All Basic features',
                    'Exclusive games',
                    'Early access',
                    'Advanced themes'
                ],
                popular: true,
                cta: 'Most Popular'
            },
            {
                name: 'Ultimate',
                price: '$9.99/month',
                features: [
                    'All Pro features',
                    'Game recommendations',
                    'Cloud saves',
                    'Multi-device sync'
                ],
                cta: 'Get Ultimate'
            }
        ];
        
        // Add premium section
        this.createPremiumSection(premiumPlans);
        
        // Add premium upsell modals
        this.addPremiumUpsells();
    }
    
    createPremiumSection(plans) {
        const section = document.createElement('section');
        section.className = 'premium-section';
        section.innerHTML = `
            <div class="container">
                <h2 class="section-title">Go Premium</h2>
                <p class="section-subtitle">Enhance your gaming experience with premium features</p>
                <div class="pricing-grid">
                    ${plans.map(plan => `
                        <div class="pricing-card ${plan.popular ? 'popular' : ''}">
                            ${plan.popular ? '<div class="popular-badge">MOST POPULAR</div>' : ''}
                            <h3 class="plan-name">${plan.name}</h3>
                            <div class="plan-price">${plan.price}</div>
                            <ul class="plan-features">
                                ${plan.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                            </ul>
                            <button class="btn-plan-select" data-plan="${plan.name.toLowerCase()}">
                                ${plan.cta}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Insert before footer
        document.querySelector('.main-footer').before(section);
        
        // Add event listeners
        section.querySelectorAll('.btn-plan-select').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showPremiumCheckout(btn.dataset.plan);
            });
        });
    }
    
    showPremiumCheckout(plan) {
        const modal = document.createElement('div');
        modal.className = 'premium-checkout-modal';
        modal.innerHTML = `
            <div class="checkout-content">
                <h3>Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}</h3>
                <div class="checkout-form">
                    <input type="email" placeholder="Your email" class="checkout-input">
                    <button class="btn-checkout">Continue to Payment</button>
                </div>
                <p class="checkout-note">7-day free trial • Cancel anytime</p>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    addPremiumUpsells() {
        // Show upgrade prompts after certain actions
        const upsellTriggers = [
            {
                trigger: 'game_played_5_times',
                message: 'Enjoying the games? Go premium for an ad-free experience!',
                delay: 5000
            },
            {
                trigger: 'favorites_added_3',
                message: 'Love these games? Support us by upgrading to premium!',
                delay: 3000
            }
        ];
        
        // Monitor user actions for upsell opportunities
        this.monitorForUpsellOpportunities(upsellTriggers);
    }
    
    // ===== EMAIL MONETIZATION =====
    setupEmailMonetization() {
        // Create email subscription with monetization
        const emailMonetization = {
            newsletter: {
                name: 'Weekly Game Updates',
                frequency: 'weekly',
                monetization: {
                    sponsoredContent: true,
                    affiliateLinks: true,
                    productPromotions: true
                }
            },
            promotions: {
                name: 'Special Offers',
                frequency: 'monthly',
                monetization: {
                    partnerDeals: true,
                    discountCodes: true,
                    exclusiveContent: true
                }
            }
        };
        
        // Enhanced newsletter signup
        this.createMonetizedNewsletter(emailMonetization);
        
        // Email course for monetization
        this.createEmailCourse();
    }
    
    createMonetizedNewsletter(config) {
        const newsletter = document.querySelector('.newsletter-section');
        if (!newsletter) return;
        
        // Enhance existing newsletter
        newsletter.innerHTML = `
            <div class="container">
                <div class="newsletter-content">
                    <div class="newsletter-text">
                        <h3>🎮 Get More Than Just Updates!</h3>
                        <p>Subscribe to our newsletter and get:</p>
                        <ul class="newsletter-benefits">
                            <li><i class="fas fa-check"></i> New game alerts</li>
                            <li><i class="fas fa-check"></i> Exclusive gaming tips</li>
                            <li><i class="fas fa-check"></i> Special discounts on gaming gear</li>
                            <li><i class="fas fa-check"></i> Free game recommendations</li>
                        </ul>
                    </div>
                    <div class="newsletter-form">
                        <div class="input-group">
                            <input type="email" placeholder="Your best email" class="email-input" required>
                            <button class="btn-subscribe">Get Free Updates</button>
                        </div>
                        <div class="form-options">
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Weekly game updates</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Special offers & discounts</span>
                            </label>
                        </div>
                        <p class="privacy-note">By subscribing, you agree to receive emails with games, tips, and offers. Unsubscribe anytime.</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add subscription handler
        newsletter.querySelector('.btn-subscribe').addEventListener('click', () => {
            this.subscribeToNewsletter();
        });
    }
    
    subscribeToNewsletter() {
        const email = document.querySelector('.email-input').value;
        
        if (!this.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Simulate subscription
        console.log('Subscribing email:', email);
        
        // Show thank you message with upsell
        this.showSubscriptionThankYou(email);
        
        // Track subscription
        this.trackEmailSubscription(email);
    }
    
    showSubscriptionThankYou(email) {
        const thankYou = document.createElement('div');
        thankYou.className = 'subscription-thank-you';
        thankYou.innerHTML = `
            <div class="thank-you-content">
                <h3>🎉 Welcome Aboard!</h3>
                <p>Check your email to confirm your subscription to <strong>${email}</strong></p>
                <div class="thank-you-bonus">
                    <h4>As a bonus, check out:</h4>
                    <a href="/recommended-gear" class="bonus-link">🏎️ Our top racing gear picks</a>
                    <a href="/gaming-tips" class="bonus-link">💡 Pro gaming tips</a>
                </div>
            </div>
        `;
        
        document.querySelector('.newsletter-section').innerHTML = '';
        document.querySelector('.newsletter-section').appendChild(thankYou);
    }
    
    createEmailCourse() {
        // Create email course for monetization
        const emailCourse = {
            title: '7-Day Car Gaming Masterclass',
            description: 'Free email course to improve your gaming skills',
            lessons: [
                { day: 1, title: 'Mastering Controls', monetization: 'affiliate links to controllers' },
                { day: 2, title: 'Advanced Racing Techniques', monetization: 'premium content upsell' },
                { day: 3, title: 'Gaming Setup Optimization', monetization: 'affiliate gear recommendations' },
                { day: 4, title: 'Multiplayer Strategies', monetization: 'community upsell' },
                { day: 5, title: 'Game Selection Guide', monetization: 'sponsored game promotions' },
                { day: 6, title: 'Performance Optimization', monetization: 'software affiliate links' },
                { day: 7, title: 'Becoming a Pro Gamer', monetization: 'premium course offer' }
            ]
        };
        
        // Add email course signup
        this.addEmailCourseSignup(emailCourse);
    }
    
    addEmailCourseSignup(course) {
        const courseSection = document.createElement('section');
        courseSection.className = 'email-course-section';
        courseSection.innerHTML = `
            <div class="container">
                <div class="course-card">
                    <div class="course-content">
                        <h3>${course.title}</h3>
                        <p class="course-description">${course.description}</p>
                        <div class="course-lessons">
                            ${course.lessons.map(lesson => `
                                <div class="lesson">
                                    <span class="lesson-day">Day ${lesson.day}</span>
                                    <span class="lesson-title">${lesson.title}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="course-signup">
                        <h4>Get the Free Course</h4>
                        <input type="email" placeholder="Your email" class="course-email">
                        <button class="btn-course-signup">Send Me the Course</button>
                        <p class="course-note">Free 7-day course • Unsubscribe anytime</p>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after newsletter
        document.querySelector('.newsletter-section').after(courseSection);
    }
    
    // ===== UTILITY METHODS =====
    calculateViewability(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        if (rect.bottom < 0 || rect.top > windowHeight) {
            return 0;
        }
        
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        return visibleHeight / rect.height;
    }
    
    trackPlacement(position, format) {
        // Track placement performance
        console.log(`Ad placed: ${position} (${format})`);
    }
    
    trackAdRefresh(ad) {
        console.log('Ad refreshed:', ad.dataset.adSlot);
    }
    
    trackEmailSubscription(email) {
        // Track email subscription for monetization
        console.log('Email subscribed:', email);
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    loadMetrics() {
        // Load revenue metrics from localStorage or API
        try {
            const saved = localStorage.getItem('revenueMetrics');
            if (saved) {
                this.metrics = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    }
    
    saveMetrics() {
        try {
            localStorage.setItem('revenueMetrics', JSON.stringify(this.metrics));
        } catch (error) {
            console.error('Error saving metrics:', error);
        }
    }
    
    // ===== REVENUE CALCULATION =====
    calculatePotentialRevenue() {
        const visitors = this.metrics.dailyVisitors || 10000;
        
        // Ad revenue calculation
        const adCTR = 0.005; // 0.5% click-through rate
        const adCPC = 0.15; // $0.15 per click
        const dailyAdRevenue = visitors * adCTR * adCPC;
        
        // Affiliate revenue calculation
        const affiliateConversion = 0.01; // 1% conversion
        const averageCommission = 20; // $20 average commission
        const dailyAffiliateRevenue = visitors * 0.1 * affiliateConversion * averageCommission;
        
        // Premium revenue calculation
        const premiumConversion = 0.002; // 0.2% conversion
        const averagePremiumPrice = 5; // $5/month average
        const dailyPremiumRevenue = visitors * premiumConversion * averagePremiumPrice;
        
        const totalDaily = dailyAdRevenue + dailyAffiliateRevenue + dailyPremiumRevenue;
        const monthly = totalDaily * 30;
        const yearly = monthly * 12;
        
        return {
            daily: totalDaily.toFixed(2),
            monthly: monthly.toFixed(2),
            yearly: yearly.toFixed(2),
            breakdown: {
                ads: dailyAdRevenue.toFixed(2),
                affiliate: dailyAffiliateRevenue.toFixed(2),
                premium: dailyPremiumRevenue.toFixed(2)
            }
        };
    }
    
    // ===== IMPLEMENTATION =====
    implementAllStrategies() {
        console.log('🚀 Implementing all revenue strategies...');
        
        Object.keys(this.strategies).forEach(strategyKey => {
            const strategy = this.strategies[strategyKey];
            console.log(`Implementing: ${strategy.name}`);
            
            try {
                strategy.implementation();
                console.log(`✅ ${strategy.name} implemented`);
            } catch (error) {
                console.error(`❌ Error implementing ${strategy.name}:`, error);
            }
        });
        
        // Calculate and show potential revenue
        const revenue = this.calculatePotentialRevenue();
        this.showRevenueProjection(revenue);
    }
    
    showRevenueProjection(revenue) {
        console.log('💰 Revenue Projection:');
        console.log('Daily:', revenue.daily);
        console.log('Monthly:', revenue.monthly);
        console.log('Yearly:', revenue.yearly);
        console.log('Breakdown:', revenue.breakdown);
        
        // Show in UI if admin panel
        if (document.getElementById('adminPanel')) {
            this.updateAdminPanel(revenue);
        }
    }
    
    updateAdminPanel(revenue) {
        const panel = document.getElementById('adminPanel');
        panel.innerHTML = `
            <div class="revenue-projection">
                <h3>💰 Revenue Projection</h3>
                <div class="projection-grid">
                    <div class="projection-card">
                        <div class="projection-title">Daily</div>
                        <div class="projection-amount">$${revenue.daily}</div>
                    </div>
                    <div class="projection-card">
                        <div class="projection-title">Monthly</div>
                        <div class="projection-amount">$${revenue.monthly}</div>
                    </div>
                    <div class="projection-card">
                        <div class="projection-title">Yearly</div>
                        <div class="projection-amount">$${revenue.yearly}</div>
                    </div>
                </div>
                <div class="revenue-breakdown">
                    <h4>Revenue Breakdown</h4>
                    <ul>
                        <li>Ad Revenue: $${revenue.breakdown.ads}/day</li>
                        <li>Affiliate Revenue: $${revenue.breakdown.affiliate}/day</li>
                        <li>Premium Revenue: $${revenue.breakdown.premium}/day</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// ===== GLOBAL EXPORT =====
window.RevenueOptimizer = RevenueOptimizer;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Revenue Optimizer
    const optimizer = new RevenueOptimizer();
    
    // Implement strategies (can be toggled)
    if (window.location.search.includes('optimize=1')) {
        optimizer.implementAllStrategies();
    }
    
    // Show revenue projection in console
    const projection = optimizer.calculatePotentialRevenue();
    console.log('Projected Revenue:', projection);
});
