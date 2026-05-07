import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Duck from "../components/HomePage/Duck";

type Alarm = {
  alarmId: number;
  title: string;
  routeData?: string;
  arrivalTime: string;
  startTime: string;
  prepareTime?: number;
  totalTime?: number;
  actualTime?: number;
  routeId?: number;
  routeType?: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
};

export default function HomePage() {
  const navigate = useNavigate();

  const [mainAlarm, setMainAlarm] = useState<Alarm | null>(null);
  const [alarmList, setAlarmList] = useState<Alarm[]>([]);
  const [busInfo, setBusInfo] = useState<any>(null);
  const [remainSeconds, setRemainSeconds] = useState<number | null>(null);

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
        const detailAlarm = json?.data?.alarmDetailResponse;
        const summaryAlarms = Array.isArray(
          json?.data?.alarmSummaryResponseList,
        )
          ? json.data.alarmSummaryResponseList
          : [];

        const sourceAlarms = [
          ...(detailAlarm ? [detailAlarm] : []),
          ...summaryAlarms,
        ];

        const alarms = sourceAlarms
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

  const getDepartureTime = (startTime: string, prepareTime?: number) => {
    const date = new Date(startTime);

    date.setMinutes(date.getMinutes() + (prepareTime ?? 0));

    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getExpectedArrivalTime = (
    startTime: string,
    prepareTime?: number,
    actualTime?: number,
  ) => {
    const date = new Date(startTime);

    date.setMinutes(date.getMinutes() + (prepareTime ?? 0) + (actualTime ?? 0));

    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getMinutesUntilStart = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);

    return Math.max(
      0,
      Math.ceil((start.getTime() - now.getTime()) / (1000 * 60)),
    );
  };

  const isOneHourBefore = (startTime: string) => {
    return getMinutesUntilStart(startTime) <= 60;
  };

  const formatRemainTime = (seconds: number | null) => {
    if (seconds === null) return "-";

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${min}분 ${sec}초`;
  };

  const fetchBusInfo = async () => {
    if (!mainAlarm) return;
    if (mainAlarm.routeType !== "PATH_TYPE_BUS") return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/route/bus/arrival?stId=${busInfo?.localBusStation}&busRouteId=${busInfo?.localBus}&ord=0&providerCode=4`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();
      console.log("실시간 정보:", json.data);

      setBusInfo(json.data);
      setRemainSeconds(json.data?.remainSeconds ?? null);
    } catch (error) {
      console.error("실시간 정보 조회 실패", error);
    }
  };

  useEffect(() => {
    if (!mainAlarm) return;
    if (!isOneHourBefore(mainAlarm.startTime)) return;

    fetchBusInfo();
  }, [mainAlarm]);

  useEffect(() => {
    if (remainSeconds === null) return;

    const timer = setInterval(() => {
      setRemainSeconds((prev) => {
        if (prev === null) return null;
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainSeconds]);

  const parsedRouteData = mainAlarm?.routeData
    ? JSON.parse(mainAlarm.routeData)
    : null;

  const subwaySegment = parsedRouteData?.segments?.[1]?.find(
    (segment: any) => segment.trafficType === 1,
  );

  const subwayLineColorMap: Record<string, string> = {
    "1호선": "var(--line-1)",
    "2호선": "var(--line-2)",
    "3호선": "var(--line-3)",
    "4호선": "var(--line-4)",
    "5호선": "var(--line-5)",
    "6호선": "var(--line-6)",
    "7호선": "var(--line-7)",
    "8호선": "var(--line-8)",
    "9호선": "var(--line-9)",
    경의중앙선: "var(--line-gyeongui)",
    경춘선: "var(--line-gyeongchun)",
    수인분당선: "var(--line-su-in-bundang)",
    신분당선: "var(--line-sinbundang)",
    경강선: "var(--line-gyeonggang)",
    서해선: "var(--line-seohae)",
    공항철도: "var(--line-airport)",
    우이신설선: "var(--line-ui-sinseol)",
    김포골드라인: "var(--line-gimpo-gold)",
  };

  const subwayLineName = subwaySegment?.lineName?.replace("수도권 ", "") || "";

  const subwayLineColor = subwayLineColorMap[subwayLineName] || "var(--line-2)";
  const busColorMap: Record<string, string> = {
    광역버스: "var(--bus-red)",
    간선버스: "var(--bus-blue)",
    지선버스: "var(--bus-green)",
    순환버스: "var(--bus-yellow)",
    마을버스: "var(--bus-sky)",
  };

  const routeSegments = parsedRouteData?.segments?.flat?.() || [];

  const busSegment = routeSegments.find(
    (segment: any) => segment.trafficType === 2,
  );

  const busType = busSegment?.lane?.[0]?.type || "";
  const busName =
    busSegment?.lane?.[0]?.busNo ||
    busSegment?.lane?.[0]?.busNoList ||
    busSegment?.lane?.[0]?.name ||
    "";

  const busColor = busColorMap[busType] || "var(--bus-blue)";
  if (!mainAlarm) return null;

  const startedMinutesAgo = Math.floor(
    (new Date().getTime() - new Date(mainAlarm.startTime).getTime()) /
      (1000 * 60),
  );

  const isStartedRecently = startedMinutesAgo >= 0 && startedMinutesAgo <= 10;
  const now = new Date().getTime();
  const start = new Date(mainAlarm.startTime).getTime();

  const minutesLeft = Math.max(0, Math.ceil((start - now) / (1000 * 60)));
  const progressBaseMinutes = Math.min(mainAlarm.prepareTime ?? 60, 60);

  const shouldStartProgress = minutesLeft <= progressBaseMinutes;

  const elapsedMinutes = shouldStartProgress
    ? progressBaseMinutes - minutesLeft
    : 0;

  const rawProgress = shouldStartProgress
    ? Math.min(100, (elapsedMinutes / progressBaseMinutes) * 100)
    : 0;
  const progressPercent = `${Math.max(0, Math.min(100, rawProgress))}%`;
  const testOneHourBefore = isOneHourBefore(mainAlarm.startTime);

  return (
    <div className="relative min-h-screen bg-[#FBFBFB] px-4 pt-[53px] pb-[100px]">
      <section className="rounded-[10px] bg-gradient-to-r from-[#50C864] to-[#80DF7C] px-[10px] pt-[10px] pb-[12px]">
        <h1 className="text-[21px] leading-[150%] font-semibold text-white">
          {rawProgress >= 100
            ? "출발 하셨나요?"
            : minutesLeft <= 60
              ? `출발까지 ${minutesLeft}분 남았어요`
              : "일정을 확인해보세요"}
        </h1>

        <div className="relative mt-[8px] h-[39px] w-full">
          <div
            className="absolute top-0 transition-all duration-700"
            style={{
              left: `max(0px, calc(${progressPercent} - 18px))`,
            }}
          >
            <Duck
              image={
                rawProgress >= 35
                  ? "/duck-03.svg"
                  : rawProgress > 0
                    ? "/duck-02.svg"
                    : "/duck-01.svg"
              }
            />
          </div>
        </div>

        <div className="mt-[4px] h-[8px] w-full rounded-full bg-white/40">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: progressPercent }}
          />
        </div>
      </section>

      <section className="mt-[20px] rounded-[10px] border border-[#e4e4e4] bg-white">
        <div className="px-[26px] pt-[21px] pb-[30px]">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium text-[var(--Darkgray)]">
              {formatDate(mainAlarm.arrivalTime)}
            </p>
            <button className="text-[22px] text-[#999]">...</button>
          </div>

          <div className="mt-[10px] flex items-center gap-[12px]">
            <span className="rounded-[5px] bg-[#EFF9F0] px-[7px] py-[4px] text-[13px] font-semibold text-[var(--Green)]">
              일정 {formatTime(mainAlarm.arrivalTime)}
            </span>
            <span className="text-[17px] font-medium text-[var(--Neutral)]">
              {mainAlarm.title}
            </span>
          </div>

          <div className="mt-[38px] flex items-end justify-between">
            <div className="flex w-[95px] flex-col items-start">
              <div className="flex items-center gap-[8px]">
                {isStartedRecently && (
                  <div className="h-[12px] w-[12px] rounded-full bg-[#FF7A00] shadow-[0_0_0_6px_rgba(255,122,0,0.15)]" />
                )}

                <p
                  className={`text-[19px] font-semibold ${
                    isStartedRecently ? "text-[#FF7A00]" : "text-[#222]"
                  }`}
                >
                  출발
                </p>
              </div>

              <span className="text-[38px] font-semibold text-[#222]">
                {getDepartureTime(mainAlarm.startTime, mainAlarm.prepareTime)}
              </span>
            </div>

            <div className="mb-[10px] flex flex-col items-center">
              <div className="flex items-center gap-[10px]">
                <span className="h-[1px] w-[21px] bg-[#ddd]" />

                <span className="text-[12px] text-[#777]">
                  {(mainAlarm.actualTime ?? mainAlarm.totalTime)
                    ? `${Math.floor((mainAlarm.actualTime ?? mainAlarm.totalTime ?? 0) / 60)}시간 ${
                        (mainAlarm.actualTime ?? mainAlarm.totalTime ?? 0) % 60
                      }분`
                    : ""}
                </span>

                <span className="text-[#ddd]">→</span>
              </div>

              <span className="text-[12px] text-[#777]">소요</span>
            </div>

            <div className="mr-[20px] flex flex-col items-start">
              <p className="text-[15px] font-medium text-[#888]">도착 예정</p>

              <span className="text-[38px] font-light text-[#888]">
                {getExpectedArrivalTime(
                  mainAlarm.startTime,
                  mainAlarm.prepareTime,
                  mainAlarm.actualTime,
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e4e4e4] bg-[#F9F9F9] px-[26px] pt-[22px] pb-[16px]">
          <div className="flex items-start gap-[20px]">
            {mainAlarm.routeType === "PATH_TYPE_BUS" && (
              <span
                className="mt-[10px] rounded-[5px] px-[8px] py-[5px] text-[13px] font-semibold text-white"
                style={{
                  backgroundColor: busColor,
                }}
              >
                {busName || busType}
              </span>
            )}

            {testOneHourBefore ? (
              mainAlarm.routeType === "PATH_TYPE_BUS" ? (
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <p className="text-[19px] font-semibold text-[#333]">
                      {formatRemainTime(remainSeconds)}
                    </p>
                    <p className="mt-[4px] text-[15px] text-[#777]">3번째 전</p>
                  </div>

                  <div className="h-[58px] w-[1px] bg-[#e4e4e4]" />

                  <div>
                    <p className="text-[19px] font-semibold text-[#333]">
                      {busInfo?.nextRemainSeconds
                        ? formatRemainTime(busInfo.nextRemainSeconds)
                        : "-"}
                    </p>
                    <p className="mt-[4px] text-[15px] text-[#777]">8번째 전</p>
                  </div>

                  <button type="button" onClick={fetchBusInfo}>
                    <img
                      src="/refresh.svg"
                      alt="새로고침"
                      className="h-[44px] w-[44px]"
                    />
                  </button>
                </div>
              ) : (
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-[8px]">
                      <span
                        className="rounded-[5px] px-[6px] py-[3px] text-[13px] font-semibold text-white"
                        style={{
                          backgroundColor: subwayLineColor,
                        }}
                      >
                        {subwaySegment?.lineName?.replace("수도권 ", "")}
                      </span>

                      <span className="text-[17px] font-semibold text-[#333]">
                        {subwaySegment?.startStation}역
                      </span>
                    </div>

                    <button type="button" onClick={fetchBusInfo}>
                      <img
                        src="/refresh.svg"
                        alt="새로고침"
                        className="mt-[5px] h-[16px] w-[16px]"
                      />
                    </button>
                  </div>

                  <div className="mt-[10px] text-center">
                    <p className="text-[17px] font-semibold text-[#F60707]">
                      {subwaySegment?.sectionTime}분
                    </p>

                    <p className="mt-[3px] text-[13px] text-[#8F0303]">
                      {subwaySegment?.stationCount}번째 전
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-start gap-[16px]">
                {mainAlarm.routeType === "PATH_TYPE_SUBWAY" && (
                  <span
                    className="mt-[10px] rounded-[5px] px-[6px] py-[3px] text-[13px] font-semibold text-white"
                    style={{
                      backgroundColor: subwayLineColor,
                    }}
                  >
                    {subwayLineName}
                  </span>
                )}

                <p className="text-[15px] leading-[160%] font-normal text-[var(--Darkgray)]">
                  출발 1시간 전,
                  <br />
                  실시간 교통 정보가 표시됩니다
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              navigate(`/route/${mainAlarm.alarmId}`, {
                state: {
                  alarmId: mainAlarm.alarmId,
                  arrivalTime: mainAlarm.arrivalTime,
                  startTime: mainAlarm.startTime,
                  totalTime: mainAlarm.totalTime,
                  actualTime: mainAlarm.actualTime,
                  routeId: mainAlarm.routeId,
                  routeType: mainAlarm.routeType,
                  startX: mainAlarm.startX,
                  startY: mainAlarm.startY,
                  endX: mainAlarm.endX,
                  endY: mainAlarm.endY,
                },
              });
            }}
            className="mt-[22px] h-[48px] w-full rounded-[10px] border border-[#39C75A] bg-white text-[17px] font-semibold text-[#00A12B]"
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

      <button
        type="button"
        onClick={() => navigate("/notification-setting-1")}
        className="fixed right-[29px] bottom-[25px] flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#55C969] text-[58px] leading-none font-light text-white shadow-lg"
      >
        +
      </button>
    </div>
  );
}
