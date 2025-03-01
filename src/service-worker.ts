/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

console.log('[SW] Service Worker Registered!');

sw.addEventListener('install', () => {
	console.log('[SW] Service Worker Installed!');
});

// take control of the pages
sw.addEventListener('activate', (event) => {
	console.log('[SW] Service Worker Activated!', '\nTaking control of the pages...');
	return event.waitUntil(sw.clients.claim());
});

sw.addEventListener('push', async (event) => {
	const EventData = event.data?.json();
	if (!EventData) return;

	switch (EventData.tag) {
		case 'mention': {
			const { title, body, icon, tag, data } = EventData;

			// find if there's an active client
			const clients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
			const activeClient = clients.find(
				(c) => c.focused && c.url.endsWith(`/channels/${data.guildId}/${data.channelId}`),
			);

			// if there's an active client, ignore this push
			if (activeClient) return;

			// parse notification options
			const options: NotificationOptions = {
				body,
				icon,
				tag,
				data,
			};
			// show the notification
			return event.waitUntil(sw.registration.showNotification(title, options));
		}
	}
});

sw.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const notif = event.notification;

	switch (notif.tag) {
		case 'mention':
			// TODO: add /${messageId} to the end of the URL and make a page for it to redirect and auto scroll to that message
			return event.waitUntil(openWindow(`/channels/${notif.data.guildId}/${notif.data.channelId}`));
	}
});

async function openWindow(url: string) {
	// get the first client of the window clients
	const client = (
		await sw.clients.matchAll({
			type: 'window', // filter only window clients (tabs)
		})
	)?.at(0);

	if (client) {
		// If we have an existing client (tab), navigate it to the new URL then focus
		if (!client.url.endsWith(url)) client.navigate(url);
		return client.focus();
	}
	// If not, open a new one
	return sw.clients.openWindow(url);
}
