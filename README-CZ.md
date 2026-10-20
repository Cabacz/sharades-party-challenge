# Sharades – Party Challenge

Mobilní party hra se šarádami, připravená jako statická webová aplikace (PWA). Projekt je základem pro pokračování původní hry v samostatném repozitáři `Cabacz/sharades-party-challenge`.

## Spuštění

Otevři `index.html` v prohlížeči, nebo spusť jednoduchý lokální HTTP server v kořeni projektu, například:

```sh
python3 -m http.server 8000
```

Pak navštiv `http://localhost:8000`. Pro instalaci PWA a offline režim je potřeba aplikaci servírovat přes HTTPS nebo localhost.

## Struktura

- `index.html`, `css/`, `js/` – současná hra, rozhraní, slovníky a styly.
- `assets/` – loga, avatary, ilustrace a podklady z předchozí práce.
- `Menu/` – samostatný prototyp menu, ponechaný jako reference.
- `Reference/`, `References/` – koncepční grafické podklady a snímky předchozího rozhraní.
- `PROJECT_CONTEXT_CZ.md` – sjednocené zadání a plán etap.
- `ASSET_CATALOG.md` – soupis dostupných grafických podkladů.
- `ETAPA-1-TITULNI-OBRAZOVKA.md` – konkrétní zadání první etapy.

## Aktuální stav

Repozitář nyní obsahuje základní hratelnou verzi s onboardingem, kategoriemi, sedmi režimy, koly, skóre a statistikami. Podrobnosti a omezení jsou v [STAV-HRY-CZ.md](STAV-HRY-CZ.md). Projekt je PWA, nikoli nativní Android APK.

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
