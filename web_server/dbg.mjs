import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox','--disable-dev-shm-usage'],
});
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: '+e.message.slice(0,150)));
page.on('response', r => { if (r.status()>=400) errs.push(r.status()+': '+r.url().slice(0,120)); });
await page.goto('http://127.0.0.1:8083/en/book/Vin-ii-b', {waitUntil:'load', timeout:30000});
// force Myanmar script like a user who picked it
await page.evaluate(() => {
  try {
    const k = Object.keys(localStorage).find(k=>k.toLowerCase().includes('setting'));
    console.log('LSKEYS:', JSON.stringify(Object.keys(localStorage)));
  } catch(e) {}
  document.body.setAttribute('script','my');
});
await new Promise(r=>setTimeout(r,2500));
const info = await page.evaluate(() => {
  const first = document.querySelector('.book-entry .book-name');
  const sent = document.querySelector('.sentence-row .pali-text');
  const q = sel => { const el = document.querySelector(sel); if(!el) return null;
    return { text: el.textContent.slice(0,60), font: getComputedStyle(el).fontFamily }; };
  // check myanmar font load
  const fonts = [...document.fonts].map(f=>f.family+'/'+f.status);
  return { entry: q('.book-entry .book-name'), sent: q('.sentence-row .pali-text'),
           bodyScript: document.body.getAttribute('script'), fonts: fonts.slice(0,25) };
});
console.log(JSON.stringify(info, null, 1));
console.log('ERRS: '+(errs.join('\n')||'(none)'));
await browser.close();
