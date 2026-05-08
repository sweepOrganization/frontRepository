import DeleteModal from "../components/HomePage/DeleteModal";
import useGetDetailRoute from "../hooks/queries/useGetDetailRoute";
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlarmId, setSelectedAlarmId] = useState<number | null>(null);

  function handleOpenModal(alarmId: number) {
    setSelectedAlarmId(alarmId);
    setIsOpen(true);
  }

  function handleCloseModal() {
    setIsOpen(false);
    setSelectedAlarmId(null);
  }

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

  const formatBusRemain = (bus: any) => {
    if (!bus) return "-";

    const message = bus.arrivalMessage ?? "";

    if (
      message.includes("곧 도착") ||
      message.includes("운행 종료") ||
      message.includes("운행종료")
    ) {
      return message;
    }

    if (typeof bus.arrivalTimeSeconds === "number") {
      return formatRemainTime(bus.arrivalTimeSeconds);
    }

    return message || "-";
  };

  const getSubwayRemainText = (time?: string) => {
    if (!time) return "-";

    const now = currentTime;
    const [hour, minute, second = "0"] = time.split(":");

    const target = new Date(now);
    target.setHours(Number(hour), Number(minute), Number(second), 0);

    const diffSeconds = Math.max(
      0,
      Math.ceil((target.getTime() - now.getTime()) / 1000),
    );

    const min = Math.floor(diffSeconds / 60);
    const sec = diffSeconds % 60;

    return `${min}분 ${sec}초`;
  };

  const fetchBusInfo = async () => {
    if (!mainAlarm) return;
    if (mainAlarm.routeType !== "PATH_TYPE_BUS") return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const parsedData = mainAlarm.routeData
        ? JSON.parse(mainAlarm.routeData)
        : null;

      const segments = parsedData?.segments?.flat() || [];

      const currentBusSegment = segments.find(
        (segment: any) => segment.trafficType === 2,
      );

      const stId = currentBusSegment?.localBusStationId;
      const busRouteId = currentBusSegment?.busRouteId;

      console.log("실시간 요청 값:", {
        stId,
        busRouteId,
      });

      if (!stId || !busRouteId) return;
      console.log("fetch 시작");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/route/bus/arrival?stId=${stId}&busRouteId=${busRouteId}&ord=0&providerCode=4`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("응답 상태:", res.status);

      const json = await res.json();

      console.log("실시간 응답:", json);
      setBusInfo(json.data);
      setRemainSeconds(json.data?.remainSeconds ?? null);
    } catch (error) {
      console.error("실시간 정보 조회 실패", error);
    }
  };

  useEffect(() => {
    if (!mainAlarm) return;

    console.log("mainAlarm routeType:", mainAlarm.routeType);

    fetchBusInfo();
  }, [mainAlarm]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const routeSegments = parsedRouteData?.segments?.flat() || [];

  const subwaySegment = routeSegments.find(
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

  const subwayLineName = subwaySegment?.lineName?.replace("수도권 ", "") ?? "";

  const subwayLineColor = subwayLineColorMap[subwayLineName] ?? "var(--line-2)";

  const busSegment = routeSegments.find(
    (segment: any) => segment.trafficType === 2,
  );

  const { data: detailRouteData, refetch: refetchDetailRoute } =
    useGetDetailRoute({
      routeId: mainAlarm?.routeId,
      type: mainAlarm?.routeType,
      startX: mainAlarm?.startX,
      startY: mainAlarm?.startY,
      endX: mainAlarm?.endX,
      endY: mainAlarm?.endY,
      arrivalTime: mainAlarm?.arrivalTime,
    });

  const detailBoardingInfo =
    detailRouteData?.data?.[0]?.segmentBoardingInfos?.find(
      (info: any) => info.trafficType === 2,
    );

  console.log("선택된 알람:", mainAlarm);
  console.log("routeType:", mainAlarm?.routeType);
  console.log(
    "버스 목록:",
    routeSegments.filter((segment: any) => segment.trafficType === 2),
  );
  console.log("현재 잡힌 버스:", busSegment);

  const boardingInfo =
    detailBoardingInfo ??
    busInfo?.[0]?.segmentBoardingInfos?.[0] ??
    busInfo?.segmentBoardingInfos?.[0];

  const busName = boardingInfo?.transportId ?? "";

  const firstBus = boardingInfo?.arrivingBuses?.[0];
  const secondBus = boardingInfo?.arrivingBuses?.[1];

  const busColor = "var(--bus-blue)";

  if (!mainAlarm) return null;

  const now = currentTime.getTime();

  const prepareStartTime = new Date(mainAlarm.startTime).getTime();
  const departureTime =
    prepareStartTime + (mainAlarm.prepareTime ?? 0) * 60 * 1000;

  const isPrepareStarted = now >= prepareStartTime;
  const isDeparted = now >= departureTime;

  const leftLabel = isPrepareStarted ? "출발" : "준비 시작";

  const leftTime = isPrepareStarted
    ? getDepartureTime(mainAlarm.startTime, mainAlarm.prepareTime)
    : formatTime(mainAlarm.startTime);

  const rightLabel = isPrepareStarted ? "도착 예정" : "출발 알람";

  const rightTime = isPrepareStarted
    ? getExpectedArrivalTime(
        mainAlarm.startTime,
        mainAlarm.prepareTime,
        mainAlarm.actualTime,
      )
    : getDepartureTime(mainAlarm.startTime, mainAlarm.prepareTime);

  const progressBaseSeconds = Math.min(mainAlarm.prepareTime ?? 60, 60) * 60;

  const progressStartTime = prepareStartTime - progressBaseSeconds * 1000;

  const secondsLeft = Math.max(0, Math.ceil((prepareStartTime - now) / 1000));

  const minutesLeft = Math.floor(secondsLeft / 60);

  const elapsedSeconds =
    now >= prepareStartTime
      ? progressBaseSeconds
      : Math.max(
          0,
          Math.min(
            progressBaseSeconds,
            Math.floor((now - progressStartTime) / 1000),
          ),
        );

  const rawProgress = Math.min(
    100,
    (elapsedSeconds / progressBaseSeconds) * 100,
  );

  const progressPercent = `${Math.max(0, rawProgress)}%`;
  const duration = mainAlarm.actualTime ?? mainAlarm.totalTime ?? 0;
  const testOneHourBefore = isOneHourBefore(mainAlarm.startTime);
  return (
    <div className="relative min-h-screen bg-[#FBFBFB] px-4 pt-[53px] pb-[100px]">
      <section className="overflow-hidden rounded-[10px] bg-gradient-to-r from-[#50C864] to-[#80DF7C] px-[10px] pt-[10px] pb-[12px]">
        <h1 className="text-[21px] leading-[150%] font-semibold text-white">
          {rawProgress >= 100
            ? "출발 하셨나요?"
            : minutesLeft <= 60
              ? `출발까지 ${minutesLeft}분 남았어요`
              : "일정을 확인해보세요"}
        </h1>

        <div className="relative mt-[8px] h-[39px] w-full">
          <div
            className="absolute top-0 left-0 transition-all duration-700"
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
            <button
              type="button"
              onClick={() => handleOpenModal(mainAlarm.alarmId)}
              className="flex h-[24px] w-[24px] items-center justify-center"
            >
              <span className="text-[32px] leading-none font-light text-[#999]">
                ×
              </span>
            </button>
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
                {(isPrepareStarted || isDeparted) && (
                  <div
                    className={`h-[8px] w-[8px] rounded-full ${
                      isPrepareStarted ? "bg-[#FF7A00]" : "bg-[#1E7BDB]"
                    } ${
                      isPrepareStarted
                        ? "shadow-[0_0_0_4px_rgba(255,122,0,0.2)]"
                        : "shadow-[0_0_0_4px_rgba(30,123,219,0.2)]"
                    }`}
                  />
                )}

                <p
                  className={`text-[19px] font-semibold ${
                    isPrepareStarted ? "text-[#FF7A00]" : "text-[#1E7BDB]"
                  }`}
                >
                  {leftLabel}
                </p>
              </div>

              <span className="text-[38px] font-semibold text-[#222]">
                {leftTime}
              </span>
            </div>

            <div className="mb-[10px] flex flex-col items-center">
              <div className="flex items-center gap-[10px]">
                <span className="h-[1px] w-[21px] bg-[#ddd]" />

                <span className="text-[12px] text-[#777]">
                  {duration
                    ? `${Math.floor(duration / 60)}시간 ${duration % 60}분`
                    : ""}
                </span>

                <span className="text-[#ddd]">→</span>
              </div>

              <span className="text-[12px] text-[#777]">소요</span>
            </div>

            <div className="flex flex-col items-start">
              <p className="text-[15px] font-medium text-[#888]">
                {rightLabel}
              </p>

              <span className="text-[38px] font-light text-[#888]">
                {rightTime}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-b-[10px] border-t border-[#e4e4e4] bg-[#F9F9F9] px-[26px] pt-[22px] pb-[16px]">
          <div className="flex items-start">
            {testOneHourBefore ? (
              mainAlarm.routeType === "PATH_TYPE_BUS" ? (
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[8px]">
                      <span
                        className="rounded-[5px] px-[6px] py-[3px] text-[13px] font-semibold text-white"
                        style={{
                          backgroundColor: busColor,
                        }}
                      >
                        {busName}
                      </span>

                      <span className="text-[17px] font-semibold text-[#333]">
                        {busSegment?.startStop}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        fetchBusInfo();
                        refetchDetailRoute();
                      }}
                    >
                      <img
                        src="/refresh.svg"
                        alt="새로고침"
                        className="h-[16px] w-[16px]"
                      />
                    </button>
                  </div>

                  <div className="mt-[8px] flex items-center">
                    <div className="flex-1 text-center">
                      <p className="text-[15px] font-semibold text-[#F60707]">
                        {formatBusRemain(firstBus).split("[")[0]}
                      </p>

                      <p className="mt-[4px] text-[13px] font-semibold text-[#F60707]">
                        {firstBus?.arrivalMessage?.includes("[")
                          ? `[${firstBus.arrivalMessage.split("[")[1]}`
                          : ""}
                      </p>
                    </div>

                    <div className="h-[26px] w-[1px] bg-[#e4e4e4]" />

                    <div className="flex-1 text-center">
                      <p className="text-[15px] font-semibold text-[#F60707]">
                        {formatBusRemain(secondBus).split("[")[0]}
                      </p>

                      <p className="mt-[4px] text-[13px] font-semibold text-[#F60707]">
                        {secondBus?.arrivalMessage?.includes("[")
                          ? `[${secondBus.arrivalMessage.split("[")[1]}`
                          : ""}
                      </p>
                    </div>
                  </div>
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
                      {getSubwayRemainText(subwaySegment?.latestBoardingTime)}
                    </p>

                    <p className="mt-[3px] text-[13px] text-[#8F0303]">
                      탑승까지 남은 시간
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
              navigate(`/route/${mainAlarm.alarmId}`);
            }}
            className="mt-[22px] h-[48px] w-full rounded-[10px] border border-[var(--GreenNormal)] bg-white text-[17px] font-semibold text-[var(--Green)]"
          >
            경로 보기
          </button>
        </div>
      </section>

      {alarmList.length > 0 && (
        <h2 className="mt-[23px] text-[17px] font-semibold text-[var(--Darkgray)]">
          예정일정
        </h2>
      )}

      {alarmList.map((alarm) => (
        <section
          key={alarm.alarmId}
          className="mt-[12px] rounded-[10px] border border-[#e4e4e4] bg-white px-[26px] py-[20px]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium text-[var(--Darkgray)]">
              {formatDate(alarm.arrivalTime)}
            </p>
            <button className="text-[22px] text-[#999]">...</button>
          </div>

          <div className="mt-[5.5px] flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <span className="rounded-[5px] bg-[#EAF8EC] px-[7px] py-[3px] text-[13px] font-semibold text-[var(--Green)]">
                일정 {formatTime(alarm.arrivalTime)}
              </span>
              <span className="text-[15px] font-medium text-[var(--Neutral)]">
                {alarm.title}
              </span>
            </div>

            <p className="flex items-center gap-[8px] text-[18px] text-[var(--Normal)]">
              <span className="font-medium">준비</span>
              <span className="font-semibold">
                {formatTime(alarm.startTime)}
              </span>
            </p>
          </div>
        </section>
      ))}

      <button
        type="button"
        onClick={() => {
          localStorage.removeItem("accessToken");
          navigate("/login");
        }}
        className="mt-[24px] w-full text-center text-[14px] text-[#999]"
      >
        로그아웃
      </button>

      <button
        type="button"
        onClick={() => navigate("/notification-setting-1")}
        className="fixed right-[29px] bottom-[25px] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[var(--GreenNormal)] shadow-lg"
      >
        <div className="relative h-[26px] w-[26px]">
          <div className="absolute top-1/2 left-0 h-[3px] w-full -translate-y-1/2 rounded-full bg-white" />
          <div className="absolute top-0 left-1/2 h-full w-[3px] -translate-x-1/2 rounded-full bg-white" />
        </div>
      </button>

      {isOpen && selectedAlarmId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={handleCloseModal}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DeleteModal alarmId={selectedAlarmId} onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
}
