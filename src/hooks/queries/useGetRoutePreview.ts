import { useQuery } from "@tanstack/react-query";
import { getRoutePreview } from "../../api/GetRoutePreview";

export default function useGetRoutePreview({ mapObj }: { mapObj?: string }) {
  return useQuery({
    queryKey: ["getRoutePreview", mapObj],
    queryFn: () => getRoutePreview({ mapObj: mapObj! }),
    enabled: !!mapObj,
  });
}
