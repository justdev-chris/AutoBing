// content.js - more robust detection + verbose logging
(function () {
  console.log("AutoBing content script loaded (injected).");
  window.__AutoBing_Installed = true;

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  let debug = false;
  chrome.storage.local.get("debug", (data)=>{
    debug = data.debug || false;
    console.log("AutoBing: debug =", debug);
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

  // Helpers to log if debug is on
  function dlog(...args){
    if(debug) console.log("AutoBing:", ...args);
  }

  // Try to find the search target on the page.
  function findSearchTarget() {
    // Common input selectors
    const inputSelectors = [
      'input[name="q"]',
      'input[aria-label="Enter your search term"]',
      'input[type="search"]',
      'input[role="combobox"]',
      'input[aria-label*="Search"]'
    ];
    for (const sel of inputSelectors) {
      const el = document.querySelector(sel);
      if (el) return {type: "input", el, selector: sel};
    }

    // Some sites (or future Bing) use a contenteditable element (div) for search.
    // Look for common attributes or role combobox / searchbox
    const contentEditableSelectors = [
      '[contenteditable="true"]',
      'div[role="search"] [contenteditable="true"]',
      'div[role="combobox"][contenteditable="true"]',
      'div[role="search"] div[role="combobox"]'
    ];
    for (const sel of contentEditableSelectors) {
      const el = document.querySelector(sel);
      if (el) return {type: "contenteditable", el, selector: sel};
    }

    // Fallback: try first input on page
    const firstInput = document.querySelector('input');
    if (firstInput) return {type: "input", el: firstInput, selector: "input (first found)"};

    return null;
  }

  // Set text into input-type elements
  async function setInputValue(input, text){
    try {
      dlog("Setting input.value for", input, "text:", text);
      input.focus();
      input.value = "";
      // simulate typing (character by character) to better trigger frameworks
      for (let ch of text) {
        // For some frameworks, setRangeText + dispatchEvent is more reliable
        const start = input.value.length;
        input.setRangeText(ch, start, start, "end");
        input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ch }));
        await sleep(60 + Math.random()*80);
      }
      await sleep(200);
      dlog("Value set, final value:", input.value);
      return true;
    } catch (e) {
      console.error("setInputValue error:", e);
      return false;
    }
  }

  // Set text into contenteditable elements
  async function setContentEditable(el, text){
    try {
      dlog("Setting contenteditable for", el, "text:", text);
      el.focus();
      // Clear
      if ('innerText' in el) el.innerText = "";
      // Insert character by character, dispatch input events
      for (let ch of text) {
        // Insert text at end
        document.execCommand('insertText', false, ch);
        el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ch }));
        await sleep(60 + Math.random()*80);
      }
      await sleep(200);
      dlog("contenteditable set, final text:", el.innerText || el.textContent);
      return true;
    } catch (e) {
      console.error("setContentEditable error:", e);
      return false;
    }
  }

  // Try multiple ways to submit the search
  function trySubmit(el){
    dlog("Attempting to submit for element:", el);

    // 1) Try Enter key on the element
    try {
      el.dispatchEvent(new KeyboardEvent('keydown', {key: "Enter", bubbles: true}));
      el.dispatchEvent(new KeyboardEvent('keyup', {key: "Enter", bubbles: true}));
      dlog("Dispatched Enter key events.");
    } catch (e) { dlog("Enter dispatch error:", e); }

    // 2) Find a nearby submit button and click it
    try {
      let btn = document.querySelector('button[type="submit"], input[type="submit"], button[aria-label*="Search"], button[title*="Search"]');
      if (btn) {
        dlog("Clicking submit button:", btn);
        btn.click();
        return;
      }
    } catch (e) { dlog("Click submit button error:", e); }

    // 3) Submit the enclosing form if present
    try {
      let form = el.closest('form');
      if (form) {
        dlog("Submitting enclosing form:", form);
        form.submit();
        return;
      }
    } catch (e) { dlog("Form submit error:", e); }

    dlog("No explicit submit method worked; rely on Enter events.");
  }

  // High-level typing routine that supports both input and contenteditable
  async function typeLikeHumanGeneric(targetInfo, text){
    const {type, el} = targetInfo;
    let ok = false;
    if (type === "input") {
      ok = await setInputValue(el, text);
    } else if (type === "contenteditable") {
      ok = await setContentEditable(el, text);
    }

    await sleep(250 + Math.random()*100);
    if (!ok) console.warn("AutoBing: failed to set text into target, but will try to submit anyway.");
    trySubmit(el);
  }

  async function waitForTarget(){
    while (true) {
      const found = findSearchTarget();
      if (found) {
        dlog("Found search target:", found.selector, found.el);
        return found;
      }
      dlog("Waiting for search target...");
      await sleep(200);
    }
  }

  async function runAutomation(){
    while(true){
      const status = await new Promise(r=>{
        chrome.runtime.sendMessage({action:"status"}, response=>{
          r(response && response.running);
        });
      });

      if(!status){
        await sleep(500);
        continue;
      }

      dlog("Automation active: locating target...");
      const target = await waitForTarget();
      const query = QUERIES[Math.floor(Math.random()*QUERIES.length)];
      dlog("Selected query:", query);
      await sleep(300 + Math.random()*700);
      await typeLikeHumanGeneric(target, query);
      dlog("Typed one query, sleeping before next...");
      await sleep(5000 + Math.random()*3000);
    }
  }

  runAutomation().catch(e => console.error("AutoBing runAutomation error:", e));
})();
