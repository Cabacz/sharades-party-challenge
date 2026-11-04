(() => {
  "use strict";
  const splash = document.getElementById("sharadesSplash");
  const startButton = document.getElementById("splashStart");
  if (!splash || !startButton) return;

  const copy = {
    cs: {tagline:"HRA • HÁDEJ • BAV SE SPOLEČNĚ!",animals:"ZVÍŘATA",movies:"FILMY A SERIÁLY",food:"JÍDLO A PITÍ",music:"HUDBA",wheel:"KOLO NÁHOD",challenges:"ZÁBAVNÉ VÝZVY",avatars:"VLASTNÍ AVATARY",bilingual:"HRÁT V ANGLIČTINĚ NEBO ČEŠTINĚ",stats:"STATISTIKY",players:"HRÁČI",start:"SPUSTIT HRU",settings:"Nastavení"},
    en: {tagline:"PLAY • ACT • GUESS • LAUGH TOGETHER!",animals:"ANIMALS",movies:"MOVIES & SERIES",food:"FOOD & DRINKS",music:"MUSIC",wheel:"RANDOM WHEEL",challenges:"FUN CHALLENGES",avatars:"CUSTOM AVATARS",bilingual:"PLAY IN ENGLISH OR CZECH",stats:"STATISTICS",players:"PLAYERS",start:"START GAME",settings:"Settings"}
  };
  let selected = "cs";
  function savedLanguage() {
    try { const saved=JSON.parse(localStorage.getItem("sharades_release_v2")||"null"); return saved?.lang==="en"?"en":"cs"; }
    catch { return "cs"; }
  }
  function setLanguage(code, notify=true) {
    selected = code==="en"?"en":"cs";
    document.documentElement.lang=selected;
    splash.querySelectorAll("[data-copy]").forEach(el=>{const key=el.dataset.copy;if(copy[selected][key])el.textContent=copy[selected][key];});
    splash.querySelectorAll("[data-language]").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.language===selected)));
    const settings=splash.querySelector('[data-menu="settings"]');
    if(settings)settings.setAttribute("aria-label",copy[selected].settings);
    if(notify)document.dispatchEvent(new CustomEvent("sharades:set-language",{detail:{language:selected}}));
  }
  function openScreen(screen) {
    splash.hidden=true;
    document.body.classList.remove("splash-active");
    document.dispatchEvent(new CustomEvent("sharades:open-screen",{detail:{screen}}));
  }
  function start() {
    splash.hidden=true;
    document.body.classList.remove("splash-active");
    document.dispatchEvent(new CustomEvent("sharades:title-start",{detail:{language:selected}}));
  }
  splash.addEventListener("click",event=>{
    const language=event.target.closest("[data-language]");
    if(language){setLanguage(language.dataset.language);return;}
    const menu=event.target.closest("[data-menu]");
    if(menu){
      const action=menu.dataset.menu;
      if(action==="language"){setLanguage(selected==="cs"?"en":"cs");return;}
      if(action==="random"){splash.hidden=true;document.body.classList.remove("splash-active");document.dispatchEvent(new CustomEvent("sharades:randomize"));return;}
      openScreen(action);return;
    }
  });
  startButton.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();start();});
  setLanguage(savedLanguage(),false);

  document.addEventListener("sharades:show-main-menu",()=>{
    splash.hidden=false;
    document.body.classList.add("splash-active");
    setLanguage(savedLanguage(),false);
  });
})();