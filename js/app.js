(() => {
  "use strict";
  const $ = (s) => document.querySelector(s),
    app = $("#app"),
    KEY = "sharades_release_v2";
  const avatarIds = ["man", "woman", "child", "dog", "robot", "cat"];
  const appearanceDefaults = () => ({
    hair: "natural",
    hat: "none",
    outfit: "blue",
    accessory: "none",
    background: "party",
    expression: "happy",
  });
  const defaultCosmeticUnlocks = () => ({
    hair: ["natural"],
    hat: ["none"],
    outfit: ["blue"],
    accessory: ["none"],
    background: ["party"],
    expression: ["happy"],
  });
  const cosmeticPrices = {
    hair: { curly: 10, spiky: 12, blonde: 15 },
    hat: { cap: 5, crown: 20, party: 8 },
    outfit: { pink: 8, green: 8, gold: 12 },
    accessory: { glasses: 10, bow: 8, headphones: 12 },
    background: { beach: 15, space: 20, forest: 15 },
    expression: { wow: 5, cool: 8, silly: 5 },
  };
  let appearanceTab = "hair";
  const defaults = () => ({
    lang: "cs",
    onboarded: false,
    languageChosen: false,
    players: [
      { name: "Alex", avatar: "man", team: 0 },
      { name: "Sam", avatar: "woman", team: 1 },
    ],
    teams: [
      { name: "Tým 1", score: 0 },
      { name: "Tým 2", score: 0 },
    ],
    mode: "classic",
    roundSeconds: 30,
    rounds: 3,
    coins: 25,
    cosmeticUnlocks: defaultCosmeticUnlocks(),
    category: "all",
    categories: [],
    family: true,
    customWords: [],
    sound: true,
    music: false,
    offlineMode: false,
    vibration: true,
    theme: "dark",
    difficulty: "normal",
    history: [],
  });
  let suggestions = [],
    generatedRoundWords = null,
    generatedLanguage = null,
    avatarPlayer = 0,
    tutorialStep = 0,
    currentScreen = "home",
    tiltEnabled = false,
    tiltBase = null,
    tiltLocked = false;
  let musicContext = null,
    musicTimer = null,
    musicIndex = 0;
  const avatarSvgCache = new Map();
  let avatarPreviewVersion = 0;
  let state = defaults(),
    run = {
      round: 1,
      turn: 0,
      teamCount: 2,
      remaining: 60,
      score: 0,
      word: null,
      deck: [],
      used: [],
      timer: null,
      paused: false,
      turnGuessed: 0,
      turnSkipped: 0,
      gameId: 0,
    };
  const strings = {
    cs: {
      help: "Nápověda",
      tag: "PARTY HRA • PANTOMIMA",
      title: "Předveď to.",
      sub: "Rozesměj všechny. Šarády pro přátele i rodinu — rychlá kola, slova a pořádná zábava.",
      new: "Začít hrát",
      tutorial: "Jak se hraje",
      players: "Hráči a týmy",
      categories: "Kategorie",
      settings: "Nastavení",
      custom: "Vlastní slova",
      stats: "Výsledky",
      words: "slov",
      round: "Tah",
      customHint: "Jedno slovo na řádek. Vlastní slova se přidají do hry.",
      choose: "Vyber kategorii",
      all: "Všechny kategorie",
      time: "Čas na tah",
      rounds: "Počet tahů na tým",
      mode: "Herní režim",
      classic: "Klasika",
      coop: "Všichni společně",
      family: "Rodinná slova",
      start: "Začít hru",
      back: "Zpět",
      add: "Přidat hráče",
      name: "Jméno hráče",
      team: "Tým",
      save: "Uložit",
      remove: "Odebrat",
      turn: "Na tahu",
      score: "Body",
      remaining: "ZBÝVAJÍCÍ ČAS",
      reveal: "Ukázat slovo",
      hide: "Skrýt slovo",
      correct: "Uhodnuto!",
      skip: "Přeskočit",
      pause: "Pozastavit",
      resume: "Pokračovat",
      end: "Ukončit tah",
      timeup: "Čas vypršel!",
      next: "Další tah",
      results: "Výsledky",
      winner: "Vítězný tým",
      again: "Hrát znovu",
      home: "Hlavní menu",
      empty:
        "Nejsou dostupná slova. Vyber kategorii nebo přidej vlastní slova.",
      saved: "Uloženo.",
      settingsText:
        "Hra ukládá nastavení lokálně v tomto zařízení. Pro offline načítání otevři aplikaci nejprve při připojení k internetu.",
      clear: "Smazat historii",
      none: "Zatím žádné výsledky.",
      tutorialText:
        "Jeden hráč vidí slovo a předvádí ho beze slov. Spoluhráči hádají, čas běží dál i při přeskočení. Za každou správnou odpověď získáš bod.",
      quit: "Odejít z rozehraného tahu?",
      points: "bodů",
      suggest: "Návrhy slov",
      topic: "Téma",
      localWords: "Navrhnout slova z lokálního slovníku",
      addWords: "Přidat vybraná slova",
      aiNote:
        "Tato funkce vybírá související výrazy z vestavěného slovníku; vzdálené AI není bez backendu aktivní.",
      teamName: "Název týmu",
      history: "Nedávné hry",
      reset: "Obnovit výchozí nastavení",
      ai: "AI generátor",
      achievements: "Úspěchy",
      avatars: "Avatary",
      offline: "Offline režim",
      about: "O aplikaci",
      aiTopic: "Téma nebo nápověda",
      aiCount: "Počet slov",
      generate: "Navrhnout slova",
      generated: "Navržená slova",
      pickAvatar: "Vyber avatara",
      forPlayer: "Avatar pro hráče",
      locked: "Ještě zamčeno",
      unlocked: "Odemčeno",
      online: "Připojení k internetu",
      offlineReady: "Hra je připravena na offline hraní",
      offlineNote:
        "Nejprve otevři hru online, aby se uložily soubory aplikace. Kategorie a vlastní slova fungují lokálně.",
      version: "Základní verze • komunitní party hra",
      aboutText:
        "Předváděj slova, sbírej body a bav se s přáteli. Hra ukládá nastavení a výsledky v tomto zařízení.",
      featureAI:
        "Lokální návrhy slov fungují bez klíče API. Vzdálené OpenAI vyžaduje bezpečný serverový backend.",
      selectPlayer: "Vyber hráče",
    },
    en: {
      help: "Help",
      tag: "PARTY GAME • CHARADES",
      title: "Act it out.",
      sub: "Make everyone laugh. Charades for friends and family — quick rounds, great words and lots of fun.",
      new: "Start playing",
      tutorial: "How to play",
      players: "Players & teams",
      categories: "Categories",
      settings: "Settings",
      custom: "Custom words",
      stats: "Results",
      words: "words",
      round: "Turn",
      customHint: "One word per line. Custom words are added to the game.",
      choose: "Choose categories",
      all: "All categories",
      time: "Time per turn",
      rounds: "Turns per team",
      mode: "Game mode",
      classic: "Classic",
      coop: "Everyone together",
      family: "Family-friendly words",
      start: "Start game",
      back: "Back",
      add: "Add player",
      name: "Player name",
      team: "Team",
      save: "Save",
      remove: "Remove",
      turn: "Up next",
      score: "Score",
      remaining: "TIME LEFT",
      reveal: "Reveal word",
      hide: "Hide word",
      correct: "Guessed!",
      skip: "Skip",
      pause: "Pause",
      resume: "Resume",
      end: "End turn",
      timeup: "Time is up!",
      next: "Next turn",
      results: "Results",
      winner: "Winning team",
      again: "Play again",
      home: "Main menu",
      empty: "No words available. Choose a category or add custom words.",
      saved: "Saved.",
      settingsText:
        "Settings are stored locally on this device. To load offline, open the app once while connected.",
      clear: "Clear history",
      none: "No results yet.",
      tutorialText:
        "One player sees a word and acts it out silently. Teammates guess while the clock runs, including during skips. Each correct answer earns a point.",
      quit: "Leave the current turn?",
      points: "points",
      suggest: "Word suggestions",
      topic: "Topic",
      localWords: "Suggest words from the local dictionary",
      addWords: "Add selected words",
      aiNote:
        "This feature selects related expressions from the built-in dictionary; remote AI is not active without a backend.",
      teamName: "Team name",
      history: "Recent games",
      reset: "Restore defaults",
      ai: "AI word generator",
      achievements: "Achievements",
      avatars: "Avatars",
      offline: "Offline mode",
      about: "About",
      aiTopic: "Topic or hint",
      aiCount: "Number of words",
      generate: "Suggest words",
      generated: "Suggested words",
      pickAvatar: "Choose an avatar",
      forPlayer: "Avatar for player",
      locked: "Still locked",
      unlocked: "Unlocked",
      online: "Internet connection",
      offlineReady: "The game is ready for offline play",
      offlineNote:
        "Open the game online first so the app files can be cached. Categories and custom words work locally.",
      version: "Playable foundation • community party game",
      aboutText:
        "Act out words, collect points, and have fun with friends. Settings and results are saved on this device.",
      featureAI:
        "Local word suggestions work without an API key. Remote OpenAI requires a secure server backend.",
      selectPlayer: "Choose player",
    },
  };
  const t = (k) => (strings[state.lang] || strings.cs)[k] || k,
    esc = (s) =>
      String(s).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      toast("Storage unavailable");
    }
  }
  function restore() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s) state = { ...defaults(), ...s };
    } catch (e) {}
  }
  restore();
  function toast(s) {
    const e = $("#toast");
    e.textContent = s;
    e.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => e.classList.remove("show"), 2000);
  }
  function stopTimer() {
    if (run.timer) {
      clearInterval(run.timer);
      run.timer = null;
    }
  }
  function enableTilt() {
    const Api = window.DeviceOrientationEvent;
    if (!Api) {
      toast(
        state.lang === "cs"
          ? "Naklánění není na tomto zařízení dostupné"
          : "Tilt is unavailable on this device",
      );
      return;
    }
    const start = (permission) => {
      if (permission === "denied") {
        toast(
          state.lang === "cs"
            ? "Povolení k pohybu nebylo uděleno"
            : "Motion permission was denied",
        );
        return;
      }
      tiltEnabled = true;
      tiltBase = null;
      window.addEventListener("deviceorientation", handleTilt, true);
      toast(
        state.lang === "cs"
          ? "Naklánění zapnuto — drž telefon rovně"
          : "Tilt enabled — hold the phone steady",
      );
    };
    if (typeof Api.requestPermission === "function")
      Api.requestPermission()
        .then(start)
        .catch(() => start("denied"));
    else start("granted");
  }
  function handleTilt(event) {
    if (
      !tiltEnabled ||
      currentScreen !== "game" ||
      run.paused ||
      event.beta == null
    )
      return;
    if (tiltBase == null) {
      tiltBase = event.beta;
      return;
    }
    let delta = event.beta - tiltBase;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    if (Math.abs(delta) < 16) {
      tiltLocked = false;
      return;
    }
    if (tiltLocked) return;
    tiltLocked = true;
    if (delta < 0) correct();
    else skip();
  }
  function buzz() {
    if (state.vibration && navigator.vibrate) navigator.vibrate(25);
  }
  function beep() {
    if (!state.sound) return;
    try {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return;
      const c = new A(),
        o = c.createOscillator(),
        g = c.createGain();
      o.frequency.value = 720;
      g.gain.value = 0.025;
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + 0.07);
      o.onended = () => c.close();
    } catch (e) {}
  }
  function setMusicEnabled(enabled) {
    if (!enabled) {
      if (musicTimer) clearInterval(musicTimer);
      musicTimer = null;
      if (musicContext) musicContext.close().catch(() => {});
      musicContext = null;
      return;
    }
    if (musicTimer) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      musicContext = new Audio();
      musicContext.resume().catch(() => {});
      const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
      const playNote = () => {
        if (!musicContext) return;
        const now = musicContext.currentTime;
        const oscillator = musicContext.createOscillator();
        const gain = musicContext.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.value = notes[musicIndex++ % notes.length];
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.018, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        oscillator.connect(gain);
        gain.connect(musicContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.31);
      };
      playNote();
      musicTimer = setInterval(playNote, 420);
    } catch (e) {
      musicContext = null;
      musicTimer = null;
    }
  }
  function syncOfflineMode(enabled) {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready
      .then((registration) =>
        registration.active?.postMessage({ type: "SET_OFFLINE_MODE", enabled }),
      )
      .catch(() => {});
  }
  function applyFacialExpression(svg, avatar, expression) {
    if (expression === "happy") return svg;
    if (["man", "woman", "child"].includes(avatar)) {
      if (expression === "wow") {
        if (avatar === "man") {
          svg = svg.replace(
            '<path d="M68 64q12 7 25-1l-3 10q-9 8-18 0Z" fill="#4c2b2d"/><path d="M75 63q5 4 10 0" stroke="#fff1db" stroke-width="2.5" stroke-linecap="round"/>',
            '<ellipse cx="80" cy="68" rx="4.5" ry="7" fill="#4c2b2d"/>',
          );
        } else {
          svg = svg.replace(
            '<path d="M69 57q10 7 20 0" stroke="#bd6677" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
            '<ellipse cx="79" cy="61" rx="4.5" ry="6.5" fill="#7f3d52"/>',
          );
        }
      }
      if (expression === "silly" && avatar === "man") {
        svg = svg.replace(
          '</svg>',
          '<ellipse cx="81" cy="70" rx="5" ry="4" fill="#f36b8b" stroke="#762d4b" stroke-width="1.2"/></svg>',
        );
      }
      if (expression === "silly" && ["woman", "child"].includes(avatar)) {
        svg = svg.replace(
          '<path d="M69 57q10 7 20 0" stroke="#bd6677" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
          '<path d="M69 57q10 11 20 0" stroke="#803e55" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="81" cy="64" rx="4" ry="3" fill="#f36b8b"/>',
        );
      }
      if (expression === "cool") {
        svg = svg.replace(
          '</svg>',
          '<g fill="#11182b" fill-opacity=".92" stroke="#d8f5ff" stroke-width="1.5"><rect x="60" y="39" width="18" height="12" rx="4"/><rect x="84" y="39" width="18" height="12" rx="4"/><path d="M78 43h6"/></g></svg>',
        );
      }
    } else if (avatar === "robot") {
      if (expression === "wow") {
        svg = svg.replace(
          '<path d="M53 67h22" stroke="#6c73ff" stroke-width="4" stroke-linecap="round"/>',
          '<ellipse cx="64" cy="67" rx="4.5" ry="6" fill="#6c73ff"/>',
        );
      }
      if (expression === "silly") {
        svg = svg.replace(
          '<path d="M53 67h22" stroke="#6c73ff" stroke-width="4" stroke-linecap="round"/>',
          '<path d="M54 65q10 12 20 0" fill="none" stroke="#ff4fd8" stroke-width="4" stroke-linecap="round"/>',
        );
      }
      if (expression === "cool") {
        svg = svg.replace(
          '</svg>',
          '<rect x="41" y="42" width="46" height="9" rx="4" fill="#10152b" fill-opacity=".94" stroke="#a7f4ff" stroke-width="1.5"/></svg>',
        );
      }
    } else if (avatar === "cat") {
      if (expression === "wow") {
        svg = svg.replace(
          '</svg>',
          '<ellipse cx="64" cy="63" rx="5" ry="6" fill="#9b4e53" stroke="#3c2942" stroke-width="1.5"/></svg>',
        );
      }
    } else if (avatar === "dog") {
      if (expression === "wow") {
        svg = svg.replace('</svg>', '<ellipse cx="64" cy="68" rx="5" ry="7" fill="#9b4e53" stroke="#603525" stroke-width="1.5"/></svg>');
      }
      if (expression === "silly") {
        svg = svg.replace('</svg>', '<path d="M61 68q7 2 7 8v5q-7 4-8-3Z" fill="#f36b8b" stroke="#762d4b" stroke-width="1.2"/></svg>');
      }
      if (expression === "cool") {
        svg = svg.replace('</svg>', '<g fill="#11182b" fill-opacity=".92" stroke="#fff" stroke-width="1.2"><rect x="39" y="42" width="20" height="11" rx="4"/><rect x="69" y="42" width="20" height="11" rx="4"/><path d="M59 46h10"/></g></svg>');
      }
      if (expression === "silly") {
        svg = svg.replace(
          '</svg>',
          '<ellipse cx="69" cy="64" rx="5" ry="4" fill="#f36b8b" stroke="#762d4b" stroke-width="1.2"/></svg>',
        );
      }
      if (expression === "cool") {
        svg = svg.replace(
          '</svg>',
          '<g fill="#11182b" fill-opacity=".92" stroke="#fff" stroke-width="1.2"><rect x="40" y="38" width="19" height="11" rx="4"/><rect x="69" y="38" width="19" height="11" rx="4"/><path d="M59 42h10"/></g></svg>',
        );
      }
    }
    return svg;
  }
  function applyHeadwearAndAccessory(svg, avatar, appearance) {
    const hats = {
      cap: '<path d="M49 18Q49 5 70 3q27-2 39 15L49 25Z" fill="#1778d4" stroke="#102951" stroke-width="2.5"/><path d="M49 20q28-8 61-2 6 2 5 6-28-5-61 4-7 2-8-3Z" fill="#39c8ff" stroke="#102951" stroke-width="2"/>',
      crown: '<path d="m50 22-5-18 19 12L80 0l16 16 19-12-5 20Z" fill="#ffd534" stroke="#9b4d13" stroke-width="3" stroke-linejoin="round"/><path d="M51 21h56v7H51Z" fill="#ff8b24" stroke="#9b4d13" stroke-width="2"/><circle cx="62" cy="21" r="3" fill="#39e8ff"/><circle cx="80" cy="21" r="3" fill="#ff4fd8"/><circle cx="97" cy="21" r="3" fill="#39e8ff"/>',
      party: '<path d="m52 26 27-25 28 25Z" fill="#ff4fd8" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><path d="m63 16 7 4m14-9 1 8m14 0 4 4" stroke="#ffe66d" stroke-width="4" stroke-linecap="round"/><circle cx="79" cy="2.5" r="5" fill="#39e8ff" stroke="#fff" stroke-width="1.5"/>',
    };
    const frames = {
      man: { glasses: [59, 40, 18, 12, 84], bow: [101, 30], headphones: [42, 46, 118, 46] },
      woman: { glasses: [58, 40, 19, 12, 84], bow: [102, 30], headphones: [42, 47, 118, 47] },
      child: { glasses: [57, 41, 18, 12, 83], bow: [101, 31], headphones: [43, 46, 116, 46] },
      robot: { glasses: [39, 39, 22, 16, 67], bow: [91, 24], headphones: [25, 48, 103, 48] },
      cat: { glasses: [39, 38, 20, 13, 68], bow: [91, 25], headphones: [23, 47, 105, 47] },
      dog: { glasses: [38, 44, 20, 12, 70], bow: [91, 28], headphones: [24, 50, 104, 50] },
    };
    let graphics = "";
    if (hats[appearance.hat]) graphics += hats[appearance.hat];
    const frame = frames[avatar];
    if (frame && appearance.accessory === "glasses") {
      const [x, y, width, height, rightX] = frame.glasses;
      graphics += `<g fill="#10182c" fill-opacity=".9" stroke="#c8f5ff" stroke-width="1.7"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="4"/><rect x="${rightX}" y="${y}" width="${width}" height="${height}" rx="4"/><path d="M${x + width} ${y + 5}h${rightX - x - width}"/></g>`;
    } else if (frame && appearance.accessory === "bow") {
      const [x, y] = frame.bow;
      graphics += `<g stroke="#8c246e" stroke-width="1.8" stroke-linejoin="round"><path d="M${x} ${y}q-15-13-17 0 2 10 17 4 15 6 17-4-2-13-17 0Z" fill="#ff58bf"/><circle cx="${x}" cy="${y + 1}" r="4" fill="#ffe66d"/></g>`;
    } else if (frame && appearance.accessory === "headphones") {
      const [left, y, right] = frame.headphones;
      const top = avatar === "man" || avatar === "woman" || avatar === "child" ? y - 43 : y - 35;
      graphics += `<g fill="none" stroke="#39e8ff" stroke-width="5"><path d="M${left} ${y}Q${left - 2} ${top} ${(left + right) / 2} ${top}T${right} ${y}"/></g><g fill="#ff4fd8" stroke="#fff" stroke-width="1.5"><rect x="${left - 5}" y="${y - 7}" width="10" height="22" rx="5"/><rect x="${right - 5}" y="${y - 7}" width="10" height="22" rx="5"/></g>`;
    }
    return graphics ? svg.replace("</svg>", `${graphics}</svg>`) : svg;
  }
  function customizeAvatarSvg(svg, avatar, appearance) {
    const hairTargets = {
      man: ["#39252a"],
      woman: ["#6d4029", "#7f4a2d", "#e6b775"],
      child: ["#a66b32"],
    };
    const hairColors = {
      curly: ["#382544", "#50325d", "#aa86ba"],
      spiky: ["#9a4525", "#b75a2d", "#e2943d"],
      blonde: ["#efc458", "#d69637", "#ffe18d"],
    };
    const sources = hairTargets[avatar] || [];
    const replacements = hairColors[appearance.hair] || [];
    sources.forEach((source, index) => {
      if (replacements[index]) svg = svg.split(source).join(replacements[index]);
    });
    if (["man", "woman", "child"].includes(avatar)) {
      if (appearance.hair === "curly") {
        const curls = {
          man: [52, 18, 64, 10, 78, 7, 92, 10, 105, 18],
          woman: [53, 19, 65, 11, 79, 8, 93, 11, 105, 20],
          child: [52, 20, 64, 12, 78, 9, 92, 12, 104, 20],
        }[avatar];
        const circles = [];
        for (let i = 0; i < curls.length; i += 2)
          circles.push(`<circle cx="${curls[i]}" cy="${curls[i + 1]}" r="7"/>`);
        svg = svg.replace("</svg>", `<g fill="#382544" stroke="#241d32" stroke-width="2">${circles.join("")}</g></svg>`);
      } else if (appearance.hair === "spiky") {
        const spikes = {
          man: "M48 38 41 13l17 13 1-20 14 18L81 2l9 21 16-14-4 21 11-8-7 27Z",
          woman: "M48 39 42 14l17 12 2-20 15 18L83 2l10 21 16-13-4 22 10-7-6 39-16-18-31 0Z",
          child: "M48 39 42 15l16 12 2-20 15 18L83 4l9 20 15-13-4 21 9-7-7 27Z",
        }[avatar];
        svg = svg.replace("</svg>", `<path d="${spikes}" fill="#b75a2d" stroke="#44263c" stroke-width="2.5" stroke-linejoin="round"/></svg>`);
      }
    }

    const outfits = {
      blue: ["#3297ef", "#1351b0"],
      pink: ["#ff69c9", "#bf2b91"],
      green: ["#55d778", "#167f50"],
      gold: ["#ffd25b", "#d28a13"],
    };
    const colors = outfits[appearance.outfit] || outfits.blue;
    let stopIndex = 0;
    svg = svg.replace(
      /<linearGradient id="(?:shirt|top)"[\s\S]*?<\/linearGradient>/g,
      (gradient) =>
        gradient.replace(/stop-color="#[0-9a-fA-F]{6}"/g, () => {
          const color = colors[Math.min(stopIndex, colors.length - 1)];
          stopIndex++;
          return `stop-color="${color}"`;
        }),
    );
    if (avatar === "robot") {
      const colorsByOutfit = {
        blue: ["#626dff", "#44e9ff"],
        pink: ["#c343df", "#ff70d8"],
        green: ["#22ac82", "#65f3b5"],
        gold: ["#d89c26", "#ffe66d"],
      };
      const [body, accent] = colorsByOutfit[appearance.outfit] || colorsByOutfit.blue;
      svg = svg.replaceAll("#626dff", body).replaceAll("#44e9ff", accent);
    }
    if (avatar === "cat" || avatar === "dog") {
      const colorsByOutfit = {
        blue: ["#087de1", "#39e8ff"],
        pink: ["#d63fba", "#ff83db"],
        green: ["#188e61", "#75ef9a"],
        gold: ["#cf8a18", "#ffe66d"],
      };
      const [body, accent] = colorsByOutfit[appearance.outfit] || colorsByOutfit.blue;
      svg = svg.replaceAll("#a967ff", body).replaceAll("#ff4fd8", accent);
    }
    svg = applyFacialExpression(svg, avatar, appearance.expression);
    svg = applyHeadwearAndAccessory(svg, avatar, appearance);
    return svg;
  }
  async function updateCharacterArtwork(avatar, appearance) {
    const image = $(".character-full");
    if (!image) return;
    const version = ++avatarPreviewVersion;
    try {
      let source = avatarSvgCache.get(avatar);
      if (!source) {
        const response = await fetch(`assets/avatar-${avatar}.svg`);
        if (!response.ok) return;
        source = await response.text();
        avatarSvgCache.set(avatar, source);
      }
      if (version !== avatarPreviewVersion || !image.isConnected) return;
      const customized = customizeAvatarSvg(source, avatar, appearance);
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(customized)}`;
    } catch (error) {
      // Keep the original SVG as a usable fallback if custom preview rendering fails.
    }
  }
  function btn(label, action, cls = "btn") {
    return `<button class="${cls}" data-action="${action}">${label}</button>`;
  }
  function head(title, desc = "") {
    return `<div class="section-title screen-title"><div><div class="eyebrow">SHARADES • PARTY CHALLENGE</div><h2>${title}</h2>${desc ? `<p class="muted tiny">${desc}</p>` : ""}</div></div>`;
  }
  function setHeader() {
    document.documentElement.lang = state.lang;
    $("#langBtn").textContent = state.lang === "cs" ? "🇨🇿 CZ" : "🇬🇧 EN";
    $("#soundBtn").textContent = state.sound ? "🔊" : "🔇";
  }
  function show(screen) {
    currentScreen = screen;
    document.body.classList.toggle(
      "intro-active",
      screen === "language" || (screen === "tutorial" && !state.onboarded),
    );
    if (screen !== "game") stopTimer();
    if (screen !== "game") run.paused = false;
    render[screen] ? render[screen]() : render.home();
    setHeader();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const render = {
    home() {
      const totalWords = Object.values(window.SHARADES_WORDS[state.lang] || {}).flat().length;
      const player = state.players[0];
      app.innerHTML = `<section class="hero home-dashboard">
        <div class="home-dashboard-top"><button class="home-profile" data-screen="profile"><img class="avatar" src="assets/avatar-${player?.avatar || "man"}.svg" alt=""><span><strong>${esc(player?.name || "Sharades")}</strong><small>${state.lang === "cs" ? "Připraven/a hrát" : "Ready to play"}</small></span></button><div class="home-coins" title="${state.lang === "cs" ? "Mince za správné odpovědi" : "Coins for correct answers"}">🪙 ${state.coins ?? 25}</div><button class="icon-btn" data-screen="settings" aria-label="${t("settings")}">⚙</button></div>
        <div class="home-logo" role="img" aria-label="Sharades Party Challenge"><span>SHARADES!</span><b>PARTY CHALLENGE</b><small>${t("tag")}</small></div>
        <div class="hero-stage home-family"><img class="hero-scene" src="assets/components/family-and-dog.png" alt="${state.lang === "cs" ? "Rodina a pes připraveni hrát šarády" : "Family and dog ready to play charades"}"></div>
        ${btn("▶ " + t("new"), "modes", "btn home-play")}
        <div class="grid home-tiles home-primary-links">
          <button class="select-card" data-screen="categories"><span class="emoji">🎬</span><strong>${t("categories")}</strong><small>${totalWords} ${t("words")}</small></button>
          <button class="select-card" data-screen="avatars"><span class="emoji">🎨</span><strong>${t("avatars")}</strong><small>${state.players.length} ${state.lang === "cs" ? "hráčů" : "players"}</small></button>
          <button class="select-card" data-screen="players"><span class="emoji">👥</span><strong>${t("players")}</strong><small>${state.players.length} ${state.lang === "cs" ? "hráčů" : "players"}</small></button>
          <button class="select-card" data-screen="settings"><span class="emoji">⚙️</span><strong>${t("settings")}</strong><small>${state.lang.toUpperCase()} · ${state.roundSeconds}s</small></button>
        </div>
        <div class="home-quick-links">
          <button data-screen="ai">🤖 ${t("ai")}</button><button data-screen="custom">✨ ${t("custom")}</button><button data-screen="stats">📊 ${t("stats")}</button><button data-screen="achievements">🏆 ${t("achievements")}</button><button data-screen="tutorial">💡 ${t("tutorial")}</button><button data-screen="offline">📶 ${t("offline")}</button>
        </div>
      </section>`;
    },
    language() {
      app.innerHTML = `<section class="title-page"><div class="title-art"><img src="${state.lang === "cs" ? "assets/images/title-screen-cz.png" : "assets/Images/title-screen-en.webp"}" alt="${state.lang === "cs" ? "Sharades! Předváděj, hádej a bav se spolu." : "Sharades! Act, guess and laugh together."}"><label class="sr-only" for="titleLanguage">${state.lang === "cs" ? "Jazyk" : "Language"}</label><select id="titleLanguage" class="title-language" aria-label="${state.lang === "cs" ? "Vybrat jazyk" : "Choose language"}"><option value="cs" ${state.lang === "cs" ? "selected" : ""}>🇨🇿 Čeština</option><option value="en" ${state.lang === "en" ? "selected" : ""}>🇬🇧 English</option></select></div></section>`;
    },
    modes() {
      const modes = [
        [
          "classic",
          "🎯",
          state.lang === "cs" ? "Klasika" : "Classic",
          state.lang === "cs"
            ? "Společné skóre, střídáte se s předváděním."
            : "One shared score; take turns acting.",
        ],
        [
          "teams",
          "👥",
          state.lang === "cs" ? "Souboj týmů" : "Team battle",
          state.lang === "cs"
            ? "Dva týmy sbírají body ve střídajících se kolech."
            : "Two teams score in alternating turns.",
        ],
        [
          "sudden",
          "💀",
          state.lang === "cs" ? "Náhlá smrt" : "Sudden death",
          state.lang === "cs"
            ? "První přeskočené slovo ukončí hru."
            : "The first skipped word ends the game.",
        ],
        [
          "marathon",
          "🏃",
          state.lang === "cs" ? "Maraton" : "Marathon",
          state.lang === "cs"
            ? "Dvě minuty na co nejvíc slov."
            : "Two minutes to guess as many words as possible.",
        ],
        [
          "double",
          "✨",
          state.lang === "cs" ? "Dvojité body" : "Double points",
          state.lang === "cs"
            ? "Každé uhodnuté slovo přidá dva body."
            : "Each correct word scores two points.",
        ],
        [
          "pantomime",
          "🤫",
          state.lang === "cs" ? "Pantomima" : "Mime",
          state.lang === "cs"
            ? "Předváděj bez mluvení a zvuků."
            : "Act without speaking or making sounds.",
        ],
        [
          "drawing",
          "✏️",
          state.lang === "cs" ? "Kreslení" : "Drawing",
          state.lang === "cs"
            ? "Kresli na papír; bez písmen, čísel a zvuků."
            : "Draw on paper; no letters, numbers, or sounds.",
        ],
      ];
      app.innerHTML = `${head(state.lang === "cs" ? "Vyber režim" : "Choose a mode")}<div class="feature-list mode-list">${modes.map(([id, icon, name, desc]) => `<button class="feature-row mode-option ${state.mode === id ? "selected" : ""}" data-mode="${id}"><span class="feature-icon">${icon}</span><span><strong>${name}</strong><small>${desc}</small></span><span>${state.mode === id ? "✓" : "›"}</span></button>`).join("")}</div>${btn("← " + t("back"), "home", "btn secondary top-gap")}`;
    },
    setup() {
      const teams = state.teams.slice(0, 4);
      app.innerHTML = `${head(t("new"))}<div class="card"><div class="field"><label>${t("mode")}</label><div class="row between"><strong>${modeLabel(state.mode)}</strong><button class="chip" data-screen="modes">✎ ${state.lang === "cs" ? "Změnit" : "Change"}</button></div><p class="hint">${modeDescription(state.mode)}</p></div><div class="field"><label>${t("time")}</label><div class="chips">${[30, 45, 60, 90, 120].map((n) => `<button class="chip ${state.roundSeconds === n ? "active" : ""}" data-seconds="${n}">${n}s</button>`).join("")}</div></div><div class="field"><label>${t("rounds")}</label><div class="chips">${[1, 2, 3, 5, 7].map((n) => `<button class="chip ${state.rounds === n ? "active" : ""}" data-rounds="${n}">${n}</button>`).join("")}</div></div><div class="field"><label>${t("choose")}</label><div class="chips">${categoryButtons()}</div></div><label class="row"><input type="checkbox" id="familyMode" ${state.family ? "checked" : ""}> ${t("family")}</label><p class="hint">${t("settingsText")}</p></div><div class="stack top-gap">${btn("▶ " + t("start"), "begin")}${btn("← " + t("back"), "home", "btn secondary")}</div>`;
    },
    categories() {
      app.innerHTML = `${head(t("categories"), t("choose"))}<div class="grid">${Object.entries(
        window.SHARADES_WORDS[state.lang] || window.SHARADES_WORDS.cs,
      )
        .map(
          ([c, w]) =>
            `<button class="select-card ${state.categories.includes(c) ? "selected" : ""}" data-category="${esc(c)}" data-toggle-category="1"><span class="emoji">${catEmoji(c)}</span><strong>${esc(c)}</strong><small>${w.length} ${t("words")} ${state.categories.includes(c) ? "✓" : ""}</small></button>`,
        )
        .join(
          "",
        )}</div><p class="hint top-gap">${state.lang === "cs" ? "Vybrané dlaždice určují, ze kterých slov bude hra vybírat." : "Selected tiles control which words the game can use."}</p>${btn("✓ " + t("save"), "save-categories", "btn secondary")}${btn("← " + t("back"), "home", "btn secondary top-gap")}`;
    },
    profile() {
      const p = state.players[0];
      app.innerHTML = `${head(state.lang === "cs" ? "Profil" : "Profile")}<div class="card center">${p ? `<img class="avatar" src="assets/avatar-${p.avatar}.svg" alt=""><h2>${esc(p.name)}</h2>` : ""}<div class="home-coins">🪙 ${state.coins ?? 25} ${state.lang === "cs" ? "mincí" : "coins"}</div><p class="notice top-gap">${state.lang === "cs" ? "Za správné odpovědi získáváš mince. Svůj vzhled upravíš v editoru postavy." : "Earn coins for correct answers. Personalize your look in the character editor."}</p>${btn("🎨 " + t("avatars"), "avatars", "btn cyan")}${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
    },
    players() {
      app.innerHTML = `${head(t("players"))}<div class="card"><div class="field"><label>${t("name")}</label><div class="row"><input id="playerName" class="field-input" maxlength="24" placeholder="${t("name")}" style="min-width:0;flex:1;padding:12px;background:#0d0e20;color:white;border:1px solid var(--stroke);border-radius:12px">${btn("＋", "add-player", "btn small cyan")}</div></div><div class="player-list">${state.players.map((p, i) => `<div class="player"><img class="avatar" src="assets/avatar-${p.avatar}.svg" alt=""><div class="name">${esc(p.name)}</div><select data-playerteam="${i}" aria-label="${t("team")}">${state.teams.map((tm, j) => `<option value="${j}" ${p.team === j ? "selected" : ""}>${esc(tm.name)}</option>`).join("")}</select><button class="remove" data-remove="${i}">×</button></div>`).join("")}</div><div class="divider"></div>${state.teams.map((team, i) => `<div class="field"><label>${t("teamName")} ${i + 1}</label><input data-teamname="${i}" maxlength="30" value="${esc(team.name)}"></div>`).join("")} ${btn(t("save"), "save-players", "btn secondary")}</div>${btn("← " + t("back"), "home", "btn secondary top-gap")}`;
    },
    custom() {
      app.innerHTML = `${head(t("custom"))}<div class="card"><p class="muted tiny">${t("custom")} — ${t("customHint")}</p><div class="field"><textarea id="customText" rows="8" maxlength="8000" placeholder="${state.lang === "cs" ? "Horská dráha\nGrilování\nAstronaut" : "Roller coaster\nBarbecue\nAstronaut"}">${esc(state.customWords.join("\n"))}</textarea></div><p class="hint">${state.customWords.length} ${t("words")}</p>${btn(t("save"), "save-custom")}${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
    },
    settings() {
      app.innerHTML = `${head(t("settings"))}<div class="card settings-card">
        <div class="field"><label>${state.lang === "cs" ? "Jazyk" : "Language"}</label><div class="chips"><button class="chip ${state.lang === "cs" ? "active" : ""}" data-language="cs">🇨🇿 Čeština</button><button class="chip ${state.lang === "en" ? "active" : ""}" data-language="en">🇬🇧 English</button></div></div>
        <div class="field"><label>${state.lang === "cs" ? "Čas na tah" : "Round length"}</label><div class="chips">${[30, 45, 60, 90, 120].map((n) => `<button class="chip ${state.roundSeconds === n ? "active" : ""}" data-seconds="${n}">${n} s</button>`).join("")}</div></div>
        <label class="row settings-toggle"><input type="checkbox" id="soundPref" ${state.sound ? "checked" : ""}> ${state.lang === "cs" ? "Zvukové efekty" : "Sound effects"}</label>
        <label class="row settings-toggle"><input type="checkbox" id="musicPref" ${state.music ? "checked" : ""}> ${state.lang === "cs" ? "Hudba na pozadí" : "Background music"}</label>
        <p class="hint settings-hint">${state.lang === "cs" ? "Krátká instrumentální smyčka se přehraje po zapnutí." : "A short instrumental loop plays when enabled."}</p>
        <label class="row settings-toggle"><input type="checkbox" id="vibPref" ${state.vibration ? "checked" : ""}> ${state.lang === "cs" ? "Vibrace" : "Vibration"}</label>
        <label class="row settings-toggle"><input type="checkbox" id="themePref" ${state.theme === "dark" ? "checked" : ""}> ${state.lang === "cs" ? "Tmavý režim" : "Dark mode"}</label>
        <label class="row settings-toggle"><input type="checkbox" id="offlinePref" ${state.offlineMode ? "checked" : ""}> ${state.lang === "cs" ? "Používat pouze uložené soubory" : "Use cached files only"}</label>
        <p class="notice settings-hint">${state.lang === "cs" ? "Offline režim blokuje síťové požadavky stránky. Pro první uložení hry ji nejdřív otevři online." : "Offline mode blocks network requests from the app. Open the game online once to cache it first."}</p>
        ${btn(t("save"), "save-settings")}${btn(t("reset"), "reset", "btn secondary top-gap")}${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
    },
    ai() {
      const language = generatedLanguage || state.lang;
      app.innerHTML = `${head(t("ai"), t("aiNote"))}<div class="card"><div class="field"><label>${t("aiTopic")}</label><input id="aiTopic" maxlength="80" placeholder="${language === "cs" ? "např. dinosauři, Minecraft, dovolená" : "e.g. dinosaurs, Minecraft, holiday"}" value=""></div><div class="field"><label>${state.lang === "cs" ? "Jazyk slov" : "Word language"}</label><select id="aiLanguage"><option value="cs" ${language === "cs" ? "selected" : ""}>🇨🇿 Čeština</option><option value="en" ${language === "en" ? "selected" : ""}>🇬🇧 English</option></select></div><div class="field"><label>${t("aiCount")}</label><div class="chips">${[5, 10, 15, 20].map((n) => `<button class="chip ${n === 10 ? "active" : ""}" data-ai-count="${n}">${n}</button>`).join("")}</div><input id="aiCount" type="hidden" value="10"></div><div class="field"><label>${state.lang === "cs" ? "Obtížnost" : "Difficulty"}</label><select id="aiDifficulty"><option value="easy" ${state.difficulty === "easy" ? "selected" : ""}>${state.lang === "cs" ? "Lehká" : "Easy"}</option><option value="normal" ${state.difficulty === "normal" ? "selected" : ""}>${state.lang === "cs" ? "Střední" : "Medium"}</option><option value="hard" ${state.difficulty === "hard" ? "selected" : ""}>${state.lang === "cs" ? "Těžká" : "Hard"}</option></select></div><p class="notice">${t("featureAI")}</p>${btn("✨ " + t("generate"), "generate-local", "btn cyan")}${suggestions.length ? `<div class="section-title"><div><h3>${t("generated")} (${suggestions.length})</h3><p class="hint">${state.lang === "cs" ? "Zaškrtni slova, která chceš uložit nebo rovnou hrát." : "Select the words you want to save or play now."}</p></div></div><div class="feature-list">${suggestions.map((w, i) => `<label class="feature-row"><input type="checkbox" data-generated-index="${i}" checked><span class="feature-icon">💡</span><span><strong>${esc(w.word)}</strong><small>${esc(w.cat)}</small></span></label>`).join("")}</div><div class="stack top-gap">${btn("＋ " + t("addWords"), "add-generated", "btn green")}${btn("▶ " + (state.lang === "cs" ? "Hrát vybraná slova" : "Play selected words"), "start-generated", "btn cyan")}</div>` : ""}${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
    },
    avatars() {
      if (!state.players.length) {
        app.innerHTML = `${head(t("avatars"))}<div class="card">${t("selectPlayer")}</div>${btn("← " + t("back"), "home", "btn secondary top-gap")}`;
        return;
      }
      avatarPlayer = Math.min(avatarPlayer, state.players.length - 1);
      const player = state.players[avatarPlayer];
      player.appearance = { ...appearanceDefaults(), ...(player.appearance || {}) };
      state.cosmeticUnlocks = {
        ...defaultCosmeticUnlocks(),
        ...(state.cosmeticUnlocks || {}),
      };
      const appearance = player.appearance;
      const options = {
        hair: {
          cs: "Účes",
          en: "Hair",
          values: [
            ["natural", "✨", "Přirozený", "Natural"],
            ["curly", "🌀", "Kudrnatý", "Curly"],
            ["spiky", "⚡", "Rozježený", "Spiky"],
            ["blonde", "🌟", "Světlý", "Blonde"],
          ],
        },
        hat: {
          cs: "Čepice",
          en: "Hat",
          values: [
            ["none", "🚫", "Bez čepice", "No hat"],
            ["cap", "🧢", "Kšiltovka", "Cap"],
            ["crown", "👑", "Koruna", "Crown"],
            ["party", "🎉", "Party klobouk", "Party hat"],
          ],
        },
        outfit: {
          cs: "Oblečení",
          en: "Outfit",
          values: [
            ["blue", "🔵", "Modrá", "Blue"],
            ["pink", "💗", "Růžová", "Pink"],
            ["green", "🟢", "Zelená", "Green"],
            ["gold", "🟡", "Zlatá", "Gold"],
          ],
        },
        accessory: {
          cs: "Doplňky",
          en: "Accessories",
          values: [
            ["none", "🚫", "Bez doplňku", "No accessory"],
            ["glasses", "🕶️", "Brýle", "Glasses"],
            ["bow", "🎀", "Mašle", "Bow"],
            ["headphones", "🎧", "Sluchátka", "Headphones"],
          ],
        },
        background: {
          cs: "Pozadí",
          en: "Background",
          values: [
            ["party", "🎊", "Párty", "Party"],
            ["beach", "🏖️", "Pláž", "Beach"],
            ["space", "🌌", "Vesmír", "Space"],
            ["forest", "🌳", "Les", "Forest"],
          ],
        },
        expression: {
          cs: "Výraz",
          en: "Expression",
          values: [
            ["happy", "😄", "Veselý", "Happy"],
            ["wow", "😮", "Překvapený", "Surprised"],
            ["cool", "😎", "Frajer", "Cool"],
            ["silly", "🤪", "Šibalský", "Silly"],
          ],
        },
      };
      const labels = {
        man: state.lang === "cs" ? "Muž" : "Man",
        woman: state.lang === "cs" ? "Žena" : "Woman",
        child: state.lang === "cs" ? "Dítě" : "Child",
        robot: "Robot",
        cat: state.lang === "cs" ? "Kočka" : "Cat",
        dog: state.lang === "cs" ? "Pes" : "Dog",
      };
      if (!["man", "woman", "child"].includes(player.avatar)) delete options.hair;
      if (!options[appearanceTab]) appearanceTab = Object.keys(options)[0] || "hat";
      const tab = options[appearanceTab];
      app.innerHTML = `${head(t("avatars"), state.lang === "cs" ? "Vyber postavu a uprav její vzhled." : "Choose a character and personalize their look.")}<div class="card character-editor">
        <div class="character-wallet">🪙 ${state.coins ?? 25} ${state.lang === "cs" ? "mincí" : "coins"}</div>
        <div class="field"><label>${t("forPlayer")}</label><select id="avatarPlayer">${state.players.map((p, i) => `<option value="${i}" ${i === avatarPlayer ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div>
        <div class="character-preview appearance-bg-${appearance.background}" data-outfit="${appearance.outfit}"><img class="character-full" src="assets/avatar-${player.avatar}.svg" alt="${esc(player.name)}"></div>
        <div class="avatar-picker">${avatarIds.map((id) => `<button class="avatar-option ${player.avatar === id ? "selected" : ""}" data-pick-avatar="${id}" aria-label="${labels[id]}"><img src="assets/avatar-${id}.svg" alt="${labels[id]}"></button>`).join("")}</div>
        <div class="appearance-tabs">${Object.entries(options).map(([id, item]) => `<button class="chip ${appearanceTab === id ? "active" : ""}" data-appearance-tab="${id}">${item[state.lang]}</button>`).join("")}</div>
        <h3 class="appearance-section-title">${tab[state.lang]}</h3><div class="appearance-options">${tab.values.map(([id, icon, cs, en]) => { const unlocked = state.cosmeticUnlocks[appearanceTab]?.includes(id); const cost = cosmeticPrices[appearanceTab]?.[id] || 0; const detail = unlocked ? (appearance[appearanceTab] === id ? (state.lang === "cs" ? "Použito" : "Equipped") : (state.lang === "cs" ? "Odemčeno" : "Owned")) : `🔒 🪙 ${cost}`; return `<button class="appearance-option ${appearance[appearanceTab] === id ? "selected" : ""} ${unlocked ? "" : "locked"}" data-appearance="${appearanceTab}" data-value="${id}" aria-pressed="${appearance[appearanceTab] === id}"><span>${icon}</span><strong>${state.lang === "cs" ? cs : en}<small>${detail}</small></strong></button>`; }).join("")}</div>
        <p class="hint top-gap">${state.lang === "cs" ? "Změny vzhledu se ukládají pro každého hráče v tomto zařízení." : "Appearance changes are saved per player on this device."}</p>${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
      updateCharacterArtwork(player.avatar, appearance);
    },
    achievements() {
      const best = state.history.reduce(
        (m, h) => Math.max(m, Number(h.score) || 0),
        0,
      );
      const items = [
        {
          icon: "🎉",
          name: state.lang === "cs" ? "První hra" : "First game",
          desc:
            state.lang === "cs"
              ? "Odehraj první hru"
              : "Finish your first game",
          ok: state.history.length >= 1,
        },
        {
          icon: "🏅",
          name: state.lang === "cs" ? "Zkušený hráč" : "Seasoned player",
          desc: state.lang === "cs" ? "Odehraj 5 her" : "Finish 5 games",
          ok: state.history.length >= 5,
        },
        {
          icon: "🧠",
          name: state.lang === "cs" ? "Mistr hádání" : "Guess master",
          desc:
            state.lang === "cs"
              ? "Získej alespoň 10 bodů"
              : "Reach a score of 10",
          ok: best >= 10,
        },
        {
          icon: "👥",
          name: state.lang === "cs" ? "Velká parta" : "Big party",
          desc: state.lang === "cs" ? "Přidej 4 hráče" : "Add 4 players",
          ok: state.players.length >= 4,
        },
        {
          icon: "✨",
          name: state.lang === "cs" ? "Slovní mág" : "Word wizard",
          desc:
            state.lang === "cs"
              ? "Ulož 10 vlastních slov"
              : "Save 10 custom words",
          ok: state.customWords.length >= 10,
        },
      ];
      app.innerHTML = `${head(t("achievements"), `${items.filter((x) => x.ok).length} / ${items.length} ${t("unlocked").toLowerCase()}`)}<div class="feature-list">${items.map((x) => `<div class="feature-row" style="opacity:${x.ok ? 1 : 0.62};border-color:${x.ok ? "#ffe66d" : "#2588cc"}"><span class="feature-icon">${x.icon}</span><span style="flex:1"><strong>${esc(x.name)}</strong><small>${esc(x.desc)}</small></span><span>${x.ok ? "✅" : "🔒"}</span></div>`).join("")}</div>${btn("← " + t("back"), "home", "btn secondary top-gap")}`;
    },
    offline() {
      app.innerHTML = `${head(t("offline"), t("offlineReady"))}<div class="card"><div class="feature-list"><div class="feature-row"><span class="feature-icon">${navigator.onLine ? "🌐" : "📴"}</span><span><strong>${t("online")}</strong><small>${navigator.onLine ? (state.lang === "cs" ? "Připojeno" : "Connected") : state.lang === "cs" ? "Bez připojení" : "Offline"}</small></span></div><div class="feature-row"><span class="feature-icon">📦</span><span><strong>${state.lang === "cs" ? "Uložená slovní zásoba" : "Built-in word lists"}</strong><small>${state.lang === "cs" ? "Kategorie a vlastní slova jsou v zařízení" : "Categories and custom words are stored locally"}</small></span></div><div class="feature-row"><span class="feature-icon">💾</span><span><strong>${state.lang === "cs" ? "Lokální nastavení a výsledky" : "Local settings and results"}</strong><small>${state.history.length} ${state.lang === "cs" ? "uložených her" : "saved games"}</small></span></div></div><p class="notice top-gap">${t("offlineNote")}</p>${btn("↻ " + (state.lang === "cs" ? "Zkontrolovat stav" : "Check status"), "offline-refresh", "btn cyan")}${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
    },
    about() {
      app.innerHTML = `${head(t("about"))}<div class="card center"><img src="assets/logo.svg" alt="Sharades" style="width:92px;height:92px"><h2>SHARADES</h2><div class="eyebrow">PARTY CHALLENGE</div><p class="subtitle top-gap">${t("aboutText")}</p><div class="feature-list" style="text-align:left"><div class="feature-row"><span class="feature-icon">🌍</span><span><strong>Čeština / English</strong><small>${state.lang === "cs" ? "Dva jazyky, jeden společný zážitek" : "Two languages, one shared experience"}</small></span></div><div class="feature-row"><span class="feature-icon">📱</span><span><strong>PWA</strong><small>${state.lang === "cs" ? "Instalovatelná webová aplikace" : "Installable web app"}</small></span></div><div class="feature-row"><span class="feature-icon">🔒</span><span><strong>${state.lang === "cs" ? "Soukromí" : "Privacy"}</strong><small>${state.lang === "cs" ? "Nastavení a historie zůstávají v tomto zařízení" : "Settings and history stay on this device"}</small></span></div></div><p class="muted tiny top-gap">${t("version")}</p><p class="hint">${t("featureAI")}</p>${btn("⌂ " + t("home"), "home", "btn secondary top-gap")}</div>`;
    },
    tutorial() {
      const steps =
        state.lang === "cs"
          ? [
              [
                "Přilož telefon na čelo",
                "Ostatní hráči uvidí slovo a předvádějí ho.",
                "assets/tutorial-1.webp",
              ],
              [
                "Hádej předváděné slovo",
                "Slovo na displeji vidíš jen ty.",
                "assets/tutorial-2.webp",
              ],
              [
                "Uhodnuto? Nakloň nahoru",
                "Počítá se bod a zobrazí se další slovo.",
                "assets/tutorial-3.webp",
              ],
              [
                "Nevíš? Nakloň dolů",
                "Slovo přeskočíš a hra pokračuje.",
                "assets/tutorial-4.webp",
              ],
              [
                "Po čase uvidíš výsledek",
                "Předej telefon a pokračujte dalším kolem.",
                "assets/tutorial-5.webp",
              ],
            ]
          : [
              [
                "Hold the phone to your forehead",
                "Other players see the word and act it out.",
                "assets/tutorial-1.webp",
              ],
              [
                "Guess the word being acted",
                "Only you can see the word on screen.",
                "assets/tutorial-2.webp",
              ],
              [
                "Got it? Tilt up",
                "Score a point and move to the next word.",
                "assets/tutorial-3.webp",
              ],
              [
                "Not sure? Tilt down",
                "Skip the word and keep playing.",
                "assets/tutorial-4.webp",
              ],
              [
                "See your score when time is up",
                "Pass the phone and start the next turn.",
                "assets/tutorial-5.webp",
              ],
            ];
      const [title, desc, img] = steps[tutorialStep];
      app.innerHTML = `${head(t("tutorial"), `${tutorialStep + 1} / ${steps.length}`)}<div class="card center"><div class="progress"><span style="width:${((tutorialStep + 1) / steps.length) * 100}%"></span></div><div class="tutorial-scene" data-tutorial-step="${tutorialStep + 1}" role="img" aria-label="${title}"><span class="scene-spark scene-spark-a" aria-hidden="true">✦</span><span class="scene-spark scene-spark-b" aria-hidden="true">✧</span><img class="tutorial-step-image" src="${img}" alt=""> <span class="scene-action" aria-hidden="true">${["📱", "🎭", "⬆️", "⬇️", "🎉"][tutorialStep]}</span></div><h2>${title}</h2><p class="subtitle">${desc}</p><div class="row between tutorial-nav">${tutorialStep ? '<button class="btn secondary small" data-tutorial-step="-1">← ' + (state.lang === "cs" ? "Zpět" : "Back") + "</button>" : "<span></span>"}<button class="btn small" data-tutorial-step="1">${tutorialStep === steps.length - 1 ? (state.lang === "cs" ? "Rozumím, hrát" : "Got it, play") : state.lang === "cs" ? "Další →" : "Next →"}</button></div><button class="text-btn top-gap" data-action="skip-tutorial">${state.lang === "cs" ? "Přeskočit návod" : "Skip tutorial"}</button></div>`;
    },
    stats() {
      const guessed = state.history.reduce(
        (sum, h) => sum + (Number(h.correct) || 0),
        0,
      );
      const best = state.history.reduce(
        (max, h) => Math.max(max, Number(h.streak) || 0),
        0,
      );
      const cats = state.history.flatMap((h) => h.categories || []);
      const favorite = cats.length
        ? cats.sort(
            (a, b) =>
              cats.filter((x) => x === b).length -
              cats.filter((x) => x === a).length,
          )[0]
        : "—";
      app.innerHTML = `${head(t("stats"))}<div class="grid three"><div class="card center"><strong>${state.history.length}</strong><p>${state.lang === "cs" ? "Odehrané hry" : "Games played"}</p></div><div class="card center"><strong>${guessed}</strong><p>${state.lang === "cs" ? "Uhodnutá slova" : "Words guessed"}</p></div><div class="card center"><strong>${best}</strong><p>${state.lang === "cs" ? "Nejdelší série" : "Best streak"}</p></div></div><div class="notice top-gap">${state.lang === "cs" ? "Oblíbená kategorie" : "Favorite category"}: ${esc(favorite)} · ${state.lang === "cs" ? "Medaile" : "Medals"}: ${state.history.length >= 5 ? "🏅" : "—"}</div><div class="card top-gap">${
        state.history.length
          ? state.history
              .slice()
              .reverse()
              .slice(0, 20)
              .map(
                (h) =>
                  `<div class="history-row"><span>${esc(h.winner)} · ${esc(new Date(h.date).toLocaleDateString())}</span><strong>${h.score} ${t("points")}</strong></div>`,
              )
              .join("")
          : `<p class="muted">${t("none")}</p>`
      }${state.history.length ? btn(t("clear"), "clear-history", "btn secondary top-gap") : ""}</div>${btn("← " + t("back"), "home", "btn secondary top-gap")}`;
    },
    game() {
      renderGame();
    },
    roundEnd() {
      app.innerHTML = `${head(t("timeup"))}<div class="card center"><div class="tutorial-visual">⏱️</div><h2>${esc(state.teams[run.turn]?.name || "")}</h2><p>${run.turnGuessed} ${t("correct")} · ${run.turnSkipped} ${t("skip")}</p><p class="eyebrow">${t("score")}: ${state.teams[run.turn]?.score || 0}</p></div>${btn("▶ " + t("next"), "next-turn")}${btn(t("results"), "finish-game", "btn secondary top-gap")}`;
    },
    results() {
      let ranked = state.teams
        .slice(0, state.teamCount)
        .slice()
        .sort((a, b) => b.score - a.score);
      app.innerHTML = `${head("🏆 " + t("results"))}<div class="card center"><div class="tutorial-visual">🏆</div><div class="eyebrow">${t("winner")}</div><h2>${esc(ranked[0]?.name || "—")}</h2><p class="subtitle">${ranked[0]?.score || 0} ${t("points")}</p></div><div class="scoreboard top-gap">${ranked.map((team, i) => `<div class="score-row ${i === 0 ? "winning" : ""}"><span class="pill">#${i + 1}</span><strong>${esc(team.name)}</strong><span class="score">${team.score}</span></div>`).join("")}</div>${btn("🔁 " + t("again"), "setup")}${btn("⌂ " + t("home"), "home", "btn secondary top-gap")}`;
    },
  };
  function modeLabel(mode) {
    const cs = state.lang === "cs";
    return (
      {
        classic: cs ? "Klasika" : "Classic",
        teams: cs ? "Souboj týmů" : "Team battle",
        sudden: cs ? "Náhlá smrt" : "Sudden death",
        marathon: cs ? "Maraton" : "Marathon",
        double: cs ? "Dvojité body" : "Double points",
        pantomime: cs ? "Pantomima" : "Mime",
        drawing: cs ? "Kreslení" : "Drawing",
      }[mode] || "Klasika"
    );
  }
  function modeDescription(mode) {
    const cs = state.lang === "cs";
    return (
      {
        classic: cs
          ? "Společné skóre a střídání hráčů."
          : "Shared score; players take turns.",
        teams: cs
          ? "Dva týmy soutěží o nejvyšší skóre."
          : "Two teams compete for the highest score.",
        sudden: cs
          ? "První přeskočené slovo ukončí hru."
          : "First skipped word ends the game.",
        marathon: cs
          ? "Časový limit 2 minuty; hrajete bez přerušení."
          : "Two-minute time limit; play continuously.",
        double: cs
          ? "Každá správná odpověď má hodnotu 2 bodů."
          : "Each correct answer is worth 2 points.",
        pantomime: cs
          ? "Bez mluvení, slovních nápověd a zvuků."
          : "No speaking, verbal hints, or sounds.",
        drawing: cs
          ? "Kresli na papír, bez písmen, čísel a zvuků."
          : "Draw on paper without letters, numbers, or sounds.",
      }[mode] || ""
    );
  }
  function categoryButtons() {
    return (
      `<button class="chip ${state.category === "all" && !state.categories.length ? "active" : ""}" data-category="all">${t("all")}</button>` +
      Object.keys(window.SHARADES_WORDS[state.lang] || {})
        .map(
          (c) =>
            `<button class="chip ${(state.categories.length ? state.categories.includes(c) : state.category === c) ? "active" : ""}" data-category="${esc(c)}">${catEmoji(c)} ${esc(c)}</button>`,
        )
        .join("")
    );
  }
  function catEmoji(c) {
    return /animal|zvíř/i.test(c)
      ? "🐾"
      : /sport/i.test(c)
        ? "⚽"
        : /food|jíd/i.test(c)
          ? "🍕"
          : /fil|movie/i.test(c)
            ? "🎬"
            : /job|povol/i.test(c)
              ? "🧑‍🚒"
              : /nature|přírod/i.test(c)
                ? "🌿"
                : /action|činnost/i.test(c)
                  ? "🕺"
                  : /place|míst/i.test(c)
                    ? "🌍"
                    : /object|předmět/i.test(c)
                      ? "🎒"
                      : "✨";
  }
  function buildDeck() {
    const dictionary =
      window.SHARADES_WORDS[state.lang] || window.SHARADES_WORDS.cs;
    let categories =
      state.category === "all" ? Object.keys(dictionary) : [state.category];
    if (state.categories.length) {
      const chosen = state.categories.filter((c) => dictionary[c]);
      if (chosen.length) categories = chosen;
    }
    let deck = [];
    for (const cat of categories)
      for (const word of dictionary[cat] || []) deck.push({ word, cat });
    for (const word of state.customWords) deck.push({ word, cat: t("custom") });
    if (state.family) {
      const unsuitable = /pistole|zbraň|weapon|gun|murder|vražda/i;
      deck = deck.filter((x) => !unsuitable.test(x.word));
    }
    return deck;
  }
  function nextWord() {
    let pool = run.deck.filter((w) => !run.used.includes(w.word));
    if (!pool.length) {
      run.used = [];
      pool = run.deck.slice();
    }
    if (!pool.length) return null;
    const w = pool[Math.floor(Math.random() * pool.length)];
    run.used.push(w.word);
    return w;
  }
  function beginGame() {
    const deck = generatedRoundWords?.length
      ? generatedRoundWords.map((word) => ({ ...word }))
      : buildDeck();
    generatedRoundWords = null;
    if (!deck.length) {
      toast(t("empty"));
      show("categories");
      return;
    }
    stopTimer();
    const isTeams = state.mode === "teams";
    if (isTeams) {
      if (state.teams.length < 2)
        state.teams = [
          { name: state.lang === "cs" ? "Tým 1" : "Team 1", score: 0 },
          { name: state.lang === "cs" ? "Tým 2" : "Team 2", score: 0 },
        ];
      state.teams = state.teams.slice(0, 2);
      state.players.forEach((p) => {
        p.team = Math.min(Math.max(0, Number(p.team) || 0), 1);
      });
    } else {
      state.teams = [
        { name: state.lang === "cs" ? "Parta" : "Everyone", score: 0 },
      ];
      state.players.forEach((p) => (p.team = 0));
    }
    const marathon = state.mode === "marathon";
    run = {
      ...run,
      round: 1,
      turn: 0,
      remaining: marathon ? 120 : state.roundSeconds,
      totalSeconds: marathon ? 120 : state.roundSeconds,
      score: 0,
      word: null,
      deck,
      used: [],
      timer: null,
      paused: false,
      turnGuessed: 0,
      turnSkipped: 0,
      totalCorrect: 0,
      streak: 0,
      bestStreak: 0,
      actorIndex: 0,
      gameId: run.gameId + 1,
      teamCount: isTeams ? 2 : 1,
      roundLimit: marathon ? 1 : state.rounds,
    };
    state.teams.forEach((x) => (x.score = 0));
    run.word = nextWord();
    persist();
    show("game");
  }
  function currentActor() {
    const pool = state.players.filter(
      (p) => state.mode !== "teams" || p.team === run.turn,
    );
    const eligible = pool.length ? pool : state.players;
    return eligible.length
      ? eligible[(run.actorIndex || 0) % eligible.length].name
      : "—";
  }
  function renderGame() {
      app.innerHTML = `<section class="game-screen">${head(`${t("turn")}: ${esc(state.teams[run.turn]?.name || "")}`, `${state.lang === "cs" ? "Předvádí" : "Acting"}: ${esc(currentActor())} · ${t("round")} ${run.round} / ${run.roundLimit}`)}<div class="scoreboard">${state.teams
      .slice(0, run.teamCount)
      .map(
        (team, i) =>
          `<div class="score-row"><strong>${esc(team.name)}</strong><span class="score">${team.score}</span></div>`,
      )
      .join(
        "",
      )}</div><div class="timer-ring" id="timerRing" style="--progress:100%"><div class="timer-content"><div class="time" id="timeText">${run.remaining}</div><div class="muted tiny">${t("remaining")}</div></div></div><div class="word-box"><div class="category" id="wordCat">${esc(run.word?.cat || "")}</div><div class="word" id="wordText">${esc(run.word?.word || "—")}</div><p class="word-hint">${modeDescription(state.mode)}</p></div><div class="button-row game-actions">${btn("↻ " + t("skip"), "skip-word", "btn game-skip")}${btn("✓ " + t("correct"), "correct", "btn green game-correct")}</div><div class="game-controls top-gap"><button class="control-button" data-action="pause">Ⅱ ${t("pause")}</button><button class="control-button" data-action="end">■ ${t("end")}</button><button class="control-button" data-action="enable-tilt">📱 ${state.lang === "cs" ? "Zapnout naklánění" : "Enable tilt"}</button></div></section>`;
    run.timer = setInterval(() => {
      if (run.paused) return;
      run.remaining--;
      const txt = $("#timeText"),
        ring = $("#timerRing");
      if (txt) txt.textContent = Math.max(0, run.remaining);
      if (ring)
        ring.style.setProperty(
          "--progress",
          `${(Math.max(0, run.remaining) / (run.totalSeconds || state.roundSeconds)) * 100}%`,
        );
      if (run.remaining <= 0) {
        stopTimer();
        if (state.mode === "marathon") finishGame();
        else finishTurn();
      }
    }, 1000);
  }
  function advanceWord() {
    run.word = nextWord();
    run.revealed = false;
    $("#wordText").textContent = run.word?.word || "—";
    $("#wordCat").textContent = esc(run.word?.cat || "");
    if (!run.word) {
      finishTurn();
      toast(t("empty"));
    }
  }
  function correct() {
    if (!run.word || run.paused) return;
    const points = state.mode === "double" ? 2 : 1;
    state.teams[run.turn].score += points;
    state.coins = (state.coins ?? 25) + points;
    run.turnGuessed++;
    run.totalCorrect = (run.totalCorrect || 0) + 1;
    run.streak = (run.streak || 0) + 1;
    run.bestStreak = Math.max(run.bestStreak || 0, run.streak);
    beep();
    buzz();
    advanceWord();
    const scores = $$(".score-row");
    scores.forEach((row, i) => {
      if (state.teams[i]) {
        const sc = row.querySelector(".score");
        if (sc) sc.textContent = state.teams[i].score;
      }
    });
    persist();
  }
  function skip() {
    if (!run.word || run.paused) return;
    run.turnSkipped++;
    run.streak = 0;
    if (state.mode === "sudden") {
      finishGame();
      return;
    }
    advanceWord();
  }
  function finishTurn() {
    stopTimer();
    persist();
    if (state.mode === "marathon") {
      finishGame();
      return;
    }
    show("roundEnd");
  }
  function nextTurn() {
    run.turn++;
    if (run.turn >= run.teamCount) {
      run.turn = 0;
      run.round++;
    }
    if (run.round > run.roundLimit) {
      finishGame();
      return;
    }
    run.remaining = state.roundSeconds;
    run.turnGuessed = 0;
    run.turnSkipped = 0;
    run.actorIndex = (run.actorIndex + 1) % Math.max(1, state.players.length);
    run.word = nextWord();
    show("game");
  }
  function finishGame() {
    stopTimer();
    const winner = state.teams
      .slice(0, run.teamCount)
      .slice()
      .sort((a, b) => b.score - a.score)[0];
    state.history.push({
      winner: winner?.name || "—",
      score: winner?.score || 0,
      correct: run.totalCorrect || 0,
      streak: run.bestStreak || 0,
      mode: state.mode,
      categories: [...new Set(run.deck.map((x) => x.cat))],
      date: new Date().toISOString(),
    });
    state.history = state.history.slice(-100);
    persist();
    show("results");
  }
  function syncTeamFields() {
    document.querySelectorAll("[data-teamname]").forEach((e) => {
      const i = +e.dataset.teamname;
      if (state.teams[i])
        state.teams[i].name = e.value.trim() || `${t("team")} ${i + 1}`;
    });
  }
  app.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.screen) {
      if (b.dataset.screen === "tutorial") tutorialStep = 0;
      show(b.dataset.screen);
      return;
    }
    if (b.dataset.language) {
      state.lang = b.dataset.language;
      state.categories = [];
      state.category = "all";
      persist();
      if (currentScreen === "language") {
        state.languageChosen = true;
        tutorialStep = 0;
        persist();
        show("tutorial");
      } else show("settings");
      return;
    }
    if (b.dataset.mode) {
      state.mode = b.dataset.mode;
      persist();
      show("setup");
      return;
    }
    if (b.dataset.tutorialStep) {
      tutorialStep = Math.max(
        0,
        Math.min(4, tutorialStep + +b.dataset.tutorialStep),
      );
      if (
        tutorialStep === 4 &&
        currentScreen === "tutorial" &&
        b.dataset.tutorialStep === "1" &&
        b.textContent.includes("Rozumím")
      ) {
        state.onboarded = true;
        persist();
        show("home");
        return;
      }
      if (
        tutorialStep === 4 &&
        currentScreen === "tutorial" &&
        b.dataset.tutorialStep === "1" &&
        b.textContent.includes("Got it")
      ) {
        state.onboarded = true;
        persist();
        show("home");
        return;
      }
      show("tutorial");
      return;
    }
    if (b.dataset.aiCount) {
      const n = +b.dataset.aiCount;
      const f = $("#aiCount");
      if (f) f.value = String(n);
      $$("[data-ai-count]").forEach((x) =>
        x.classList.toggle("active", x === b),
      );
      return;
    }
    if (b.dataset.pickAvatar) {
      if (state.players[avatarPlayer]) {
        state.players[avatarPlayer].avatar = b.dataset.pickAvatar;
        persist();
        show("avatars");
      }
      return;
    }
    if (b.dataset.appearanceTab) {
      appearanceTab = b.dataset.appearanceTab;
      show("avatars");
      return;
    }
    if (b.dataset.appearance && state.players[avatarPlayer]) {
      const appearance = (state.players[avatarPlayer].appearance ||= appearanceDefaults());
      const category = b.dataset.appearance;
      const value = b.dataset.value;
      state.cosmeticUnlocks ||= defaultCosmeticUnlocks();
      state.cosmeticUnlocks[category] ||= [];
      const unlocked = state.cosmeticUnlocks[category].includes(value);
      if (!unlocked) {
        const cost = cosmeticPrices[category]?.[value] || 0;
        if ((state.coins ?? 25) < cost) {
          toast(
            state.lang === "cs"
              ? `Na odemčení potřebuješ ${cost} mincí.`
              : `You need ${cost} coins to unlock this item.`,
          );
          return;
        }
        state.coins = (state.coins ?? 25) - cost;
        state.cosmeticUnlocks[category].push(value);
      }
      appearance[category] = value;
      persist();
      show("avatars");
      if (!unlocked)
        toast(
          state.lang === "cs"
            ? "Předmět odemčen a nasazen!"
            : "Item unlocked and equipped!",
        );
      return;
    }
    if (b.dataset.category !== undefined) {
      if (b.dataset.category === "all") state.category = "all";
      else {
        const c = b.dataset.category;
        state.category = c;
        if (b.dataset.toggleCategory) {
          state.categories = state.categories.includes(c)
            ? state.categories.filter((x) => x !== c)
            : [...state.categories, c];
          if (!state.categories.length) state.category = "all";
        }
      }
      persist();
      const inSetup = !!document.querySelector("#familyMode");
      show(inSetup ? "setup" : "categories");
      return;
    }
    if (b.dataset.seconds) {
      state.roundSeconds = +b.dataset.seconds;
      persist();
      show(document.querySelector("#familyMode") ? "setup" : "settings");
      return;
    }
    if (b.dataset.rounds) {
      state.rounds = +b.dataset.rounds;
      persist();
      show("setup");
      return;
    }
    if (b.dataset.remove !== undefined) {
      state.players.splice(+b.dataset.remove, 1);
      persist();
      show("players");
      return;
    }
    const a = b.dataset.action;
    if (!a) return;
    switch (a) {
      case "home":
        show("home");
        break;
      case "modes":
        show("modes");
        break;
      case "setup":
        show("setup");
        break;
      case "skip-tutorial":
        state.onboarded = true;
        persist();
        show("home");
        break;
      case "begin": {
        const f = $("#familyMode");
        if (f) state.family = f.checked;
        persist();
        beginGame();
        break;
      }
      case "add-player": {
        const inp = $("#playerName"),
          name = inp.value.trim();
        if (!name) {
          toast(t("name"));
          return;
        }
        state.players.push({
          name,
          avatar: avatarIds[state.players.length % avatarIds.length],
          team: state.players.length % state.teams.length,
        });
        persist();
        show("players");
        break;
      }
      case "save-players":
        syncTeamFields();
        persist();
        toast(t("saved"));
        show("players");
        break;
      case "save-settings": {
        const s = $("#soundPref"),
          v = $("#vibPref");
        if (s) state.sound = s.checked;
        if (v) state.vibration = v.checked;
        persist();
        toast(t("saved"));
        show("settings");
        break;
      }
      case "save-categories":
        persist();
        toast(t("saved"));
        show("home");
        break;
      case "save-custom": {
        const raw = $("#customText")
          .value.split(/\r?\n/)
          .map((x) => x.trim())
          .filter(Boolean);
        state.customWords = [...new Set(raw)].slice(0, 300);
        persist();
        toast(t("saved"));
        show("custom");
        break;
      }
      case "generate-local": {
        const topic = ($("#aiTopic")?.value || "").trim().toLocaleLowerCase();
        const count = Math.max(1, Math.min(20, +($("#aiCount")?.value || 10)));
        const language = $("#aiLanguage")?.value || state.lang;
        generatedLanguage = language;
        const dict = window.SHARADES_WORDS[language] || window.SHARADES_WORDS.cs;
        let pool = Object.entries(dict).flatMap(([cat, words]) =>
          words.map((word) => ({ word, cat })),
        );
        if (topic) {
          const themes = Object.values(window.SHARADES_THEMES?.[language] || {});
          const theme = themes.find((item) =>
            [item.name, ...item.aliases, ...item.words].some((value) => {
              const normalized = value.toLocaleLowerCase();
              return normalized.includes(topic) || topic.includes(normalized);
            }),
          );
          if (theme) {
            pool = theme.words.map((word) => ({ word, cat: theme.name }));
          } else {
            const exact = pool.filter(
              (x) =>
                x.word.toLocaleLowerCase().includes(topic) ||
                x.cat.toLocaleLowerCase().includes(topic),
            );
            if (exact.length) pool = exact;
            else {
            const synonyms =
              topic.includes("zví") || topic.includes("animal")
                ? ["Zvířata", "Animals"]
                : topic.includes("sport")
                  ? ["Sport", "Sports"]
                  : topic.includes("jíd") || topic.includes("food")
                    ? ["Jídlo", "Jídlo a pití", "Food"]
                    : topic.includes("film") || topic.includes("movie")
                      ? ["Filmy", "Movies"]
                      : [];
            const matches = Object.entries(dict)
              .filter(([cat]) =>
                synonyms.some((s) =>
                  cat.toLocaleLowerCase().includes(s.toLocaleLowerCase()),
                ),
              )
              .flatMap(([cat, words]) => words.map((word) => ({ word, cat })));
              pool = matches;
            }
          }
        }
        if (state.difficulty === "easy")
          pool = pool.filter((x) => x.word.length <= 10);
        if (state.difficulty === "hard")
          pool = pool.filter((x) => x.word.length >= 11);
        const seen = new Set();
        pool = pool.filter(
          (x) =>
            !seen.has(x.word) &&
            !state.customWords.includes(x.word) &&
            seen.add(x.word),
        );
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        suggestions = pool.slice(0, count);
        show("ai");
        if (topic && suggestions.length)
          toast(
            state.lang === "cs"
              ? "Návrhy z místního slovníku"
              : "Suggestions from local dictionary",
          );
        else if (topic)
          toast(
            state.lang === "cs"
              ? "Pro toto téma tu nemám místní slova. Zkus kategorii nebo Harry Potter, Minecraft či dinosaury."
              : "No local words match that topic. Try a category, Harry Potter, Minecraft, or dinosaurs.",
          );
        break;
      }
      case "add-generated": {
        const selected = $$("[data-generated-index]:checked")
          .map((x) => suggestions[+x.dataset.generatedIndex])
          .filter(Boolean)
          .map((x) => x.word);
        state.customWords = [
          ...new Set([...state.customWords, ...selected]),
        ].slice(0, 300);
        persist();
        toast(t("saved"));
        show("custom");
        break;
      }
      case "start-generated": {
        const selected = $$(`[data-generated-index]:checked`)
          .map((x) => suggestions[+x.dataset.generatedIndex])
          .filter(Boolean);
        if (!selected.length) {
          toast(
            state.lang === "cs"
              ? "Nejdřív vyber alespoň jedno slovo."
              : "Select at least one word first.",
          );
          return;
        }
        generatedRoundWords = selected;
        state.categories = [];
        state.category = "all";
        persist();
        show("setup");
        break;
      }
      case "offline-refresh":
        show("offline");
        toast(
          navigator.onLine
            ? state.lang === "cs"
              ? "Internet je dostupný"
              : "Internet is available"
            : state.lang === "cs"
              ? "Jsi offline"
              : "You are offline",
        );
        break;
      case "clear-history":
        if (confirm(t("clear") + "?")) {
          state.history = [];
          persist();
          show("stats");
        }
        break;
      case "reset":
        if (confirm(t("reset") + "?")) {
          stopTimer();
          localStorage.removeItem(KEY);
          state = defaults();
          persist();
          show("settings");
        }
        break;
      case "correct":
        correct();
        break;
      case "skip-word":
        skip();
        break;
      case "enable-tilt":
        enableTilt();
        break;
      case "pause":
        run.paused = !run.paused;
        b.textContent = run.paused ? "▶ " + t("resume") : "Ⅱ " + t("pause");
        break;
      case "end":
        if (confirm(t("quit"))) finishTurn();
        break;
      case "next-turn":
        nextTurn();
        break;
      case "finish-game":
        finishGame();
        break;
      case "results":
        show("results");
        break;
    }
  });
  app.addEventListener("change", (e) => {
    if (e.target.id === "titleLanguage") {
      state.lang = e.target.value;
      state.categories = [];
      state.category = "all";
      state.languageChosen = true;
      persist();
      const image = $(".title-art img");
      if (image) {
        image.src =
          state.lang === "cs"
            ? "assets/images/title-screen-cz.png"
            : "assets/Images/title-screen-en.webp";
        image.alt =
          state.lang === "cs"
            ? "Sharades! Předváděj, hádej a bav se spolu."
            : "Sharades! Act, guess and laugh together.";
      }
      document.documentElement.lang = state.lang;
      window.setTimeout(() => {
        tutorialStep = 0;
        show("tutorial");
      }, 450);
      return;
    }
    if (e.target.id === "familyMode") {
      state.family = e.target.checked;
      persist();
    }
    if (e.target.dataset.playerteam !== undefined) {
      state.players[+e.target.dataset.playerteam].team = +e.target.value;
      persist();
    }
    if (e.target.id === "soundPref") {
      state.sound = e.target.checked;
      persist();
    }
    if (e.target.id === "musicPref") {
      state.music = e.target.checked;
      persist();
      setMusicEnabled(state.music);
    }
    if (e.target.id === "offlinePref") {
      state.offlineMode = e.target.checked;
      persist();
      syncOfflineMode(state.offlineMode);
    }
    if (e.target.id === "vibPref") {
      state.vibration = e.target.checked;
      persist();
    }
    if (e.target.id === "themePref") {
      state.theme = e.target.checked ? "dark" : "light";
      document.documentElement.dataset.theme = state.theme;
      persist();
    }
    if (e.target.id === "aiDifficulty") {
      state.difficulty = e.target.value;
      persist();
    }
    if (e.target.id === "avatarPlayer") {
      avatarPlayer = +e.target.value;
      show("avatars");
    }
  });
  $("#langBtn").addEventListener("click", () => {
    state.lang = state.lang === "cs" ? "en" : "cs";
    persist();
    show("home");
  });
  $("#soundBtn").addEventListener("click", () => {
    state.sound = !state.sound;
    persist();
    setHeader();
    toast(state.sound ? "🔊" : "🔇");
  });
  $("#homeBtn").addEventListener("click", () => show("home"));
  $("#brandHome").addEventListener("click", (e) => {
    e.preventDefault();
    show("home");
  });
  $("#helpBtn").addEventListener("click", () => {
    tutorialStep = 0;
    show("tutorial");
  });
  const $$ = (s) => [...document.querySelectorAll(s)];
  setHeader();
  document.documentElement.dataset.theme = state.theme || "dark";
  if (state.offlineMode) syncOfflineMode(true);
  document.addEventListener(
    "pointerdown",
    () => {
      if (state.music && !musicTimer) setMusicEnabled(true);
    },
    { once: true },
  );
  show(
    !state.languageChosen ? "language" : state.onboarded ? "home" : "tutorial",
  );
})();
