// Substack Notes Blocker Content Script
(function() {
    'use strict';

    let settings = {
        blockNotes: false,
        blockNotifications: false
    };

    // CSS selectors for Substack elements (these may need updates as Substack changes their UI)
    const SELECTORS = {
        // Notes feed selectors - multiple possible selectors as Substack UI varies
        notesFeed: [
            '[data-testid="notes-feed"]',
            '.notes-feed',
            '[aria-label*="notes" i]',
            '[class*="notes" i][class*="feed" i]',
            'div[class*="notes"]',
            // Navigation links to notes
            'a[href*="/notes"]',
            'a[href*="notes"]',
            // Notes sections in sidebar or main content
            'section[class*="notes" i]',
            'div[data-component*="notes" i]'
        ],
        
        // Notification bell selectors
        notifications: [
            '[data-testid="notification-bell"]',
            '[data-testid="notifications"]',
            '.notification-bell',
            '.notifications-bell',
            '[aria-label*="notification" i]',
            '[class*="notification" i][class*="bell" i]',
            'button[class*="notification" i]',
            // Bell icons
            'svg[class*="bell" i]',
            '[data-component*="notification" i]',
            // Notification counters/badges
            '.notification-badge',
            '.notification-count'
        ]
    };

    // Function to hide elements matching selectors
    function hideElements(selectors, hide = true) {
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        element.style.display = hide ? 'none' : '';
                        element.style.visibility = hide ? 'hidden' : '';
                        // Add a class to track our modifications
                        if (hide) {
                            element.classList.add('substack-blocker-hidden');
                        } else {
                            element.classList.remove('substack-blocker-hidden');
                        }
                    }
                });
            } catch (e) {
                // Ignore invalid selectors
                console.debug('Substack Notes Blocker: Invalid selector:', selector);
            }
        });
    }

    // Function to apply current settings
    function applySettings() {
        // Handle notes feed
        hideElements(SELECTORS.notesFeed, settings.blockNotes);
        
        // Handle notifications
        hideElements(SELECTORS.notifications, settings.blockNotifications);

        // Also hide any parent containers that might be empty now
        if (settings.blockNotes || settings.blockNotifications) {
            // Find and hide empty navigation sections
            const navSections = document.querySelectorAll('nav, .navigation, [class*="nav" i]');
            navSections.forEach(nav => {
                const visibleChildren = Array.from(nav.children).filter(child => {
                    const style = window.getComputedStyle(child);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });
                
                if (visibleChildren.length === 0 && nav.textContent.trim() === '') {
                    nav.style.display = settings.blockNotes || settings.blockNotifications ? 'none' : '';
                }
            });
        }
    }

    // Function to restore all hidden elements
    function restoreElements() {
        const hiddenElements = document.querySelectorAll('.substack-blocker-hidden');
        hiddenElements.forEach(element => {
            element.style.display = '';
            element.style.visibility = '';
            element.classList.remove('substack-blocker-hidden');
        });
    }

    // Load settings and apply them
    function loadAndApplySettings() {
        chrome.storage.sync.get(['blockNotes', 'blockNotifications'], function(result) {
            settings.blockNotes = result.blockNotes || false;
            settings.blockNotifications = result.blockNotifications || false;
            applySettings();
        });
    }

    // Observer to handle dynamically loaded content
    const observer = new MutationObserver(function(mutations) {
        let shouldReapply = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any new nodes contain elements we want to hide
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const hasNotesContent = SELECTORS.notesFeed.some(selector => {
                            try {
                                return node.matches && node.matches(selector) || node.querySelector && node.querySelector(selector);
                            } catch (e) {
                                return false;
                            }
                        });
                        
                        const hasNotificationContent = SELECTORS.notifications.some(selector => {
                            try {
                                return node.matches && node.matches(selector) || node.querySelector && node.querySelector(selector);
                            } catch (e) {
                                return false;
                            }
                        });
                        
                        if (hasNotesContent || hasNotificationContent) {
                            shouldReapply = true;
                        }
                    }
                });
            }
        });
        
        if (shouldReapply) {
            // Debounce the reapplication
            clearTimeout(observer.timeout);
            observer.timeout = setTimeout(applySettings, 100);
        }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateSettings') {
            settings = request.settings;
            applySettings();
            sendResponse({success: true});
        }
    });

    // Initialize
    function init() {
        // Load and apply settings initially
        loadAndApplySettings();
        
        // Start observing for dynamic content
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also reapply settings when page visibility changes (in case of SPA navigation)
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                setTimeout(applySettings, 500);
            }
        });
        
        // Handle potential SPA navigation
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                setTimeout(applySettings, 1000);
            }
        }).observe(document, {subtree: true, childList: true});
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();