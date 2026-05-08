import { useMutation } from "@tanstack/react-query";
import { logout } from "../../api/Logout";
import type { UseMutationCallback } from "../../lib/types";

export default function useLogoutMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: logout,
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
