// Configuration settings for the Paper Format extension
const PaperFormatConfig = {
    // Site detection settings
    sites: {
        // Domains that should be treated as media sites (no formatting applied)
        mediadomains: [
            'youtube.com',
            'vimeo.com',
            'netflix.com',
            'twitch.tv',
            'instagram.com',
            'tiktok.com'
        ],
        
        // Minimum word count to consider a page as an article
        minWordCount: 200,
        
        // Selectors to identify article content
        articleSelectors: [
            'article',
            '[role="article"]',
            '.article',
            '.post-content',
            '.entry-content',
            'main p:not(:empty)',
            '.story-body',
            '#story',
            '.g-story',
            '.article-body',
            '.StoryBodyCompanionColumn'
        ]
    },

    // Ad detection settings
    ads: {
        // Keywords that indicate an element is an advertisement
        adKeywords: [
            'ad-', 'ads-', 'advert-', 'advertisement-', 'banner-',
            'sponsor-', 'promoted-', 'marketing-', 'promo-',
            'commercial-', 'paid-content', 'reklama-', 'anzeige-'
        ],
        
        // Whether to move ads to the side container
        moveAds: true,
        
        // Position of the ad container
        adContainerPosition: {
            right: '20px',
            top: '20px'
        }
    },

    // Styling settings
    style: {
        // Paper container settings
        paper: {
            maxWidth: '800px',
            margin: '40px auto',
            padding: '60px',
            background: '#fff',
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            lineHeight: '1.6',
            textColor: '#333'
        },
        
        // Responsive breakpoints
        breakpoints: {
            tablet: 1200,
            mobile: 768
        }
    }
};

// Function to update configuration at runtime
function updateConfig(newConfig) {
    // Deep merge the new config with the existing one
    function deepMerge(target, source) {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }
    
    deepMerge(PaperFormatConfig, newConfig);
    
    // Dispatch event to notify content script of config changes
    window.dispatchEvent(new CustomEvent('paperFormatConfigUpdated', {
        detail: { config: PaperFormatConfig }
    }));
}

// Export configuration
window.PaperFormatConfig = PaperFormatConfig;
window.updatePaperFormatConfig = updateConfig; 