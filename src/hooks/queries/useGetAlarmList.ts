import { useQuery } from "@tanstack/react-query";
import { getAlarmList } from "../../api/GetAlarmList";

export default function useGetAlarmList() {
  return useQuery({
    queryKey: ["getAlarmList"],
    queryFn: getAlarmList,
  });
}
