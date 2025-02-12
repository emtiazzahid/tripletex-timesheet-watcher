chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "openTripletex") {
        chrome.storage.sync.get(["contextId", "watcherEnabled"], (result) => {
            let contextId = result.contextId;
            let watcherEnabled = result.watcherEnabled ?? true; // Default to true if not set

            if (!watcherEnabled || !contextId) {
                console.log("Watcher is disabled or context ID is missing. Skipping update.");
                return; // Exit if the watcher is off or no contextId is set
            }

            let TRIPLETEX_URL = `https://tripletex.no/execute/updateHourlist?contextId=${contextId}`;

            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                let existingTab = tabs.find(tab => tab.url && tab.url.includes("tripletex.no/execute/updateHourlist"));

                if (existingTab) {
                    // If tab exists, activate it
                    chrome.tabs.update(existingTab.id, { active: true });
                    chrome.tabs.sendMessage(existingTab.id, { action: "checkStopwatch" }, (response) => {
                        if (response && response.alert) {
                            chrome.tabs.update(existingTab.id, { active: true });
                        }
                    });
                } else {
                    // If no tab exists, create a new one
                    chrome.tabs.create({ url: TRIPLETEX_URL }, (newTab) => {
                        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                            if (tabId === newTab.id && changeInfo.status === "complete") {
                                chrome.tabs.sendMessage(newTab.id, { action: "checkStopwatch" }, (response) => {
                                    if (response && response.alert) {
                                        chrome.tabs.update(newTab.id, { active: true });
                                    }
                                });
                                chrome.tabs.onUpdated.removeListener(listener);
                            }
                        });
                    });
                }
            });
        });
    }
});

// Set up alarm on startup
chrome.runtime.onStartup.addListener(() => {
    setupAlarm();
});

// Ensure alarm is set when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    setupAlarm();
});

// Function to create or clear alarm based on watcherEnabled
function setupAlarm() {
    chrome.storage.sync.get(["interval", "watcherEnabled"], (result) => {
        let interval = result.interval || 15;
        let watcherEnabled = result.watcherEnabled ?? true; // Default: Enabled

        chrome.alarms.clear("openTripletex", () => {
            if (watcherEnabled) {
                chrome.alarms.create("openTripletex", { periodInMinutes: interval });
            }
        });
    });
}
