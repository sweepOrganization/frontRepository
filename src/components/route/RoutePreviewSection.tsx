import { useEffect, useRef } from "react";
import useGetRoutePreview from "../../hooks/queries/useGetRoutePreview";

function isSameCoordinate(a: number, b: number, epsilon = 0.000001) {
  return Math.abs(a - b) <= epsilon;
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

type RoutePreviewSectionProps = {
  mapObj?: string | null;
  requestStartX?: number;
  requestStartY?: number;
  requestEndX?: number;
  requestEndY?: number;
};

export default function RoutePreviewSection({
  mapObj,
  requestStartX,
  requestStartY,
  requestEndX,
  requestEndY,
}: RoutePreviewSectionProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const { data: routePreviewData } = useGetRoutePreview({
    mapObj: mapObj ?? undefined,
  });

  useEffect(() => {
    if (!mapRef.current || !mapObj || !routePreviewData) return;

    let cancelled = false;

    (async () => {
      await loadKakaoSdk();
      if (cancelled || !mapRef.current) return;

      const kakao = window.kakao;
      if (!kakao) return;

      const { bounds, segments } = routePreviewData;
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
          strokeWeight: 7,
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
          strokeWeight: 7,
        }).setMap(map);
      }

      segments.forEach((seg) => {
        const points = seg.points ?? [];
        new kakao.maps.Polyline({
          map,
          path: points.map((p) => new kakao.maps.LatLng(p.y, p.x)),
          strokeColor: seg.color || "#3b82f6",
          strokeStyle: seg.strokeStyle ?? "solid",
          strokeWeight: 7,
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
          strokeWeight: 7,
        }).setMap(map);
      }
    })().catch((error) => {
      console.error(error);
    });

    return () => {
      cancelled = true;
    };
  }, [
    mapObj,
    routePreviewData,
    requestStartX,
    requestStartY,
    requestEndX,
    requestEndY,
  ]);

  return <div ref={mapRef} className="h-[285px] w-full" />;
}
