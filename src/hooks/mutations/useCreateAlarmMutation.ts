import { useMutation } from "@tanstack/react-query";
import { createAlarm } from "../../api/CreateAlarm";
import type { UseMutationCallback } from "../../lib/types";

export default function useCreateAlarmMutation(
  callbacks?: UseMutationCallback,
) {
  return useMutation({
    mutationFn: createAlarm,
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
