export type UseMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  onMutate?: () => void;
};
