"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === "undefined") return

    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Create event listener
    const listener = () => setMatches(media.matches)

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
      return () => media.removeListener(listener)
    }
  }, [query])

  return matches
}

