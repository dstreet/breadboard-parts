import { useEffect, useState } from "react"
import Config from './config'

export function useFetchPart(partNumber: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [part, setPart] = useState<Record<any, string>>()

  useEffect(() => {
    const fetchPart = async () => {
      setLoading(true)

      try {
        const res = await fetch(`${Config.api.endpoint}/part/${partNumber}`)

        if (res.status >= 400) {
          setError(new Error(res.statusText))
          return
        }

        const data = await res.json()
        setPart(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchPart()
  }, [partNumber, setLoading, setError, setPart])

  return {
    loading,
    error,
    part
  }
}