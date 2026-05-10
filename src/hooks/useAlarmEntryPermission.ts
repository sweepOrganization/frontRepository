import { useState } from "react";
import usePostFcmTokenMutation from "./mutations/usePostFcmTokenMutation";
import { requestPermissionAndGetToken } from "../lib/fcm";

const FCM_TOKEN_STORAGE_KEY = "fcmToken";

type AlarmEntryResult = {
  ok: boolean;
  message?: string;
};

export default function useAlarmEntryPermission() {
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const { mutateAsync: postFcmToken } = usePostFcmTokenMutation();

  const getBlockedReason = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "이 브라우저는 알림을 지원하지 않아요.";
    }
    if (!window.isSecureContext) {
      return "알림 권한은 HTTPS 환경에서만 요청할 수 있어요.";
    }
    if (Notification.permission === "denied") {
      return "브라우저 설정에서 이 사이트 알림을 허용으로 바꿔주세요.";
    }
    return null;
  };

  const prepareAlarmEntry = async (): Promise<AlarmEntryResult> => {
    if (isCheckingPermission) {
      return { ok: false, message: "권한 확인 중입니다." };
    }

    const blockedReason = getBlockedReason();
    if (blockedReason) {
      return { ok: false, message: blockedReason };
    }

    setIsCheckingPermission(true);

    const token = await requestPermissionAndGetToken().catch(() => null);
    if (!token) {
      setIsCheckingPermission(false);
      return {
        ok: false,
        message:
          Notification.permission === "default"
            ? "권한 창에서 알림 허용을 눌러주세요."
            : "알림을 허용해야 다음 단계로 이동할 수 있어요.",
      };
    }

    const isSameToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY) === token;
    if (!isSameToken) {
      const isPosted = await postFcmToken(token)
        .then(() => true)
        .catch(() => false);

      if (!isPosted) {
        setIsCheckingPermission(false);
        return {
          ok: false,
          message: "알림 토큰 전송에 실패했어요. 다시 시도해주세요.",
        };
      }

      localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
    }

    setIsCheckingPermission(false);
    return { ok: true };
  };

  return {
    isCheckingPermission,
    prepareAlarmEntry,
  };
}
