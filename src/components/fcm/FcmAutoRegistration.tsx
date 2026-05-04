import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { messaging } from "../../lib/firebase";

export default function FcmAutoRegistration() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground push message:", payload);

      if (Notification.permission !== "granted") return;

      const notification = payload?.notification ?? {};
      const data = payload?.data ?? {};
      const title = notification.title || data.title || "알림";
      const body = notification.body || data.body || "";
      const icon = notification.icon || data.icon || "/vite.svg";

      new Notification(title, { body, icon });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
