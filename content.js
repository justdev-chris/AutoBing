function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function typeLikeHuman(input, text) {
  input.value = "";
  input.focus();

  for (let char of text) {
    input.value += char;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(100 + Math.random() * 120); // human-ish
  }

  await sleep(300);
  input.form.submit();
}

chrome.storage.local.get("currentQuery", async (data) => {
  if (!data.currentQuery) return;

  const input = document.querySelector('input[name="q"]');
  if (!input) return;

  await sleep(800); // wait for page load feel
  typeLikeHuman(input, data.currentQuery);
});
