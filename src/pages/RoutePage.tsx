import { useEffect, useRef } from "react";
import Header from "../components/Header";

type PreviewPoint = { x: number; y: number };
type PreviewBounds = {
  sw: PreviewPoint;
  ne: PreviewPoint;
};
type PreviewSegment = {
  points: PreviewPoint[];
  color: string;
  strokeStyle: "solid" | "shortdash" | "shortdot" | "shortdashdot";
  trafficType?: number | string;
};
type PreviewResponse = {
  bounds: PreviewBounds;
  segments: PreviewSegment[];
};

type RoutePagePoint = {
  x: number;
  y: number;
};

type RoutePageProps = {
  arrivalTime?: string;
  routePreviewId?: string;
  routeId?: number | string;
  routeType?: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  totalTime?: number;
  startPlace?: string | RoutePagePoint;
  endPlace?: string | RoutePagePoint;
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

export default function RoutePage({
  arrivalTime,
  routePreviewId,
  routeId,
  routeType,
  startX,
  startY,
  endX,
  endY,
  totalTime,
  startPlace,
  endPlace,
}: RoutePageProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    const previewId = String(
      routePreviewId ?? "c8907657-f330-45f2-a3c9-30f8c840381c",
    );

    (async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("accessToken이 없습니다. 먼저 로그인해주세요.");
      }

      await loadKakaoSdk();
      if (cancelled || !mapRef.current) return;

      const kakao = window.kakao;

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/route/preview/by-route/${previewId}`,
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
    void arrivalTime;
    void routeType;
    void startX;
    void startY;
    void endX;
    void endY;
    void totalTime;
    void startPlace;
    void endPlace;
  }, [
    routePreviewId,
    routeId,
    arrivalTime,
    routeType,
    startX,
    startY,
    endX,
    endY,
    totalTime,
    startPlace,
    endPlace,
  ]);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div ref={mapRef} className="h-[285px] w-full" />
      <div className="mx-4 mt-[14px] flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-col gap-[14px]">
          <div className="rounded-[9px] border border-(--Lightgray) px-4 py-[11px]">
            <div className="flex w-full items-center">
              <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                {arrivalTime}
              </span>
              <span className="h-4 w-px bg-(--Lightgray)" />
              <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                {totalTime}
              </span>
            </div>
          </div>

          <div className="rounded-[9px] border border-(--Lightgray) px-4 py-[11px]">
            <div className="flex w-full items-center">
              <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                {startPlace ? startPlace.toString() : "출발지"}
              </span>
              <img
                src="/bidirectionalarrow.svg"
                alt="출발지 도착지 방향"
                className="mx-2 h-4 w-4 shrink-0"
              />
              <span className="flex-1 text-center text-[17px] leading-[17px] text-(--DarkGray)">
                {endPlace ? endPlace.toString() : "도착지"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
