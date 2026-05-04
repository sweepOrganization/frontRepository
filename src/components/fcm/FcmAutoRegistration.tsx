import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { messaging } from "../../lib/firebase";

export default function FcmAutoRegistration() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground push message:", payload);
    });

    return () => unsubscribe();
  }, []);

  return null;
}
