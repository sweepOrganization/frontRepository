import { useAlarmEdt, useAlarmEta } from "../../stores/useAlarmStore";

function toHourMinute(time: string) {
  if (!time) return "--:--";
  const [hour = "00", minute = "00"] = time.split(":");
  return `${hour}:${minute}`;
}

export default function TimeBanner() {
  const edt = useAlarmEdt();
  const eta = useAlarmEta();

  return (
    <div className="mb-10 flex h-[102px] flex-col gap-1 rounded-[10px] bg-(--GreenNormal) px-6 py-4 text-white">
      <span className="text-[17px] leading-[17px] text-(--GreenLightActive)">
        예상 출발시간
      </span>
      <div className="flex items-end justify-between">
        <span className="text-[49px] leading-[49px] font-bold">
          {toHourMinute(edt)}
        </span>
        <span className="text-[17px] leading-[17px]">
          <span className="text-(--GreenLightActive)">예상 도착시간 </span>
          <span className="font-bold">{toHourMinute(eta)}</span>
        </span>
      </div>
    </div>
  );
}
