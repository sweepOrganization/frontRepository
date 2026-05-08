import { useQuery } from "@tanstack/react-query";
import { getDetailRoute } from "../../api/GetDetailRoute";

type UseGetDetailRouteParams = {
  routeId?: number;
  type?: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  arrivalTime?: string;
};

export default function useGetDetailRoute({
  routeId,
  type,
  startX,
  startY,
  endX,
  endY,
  arrivalTime,
}: UseGetDetailRouteParams) {
  const startLat = startY;
  const startLon = startX;
  const endLat = endY;
  const endLon = endX;
  const normalizedType = String(type ?? "")
    .trim()
    .toLowerCase();
  const isPathTypeBus = normalizedType === "path_type_bus";

  return useQuery({
    queryKey: [
      "getDetailRoute",
      routeId,
      type,
      startLat,
      startLon,
      endLat,
      endLon,
      arrivalTime,
    ],
    queryFn: () =>
      getDetailRoute({
        routeId: routeId!,
        type: type!,
        startLat: startLat!,
        startLon: startLon!,
        endLat: endLat!,
        endLon: endLon!,
        arrivalTime: arrivalTime!,
      }),
    enabled:
      routeId !== undefined &&
      !!type &&
      startLat !== undefined &&
      startLon !== undefined &&
      endLat !== undefined &&
      endLon !== undefined &&
      !!arrivalTime,

    refetchInterval: isPathTypeBus ? 60_000 : false,
  });
}
