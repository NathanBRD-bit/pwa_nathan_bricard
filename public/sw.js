// Bump le nom du cache pour invalider les anciennes versions
const CACHE_NAME = "pwa-nb-cache-v6";

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            // Pré-cache minimal de ressources stables. Éviter de pré-cacher l'HTML pour ne pas figer l'app.
            await cache.addAll(["/favicon.ico"]);
            // Activer immédiatement le nouveau SW
            self.skipWaiting();
        })()
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
            // Prendre le contrôle immédiat des pages sans attendre un rechargement complet
            return self.clients.claim();
        }).then(() => {
            console.log('Service Worker v5 actif.');
        })
    );
});

self.addEventListener("fetch", (event) => {
    const req = event.request;

    // Ne gérer que les requêtes GET du même domaine
    if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
        return;
    }

    // 1) Strategie Network-First pour la navigation (HTML) afin d'éviter l'HTML obsolète qui référence d'anciens styles
    if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
        event.respondWith((async () => {
            try {
                const fresh = await fetch(req);
                const cache = await caches.open(CACHE_NAME);
                cache.put(req, fresh.clone());
                return fresh;
            } catch (err) {
                const cached = await caches.match(req);
                if (cached) return cached;
                // Fallback basique: la page d'accueil si disponible
                return caches.match('/');
            }
        })());
        return;
    }

    // 2) Strategie Stale-While-Revalidate pour les assets (CSS, JS, images, polices)
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
            .then((res) => {
                // Ne mettre en cache que les réponses valides (status 200, type basic)
                if (res && res.status === 200 && res.type === 'basic') {
                    cache.put(req, res.clone());
                }
                return res;
            })
            .catch(() => undefined);

        return cached || fetchPromise || new Response(null, { status: 504, statusText: 'Gateway Timeout' });
    })());
});


// Gestion du clic sur notification PWA
self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const targetUrl = (notification && notification.data && notification.data.url) || '/galleries';
    notification.close();

    event.waitUntil(
        (async () => {
            const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
            for (const client of allClients) {
                const url = new URL(client.url);
                if ('focus' in client) {
                    await client.focus();
                }
                if (url.pathname !== targetUrl && 'navigate' in client) {
                    await client.navigate(targetUrl);
                }
                return; // focusé/navigué une fenêtre existante
            }
            // Sinon, ouvrir une nouvelle fenêtre
            if (clients.openWindow) {
                await clients.openWindow(targetUrl);
            }
        })()
    );
});