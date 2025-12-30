document.getElementById("start").onclick = () => {
  chrome.runtime.sendMessage({action:"start"});
};

document.getElementById("stop").onclick = () => {
  chrome.runtime.sendMessage({action:"stop"});
};
