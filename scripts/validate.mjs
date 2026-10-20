import fs from 'node:fs';
import path from 'node:path';
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

for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const raw = match[1];
  if (/^(?:https?:|#|data:|\/\/)/i.test(raw)) continue;
  const asset = raw.split(/[?#]/)[0].replace(/^\.\//, '');
  assert(fs.existsSync(asset), `index.html asset exists: ${asset}`);
}

const cached = [...sw.matchAll(/['"]\.\/?([^'"]+)['"]/g)]
  .map((m) => m[1])
  .filter((p) => /^(index\.html|css\/|js\/|manifest\.webmanifest|assets\/)/.test(p));
for (const asset of new Set(cached)) {
  assert(fs.existsSync(asset), `service worker asset exists: ${asset}`);
}

const sandbox = { window: {} };
vm.runInNewContext(read('js/words.js'), sandbox);
const words = sandbox.window.SHARADES_WORDS;
assert(!!words?.cs && !!words?.en, 'Czech and English dictionaries are present');
const requiredCategories = { cs: ['Filmy', 'Zvířata', 'Jídlo', 'Místa', 'Sport', 'Povolání', 'Příroda', 'Různé'], en: ['Movies', 'Animals', 'Food', 'Places', 'Sports', 'Jobs', 'Nature', 'Mixed'] };
for (const lang of ['cs', 'en']) {
  const categories = Object.entries(words[lang]);
  assert(categories.length >= 7, `${lang} has at least 7 word categories`);
  assert(requiredCategories[lang].every((category) => Object.hasOwn(words[lang], category)), `${lang} has all 8 requested categories`);
  const count = categories.reduce((sum, [, entries]) => sum + entries.length, 0);
  assert(count >= 100, `${lang} has at least 100 words (found ${count})`);
  assert(categories.every(([, entries]) => Array.isArray(entries) && entries.every((w) => typeof w === 'string' && w.trim())), `${lang} dictionary entries are non-empty strings`);
}
for (const key of ['beginGame', 'nextTurn', 'finishTurn', 'finishGame', 'renderGame']) {
  assert(app.includes(`function ${key}`) || app.includes(`${key}(){`), `gameplay function exists: ${key}`);
}
assert(app.includes("round:'Tah'") && app.includes("round:'Turn'"), 'round label is translated in both languages');
assert(app.includes('tutorial-step-image') && css.includes('.tutorial-step-image'), 'step-by-step tutorial has matching styles');
assert(html.includes('js/app.js') && html.includes('js/words.js') && html.includes('service-worker.js'), 'app scripts and offline worker are wired in HTML');
console.log(`Sharades validation passed: ${checks.length} checks.\n- ${checks.join('\n- ')}`);
