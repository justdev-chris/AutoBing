// Lightweight popup.js - minimal logic for Start/Stop + Debug
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const debugCheckbox = document.getElementById("debug");
const statusSpan = document.getElementById("status") || null;

// Helper: promisify chrome.runtime.sendMessage
function sendMessageAsync(msg) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response) => {
      if (chrome.runtime.lastError) {
        console.error("popup sendMessage error:", chrome.runtime.lastError.message);
        resolve({ error: chrome.runtime.lastError.message });
      } else {
        resolve(response);
      }
    });
  });
}

// Helper: promisify chrome.storage.local.get
function storageGetAsync(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (data) => {
      if (chrome.runtime.lastError) {
        console.error("popup storage.get error:", chrome.runtime.lastError.message);
        resolve({});
      } else {
        resolve(data);
      }
    });
  });
}

// Helper: promisify chrome.storage.local.set
function storageSetAsync(obj) {
  return new Promise((resolve) => {
    chrome.storage.local.set(obj, () => {
      if (chrome.runtime.lastError) {
        console.error("popup storage.set error:", chrome.runtime.lastError.message);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function log(...args) {
  console.log("popup:", ...args);
  if (statusSpan) {
    // short status update in popup UI (if present)
    statusSpan.textContent = args.join(" ");
  }
}

async function updateUIFromState() {
  const data = await storageGetAsync(["debug"]);
  const debug = data.debug || false;
  debugCheckbox.checked = debug;
  log("debug loaded:", debug);

  // query background for runtime state
  const resp = await sendMessageAsync({ action: "status" });
  if (resp && resp.running !== undefined) {
    setRunningUI(Boolean(resp.running));
    log("background running:", resp.running);
  } else if (resp && resp.error) {
    log("status request error:", resp.error);
  } else {
    log("status: no response");
  }
}

function setRunningUI(running) {
  if (running) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    startBtn.classList && startBtn.classList.add("active");
  } else {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    startBtn.classList && startBtn.classList.remove("active");
  }
  if (statusSpan) statusSpan.textContent = running ? "Running" : "Stopped";
}

// Event handlers
startBtn.addEventListener("click", async () => {
  log("sending start");
  const resp = await sendMessageAsync({ action: "start" });
  if (resp && resp.running !== undefined) {
    setRunningUI(Boolean(resp.running));
    log("sendMessage response:", resp);
  } else {
    log("start: unexpected response", resp);
  }
});

stopBtn.addEventListener("click", async () => {
  log("sending stop");
  const resp = await sendMessageAsync({ action: "stop" });
  if (resp && resp.running !== undefined) {
    setRunningUI(Boolean(resp.running));
    log("sendMessage response:", resp);
  } else {
    log("stop: unexpected response", resp);
  }
});

debugCheckbox.addEventListener("change", async () => {
  const value = debugCheckbox.checked;
  const ok = await storageSetAsync({ debug: value });
  if (ok) {
    log("debug saved:", value);
  } else {
    log("debug save failed");
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Defensive: disable stop if elements missing
  if (!startBtn || !stopBtn || !debugCheckbox) {
    console.error("popup: missing UI elements (start/stop/debug).");
    return;
  }

  // set sensible default state until we query background
  setRunningUI(false);

  updateUIFromState().catch((e) => {
    console.error("popup init error:", e);
  });
});
