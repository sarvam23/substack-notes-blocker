// Substack Focus - Enhanced Content Script
(function() {
    'use strict';

    let settings = {
        blockNotes: false,
        blockNotifications: false,
        hideNotesTab: false,
        hideNotesInFeed: false,
        hideNotesNotifications: false,
        hideNotesSidebar: false
    };

    let statistics = {
        sessionStartTime: Date.now(),
        itemsHiddenToday: 0,
        lastHideTime: 0
    };

    // Enhanced CSS selectors for Substack elements
    const SELECTORS = {
        // Notes feed selectors - comprehensive coverage
        notesFeed: [
            '[data-testid="notes-feed"]',
            '[data-testid="notes"]',
            '.notes-feed',
            '[aria-label*="notes" i]',
            '[class*="notes" i][class*="feed" i]',
            'div[class*="notes"]:not([class*="notification"])',
            'section[class*="notes" i]',
            '[data-component*="notes" i]',
            // Specific Substack patterns
            'div[data-testid*="note"]',
            '[role="feed"] div[class*="note"]'
        ],
        
        // Notes tab selectors
        notesTab: [
            'a[href*="/notes"]',
            'a[href*="notes"]',
            'nav a[href*="notes"]',
            '[role="navigation"] a[href*="notes"]',
            'button[aria-label*="notes" i]',
            '[data-testid*="notes-tab"]',
            '[data-testid*="notes-link"]'
        ],

        // Notes in feed (individual notes within content feed)
        notesInFeed: [
            '[data-testid*="note-item"]',
            '[class*="note-item"]',
            '[class*="note-card"]',
            'article[class*="note"]',
            'div[class*="note"][class*="post"]',
            '[data-component="note"]',
            // Posts that are specifically notes
            'article[data-post-type="note"]',
            'div[data-type="note"]'
        ],

        // Notes notifications
        notesNotifications: [
            '[data-testid*="notification"][class*="note"]',
            '[class*="notification"][class*="note"]',
            '[aria-label*="note notification" i]',
            'div[class*="notification"]:has([href*="notes"])',
            '[data-notification-type="note"]'
        ],

        // Notes sidebar elements
        notesSidebar: [
            '[class*="sidebar"] [class*="notes"]',
            '[class*="sidebar"] a[href*="notes"]',
            'aside [class*="notes"]',
            '[data-testid*="sidebar"] [class*="note"]',
            '[class*="right-rail"] [class*="notes"]',
            '[class*="side-panel"] [class*="notes"]'
        ],
        
        // All notification selectors
        allNotifications: [
            '[data-testid="notification-bell"]',
            '[data-testid="notifications"]',
            '.notification-bell',
            '.notifications-bell',
            '[aria-label*="notification" i]',
            '[class*="notification" i][class*="bell" i]',
            'button[class*="notification" i]',
            'svg[class*="bell" i]',
            '[data-component*="notification" i]',
            '.notification-badge',
            '.notification-count',
            '[data-testid*="notification"]',
            '[class*="notification-icon"]'
        ]
    };

    // Function to hide elements matching selectors with statistics tracking
    function hideElements(selectors, hide = true, category = 'general') {
        let hiddenCount = 0;
        
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element && !element.classList.contains('substack-focus-hidden')) {
                        const wasVisible = element.style.display !== 'none' && 
                                         element.style.visibility !== 'hidden' &&
                                         !element.classList.contains('substack-focus-hidden');
                        
                        if (hide) {
                            element.style.display = 'none';
                            element.style.visibility = 'hidden';
                            element.classList.add('substack-focus-hidden');
                            element.setAttribute('data-hidden-category', category);
                            
                            if (wasVisible) {
                                hiddenCount++;
                            }
                        } else {
                            element.style.display = '';
                            element.style.visibility = '';
                            element.classList.remove('substack-focus-hidden');
                            element.removeAttribute('data-hidden-category');
                        }
                    }
                });
            } catch (e) {
                console.debug('Substack Focus: Invalid selector:', selector);
            }
        });

        // Update statistics if items were hidden
        if (hide && hiddenCount > 0) {
            updateStatistics(hiddenCount, category);
        }

        return hiddenCount;
    }

    // Update statistics
    function updateStatistics(hiddenCount, category) {
        const today = new Date().toDateString();
        
        chrome.storage.sync.get([
            'dailyHiddenCount', 'totalItemsHidden', 'lastActiveDate',
            'dailyTimeSaved', 'totalTimeSaved', 'readingFocus', 
            'distractionReduction'
        ], function(result) {
            const isToday = result.lastActiveDate === today;
            const currentDailyCount = isToday ? (result.dailyHiddenCount || 0) : 0;
            const currentTotalCount = result.totalItemsHidden || 0;
            
            // Calculate time saved (estimated 2-5 seconds per hidden item)
            const timeSavedPerItem = category === 'notifications' ? 2 : 
                                   category === 'notes' ? 5 : 3;
            const timeSavedMinutes = (hiddenCount * timeSavedPerItem) / 60;
            
            const currentDailyTimeSaved = isToday ? (result.dailyTimeSaved || 0) : 0;
            const currentTotalTimeSaved = result.totalTimeSaved || 0;

            // Calculate productivity metrics
            const readingFocus = Math.min(95, (result.readingFocus || 85) + (hiddenCount * 0.5));
            const distractionReduction = Math.min(98, (result.distractionReduction || 92) + (hiddenCount * 0.3));

            const updateData = {
                dailyHiddenCount: currentDailyCount + hiddenCount,
                totalItemsHidden: currentTotalCount + hiddenCount,
                dailyTimeSaved: currentDailyTimeSaved + timeSavedMinutes,
                totalTimeSaved: currentTotalTimeSaved + timeSavedMinutes,
                lastActiveDate: today,
                readingFocus: readingFocus,
                distractionReduction: distractionReduction
            };

            chrome.storage.sync.set(updateData);
        });
    }

    // Function to apply current settings
    function applySettings() {
        let totalHidden = 0;

        // Apply main blocking settings
        if (settings.blockNotes) {
            totalHidden += hideElements(SELECTORS.notesFeed, true, 'notes');
        } else {
            hideElements(SELECTORS.notesFeed, false);
        }

        if (settings.blockNotifications) {
            totalHidden += hideElements(SELECTORS.allNotifications, true, 'notifications');
        } else {
            hideElements(SELECTORS.allNotifications, false);
        }

        // Apply selective blocking settings
        if (settings.hideNotesTab) {
            totalHidden += hideElements(SELECTORS.notesTab, true, 'notes-tab');
        } else {
            hideElements(SELECTORS.notesTab, false);
        }

        if (settings.hideNotesInFeed) {
            totalHidden += hideElements(SELECTORS.notesInFeed, true, 'notes-in-feed');
        } else {
            hideElements(SELECTORS.notesInFeed, false);
        }

        if (settings.hideNotesNotifications) {
            totalHidden += hideElements(SELECTORS.notesNotifications, true, 'notes-notifications');
        } else {
            hideElements(SELECTORS.notesNotifications, false);
        }

        if (settings.hideNotesSidebar) {
            totalHidden += hideElements(SELECTORS.notesSidebar, true, 'notes-sidebar');
        } else {
            hideElements(SELECTORS.notesSidebar, false);
        }

        // Clean up empty containers
        cleanupEmptyContainers();

        // Update body classes for CSS-based hiding
        updateBodyClasses();
    }

    // Clean up empty navigation sections and containers
    function cleanupEmptyContainers() {
        const containers = document.querySelectorAll('nav, .navigation, [class*="nav" i], [role="navigation"]');
        containers.forEach(container => {
            const visibleChildren = Array.from(container.children).filter(child => {
                const style = window.getComputedStyle(child);
                return style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       !child.classList.contains('substack-focus-hidden');
            });
            
            if (visibleChildren.length === 0 && container.textContent.trim() === '') {
                container.style.display = 'none';
                container.classList.add('substack-focus-hidden');
            }
        });
    }

    // Update body classes for CSS-based hiding
    function updateBodyClasses() {
        document.body.classList.toggle('substack-focus-block-notes', settings.blockNotes);
        document.body.classList.toggle('substack-focus-block-notifications', settings.blockNotifications);
        document.body.classList.toggle('substack-focus-hide-notes-tab', settings.hideNotesTab);
        document.body.classList.toggle('substack-focus-hide-notes-feed', settings.hideNotesInFeed);
        document.body.classList.toggle('substack-focus-hide-notes-notifications', settings.hideNotesNotifications);
        document.body.classList.toggle('substack-focus-hide-notes-sidebar', settings.hideNotesSidebar);
    }

    // Function to restore all hidden elements
    function restoreElements() {
        const hiddenElements = document.querySelectorAll('.substack-focus-hidden');
        hiddenElements.forEach(element => {
            element.style.display = '';
            element.style.visibility = '';
            element.classList.remove('substack-focus-hidden');
            element.removeAttribute('data-hidden-category');
        });

        // Remove body classes
        document.body.className = document.body.className.replace(/substack-focus-\w+/g, '').trim();
    }

    // Load settings and apply them
    function loadAndApplySettings() {
        const settingsKeys = Object.keys(settings);
        chrome.storage.sync.get(settingsKeys, function(result) {
            Object.keys(settings).forEach(key => {
                settings[key] = result[key] || false;
            });
            applySettings();
        });
    }

    // Enhanced observer for dynamic content
    const observer = new MutationObserver(function(mutations) {
        let shouldReapply = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if any new nodes contain elements we want to hide
                        const hasTargetContent = Object.values(SELECTORS).flat().some(selector => {
                            try {
                                return (node.matches && node.matches(selector)) || 
                                       (node.querySelector && node.querySelector(selector));
                            } catch (e) {
                                return false;
                            }
                        });
                        
                        if (hasTargetContent) {
                            shouldReapply = true;
                        }
                    }
                });
            }
        });
        
        if (shouldReapply) {
            // Debounce the reapplication
            clearTimeout(observer.timeout);
            observer.timeout = setTimeout(applySettings, 200);
        }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateSettings') {
            settings = { ...settings, ...request.settings };
            applySettings();
            sendResponse({success: true});
        } else if (request.action === 'getStatistics') {
            // Return current page statistics
            const hiddenElements = document.querySelectorAll('.substack-focus-hidden');
            const stats = {
                currentPageHidden: hiddenElements.length,
                categories: {}
            };
            
            hiddenElements.forEach(el => {
                const category = el.getAttribute('data-hidden-category') || 'general';
                stats.categories[category] = (stats.categories[category] || 0) + 1;
            });
            
            sendResponse(stats);
        }
    });

    // Initialize
    function init() {
        // Initialize session statistics
        statistics.sessionStartTime = Date.now();
        
        // Load and apply settings initially
        loadAndApplySettings();
        
        // Start observing for dynamic content
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                setTimeout(applySettings, 500);
            }
        });
        
        // Handle SPA navigation
        let lastUrl = location.href;
        const urlObserver = new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                setTimeout(() => {
                    loadAndApplySettings();
                }, 1000);
            }
        });
        
        urlObserver.observe(document, {subtree: true, childList: true});

        // Periodic reapplication for dynamic content
        setInterval(applySettings, 5000);
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        // Calculate session time and update statistics
        const sessionDuration = (Date.now() - statistics.sessionStartTime) / 1000 / 60; // minutes
        
        chrome.storage.sync.get(['totalSessionTime'], function(result) {
            chrome.storage.sync.set({
                totalSessionTime: (result.totalSessionTime || 0) + sessionDuration
            });
        });
    });

})();