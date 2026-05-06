import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { messaging } from "../../lib/firebase";

export default function FcmAutoRegistration() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground push message:", payload);
      console.log("Notification.permission:", Notification.permission);

      if (Notification.permission !== "granted") {
        console.warn("Notification not shown: permission is not granted.");
        return;
      }

      const notification = payload?.notification ?? {};
      const title = notification.title || "알림";
      const body = notification.body || "";
      const icon = notification.icon || "/vite.svg";

      navigator.serviceWorker.ready
        .then((registration) =>
          registration.showNotification(title, { body, icon }),
        )
        .then(() => {
          console.log(
            "Foreground notification displayed via Service Worker API.",
          );
        })
        .catch((error) => {
          console.error("showNotification failed:", error);
        });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
