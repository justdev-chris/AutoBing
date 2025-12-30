function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function typeLikeHuman(input, text){
  input.value="";
  input.focus();
  for(let char of text){
    input.value+=char;
    input.dispatchEvent(new Event("input",{bubbles:true}));
    await sleep(120 + Math.random()*100);
  }
  await sleep(300);
  input.form.submit();
}

async function run(){
  while(true){
    const query = localStorage.getItem("nextQuery");
    if(!query) { await sleep(500); continue; }
    const input = document.querySelector('input[name="q"]');
    if(!input){ await sleep(500); continue; }
    await sleep(800); // wait for page load feel
    await typeLikeHuman(input, query);
    await sleep(5000); // wait 5 seconds after search results
    localStorage.removeItem("nextQuery");
  }
}

run();