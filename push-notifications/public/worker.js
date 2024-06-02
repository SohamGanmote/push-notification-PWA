// public/worker.js
self.addEventListener("push", (event) => {
	const data = event.data.json();
	self.registration.showNotification(data.notification.title, {
		body: data.notification.body,
		icon: data.notification.icon,
		data: data.notification.data,
	});
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	event.waitUntil(clients.openWindow(event.notification.data.url));
});
