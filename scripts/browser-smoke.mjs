import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined, args: process.env.CHROME_BIN ? ['--no-sandbox'] : [] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(error.message));
page.on('dialog', (dialog) => dialog.accept());
const enterMode = async (mode) => {
  if (!(await page.locator('.home-play').isVisible())) await page.locator('#homeBtn').click();
  await page.locator('.home-play').click();
  await page.locator(`[data-mode="${mode}"]`).click();
  await page.locator('[data-action="begin"]').click();
};
const selectAvatar = async (id) => {
  if (!(await page.locator('.avatar-modal').isVisible())) await page.locator('[data-action="open-avatar-picker"]').click();
  await page.locator(`.avatar-modal [data-avatar-choice="${id}"]`).click();
};
const setWorkerOffline = async (enabled) => page.evaluate(async (value) => {
  const registration = await navigator.serviceWorker.ready;
  if (!registration.active) throw new Error('Service worker is not active');
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => reject(new Error('Service worker did not acknowledge the offline setting')), 5000);
    channel.port1.onmessage = (event) => { clearTimeout(timer); resolve(event.data); };
    registration.active.postMessage({ type: 'SET_OFFLINE_MODE', enabled: value }, [channel.port2]);
  });
}, enabled);
const endCurrentMode = async () => {
  await page.locator('[data-action="end"]').click();
  await page.locator('[data-action="finish-game"]').click();
};

try {
  await page.addInitScript(() => localStorage.setItem('sharades_release_v2', JSON.stringify({ coins: 105, languageChosen: false, onboarded: false, startFlowVersion: 3, lang: 'cs' })));
  await page.goto('http://127.0.0.1:8080/', { waitUntil: 'domcontentloaded' });
  const firstPaintPoster = page.locator('#app .home-poster[data-testid="home-poster"]');
  await firstPaintPoster.waitFor({ state: 'attached' });
  assert.equal(await firstPaintPoster.count(), 1, 'The app mounts its home poster as soon as it loads');
  assert.equal(await firstPaintPoster.getAttribute('data-testid'), 'home-poster', 'The first-paint poster exposes its stable test id');
  assert.equal(await page.locator('.language-gate-options [data-language-choice]').count(), 2, 'First launch offers visible Czech and English choices');
  await page.locator('.language-gate-options [data-language-choice="en"]').click();
  await page.locator('.tutorial-card').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en', 'Choosing a language opens the tutorial in that language');
  assert.equal(await page.locator('.language-gate').count(), 0, 'Language choice closes the first-launch prompt');
  assert.equal(await page.locator('.tutorial-card .pill').innerText(), '1/5', 'First language choice starts the tutorial at step one');
  for (let step = 2; step <= 5; step++) {
    await page.locator('[data-tutorial-next]').click();
    assert.equal(await page.locator('.tutorial-card .pill').innerText(), `${step}/5`, `Tutorial advances to step ${step}`);
  }
  await page.locator('.home-dashboard').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en', 'Completing the tutorial opens the main menu in the chosen language');
  assert.equal(await page.locator('.home-primary-links .select-card').count(), 4, 'Main menu shows its four primary game shortcuts');
  assert.equal(await page.locator('.home-quick-links button').count(), 4, 'Main menu shows its four utility shortcuts');
  assert.equal(await page.locator('.home-utility-links button').count(), 2, 'Sound and vibration have their own bottom row');
  const heroLoaded = await page.locator('.home-family .hero-scene').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; });
  assert.equal(heroLoaded, true, 'Main menu family illustration loads');
  await page.locator('[data-screen="settings"]').click();
  await page.locator('[data-language="cs"]').click();
  assert.equal(await page.locator('html').getAttribute('lang'), 'cs', 'Main menu can switch to Czech');

  await page.locator('.home-play').click();
  assert.equal(await page.locator('.mode-option').count(), 7, 'All seven game modes are available');
  await page.locator('[data-mode="teams"]').click();
  assert.match(await page.locator('#app').innerText(), /Souboj týmů/, 'Team mode can be selected');
  await page.locator('#homeBtn').click();
  await page.locator('[data-screen="settings"]').click();
  await page.locator('[data-screen="tutorial"]').click();
  assert.equal(await page.locator('.tutorial-card .pill').innerText(), '1/5', 'Tutorial can be opened from settings');
  await page.locator('[data-tutorial-skip]').click();
  await page.locator('[data-screen="players"]').click();
  await page.locator('#playerName').fill('Browser Test');
  await page.locator('[data-action="add-player"]').click();
  assert.equal(await page.locator('.player .name').filter({ hasText: 'Browser Test' }).count(), 1, 'A player can be added');
  await page.locator('#homeBtn').click();

  await page.locator('[data-screen="players"]').click();
  await page.locator('[data-screen="avatars"]').click();
  await page.locator('[data-action="open-avatar-picker"]').click();
  assert.equal(await page.locator('.avatar-modal [data-pick-avatar]').count(), 9, 'Avatar modal shows a 3 by 3 page');
  assert.equal(await page.locator('.avatar-page-dot').count(), 3, 'Avatar picker has three pages');
  assert.equal(await page.locator('#avatarModalTitle').innerText(), 'AVATARY', 'Avatar picker uses the requested title');
  assert.match(await page.locator('.avatar-modal').innerText(), /Muž[\s\S]*Žena[\s\S]*Holčička[\s\S]*Chlapeček/, 'First avatar page has the family choices');
  await page.locator('[data-avatar-page="1"]').click();
  assert.match(await page.locator('.avatar-modal').innerText(), /Kosmonaut/, 'Second avatar page opens');
  await page.locator('[data-avatar-page="2"]').click();
  assert.match(await page.locator('.avatar-modal').innerText(), /Tučňák/, 'Third avatar page opens');
  await page.locator('[data-avatar-page="0"]').click();
  for (const avatar of ['girl', 'boy']) {
    await selectAvatar(avatar);
    await page.waitForFunction(() => document.querySelector('.character-full').src.startsWith('data:image/svg+xml'));
    assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, `The ${avatar} avatar art loads in the editor`);
    assert.equal(await page.evaluate((id) => JSON.parse(localStorage.getItem('sharades_release_v2')).players[0].avatar === id, avatar), true, `The ${avatar} avatar can be selected`);
  }
  await selectAvatar('man');
  await selectAvatar('robot');
  assert.match(await page.locator('.avatar-current-choice img').getAttribute('src'), /avatar-robot\.svg/, 'Avatar selection saves to a player');
  await selectAvatar('man');
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
  await selectAvatar('robot');
  assert.equal(await page.locator('[data-appearance-tab="hair"]').count(), 0, 'Hair choices are hidden for avatars without hair');
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('stroke="#39e8ff" stroke-width="5"'));
  assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, 'Purchased headphones and crown render on the robot avatar');
  await selectAvatar('cat');
  assert.equal(await page.locator('[data-appearance-tab="hair"]').count(), 0, 'Hair choices are hidden for the cat avatar');
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('stroke="#39e8ff" stroke-width="5"'));
  assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, 'Purchased accessories render on the cat avatar');
  await selectAvatar('dog');
  assert.equal(await page.locator('[data-appearance-tab="hair"]').count(), 0, 'Hair choices are hidden for the dog avatar');
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('fill="url(#fur)"'));
  assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, 'The original dog avatar SVG loads with purchased accessories');
  for (const avatar of ['woman', 'girl', 'boy']) {
    await selectAvatar(avatar);
    await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('stroke="#39e8ff" stroke-width="5"'));
    assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, `Purchased accessories render on the ${avatar} avatar`);
  }
  await selectAvatar('child');
  await page.waitForFunction(() => decodeURIComponent(document.querySelector('.character-full').src.split(',')[1] || '').includes('stroke="#39e8ff" stroke-width="5"'));
  assert.equal(await page.locator('.character-full').evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0; }), true, 'Purchased accessories render on the legacy child avatar');
  await selectAvatar('man');
  assert.equal(await page.locator('.appearance-tabs').innerText().then(text => text.includes('Čepice')), true, 'Character editor labels are localized in Czech');
  await page.locator('#langBtn').click();
  await page.locator('[data-screen="players"]').click();
  await page.locator('[data-screen="avatars"]').click();
  assert.equal(await page.locator('[data-appearance-tab="hair"]').innerText(), 'Hair', 'Character editor labels are localized in English');
  await page.locator('[data-action="open-avatar-picker"]').click();
  assert.match(await page.locator('.avatar-modal').innerText(), /Man[\s\S]*Woman[\s\S]*Girl[\s\S]*Boy/, 'The avatar modal labels are localized in English');
  await page.locator('.avatar-modal-close').click();
  await page.locator('#langBtn').click();

  await page.locator('[data-screen="settings"]').click();
  await page.locator('[data-screen="ai"]').click();
  await page.locator('#aiTopic').fill('Zvířata');
  await page.locator('[data-action="generate-local"]').click();
  assert.equal(await page.locator('[data-generated-index]').count(), 10, 'Local word generator creates the requested number of suggestions');
  assert.equal((await page.locator('.feature-row').allTextContents()).every((row) => row.includes('Zvířata')), true, 'Czech topic generates words from the matching category');
  await page.locator('[data-action="add-generated"]').click();
  assert.equal(await page.locator('#customText').inputValue().then(v => v.split('\n').filter(Boolean).length), 10, 'Generated suggestions can be added to custom words');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).customWords.length), 10, 'Saved generated words persist in the custom word deck');
  assert.equal(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('sharades_release_v2')).customWordCategories).filter((category) => category === 'Zvířata').length), 10, 'Generated words retain their source category when saved');
  await page.locator('#homeBtn').click();
  await page.locator('[data-screen="categories"]').click();
  assert.equal(await page.locator('[data-category="Zvířata"]').count(), 1, 'Saved generated category remains available in category selection');
  await page.locator('#homeBtn').click();

  await page.locator('[data-screen="settings"]').click();
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
  assert.equal(await page.locator('#wordText').innerText(), '✦ ✦ ✦ ✦ ✦', 'Generated game keeps its word hidden until the actor reveals it');
  await page.locator('#wordReveal').click();
  assert.equal(await page.locator('#wordText').innerText(), chosenGeneratedWord, 'Actor can reveal the selected generated word');
  await page.locator('[data-action="end"]').click();
  await page.locator('[data-action="finish-game"]').click();
  await page.locator('#homeBtn').click();

  await page.locator('[data-screen="settings"]').click();
  await page.locator('[data-screen="achievements"]').click();
  assert.equal(await page.locator('.feature-row').count(), 5, 'Achievements screen renders five achievements');
  await page.locator('#homeBtn').click();
  await page.locator('[data-screen="settings"]').click();
  await page.locator('[data-screen="offline"]').click();
  assert.equal(await page.locator('.feature-row').count(), 3, 'Offline status screen renders its checks');
  await page.locator('#homeBtn').click();

  await page.locator('[data-screen="settings"]').click();
  await page.locator('[data-seconds="60"]').click();
  assert.equal(await page.locator('[data-seconds="60"]').evaluate((button) => button.classList.contains('active')), true, 'Round length can be changed in settings');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).roundSeconds), 60, 'Round length setting persists');
  await page.locator('#musicPref').check();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).music), true, 'Music preference can be enabled');
  await page.locator('#musicPref').uncheck();
  await page.locator('#offlinePref').check();
  assert.deepEqual(await setWorkerOffline(true), { ok: true, enabled: true }, 'Service worker acknowledges offline mode');
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    const cache = await caches.open('sharades-release-v56-onboarding-game-screen');
    return !!await cache.match(new URL('offline-mode', registration.scope).href);
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  assert.equal(await page.evaluate(() => fetch('./not-cached-while-offline').then(response => response.status)), 504, 'Offline-only mode blocks uncached network requests');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sharades_release_v2')).offlineMode), true, 'Offline-only preference persists and reaches the service worker');
  await page.locator('#offlinePref').uncheck();
  assert.deepEqual(await setWorkerOffline(false), { ok: true, enabled: false }, 'Service worker acknowledges returning online');
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    const cache = await caches.open('sharades-release-v56-onboarding-game-screen');
    return !await cache.match(new URL('offline-mode', registration.scope).href);
  });
  await page.locator('#homeBtn').click();

  await page.locator('.home-play').click();
  await page.locator('[data-mode="teams"]').click();
  await page.locator('[data-category="Zvířata"]').click();
  await page.locator('[data-action="begin"]').click();
  assert.equal(await page.locator('#timeText').innerText(), '60', 'A round starts with the timer selected in settings');
  assert.equal(await page.locator('body').evaluate((body) => body.classList.contains('game-screen-active')), true, 'The round enters the immersive game layout');
  assert.equal(await page.locator('#wordProgress').innerText(), '1/10', 'The word card counter starts at the first card');
  assert.equal(await page.locator('#wordText').innerText(), '✦ ✦ ✦ ✦ ✦', 'The word stays masked until the actor taps the card');
  await page.locator('#wordReveal').click();
  assert.notEqual(await page.locator('#wordText').innerText(), '✦ ✦ ✦ ✦ ✦', 'The actor can reveal the word from the card');
  await page.locator('[data-action="correct"]').click();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#wordCardArt').evaluate((element) => Boolean(element.textContent.trim() || element.style.backgroundImage)), true, 'Each word card keeps a local illustration or emoji fallback');
  assert.equal(await page.locator('.round-score .score').first().innerText(), '1', 'Correct guess increments the team score');
  assert.equal(await page.locator('#wordProgress').innerText(), '2/10', 'The card counter advances after a correct answer');
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
  await page.locator('#wordReveal').click();
  await page.locator('[data-action="correct"]').click();
  assert.equal(await page.locator('.round-score .score').first().innerText(), '2', 'Double-points mode awards two points');
  await endCurrentMode();

  await enterMode('sudden');
  await page.locator('[data-action="skip-word"]').click();
  assert.equal(await page.locator('.scoreboard .score-row').count(), 2, 'Sudden death ends immediately after the first skip and shows both teams');

  await page.locator('#homeBtn').click();
  await page.locator('.home-play').click();
  await page.locator('[data-mode="marathon"]').click();
  await page.clock.install();
  await page.locator('[data-action="begin"]').click();
  assert.equal(await page.locator('#timeText').innerText(), '120', 'Marathon starts with its fixed two-minute timer');
  await page.clock.runFor(120_000);
  await page.locator('[data-action="next-turn"]').waitFor();
  assert.match(await page.locator('#app').innerText(), /Čas vypršel/, 'Marathon automatically ends when its two-minute timer reaches zero');
  await page.locator('[data-action="finish-game"]').click();
  assert.equal(await page.locator('.scoreboard .score-row').count(), 2, 'Marathon results show both teams after ending the turn');

  for (const [mode, hint] of [['classic', /společn.*skóre/i], ['pantomime', /Bez mluvení/], ['drawing', /Kresli na papír/]]) {
    await enterMode(mode);
    assert.match(await page.locator('.mode-rule').innerText(), hint, `${mode} mode shows its rule during gameplay`);
    if (mode === 'classic') assert.equal(await page.locator('.round-score small').first().innerText(), 'Všichni', 'Classic mode displays its translated shared-team label');
    await endCurrentMode();
  }
  assert.equal(await page.evaluate(() => ['classic', 'teams', 'sudden', 'marathon', 'double', 'pantomime', 'drawing'].every((mode) => JSON.parse(localStorage.getItem('sharades_release_v2')).history.some((game) => game.mode === mode))), true, 'All seven game modes record their completed results');
  await page.goto('http://127.0.0.1:8080/card-gallery.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('.card').length === 320, null, { timeout: 10000 });
  assert.equal(await page.locator('.card').count(), 320, 'Card gallery shows all 320 bilingual word cards');
  assert.equal(await page.locator('.art').first().evaluate((art) => getComputedStyle(art).backgroundImage.includes('family-card-cutout-sprites-v2.png')), true, 'Card gallery shows the matching sprite illustration');
  assert.equal(await page.locator('.art').evaluateAll((arts) => arts.every((art) => getComputedStyle(art).backgroundImage !== 'none')), true, 'Every gallery card is connected to an image source');
  await page.locator('#search').fill('Králík');
  await page.waitForFunction(() => document.querySelectorAll('.card').length === 1);
  assert.match(await page.locator('.card').innerText(), /Králík.*Rabbit/s, 'Card gallery search finds the bilingual rabbit card');
  await page.locator('#search').fill('');
  await page.locator('#category').selectOption('Povolání');
  await page.waitForFunction(() => document.querySelectorAll('.card').length === 40);
  assert.equal(await page.locator('.card').count(), 40, 'Card gallery category filter returns its 40 professions');
  assert.equal(runtimeErrors.length, 0, `No uncaught browser errors: ${runtimeErrors.join('; ')}`);
  console.log('Interactive browser smoke test passed: onboarding, game modes, 320 illustrated cards, bilingual gallery search, category filtering, generated decks, settings, offline mode, scoring, and results.');
} catch (error) {
  const dom = await page.locator('html').evaluate((element) => element.outerHTML).catch(() => '<DOM unavailable>');
  console.error('PWA browser smoke test failed. Current DOM snapshot follows:\n' + dom);
  throw error;
} finally {
  await browser.close();
}
