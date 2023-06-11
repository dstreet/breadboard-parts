export function useQuery(key: string) {
  const { search } = window.location
  const params = new URLSearchParams(search)

  return params.get(key)
}