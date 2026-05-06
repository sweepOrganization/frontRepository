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
        routeId,
        type,
        startLat,
        startLon,
        endLat,
        endLon,
        arrivalTime,
      }),
  });
}
