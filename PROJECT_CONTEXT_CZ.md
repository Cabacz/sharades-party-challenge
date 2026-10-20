# Sharades – Party Challenge: zadání projektu

## Cíl

Pokračovat na samostatné mobilní party hře se šarádami v repozitáři `Cabacz/sharades-party-challenge`. Vycházet z existující hry a grafických podkladů, zachovat její rozpoznatelný neonový 3D charakter a postupovat po malých ověřitelných etapách.

## Vizuální směr

- Zachovat neonový, barevný 3D vzhled původního projektu.
- Zachovat identitu a charakter postav z dodaných referencí; mezi postavami jsou muž, žena, dítě/dívka a pes.
- Na titulní stránce upřednostnit tři postavy. Jemný pohyb/animace je žádoucí, pokud půjde udělat bez ztráty čitelnosti a výkonu na telefonu.
- Použít již přiložené grafické podklady jako hlavní vizuální zdroj. Nepoužívat OpenArt.

## Funkční směr

- Hra a její rozhraní mají být dostupné česky i anglicky.
- Cílové první vydání je mobilní webová hra/PWA; Android APK je až pozdější distribuční krok.
- Hra pro více lidí u jednoho telefonu: výběr hráčů/týmů a kategorií, odhadování slov, čas, skóre, přeskočení a výsledky.
- Případné AI generování slov musí být navrženo bezpečně na serverové straně; žádné tajné API klíče do klientského kódu.

## Etapy

1. **Titulní obrazovka:** grafika, tři postavy, značka, jazyk a hlavní tlačítka; ověřit na mobilních rozměrech.
2. **Úvod a návod:** česky/anglicky vysvětlit držení telefonu na čele, hádání/přeskočení a cestu do menu.
3. **Hlavní menu a příprava hry:** hráči/týmy, avatary, kategorie, nastavení a případná AI volba.
4. **Herní kolo:** slovo, časomíra, skóre, správná odpověď/přeskočení/naklopení telefonu a konec kola.
5. **Ověření a distribuce:** mobilní testování, kontrola dat a případné sestavení Android APK.

## Pravidla práce

- Před většími změnami ověřit, co už projekt obsahuje, a zachovat použitelné části.
- Pracovat po jedné etapě; neimplementovat celý produkt najednou.
- Před pokračováním ověřit hotovou etapu na cílovém telefonu nebo v odpovídajícím mobilním náhledu.
- Starý projekt ponechat jako zdroj a zálohu; změny patří do nového repozitáře.

## Zdroj a limity převzatých materiálů

Podklady z původního projektu jsou převzaté do `assets/`, `Reference/` a `References/`; jejich přehled je v [ASSET_CATALOG.md](ASSET_CATALOG.md). Sdílená konverzace obsahovala i samostatné přílohy. Do nové složky byly přeneseny soubory dostupné v původním repozitáři; nedostupné samostatné přílohy nejsou vydávány za stažené.
