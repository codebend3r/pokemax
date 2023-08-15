import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  QueryKey,
  QueryFunction,
  MutationFunction,
} from 'react-query';

export function useRequestProcessor() {
  const queryClient = useQueryClient();

  function query<T>(
    key: QueryKey,
    queryFunction: QueryFunction<T, QueryKey>,
    options: UseQueryOptions = {}
  ) {
    return useQuery({
      queryKey: key,
      queryFn: queryFunction,
      ...options,
    });
  }

  function mutate(
    key: QueryKey,
    mutationFunction: MutationFunction,
    options = {}
  ) {
    return useMutation({
      mutationKey: key,
      mutationFn: mutationFunction,
      onSettled: () => queryClient.invalidateQueries(key),
      ...options,
    });
  }

  return { query, mutate };
}
