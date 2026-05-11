import { useQuery } from "@tanstack/react-query";
import { getRoutePreview } from "../../api/GetRoutePreview";

export default function useGetRoutePreview({ mapObj }: { mapObj?: string }) {
  return useQuery({
    queryKey: ["getRoutePreview", mapObj],
    queryFn: () => getRoutePreview({ mapObj: mapObj! }),
    enabled: !!mapObj,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
