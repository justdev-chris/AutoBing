let running = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg.action === "start") running = true;
  if(msg.action === "stop") running = false;
  if(msg.action === "status") sendResponse({running});
});
