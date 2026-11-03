(async () => {
  const grid = document.querySelector("#grid"), search = document.querySelector("#search"), category = document.querySelector("#category"), count = document.querySelector("#count"), status = document.querySelector("#status");
  try {
    const cards = await (await fetch("assets/word-cards/card-manifest.json?v=cards-corrected38")).json();
    const categories = [...new Set(cards.map(c => c.categoryCs))];
    categories.forEach((name) => { const opt = document.createElement("option"); opt.value = name; opt.textContent = `${name} / ${[...new Set(cards.filter(c => c.categoryCs === name).map(c => c.categoryEn))][0]}`; category.append(opt); });
    count.textContent = `${cards.length} kartiček`;
    const render = () => {
      const query = search.value.trim().toLocaleLowerCase("cs"), selected = category.value;
      const visible = cards.filter(c => (selected === "all" || c.categoryCs === selected) && (!query || `${c.wordCs} ${c.wordEn} ${c.categoryCs} ${c.categoryEn}`.toLocaleLowerCase("cs").includes(query)));
      grid.replaceChildren(); status.textContent = `Zobrazeno ${visible.length} z ${cards.length} kartiček`;
      const fragments = document.createDocumentFragment();
      for (const c of visible) {
        const article = document.createElement("article"); article.className = "card";
        const art = document.createElement("div"); art.className = "art";
        art.style.backgroundImage = `url("${c.sheet}")`;
        if (c.kind === "generated" || c.kind === "sprite") {
          const columns = c.columns || 4, rows = c.rows || 4;
          const column = c.index % columns, row = Math.floor(c.index / columns);
          art.style.backgroundSize = `${columns * 100}% ${rows * 100}%`;
          art.style.backgroundPosition = `${columns === 1 ? 50 : column / (columns - 1) * 100}% ${rows === 1 ? 50 : row / (rows - 1) * 100}%`;
        } else { art.style.backgroundSize = "contain"; art.style.backgroundPosition = "center"; }
        art.setAttribute("role", "img"); art.setAttribute("aria-label", `${c.wordCs} / ${c.wordEn}`);
        const words = document.createElement("div"); words.className = "words";
        const cat = document.createElement("div"); cat.className = "category"; cat.textContent = `${c.categoryCs} · ${c.categoryEn}`;
        const cs = document.createElement("div"); cs.className = "cs"; cs.textContent = c.wordCs;
        const en = document.createElement("div"); en.className = "en"; en.textContent = c.wordEn;
        words.append(cat, cs, en); article.append(art, words); fragments.append(article);
      }
      grid.append(fragments);
      if (!visible.length) { const empty = document.createElement("p"); empty.className = "empty"; empty.textContent = "Nic jsme nenašli."; grid.append(empty); }
    };
    search.addEventListener("input", render); category.addEventListener("change", render); render();
  } catch (error) { status.textContent = "Kartičky se nepodařilo načíst. Zkus stránku obnovit."; console.error(error); }
})();
