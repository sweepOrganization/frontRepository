export type MutationOnSuccess<TData, TVariables, TContext = unknown> = (
  data: TData,
  variables: TVariables,
  context: TContext | undefined,
) => void | Promise<void>;

export type MutationOnError<
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = (
  error: TError,
  variables: TVariables,
  context: TContext | undefined,
) => void | Promise<void>;

export type MutationOnMutate<TVariables, TContext = unknown> = (
  variables: TVariables,
) => TContext | void | Promise<TContext | void>;

export type MutationOnSettled<
  TData,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = (
  data: TData | undefined,
  error: TError | null,
  variables: TVariables,
  context: TContext | undefined,
) => void | Promise<void>;
