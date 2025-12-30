let running = false;
let index = 0;
let timer = null;

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
  if (msg.action === "start" && !running) {
    running = true;
    index = 0;
    loop();
  }

  if (msg.action === "stop") {
    running = false;
    clearTimeout(timer);
  }
});

function loop() {
  if (!running) return;

  const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];

  chrome.tabs.create(
    { url: "https://www.bing.com", active: true },
    (tab) => {
      chrome.storage.local.set({ currentQuery: query });
    }
  );

  timer = setTimeout(loop, 5000); // wait 5 seconds
}
