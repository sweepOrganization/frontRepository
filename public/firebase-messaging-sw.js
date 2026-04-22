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
