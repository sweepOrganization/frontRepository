import { useQuery } from "@tanstack/react-query";
import { getDetailAlarm } from "../../api/GetDetailAlarm";

export default function useGetDetailAlarm({
  alarmId,
}: {
  alarmId?: number;
}) {
  return useQuery({
    queryKey: ["getDetailAlarm", alarmId],
    queryFn: () => getDetailAlarm({ alarmId: alarmId as number }),
    enabled: typeof alarmId === "number" && Number.isFinite(alarmId),
    retry: false,
  });
}
