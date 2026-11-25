# Stav základní verze hry

## Funkční základ

- První vykreslení otevře interaktivní titulní plakát s volbou češtiny nebo angličtiny; po výběru jazyka naváže pětikrokový ilustrovaný tutoriál a po dokončení hlavní menu. Při dalším spuštění se otevře hlavní menu.
- Tutoriál nabízí postup kroků i přeskočení; ilustrace se jemně animují s podporou omezení pohybu v systému.
- Hlavní menu a mobilní grafika používají tmavě modré pozadí, neonově modré okraje a zaoblená 3D tlačítka.
- Osm kategorií v češtině i angličtině, každá má 40 jedinečných slov; vybrané dlaždice omezují herní balíček na slova z těch kategorií.
- Hráči, názvy týmů, avatary a lokálně uložené nastavení.
- Editor postavy: výběr hráče a čtyř hlavních avatarů (muž, žena, holčička a chlapeček) inspirovaných rodinným portrétem. Dřívější avatary dítěte, psa, robota a kočky zůstávají pod „Další postavy“, aby se zachovaly uložené volby. Pro každého hráče se ukládá účes, čepice, barva oblečení, doplněk, pozadí a výraz.
- Nastavení zahrnuje jazyk, délku kola, zvukové efekty, hudební smyčku, vibrace, tmavý režim a přepínač offline-only režimu.
- Sedm režimů: Klasika, Souboj týmů, Náhlá smrt, Maraton, Dvojité body, Pantomima a Kreslení.
- Týmový herní průběh: hráč na tahu drží telefon, klepnutím na kartičku si soukromě zobrazí slovo a dává spoluhráčům nápovědu podle zvoleného režimu. Herní plocha používá portrétní ilustraci obýváku, neonový rámeček, skóre, kategorii, počítadlo kartiček, kruhový odpočet a plastická 3D tlačítka „UHÁDL!“ a „Přeskočit“. Souhrn kola a výsledková tabule zůstávají součástí průběhu.
- Hádací slovo má obrázkovou kartičku s průhledným pozadím. V projektu je 24 hotových ilustrací: 16 výřezů ze sprite archu, 7 samostatných vektorových ilustrací a samostatný výřez králíka. Každý vestavěný výraz má odpovídající piktogram; obrázky se škálují bez deformace.
- Návrhy slov fungují výhradně z místních českých a anglických slovníků. Hra nepoužívá Supabase ani externí API; pro slova bez připravené ilustrace ukáže odpovídající symbol.
- Profil začíná s 25 mincemi; správná odpověď přidá mince podle bodové hodnoty režimu. Zamčené kosmetické volby lze v editoru odemknout za mince, cena se odečte a nákup zůstává uložený.
- Hra se ovládá dotykem; senzor náklonu ani pohybová oprávnění se nepoužívají.
- Lokální návrhy slov s tématem, samostatně zvoleným jazykem slov, obtížností a počtem; vybraná slova lze uložit do vlastních nebo spustit jako samostatný herní balíček. Vestavěné tematické balíčky zahrnují Minecraft, dinosaury a Harryho Pottera.
- Výsledky a základní statistiky se ukládají lokálně.
- PWA service worker kešuje nové grafické podklady pro použití offline.

## Pravidla režimů v této verzi

- **Klasika:** všichni sdílejí skóre; počet kol se nastavuje v přípravě hry.
- **Souboj týmů:** vytvořené týmy hrají střídavá kola.
- **Náhlá smrt:** první přeskočené slovo okamžitě ukončí hru.
- **Maraton:** každý tým má jeden nepřerušený dvouminutový tah; cílem je získat co nejvíc správných odpovědí.
- **Dvojité body:** každé uhodnuté slovo přidá 2 body.
- **Pantomima:** hráč napovídá beze slov a zvuků.
- **Kreslení:** hráč kreslí na papír bez písmen, čísel a zvuků.
- **Bodování:** ve všech soutěžních režimech hrají týmy střídavé tahy. Správná odpověď přidá týmu na tahu 1 bod (v Dvojitých bodech 2); přeskočení nepřidává body a čas běží dál. Klasika používá jedno společné skóre. V Náhlé smrti první přeskočení ukončí hru.
- **Pantomima:** pravidla připomínají předvádění beze slov a zvuků.
- **Kreslení:** hráči kreslí na papír bez písmen, čísel a zvuků; aplikace hlídá jen čas a skóre.

## Zatím plánované nebo omezené

- Slovníky obsahují 320 českých a 320 anglických položek. Nejde o 640 hotových obrázků: připravených ilustrací je 24 a ostatní výrazy zobrazují odpovídající symbol.
- Editor zatím nemá samostatný obchod ani další způsoby získávání mincí. Barvy vlasů, oblečení, výraz, čepice a doplňky se vykreslují přímo do původních SVG postav. Siluety postav se nemění.
- Nové kartičky používají lokální obrázky ze `assets/cards/`; slova bez konkrétního obrázku mají lokální emoji/ikonový fallback.
- Statistika medailí a oblíbených kategorií je základní lokální přehled, nikoli plný systém odměn.
- CI ověřuje syntax, datové soubory, interaktivní průchod hrou a sestavení debug APK. Před veřejným vydáním je stále vhodný fyzický test na Androidu/iOS.
