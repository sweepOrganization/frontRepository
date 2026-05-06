import { getToken, isSupported } from "firebase/messaging";
import { messaging } from "./firebase";

export const requestPermissionAndGetToken = async () => {
  const supported = await isSupported();
  if (!supported) {
    throw new Error("이 브라우저는 FCM 웹푸시를 지원하지 않아요.");
  }

  if (!("serviceWorker" in navigator)) {
    throw new Error("이 브라우저는 서비스워커를 지원하지 않아요.");
  }

  if (!("PushManager" in window)) {
    throw new Error("이 브라우저는 PushManager를 지원하지 않아요.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const swRegistration = await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swRegistration,
  });

  return token;
};
