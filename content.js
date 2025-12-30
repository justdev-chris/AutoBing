function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

let debug = false;

// Load debug setting from storage
chrome.storage.local.get("debug", (data)=>{
  debug = data.debug || false;
  if(debug) console.log("AutoBing Debug Mode: ON");
});

const QUERIES = [ /* same 50+ queries as before */ ];

async function typeLikeHuman(input, text){
  if(debug) console.log("Typing query:", text);
  input.focus();
  input.value = "";
  for(let char of text){
    input.value += char;
    input.dispatchEvent(new Event("input",{bubbles:true}));
    await sleep(100 + Math.random()*100);
  }
  await sleep(300);
  if(debug) console.log("Submitting query...");
  input.dispatchEvent(new KeyboardEvent('keydown', {key:"Enter", bubbles:true}));
  input.dispatchEvent(new KeyboardEvent('keyup', {key:"Enter", bubbles:true}));
}

async function waitForInput(){
  while(true){
    let input = document.querySelector('input[name="q"], input[aria-label="Enter your search term"]');
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
      chrome.runtime.sendMessage({action:"status"}, response=>r(response.running));
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

if(debug) console.log("AutoBing content script loaded");
runAutomation();