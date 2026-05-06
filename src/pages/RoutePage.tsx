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

type NormalizedRouteData = {
  mapObj?: string;
  segments: unknown[];
  [key: string]: unknown;
};

type RouteSegment = {
  trafficType?: number;
  sectionTime?: number;
  busNo?: string;
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

function normalizeRouteData(routeData?: string): NormalizedRouteData | null {
  if (!routeData) return null;

  try {
    const parsed = JSON.parse(routeData) as {
      mapObj?: string;
      segments?: unknown;
      [key: string]: unknown;
    };

    const rawSegments = parsed.segments;
    const segments =
      Array.isArray(rawSegments) && Array.isArray(rawSegments[1])
        ? rawSegments[1]
        : Array.isArray(rawSegments)
          ? rawSegments
          : [];

    return { ...parsed, segments };
  } catch (error) {
    console.error("routeData parse error", error);
    return null;
  }
}

function toSegments(value: unknown): RouteSegment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is RouteSegment => typeof v === "object" && v !== null,
  );
}

export default function RoutePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const routeContentRef = useRef<HTMLDivElement | null>(null);
  const [routeBarHeight, setRouteBarHeight] = useState(0);
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

  const displayArrivalTime = alarmDetail?.arrivalTime;
  const displayStartName = alarmDetail?.startName;
  const displayEndName = alarmDetail?.endName;
  const requestActualTime = alarmDetail?.actualTime;
  const requestRouteSegments = toSegments(alarmDetail?.routeSegments);

  const normalizedRouteData = normalizeRouteData(alarmDetail?.routeData);
  const mapObj =
    typeof normalizedRouteData?.mapObj === "string"
      ? normalizedRouteData.mapObj
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
    <div className="flex h-screen flex-col">
      <Header />
      <div ref={mapRef} className="h-[285px] w-full" />
      <div className="mx-4 mt-5 flex flex-1 flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div>
          <div className="flex flex-col gap-[14px]">
            <div className="rounded-[9px] border border-(--Lightgray) px-4 py-[11px]">
              <div className="flex w-full items-center">
                <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {formattedArrivalDate}
                </span>
                <span className="h-4 w-px bg-(--Lightgray)" />
                <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {formattedArrivalTime}
                </span>
              </div>
            </div>

            <div className="mb-5 rounded-[9px] border border-(--Lightgray) px-4 py-[11px]">
              <div className="flex w-full items-center">
                <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {displayStartName ? displayStartName : "출발지"}
                </span>
                <img
                  src="/bidirectionalarrow.svg"
                  alt="출발지 도착지 방향"
                  className="mx-2 h-4 w-4 shrink-0"
                />
                <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                  {displayEndName ? displayEndName : "도착지"}
                </span>
              </div>
            </div>
          </div>

          <div className="my-[32px] flex h-[80px] w-full flex-col rounded-[10px] border border-(--GreenNormal) px-5 py-[10px]">
            <span>선택 경로 안내</span>
            <div>
              <span>{requestActualTime}</span>
              <span>분 도착 예상</span>
            </div>
          </div>

          <div className="flex gap-[18px]">
            <div
              className="w-[16px] rounded-full bg-[#E5E7EB]"
              style={{ height: `${routeBarHeight}px` }}
            />
            <div ref={routeContentRef} className="w-full">
              <div className="flex items-center gap-2">
                <span className="text-[17px] leading-[17px] font-semibold text-[#323232]">
                  {displayStartName}
                </span>
                <span className="text-[17px] leading-[17px] text-(--GreenNormal)">
                  출발
                </span>
              </div>

              {requestRouteSegments.map((segment, index) => {
                if (segment.trafficType === 3) {
                  return (
                    <div key={`walk-${index}`}>
                      <div className="mt-2 text-[15px]">
                        도보{" "}
                        <span className="text-[19px] leading-[19px] font-semibold text-[#323232]">
                          {segment.sectionTime ?? 0}
                        </span>
                        분
                      </div>
                      <div className="my-[18px] h-px w-full bg-[#E5E7EB]" />
                    </div>
                  );
                }

                if (segment.trafficType === 2) {
                  return (
                    <div key={`bus-${index}`}>
                      <div className="mb-1 text-[15px] leading-[15px] font-semibold">
                        <span className="text-[19px] leading-[19px] font-semibold text-[#323232]">
                          {segment.sectionTime ?? 0}
                        </span>
                        분
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{segment.startStop}</span>
                        <span>승차</span>
                      </div>
                      <div className="my-2 w-full rounded-[10px] border border-[#e4e4e4] px-4 py-[10px]">
                        <span className="rounded-[6px] bg-(--GreenNormal) px-2 py-1 text-white">
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

              <div className="flex items-center gap-2">
                <span>{displayEndName}</span>
                <span className="text-(--GreenNormal)">도착</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
