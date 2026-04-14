const CACHE_NAME = 'livro-pwa-v1';

// Arquivos que serão salvos offline
const ASSETS = [
  '/',
  '/index.html',
  '/1.html',
  '/2.html',
  '/3.html',
  '/4.html',
  '/5.html',
  '/6.html',
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png'
];

// Instalação → cacheia tudo
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// Ativação → limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

// Intercepta requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se tiver no cache, entrega
        if (response) {
          return response;
        }

        // Senão, busca na internet
        return fetch(event.request)
          .then(networkResponse => {
            return caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => {
            // fallback simples
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});