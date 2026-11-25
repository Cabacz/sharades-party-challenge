import fs from 'node:fs';
import vm from 'node:vm';

const read = (p) => fs.readFileSync(p, 'utf8');
const checks = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  checks.push(message);
};

const html = read('index.html');
const sw = read('service-worker.js');
const app = read('js/app.js');
const css = read('css/style.css');
const cards = JSON.parse(read('data/cards.json'));
const pwaManifest = JSON.parse(read('manifest.json'));

for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const raw = match[1];
  if (/^(?:https?:|#|data:|\/\/)/i.test(raw)) continue;
  const asset = raw.split(/[?#]/)[0].replace(/^\.\//, '');
  assert(fs.existsSync(asset), `index.html asset exists: ${asset}`);
}

const cached = [...sw.matchAll(/['"]\.\/?([^'"]+)['"]/g)]
  .map((m) => m[1].split(/[?#]/)[0])
  .filter((p) => /^(index\.html|css\/|js\/|data\/|manifest\.json|assets\/)/.test(p));
for (const asset of new Set(cached)) {
  assert(fs.existsSync(asset), `service worker asset exists: ${asset}`);
}

const sandbox = { window: {} };
vm.runInNewContext(read('data/words.js'), sandbox);
const words = sandbox.window.SHARADES_WORDS;
assert(!!words?.cs && !!words?.en, 'Czech and English dictionaries are present');
const themes = sandbox.window.SHARADES_THEMES;
assert(!!themes?.cs && !!themes?.en, 'Local generator themes exist in both languages');
assert(['minecraft', 'dinosaurs', 'wizarding'].every((key) => themes.cs[key]?.words?.length >= 10 && themes.en[key]?.words?.length >= 10), 'Themed word packs contain bilingual playable prompts');

const requiredCategories = {
  cs: ['Filmy', 'Zvířata', 'Jídlo', 'Místa', 'Sport', 'Povolání', 'Příroda', 'Různé'],
  en: ['Movies', 'Animals', 'Food', 'Places', 'Sports', 'Jobs', 'Nature', 'Mixed'],
};
for (const lang of ['cs', 'en']) {
  const categories = Object.entries(words[lang]);
  assert(categories.length >= 7, `${lang} has at least 7 word categories`);
  assert(requiredCategories[lang].every((category) => Object.hasOwn(words[lang], category)), `${lang} has all 8 requested categories`);
  const count = categories.reduce((sum, [, entries]) => sum + entries.length, 0);
  assert(count >= 100, `${lang} has at least 100 words (found ${count})`);
  assert(categories.every(([, entries]) => Array.isArray(entries) && entries.every((w) => typeof w === 'string' && w.trim())), `${lang} dictionary entries are non-empty strings`);
}
assert(cards.length === 320, `bilingual card manifest contains all 320 cards (found ${cards.length})`);
assert(cards.every((card) => typeof card.wordCs === 'string' && typeof card.wordEn === 'string' && fs.existsSync(card.sheet)), 'every bilingual word card has a local illustration asset');
const cardCoverage = {
  cs: new Set(cards.map((card) => `${card.categoryCs}\u0000${card.wordCs}`)),
  en: new Set(cards.map((card) => `${card.categoryEn}\u0000${card.wordEn}`)),
};
assert(
  cardCoverage.cs.size === cards.length && cardCoverage.en.size === cards.length &&
  ['cs', 'en'].every((lang) => Object.entries(words[lang]).every(([category, entries]) => entries.every((word) => cardCoverage[lang].has(`${category}\u0000${word}`)))) &&
  cards.every((card) => card.kind !== 'generated' || (card.index >= 0 && card.index < card.columns * card.rows)),
  'illustrated card records cover every dictionary word once with valid sheet positions',
);
assert(pwaManifest.name === 'Sharades Party Challenge' && pwaManifest.start_url === './', 'root PWA manifest is valid and points to the app');

for (const key of ['beginGame', 'nextTurn', 'finishTurn', 'finishGame', 'renderGame']) {
  assert(app.includes(`function ${key}`) || app.includes(`${key}(){`), `gameplay function exists: ${key}`);
}
assert(app.includes('round: "Tah"') && app.includes('round: "Turn"'), 'round label is translated in both languages');
const stringTableStart = app.indexOf('const strings = {');
const csStringStart = app.indexOf('    cs: {', stringTableStart);
const enStringStart = app.indexOf('    en: {', csStringStart);
const stringTableEnd = app.indexOf('\n    },\n  };', enStringStart);
const csStringKeys = [...app.slice(csStringStart, enStringStart).matchAll(/^\s{6}([\w]+):/gm)].map((match) => match[1]);
const enStringKeys = [...app.slice(enStringStart, stringTableEnd).matchAll(/^\s{6}([\w]+):/gm)].map((match) => match[1]);
const literalStringKeys = [...new Set([...app.matchAll(/\bt\("([\w]+)"\)/g)].map((match) => match[1]))];
assert(literalStringKeys.every((key) => csStringKeys.includes(key) && enStringKeys.includes(key)), 'all literal UI translation keys exist in Czech and English');
assert(app.includes('tutorial-step-image') && css.includes('.tutorial-step-image'), 'five-step tutorial illustration has matching styles');
assert(app.includes('data-tutorial-next') && app.includes('data-tutorial-skip'), 'tutorial next and skip actions are wired');
assert(app.includes('steps.length - 1') && app.includes('tutorialStep += 1'), 'tutorial progresses through all five localized steps');

for (let step = 1; step <= 5; step++) {
  const imagePath = `assets/tutorial-${step}.webp`;
  assert(fs.existsSync(imagePath), `tutorial illustration exists: ${imagePath}`);
  const image = fs.readFileSync(imagePath);
  assert(image.subarray(0, 4).toString('ascii') === 'RIFF' && image.subarray(8, 12).toString('ascii') === 'WEBP', `tutorial illustration is a valid WebP: ${imagePath}`);
}

assert(app.includes('class="home-poster welcome-screen" data-testid="home-poster"') && app.includes('class="welcome-language-panel"') && app.includes('assets/family-welcome.webp') && app.includes('show(!state.languageChosen ? "home" : !state.onboarded ? "tutorial" : "mainMenu")'), 'first launch shows the illustrated language welcome screen, then routes returning players by onboarding state');
assert(app.includes('data-language-choice="cs"') && app.includes('data-language-choice="en"') && app.includes('tutorialStep = 0;\n      show("tutorial")'), 'language choice opens the tutorial');
assert(app.includes('mainMenu()') && app.includes('class="home-dashboard"') && app.includes('assets/family-menu.webp') && app.includes('show("mainMenu")'), 'tutorial completion opens the designed main menu with matching family artwork');
assert(app.includes('data-screen="about"') && app.includes('about()'), 'about screen is reachable from application settings');
assert(html.includes('js/app.js') && html.includes('data/words.js') && html.includes('js/cards.js') && html.includes('service-worker.js'), 'app scripts and offline worker are wired in HTML');
assert(!/DeviceOrientationEvent|deviceorientation|enable-tilt|tiltEnabled|tiltBase|sensitivity/i.test(app), 'gameplay has no tilt sensor logic');
assert(!/SHARADES_CARD_API_URL|api\.openai\.com|supabase/i.test(`${app}\n${html}`), 'frontend does not connect to external AI or database APIs');
assert(css.includes('--bg:#071630') && css.includes('--cyan:#00d2ff'), 'stylesheet uses the approved dark blue and neon blue palette');

console.log(`Sharades validation passed: ${checks.length} checks.\\n- ${checks.join('\\n- ')}`);
