import { useQuery } from "@tanstack/react-query";
import { getDetailAlarm } from "../../api/GetDetailAlarm";

export default function useGetDetailAlarm({ alarmId }: { alarmId?: number }) {
  return useQuery({
    queryKey: ["getDetailAlarm", alarmId],
    queryFn: () => getDetailAlarm({ alarmId: alarmId! }),
    enabled: alarmId !== undefined,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
