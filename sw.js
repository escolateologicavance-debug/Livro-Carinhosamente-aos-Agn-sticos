const CACHE_NAME = 'livro-pwa-v1';

// Arquivos que serão salvos offline - BARRAS REMOVIDAS
const ASSETS = [
  './',
  'index.html',
  '1.html',
  '2.html',
  '3.html',
  '4.html',
  '5.html',
  '6.html',
  '7.html',
  'musica.mp3',
  'manifest.json',
  'logo-192.png',
  'logo-512.png'
];

// Instalação → cacheia tudo
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso');
        return cache.addAll(ASSETS);
      })
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
                // Salva no cache para a próxima vez
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => {
            // Se falhar a rede (offline) e for navegação, manda pro index
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});