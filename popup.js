// Lightweight popup.js - single toggle + polling status
(() => {
  // Elements
  const toggleBtn = document.getElementById("toggle");
  const debugCheckbox = document.getElementById("debug");
  const statusSpan = document.getElementById("status");

  // Helpers to promisify chrome callbacks
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

  // UI update
  function setRunningUI(running) {
    if (running) {
      toggleBtn.textContent = "Stop";
      toggleBtn.dataset.running = "1";
      toggleBtn.classList.remove("disabled");
    } else {
      toggleBtn.textContent = "Start";
      toggleBtn.dataset.running = "0";
      toggleBtn.classList.remove("disabled");
    }
    statusSpan.textContent = `Status: ${running ? "Running" : "Stopped"}`;
  }

  async function updateFromBackground() {
    const resp = await sendMessageAsync({ action: "status" });
    if (resp && resp.running !== undefined) {
      setRunningUI(Boolean(resp.running));
      console.log("popup: status ->", resp.running);
    } else if (resp && resp.error) {
      console.warn("popup: status error ->", resp.error);
      statusSpan.textContent = `Status: Error`;
    } else {
      // no response
      console.warn("popup: no status response");
      statusSpan.textContent = `Status: Unknown`;
    }
  }

  // Toggle click handler
  async function handleToggleClick() {
    const running = toggleBtn.dataset.running === "1";
    toggleBtn.classList.add("disabled");
    try {
      if (running) {
        console.log("popup: sending stop");
        const resp = await sendMessageAsync({ action: "stop" });
        if (resp && resp.running !== undefined) setRunningUI(Boolean(resp.running));
        else console.warn("popup: stop unexpected response", resp);
      } else {
        console.log("popup: sending start");
        const resp = await sendMessageAsync({ action: "start" });
        if (resp && resp.running !== undefined) setRunningUI(Boolean(resp.running));
        else console.warn("popup: start unexpected response", resp);
      }
    } catch (e) {
      console.error("popup: toggle error", e);
    } finally {
      // re-enable (UI will reflect actual running state after next poll/update)
      toggleBtn.classList.remove("disabled");
    }
  }

  // Polling loop while popup is open
  let pollInterval = null;
  function startPolling() {
    if (pollInterval) return;
    pollInterval = setInterval(updateFromBackground, 1000); // every 1s
    // initial immediate check
    updateFromBackground();
  }
  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Init
  document.addEventListener("DOMContentLoaded", async () => {
    if (!toggleBtn || !debugCheckbox || !statusSpan) {
      console.error("popup: missing UI elements");
      return;
    }

    // Load debug setting
    const data = await storageGetAsync(["debug"]);
    const debug = data.debug || false;
    debugCheckbox.checked = debug;
    console.log("popup: debug loaded:", debug);

    // Sync initial running state from background
    await updateFromBackground();

    // Start polling for status while popup is open
    startPolling();

    // Event listeners
    toggleBtn.addEventListener("click", handleToggleClick);
    debugCheckbox.addEventListener("change", async () => {
      const value = debugCheckbox.checked;
      const ok = await storageSetAsync({ debug: value });
      if (ok) console.log("popup: debug saved:", value);
    });

    // Clear polling when popup unloads
    window.addEventListener("unload", stopPolling);
  });
})();
