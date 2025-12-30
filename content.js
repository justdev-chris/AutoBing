function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

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

async function typeLikeHuman(input, text){
  input.value = "";
  input.focus();
  for(let char of text){
    input.value += char;
    input.dispatchEvent(new Event("input",{bubbles:true}));
    await sleep(120 + Math.random()*100);
  }
  await sleep(300);
  input.form.submit();
}

async function waitForInput(){
  while(true){
    let input = document.querySelector('input[name="q"]');
    if(input) return input;
    await sleep(200); // check every 200ms
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

    const input = await waitForInput(); // wait until search bar exists
    const query = QUERIES[Math.floor(Math.random()*QUERIES.length)];
    await sleep(800); // page feel
    await typeLikeHuman(input, query);
    await sleep(5000); // wait 5s after results
  }
}

runAutomation();