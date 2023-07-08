/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('activate', async () => {
	// This will be called only once when the service worker is activated.
	// console.log('service worker activated');
});

sw.addEventListener('notificationclick', (event: NotificationEvent) => {
	event.notification.close();

	// TODO: Make it open the same tab...
	// const urlToOpen = self.location.origin; // Open the current tab URL

	// event.waitUntil(
	// 	sw.clients
	// 		.matchAll({ type: 'window', includeUncontrolled: true })
	// 		.then((windowClients: readonly WindowClient[]) => {
	// 			// Check if a window/tab matching the URL already exists
	// 			for (let i = 0; i < windowClients.length; i++) {
	// 				const client = windowClients[i];
	// 				if (client.url === urlToOpen && 'focus' in client) {
	// 					return client.focus();
	// 				}
	// 			}

	// 			// If no matching window/tab is found, open a new one
	// 			if (sw.clients.openWindow) {
	// 				return sw.clients.openWindow(urlToOpen);
	// 			}
	// 		})
	// );
});
