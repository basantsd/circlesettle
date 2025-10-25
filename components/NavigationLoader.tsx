'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function NavigationLoaderContent() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Reset loading state when navigation completes
    setLoading(false)
    setProgress(100)

    const timer = setTimeout(() => {
      setProgress(0)
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link && link.href && !link.target) {
        try {
          const url = new URL(link.href)
          if (
            url.origin === window.location.origin &&
            url.pathname !== pathname &&
            !link.href.includes('#')
          ) {
            setLoading(true)
            setProgress(0)
          }
        } catch {
          // Invalid URL, ignore
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname])

  useEffect(() => {
    if (!loading) return

    // Simulate progress
    const intervals = [
      setTimeout(() => setProgress(20), 100),
      setTimeout(() => setProgress(40), 300),
      setTimeout(() => setProgress(60), 600),
      setTimeout(() => setProgress(80), 1000),
    ]

    return () => {
      intervals.forEach(clearTimeout)
    }
  }, [loading])

  if (!loading && progress === 0) return null

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 z-50 shadow-lg transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40 pointer-events-none transition-opacity duration-200" />
      )}
    </>
  )
}

export function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderContent />
    </Suspense>
  )
}
