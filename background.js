// Substack Notes Blocker Background Script
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // Set default settings on first install
        chrome.storage.sync.set({
            blockNotes: false,
            blockNotifications: false
        });
        
        console.log('Substack Notes Blocker installed successfully!');
    } else if (details.reason === 'update') {
        console.log('Substack Notes Blocker updated to version', chrome.runtime.getManifest().version);
    }
});

// Handle extension icon click (optional - mainly handled by popup)
chrome.action.onClicked.addListener(function(tab) {
    // This will only fire if no popup is set, but we have a popup
    // so this is just a fallback
    console.log('Extension icon clicked on tab:', tab.url);
});

// Listen for tab updates to ensure content script is working
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('substack.com')) {
        // Inject content script if needed (fallback)
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => {
            // Ignore errors - content script is probably already injected
            console.debug('Content script already injected or failed to inject:', err);
        });
    }
});

// Handle messages from content script or popup (if needed)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(['blockNotes', 'blockNotifications'], function(result) {
            sendResponse({
                blockNotes: result.blockNotes || false,
                blockNotifications: result.blockNotifications || false
            });
        });
        return true; // Indicates we will send a response asynchronously
    }
});