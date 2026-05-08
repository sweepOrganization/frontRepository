import { useQuery } from "@tanstack/react-query";
import { searchRoute } from "../../api/SearchRoute";
import type { PathType } from "../../api/SearchRoute";
import {
  useAlarmArrivalTime,
  useAlarmStartLat,
  useAlarmStartLon,
  useAlarmEndLat,
  useAlarmEndLon,
} from "../../stores/useAlarmStore";

export default function useSearchRouteQuery(pathType: PathType) {
  const arrivalTime = useAlarmArrivalTime();
  const startLat = useAlarmStartLat();
  const startLon = useAlarmStartLon();
  const endLat = useAlarmEndLat();
  const endLon = useAlarmEndLon();

  return useQuery({
    queryKey: [
      "searchRoute",
      pathType,
      arrivalTime,
      startLat,
      startLon,
      endLat,
      endLon,
    ],
    queryFn: () => searchRoute(pathType),
    enabled:
      !!arrivalTime &&
      startLat !== null &&
      startLon !== null &&
      endLat !== null &&
      endLon !== null,
  });
}