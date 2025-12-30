let running = false;

const QUERIES = [
  "technology news","space exploration","gaming updates","open source software",
  "computer graphics","javascript tips","python tutorials","linux basics",
  "cybersecurity","network protocols","AI research","machine learning basics",
  "robotics projects","computer hardware","operating systems",
  "web development","css layouts","html semantics","browser engines",
  "software testing","debugging techniques","game engines","3d rendering",
  "physics simulations","math puzzles","logic problems","data structures",
  "algorithms explained","cloud computing","docker containers",
  "virtual machines","computer history","programming languages",
  "functional programming","object oriented design","version control git",
  "continuous integration","software architecture","api design",
  "encryption basics","compression algorithms","image processing",
  "audio processing","file systems","memory management",
  "multithreading","performance optimization","compiler design"
];

chrome.runtime.onMessage.addListener((msg) => {
  if(msg.action==="start") running=true;
  if(msg.action==="stop") running=false;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if(running && tab.url.includes("bing.com") && changeInfo.status==="complete"){
    const query = QUERIES[Math.floor(Math.random()*QUERIES.length)];
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      func: (q) => { localStorage.setItem("nextQuery", q); }
    , args:[query]});
  }
});