const CACHE_NAME = 'expense-tracker-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

// 1. 서비스 워커 설치하고 캐시 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // index.html을 '/'와 'index.html' 두가지 경로로 캐싱
        const cachePromises = urlsToCache.map(urlToCache => {
            const url = new URL(urlToCache, self.location.origin);
            const request = new Request(url, {mode: 'no-cors'});
            return fetch(request).then(response => cache.put(request, response));
        });
        
        // expense-tracker.html을 '/' 와 '/index.html'로 캐싱
        cachePromises.push(
            fetch('expense-tracker.html').then(response => {
                const responseClone1 = response.clone();
                const responseClone2 = response.clone();
                cache.put('/', responseClone1);
                return cache.put('/index.html', responseClone2);
            })
        );
        
        return Promise.all(cachePromises);
      })
  );
});

// 2. 요청 들어오면 캐시에서 먼저 찾아보고, 없으면 네트워크로 감
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 그거 주고
        if (response) {
          return response;
        }
        // 없으면 원래대로 인터넷에서 가져옴
        return fetch(event.request);
      })
  );
});

// 3. 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
