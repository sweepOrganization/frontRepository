import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { messaging } from "../../lib/firebase";

export default function FcmAutoRegistration() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("포그라운드 푸시 메시지:", payload);
      console.log("Notification.permission:", Notification.permission);

      if (Notification.permission !== "granted") {
        console.warn("알림 권한이 허용되지 않아 알림을 표시하지 않습니다.");
        return;
      }

      const notification = payload?.notification ?? {};
      const title = notification.title || "알림";
      const body = notification.body || "";
      const icon = notification.icon || "/hodadak-icon.png";

      navigator.serviceWorker.ready
        .then((registration) =>
          registration.showNotification(title, { body, icon }),
        )
        .then(() => {
          console.log("Service Worker API로 포그라운드 알림을 표시했습니다.");
        })
        .catch((error) => {
          console.error("알림 표시(showNotification)에 실패했습니다:", error);
        });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
