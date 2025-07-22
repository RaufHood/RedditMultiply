"use client"

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Fallback UI shown while the Communities page is loading.
 * This satisfies the Suspense boundary requirement for useSearchParams().
 */
export default function CommunitiesLoading() {
  return (
    <div className="p-6 space-y-4">
      {/* Page title placeholder */}
      <Skeleton className="h-8 w-40 md:w-52" />

      {/* Card placeholders */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
