import { useMutation } from "@tanstack/react-query";
import { deleteAlarm } from "../../api/DeleteAlarm";
import type { UseMutationCallback } from "../../lib/types";

export default function useCreateAlarmMutation(
  callbacks?: UseMutationCallback,
) {
  return useMutation({
    mutationFn: deleteAlarm,
    onSuccess: () => {
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
