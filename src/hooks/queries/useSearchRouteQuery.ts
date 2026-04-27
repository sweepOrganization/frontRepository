import { useQuery } from "@tanstack/react-query";
import { searchRoute } from "../../api/SearchRoute";
import type { PathType } from "../../api/SearchRoute";

export default function useSearchRouteQuery(pathType: PathType) {
  return useQuery({
    queryKey: ["searchRoute", pathType],
    queryFn: () => searchRoute(pathType),
  });
}
