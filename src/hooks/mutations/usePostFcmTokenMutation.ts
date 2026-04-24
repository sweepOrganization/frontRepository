import { useMutation } from "@tanstack/react-query";
import { postFcmToken } from "../../api/fcm";
import type { UseMutationCallback } from "../../lib/types";

export default function usePostFcmTokenMutation(
  callbacks?: UseMutationCallback,
) {
  return useMutation({
    mutationFn: postFcmToken,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
    onSettled: () => {
      callbacks?.onSettled?.();
    },
    onMutate: () => {
      callbacks?.onMutate?.();
    },
  });
}
