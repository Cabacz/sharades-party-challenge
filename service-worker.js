const CACHE = "sharades-release-v21";
const FILES = [
  "./",
  "./index.html",
  "./css/style.css?v=splash1",
  "./css/title-screen.css?v=splash1",
  "./js/app.js?v=splash1",
  "./js/title-screen.js?v=splash1",
  "./js/words.js",
  "./manifest.webmanifest",
  "./assets/logo.svg",
  "./assets/characters.png",
  "./assets/components/family-and-dog.png",
  "./assets/avatar-man.svg",
  "./assets/avatar-woman.svg",
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
