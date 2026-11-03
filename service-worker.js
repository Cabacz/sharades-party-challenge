const CACHE = "sharades-release-v34-all-cards";
const FILES = [
  "./",
  "./index.html",
  "./card-gallery.html",
  "./css/card-gallery.css?v=1",
  "./js/card-gallery.js?v=1",
  "./card-gallery.html",
  "./css/card-gallery.css?v=1",
  "./js/card-gallery.js?v=1",
  "./css/style.css?v=word-cards4",
  "./css/title-screen.css?v=splash1",
  "./js/title-screen.js?v=splash1",
  "./js/words.js?v=wordset2",
  "./js/cards.js?v=free-cards3",
  "./js/generated-cards.js?v=all-cards1",
  "./assets/word-cards/card-manifest.json",
  "./js/app.js?v=free-cards3",
  "./assets/word-cards/pole-vault.svg",
  "./assets/word-cards/high-jump.svg",
  "./assets/word-cards/parkour.svg",
  "./assets/word-cards/slipping-on-ice.svg",
  "./assets/word-cards/washing-window.svg",
  "./assets/word-cards/vacuum-cleaner.svg",
  "./assets/word-cards/iron.svg",
  "./assets/word-cards/family-card-cutout-sprites-v2.png",
  "./assets/word-cards/rabbit-family-cutout.png",
  "./assets/word-cards/generated/sheet-01-animals.webp",
  "./assets/word-cards/generated/sheet-02.webp",
  "./assets/word-cards/generated/sheet-03.webp",
  "./assets/word-cards/generated/sheet-04.webp",
  "./assets/word-cards/generated/sheet-05.webp",
  "./assets/word-cards/generated/sheet-06.webp",
  "./assets/word-cards/generated/sheet-07.webp",
  "./assets/word-cards/generated/sheet-08.webp",
  "./assets/word-cards/generated/sheet-09.webp",
  "./assets/word-cards/generated/sheet-10.webp",
  "./assets/word-cards/generated/sheet-11.webp",
  "./assets/word-cards/generated/sheet-12.webp",
  "./assets/word-cards/generated/sheet-13.webp",
  "./assets/word-cards/generated/sheet-14.webp",
  "./assets/word-cards/generated/sheet-15.webp",
  "./assets/word-cards/generated/sheet-16.webp",
  "./assets/word-cards/generated/sheet-17.webp",
  "./assets/word-cards/generated/sheet-18.webp",
  "./assets/word-cards/generated/sheet-19.webp",
  "./manifest.webmanifest",
  "./assets/logo.svg",
  "./assets/characters.png",
  "./assets/components/family-and-dog.png",
  "./assets/avatar-man.svg",
  "./assets/avatar-woman.svg",
  "./assets/avatar-girl.svg",
  "./assets/avatar-boy.svg",
  "./assets/avatar-child.svg",
  "./assets/avatar-robot.svg",
  "./assets/avatar-cat.svg",
  "./assets/avatar-dog.svg",
  "./assets/tutorial-1.webp",
  "./assets/tutorial-2.webp",
  "./assets/tutorial-3.webp",
  "./assets/tutorial-4.webp",
  "./assets/tutorial-5.webp",
  "./assets/images/title-screen-cz.png",
  "./assets/images/title-screen-en.png",
];
const OFFLINE_KEY = "./offline-mode";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE && key.startsWith("sharades-"))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SET_OFFLINE_MODE") return;
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      event.data.enabled
        ? cache.put(OFFLINE_KEY, new Response("enabled"))
        : cache.delete(OFFLINE_KEY),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      const cache = await caches.open(CACHE);
      const offlineMode = await cache.match(OFFLINE_KEY);
      if (offlineMode) {
        if (new URL(event.request.url).origin === self.location.origin) {
          if (event.request.mode === "navigate") {
            return (await caches.match("./index.html")) || Response.error();
          }
        }
        return new Response("", { status: 504, statusText: "Offline mode" });
      }

      try {
        const response = await fetch(event.request);
        if (
          response.ok &&
          new URL(event.request.url).origin === self.location.origin
        ) {
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match("./index.html")) || Response.error();
      }
    })(),
  );
});
