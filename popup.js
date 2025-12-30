const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const debugCheckbox = document.getElementById("debug");

// Start/Stop messages
startBtn.onclick = () => chrome.runtime.sendMessage({action:"start"});
stopBtn.onclick = () => chrome.runtime.sendMessage({action:"stop"});

// Save debug setting
debugCheckbox.onchange = () => {
  const value = debugCheckbox.checked;
  chrome.storage.local.set({debug: value});
};

// Load saved debug setting
chrome.storage.local.get("debug", (data)=>{
  debugCheckbox.checked = data.debug || false;
});