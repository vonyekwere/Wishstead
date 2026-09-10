import Spinner from '@/components/ui/Spinner'

export default function Loading() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-3 text-[#4A1620]">
        <Spinner className="h-8 w-8" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  )
}
