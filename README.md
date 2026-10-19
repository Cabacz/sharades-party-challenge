# Sharades – Party Challenge: Title Screen

This repository starts with the title-screen package for the Sharades Party Challenge game.

## Structure
- `index.html` — standalone title-screen preview
- `css/title-screen.css` — responsive title-screen styles
- `js/title-screen.js` — Czech/English selector and integration hook
- `assets/images/` — Czech and English title-screen artwork
- `assets/components/` — supporting visual assets

## Integration
The start action dispatches `sharades:start-tutorial` and calls `window.openSharadesTutorial(language)` if the host app supplies it. Connect this to the existing tutorial when integrating with the full game.

Note: this package is the title-screen module/demo, not the complete game.