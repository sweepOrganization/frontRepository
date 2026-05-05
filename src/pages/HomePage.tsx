import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Duck from "../components/HomePage/Duck";

type Alarm = {
  alarmId: number;
  title: string;
  arrivalTime: string;
  startTime: string;
  prepareTime?: number;
  totalTime?: number;
};

export default function HomePage() {
  const navigate = useNavigate();

  const [mainAlarm, setMainAlarm] = useState<Alarm | null>(null);
  const [alarmList, setAlarmList] = useState<Alarm[]>([]);

  useEffect(() => {
    const getAlarms = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/alarm`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        const now = new Date();

        const alarms = (
          Array.isArray(json.data) ? json.data : json.data ? [json.data] : []
        )
          .filter((alarm: Alarm) => new Date(alarm.arrivalTime) > now)
          .sort(
            (a: Alarm, b: Alarm) =>
              new Date(a.arrivalTime).getTime() -
              new Date(b.arrivalTime).getTime(),
          );

        if (alarms.length === 0) {
          navigate("/start");
          return;
        }

        setMainAlarm(alarms[0]);
        setAlarmList(alarms.slice(1));
      } catch (error) {
        console.error("알람 조회 실패", error);
      }
    };

    getAlarms();
  }, [navigate]);

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);

    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });
  };

  const getExpectedArrivalTime = (startTime: string, totalTime?: number) => {
    if (!totalTime) return "";

    const date = new Date(startTime);
    date.setMinutes(date.getMinutes() + totalTime);

    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isOneHourBefore = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);

    const diff = (start.getTime() - now.getTime()) / (1000 * 60);

    return diff <= 60;
  };

  if (!mainAlarm) return null;

  return (
    <div className="relative min-h-screen bg-[#fafafa] px-4 pt-[53px] pb-[100px]">
      {/* 상단 카드 */}
      <section className="rounded-[10px] bg-gradient-to-r from-[#50C864] to-[#80DF7C] px-[10px] pt-[10px] pb-[12px]">
        <h1 className="text-[21px] leading-[150%] font-semibold text-white">
          일정을 확인해보세요
        </h1>

        <div className="mt-[12px]">
          <Duck />
        </div>

        <div className="mt-[8px] h-[8px] w-full rounded-full bg-white/40">
          <div className="h-full w-[78%] rounded-full bg-white/55" />
        </div>
      </section>

      {/* 오늘 일정 카드 */}
      <section className="mt-[58px] rounded-[10px] border border-[#e4e4e4] bg-white">
        <div className="px-[26px] pt-[21px] pb-[30px]">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium text-[var(--Darkgray)]">
              {formatDate(mainAlarm.arrivalTime)}
            </p>
            <button className="text-[22px] text-[#999]">...</button>
          </div>

          <div className="mt-[12px] flex items-center gap-[13px]">
            <span className="rounded-[5px] bg-[#EFF9F0] px-[7px] py-[4px] text-[13px] font-semibold text-[var(--Green)]">
              일정 {formatTime(mainAlarm.arrivalTime)}
            </span>
            <span className="text-[17px] font-medium text-[#333]">
              {mainAlarm.title}
            </span>
          </div>

          <div className="mt-[38px]">
            <p className="text-[19px] font-semibold text-[#222]">준비 시작</p>

            <div className="mt-[4px] flex items-center">
              <span className="text-[38px] font-semibold text-[#222]">
                {formatTime(mainAlarm.startTime)}
              </span>

              <span className="mx-[12px] h-[1px] w-[21px] bg-[#ddd]" />

              <span className="text-[12px] text-[#777]">
                {mainAlarm.totalTime ? `${mainAlarm.totalTime}분` : ""}
              </span>

              <span className="mx-[12px] h-[1px] w-[21px] bg-[#ddd]" />

              <span className="text-[38px] font-light text-[#888]">
                {getExpectedArrivalTime(
                  mainAlarm.startTime,
                  mainAlarm.totalTime,
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e4e4e4] bg-[#F9F9F9] px-[26px] pt-[22px] pb-[16px]">
          <div className="flex items-start gap-[20px]">
            <span className="mt-[10px] rounded-[5px] bg-[#FF5B5B] px-[4px] py-[3.5px] text-[13px] font-semibold text-white">
              광역버스
            </span>

            {isOneHourBefore(mainAlarm.startTime) ? (
              <p className="text-[15px] leading-[160%] font-normal text-[var(--Darkgray)]">
                실시간 교통 정보 표시중 🚍
              </p>
            ) : (
              <p className="text-[15px] leading-[160%] font-normal text-[var(--Darkgray)]">
                출발 1시간 전,
                <br />
                실시간 교통 정보가 표시됩니다
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/route")}
            className="mt-[16px] h-[44px] w-full rounded-[10px] border border-[#39C75A] text-[17px] font-semibold text-[#00A12B]"
          >
            경로 보기
          </button>
        </div>
      </section>

      {alarmList.map((alarm) => (
        <section
          key={alarm.alarmId}
          className="mt-[23px] rounded-[10px] border border-[#e4e4e4] bg-white px-[26px] py-[20px]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium text-[var(--Darkgray)]">
              {formatDate(alarm.arrivalTime)}
            </p>
            <button className="text-[22px] text-[#999]">...</button>
          </div>

          <div className="mt-[5.5px] flex items-center justify-between">
            <div className="flex items-center gap-[13px]">
              <span className="rounded-[6px] bg-[#EAF8EC] px-[9px] py-[5px] text-[13px] font-semibold text-[#00A12B]">
                일정 {formatTime(alarm.arrivalTime)}
              </span>
              <span className="text-[15px] font-medium text-[var(--Neutral)]">
                {alarm.title}
              </span>
            </div>

            <p className="text-[18px] font-semibold text-[var(--Normal)]">
              준비 {formatTime(alarm.startTime)}
            </p>
          </div>
        </section>
      ))}

      {/* 플로팅 추가 버튼 */}
      <button
        type="button"
        onClick={() => navigate("/notification-setting")}
        className="fixed right-[29px] bottom-[25px] flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#55C969] text-[58px] leading-none font-light text-white shadow-lg"
      >
        +
      </button>
    </div>
  );
}
