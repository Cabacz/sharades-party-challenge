(() => {
  "use strict";
  const splash = document.getElementById("sharadesSplash");
  const artwork = document.getElementById("splashArtwork");
  const language = document.getElementById("splashLanguage");
  const startButton = document.getElementById("splashStart");
  if (!splash || !artwork || !language || !startButton) return;

  const screens = {
    cs: {
      image: "assets/images/title-screen-cz.png",
      alt: "Sharades – Party Challenge, česká titulní obrazovka",
      button: "Pokračovat · klepni kamkoliv",
    },
    en: {
      image: "assets/images/title-screen-en.png",
      alt: "Sharades – Party Challenge, English title screen",
      button: "Continue · tap anywhere",
    },
  };

  function savedLanguage() {
    try {
      const saved = JSON.parse(localStorage.getItem("sharades_release_v2") || "null");
      return saved?.lang === "en" ? "en" : "cs";
    } catch {
      return "cs";
    }
  }

  function setLanguage(code) {
    const selected = screens[code] ? code : "cs";
    const screen = screens[selected];
    document.documentElement.lang = selected;
    artwork.src = screen.image;
    artwork.alt = screen.alt;
    language.value = selected;
    startButton.textContent = screen.button;
    startButton.setAttribute("aria-label", screen.button);
    language.setAttribute("aria-label", selected === "cs" ? "Vybrat jazyk" : "Choose language");
  }

  function startTutorial() {
    const selected = language.value === "en" ? "en" : "cs";
    splash.hidden = true;
    document.body.classList.remove("splash-active");
    document.dispatchEvent(new CustomEvent("sharades:start-tutorial", {
      detail: { language: selected },
    }));
  }

  language.addEventListener("change", () => setLanguage(language.value));
  startButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    startTutorial();
  });
  splash.addEventListener("click", (event) => {
    if (event.target === language || event.target === startButton) return;
    startTutorial();
  });
  setLanguage(savedLanguage());
})();