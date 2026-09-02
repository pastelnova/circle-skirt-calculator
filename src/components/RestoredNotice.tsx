interface RestoredNoticeProps {
  onStartOver: () => void
}

export function RestoredNotice({ onStartOver }: RestoredNoticeProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-notice-border bg-notice-soft p-3 text-[13px] text-notice">
      <span>Restored your last measurements.</span>
      <button
        type="button"
        onClick={onStartOver}
        className="cursor-pointer font-semibold whitespace-nowrap underline pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:items-center"
      >
        Start over
      </button>
    </div>
  )
}
