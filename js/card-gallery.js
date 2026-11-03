(async () => {
  const grid = document.querySelector("#grid"), search = document.querySelector("#search"), category = document.querySelector("#category"), count = document.querySelector("#count"), status = document.querySelector("#status");
  const imageCache = new Map(), tileCache = new Map();
  const getImage = (src) => {
    if (!imageCache.has(src)) imageCache.set(src, new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; }));
    return imageCache.get(src);
  };
  const crop = async (card) => {
    if (card.kind === "custom" || card.kind === "cutout") return card.sheet;
    const rows = card.kind === "generated" ? (card.rows || 4) : 4, columns = card.kind === "generated" ? (card.columns || 4) : 4;
    const key = `${card.sheet}:${card.index}:${columns}:${rows}`;
    if (tileCache.has(key)) return tileCache.get(key);
    const img = await getImage(card.sheet), canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth / columns); canvas.height = Math.round(img.naturalHeight / rows);
    const ctx = canvas.getContext("2d"); ctx.drawImage(img, (card.index % columns) * img.naturalWidth / columns, Math.floor(card.index / columns) * img.naturalHeight / rows, img.naturalWidth / columns, img.naturalHeight / rows, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/webp", .88); tileCache.set(key, data); return data;
  };
  try {
    const cards = await (await fetch("assets/word-cards/card-manifest.json")).json();
    const categories = [...new Set(cards.map(c => c.categoryCs))];
    categories.forEach((name, i) => { const opt = document.createElement("option"); opt.value = name; opt.textContent = `${name} / ${[...new Set(cards.filter(c => c.categoryCs === name).map(c => c.categoryEn))][0]}`; category.append(opt); });
    count.textContent = `${cards.length} kartiček`;
    const render = async () => {
      const query = search.value.trim().toLocaleLowerCase("cs"), selected = category.value;
      const visible = cards.filter(c => (selected === "all" || c.categoryCs === selected) && (!query || `${c.wordCs} ${c.wordEn} ${c.categoryCs} ${c.categoryEn}`.toLocaleLowerCase("cs").includes(query)));
      grid.replaceChildren(); status.textContent = `Zobrazeno ${visible.length} z ${cards.length} kartiček`;
      const fragments = document.createDocumentFragment();
      for (const c of visible) {
        const article = document.createElement("article"); article.className = "card";
        const art = document.createElement("div"); art.className = "art";
        const img = document.createElement("img"); img.alt = `${c.wordCs} / ${c.wordEn}`; img.loading = "lazy"; img.src = await crop(c).catch(() => "");
        art.append(img); const words = document.createElement("div"); words.className = "words";
        const cat = document.createElement("div"); cat.className = "category"; cat.textContent = `${c.categoryCs} · ${c.categoryEn}`;
        const cs = document.createElement("div"); cs.className = "cs"; cs.textContent = c.wordCs;
        const en = document.createElement("div"); en.className = "en"; en.textContent = c.wordEn;
        words.append(cat, cs, en); article.append(art, words); fragments.append(article);
      }
      grid.append(fragments);
      if (!visible.length) { const empty = document.createElement("p"); empty.className = "empty"; empty.textContent = "Nic jsme nenašli."; grid.append(empty); }
    };
    search.addEventListener("input", render); category.addEventListener("change", render); await render();
  } catch (error) { status.textContent = "Kartičky se nepodařilo načíst. Zkus stránku obnovit."; console.error(error); }
})();
