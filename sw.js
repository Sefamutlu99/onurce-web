// Onurce İnşaat service worker: sayfa önce ağdan (güncel kalsın), görsel/stil/script önce önbellekten.
// Önbelleği yenilemek için CACHE adını değiştirmek yeterli.
const CACHE = "onurce-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "assets/icons/icon-192.png", "assets/onurce/onurcelogoSON.webp"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Yalnız kendi sitemiz; videolar (parça parça istenir) ve harita karoları önbelleğe alınmaz
  if (request.method !== "GET" || url.origin !== location.origin || request.headers.has("range") || request.destination === "video") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
