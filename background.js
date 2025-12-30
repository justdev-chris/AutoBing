// background.js - ensure content script gets injected on Start and always responds
let running = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("background: received message", msg);

  if (msg.action === "start") {
    running = true;
    console.log("background: started");

    // Inject the content script into any open Bing tabs.
    // Requires "scripting" permission and host_permissions for bing in manifest.json.
    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("background: tabs.query error:", chrome.runtime.lastError.message);
        return;
      }
      for (const tab of tabs) {
        try {
          if (!tab.url) continue;
          if (tab.url.includes("bing.com")) {
            chrome.scripting.executeScript(
              { target: { tabId: tab.id }, files: ["content.js"] },
              () => {
                if (chrome.runtime.lastError) {
                  console.error("background: executeScript error for tab", tab.id, chrome.runtime.lastError.message);
                } else {
                  console.log("background: injected content.js into tab", tab.id, tab.url);
                }
              }
            );
          }
        } catch (e) {
          console.error("background: injection exception", e);
        }
      }
    });
  }

  if (msg.action === "stop") {
    running = false;
    console.log("background: stopped");
  }

  // Always respond so sendMessage callbacks succeed
  sendResponse({ running });

  // No async sendResponse later, so we don't return true.
});
