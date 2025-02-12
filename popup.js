document.addEventListener("DOMContentLoaded", function () {
    let intervalInput = document.getElementById("interval");
    let contextIdInput = document.getElementById("contextId");
    let watcherToggle = document.getElementById("watcherToggle");
    let statusMessage = document.getElementById("status");

    // Load saved values
    chrome.storage.sync.get(["interval", "contextId", "watcherEnabled"], (result) => {
        intervalInput.value = result.interval || 15;
        contextIdInput.value = result.contextId || "";
        watcherToggle.checked = result.watcherEnabled ?? true;
    });

    // Save new values
    document.getElementById("save").addEventListener("click", function () {
        let interval = parseInt(intervalInput.value);
        let contextId = contextIdInput.value.trim();
        let watcherEnabled = watcherToggle.checked;

        if (interval < 1) {
            alert("Interval must be at least 1 minute.");
            return;
        }
        if (!contextId) {
            alert("Context ID cannot be empty.");
            return;
        }

        chrome.storage.sync.set({ interval, contextId, watcherEnabled }, () => {
            chrome.alarms.clear("openTripletex", () => {
                chrome.alarms.create("openTripletex", { periodInMinutes: interval });
                statusMessage.textContent = "Settings updated successfully!";
                statusMessage.style.display = "block";
                setTimeout(() => { statusMessage.style.display = "none"; }, 3000);
            });
        });
    });
});
