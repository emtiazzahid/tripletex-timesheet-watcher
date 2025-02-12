// Function to wait for #existingRows to exist
function waitForExistingRows() {
    return new Promise((resolve) => {
        const checkExist = setInterval(() => {
            let existingRows = document.getElementById("existingRows");
            if (existingRows) {
                clearInterval(checkExist);
                resolve(existingRows);
            }
        }, 500);
    });
}

async function checkStopwatch() {
    // Wait for #existingRows to load
    let existingRows = await waitForExistingRows();

    // Find the active stopwatch button
    let activeStopwatch = existingRows.querySelector(
        "button[aria-label='Start or stop time clock'].ui-state-active"
    );

    if (!activeStopwatch) {
        alert("No active stopwatch! Please start tracking.");
    }

    // If no alert conditions, return an empty response
    return { alert: null };
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkStopwatch") {
        checkStopwatch().then(response => {
            sendResponse(response);
        });
        return true; // Indicate we're using sendResponse asynchronously
    }
});