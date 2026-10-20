# Stav základní verze hry

## Funkční základ

- První spuštění: volba češtiny/angličtiny, volba se uloží a jazyk lze změnit v nastavení.
- Pětikrokový ilustrovaný tutoriál s tlačítky zpět/další a přeskočením.
- Hlavní menu a mobilní grafika vycházející z dodaných postav a neonového stylu.
- Osm kategorií v češtině i angličtině; vybrané dlaždice omezují herní balíček na slova z těch kategorií.
- Hráči, názvy týmů, avatary a lokálně uložené nastavení.
- Editor postavy: výběr hráče a jedné z pěti postav; pro každého hráče se ukládá účes, čepice, barva oblečení, doplněk, pozadí a výraz.
- Sedm režimů: Klasika, Souboj týmů, Náhlá smrt, Maraton, Dvojité body, Pantomima a Kreslení.
- Herní kolo ihned ukazuje slovo předvádějícímu, obsahuje odpočet, pauzu, přeskočení, potvrzení správné odpovědi a skóre.
- Profil začíná s 25 mincemi; správná odpověď přidá mince podle bodové hodnoty režimu. Utrácení mincí a obchod zatím nejsou implementované.
- Volitelné ovládání náklonem zařízení; tlačítka zůstávají jako dostupná alternativa.
- Lokální návrhy slov s tématem, jazykem, obtížností a počtem; vybraná slova lze uložit do vlastních.
- Výsledky a základní statistiky se ukládají lokálně.
- PWA service worker kešuje nové grafické podklady pro použití offline.

## Pravidla režimů v této verzi

- **Klasika:** všichni sdílejí skóre; počet kol se nastavuje v přípravě hry.
- **Souboj týmů:** dva týmy hrají střídavá kola.
- **Náhlá smrt:** první přeskočené slovo okamžitě ukončí hru.
- **Maraton:** jedno nepřerušené dvouminutové kolo; cílem je získat co nejvíc správných odpovědí.
- **Dvojité body:** každé uhodnuté slovo přidá 2 body.
- **Pantomima:** pravidla připomínají předvádění beze slov a zvuků.
- **Kreslení:** hráči kreslí na papír bez písmen, čísel a zvuků; aplikace hlídá jen čas a skóre.

## Zatím plánované nebo omezené

- „AI generátor“ zatím vybírá návrhy z místního slovníku; nepřipojuje vzdálený AI model.
- Hudba, utrácení mincí a odemykání kosmetických předmětů nejsou implementované. V editoru se nyní vzhled nastavuje volně; doplňky a výraz se skládají jako grafické překryvy v náhledu, původní ilustrace těla a obličeje se nepřekresluje.
- Náklon zařízení je volitelný a vyžaduje podporu senzorů a případné povolení v prohlížeči; herní tlačítka fungují i bez něj.
- Statistika medailí a oblíbených kategorií je základní lokální přehled, nikoli plný systém odměn.
- Ověření proběhlo v lokálním prohlížeči; před publikací je potřeba praktický test na Androidu/iOS a kontrola nasazení GitHub Pages.
