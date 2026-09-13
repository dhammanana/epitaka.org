import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message.slice(0,160)));
await page.goto('http://127.0.0.1:8083/my/book/Vin-ii-b', { waitUntil: 'networkidle0', timeout: 60000 });
// force Myanmar script (as if user picked Myanmar language)
await page.evaluate(() => {
  const raw = localStorage.getItem('epitaka_settings_v3') || '{}';
  const s = JSON.parse(raw);
  s.paliScript = 'my';
  localStorage.setItem('epitaka_settings_v3', JSON.stringify(s));
});
await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));
// open sidebar library
await page.evaluate(() => document.getElementById('toc-toggle-btn')?.click());
await new Promise(r => setTimeout(r, 2500));
const lib = await page.evaluate(() => {
  const els = [...document.querySelectorAll('.book-entry .book-name')].slice(0, 6);
  return els.map(el => ({ text: el.textContent.slice(0,40), font: getComputedStyle(el).fontFamily, marked: el.dataset.paliScript }));
});
console.log('LIBRARY:', JSON.stringify(lib, null, 1));
const groups = await page.evaluate(() => {
  const els = [...document.querySelectorAll('.book-nikaya-title')].slice(0, 4);
  return els.map(el => ({ text: el.textContent.slice(0,40), font: getComputedStyle(el).fontFamily, cls: el.className }));
});
console.log('GROUPS:', JSON.stringify(groups, null, 1));
// sidebar search
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('#sb-activity button')].find(b => b.textContent.includes('🔍'));
  btn?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.type('#sb-search-input', 'vinaya', { delay: 30 });
await new Promise(r => setTimeout(r, 4000));
const res = await page.evaluate(() => {
  const els = [...document.querySelectorAll('.pali-text')].filter(el =>
    el.closest('#sb-results-panel') || el.closest('#home-results-panel')).slice(0, 5);
  return els.map(el => ({ text: el.textContent.slice(0,60), marked: el.dataset.paliScript }));
});
console.log('SEARCH:', JSON.stringify(res, null, 1));
await page.screenshot({ path: '/tmp/my-sidebar.png' });
console.log('ERRORS:', errors.length ? errors.join(' | ') : '(none)');
await browser.close();
