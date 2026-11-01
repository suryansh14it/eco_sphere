import { Loader2 } from "lucide-react"

/**
 * Route-level loading state. Deliberately static: no timers, no overlay,
 * no fade-out — the page content simply replaces this as soon as it renders.
 */
export function RouteLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  )
}
