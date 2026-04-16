import { requestPermissionAndGetToken } from "../lib/fcm";
export default function PushTestPage() {
  const handleGetToken = async () => {
    const token = await requestPermissionAndGetToken();
    if (!token) return;
    // 아직 백엔드 연동 안 됨
    //   await fetch("/임시엔드포인트", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ token }),
    //   });
    //   console.log("토큰 저장 요청 완료");
    // };
    // // useEffect(() => {
    //   const unsubscribe = onMessage(messaging, (payload) => {
    //     console.log("포그라운드 알림:", payload);
    //   });
    //   return () => unsubscribe();
    // }, []);
  };
  return (
    <div style={{ padding: 24 }}>
      <h1>FCM 테스트 페이지</h1>
      <button onClick={handleGetToken}>권한 요청 + 토큰 저장</button>
    </div>
  );
}
