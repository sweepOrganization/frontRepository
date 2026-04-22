import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export const requestPermissionAndGetToken = async () => {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("알림 거부됨");
    return;
  }

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  console.log("FCM 토큰:", token);

  return token;
};
