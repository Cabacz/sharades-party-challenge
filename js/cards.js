(() => {
  // Paid image generation is opt-in. The free build never contacts an image API.
  window.SHARADES_CARD_API_URL = "";
  const exact = {
    cs: {
      Popelka: 0, Mimoň: 1, Lev: 2, Tučňák: 3,
      Špagety: 4, Zmrzlina: 5, "Eiffelova věž": 6, Škola: 7,
      Jóga: 8, Bowling: 9, Hasič: 10, Kuchař: 11,
      Duha: 12, Sopka: 13, Budík: 14, Vysavač: 15,
    },
    en: {
      Cinderella: 0, Minion: 1, Lion: 2, Penguin: 3,
      Spaghetti: 4, "Ice cream": 5, "Eiffel Tower": 6, School: 7,
      Yoga: 8, Bowling: 9, Firefighter: 10, Chef: 11,
      Rainbow: 12, Volcano: 13, "Alarm clock": 14, "Vacuum cleaner": 15,
    },
  };
  const symbols = {
    cs: {
      Pes:"🐶",Kočka:"🐱",Slon:"🐘",Žirafa:"🦒",Tučňák:"🐧",Klokan:"🦘",Opice:"🐒",Lev:"🦁",Želva:"🐢",Delfín:"🐬",Kohout:"🐓",Had:"🐍",Krokodýl:"🐊",Včela:"🐝",Pavouk:"🕷️",Liška:"🦊",Medvěd:"🐻",Králík:"🐇",Sova:"🦉",Žába:"🐸",Kůň:"🐴",Prase:"🐷",Veverka:"🐿️",Orel:"🦅",Panda:"🐼",Koala:"🐨",Vydra:"🦦",Lama:"🦙",Ovce:"🐑",Koza:"🐐",Myš:"🐁",Krysa:"🐀",Velryba:"🐋",Žralok:"🦈",Chobotnice:"🐙",Medúza:"🪼",Pštros:"🪶",Páv:"🦚",Ježek:"🦔",Netopýr:"🦇",
      Popelka:"👸",Shrek:"🧌","Spider-Man":"🕷️","Harry Potter":"🪄","Ledové království":"❄️",Batman:"🦇","Piráti z Karibiku":"🏴‍☠️","Toy Story":"🤠",Mimoň:"🟡",Superman:"🦸",Simpsonovi:"👨‍👩‍👧‍👦","Hledá se Nemo":"🐠","Král lev":"🦁",Sněhurka:"🍎",Titanic:"🚢",Avengers:"🛡️",Avatar:"👽","Jurský park":"🦖","Pán prstenů":"💍",Matrix:"🕶️","Sám doma":"🏠",Jumanji:"🎲",Coco:"🎸",Ratatouille:"🐀",Madagaskar:"🦓","Kung Fu Panda":"🐼","Jak vycvičit draka":"🐉","Příšerky s.r.o.":"👾","Hledá se Dory":"🐟","V hlavě":"🧠","Vzhůru do oblak":"🎈",Aladin:"🧞","Kráska a zvíře":"🌹","Kocour v botách":"🐈",Rocky:"🥊",Zootropolis:"🦊","Život brouka":"🐜","Asterix a Obelix":"🛡️","Limonádový Joe":"🤠","Noc v muzeu":"🦕",
      Pizza:"🍕",Špagety:"🍝",Palačinka:"🥞",Zmrzlina:"🍦",Hamburger:"🍔",Sushi:"🍣",Knedlík:"🥟",Jablko:"🍎",Popcorn:"🍿",Dort:"🎂",Citron:"🍋","Chilli paprička":"🌶️",Kukuřice:"🌽","Párek v rohlíku":"🌭",Jahoda:"🍓",Meloun:"🍉",Těstoviny:"🍝",Hranolky:"🍟",Sýr:"🧀",Sendvič:"🥪",Salát:"🥗",Polévka:"🍲","Pečené kuře":"🍗",Steak:"🥩",Vejce:"🥚",Mrkev:"🥕",Banán:"🍌","Hroznové víno":"🍇",Pomeranč:"🍊",Ananas:"🍍",Avokádo:"🥑",Sušenka:"🍪",Kobliha:"🍩",Muffin:"🧁","Zeleninový burger":"🥬",Zázvor:"🫚",Med:"🍯",Puding:"🍮",Lízátko:"🍭","Ovesná kaše":"🥣",
      Praha:"🏙️",Paříž:"🗼","Eiffelova věž":"🗼",Hrad:"🏰",Zámek:"🏰",Škola:"🏫",Nemocnice:"🏥",Letiště:"✈️",Pláž:"🏖️",ZOO:"🦒",Kino:"🎥",Restaurace:"🍽️","Vlakové nádraží":"🚉",Knihovna:"📚",Hory:"⛰️",Aquapark:"🌊",Londýn:"🇬🇧",Řím:"🏛️","New York":"🗽",Benátky:"🚣",Egypt:"🐫",Pyramidy:"🔺",Poušť:"🏜️",Ostrov:"🏝️",Les:"🌲",Farma:"🚜","Hasičská stanice":"🚒","Policejní stanice":"🚓",Supermarket:"🛒",Hřiště:"🛝",Stadion:"🏟️",Most:"🌉",Tunel:"🚇",Metro:"🚇",Přístav:"⚓",Kemp:"⛺",Pošta:"📮",Kostel:"⛪",Mrakodrap:"🏙️",Cirkus:"🎪",
      Fotbal:"⚽",Hokej:"🏒",Tenis:"🎾",Plavání:"🏊","Jízda na kole":"🚴",Lyžování:"🎿",Box:"🥊",Basketbal:"🏀",Skateboarding:"🛹",Běh:"🏃",Gymnastika:"🤸",Bowling:"🎳",Volejbal:"🏐",Lukostřelba:"🏹",Jóga:"🧘",BMX:"🚵",Vzpírání:"🏋️","Stolní tenis":"🏓",Kulečník:"🎱",Rychlobruslení:"⛸️",Krasobruslení:"⛸️",Karate:"🥋",Judo:"🥋",Ragby:"🏉",Házená:"🤾",Kriket:"🏏",Surfování:"🏄",Horolezectví:"🧗",Motokros:"🏍️",Šerm:"🤺","Skok do výšky":"🦘","Skok o tyči":"🏃‍♀️🎋",Akrobacie:"🤸",Švihadlo:"🪢",Zápas:"🤼",Potápění:"🤿",Kanoistika:"🛶",Parkour:"🏃",Veslování:"🚣","Kolečkové brusle":"🛼",
      Kuchař:"👨‍🍳",Hasič:"🧑‍🚒",Lékař:"🧑‍⚕️",Učitel:"🧑‍🏫",Policista:"👮",Pilot:"🧑‍✈️",Kadeřník:"💇",Zedník:"🧱",Klaun:"🤡",Fotograf:"📸",Zpěvák:"🎤",Tanečník:"💃",Zubař:"🦷",Farmář:"🧑‍🌾",Kouzelník:"🪄",Astronaut:"🧑‍🚀",Trenér:"📣",Programátor:"💻",Pošťák:"📬",Detektiv:"🕵️",Veterinář:"🐾",Herec:"🎭",Model:"🧍",Mechanik:"🔧",Elektrikář:"⚡",Instalatér:"🔩",Zahradník:"🪴",Rybář:"🎣","Řidič autobusu":"🚌",Vlakvedoucí:"🚆",Prodavač:"🛍️",Číšník:"🧑‍🍳",Pekař:"🥖",Cukrář:"🧁",Soudce:"⚖️",Vědec:"🔬",Hudebník:"🎼",Dirigent:"🎼",Knihovník:"📚",Hokejista:"🏒",
      Bouřka:"⛈️",Vichřice:"🌬️",Duha:"🌈",Sopka:"🌋",Vodopád:"🏞️","Mořská vlna":"🌊",Lavina:"🏔️",Zemětřesení:"🌎",Kempování:"🏕️","Strom ve větru":"🌳",Květina:"🌷",Houba:"🍄","Duhový had":"🌈🐍","Lesní požár":"🔥",Sněhulák:"☃️",Mráz:"🥶","Sněhová bouře":"🌨️","Západ slunce":"🌇","Východ slunce":"🌅","Měsíční svit":"🌙","Hvězdná noc":"🌌","Polární záře":"🌌",Ledovec:"🧊",Jeskyně:"🕳️",Tsunami:"🌊",Příliv:"🌊",Odliv:"🏖️",Tornádo:"🌪️",Krupobití:"🌨️",Mlha:"🌫️",Námraza:"🧊","Jarní déšť":"🌧️","Podzimní listí":"🍂","Padající list":"🍃","Klíčící semínko":"🌱",Mraveniště:"🐜",Pavučina:"🕸️","Hnízdo na stromě":"🪺","Písečná bouře":"🏜️","Rosa na trávě":"💧",
      "Zubní kartáček":"🪥",Deštník:"☂️",Vysavač:"🌀",Kytara:"🎸",Telefon:"📱",Budík:"⏰",Kufr:"🧳",Kolo:"🚲",Kamera:"📷",Brýle:"👓",Žehlička:"🧺",Nůžky:"✂️",Vrták:"🛠️",Hrnek:"☕",Polštář:"🛏️",Dalekohled:"🔭","Čistit si zuby":"🪥",Vařit:"🍳",Spát:"😴",Tančit:"💃",Zpívat:"🎤","Řídit auto":"🚗","Vázat tkaničky":"👟",Rybařit:"🎣",Fotit:"📸","Sekat trávu":"🌱",Vysávat:"🧹",Malovat:"🎨","Péct dort":"🎂","Hledat klíče":"🔑","Pád na ledu":"🧊","Číst knihu":"📖","Mýt nádobí":"🧽","Hrát na piano":"🎹",Telefonovat:"📞","Stříhat papír":"✂️","Hledat poklad":"🗺️","Stavět sněhuláka":"☃️","Balit dárek":"🎁","Mýt okno":"🪟",
    },
    en: {
      Dog:"🐶",Cat:"🐱",Elephant:"🐘",Giraffe:"🦒",Penguin:"🐧",Kangaroo:"🦘",Monkey:"🐒",Lion:"🦁",Turtle:"🐢",Dolphin:"🐬",Rooster:"🐓",Snake:"🐍",Crocodile:"🐊",Bee:"🐝",Spider:"🕷️",Fox:"🦊",Bear:"🐻",Rabbit:"🐇",Owl:"🦉",Frog:"🐸",Horse:"🐴",Pig:"🐷",Squirrel:"🐿️",Eagle:"🦅",Panda:"🐼",Koala:"🐨",Otter:"🦦",Llama:"🦙",Sheep:"🐑",Goat:"🐐",Mouse:"🐁",Rat:"🐀",Whale:"🐋",Shark:"🦈",Octopus:"🐙",Jellyfish:"🪼",Ostrich:"🪶",Peacock:"🦚",Hedgehog:"🦔",Bat:"🦇",
      Cinderella:"👸",Shrek:"🧌","Spider-Man":"🕷️","Harry Potter":"🪄",Frozen:"❄️",Batman:"🦇","Pirates of the Caribbean":"🏴‍☠️","Toy Story":"🤠",Minion:"🟡",Superman:"🦸","The Simpsons":"👨‍👩‍👧‍👦","Finding Nemo":"🐠","The Lion King":"🦁","Snow White":"🍎",Titanic:"🚢","The Avengers":"🛡️",Avatar:"👽","Jurassic Park":"🦖","The Lord of the Rings":"💍","The Matrix":"🕶️","Home Alone":"🏠",Jumanji:"🎲",Coco:"🎸",Ratatouille:"🐀",Madagascar:"🦓","Kung Fu Panda":"🐼","How to Train Your Dragon":"🐉","Monsters, Inc.":"👾","Finding Dory":"🐟","Inside Out":"🧠",Up:"🎈",Aladdin:"🧞","Beauty and the Beast":"🌹","Puss in Boots":"🐈",Rocky:"🥊",Zootopia:"🦊","A Bug’s Life":"🐜","Asterix and Obelix":"🛡️","The Mask":"🤠","Night at the Museum":"🦕",
      Pizza:"🍕",Spaghetti:"🍝",Pancake:"🥞","Ice cream":"🍦",Hamburger:"🍔",Sushi:"🍣",Dumpling:"🥟",Apple:"🍎",Popcorn:"🍿",Cake:"🎂",Lemon:"🍋","Chili pepper":"🌶️",Corn:"🌽","Hot dog":"🌭",Strawberry:"🍓",Watermelon:"🍉",Pasta:"🍝","French fries":"🍟",Cheese:"🧀",Sandwich:"🥪",Salad:"🥗",Soup:"🍲","Roast chicken":"🍗",Steak:"🥩",Egg:"🥚",Carrot:"🥕",Banana:"🍌",Grapes:"🍇",Orange:"🍊",Pineapple:"🍍",Avocado:"🥑",Cookie:"🍪",Doughnut:"🍩",Muffin:"🧁","Veggie burger":"🥬",Ginger:"🫚",Honey:"🍯",Pudding:"🍮",Lollipop:"🍭",Oatmeal:"🥣",
      Prague:"🏙️",Paris:"🗼","Eiffel Tower":"🗼",Castle:"🏰",School:"🏫",Hospital:"🏥",Airport:"✈️",Beach:"🏖️",Zoo:"🦒",Cinema:"🎥",Restaurant:"🍽️","Train station":"🚉",Library:"📚",Mountains:"⛰️","Water park":"🌊",Museum:"🏛️",London:"🇬🇧",Rome:"🏛️","New York":"🗽",Venice:"🚣",Egypt:"🐫",Pyramids:"🔺",Desert:"🏜️",Island:"🏝️",Forest:"🌲",Farm:"🚜","Fire station":"🚒","Police station":"🚓",Supermarket:"🛒",Playground:"🛝",Stadium:"🏟️",Bridge:"🌉",Tunnel:"🚇","Subway station":"🚇",Harbor:"⚓",Campsite:"⛺","Post office":"📮",Church:"⛪",Skyscraper:"🏙️",Circus:"🎪",
      Football:"⚽",Hockey:"🏒",Tennis:"🎾",Swimming:"🏊",Cycling:"🚴",Skiing:"🎿",Boxing:"🥊",Basketball:"🏀",Skateboarding:"🛹",Running:"🏃",Gymnastics:"🤸",Bowling:"🎳",Volleyball:"🏐",Archery:"🏹",Yoga:"🧘",BMX:"🚵",Weightlifting:"🏋️","Table tennis":"🏓",Billiards:"🎱","Speed skating":"⛸️","Figure skating":"⛸️",Karate:"🥋",Judo:"🥋",Rugby:"🏉",Handball:"🤾",Cricket:"🏏",Surfing:"🏄","Rock climbing":"🧗",Motocross:"🏍️",Fencing:"🤺","High jump":"🦘","Pole vault":"🏃‍♀️🎋",Acrobatics:"🤸","Jump rope":"🤸‍♀️🪢",Wrestling:"🤼","Scuba diving":"🤿",Canoeing:"🛶",Parkour:"🏃",Rowing:"🚣","Roller skating":"🛼",
      Chef:"👨‍🍳",Firefighter:"🧑‍🚒",Doctor:"🧑‍⚕️",Teacher:"🧑‍🏫","Police officer":"👮",Pilot:"🧑‍✈️",Hairdresser:"💇",Builder:"🧱",Clown:"🤡",Photographer:"📸",Singer:"🎤",Dancer:"💃",Dentist:"🦷",Farmer:"🧑‍🌾",Magician:"🪄",Astronaut:"🧑‍🚀",Coach:"📣",Programmer:"💻","Mail carrier":"📬",Detective:"🕵️",Veterinarian:"🐾",Actor:"🎭",Model:"🧍",Mechanic:"🔧",Electrician:"⚡",Plumber:"🔩",Gardener:"🪴",Fisherman:"🎣","Bus driver":"🚌","Train conductor":"🚆",Shopkeeper:"🛍️",Waiter:"🧑‍🍳",Baker:"🥖","Pastry chef":"🧁",Judge:"⚖️",Scientist:"🔬",Musician:"🎼",Conductor:"🎼",Librarian:"📚","Hockey player":"🏒",
      Thunderstorm:"⛈️",Gale:"🌬️",Rainbow:"🌈",Volcano:"🌋",Waterfall:"🏞️","Ocean wave":"🌊",Avalanche:"🏔️",Earthquake:"🌎",Camping:"🏕️","Tree in the wind":"🌳",Flower:"🌷",Mushroom:"🍄","Forest fire":"🔥",Snowman:"☃️",Tornado:"🌪️",Frost:"🥶",Snowstorm:"🌨️",Sunset:"🌇",Sunrise:"🌅",Moonlight:"🌙","Starry night":"🌌","Northern lights":"🌌",Glacier:"🧊",Cave:"🕳️",Tsunami:"🌊","High tide":"🌊","Low tide":"🏖️",Hailstorm:"🌨️",Fog:"🌫️","Black ice":"🧊","Spring rain":"🌧️","Autumn leaves":"🍂","Falling leaf":"🍃","Germinating seed":"🌱",Anthill:"🐜",Spiderweb:"🕸️","Bird nest":"🪺",Sandstorm:"🏜️","Morning dew":"💧","Shooting star":"🌠",
      Toothbrush:"🪥",Umbrella:"☂️","Vacuum cleaner":"🌀",Guitar:"🎸",Phone:"📱","Alarm clock":"⏰",Suitcase:"🧳",Bicycle:"🚲",Camera:"📷",Glasses:"👓",Iron:"🧺",Scissors:"✂️",Drill:"🛠️",Mug:"☕",Pillow:"🛏️",Telescope:"🔭","Brushing teeth":"🪥",Cooking:"🍳",Sleeping:"😴",Dancing:"💃",Singing:"🎤","Driving a car":"🚗","Tying shoelaces":"👟",Fishing:"🎣","Taking a photo":"📸","Mowing the lawn":"🌱",Vacuuming:"🧹",Painting:"🎨","Baking a cake":"🎂","Looking for keys":"🔑","Slipping on ice":"🧍‍♂️🧊","Reading a book":"📖","Washing dishes":"🧽","Playing piano":"🎹","Making a phone call":"📞","Cutting paper":"✂️","Searching for treasure":"🗺️","Building a snowman":"☃️","Wrapping a gift":"🎁","Washing a window":"🪟",
    },
  };
  window.SHARADES_CARD_ART = {
    sheet: "assets/word-cards/family-card-cutout-sprites-v2.png",
    exact,
    cutout(word, language) {
      if ((language === "en" && word === "Rabbit") || (language !== "en" && word === "Králík"))
        return "assets/word-cards/rabbit-family-cutout.png";
      return null;
    },
    custom(word, language) {
      const localized = {
        cs: { "Skok o tyči": "pole-vault.svg", "Skok do výšky": "high-jump.svg", Parkour: "parkour.svg", Vysavač: "vacuum-cleaner.svg", Žehlička: "iron.svg", Vysávat: "vacuum-cleaner.svg", "Pád na ledu": "slipping-on-ice.svg", "Mýt okno": "washing-window.svg" },
        en: { "Pole vault": "pole-vault.svg", "High jump": "high-jump.svg", Parkour: "parkour.svg", "Vacuum cleaner": "vacuum-cleaner.svg", Iron: "iron.svg", Vacuuming: "vacuum-cleaner.svg", "Slipping on ice": "slipping-on-ice.svg", "Washing a window": "washing-window.svg" },
      };
      const file = (localized[language] || localized.cs)[word];
      return file ? `assets/word-cards/${file}` : null;
    },
    hasSpecificSymbol(word, language) {
      const dictionary = symbols[language] || symbols.cs;
      return Object.hasOwn(dictionary, word);
    },
    sprite(word, category, language) {
      const dictionary = exact[language] || exact.cs;
      return Object.hasOwn(dictionary, word) ? dictionary[word] : null;
    },
    symbol(word, category, language) {
      const dictionary = symbols[language] || symbols.cs;
      if (Object.hasOwn(dictionary, word)) return dictionary[word];
      const cat = String(category || "").toLocaleLowerCase();
      if (/zvíř|animal/.test(cat)) return "🐾";
      if (/jíd|food/.test(cat)) return "🍽️";
      if (/míst|place/.test(cat)) return "🌍";
      if (/sport/.test(cat)) return "🏅";
      if (/povol|job/.test(cat)) return "🧑‍🚒";
      if (/přírod|nature/.test(cat)) return "🌿";
      if (/film|movie|wizard|harry|minecraft|dinosaur/.test(cat)) return "🎬";
      return "✨";
    },
    position(index, columns = 4, rows = 4) {
      const col = index % columns;
      const row = Math.floor(index / columns);
      return `${columns === 1 ? 50 : (col / (columns - 1)) * 100}% ${rows === 1 ? 50 : (row / (rows - 1)) * 100}%`;
    },
  };
})();
