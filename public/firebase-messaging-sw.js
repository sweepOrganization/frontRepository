importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCrEwcDhHddbZ_jOTvid3EFDSmAtIC9G6A",
  authDomain: "swpt-49477.firebaseapp.com",
  projectId: "swpt-49477",
  messagingSenderId: "648420275634",
  appId: "1:648420275634:web:583f458c8b2ba8b85c20ab",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload?.notification ?? {};
  const data = payload?.data ?? {};

  const title = notification.title || data.title || "알림";
  const body = notification.body || data.body || "";
  const icon = notification.icon || data.icon || "/vite.svg";
  const clickAction = data.click_action || data.url || "/";

  self.registration.showNotification(title, {
    body,
    icon,
    data: { clickAction },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const clickAction = event.notification?.data?.clickAction || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.navigate(clickAction);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(clickAction);
        }

        return null;
      }),
  );
});
