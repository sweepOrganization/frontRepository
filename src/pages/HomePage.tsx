import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../components/HomePage/DeleteModal";
import Duck from "../components/HomePage/Duck";
import useLogoutMutation from "../hooks/mutations/useLogoutMutation";
import useGetAlarmList from "../hooks/queries/useGetAlarmList";
import useGetDetailRoute from "../hooks/queries/useGetDetailRoute";
import useAlarmEntryPermission from "../hooks/useAlarmEntryPermission";

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

type RouteSegment = {
  trafficType: number;
  lineName?: string;
  busType?: number;
  busNo?: string;
  busName?: string;
  routeName?: string;
  startStop?: string;
};

type ArrivingBus = {
  arrivalMessage?: string;
  arrivalTimeSeconds?: number;
};

type SegmentBoardingInfo = {
  trafficType: number;
  availableTrains?: Array<{ departureTime?: string }>;
  arrivingBuses?: ArrivingBus[];
};
export default function HomePage() {
  const navigate = useNavigate();
  const { mutate: logout } = useLogoutMutation();

  const handleLogout = () => {
    logout();
  };

  const [mainAlarm, setMainAlarm] = useState<Alarm | null>(null);
  const [alarmList, setAlarmList] = useState<Alarm[]>([]);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlarmId, setSelectedAlarmId] = useState<number | null>(null);
  const [selectedBusIndex, setSelectedBusIndex] = useState(0);
  const { isCheckingPermission, prepareAlarmEntry } = useAlarmEntryPermission();
  const {
    data: alarmData,
    isLoading: isAlarmLoading,
    isSuccess: isAlarmSuccess,
    isFetching: isAlarmFetching,
  } = useGetAlarmList();

  function handleOpenModal(alarmId: number) {
    setSelectedAlarmId(alarmId);
    setIsOpen(true);
  }

  function handleCloseModal() {
    setIsOpen(false);
    setSelectedAlarmId(null);
  }

  const handleCreateAlarm = async () => {
    const result = await prepareAlarmEntry();
    if (!result.ok) {
      alert(result.message);
      return;
    }
    navigate("/notification-setting-1");
  };

  useEffect(() => {
    if (isAlarmLoading || isAlarmFetching || !isAlarmSuccess) {
      return;
    }

    const now = new Date();
    const detailAlarm = alarmData?.data?.alarmDetailResponse;
    const summaryAlarms = Array.isArray(
      alarmData?.data?.alarmSummaryResponseList,
    )
      ? alarmData.data.alarmSummaryResponseList
      : [];

    const sourceAlarms = [
      ...(detailAlarm ? [detailAlarm] : []),
      ...summaryAlarms,
    ];
    if (sourceAlarms.length === 0) {
      navigate("/start");
      return;
    }

    const alarms = sourceAlarms
      .filter((alarm: Alarm) => new Date(alarm.arrivalTime) > now)
      .sort(
        (a: Alarm, b: Alarm) =>
          new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime(),
      );

    if (alarms.length > 0) {
      setMainAlarm(alarms[0]);
      setAlarmList(alarms.slice(1));
      return;
    }

    const allSortedAlarms = [...sourceAlarms].sort(
      (a: Alarm, b: Alarm) =>
        new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime(),
    );
    setMainAlarm(allSortedAlarms[0]);
    setAlarmList(allSortedAlarms.slice(1));
  }, [alarmData, navigate, isAlarmLoading, isAlarmFetching, isAlarmSuccess]);

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

  const formatRemainTime = (seconds: number | null) => {
    if (seconds === null) return "-";

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${min}분 ${sec}초`;
  };

  const formatBusRemain = (bus?: ArrivingBus) => {
    if (!bus) return "운행정보 없음";

    const message = bus.arrivalMessage ?? "";

    if (
      message.includes("곧 도착") ||
      message.includes("운행 종료") ||
      message.includes("운행종료")
    ) {
      return message;
    }

    if (typeof bus.arrivalTimeSeconds === "number") {
      const elapsedSeconds =
        dataUpdatedAt > 0
          ? Math.floor((currentTime.getTime() - dataUpdatedAt) / 1000)
          : 0;
      const liveSeconds = Math.max(0, bus.arrivalTimeSeconds - elapsedSeconds);

      if (liveSeconds <= 0) {
        return "운행정보 없음";
      }

      return formatRemainTime(liveSeconds);
    }

    return message || "운행정보 없음";
  };

  const getBusExtraMessage = (bus?: ArrivingBus) => {
    if (!bus) return "";
    if (formatBusRemain(bus) === "운행정보 없음") return "";

    return bus.arrivalMessage?.includes("[")
      ? (bus.arrivalMessage.split("[")[1]?.replace("]", "") ?? "")
      : "";
  };

  const isBusRateLimited = (bus?: ArrivingBus) => {
    const message = bus?.arrivalMessage ?? "";
    return (
      message.includes("Key인증실패") ||
      message.includes("LIMITED NUMBER OF SERVICE REQUESTS EXCEEDS")
    );
  };

  const getSubwayRemainText = (time?: string) => {
    if (!time) return "-";

    const now = currentTime;
    const [hour, minute, second = "0"] = time.split(":");

    const target = new Date(now);
    target.setHours(Number(hour), Number(minute), Number(second), 0);

    const diffSeconds = Math.ceil((target.getTime() - now.getTime()) / 1000);
    if (diffSeconds <= 0) return "지나감";

    const min = Math.floor(diffSeconds / 60);
    const sec = diffSeconds % 60;

    return `${min}분 ${sec}초`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => new Date(prev.getTime() + 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  let parsedRouteData = null;

  try {
    parsedRouteData = mainAlarm?.routeData
      ? JSON.parse(mainAlarm.routeData)
      : null;
  } catch (error) {
    console.error("routeData 파싱 실패", error);
  }

  const routeSegments = parsedRouteData?.segments?.flat() || [];

  const subwaySegment = routeSegments.find(
    (segment: RouteSegment) => segment.trafficType === 1,
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
    (segment: RouteSegment) => segment.trafficType === 2,
  );
  const busSegments = routeSegments.filter(
    (segment: RouteSegment) => segment.trafficType === 2,
  );

  const { data: detailRouteData, dataUpdatedAt } = useGetDetailRoute({
    routeId: mainAlarm?.routeId,
    type: mainAlarm?.routeType,
    startX: mainAlarm?.startX,
    startY: mainAlarm?.startY,
    endX: mainAlarm?.endX,
    endY: mainAlarm?.endY,
    arrivalTime: mainAlarm?.arrivalTime,
  });

  const busBoardingInfos =
    detailRouteData?.data?.[0]?.segmentBoardingInfos?.filter(
      (info: SegmentBoardingInfo) => info.trafficType === 2,
    ) ?? ([] as SegmentBoardingInfo[]);

  const detailSubwayInfo =
    detailRouteData?.data?.[0]?.segmentBoardingInfos?.find(
      (info: SegmentBoardingInfo) => info.trafficType === 1,
    );

  const firstSubwayDepartureTime =
    detailSubwayInfo?.availableTrains?.[0]?.departureTime;

  const getBusColorClass = (busType?: number) => {
    const busColorClassMap: Record<number, string> = {
      1: "bg-(--bus-green)",
      2: "bg-(--bus-blue)",
      3: "bg-(--bus-green)",
      4: "bg-(--bus-red)",
      5: "bg-(--bus-sky)",
      11: "bg-(--bus-blue)",
      12: "bg-(--bus-green)",
      14: "bg-(--bus-red)",
    };

    if (typeof busType === "number" && busColorClassMap[busType]) {
      return busColorClassMap[busType];
    }

    return "bg-(--bus-gray)";
  };

  const busColorClass = getBusColorClass(busSegment?.busType);
  const selectedBusInfoCount = Math.min(
    busSegments.length,
    busBoardingInfos.length,
  );
  const safeSelectedBusIndex =
    selectedBusInfoCount > 0
      ? Math.min(selectedBusIndex, selectedBusInfoCount - 1)
      : 0;
  const selectedBusSegment = busSegments[safeSelectedBusIndex];
  const selectedBoardingInfo = busBoardingInfos[safeSelectedBusIndex];
  const firstBus = selectedBoardingInfo?.arrivingBuses?.[0];
  const secondBus = selectedBoardingInfo?.arrivingBuses?.[1];
  const hasBusRateLimitError =
    isBusRateLimited(firstBus) || isBusRateLimited(secondBus);

  useEffect(() => {
    setSelectedBusIndex(0);
  }, [mainAlarm?.alarmId]);

  if (!mainAlarm) return null;

  const now = currentTime.getTime();

  const prepareStartTime = new Date(mainAlarm.startTime).getTime();
  const departureAlarmTime =
    prepareStartTime + (mainAlarm.prepareTime ?? 0) * 60 * 1000;

  const isPrepareStarted = now >= prepareStartTime;
  const isBeforePrepareStart = now < prepareStartTime;
  const isBeforeDepartureAlarm = now < departureAlarmTime;
  const isDeparturePhase = !isBeforeDepartureAlarm;

  const isBluePhase = !isBeforePrepareStart && isBeforeDepartureAlarm;

  const leftLabel = isDeparturePhase ? "출발" : "준비 시작";

  const leftTime = isDeparturePhase
    ? getDepartureTime(mainAlarm.startTime, mainAlarm.prepareTime)
    : formatTime(mainAlarm.startTime);

  const rightLabel = isDeparturePhase ? "도착 예정" : "출발 알람";

  const rightTime = isDeparturePhase
    ? getExpectedArrivalTime(
        mainAlarm.startTime,
        mainAlarm.prepareTime,
        mainAlarm.actualTime,
      )
    : getDepartureTime(mainAlarm.startTime, mainAlarm.prepareTime);

  const progressBaseSeconds = Math.min(mainAlarm.prepareTime ?? 60, 60) * 60;

  const progressEndTime = prepareStartTime + progressBaseSeconds * 1000;

  const displayMinutes = Math.max(
    0,
    Math.ceil((progressEndTime - now) / 60000),
  );

  const elapsedSeconds = Math.max(
    0,
    Math.min(progressBaseSeconds, Math.floor((now - prepareStartTime) / 1000)),
  );

  const rawProgress = Math.min(
    100,
    (elapsedSeconds / progressBaseSeconds) * 100,
  );

  const progressPercent = `${Math.max(0, rawProgress)}%`;
  const duration = mainAlarm.actualTime;
  const displayDuration = isDeparturePhase ? duration : mainAlarm.prepareTime;

  const realtimeInfoStartTime = departureAlarmTime - 60 * 60 * 1000;
  const isRealtimeSectionVisible = now >= realtimeInfoStartTime;
  return (
    <div className="relative min-h-screen bg-[#FBFBFB] px-4 pt-[53px] pb-[100px]">
      <section className="overflow-hidden rounded-[10px] bg-gradient-to-r from-[#50C864] to-[#80DF7C] px-[10px] pt-[10px] pb-[12px]">
        <h1 className="text-[21px] leading-[150%] font-semibold text-white">
          {rawProgress >= 100
            ? "출발하셨나요?"
            : !isPrepareStarted
              ? "일정을 확인해보세요"
              : displayMinutes <= 30
                ? `출발까지 ${displayMinutes}분 남았어요`
                : `${displayMinutes}분 후에 출발해야해요`}
        </h1>

        <div className="relative mt-[8px] h-[39px] w-full">
          <div
            className="linear absolute top-0 left-0 transition-all duration-1000 ease-out"
            style={{
              left: `clamp(-5px, calc(${progressPercent} - 19px), calc(100% - 34px))`,
            }}
          >
            <div className="flex h-[39px] w-[39px] items-center justify-center transition-transform duration-700 ease-out">
              <Duck
                image={
                  (mainAlarm.prepareTime ?? 0) >= 60
                    ? !isPrepareStarted
                      ? "/duck-01.svg"
                      : displayMinutes <= 30
                        ? "/duck-03.svg"
                        : "/duck-02.svg"
                    : !isPrepareStarted
                      ? "/duck-01.svg"
                      : rawProgress >= 70
                        ? "/duck-03.svg"
                        : "/duck-02.svg"
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-[4px] h-[8px] w-full rounded-full bg-white/40">
          <div className="mt-[4px] h-[8px] w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: progressPercent }}
            />
          </div>
        </div>
      </section>

      <section className="mt-[20px] rounded-[10px] border border-[#e4e4e4] bg-white">
        <div className="px-[20px] pt-[21px] pb-[21px]">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium text-[var(--Darkgray)]">
              {formatDate(mainAlarm.arrivalTime)}
            </p>
            <button
              type="button"
              onClick={() => handleOpenModal(mainAlarm.alarmId)}
              className="flex h-[24px] w-[24px] items-center justify-center"
            >
              <div className="relative h-[16px] w-[16px]">
                <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 rotate-45 rounded-full bg-[#999]" />
                <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-[#999]" />
              </div>
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
          {isDeparturePhase && (
            <p className="mt-[6px] text-[11px] leading-[130%] text-[var(--Gray)]">
              실시간 교통정보에 따라 최대 20분 정도 늦어질 수 있습니다.
            </p>
          )}

          <div className="mt-[38px] flex items-end justify-between">
            <div className="flex w-[95px] flex-col items-start">
              <div className="flex items-center gap-[12px]">
                {(isDeparturePhase || isBluePhase) && (
                  <div
                    className={`h-[8px] w-[8px] animate-[pulse_2s_ease-in-out_infinite] rounded-full transition-all duration-1000 ${
                      isDeparturePhase
                        ? "bg-[#FF7A00] shadow-[0_0_0_4px_rgba(255,122,0,0.18)]"
                        : isBluePhase
                          ? "bg-[#1E7BDB] shadow-[0_0_0_4px_rgba(30,123,219,0.18)]"
                          : "bg-[#222]"
                    }`}
                  />
                )}

                <p
                  className={`text-[19px] font-semibold ${
                    isDeparturePhase
                      ? "text-[#FF7A00]"
                      : isBluePhase
                        ? "text-[#1E7BDB]"
                        : "text-[#222]"
                  }`}
                >
                  {leftLabel}
                </p>
              </div>

              <span className="text-[38px] font-semibold text-[#222]">
                {leftTime}
              </span>
            </div>

            <div className="mt-[20px] flex items-center gap-[10px] self-center">
              <span className="h-[1px] w-[32px] bg-[#ddd]" />

              <div className="flex flex-col items-center">
                <span className="text-[12px] text-[#777]">
                  {displayDuration !== undefined && displayDuration !== null
                    ? displayDuration >= 60
                      ? `${Math.floor(displayDuration / 60)}시간 ${displayDuration % 60}분`
                      : `${displayDuration}분`
                    : ""}
                </span>

                <span className="text-[12px] text-[#777]">소요</span>
              </div>

              <div className="relative flex h-[12px] w-[32px] items-center">
                <span className="absolute top-1/2 left-0 h-[1px] w-full -translate-y-1/2 bg-[#ddd]" />
                <span className="absolute top-[2px] right-0 h-[1px] w-[8px] rotate-45 bg-[#ddd]" />
                <span className="absolute right-0 bottom-[2px] h-[1px] w-[8px] -rotate-45 bg-[#ddd]" />
              </div>
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

        <div className="rounded-b-[10px] border-t border-[#e4e4e4] bg-[#F9F9F9] px-[20px] pt-[22px] pb-[16px]">
          <div className="flex items-start">
            {isRealtimeSectionVisible ? (
              mainAlarm.routeType === "PATH_TYPE_BUS" ? (
                <div className="flex flex-1 flex-col gap-[16px]">
                  {busSegments.length > 1 && (
                    <div className="flex flex-wrap gap-[8px]">
                      {busSegments.map(
                        (segment: RouteSegment, index: number) => (
                          <button
                            key={`bus-tab-${index}`}
                            type="button"
                            onClick={() => setSelectedBusIndex(index)}
                            className={`rounded-[6px] px-[8px] py-[4px] text-[13px] font-semibold ${
                              safeSelectedBusIndex === index
                                ? `${getBusColorClass(segment.busType)} text-white`
                                : "bg-[#f1f1f1] text-[#666]"
                            }`}
                          >
                            {segment.busNo ??
                              segment.busName ??
                              segment.routeName ??
                              "버스"}
                          </button>
                        ),
                      )}
                    </div>
                  )}

                  {busSegments.length === 1 && (
                    <div className="flex">
                      <span
                        className={`rounded-[6px] px-[8px] py-[4px] text-[13px] font-semibold text-white ${getBusColorClass(
                          busSegments[0]?.busType,
                        )}`}
                      >
                        {busSegments[0]?.busNo ??
                          busSegments[0]?.busName ??
                          busSegments[0]?.routeName ??
                          "버스"}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[17px] leading-[17px] font-semibold text-[var(--Neutral)]">
                        {selectedBusSegment?.startStop ?? "승차 위치"}
                      </span>
                    </div>

                    {hasBusRateLimitError ? (
                      <div className="mt-[14px] text-center">
                        <p className="text-[14px] font-medium whitespace-pre-line text-[var(--Gray)]">
                          {
                            "실시간 조회가 일시 제한되었어요.\n잠시 후 다시 시도해주세요."
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="mt-[8px] flex items-center">
                        <div className="flex-1 text-center">
                          <p
                            className={`mt-[10px] text-[15px] font-semibold ${
                              displayMinutes <= 30
                                ? "text-[#F60707]"
                                : "text-[var(--Neutral)]"
                            }`}
                          >
                            {formatBusRemain(firstBus).split("[")[0]}
                          </p>

                          <p
                            className={`mt-[4px] text-[13px] font-normal ${
                              displayMinutes <= 30
                                ? "text-[#8F0303]"
                                : "text-[var(--Gray)]"
                            }`}
                          >
                            {getBusExtraMessage(firstBus)}
                          </p>
                        </div>

                        <div className="h-[26px] w-[1px] bg-[#e4e4e4]" />

                        <div className="flex-1 text-center">
                          <p className="mt-[10px] text-[15px] font-semibold text-[var(--Neutral)]">
                            {formatBusRemain(secondBus).split("[")[0]}
                          </p>

                          <p className="mt-[4px] text-[13px] font-normal text-[var(--Gray)]">
                            {getBusExtraMessage(secondBus)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-[8px]">
                      <span
                        className="flex h-[22px] items-center justify-center rounded-[5px] px-[7px] py-[13px] text-[13px] leading-[13px] font-semibold text-white"
                        style={{
                          backgroundColor: subwayLineColor,
                        }}
                      >
                        {subwayLineName}
                      </span>

                      <span className="text-[17px] leading-[17px] font-semibold text-[var(--Neutral)]">
                        {subwaySegment?.startStation}역
                      </span>
                    </div>
                  </div>

                  <div className="mt-[10px] text-center">
                    <p className="text-[17px] leading-[17px] font-semibold text-[#F60707]">
                      {getSubwayRemainText(firstSubwayDepartureTime)}
                    </p>

                    <p className="mt-[10px] text-[13px] leading-[13px] text-[#8F0303]">
                      남았습니다
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

                <div className="flex items-center gap-[16px]">
                  {mainAlarm.routeType === "PATH_TYPE_BUS" && (
                    <span
                      className={`rounded-[5px] px-[6px] py-[3px] text-[13px] font-semibold text-white ${busColorClass}`}
                    >
                      {busSegment?.busName ??
                        busSegment?.routeName ??
                        busSegment?.busNo ??
                        "버스"}
                    </span>
                  )}

                  <p className="text-[15px] leading-[160%] font-normal text-[var(--Darkgray)]">
                    출발 1시간 전,
                    <br />
                    실시간 교통 정보가 표시됩니다
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              navigate(`/route/${mainAlarm.alarmId}`);
            }}
            className="mt-[22px] h-[48px] w-full rounded-[10px] border border-[var(--GreenNormal)] bg-white text-[17px] !font-semibold text-[var(--Green)]"
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
          className="mt-[12px] rounded-[10px] border border-[#e4e4e4] bg-white px-[20px] py-[20px]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium text-[var(--Darkgray)]">
              {formatDate(alarm.arrivalTime)}
            </p>
            <button
              type="button"
              onClick={() => handleOpenModal(alarm.alarmId)}
              className="flex h-[24px] w-[24px] items-center justify-center"
            >
              <div className="relative h-[16px] w-[16px]">
                <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 rotate-45 rounded-full bg-[#999]" />
                <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-[#999]" />
              </div>
            </button>
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
        onClick={handleLogout}
        className="mt-[24px] w-full text-center text-[14px] text-[#999]"
      >
        로그아웃
      </button>

      <button
        type="button"
        onClick={handleCreateAlarm}
        disabled={isCheckingPermission}
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
