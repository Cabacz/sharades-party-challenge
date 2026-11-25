# Sharades – Party Challenge

Mobilní party hra se šarádami, připravená jako statická webová aplikace (PWA). Projekt je základem pro pokračování původní hry v samostatném repozitáři `Cabacz/sharades-party-challenge`.

## Spuštění

Otevři `index.html` v prohlížeči, nebo spusť jednoduchý lokální HTTP server v kořeni projektu, například:

```sh
python3 -m http.server 8000
```

Pak navštiv `http://localhost:8000`. Pro instalaci PWA a offline režim je potřeba aplikaci servírovat přes HTTPS nebo localhost.

## Struktura

- `index.html`, `manifest.json`, `css/`, `js/`, `data/`, `assets/` – PWA, rozhraní, lokální slovníky a obrázkové kartičky.
- `data/words.js` a `data/cards.json` – český/anglický slovník a katalog obrázkových kartiček.
- `assets/cards/` – lokální ilustrace a obrázkové archy ke slovům.
- `Menu/` – samostatný prototyp menu, ponechaný jako reference.
- `Reference/`, `References/` – koncepční grafické podklady a snímky předchozího rozhraní.
- `PROJECT_CONTEXT_CZ.md` – sjednocené zadání a plán etap.
- `ASSET_CATALOG.md` – soupis dostupných grafických podkladů.
- `ETAPA-1-TITULNI-OBRAZOVKA.md` – konkrétní zadání první etapy.

## Aktuální stav

Repozitář nyní obsahuje hratelnou verzi s úvodním plakátem, onboardingem, kategoriemi, sedmi režimy, obrázkovými kartičkami, skóre a statistikami. Slovníky a ilustrace fungují lokálně. Podrobnosti jsou v [STAV-HRY-CZ.md](STAV-HRY-CZ.md). Android test APK se sestavuje v GitHub Actions.

## Ověření

```sh
node scripts/validate.mjs
```

Ruční mobilní kontrola je popsána v [TESTOVACI_CHECKLIST_CZ.md](TESTOVACI_CHECKLIST_CZ.md). Před publikováním nastav GitHub Pages na kořen větve `main`.

## Rozhodnutí z předchozího zadání

- Zachovat neonový 3D styl a rozpoznatelné původní postavy.
- Hru a její uživatelské texty připravovat česky i anglicky.
- Postupovat po etapách a každou etapu ověřit před další.
- Pro tvorbu grafiky nepoužívat OpenArt.
- Starý repozitář zůstává nedotčený; práce pokračuje v tomto novém projektu.
