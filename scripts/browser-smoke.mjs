import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(error.message));

try {
  await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#titleLanguage').count(), 1, 'First launch shows the illustrated title and language selector');
  await page.locator('#titleLanguage').selectOption('cs');
  await page.locator('.tutorial-step-image').waitFor();
  assert.equal(await page.locator('.tutorial-step-image').count(), 1, 'Language selection opens the tutorial');
  for (let step = 0; step < 4; step++) await page.locator('button[data-tutorial-step="1"]').click();
  assert.match(await page.locator('#app').innerText(), /Rozumím, hrát/, 'Tutorial has a final confirmation step');
  await page.locator('button[data-tutorial-step="1"]').click();
  await page.locator('#app .hero').waitFor();
  assert.match(await page.locator('#app h1').innerText(), /Předveď to\./, 'Czech home screen renders');

  const homeImagesLoaded = await page.locator('.hero-stage img').evaluateAll((imgs) =>
    imgs.length === 1 && imgs[0].alt.includes('Sharades characters') && imgs.every((img) => img.complete && img.naturalWidth > 0));
  assert.equal(homeImagesLoaded, true, 'Home character SVGs load');

  await page.locator('#langBtn').click();
  assert.match(await page.locator('#app h1').innerText(), /Act it out\./, 'English home screen renders');
  await page.locator('#langBtn').click();

  await page.locator('[data-action="modes"]').click();
  assert.equal(await page.locator('.mode-option').count(), 7, 'All seven game modes are available');
  await page.locator('[data-mode="teams"]').click();
  assert.match(await page.locator('#app').innerText(), /Souboj týmů/, 'Team mode can be selected');
  await page.locator('#homeBtn').click();

  await page.locator('[data-screen="tutorial"]').click();
  assert.match(await page.locator('.section-title').innerText(), /1 \/ 5/, 'Tutorial starts on its first step');
  for (let i = 0; i < 5; i++) {
    const image = page.locator('.tutorial-step-image');
    const loaded = await image.evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; });
    assert.equal(loaded, true, `Tutorial image ${i + 1} loads`);
    if (i < 4) await page.locator('button[data-tutorial-step="1"]').click();
  }
  await page.locator('[data-action="skip-tutorial"]').click();

  await page.locator('[data-screen="players"]').click();
  await page.locator('#playerName').fill('Browser Test');
  await page.locator('[data-action="add-player"]').click();
  assert.equal(await page.locator('.player .name').filter({ hasText: 'Browser Test' }).count(), 1, 'A player can be added');
  await page.locator('#homeBtn').click();

  await page.locator('[data-screen="avatars"]').click();
  await page.locator('[data-pick-avatar="robot"]').click();
  assert.match(await page.locator('.select-card.selected img').first().getAttribute('src'), /avatar-robot\.svg/, 'Avatar selection saves to a player');
  await page.locator('#homeBtn').click();

  await page.locator('[data-screen="ai"]').click();
  await page.locator('#aiTopic').fill('Zvířata');
  await page.locator('[data-action="generate-local"]').click();
  assert.equal(await page.locator('[data-generated-index]').count(), 10, 'Local word generator creates the requested number of suggestions');
  await page.locator('[data-action="add-generated"]').click();
  assert.equal(await page.locator('#customText').inputValue().then(v => v.split('\n').filter(Boolean).length), 10, 'Generated suggestions can be added to custom words');
  await page.locator('#homeBtn').click();

  await page.locator('[data-screen="achievements"]').click();
  assert.equal(await page.locator('.feature-row').count(), 5, 'Achievements screen renders five achievements');
  await page.locator('#homeBtn').click();
  await page.locator('[data-screen="offline"]').click();
  assert.equal(await page.locator('.feature-row').count(), 3, 'Offline status screen renders its checks');
  await page.locator('#homeBtn').click();

  await page.locator('[data-action="modes"]').click();
  await page.locator('[data-mode="teams"]').click();
  await page.locator('[data-category="Zvířata"]').click();
  await page.locator('[data-action="begin"]').click();
  assert.equal(await page.locator('#timeText').innerText(), '30', 'A round starts with the selected timer');
  assert.equal(await page.locator('#wordText').innerText(), '••••••', 'Word is hidden before reveal');
  await page.locator('#revealWord').click();
  assert.notEqual(await page.locator('#wordText').innerText(), '••••••', 'Word reveal works');
  await page.locator('[data-action="correct"]').click();
  assert.equal(await page.locator('.score-row .score').first().innerText(), '1', 'Correct guess increments the team score');

  page.on('dialog', (dialog) => dialog.accept());
  for (let turn = 0; turn < 6; turn++) {
    if (await page.locator('[data-action="end"]').count()) {
      await page.locator('[data-action="end"]').click();
    }
    await page.locator('[data-action="next-turn"]').waitFor();
    if (turn < 5) {
      await page.locator('[data-action="next-turn"]').click();
      await page.locator('[data-action="end"]').waitFor();
    } else {
      await page.locator('[data-action="next-turn"]').click();
    }
  }
  assert.equal(await page.locator('.scoreboard .score-row').count(), 2, 'Final scoreboard renders both teams');
  assert.equal(runtimeErrors.length, 0, `No uncaught browser errors: ${runtimeErrors.join('; ')}`);
  console.log('Interactive browser smoke test passed: language toggle, assets, tutorial, player creation, avatar selection, local word generation, achievements, offline screen, word reveal, scoring, and round progression.');
} finally {
  await browser.close();
}
