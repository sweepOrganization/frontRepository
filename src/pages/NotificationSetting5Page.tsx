import useCreateAlarmMutation from "../hooks/mutations/useCreateAlarmMutation";
import { useNavigate } from "react-router-dom";
import {
  useAlarmArrivalTime,
  useAlarmEdt,
  useAlarmEndPlace,
  useAlarmEta,
  useAlarmInterval,
  useAlarmPrepareTime,
  useAlarmStartPlace,
  useAlarmTitle,
} from "../stores/useAlarmStore";

function subtractMinutesFromTime(time: string, minutesToSubtract: number) {
  const [hour = "00", minute = "00", second = "00"] = time.split(":");
  const h = Number(hour) || 0;
  const m = Number(minute) || 0;
  const s = Number(second) || 0;
  const base = new Date(2000, 0, 1, h, m, s);
  base.setMinutes(base.getMinutes() - Math.max(0, minutesToSubtract));
  return `${String(base.getHours()).padStart(2, "0")}:${String(
    base.getMinutes(),
  ).padStart(2, "0")}`;
}

function getDiffMinutesLabel(edt: string, eta: string) {
  if (!edt || !eta) return "-분예상";
  const [eh = "0", em = "0"] = edt.split(":");
  const [ah = "0", am = "0"] = eta.split(":");
  const edtTotal = (Number(eh) || 0) * 60 + (Number(em) || 0);
  const etaTotal = (Number(ah) || 0) * 60 + (Number(am) || 0);

  let diff = etaTotal - edtTotal;
  if (diff < 0) diff += 24 * 60;
  if (diff < 60) return `${diff}분예상`;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (minutes === 0) return `${hours}시간예상`;
  return `${hours}시간 ${minutes}분예상`;
}

export default function NotificationSetting5Page() {
  const navigate = useNavigate();
  const title = useAlarmTitle();
  const arrivalTime = useAlarmArrivalTime();
  const edt = useAlarmEdt();
  const eta = useAlarmEta();
  const prepareTime = useAlarmPrepareTime();
  const startPlace = useAlarmStartPlace();
  const endPlace = useAlarmEndPlace();
  const interval = useAlarmInterval();
  const { mutate: createAlarm, isPending: isCreateAlarmPending } =
    useCreateAlarmMutation({
      onSuccess: () => {
        navigate("/");
      },
    });

  const isoMatch = arrivalTime.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );
  const formattedDate = isoMatch
    ? `${Number(isoMatch[2])}월 ${Number(isoMatch[3])}일`
    : "-";
  const formattedTime = isoMatch ? `${isoMatch[4]}:${isoMatch[5]}` : "-";

  const readyStartTime = edt
    ? subtractMinutesFromTime(edt, prepareTime)
    : formattedTime;
  const edtDisplay = edt ? edt.slice(0, 5) : formattedTime;
  const etaDisplay = eta ? eta.slice(0, 5) : formattedTime;
  const expectedDurationLabel = getDiffMinutesLabel(edt, eta);

  return (
    <div className="flex h-screen flex-col">
      <div className="mt-[14px] flex flex-1 flex-col overflow-y-auto">
        <div className="mx-4">
          <div className="mb-6">
            <span className="text-[23px] leading-[34px] font-bold">
              {title.trim() ? title : "일정01"}
            </span>
          </div>

          <div className="flex flex-col gap-[14px]">
            <div className="rounded-[9px] border border-(--Lightgray) px-4 py-[11px]">
              <div className="flex w-full items-center">
                <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {formattedDate}
                </span>
                <span className="h-4 w-px bg-(--Lightgray)" />
                <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {formattedTime}
                </span>
              </div>
            </div>

            <div className="rounded-[9px] border border-(--Lightgray) px-4 py-[11px]">
              <div className="flex w-full items-center">
                <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {startPlace.trim() ? startPlace : "출발지"}
                </span>
                <img
                  src="/bidirectionalarrow.svg"
                  alt="출발지 도착지 방향"
                  className="mx-2 h-4 w-4 shrink-0"
                />
                <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {endPlace.trim() ? endPlace : "도착지"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="my-4 h-[3px] w-full bg-(--Lightgray)" />
        <div className="mx-4">
          <div className="relative h-[437px] w-full overflow-hidden rounded-[10px] border border-(--Lightgray) px-4">
            <div className="pointer-events-none absolute inset-x-0 top-[334px] bottom-0 bg-[#f9f9f9]" />
            <div className="relative z-10">
              <div className="mt-4 mb-5 flex h-6 w-fit items-center justify-center gap-1 rounded-[6px] bg-(--GreenLight) px-1 font-bold">
                <span className="text-[13px] leading-[13px] text-(--Green)">
                  준비알람
                </span>
                {interval > 0 && (
                  <>
                    <span className="text-[13px] leading-[13px] text-[#b1d8b6]">
                      ·
                    </span>
                    <span className="text-[13px] leading-[13px] text-(--Green)">
                      {interval}분마다
                    </span>
                  </>
                )}
              </div>

              <div className="mb-5 flex flex-col gap-2">
                <span className="text-[19px] leading-[19px] font-bold text-(--Dark)">
                  준비 시작
                </span>
                <div className="flex items-center">
                  <span className="text-[38px] leading-[38px] font-semibold text-(--Dark)">
                    {readyStartTime}
                  </span>
                  <span className="ml-2 text-[17px] leading-[17px] font-bold text-(--Dark)">
                    부터 준비하세요
                  </span>
                </div>
              </div>

              <div className="w-fit rounded-[50px] border border-[#e4e4e4] bg-[#fbfbfb] px-2 py-0.5">
                <span className="text-[13px] leading-[13px] text-(--Gray)">
                  알람 예정 타임라인
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="relative mt-1 flex w-6 justify-center">
                    <img
                      src="/ready-icon.svg"
                      alt="준비 시작"
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="absolute top-3 h-8 w-[2px] bg-[#d3d6da]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] leading-[13px] font-bold text-[#0a75ef]">
                        준비 시작
                      </span>
                      <span className="text-[13px] leading-[13px] text-(--Gray)">
                        {readyStartTime}
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] leading-[11px] text-(--Gray)">
                      지금부터 준비하세요!
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="relative mt-1 flex w-6 justify-center">
                    <img
                      src="/remind-icon.svg"
                      alt="리마인드"
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="absolute top-3 h-8 w-[2px] bg-[#d3d6da]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] leading-[13px] font-bold text-[#5d5d5d]">
                        리마인드
                      </span>
                      <span className="text-[13px] leading-[13px] text-(--Gray)">
                        {interval > 0 ? `${interval}분 마다` : "없음"}
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] leading-[11px] text-(--Gray)">
                      출발전 알림을 드릴게요
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex w-6 justify-center">
                    <img
                      src="/start-icon.svg"
                      alt="출발 알림"
                      className="h-4 w-4 shrink-0"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] leading-[13px] font-bold text-[#f58300]">
                        출발 알림
                      </span>
                      <span className="text-[13px] leading-[13px] text-(--Gray)">
                        {edtDisplay}
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] leading-[11px] text-(--Gray)">
                      지금 출발해야 해요
                    </span>
                  </div>
                </div>

                <div className="mx-5 my-8 flex items-center justify-between">
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[15px] leading-[15px] text-(--Gray)">
                      출발
                    </span>
                    <span className="text-[38px] leading-[38px] text-(--Dark)">
                      {edtDisplay}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src="/arrow-icon.svg"
                      alt="화살표"
                      className="h-2 w-8 shrink-0"
                    />
                    <span className="text-[12px] leading-[12px] text-(--Gray)">
                      {expectedDurationLabel}
                    </span>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[15px] leading-[15px] text-(--Gray)">
                      도착
                    </span>
                    <span className="text-[38px] leading-[38px] text-(--Dark)">
                      {etaDisplay}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="h-1.5 w-full rounded-full bg-[#e4e4e4]">
          <div className="h-full w-full rounded-full bg-(--GreenNormal)" />
        </div>
        <button
          type="button"
          disabled={isCreateAlarmPending}
          onClick={() => createAlarm()}
          className="mt-auto h-[67px] w-full bg-(--GreenNormal) text-[17px] font-bold text-white"
        >
          {isCreateAlarmPending ? "알람 생성중" : "완료"}
        </button>
      </div>
    </div>
  );
}
