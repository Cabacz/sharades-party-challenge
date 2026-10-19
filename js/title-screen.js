(() => {
  const splash = document.getElementById('sharadesSplash');
  const artwork = document.getElementById('splashArtwork');
  const language = document.getElementById('splashLanguage');
  const startButton = document.getElementById('splashStart');
  const screens = {
    cs: { image: 'assets/images/title-screen-cz.png', alt: 'Sharades – Party Challenge, česká titulní obrazovka', button: 'Pokračovat · klepni kamkoliv' },
    en: { image: 'assets/images/title-screen-en.png', alt: 'Sharades – Party Challenge, English title screen', button: 'Continue · tap anywhere' }
  };
  function setLanguage(code) {
    const selected = screens[code] ? code : 'cs';
    const screen = screens[selected];
    document.documentElement.lang = selected;
    artwork.src = screen.image;
    artwork.alt = screen.alt;
    language.value = selected;
    startButton.textContent = screen.button;
    startButton.setAttribute('aria-label', screen.button);
  }
  function startTutorial() {
    const event = new CustomEvent('sharades:start-tutorial', { bubbles: true, detail: { language: language.value } });
    splash.dispatchEvent(event);
    if (typeof window.openSharadesTutorial === 'function') {
      window.openSharadesTutorial(language.value);
    } else {
      window.alert(language.value === 'cs'
        ? 'Titulní obrazovka je připravená. Při integraci připoj tuto akci ke stávajícímu tutoriálu hry.'
        : 'The title screen is ready. Connect this action to the game’s existing tutorial during integration.');
    }
  }
  language.addEventListener('change', (event) => { event.stopPropagation(); setLanguage(language.value); });
  startButton.addEventListener('click', (event) => { event.stopPropagation(); startTutorial(); });
  splash.addEventListener('click', (event) => { if (event.target === language || event.target === startButton) return; startTutorial(); });
  setLanguage('cs');
})();
