workbox.skipWaiting()
workbox.clientsClaim()

workbox.routing.registerRoute(
    // 'http://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css',
    new RegExp('(https):.*min\.(css|js)'),
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'cdn-cache'
    })
)

workbox.routing.registerRoute(
    new RegExp('(https|http):.*:4567.*\.json'),
    workbox.strategies.networkFirst({
        cacheName: 'api-data'
    })
);

self.addEventListener('fetch', event => {
    if(event.request.method === "POST" || event.request.method === "DELETE") {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(
                    JSON.stringify({ error: "This action disabled while app is offline!" }), {
                        headers: { 'Content-Type': 'application/json' }
                    }
                )
            })
        )
    }
})

self.addEventListener('push', event => {
    event.waitUntil(self.registration.showNotification('Todo List', {
        icon: '/icon-120.png',
        body: event.data.text()
    }))
})

workbox.precaching.precacheAndRoute(self.__precacheManifest || [])
