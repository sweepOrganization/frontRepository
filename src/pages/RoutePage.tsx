import { useEffect, useRef, useState } from "react";
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
  busNo?: string;
  busType?: number;
  stationCount?: number;
  startStop?: string;
  endStop?: string;
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

export default function RoutePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const routeContentRef = useRef<HTMLDivElement | null>(null);
  const busSectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [routeBarHeight, setRouteBarHeight] = useState(0);
  const [busBarSections, setBusBarSections] = useState<
    Array<{ top: number; height: number; colorClass: string }>
  >([]);
  const { data: detailAlarmData, isLoading } = useGetDetailAlarm({
    alarmId: 43,
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
  void detailRouteData;

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

      segments.forEach((seg) => {
        const points = seg.points ?? [];
        new kakao.maps.Polyline({
          map,
          path: points.map((p) => new kakao.maps.LatLng(p.y, p.x)),
          strokeColor: seg.color || "#23d93e",
          strokeStyle: normalizeStrokeStyle(seg.strokeStyle),
          strokeWeight: 5,
        }).setMap(map);
      });
    })().catch((error) => {
      console.error(error);
    });

    return () => {
      cancelled = true;
    };
  }, [mapObj]);

  useEffect(() => {
    const element = routeContentRef.current;
    if (!element) return;

    const measure = () => {
      setRouteBarHeight(element.offsetHeight);
      const contentRect = element.getBoundingClientRect();
      const sections = requestRouteSegments
        .map((segment, index) => {
          if (segment.trafficType !== 2) return null;
          const sectionElement = busSectionRefs.current[index];
          if (!sectionElement) return null;
          const sectionRect = sectionElement.getBoundingClientRect();

          return {
            top: sectionRect.top - contentRect.top,
            height: sectionRect.height,
            colorClass: getBusColorClass(segment.busType),
          };
        })
        .filter(
          (
            section,
          ): section is { top: number; height: number; colorClass: string } =>
            section !== null,
        );
      setBusBarSections(sections);
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [requestRouteSegments, displayStartName, displayEndName]);

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
                  {requestActualTime}분
                </span>
                <span className="self-end text-[15px] leading-[15px] font-semibold text-(--Lightgray)">
                  후 도착 예상
                </span>
              </div>
            </div>

            <div className="flex gap-[18px]">
              <div
                className="relative w-5"
                style={{ height: `${routeBarHeight}px` }}
              >
                <div className="absolute inset-y-0 left-1/2 w-[16px] -translate-x-1/2 rounded-[4px] bg-[#E5E7EB]" />
                {busBarSections.map((section, index) => (
                  <div key={`bus-bar-${index}`}>
                    <div
                      className={`absolute left-1/2 w-[16px] -translate-x-1/2 rounded-[4px] ${section.colorClass}`}
                      style={{
                        top: `${section.top}px`,
                        height: `${section.height}px`,
                      }}
                    />
                    <div
                      className={`absolute left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-[6px] ${section.colorClass}`}
                      style={{ top: `${section.top - 12}px` }}
                    >
                      <img
                        src="/BusIcon.svg"
                        alt="bus"
                        className="h-4 w-4 shrink-0"
                      />
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

                {requestRouteSegments.map((segment, index) => {
                  if (segment.trafficType === 3) {
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

                  if (segment.trafficType === 2) {
                    return (
                      <div
                        key={`bus-${index}`}
                        ref={(element) => {
                          busSectionRefs.current[index] = element;
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
                        <div className="my-2 flex w-full flex-col rounded-[10px] border border-[#e4e4e4] px-4 py-[10px]">
                          <span
                            className={`h-[22px] w-[41px] rounded-[5px] px-1 py-[3px] text-center text-[13px] leading-[13px] font-semibold text-white ${getBusColorClass(segment.busType)}`}
                          >
                            {segment.busNo}
                          </span>
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
