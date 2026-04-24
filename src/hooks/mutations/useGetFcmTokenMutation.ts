import type { MutateOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { requestPermissionAndGetToken } from "../../lib/fcm";

export default function useGetFcmTokenMutation() {
  const mutation = useMutation<string | null, Error, void>({
    mutationFn: () => requestPermissionAndGetToken(),
  });

  const getFcmToken = (
    options?: MutateOptions<string | null, Error, void, unknown>,
  ) => {
    mutation.mutate(undefined, options);
  };

  return { ...mutation, getFcmToken };
}
