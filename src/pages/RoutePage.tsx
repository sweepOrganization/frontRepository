import { useEffect, useRef } from "react";
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
  segments: unknown[];
  [key: string]: unknown;
};

type RoutePageProps = {
  alarmId?: number;
  routeId?: number | string;
  routeType?: string;
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
  }) => {
    setMap: (map: KakaoMapInstance) => void;
  };
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

    return {
      ...parsed,
      segments,
    };
  } catch (error) {
    console.error("routeData parse error", error);
    return null;
  }
}

export default function RoutePage({
  alarmId,
  routeId,
  routeType,
}: RoutePageProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const fallbackRouteData =
    '{"@type": "bus", "mapObj": "1054:1:57:66@1055:1:57:69", "payment": 1600, "routeId": 354, "segments": ["java.util.ArrayList", [{"@type": "walk", "distance": 170, "sectionTime": 3, "trafficType": 3}, {"@type": "bus", "busNo": "420", "busType": 11, "endStop": "신사역.푸른저축은행", "distance": 8244, "startStop": "동대문역.흥인지문", "busRouteId": 1054, "localBusId": "100100068", "sectionTime": 25, "startStopId": 80606, "trafficType": 2, "stationCount": 9, "startStopOrder": 0, "busProviderCode": 4, "localBusStationId": "100000365", "stationProviderCode": 4}, {"@type": "walk", "distance": 134, "sectionTime": 2, "trafficType": 3}, {"@type": "bus", "busNo": "4212", "busType": 12, "endStop": "사당역", "distance": 6626, "startStop": "신사역4번출구", "busRouteId": 1055, "localBusId": "100100234", "sectionTime": 24, "startStopId": 105855, "trafficType": 2, "stationCount": 12, "startStopOrder": 0, "busProviderCode": 4, "localBusStationId": "121000109", "stationProviderCode": 4}, {"@type": "walk", "distance": 182, "sectionTime": 3, "trafficType": 3}]], "totalTime": 57, "totalWalk": 486, "transferCount": 1, "routePreviewId": null, "busTransitCount": 2}';

  const { data: detailAlarmData } = useGetDetailAlarm({ alarmId });
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

  const routeDetail = detailRouteData?.data;
  const displayArrivalTime =
    routeDetail?.arrivalTime ?? alarmDetail?.arrivalTime;
  const displayStartName = alarmDetail?.startName;
  const displayEndName = alarmDetail?.endName;
  const normalizedRouteData = normalizeRouteData(
    alarmDetail?.routeData ?? fallbackRouteData,
  );
  const mapObj =
    typeof normalizedRouteData?.mapObj === "string"
      ? normalizedRouteData.mapObj
      : null;
  console.log("normalizedRouteData:", normalizedRouteData);

  const parsedArrival = displayArrivalTime
    ? new Date(displayArrivalTime)
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
  void routeId;
  void routeType;

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

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div ref={mapRef} className="h-[285px] w-full" />
      <div className="mx-4 mt-5 flex flex-1 flex-col overflow-y-auto">
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
          <div className="my-[32px] h-[103px] w-full rounded-[10px] border border-(--GreenNormal)"></div>
          <div></div>
        </div>
      </div>
    </div>
  );
}
