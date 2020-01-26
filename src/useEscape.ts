import { useEffect, useCallback } from 'react'

export const useEscape = (callback: () => any) => {

  const detectEscape = useCallback(() => {
    callback()
  }, [callback])

  useEffect(() => {
    document.addEventListener("keydown", detectEscape, false)
    return () => {
      document.removeEventListener("keydown", detectEscape, false)
    }
  })
}
