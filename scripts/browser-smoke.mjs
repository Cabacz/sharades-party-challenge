import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined, args: process.env.CHROME_BIN ? ['--no-sandbox'] : [] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(error.message));
page.on('dialog', (dialog) => dialog.accept());
const enterMode = async (mode) => {
  await page.locator('#homeBtn').click();
  await page.locator('[data-action="modes"]').click();
  await page.locator(`[data-mode="${mode}"]`).click();
  await page.locator('[data-action="begin"]').click();
};
const endCurrentMode = async () => {
  await page.locator('[data-action="end"]').click();
  await page.locator('[data-action="finish-game"]').click();
};

try {
  await page.addInitScript(() => localStorage.setItem('sharades_release_v2', JSON.stringify({ coins: 105 })));
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
  await page.locator('[data-pick-avatar="man"]').click();
  await page.locator('[data-appearance-tab="hair"]').click();
  await page.locator('[data-appearance="hair"][data-value="curly"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('#382544'));
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('circle cx="52" cy="18" r="7"'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 95, 'Curly hairstyle changes the original SVG and deducts its coin price');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).cosmeticUnlocks.hair.includes('curly')), true, 'Purchased hairstyle stays unlocked');
  await page.locator('[data-appearance="hair"][data-value="spiky"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('M48 38 41 13l17 13'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 83, 'Spiky hairstyle uses its own shape and purchase price');
  await page.locator('[data-appearance="hair"][data-value="curly"]').click();
  await page.locator('[data-appearance-tab="outfit"]').click();
  await page.locator('[data-appearance="outfit"][data-value="green"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('#55d778'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 75, 'Unlocking an outfit recolors the original SVG and charges coins');
  await page.locator('[data-appearance-tab="expression"]').click();
  await page.locator('[data-appearance="expression"][data-value="wow"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('cx="80" cy="68"'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).players[0].appearance.expression), 'wow', 'Face expression is applied to the original character SVG');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 70, 'Unlocking an expression charges its coin price');
  await page.locator('[data-appearance-tab="hat"]').click();
  await page.locator('[data-appearance="hat"][data-value="crown"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('fill="#ffd534"'));
  assert.equal(await page.locator('.look-hat').count(), 0, 'Crown is drawn as part of the character SVG, not as an emoji overlay');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 50, 'Unlocking a crown charges its coin price');
  await page.locator('[data-appearance-tab="accessory"]').click();
  await page.locator('[data-appearance="accessory"][data-value="glasses"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('rect x="59" y="40"'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 40, 'Unlocking glasses draws them onto the original SVG');
  await page.locator('[data-appearance="accessory"][data-value="bow"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('fill="#ff58bf"'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 32, 'Bow accessory appears on the character and is purchased once');
  await page.locator('[data-appearance="accessory"][data-value="headphones"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('stroke="#39e8ff" stroke-width="5"'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 20, 'Headphones are rendered on the character');
  await page.locator('[data-appearance-tab="hat"]').click();
  await page.locator('[data-appearance="hat"][data-value="cap"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('fill="#1778d4"'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 15, 'Cap is rendered on the character and charged once');
  await page.locator('[data-appearance-tab="hair"]').click();
  await page.locator('[data-appearance="hair"][data-value="blonde"]').click();
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('#efc458'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 0, 'Blonde hairstyle recolors the original hair and charges once');
  await page.locator('[data-appearance-tab="hat"]').click();
  await page.locator('[data-appearance="hat"][data-value="party"]').click();
  assert.match(await page.locator('#toast').innerText(), /8 mincí/, 'Unaffordable cosmetics explain the required price');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 0, 'Insufficient balance does not charge the player');
  await page.locator('[data-pick-avatar="robot"]').click();
  assert.equal(await page.locator('[data-appearance-tab="hair"]').count(), 0, 'Hair choices are hidden for avatars without hair');
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('stroke="#39e8ff" stroke-width="5"'));
  assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, 'Purchased headphones and crown render on the robot avatar');
  await page.locator('[data-pick-avatar="cat"]').click();
  assert.equal(await page.locator('[data-appearance-tab="hair"]').count(), 0, 'Hair choices are hidden for the cat avatar');
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('stroke="#39e8ff" stroke-width="5"'));
  assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, 'Purchased accessories render on the cat avatar');
  await page.locator('[data-pick-avatar="dog"]').click();
  assert.equal(await page.locator('[data-appearance-tab="hair"]').count(), 0, 'Hair choices are hidden for the dog avatar');
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('fill="url(#fur)"'));
  assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, 'The original dog avatar SVG loads with purchased accessories');
  for (const avatar of ['woman', 'child']) {
    await page.locator(`[data-pick-avatar="${avatar}"]`).click();
    await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('stroke="#39e8ff" stroke-width="5"'));
    assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, `Purchased accessories render on the ${avatar} avatar`);
  }
  await page.locator('[data-pick-avatar="man"]').click();
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
  assert.equal((await page.locator('.feature-row').allTextContents()).every((row) => row.includes('Zvířata')), true, 'Czech topic generates words from the matching category');
  await page.locator('[data-action="add-generated"]').click();
  assert.equal(await page.locator('#customText').inputValue().then(v => v.split('\n').filter(Boolean).length), 10, 'Generated suggestions can be added to custom words');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).customWords.length), 10, 'Saved generated words persist in the custom word deck');
  await page.locator('#homeBtn').click();

  await page.locator('[data-screen="ai"]').click();
  await page.locator('#aiLanguage').selectOption('en');
  await page.locator('#aiTopic').fill('Minecraft');
  await page.locator('[data-action="generate-local"]').click();
  assert.equal(await page.locator('[data-generated-index]').count(), 10, 'English topic generation returns the requested number of themed words');
  assert.equal((await page.locator('.feature-row').allTextContents()).every((row) => row.includes('Minecraft')), true, 'English language is independent of the Czech interface language');
  const chosenGeneratedWord = await page.locator('[data-generated-index]').first().evaluate((input) => input.closest('label').querySelector('strong').innerText);
  for (let index = 1; index < 10; index++) await page.locator('[data-generated-index]').nth(index).uncheck();
  await page.locator('[data-action="start-generated"]').click();
  assert.equal(await page.locator('[data-action="begin"]').count(), 1, 'Selected generated words can proceed to the normal game setup');
  await page.locator('[data-action="begin"]').click();
  assert.equal((await page.locator('#wordCat').innerText()).toLowerCase(), 'minecraft', 'Generated game uses the selected topic deck');
  assert.equal(await page.locator('#wordText').innerText(), chosenGeneratedWord, 'Generated game starts with the selected preview word');
  await page.locator('[data-action="end"]').click();
  await page.locator('[data-action="finish-game"]').click();
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
    const cache = await caches.open('sharades-release-v20');
    return !!await cache.match(new URL('offline-mode', registration.scope).href);
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  assert.equal(await page.evaluate(() => fetch('./not-cached-while-offline').then(response => response.status)), 504, 'Offline-only mode blocks uncached network requests');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).offlineMode), true, 'Offline-only preference persists and reaches the service worker');
  await page.locator('#offlinePref').uncheck();
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    const cache = await caches.open('sharades-release-v20');
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
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).coins), 1, 'Correct guess also earns a persistent coin');

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

  await enterMode('double');
  await page.locator('[data-action="pause"]').click();
  assert.match(await page.locator('[data-action="pause"]').innerText(), /Pokračovat|Resume/, 'Game can be paused');
  await page.locator('[data-action="pause"]').click();
  await page.locator('[data-action="correct"]').click();
  assert.equal(await page.locator('.score-row .score').first().innerText(), '2', 'Double-points mode awards two points');
  await endCurrentMode();

  await enterMode('sudden');
  await page.locator('[data-action="skip-word"]').click();
  assert.equal(await page.locator('.scoreboard .score-row').count(), 1, 'Sudden death ends immediately after the first skip');

  await enterMode('marathon');
  assert.equal(await page.locator('#timeText').innerText(), '120', 'Marathon starts with its fixed two-minute timer');
  await page.locator('[data-action="correct"]').click();
  await page.locator('[data-action="end"]').click();
  assert.equal(await page.locator('.scoreboard .score-row').count(), 1, 'Ending a marathon shows the final results directly');

  for (const [mode, hint] of [['classic', /Společné skóre/], ['pantomime', /Bez mluvení/], ['drawing', /Kresli na papír/]]) {
    await enterMode(mode);
    assert.match(await page.locator('.word-hint').innerText(), hint, `${mode} mode shows its rule during gameplay`);
    await endCurrentMode();
  }
  assert.equal(await page.evaluate(() => ['classic', 'teams', 'sudden', 'marathon', 'double', 'pantomime', 'drawing'].every((mode) => JSON.parse(localStorage.getItem('sharades_release_v2')).history.some((game) => game.mode === mode))), true, 'All seven game modes record their completed results');
  assert.equal(runtimeErrors.length, 0, `No uncaught browser errors: ${runtimeErrors.join('; ')}`);
  console.log('Interactive browser smoke test passed: bilingual onboarding, game modes, categories, generated decks, character cosmetics, settings, offline mode, scoring, pauses, and results.');
} finally {
  await browser.close();
}
