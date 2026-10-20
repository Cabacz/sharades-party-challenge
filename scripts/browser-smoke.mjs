import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined, args: process.env.CHROME_BIN ? ['--no-sandbox'] : [] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(error.message));

try {
  await page.goto('http://127.0.0.1:8080/', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('#titleLanguage').count(), 1, 'First launch shows the illustrated title and language selector');
  await page.locator('#titleLanguage').selectOption('cs');
  await page.locator('.tutorial-step-image').waitFor();
  assert.equal(await page.locator('.tutorial-step-image').count(), 1, 'Language selection opens the tutorial');
  for (let step = 0; step < 4; step++) await page.locator('button[data-tutorial-step="1"]').click();
  assert.match(await page.locator('#app').innerText(), /Rozumím, hrát/, 'Tutorial has a final confirmation step');
  await page.locator('button[data-tutorial-step="1"]').click();
  await page.locator('#app .hero').waitFor();
  assert.equal(await page.locator('.home-logo').count(), 1, 'Czech home screen renders the game logo');
  assert.equal(await page.locator('html').getAttribute('lang'), 'cs', 'Czech interface language is active');

  const homeImagesLoaded = await page.locator('.home-family img').evaluate((img) =>
    img.alt.includes('family') || img.alt.includes('Rodina') ? img.complete && img.naturalWidth > 0 : false);
  assert.equal(homeImagesLoaded, true, 'Storyboard family illustration loads on the home screen');
  assert.equal(await page.locator('.home-primary-links [data-screen]').count(), 4, 'Home menu exposes the main destinations');

  await page.locator('#langBtn').click();
  assert.equal(await page.locator('.home-logo').count(), 1, 'English home screen renders the game logo');
  assert.equal(await page.locator('html').getAttribute('lang'), 'en', 'English interface language is active');
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
  assert.match(await page.locator('.avatar-option.selected img').first().getAttribute('src'), /avatar-robot\.svg/, 'Avatar selection saves to a player');
  await page.locator('[data-appearance-tab="hat"]').click();
  await page.locator('[data-appearance="hat"][data-value="crown"]').click();
  assert.equal(await page.locator('.look-hat').innerText(), '👑', 'Hat choice updates the character preview');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).players[0].appearance.hat), 'crown', 'Purchased character appearance persists for that player');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 5, 'Unlocking a crown deducts its coin price');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).cosmeticUnlocks.hat.includes('crown')), true, 'Purchased cosmetics stay unlocked');
  await page.locator('[data-appearance-tab="accessory"]').click();
  await page.locator('[data-appearance="accessory"][data-value="glasses"]').click();
  assert.match(await page.locator('#toast').innerText(), /10 mincí/, 'Unaffordable cosmetics explain the required price');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 5, 'Insufficient balance does not charge the player');
  assert.equal(await page.locator('.appearance-tabs').innerText().then(text => text.includes('Čepice')), true, 'Character editor labels are localized in Czech');
  await page.locator('#langBtn').click();
  await page.locator('[data-screen="avatars"]').click();
  assert.equal(await page.locator('[data-appearance-tab="hair"]').innerText(), 'Hair', 'Character editor labels are localized in English');
  await page.locator('#langBtn').click();
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

  await page.locator('[data-screen="settings"]').first().click();
  await page.locator('[data-seconds="60"]').click();
  assert.equal(await page.locator('[data-seconds="60"]').evaluate((button) => button.classList.contains('active')), true, 'Round length can be changed in settings');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).roundSeconds), 60, 'Round length setting persists');
  await page.locator('#musicPref').check();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).music), true, 'Music preference can be enabled');
  await page.locator('#musicPref').uncheck();
  await page.locator('#offlinePref').check();
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    const cache = await caches.open('sharades-release-v15');
    return !!await cache.match(new URL('offline-mode', registration.scope).href);
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  assert.equal(await page.evaluate(() => fetch('./not-cached-while-offline').then(response => response.status)), 504, 'Offline-only mode blocks uncached network requests');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).offlineMode), true, 'Offline-only preference persists and reaches the service worker');
  await page.locator('#offlinePref').uncheck();
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    const cache = await caches.open('sharades-release-v15');
    return !await cache.match(new URL('offline-mode', registration.scope).href);
  });
  await page.locator('#homeBtn').click();

  await page.locator('[data-action="modes"]').click();
  await page.locator('[data-mode="teams"]').click();
  await page.locator('[data-category="Zvířata"]').click();
  await page.locator('[data-action="begin"]').click();
  assert.equal(await page.locator('#timeText').innerText(), '60', 'A round starts with the timer selected in settings');
  assert.notEqual(await page.locator('#wordText').innerText(), '—', 'The actor sees the word immediately');
  assert.equal(await page.locator('#revealWord').count(), 0, 'No extra reveal step blocks the game round');
  await page.locator('[data-action="correct"]').click();
  assert.equal(await page.locator('.score-row .score').first().innerText(), '1', 'Correct guess increments the team score');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 6, 'Correct guess also earns a persistent coin');

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
  console.log('Interactive browser smoke test passed: language toggle, assets, tutorial, players, character editor, local word generation, achievements, settings, offline mode, immediate word display, scoring, and round progression.');
} finally {
  await browser.close();
}
