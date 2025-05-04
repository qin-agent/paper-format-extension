// Function to check if the current URL matches any of the patterns
function matchesUrlPatterns(patterns) {
    const currentUrl = window.location.pathname.toLowerCase();
    return patterns.some(pattern => {
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
            // Handle regex patterns
            const regex = new RegExp(pattern.slice(1, -1));
            return regex.test(currentUrl);
        }
        return currentUrl.includes(pattern);
    });
}

// Function to check if the page is a listing page
function isListingPage() {
    const pathname = window.location.pathname;
    
    // Consider it a listing page if:
    // 1. It's the homepage (just domain)
    // 2. It's the root path ('/')
    // 3. It's a section path (one segment after root)
    if (pathname === '' || pathname === '/' || pathname.split('/').filter(Boolean).length === 1) {
        return true;
    }

    return false;
}

// Function to check if the page is an article
function isArticlePage() {
    // First check if it's a listing page
    if (isListingPage()) {
        return false;
    }

    // Check for common article indicators
    const articleSelectors = PaperFormatConfig.sites.articleSelectors;

    // Find the longest text container that matches our selectors
    let maxWordCount = 0;
    articleSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const wordCount = el.innerText.split(/\s+/).length;
            maxWordCount = Math.max(maxWordCount, wordCount);
        });
    });
    
    return maxWordCount > PaperFormatConfig.sites.minWordCount;
}

// Function to check if the page is media-centric
function isMediaPage() {
    return PaperFormatConfig.sites.mediadomains.some(domain => 
        window.location.hostname.includes(domain)
    );
}

// Function to check if an element is likely an ad
function isAdElement(element) {
    if (!element || !PaperFormatConfig.ads.moveAds) return false;

    // Check various element attributes
    const attributes = [
        element.id || '',
        element.className || '',
        ...Array.from(element.attributes).map(attr => attr.name),
        ...Array.from(element.attributes).map(attr => attr.value)
    ].join(' ').toLowerCase();

    // More precise ad detection
    const hasAdAttribute = PaperFormatConfig.ads.adKeywords.some(keyword => 
        attributes.includes(keyword) ||
        element.matches(`[class*="${keyword}"], [id*="${keyword}"]`)
    );

    // Check for iframes with ad-like sources
    const iframes = element.querySelectorAll('iframe');
    const hasAdIframe = Array.from(iframes).some(iframe => {
        const src = (iframe.src || '').toLowerCase();
        return src.includes('ad') || src.includes('sponsor') || src.includes('banner');
    });

    return hasAdAttribute || hasAdIframe;
}

// Function to apply styles based on config
function applyConfigStyles(element, type) {
    const styles = PaperFormatConfig.style;
    
    if (type === 'paper') {
        Object.assign(element.style, {
            maxWidth: styles.paper.maxWidth,
            margin: styles.paper.margin,
            padding: styles.paper.padding,
            background: styles.paper.background,
            fontFamily: styles.paper.fontFamily,
            fontSize: styles.paper.fontSize,
            lineHeight: styles.paper.lineHeight,
            color: styles.paper.textColor
        });
    } else if (type === 'ad-container') {
        Object.assign(element.style, {
            right: PaperFormatConfig.ads.adContainerPosition.right,
            top: PaperFormatConfig.ads.adContainerPosition.top
        });
    }
}

// Function to format the page
function formatPage() {
    // Check if we've already formatted this page
    if (document.querySelector('.paper-format-wrapper')) {
        return;
    }

    if (isMediaPage()) {
        return; // Don't modify media-centric pages
    }

    if (!isArticlePage()) {
        return; // Don't modify non-article pages
    }

    // Find the main content
    const mainContent = findMainContent();
    if (!mainContent) return;

    // Hide all elements except scripts and our formatting
    Array.from(document.body.children).forEach(child => {
        if (child.tagName !== 'SCRIPT' && !child.classList.contains('paper-format-wrapper')) {
            child.style.display = 'none';
        }
    });

    // Create wrapper for the entire page
    const wrapper = document.createElement('div');
    wrapper.className = 'paper-format-wrapper';

    // Create paper-like container
    const paperContainer = document.createElement('div');
    paperContainer.className = 'paper-format-container';
    applyConfigStyles(paperContainer, 'paper');

    // Create ad container if ad moving is enabled
    let adContainer;
    if (PaperFormatConfig.ads.moveAds) {
        adContainer = document.createElement('div');
        adContainer.className = 'paper-format-ad-container';
        applyConfigStyles(adContainer, 'ad-container');
    }

    // Clone the main content
    const contentClone = mainContent.cloneNode(true);

    // Process ads if enabled
    const ads = [];
    if (PaperFormatConfig.ads.moveAds) {
        contentClone.querySelectorAll('*').forEach(elem => {
            if (isAdElement(elem)) {
                ads.push(elem.cloneNode(true));
                elem.style.display = 'none';
            }
        });
    }

    // Set up the new layout
    paperContainer.appendChild(contentClone);
    wrapper.appendChild(paperContainer);

    // Add ads to ad container if we found any
    if (PaperFormatConfig.ads.moveAds && ads.length > 0) {
        ads.forEach(ad => adContainer.appendChild(ad));
        wrapper.appendChild(adContainer);
    }

    // Add the wrapper to the page
    document.body.insertBefore(wrapper, document.body.firstChild);
}

// Function to find the main content of the article
function findMainContent() {
    const contentSelectors = PaperFormatConfig.sites.articleSelectors;

    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) return element;
    }

    // Fallback: look for the largest text container
    let maxTextLength = 0;
    let bestContainer = null;

    document.querySelectorAll('div, section').forEach(container => {
        const textLength = container.innerText.length;
        if (textLength > maxTextLength && !isAdElement(container)) {
            maxTextLength = textLength;
            bestContainer = container;
        }
    });

    return bestContainer;
}

// Listen for configuration updates
window.addEventListener('paperFormatConfigUpdated', (event) => {
    // Reformat the page with new configuration
    formatPage();
});

// Run the formatter when the page loads
document.addEventListener('DOMContentLoaded', formatPage);
// Also run after a short delay to catch dynamic content
setTimeout(formatPage, 1000); 