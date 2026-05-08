import { useMutation } from "@tanstack/react-query";
import { logout } from "../../api/Logout";
import type { UseMutationCallback } from "../../lib/types";
import { useNavigate } from "react-router-dom";

export default function useLogoutMutation(callbacks?: UseMutationCallback) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
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
