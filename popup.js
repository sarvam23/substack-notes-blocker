document.addEventListener('DOMContentLoaded', function() {
    const blockNotesToggle = document.getElementById('blockNotes');
    const blockNotificationsToggle = document.getElementById('blockNotifications');
    const status = document.getElementById('status');

    // Load saved settings
    chrome.storage.sync.get(['blockNotes', 'blockNotifications'], function(result) {
        blockNotesToggle.checked = result.blockNotes || false;
        blockNotificationsToggle.checked = result.blockNotifications || false;
    });

    // Show status message
    function showStatus(message, type = 'success') {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 2000);
    }

    // Save settings and update content script
    function saveSettings() {
        const settings = {
            blockNotes: blockNotesToggle.checked,
            blockNotifications: blockNotificationsToggle.checked
        };

        chrome.storage.sync.set(settings, function() {
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
        });
    }

    // Add event listeners
    blockNotesToggle.addEventListener('change', saveSettings);
    blockNotificationsToggle.addEventListener('change', saveSettings);
});