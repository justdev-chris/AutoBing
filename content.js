// content.js - with QUERIES filled in
(function () {
  // Always log immediately so we can detect if the script is injected at all
  console.log("AutoBing content script loaded (injected).");
  // Global marker for manual checks from page console
  window.__AutoBing_Installed = true;

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  let debug = false;

  // Load debug setting from storage
  chrome.storage.local.get("debug", (data)=>{
    debug = data.debug || false;
    if(debug) console.log("AutoBing Debug Mode: ON");
  });

  const QUERIES = [
    "best productivity apps 2025",
    "how to learn JavaScript fast",
    "healthy dinner recipes for two",
    "what is quantum computing explained",
    "top travel destinations in Europe",
    "how to improve sleep quality",
    "beginner yoga routine at home",
    "how to start a blog in 2025",
    "weather today New York",
    "latest electric cars 2025",
    "how to invest in index funds",
    "tips for remote work productivity",
    "simple meditation techniques",
    "how to fix slow macbook",
    "how to bake sourdough starter",
    "how to create a resume that stands out",
    "what is machine learning",
    "best online courses for data science",
    "how to set up a home office",
    "how to prepare for a job interview",
    "how to learn guitar chords",
    "how to make cold brew coffee",
    "how to optimize website SEO",
    "how to clean a mechanical keyboard",
    "how to create a budget spreadsheet",
    "how to practice public speaking",
    "how to grow indoor plants",
    "how to start freelancing",
    "how to debug JavaScript errors",
    "how to set up git and GitHub",
    "how to remove background from image",
    "what is serverless computing",
    "how to improve handwriting",
    "how to build a habit tracker",
    "how to do effective note taking",
    "how to learn Python for web dev",
    "top documentaries to watch 2025",
    "how to create a portfolio website",
    "how to write a cover letter",
    "how to plan a weekend getaway",
    "how to do a deep clean of house",
    "how to study for exams effectively",
    "how to build a simple todo app",
    "how to make homemade pasta",
    "how to optimize battery life on phone",
    "how to practice mindfulness daily",
    "beginner friendly coding projects",
    "how to troubleshoot wifi issues",
    "how to make a podcast",
    "how to design a logo for free",
    "how to package and ship items safely",
    "how to create a YouTube channel",
    "how to grow tomatoes in containers",
    "how to negotiate a salary increase",
    "how to build an email list",
    "what is blockchain explained simply",
    "how to format a hard drive safely",
    "how to plan a healthy weekly menu",
    "simple home workout routines"
  ];

  async function typeLikeHuman(input, text){
    if(debug) console.log("Typing query:", text);
    try {
      input.focus();
      // Some sites reject direct .value assignment — try using input.value first
      input.value = "";
      for(let char of text){
        input.value += char;
        input.dispatchEvent(new Event("input",{bubbles:true}));
        await sleep(100 + Math.random()*100);
      }
      await sleep(300);
      if(debug) console.log("Submitting query...");
      // Dispatch enter key events to submit
      input.dispatchEvent(new KeyboardEvent('keydown', {key:"Enter", bubbles:true}));
      input.dispatchEvent(new KeyboardEvent('keyup', {key:"Enter", bubbles:true}));
    } catch (e) {
      console.error("typeLikeHuman error:", e);
    }
  }

  async function waitForInput(){
    while(true){
      // Cover common Bing input selectors; adjust if Bing updates markup
      let input = document.querySelector('input[name="q"], input[aria-label="Enter your search term"], input[type="search"]');
      if(input){
        if(debug) console.log("Found search input!");
        return input;
      }
      if(debug) console.log("Waiting for search input...");
      await sleep(200);
    }
  }

  async function runAutomation(){
    while(true){
      const status = await new Promise(r=>{
        chrome.runtime.sendMessage({action:"status"}, response=>{
          // Defensive: handle undefined response
          r(response && response.running);
        });
      });

      if(!status){
        await sleep(500);
        continue;
      }

      const input = await waitForInput();
      const query = QUERIES[Math.floor(Math.random()*QUERIES.length)];
      await sleep(500 + Math.random()*500);
      await typeLikeHuman(input, query);
      if(debug) console.log("Waiting 5 seconds before next search...");
      await sleep(5000);
    }
  }

  // Start the automation loop
  runAutomation().catch(e => console.error("AutoBing runAutomation error:", e));
})();
