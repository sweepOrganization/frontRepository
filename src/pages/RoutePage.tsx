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

function getStrokeColorByTrafficType(trafficType?: number | string): string {
  const type = Number(trafficType);
  if (type === 0) return "#23d93e"; // unknown (current backend response)
  if (type === 1) return "#23d93e"; // subway
  if (type === 2) return "#2f80ed"; // bus
  if (type === 3) return "#8e8e93"; // walk
  return "#23d93e";
}

function getStrokeWeightByTrafficType(trafficType?: number | string): number {
  return Number(trafficType) === 3 ? 3 : 5;
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

export default function RoutePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    const mapObj = "116:2:1510:1513@7:2:730:747";

    (async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("accessToken이 없습니다. 먼저 로그인해주세요.");
      }

      await loadKakaoSdk();
      if (cancelled || !mapRef.current) return;

      const kakao = window.kakao;

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

      const stats = {
        subway: 0,
        bus: 0,
        walk: 0,
        unknown: 0,
      };

      segments.forEach((seg) => {
        const type = Number(seg.trafficType);
        if (type === 1) stats.subway += 1;
        else if (type === 2) stats.bus += 1;
        else if (type === 3) stats.walk += 1;
        else stats.unknown += 1;
      });

      const orderedSegments = [
        ...segments.filter((seg) => Number(seg.trafficType) !== 3),
        ...segments.filter((seg) => Number(seg.trafficType) === 3),
      ];

      orderedSegments.forEach((seg) => {
        const points = seg.points ?? [];

        new kakao.maps.Polyline({
          map,
          path: points.map((p) => new kakao.maps.LatLng(p.y, p.x)),
          strokeColor: getStrokeColorByTrafficType(seg.trafficType),
          strokeStyle: seg.strokeStyle,
          strokeWeight: getStrokeWeightByTrafficType(seg.trafficType),
        }).setMap(map);
      });
    })().catch((error) => {
      console.error(error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <Header />
      <div ref={mapRef} className="h-[285px] w-full" />
    </div>
  );
}
