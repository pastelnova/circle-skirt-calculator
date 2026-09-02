interface RestoredNoticeProps {
  onStartOver: () => void
}

export function RestoredNotice({ onStartOver }: RestoredNoticeProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-notice-border bg-notice-soft p-3 text-[13px] text-notice">
      <span>Restored your last measurements.</span>
      <button
        type="button"
        onClick={onStartOver}
        className="cursor-pointer font-semibold whitespace-nowrap underline"
      >
        Start over
      </button>
    </div>
  )
}
