// Run with PLAYWRIGHT_BROWSERS_PATH configured and Playwright available.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const {webkit} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await webkit.launch();
try {
 for (const width of [1200,390]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5173');
  await page.getByRole('button',{name:'Kéo dây để mở thư; hoặc nhấn Enter',exact:true}).focus();
  await page.keyboard.press('Enter');
  await page.locator('.phase-reading').waitFor();
  const next=page.getByRole('button',{name:'Trang tiếp theo'});
  await next.click();
  await page.locator('.view-1').waitFor();
  await page.waitForTimeout(1000);
  if(width<760){await next.click();await page.locator('.view-2').waitFor();await page.waitForTimeout(1000);}
  await page.getByRole('button',{name:'Xem chỉ đường'}).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await next.click();await page.locator('.view-3').waitFor();
  await page.waitForTimeout(1000);
  assert.equal(await next.isDisabled(),true);
  await page.getByRole('button',{name:'Trang trước'}).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button',{name:'Xem lại từ đầu'}).click();
  await page.locator('.phase-sealed').waitFor();
  console.log(`WebKit ${width}px: open, next, map, close, previous, replay passed`);
  await page.close();
 }
} finally {await browser.close();}
