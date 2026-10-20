(() => {
  "use strict";
  const $ = (s) => document.querySelector(s),
    app = $("#app"),
    KEY = "sharades_release_v2";
  const avatarIds = ["man", "woman", "child", "robot", "cat"];
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
    category: "all",
    categories: [],
    family: true,
    customWords: [],
    sound: true,
    music: false,
    vibration: true,
    theme: "dark",
    difficulty: "normal",
    history: [],
  });
  let suggestions = [],
    avatarPlayer = 0,
    tutorialStep = 0,
    currentScreen = "home",
    tiltEnabled = false,
    tiltBase = null,
    tiltLocked = false;
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
      app.innerHTML = `${head(state.lang === "cs" ? "Profil" : "Profile")}<div class="card center">${p ? `<img class="avatar" src="assets/avatar-${p.avatar}.svg" alt=""><h2>${esc(p.name)}</h2>` : ""}<div class="home-coins">🪙 ${state.lang === "cs" ? "Mince přijdou později" : "Coins coming later"}</div><p class="notice top-gap">${state.lang === "cs" ? "Úpravy účesu, oblečení a doplňků jsou zatím plánované." : "Hair, clothing, and accessory editing is planned."}</p>${btn("🎨 " + t("avatars"), "avatars", "btn cyan")}${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
    },
    players() {
      app.innerHTML = `${head(t("players"))}<div class="card"><div class="field"><label>${t("name")}</label><div class="row"><input id="playerName" class="field-input" maxlength="24" placeholder="${t("name")}" style="min-width:0;flex:1;padding:12px;background:#0d0e20;color:white;border:1px solid var(--stroke);border-radius:12px">${btn("＋", "add-player", "btn small cyan")}</div></div><div class="player-list">${state.players.map((p, i) => `<div class="player"><img class="avatar" src="assets/avatar-${p.avatar}.svg" alt=""><div class="name">${esc(p.name)}</div><select data-playerteam="${i}" aria-label="${t("team")}">${state.teams.map((tm, j) => `<option value="${j}" ${p.team === j ? "selected" : ""}>${esc(tm.name)}</option>`).join("")}</select><button class="remove" data-remove="${i}">×</button></div>`).join("")}</div><div class="divider"></div>${state.teams.map((team, i) => `<div class="field"><label>${t("teamName")} ${i + 1}</label><input data-teamname="${i}" maxlength="30" value="${esc(team.name)}"></div>`).join("")} ${btn(t("save"), "save-players", "btn secondary")}</div>${btn("← " + t("back"), "home", "btn secondary top-gap")}`;
    },
    custom() {
      app.innerHTML = `${head(t("custom"))}<div class="card"><p class="muted tiny">${t("custom")} — ${t("customHint")}</p><div class="field"><textarea id="customText" rows="8" maxlength="8000" placeholder="${state.lang === "cs" ? "Horská dráha\nGrilování\nAstronaut" : "Roller coaster\nBarbecue\nAstronaut"}">${esc(state.customWords.join("\n"))}</textarea></div><p class="hint">${state.customWords.length} ${t("words")}</p>${btn(t("save"), "save-custom")}${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
    },
    settings() {
      app.innerHTML = `${head(t("settings"))}<div class="card"><div class="field"><label>${state.lang === "cs" ? "Jazyk" : "Language"}</label><div class="chips"><button class="chip ${state.lang === "cs" ? "active" : ""}" data-language="cs">🇨🇿 Čeština</button><button class="chip ${state.lang === "en" ? "active" : ""}" data-language="en">🇬🇧 English</button></div></div><label class="row top-gap"><input type="checkbox" id="soundPref" ${state.sound ? "checked" : ""}> ${state.lang === "cs" ? "Zvukové efekty" : "Sound effects"}</label><label class="row top-gap"><input type="checkbox" id="vibPref" ${state.vibration ? "checked" : ""}> ${state.lang === "cs" ? "Vibrace" : "Vibration"}</label><label class="row top-gap"><input type="checkbox" id="themePref" ${state.theme === "dark" ? "checked" : ""}> ${state.lang === "cs" ? "Tmavý režim" : "Dark mode"}</label><label class="row top-gap muted"><input type="checkbox" disabled> ${state.lang === "cs" ? "Hudba (připravujeme)" : "Music (planned)"}</label><p class="notice top-gap">${t("settingsText")}</p>${btn(t("save"), "save-settings")}${btn(t("reset"), "reset", "btn secondary top-gap")}${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
    },
    ai() {
      app.innerHTML = `${head(t("ai"), t("aiNote"))}<div class="card"><div class="field"><label>${t("aiTopic")}</label><input id="aiTopic" maxlength="80" placeholder="${state.lang === "cs" ? "např. dinosauři, Minecraft, dovolená" : "e.g. dinosaurs, Minecraft, holiday"}" value=""></div><div class="field"><label>${t("aiCount")}</label><div class="chips">${[5, 10, 15, 20].map((n) => `<button class="chip ${n === 10 ? "active" : ""}" data-ai-count="${n}">${n}</button>`).join("")}</div><input id="aiCount" type="hidden" value="10"></div><div class="field"><label>${state.lang === "cs" ? "Obtížnost" : "Difficulty"}</label><select id="aiDifficulty"><option value="easy" ${state.difficulty === "easy" ? "selected" : ""}>${state.lang === "cs" ? "Lehká" : "Easy"}</option><option value="normal" ${state.difficulty === "normal" ? "selected" : ""}>${state.lang === "cs" ? "Střední" : "Medium"}</option><option value="hard" ${state.difficulty === "hard" ? "selected" : ""}>${state.lang === "cs" ? "Těžká" : "Hard"}</option></select></div><p class="notice">${t("featureAI")}</p>${btn("✨ " + t("generate"), "generate-local", "btn cyan")}${suggestions.length ? `<div class="section-title"><div><h3>${t("generated")} (${suggestions.length})</h3><p class="hint">${state.lang === "cs" ? "Zaškrtni slova, která chceš přidat do vlastního balíčku." : "Select the words you want to add to your custom deck."}</p></div></div><div class="feature-list">${suggestions.map((w, i) => `<label class="feature-row"><input type="checkbox" data-generated-index="${i}" checked><span class="feature-icon">💡</span><span><strong>${esc(w.word)}</strong><small>${esc(w.cat)}</small></span></label>`).join("")}</div>${btn("＋ " + t("addWords"), "add-generated", "btn green top-gap")}` : ""}${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
    },
    avatars() {
      if (!state.players.length) {
        app.innerHTML = `${head(t("avatars"))}<div class="card">${t("selectPlayer")}</div>${btn("← " + t("back"), "home", "btn secondary top-gap")}`;
        return;
      }
      avatarPlayer = Math.min(avatarPlayer, state.players.length - 1);
      const player = state.players[avatarPlayer];
      app.innerHTML = `${head(t("avatars"), t("pickAvatar"))}<div class="card"><div class="field"><label>${t("forPlayer")}</label><select id="avatarPlayer">${state.players.map((p, i) => `<option value="${i}" ${i === avatarPlayer ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div><div class="grid">${avatarIds.map((id) => `<button class="select-card ${player.avatar === id ? "selected" : ""}" data-pick-avatar="${id}"><img class="avatar" src="assets/avatar-${id}.svg" alt=""><strong>${{ man: state.lang === "cs" ? "Muž" : "Man", woman: state.lang === "cs" ? "Žena" : "Woman", child: state.lang === "cs" ? "Dítě" : "Child", robot: "Robot", cat: state.lang === "cs" ? "Kočka" : "Cat" }[id]}</strong><small>${player.avatar === id ? "✓" : ""}</small></button>`).join("")}</div><p class="hint top-gap">${state.lang === "cs" ? "Avatar se uloží k vybranému hráči." : "The avatar is saved for the selected player."}</p>${btn("← " + t("back"), "home", "btn secondary top-gap")}</div>`;
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
    const deck = buildDeck();
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
      show("setup");
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
        const dict =
          window.SHARADES_WORDS[state.lang] || window.SHARADES_WORDS.cs;
        let pool = Object.entries(dict).flatMap(([cat, words]) =>
          words.map((word) => ({ word, cat })),
        );
        if (state.difficulty === "easy")
          pool = pool.filter((x) => x.word.length <= 10);
        if (state.difficulty === "hard")
          pool = pool.filter((x) => x.word.length >= 11);
        if (topic) {
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
            if (matches.length) pool = matches;
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
  show(
    !state.languageChosen ? "language" : state.onboarded ? "home" : "tutorial",
  );
})();
