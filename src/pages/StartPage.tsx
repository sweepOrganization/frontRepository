import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAlarmEntryPermission from "../hooks/useAlarmEntryPermission";

export default function StartPage() {
  const navigate = useNavigate();
  const [permissionMessage, setPermissionMessage] = useState("");
  const { isCheckingPermission, prepareAlarmEntry } = useAlarmEntryPermission();

  const handleCreateFirstAlarm = async () => {
    setPermissionMessage("");

    const result = await prepareAlarmEntry();
    if (!result.ok) {
      setPermissionMessage(result.message ?? "");
      return;
    }

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

          <h2 className="text-[23px] leading-[150%] font-semibold text-(--Normal)">
            늦을까 걱정은
            <br />
            이제 그만해요
          </h2>

          <p className="mt-[26px] text-[17px] leading-[155%] font-normal text-(--Lightgray)">
            일정을 입력하면
            <br />
            출발 타이밍을 자동으로 계산해요
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateFirstAlarm}
          disabled={isCheckingPermission}
          className="h-[62px] w-full cursor-pointer rounded-[10px] bg-(--GreenNormal) text-[17px] font-semibold text-white transition-colors duration-200 hover:bg-[#4fb65e] disabled:cursor-not-allowed disabled:opacity-70"
        >
          + 첫 알림 만들기
        </button>

        {permissionMessage && (
          <p className="mt-3 text-[14px] text-[#d64545]">{permissionMessage}</p>
        )}
      </div>
    </div>
  );
}
