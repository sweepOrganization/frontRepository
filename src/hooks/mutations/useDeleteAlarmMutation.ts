import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAlarm } from "../../api/DeleteAlarm";
import type { UseMutationCallback } from "../../lib/types";

export default function useCreateAlarmMutation(
  callbacks?: UseMutationCallback,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAlarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAlarmList"] });
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error as Error);
    },
    onSettled: () => {
      callbacks?.onSettled?.();
    },
    onMutate: () => {
      callbacks?.onMutate?.();
    },
  });
}
