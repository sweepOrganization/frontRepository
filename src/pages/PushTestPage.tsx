import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import useGetFcmTokenMutation from "../hooks/mutations/useGetFcmTokenMutation";
import usePostFcmTokenMutation from "../hooks/mutations/usePostFcmTokenMutation";
import { messaging } from "../lib/firebase";

export default function PushTestPage() {
  const { getFcmToken } = useGetFcmTokenMutation();
  const { mutate: postFcmToken } = usePostFcmTokenMutation();

  const handleGetToken = () => {
    getFcmToken({
      onSuccess: (token) => {
        if (!token) return;

        postFcmToken(token, {
          onSuccess: () => {
            console.log("FCM 토큰 전송에 성공했습니다.");
          },
          onError: (error) => {
            console.error("FCM 토큰 전송에 실패했습니다:", error);
          },
        });
      },
      onError: (error) => {
        console.error("FCM 토큰 발급에 실패했습니다:", error);
      },
    });
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
