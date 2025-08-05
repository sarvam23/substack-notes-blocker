// Substack Focus - Enhanced Background Script
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // Set comprehensive default settings on first install
        const defaultSettings = {
            // Main blocking features
            blockNotes: false,
            blockNotifications: false,
            
            // Selective blocking features
            hideNotesTab: false,
            hideNotesInFeed: false,
            hideNotesNotifications: false,
            hideNotesSidebar: false,
            
            // Statistics and metrics
            dailyHiddenCount: 0,
            totalItemsHidden: 0,
            dailyTimeSaved: 0,
            totalTimeSaved: 0,
            focusScore: 0,
            streakDays: 0,
            readingFocus: 85,
            distractionReduction: 92,
            weeklyAverage: 78,
            lastActiveDate: null,
            totalSessionTime: 0,
            installDate: new Date().toISOString(),
            
            // Weekly statistics for trend analysis
            weeklyStats: {},
            monthlyStats: {}
        };
        
        chrome.storage.sync.set(defaultSettings);
        console.log('Substack Focus installed successfully!');
        
        // Show welcome notification
        chrome.notifications.create('welcome', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Substack Focus Installed!',
            message: 'Click the extension icon to start improving your reading focus.'
        });
        
    } else if (details.reason === 'update') {
        console.log('Substack Focus updated to version', chrome.runtime.getManifest().version);
        
        // Migrate existing settings if needed
        migrateSettings();
    }
});

// Migrate settings from older versions
function migrateSettings() {
    chrome.storage.sync.get(null, function(data) {
        const updates = {};
        
        // Add new settings with defaults if they don't exist
        const newSettings = {
            hideNotesTab: false,
            hideNotesInFeed: false,
            hideNotesNotifications: false,
            hideNotesSidebar: false,
            readingFocus: 85,
            distractionReduction: 92,
            weeklyAverage: 78,
            weeklyStats: {},
            monthlyStats: {}
        };
        
        Object.keys(newSettings).forEach(key => {
            if (!(key in data)) {
                updates[key] = newSettings[key];
            }
        });
        
        if (Object.keys(updates).length > 0) {
            chrome.storage.sync.set(updates);
            console.log('Settings migrated:', updates);
        }
    });
}

// Handle extension icon click (fallback)
chrome.action.onClicked.addListener(function(tab) {
    console.log('Extension icon clicked on tab:', tab.url);
});

// Enhanced tab update listener for better content script injection
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('substack.com')) {
        // Ensure content script is working
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => {
            console.debug('Content script injection:', err.message);
        });
        
        // Update daily activity
        updateDailyActivity();
    }
});

// Update daily activity and statistics
function updateDailyActivity() {
    const today = new Date().toDateString();
    
    chrome.storage.sync.get(['lastActiveDate', 'dailyHiddenCount', 'dailyTimeSaved'], function(result) {
        if (result.lastActiveDate !== today) {
            // New day - reset daily counters but preserve history
            const updates = {
                lastActiveDate: today,
                dailyHiddenCount: 0,
                dailyTimeSaved: 0
            };
            
            // Store yesterday's stats if they exist
            if (result.lastActiveDate && (result.dailyHiddenCount > 0 || result.dailyTimeSaved > 0)) {
                const weekKey = getWeekKey(new Date(result.lastActiveDate));
                const monthKey = getMonthKey(new Date(result.lastActiveDate));
                
                chrome.storage.sync.get(['weeklyStats', 'monthlyStats'], function(stats) {
                    const weeklyStats = stats.weeklyStats || {};
                    const monthlyStats = stats.monthlyStats || {};
                    
                    // Update weekly stats
                    if (!weeklyStats[weekKey]) weeklyStats[weekKey] = { hiddenCount: 0, timeSaved: 0 };
                    weeklyStats[weekKey].hiddenCount += result.dailyHiddenCount || 0;
                    weeklyStats[weekKey].timeSaved += result.dailyTimeSaved || 0;
                    
                    // Update monthly stats
                    if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { hiddenCount: 0, timeSaved: 0 };
                    monthlyStats[monthKey].hiddenCount += result.dailyHiddenCount || 0;
                    monthlyStats[monthKey].timeSaved += result.dailyTimeSaved || 0;
                    
                    updates.weeklyStats = weeklyStats;
                    updates.monthlyStats = monthlyStats;
                    
                    chrome.storage.sync.set(updates);
                });
            } else {
                chrome.storage.sync.set(updates);
            }
        }
    });
}

// Helper functions for date keys
function getWeekKey(date) {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week}`;
}

function getMonthKey(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Calculate and update productivity metrics
function updateProductivityMetrics() {
    chrome.storage.sync.get([
        'weeklyStats', 'monthlyStats', 'totalItemsHidden', 'totalTimeSaved',
        'blockNotes', 'blockNotifications', 'hideNotesTab', 'hideNotesInFeed',
        'hideNotesNotifications', 'hideNotesSidebar'
    ], function(data) {
        const currentWeek = getWeekKey(new Date());
        const currentMonth = getMonthKey(new Date());
        
        const weeklyStats = data.weeklyStats || {};
        const monthlyStats = data.monthlyStats || {};
        
        // Calculate weekly average
        const recentWeeks = Object.keys(weeklyStats).slice(-4); // Last 4 weeks
        let weeklyTotal = 0;
        let weekCount = 0;
        
        recentWeeks.forEach(week => {
            if (weeklyStats[week] && weeklyStats[week].hiddenCount > 0) {
                weeklyTotal += Math.min(100, weeklyStats[week].hiddenCount * 2); // Cap at 100%
                weekCount++;
            }
        });
        
        const weeklyAverage = weekCount > 0 ? Math.round(weeklyTotal / weekCount) : 78;
        
        // Calculate reading focus based on settings and usage
        let readingFocus = 70; // Base score
        const settingsWeights = {
            blockNotes: 15,
            blockNotifications: 10,
            hideNotesTab: 8,
            hideNotesInFeed: 12,
            hideNotesNotifications: 5,
            hideNotesSidebar: 5
        };
        
        Object.keys(settingsWeights).forEach(setting => {
            if (data[setting]) {
                readingFocus += settingsWeights[setting];
            }
        });
        
        // Boost based on usage
        const totalHidden = data.totalItemsHidden || 0;
        const usageBoost = Math.min(15, Math.floor(totalHidden / 10)); // Up to 15% boost
        readingFocus = Math.min(98, readingFocus + usageBoost);
        
        // Calculate distraction reduction
        const baseDistraction = 85;
        const hiddenToday = data.dailyHiddenCount || 0;
        const distractionReduction = Math.min(98, baseDistraction + Math.floor(hiddenToday / 2));
        
        // Update metrics
        chrome.storage.sync.set({
            weeklyAverage: weeklyAverage,
            readingFocus: readingFocus,
            distractionReduction: distractionReduction
        });
    });
}

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(null, function(result) {
            sendResponse(result);
        });
        return true;
    } else if (request.action === 'updateProductivityMetrics') {
        updateProductivityMetrics();
        sendResponse({success: true});
        return true;
    } else if (request.action === 'getStatistics') {
        chrome.storage.sync.get([
            'dailyHiddenCount', 'totalItemsHidden', 'dailyTimeSaved', 'totalTimeSaved',
            'focusScore', 'streakDays', 'readingFocus', 'distractionReduction',
            'weeklyAverage', 'weeklyStats', 'monthlyStats'
        ], function(result) {
            sendResponse(result);
        });
        return true;
    }
});

// Periodic tasks
setInterval(() => {
    updateDailyActivity();
    updateProductivityMetrics();
}, 60000); // Every minute

// Weekly cleanup of old statistics
setInterval(() => {
    chrome.storage.sync.get(['weeklyStats', 'monthlyStats'], function(data) {
        const weeklyStats = data.weeklyStats || {};
        const monthlyStats = data.monthlyStats || {};
        
        // Keep only last 12 weeks of data
        const currentWeek = getWeekNumber(new Date());
        const currentYear = new Date().getFullYear();
        
        Object.keys(weeklyStats).forEach(weekKey => {
            const [year, week] = weekKey.split('-W');
            const weekNum = parseInt(week);
            const yearNum = parseInt(year);
            
            if (yearNum < currentYear - 1 || 
                (yearNum === currentYear && currentWeek - weekNum > 12)) {
                delete weeklyStats[weekKey];
            }
        });
        
        // Keep only last 6 months of data
        const currentMonth = new Date().getMonth() + 1;
        const currentYearNum = new Date().getFullYear();
        
        Object.keys(monthlyStats).forEach(monthKey => {
            const [year, month] = monthKey.split('-');
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            
            const monthsAgo = (currentYearNum - yearNum) * 12 + (currentMonth - monthNum);
            if (monthsAgo > 6) {
                delete monthlyStats[monthKey];
            }
        });
        
        chrome.storage.sync.set({
            weeklyStats: weeklyStats,
            monthlyStats: monthlyStats
        });
    });
}, 24 * 60 * 60 * 1000); // Daily cleanup

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
    updateDailyActivity();
    updateProductivityMetrics();
});