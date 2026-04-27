import { useQuery } from "@tanstack/react-query";
import { searchRoute } from "../../api/SearchRoute";

export default function useSearchRouteQuery() {
  return useQuery({
    queryKey: ["searchRoute"],
    queryFn: searchRoute,
  });
}
