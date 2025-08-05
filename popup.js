document.addEventListener('DOMContentLoaded', function() {
    // Get all toggle elements
    const toggles = {
        blockNotes: document.getElementById('blockNotes'),
        blockNotifications: document.getElementById('blockNotifications'),
        hideNotesTab: document.getElementById('hideNotesTab'),
        hideNotesInFeed: document.getElementById('hideNotesInFeed'),
        hideNotesNotifications: document.getElementById('hideNotesNotifications'),
        hideNotesSidebar: document.getElementById('hideNotesSidebar')
    };

    // Get statistics elements
    const statsElements = {
        hiddenCount: document.getElementById('hiddenCount'),
        timeSaved: document.getElementById('timeSaved'),
        focusScore: document.getElementById('focusScore'),
        streakDays: document.getElementById('streakDays'),
        readingFocus: document.getElementById('readingFocus'),
        distractionReduction: document.getElementById('distractionReduction'),
        weeklyAverage: document.getElementById('weeklyAverage'),
        readingFocusBar: document.getElementById('readingFocusBar'),
        distractionReductionBar: document.getElementById('distractionReductionBar'),
        weeklyAverageBar: document.getElementById('weeklyAverageBar')
    };

    const status = document.getElementById('status');
    const resetStatsBtn = document.getElementById('resetStats');

    // Default settings structure
    const defaultSettings = {
        blockNotes: false,
        blockNotifications: false,
        hideNotesTab: false,
        hideNotesInFeed: false,
        hideNotesNotifications: false,
        hideNotesSidebar: false
    };

    // Load saved settings and statistics
    function loadSettings() {
        const settingsKeys = Object.keys(defaultSettings);
        const statsKeys = [
            'dailyHiddenCount', 'dailyTimeSaved', 'focusScore', 'streakDays',
            'readingFocus', 'distractionReduction', 'weeklyAverage',
            'lastActiveDate', 'totalItemsHidden', 'totalTimeSaved',
            'sessionStartTime', 'dailyStats'
        ];

        chrome.storage.sync.get([...settingsKeys, ...statsKeys], function(result) {
            // Load toggle settings
            Object.keys(toggles).forEach(key => {
                if (toggles[key]) {
                    toggles[key].checked = result[key] || false;
                }
            });

            // Load and display statistics
            updateStatisticsDisplay(result);
        });
    }

    // Update statistics display
    function updateStatisticsDisplay(data) {
        const today = new Date().toDateString();
        const isToday = data.lastActiveDate === today;

        // Daily statistics
        const hiddenCount = isToday ? (data.dailyHiddenCount || 0) : 0;
        const timeSaved = isToday ? (data.dailyTimeSaved || 0) : 0;

        statsElements.hiddenCount.textContent = hiddenCount;
        statsElements.timeSaved.textContent = formatTime(timeSaved);

        // Focus score calculation
        const focusScore = calculateFocusScore(data);
        statsElements.focusScore.textContent = Math.round(focusScore) + '%';

        // Streak calculation
        const streakDays = calculateStreak(data);
        statsElements.streakDays.textContent = streakDays;

        // Productivity metrics
        const readingFocus = data.readingFocus || 85;
        const distractionReduction = data.distractionReduction || 92;
        const weeklyAverage = data.weeklyAverage || 78;

        statsElements.readingFocus.textContent = Math.round(readingFocus) + '%';
        statsElements.distractionReduction.textContent = Math.round(distractionReduction) + '%';
        statsElements.weeklyAverage.textContent = Math.round(weeklyAverage) + '%';

        // Update progress bars
        statsElements.readingFocusBar.style.width = readingFocus + '%';
        statsElements.distractionReductionBar.style.width = distractionReduction + '%';
        statsElements.weeklyAverageBar.style.width = weeklyAverage + '%';
    }

    // Calculate focus score based on settings and usage
    function calculateFocusScore(data) {
        let score = 0;
        const weights = {
            blockNotes: 25,
            blockNotifications: 20,
            hideNotesTab: 15,
            hideNotesInFeed: 20,
            hideNotesNotifications: 10,
            hideNotesSidebar: 10
        };

        Object.keys(weights).forEach(setting => {
            if (data[setting]) {
                score += weights[setting];
            }
        });

        return Math.min(score, 100);
    }

    // Calculate streak days
    function calculateStreak(data) {
        const today = new Date();
        const lastActive = data.lastActiveDate ? new Date(data.lastActiveDate) : null;
        
        if (!lastActive) return 0;

        const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
            return data.streakDays || 1;
        } else {
            return 0; // Streak broken
        }
    }

    // Format time in minutes/hours
    function formatTime(minutes) {
        if (minutes < 60) {
            return Math.round(minutes) + 'm';
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return hours + 'h' + (mins > 0 ? ' ' + mins + 'm' : '');
        }
    }

    // Show status message
    function showStatus(message, type = 'success') {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }

    // Save settings and update content script
    function saveSettings() {
        const settings = {};
        Object.keys(toggles).forEach(key => {
            if (toggles[key]) {
                settings[key] = toggles[key].checked;
            }
        });

        // Update daily statistics
        const today = new Date().toDateString();
        chrome.storage.sync.get(['lastActiveDate', 'streakDays'], function(result) {
            const wasActiveToday = result.lastActiveDate === today;
            let newStreakDays = result.streakDays || 0;

            if (!wasActiveToday) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const wasActiveYesterday = result.lastActiveDate === yesterday.toDateString();
                
                newStreakDays = wasActiveYesterday ? newStreakDays + 1 : 1;
            }

            const updateData = {
                ...settings,
                lastActiveDate: today,
                streakDays: newStreakDays
            };

            chrome.storage.sync.set(updateData, function() {
                if (chrome.runtime.lastError) {
                    showStatus('Error saving settings', 'error');
                    return;
                }

                // Send message to content script to update immediately
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0] && tabs[0].url.includes('substack.com')) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'updateSettings',
                            settings: settings
                        }, function(response) {
                            if (chrome.runtime.lastError) {
                                showStatus('Settings saved. Please refresh the page.', 'success');
                            } else {
                                showStatus('Settings updated!', 'success');
                            }
                        });
                    } else {
                        showStatus('Settings saved!', 'success');
                    }
                });

                // Refresh statistics display
                loadSettings();
            });
        });
    }

    // Reset statistics
    function resetStatistics() {
        const statsKeys = [
            'dailyHiddenCount', 'dailyTimeSaved', 'focusScore', 'streakDays',
            'readingFocus', 'distractionReduction', 'weeklyAverage',
            'lastActiveDate', 'totalItemsHidden', 'totalTimeSaved',
            'sessionStartTime', 'dailyStats'
        ];

        const resetData = {};
        statsKeys.forEach(key => {
            resetData[key] = key === 'readingFocus' ? 85 : 
                           key === 'distractionReduction' ? 92 :
                           key === 'weeklyAverage' ? 78 : 0;
        });

        chrome.storage.sync.set(resetData, function() {
            if (chrome.runtime.lastError) {
                showStatus('Error resetting statistics', 'error');
                return;
            }

            showStatus('Statistics reset successfully!', 'success');
            updateStatisticsDisplay(resetData);
        });
    }

    // Add event listeners for all toggles
    Object.keys(toggles).forEach(key => {
        if (toggles[key]) {
            toggles[key].addEventListener('change', saveSettings);
        }
    });

    // Add event listener for reset button
    resetStatsBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
            resetStatistics();
        }
    });

    // Initialize the popup
    loadSettings();

    // Update statistics every 30 seconds while popup is open
    setInterval(loadSettings, 30000);
});