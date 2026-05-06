import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import useGetDetailAlarm from "../hooks/queries/useGetDetailAlarm";
import useGetDetailRoute from "../hooks/queries/useGetDetailRoute";

type PreviewPoint = { x: number; y: number };
type PreviewBounds = {
  sw: PreviewPoint;
  ne: PreviewPoint;
};
type PreviewSegment = {
  points: PreviewPoint[];
  color: string;
  strokeStyle: "solid" | "shortdash" | "shortdot" | "shortdashdot";
};
type PreviewResponse = {
  bounds: PreviewBounds;
  segments: PreviewSegment[];
};

type RouteSegment = {
  trafficType?: number;
  sectionTime?: number;
  distance?: number;
  busNo?: string;
  busType?: number;
  stationCount?: number;
  startStop?: string;
  endStop?: string;
  lineName?: string;
  subwayCode?: number;
  startStation?: string;
  endStation?: string;
};
type DisplayRouteSegment = RouteSegment & {
  sourceIndices: number[];
};
type AvailableTrain = {
  wayName?: string;
  departureTime?: string;
};
type ArrivingBus = {
  arrivalMessage?: string;
};
type SegmentBoardingInfo = {
  trafficType?: number;
  transportId?: string;
  availableTrains?: AvailableTrain[];
  arrivingBuses?: ArrivingBus[];
};
type DetailRoutePayload = {
  segmentBoardingInfos?: SegmentBoardingInfo[];
};
type DetailRouteResponse = {
  data?: DetailRoutePayload[];
};
type TransitBarSection = {
  top: number;
  height: number;
  colorClass: string;
  backgroundColor?: string;
  trafficType: 1 | 2;
};

type KakaoLatLng = { __brand: "KakaoLatLng" };
type KakaoLatLngBounds = { __brand: "KakaoLatLngBounds" };
type KakaoMapInstance = {
  __brand: "KakaoMapInstance";
  setBounds: (bounds: KakaoLatLngBounds) => void;
};

type KakaoMapsApi = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new (sw: KakaoLatLng, ne: KakaoLatLng) => KakaoLatLngBounds;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMapInstance;
  Polyline: new (options: {
    map: KakaoMapInstance;
    path: KakaoLatLng[];
    strokeColor: string;
    strokeStyle: "solid" | "shortdash" | "shortdot" | "shortdashdot";
    strokeWeight: number;
  }) => { setMap: (map: KakaoMapInstance) => void };
};

type KakaoApi = {
  maps: KakaoMapsApi;
};

function normalizeStrokeStyle(
  strokeStyle?: string,
): "solid" | "shortdash" | "shortdot" | "shortdashdot" {
  if (
    strokeStyle === "solid" ||
    strokeStyle === "shortdash" ||
    strokeStyle === "shortdot" ||
    strokeStyle === "shortdashdot"
  ) {
    return strokeStyle;
  }
  return "solid";
}

function isSameCoordinate(a: number, b: number, epsilon = 0.000001) {
  return Math.abs(a - b) <= epsilon;
}

declare global {
  interface Window {
    kakao?: KakaoApi;
  }
}

function loadKakaoSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("kakao-map-sdk");
    if (existing && window.kakao?.maps) {
      resolve();
      return;
    }

    const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
    if (!appKey) {
      reject(new Error("VITE_KAKAO_MAP_APP_KEY is missing."));
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao Maps SDK failed to initialize."));
        return;
      }
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => reject(new Error("Failed to load Kakao Maps SDK."));
    document.head.appendChild(script);
  });
}

function toSegments(value: unknown): RouteSegment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is RouteSegment => typeof v === "object" && v !== null,
  );
}

function toDisplayRouteSegments(
  segments: RouteSegment[],
): DisplayRouteSegment[] {
  const result: DisplayRouteSegment[] = [];

  segments.forEach((segment, index) => {
    const last = result[result.length - 1];
    const canMergeBus =
      segment.trafficType === 2 &&
      last?.trafficType === 2 &&
      segment.startStop &&
      segment.endStop &&
      last.startStop === segment.startStop &&
      last.endStop === segment.endStop;

    if (!canMergeBus) {
      result.push({ ...segment, sourceIndices: [index] });
      return;
    }

    const mergedBusNos = [last.busNo, segment.busNo]
      .filter((value): value is string => Boolean(value))
      .flatMap((value) => value.split("/").map((part) => part.trim()))
      .filter((value, i, arr) => value.length > 0 && arr.indexOf(value) === i)
      .join(" / ");

    last.busNo = mergedBusNos || last.busNo;
    last.sourceIndices.push(index);
  });

  return result;
}

function splitBusNos(busNo?: string) {
  if (!busNo) return [];
  return busNo
    .split("/")
    .map((value) => value.trim())
    .filter(
      (value, index, arr) => value.length > 0 && arr.indexOf(value) === index,
    );
}

function getBusColorClass(busType?: number) {
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
}

function getBusTextColorStyle(busType?: number) {
  const busTextColorMap: Record<number, string> = {
    1: "var(--bus-green)",
    2: "var(--bus-blue)",
    3: "var(--bus-green)",
    4: "var(--bus-red)",
    5: "var(--bus-sky)",
    11: "var(--bus-blue)",
    12: "var(--bus-green)",
    14: "var(--bus-red)",
  };

  return {
    color:
      typeof busType === "number" && busTextColorMap[busType]
        ? busTextColorMap[busType]
        : "var(--bus-gray)",
  } as const;
}

function getSubwayTextColorStyle(subwayCode?: number) {
  const subwayTextColorMap: Record<number, string> = {
    1: "#0052A4",
    2: "#00A84D",
    3: "#EF7C1C",
    4: "#00A5DE",
    5: "#996CAC",
    6: "#CD7C2F",
    7: "#747F00",
    8: "#E6186C",
    9: "#BDB092",
    117: "#6789CA",
  };

  return {
    color:
      typeof subwayCode === "number" && subwayTextColorMap[subwayCode]
        ? subwayTextColorMap[subwayCode]
        : "#4B5563",
  } as const;
}

function getSubwayColor(subwayCode?: number) {
  const subwayColorMap: Record<number, string> = {
    1: "#0052A4",
    2: "#00A84D",
    3: "#EF7C1C",
    4: "#00A5DE",
    5: "#996CAC",
    6: "#CD7C2F",
    7: "#747F00",
    8: "#E6186C",
    9: "#BDB092",
    117: "#6789CA",
  };

  if (typeof subwayCode === "number" && subwayColorMap[subwayCode]) {
    return subwayColorMap[subwayCode];
  }

  return "#4B5563";
}

function formatSubwayLineName(lineName?: string) {
  if (!lineName) return "지하철";
  return lineName.startsWith("수도권 ")
    ? lineName.replace(/^수도권\s+/, "")
    : lineName;
}

function toSegmentBoardingInfos(value: unknown): SegmentBoardingInfo[] {
  const response = value as DetailRouteResponse | undefined;
  if (!response?.data?.length) return [];
  const infos = response.data[0]?.segmentBoardingInfos;
  return Array.isArray(infos) ? infos : [];
}

function formatWayName(wayName?: string) {
  const trimmed = wayName?.trim();
  if (!trimmed) return "";
  if (trimmed === "외선순환") return "외선순환행";
  return `${trimmed}역 방면`;
}

function getRemainingCountdownText(departureTime?: string, nowDate?: Date) {
  if (!departureTime || !nowDate) return "";
  const parts = departureTime.split(":").map(Number);
  if (parts.length < 2 || parts.some(Number.isNaN)) return "";

  const [hours, minutes, seconds = 0] = parts;
  const departure = new Date(nowDate);
  departure.setHours(hours, minutes, seconds, 0);

  const diffSeconds = Math.floor(
    (departure.getTime() - nowDate.getTime()) / 1000,
  );
  if (diffSeconds < 0) return "지나감";

  const remainMinutes = Math.floor(diffSeconds / 60);
  const remainSeconds = diffSeconds % 60;
  return `${remainMinutes}분 ${remainSeconds}초`;
}

function formatDepartureHourMinute(departureTime?: string) {
  if (!departureTime) return "";
  const parts = departureTime.split(":");
  if (parts.length < 2) return departureTime;
  const [hour, minute] = parts;
  return `${hour}:${minute}`;
}

function formatActualTime(actualTime?: number) {
  if (typeof actualTime !== "number" || Number.isNaN(actualTime)) return "0분";
  if (actualTime < 60) return `${actualTime}분`;

  const hours = Math.floor(actualTime / 60);
  const minutes = actualTime % 60;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

function splitArrivalMessage(message: string) {
  const marker = "후";
  const markerIndex = message.indexOf(marker);
  if (markerIndex < 0) {
    return { firstLine: message, secondLine: "" };
  }

  const firstLine = message.slice(0, markerIndex + marker.length).trim();
  const secondLine = message.slice(markerIndex + marker.length).trim();
  return { firstLine, secondLine };
}

export default function RoutePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const routeContentRef = useRef<HTMLDivElement | null>(null);
  const transitSectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [routeBarHeight, setRouteBarHeight] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [transitBarSections, setTransitBarSections] = useState<
    TransitBarSection[]
  >([]);
  const { data: detailAlarmData, isLoading } = useGetDetailAlarm({
    alarmId: 48,
  });
  const alarmDetail = detailAlarmData?.data;
  const requestRouteId = alarmDetail?.routeId;
  const requestType = alarmDetail?.routeType;
  const requestStartX = alarmDetail?.startX;
  const requestStartY = alarmDetail?.startY;
  const requestEndX = alarmDetail?.endX;
  const requestEndY = alarmDetail?.endY;
  const requestArrivalTime = alarmDetail?.arrivalTime;

  const displayStartName = alarmDetail?.startName;
  const displayEndName = alarmDetail?.endName;
  const requestActualTime = alarmDetail?.actualTime;
  const requestRouteSegments = toSegments(alarmDetail?.routeSegments);
  const displayRouteSegments = useMemo(
    () => toDisplayRouteSegments(requestRouteSegments),
    [requestRouteSegments],
  );
  const mapObj =
    typeof alarmDetail?.routeMapObj === "string"
      ? alarmDetail.routeMapObj
      : null;

  const parsedArrival = requestArrivalTime
    ? new Date(requestArrivalTime)
    : null;
  const hasValidArrival =
    parsedArrival instanceof Date && !Number.isNaN(parsedArrival.getTime());
  const formattedArrivalDate = hasValidArrival
    ? parsedArrival.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      })
    : "";
  const formattedArrivalTime = hasValidArrival
    ? parsedArrival.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

  const { data: detailRouteData } = useGetDetailRoute({
    routeId: requestRouteId,
    type: requestType,
    startX: requestStartX,
    startY: requestStartY,
    endX: requestEndX,
    endY: requestEndY,
    arrivalTime: requestArrivalTime,
  });
  const segmentWayNameByIndex = useMemo(() => {
    const infos = toSegmentBoardingInfos(detailRouteData);
    const mapped: Record<number, string> = {};
    let infoCursor = 0;

    requestRouteSegments.forEach((segment, segmentIndex) => {
      if (segment.trafficType !== 1 && segment.trafficType !== 2) return;

      while (
        infoCursor < infos.length &&
        infos[infoCursor]?.trafficType !== segment.trafficType
      ) {
        infoCursor += 1;
      }

      const info = infos[infoCursor];
      if (!info) return;

      const wayName = formatWayName(info.availableTrains?.[0]?.wayName);
      if (wayName) {
        mapped[segmentIndex] = wayName;
      }

      infoCursor += 1;
    });

    return mapped;
  }, [detailRouteData, requestRouteSegments]);
  const busArrivalMessagesByBusNo = useMemo(() => {
    const infos = toSegmentBoardingInfos(detailRouteData);
    const mapped: Record<string, string[]> = {};

    infos.forEach((info) => {
      if (info.trafficType !== 2) return;
      const busNo = info.transportId?.trim();
      if (!busNo) return;
      const messages =
        info.arrivingBuses
          ?.map((bus) => bus.arrivalMessage?.trim() ?? "")
          .filter((message) => message.length > 0) ?? [];
      if (messages.length === 0) return;
      mapped[busNo] = messages;
    });

    return mapped;
  }, [detailRouteData]);
  const segmentDepartureTimeByIndex = useMemo(() => {
    const infos = toSegmentBoardingInfos(detailRouteData);
    const mapped: Record<number, string> = {};
    let infoCursor = 0;

    requestRouteSegments.forEach((segment, segmentIndex) => {
      if (segment.trafficType !== 1 && segment.trafficType !== 2) return;

      while (
        infoCursor < infos.length &&
        infos[infoCursor]?.trafficType !== segment.trafficType
      ) {
        infoCursor += 1;
      }

      const info = infos[infoCursor];
      if (!info) return;

      const departureTime = info.availableTrains?.[0]?.departureTime?.trim();
      if (departureTime) {
        mapped[segmentIndex] = departureTime;
      }

      infoCursor += 1;
    });

    return mapped;
  }, [detailRouteData, requestRouteSegments]);
  const getMappedValueFromSources = (
    sourceIndices: number[],
    map: Record<number, string>,
  ) => {
    for (const sourceIndex of sourceIndices) {
      const value = map[sourceIndex];
      if (value) return value;
    }
    return "";
  };

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapObj) return;

    let cancelled = false;

    (async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("accessToken is missing.");
      }

      await loadKakaoSdk();
      if (cancelled || !mapRef.current) return;

      const kakao = window.kakao;
      if (!kakao) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/route/preview/${encodeURIComponent(mapObj)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!res.ok) {
        throw new Error(`Route preview failed: ${res.status}`);
      }

      const { bounds, segments } = (await res.json()) as PreviewResponse;
      if (cancelled) return;

      const centerX = (bounds.sw.x + bounds.ne.x) / 2;
      const centerY = (bounds.sw.y + bounds.ne.y) / 2;
      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(centerY, centerX),
        level: 6,
      });

      map.setBounds(
        new kakao.maps.LatLngBounds(
          new kakao.maps.LatLng(bounds.sw.y, bounds.sw.x),
          new kakao.maps.LatLng(bounds.ne.y, bounds.ne.x),
        ),
      );

      const firstSegmentPoint = segments.find(
        (seg) => (seg.points?.length ?? 0) > 0,
      )?.points[0];
      const lastSegmentPoint = segments
        .slice()
        .reverse()
        .find((seg) => (seg.points?.length ?? 0) > 0)
        ?.points.at(-1);
      const hasRequestStart =
        typeof requestStartX === "number" && typeof requestStartY === "number";
      const hasRequestEnd =
        typeof requestEndX === "number" && typeof requestEndY === "number";
      const shouldDrawStartConnector =
        hasRequestStart &&
        firstSegmentPoint &&
        (!isSameCoordinate(requestStartX, firstSegmentPoint.x) ||
          !isSameCoordinate(requestStartY, firstSegmentPoint.y));
      const shouldDrawEndConnector =
        hasRequestEnd &&
        lastSegmentPoint &&
        (!isSameCoordinate(requestEndX, lastSegmentPoint.x) ||
          !isSameCoordinate(requestEndY, lastSegmentPoint.y));

      if (shouldDrawStartConnector) {
        new kakao.maps.Polyline({
          map,
          path: [
            new kakao.maps.LatLng(requestStartY, requestStartX),
            new kakao.maps.LatLng(firstSegmentPoint.y, firstSegmentPoint.x),
          ],
          strokeColor: "#767676",
          strokeStyle: "solid",
          strokeWeight: 5,
        }).setMap(map);
      }

      if (shouldDrawEndConnector) {
        new kakao.maps.Polyline({
          map,
          path: [
            new kakao.maps.LatLng(lastSegmentPoint.y, lastSegmentPoint.x),
            new kakao.maps.LatLng(requestEndY, requestEndX),
          ],
          strokeColor: "#767676",
          strokeStyle: "solid",
          strokeWeight: 5,
        }).setMap(map);
      }

      segments.forEach((seg) => {
        const points = seg.points ?? [];
        new kakao.maps.Polyline({
          map,
          path: points.map((p) => new kakao.maps.LatLng(p.y, p.x)),
          strokeColor: seg.color || "#3b82f6",
          strokeStyle: normalizeStrokeStyle(seg.strokeStyle),
          strokeWeight: 5,
        }).setMap(map);
      });

      for (let i = 0; i < segments.length - 1; i += 1) {
        const currentPoints = segments[i]?.points ?? [];
        const nextPoints = segments[i + 1]?.points ?? [];
        if (currentPoints.length === 0 || nextPoints.length === 0) continue;

        const currentLast = currentPoints[currentPoints.length - 1];
        const nextFirst = nextPoints[0];
        const shouldDrawInterSegmentConnector =
          !isSameCoordinate(currentLast.x, nextFirst.x) ||
          !isSameCoordinate(currentLast.y, nextFirst.y);

        if (!shouldDrawInterSegmentConnector) continue;

        new kakao.maps.Polyline({
          map,
          path: [
            new kakao.maps.LatLng(currentLast.y, currentLast.x),
            new kakao.maps.LatLng(nextFirst.y, nextFirst.x),
          ],
          strokeColor: "#767676",
          strokeStyle: "solid",
          strokeWeight: 5,
        }).setMap(map);
      }
    })().catch((error) => {
      console.error(error);
    });

    return () => {
      cancelled = true;
    };
  }, [mapObj, requestStartX, requestStartY, requestEndX, requestEndY]);

  useEffect(() => {
    const element = routeContentRef.current;
    if (!element) return;

    const measure = () => {
      setRouteBarHeight(element.offsetHeight);
      const contentRect = element.getBoundingClientRect();
      const sections = displayRouteSegments
        .map((segment, index): TransitBarSection | null => {
          if (segment.trafficType !== 1 && segment.trafficType !== 2)
            return null;
          const sectionElement = transitSectionRefs.current[index];
          if (!sectionElement) return null;
          const sectionRect = sectionElement.getBoundingClientRect();

          if (segment.trafficType === 2) {
            return {
              top: sectionRect.top - contentRect.top,
              height: sectionRect.height,
              colorClass: getBusColorClass(segment.busType),
              trafficType: 2,
            };
          }

          return {
            top: sectionRect.top - contentRect.top,
            height: sectionRect.height,
            colorClass: "",
            backgroundColor: getSubwayColor(segment.subwayCode),
            trafficType: 1,
          };
        })
        .filter((section): section is TransitBarSection => section !== null);
      setTransitBarSections(sections);
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [displayRouteSegments, displayStartName, displayEndName]);

  if (isLoading) return <div>불러오는 중...</div>;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div ref={mapRef} className="h-[285px] w-full" />
      <div className="mt-5 flex min-h-0 flex-1 flex-col px-4">
        <div className="shrink-0">
          <div className="flex flex-col gap-[14px] text-(--Gray)">
            <div className="h-12 rounded-[9px] border border-[#e4e4e4] px-4 py-[11px]">
              <div className="flex w-full items-center">
                <span className="flex h-[26px] flex-1 items-center justify-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {formattedArrivalDate}
                </span>
                <span className="h-4 w-px bg-[#a3b7a6]" />
                <span className="flex h-[26px] flex-1 items-center justify-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {formattedArrivalTime}
                </span>
              </div>
            </div>

            <div className="mb-5 h-12 rounded-[9px] border border-[#e4e4e4] px-4 py-[11px]">
              <div className="flex w-full items-center">
                <span className="flex h-[26px] flex-1 items-center justify-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {displayStartName ? displayStartName : "출발지"}
                </span>
                <img
                  src="/bidirectionalarrow.svg"
                  alt="출발지 도착지 방향"
                  className="mx-2 h-[7px] w-[23.65px] shrink-0"
                />
                <span className="flex h-[26px] flex-1 items-center justify-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {displayEndName ? displayEndName : "도착지"}
                </span>
              </div>
            </div>
          </div>

          <div className="-mx-4 mb-4 h-px w-screen bg-[#e4e4e4]" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div>
            <div className="my-[32px] flex h-[80px] w-full flex-col rounded-[10px] border border-(--GreenNormal) px-5 py-[10px]">
              <div className="flex h-[26px] items-center text-[17px] leading-[17px] font-semibold text-[#323232]">
                선택 경로 안내
              </div>
              <div className="flex h-[34px] items-end gap-1">
                <span className="text-[21px] leading-[21px] font-semibold text-(--Green)">
                  {formatActualTime(requestActualTime)}
                </span>
                <span className="self-end text-[15px] leading-[15px] font-semibold text-(--Lightgray)">
                  소요 예상
                </span>
              </div>
            </div>

            <div className="flex gap-[18px]">
              <div
                className="relative w-5"
                style={{ height: `${routeBarHeight}px` }}
              >
                <div className="absolute inset-y-0 left-1/2 w-[16px] -translate-x-1/2 rounded-[4px] bg-[#E5E7EB]" />
                {transitBarSections.map((section, index) => (
                  <div key={`bus-bar-${index}`}>
                    <div
                      className={`absolute left-1/2 w-[16px] -translate-x-1/2 rounded-[4px] ${section.colorClass}`}
                      style={{
                        top: `${section.top}px`,
                        height: `${section.height + 5}px`,
                        backgroundColor: section.backgroundColor,
                      }}
                    />
                    <div
                      className={`absolute left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-[6px] ${section.colorClass}`}
                      style={{
                        top: `${section.top - 15}px`,
                        backgroundColor: section.backgroundColor,
                      }}
                    >
                      {section.trafficType === 2 ? (
                        <img
                          src="/BusIcon.svg"
                          alt="bus"
                          className="h-4 w-4 shrink-0"
                        />
                      ) : (
                        <img
                          src="/SubwayIcon.svg"
                          alt="subway"
                          className="h-4 w-4 shrink-0"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div ref={routeContentRef} className="mb-18 w-full">
                <div className="flex h-[26px] items-center gap-2">
                  <span className="text-[17px] leading-[17px] font-semibold text-[#323232]">
                    {displayStartName}
                  </span>
                  <span className="text-[17px] leading-[17px] font-semibold text-[#009362]">
                    출발
                  </span>
                </div>

                {displayRouteSegments.map((segment, index) => {
                  // 도보
                  if (segment.trafficType === 3) {
                    if ((segment.sectionTime ?? 0) <= 0) {
                      return null;
                    }
                    return (
                      <div key={`walk-${index}`}>
                        <div className="mt-2 h-[30px] text-[15px] leading-[15px] font-semibold">
                          도보{" "}
                          <span className="text-[19px] leading-[19px] font-semibold text-[#323232]">
                            {segment.sectionTime ?? 0}
                          </span>
                          분
                        </div>
                        <div className="my-[10px] h-px w-full bg-[#E5E7EB]" />
                      </div>
                    );
                  }

                  // 버스
                  if (segment.trafficType === 2) {
                    return (
                      <div
                        key={`bus-${index}`}
                        ref={(element) => {
                          transitSectionRefs.current[index] = element;
                        }}
                      >
                        <div className="mb-1 flex h-[30px] items-center text-[15px] leading-[15px] font-semibold">
                          <span className="text-[19px] leading-[19px] text-[#323232]">
                            {segment.sectionTime ?? 0}
                          </span>
                          분
                        </div>
                        <div className="flex h-[26px] items-center gap-2 text-[17px] leading-[17px] font-semibold">
                          <span style={getBusTextColorStyle(segment.busType)}>
                            {segment.startStop}
                          </span>
                          <span>승차</span>
                        </div>
                        {getMappedValueFromSources(
                          segment.sourceIndices,
                          segmentWayNameByIndex,
                        ) ? (
                          <div className="mt-1 text-[12px] leading-[12px] font-medium text-[#6B7280]">
                            {getMappedValueFromSources(
                              segment.sourceIndices,
                              segmentWayNameByIndex,
                            )}
                          </div>
                        ) : null}
                        <div className="my-2 flex w-full flex-col rounded-[10px] border border-[#e4e4e4] px-4 py-[10px]">
                          <div className="flex flex-col gap-2">
                            {splitBusNos(segment.busNo).map((busNo) => (
                              <div
                                key={`${index}-${busNo}`}
                                className="grid grid-cols-[41px_1fr] items-center gap-2"
                              >
                                <span
                                  className={`inline-flex h-[22px] w-[41px] items-center justify-center rounded-[5px] px-2 py-[3px] text-center text-[13px] leading-[13px] font-semibold text-white ${getBusColorClass(segment.busType)}`}
                                >
                                  {busNo}
                                </span>
                                <div className="flex w-full flex-row items-center justify-between px-5">
                                  {(busArrivalMessagesByBusNo[busNo] ?? []).map(
                                    (message, messageIndex) => {
                                      const { firstLine, secondLine } =
                                        splitArrivalMessage(message);

                                      return (
                                        <span
                                          key={`${busNo}-arrive-${messageIndex}`}
                                          className="min-w-[88px] text-[15px] leading-[15px] text-[#EF4444]"
                                        >
                                          <span className="block">
                                            {firstLine}
                                          </span>
                                          {secondLine ? (
                                            <span className="mt-1 block text-[12px] leading-[12px]">
                                              {secondLine}
                                            </span>
                                          ) : null}
                                        </span>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-[12px] leading-[12px] text-(--Lightgray)">
                          {segment.stationCount ?? 0}개 정류장 이동
                        </div>
                        <div className="my-[18px] h-px w-full bg-[#E5E7EB]" />
                        <div className="text-[17px] leading-[17px] font-semibold">
                          {segment.endStop} 하차
                        </div>
                        <div className="my-[18px] h-px w-full bg-[#E5E7EB]" />
                      </div>
                    );
                  }

                  // 지하철
                  if (segment.trafficType === 1) {
                    return (
                      <div
                        key={`subway-${index}`}
                        ref={(element) => {
                          transitSectionRefs.current[index] = element;
                        }}
                      >
                        <div className="mb-1 flex h-[30px] items-center text-[15px] leading-[15px] font-semibold">
                          <span className="text-[19px] leading-[19px] text-[#323232]">
                            {segment.sectionTime ?? 0}
                          </span>
                          분
                        </div>
                        <div className="flex h-[26px] items-center gap-2 text-[17px] leading-[17px] font-semibold">
                          <div
                            style={{
                              backgroundColor: getSubwayColor(
                                segment.subwayCode,
                              ),
                            }}
                            className="flex h-[22px] items-center justify-center rounded-[5px] px-[5px] py-[3px] text-[13px] leading-[13px] font-semibold text-white"
                          >
                            {formatSubwayLineName(segment.lineName)}
                          </div>
                          <span
                            style={getSubwayTextColorStyle(segment.subwayCode)}
                          >
                            {segment.startStation}역
                          </span>
                          <span>승차</span>
                        </div>
                        {getMappedValueFromSources(
                          segment.sourceIndices,
                          segmentWayNameByIndex,
                        ) ? (
                          <div className="mt-1 text-[12px] leading-[12px] font-medium text-[#6B7280]">
                            {getMappedValueFromSources(
                              segment.sourceIndices,
                              segmentWayNameByIndex,
                            )}
                          </div>
                        ) : null}
                        <div className="my-2 flex w-full flex-col rounded-[10px] border border-[#e4e4e4] px-4 py-[10px]">
                          {getMappedValueFromSources(
                            segment.sourceIndices,
                            segmentDepartureTimeByIndex,
                          ) ? (
                            <span className="text-[15px] leading-[15px] font-bold text-[#323232]">
                              {formatDepartureHourMinute(
                                getMappedValueFromSources(
                                  segment.sourceIndices,
                                  segmentDepartureTimeByIndex,
                                ),
                              )}{" "}
                              <span className="text-[#EF4444]">
                                {getRemainingCountdownText(
                                  getMappedValueFromSources(
                                    segment.sourceIndices,
                                    segmentDepartureTimeByIndex,
                                  ),
                                  now,
                                )}
                              </span>
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[12px] leading-[12px] text-(--Lightgray)">
                          {segment.stationCount ?? 0}개 역 이동
                        </div>
                        <div className="my-[18px] h-px w-full bg-[#E5E7EB]" />
                        <div className="text-[17px] leading-[17px] font-semibold">
                          {segment.endStation}역 하차
                        </div>
                        <div className="my-[18px] h-px w-full bg-[#E5E7EB]" />
                      </div>
                    );
                  }

                  return null;
                })}

                <div className="flex items-center gap-2 text-[17px] leading-[17px] font-semibold">
                  <span>{displayEndName}</span>
                  <span className="text-[#009362]">도착</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
