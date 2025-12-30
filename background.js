let running = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("background: received message", msg);

  if (msg.action === "start") {
    running = true;
    console.log("background: started");
  }

  if (msg.action === "stop") {
    running = false;
    console.log("background: stopped");
  }

  // Always respond with the current running state so callers' callbacks succeed
  sendResponse({ running });

  // No asynchronous response, so we don't need to return true.
});
