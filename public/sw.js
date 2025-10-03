const CACHE_NAME = "pwa-nb-cache-v3";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(["/", "/reception", "/camera", "/galleries", "room", "/favicon.ico", "/manifest.ts"]);
        })
    );
});

self.addEventListener('activate', event => {
    // delete any caches that aren't in expectedCaches
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            })
        )).then(() => {
            console.log('V2 now ready!');
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});