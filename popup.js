// Improved popup.js with logging and lastError checks
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const debugCheckbox = document.getElementById("debug");

function sendAction(action) {
  console.log("Popup: sending action", action);
  chrome.runtime.sendMessage({ action }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Popup: sendMessage error:", chrome.runtime.lastError.message);
    } else {
      console.log("Popup: sendMessage response:", response);
    }
  });
}

// Start/Stop messages
startBtn.onclick = () => sendAction("start");
stopBtn.onclick = () => sendAction("stop");

// Save debug setting
debugCheckbox.onchange = () => {
  const value = debugCheckbox.checked;
  chrome.storage.local.set({ debug: value }, () => {
    if (chrome.runtime.lastError) {
      console.error("popup: storage.set error:", chrome.runtime.lastError.message);
    } else {
      console.log("popup: debug saved:", value);
    }
  });
};

// Load saved debug setting
chrome.storage.local.get("debug", (data) => {
  if (chrome.runtime.lastError) {
    console.error("popup: storage.get error:", chrome.runtime.lastError.message);
  } else {
    debugCheckbox.checked = data.debug || false;
    console.log("popup: debug loaded:", debugCheckbox.checked);
  }
});
