import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { requestPermissionAndGetToken } from "../lib/fcm";
import { messaging } from "../lib/firebase";
export default function PushTestPage() {
  const handleGetToken = async () => {
    const token = await requestPermissionAndGetToken();
    if (!token) return;
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/fcm/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      },
    );
    const data = await response.json();

    console.log("받은 응답 =", data);
  };
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("포그라운드 알림:", payload);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>FCM 테스트 페이지</h1>
      <button onClick={handleGetToken}>권한 요청 + 토큰 저장</button>
    </div>
  );
}
