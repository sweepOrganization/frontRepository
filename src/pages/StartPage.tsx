import { useState } from "react";
import { useNavigate } from "react-router-dom";
import usePostFcmTokenMutation from "../hooks/mutations/usePostFcmTokenMutation";
import { requestPermissionAndGetToken } from "../lib/fcm";

const FCM_TOKEN_STORAGE_KEY = "fcmToken";

export default function StartPage() {
  const navigate = useNavigate();
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState("");

  const { mutateAsync: postFcmToken } = usePostFcmTokenMutation({
    onError: (error) => {
      console.error("FCM token post failed:", error);
      setPermissionMessage("알림 토큰 전송에 실패했어요. 다시 시도해주세요.");
    },
  });

  const getBlockedReason = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "이 브라우저는 알림을 지원하지 않아요.";
    }
    if (!window.isSecureContext) {
      return "알림 권한은 HTTPS 환경에서만 요청할 수 있어요.";
    }
    if (Notification.permission === "denied") {
      return "브라우저 설정에서 이 사이트 알림을 허용으로 바꾼 뒤 다시 눌러주세요.";
    }
    return null;
  };

  const handleCreateFirstAlarm = async () => {
    if (isCheckingPermission) return;
    setPermissionMessage("");

    const blockedReason = getBlockedReason();
    if (blockedReason) {
      setPermissionMessage(blockedReason);
      return;
    }

    setIsCheckingPermission(true);
    let hasFlowError = false;

    const token = await requestPermissionAndGetToken().catch((error) => {
      console.error("FCM permission/token flow failed:", error);
      setPermissionMessage(
        "알림 설정 중 문제가 발생했어요. 다시 시도해주세요.",
      );
      hasFlowError = true;
      return null;
    });

    if (!token) {
      if (!hasFlowError) {
        setPermissionMessage(
          Notification.permission === "default"
            ? "권한 창에서 알림 허용을 눌러주세요."
            : "알림을 허용해야 다음 단계로 이동할 수 있어요.",
        );
      }
      setIsCheckingPermission(false);
      return;
    }

    const isSameToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY) === token;
    if (!isSameToken) {
      const isPosted = await postFcmToken(token)
        .then(() => true)
        .catch(() => false);

      if (!isPosted) {
        setIsCheckingPermission(false);
        return;
      }

      localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
    }

    setIsCheckingPermission(false);
    navigate("/notification-setting-1");
  };

  return (
    <div className="box-border flex h-screen w-full flex-col px-5">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-[108px]">
          <img
            src="/start-image.svg"
            alt="출발 알림 이미지"
            className="mb-[13px] w-[209px]"
          />

          <h2 className="text-[23px] leading-[150%] font-semibold text-[var(--Normal)]">
            늦을까 걱정은
            <br />
            이제 그만해요
          </h2>

          <p className="mt-[26px] text-[17px] leading-[155%] font-normal text-[var(--Lightgray)]">
            일정을 입력하면
            <br />
            출발 타이밍을 자동으로 계산해요
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateFirstAlarm}
          disabled={isCheckingPermission}
          className="h-[62px] w-full cursor-pointer rounded-[10px] bg-[var(--GreenNormal)] text-[17px] font-semibold text-white transition-colors duration-200 hover:bg-[#4fb65e] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCheckingPermission ? "확인 중..." : "+ 첫 알림 만들기"}
        </button>

        {permissionMessage && (
          <p className="mt-3 text-[14px] text-[#d64545]">{permissionMessage}</p>
        )}
      </div>
    </div>
  );
}
