type StatusStyle = {
  badge: string;
  dot: string;
};

const STATUS_STYLES: Record<string, StatusStyle> = {
  DRAFT: {
    badge: "border border-border bg-surface text-ink-muted",
    dot: "bg-ink-muted",
  },
  PUBLISHED: {
    badge: "bg-accent-soft text-accent",
    dot: "bg-accent",
  },
  ARCHIVED: {
    badge: "border border-border bg-surface text-ink-muted",
    dot: "bg-ink-muted",
  },
  REPORTED: {
    badge: "bg-warning-bg text-warning-ink",
    dot: "bg-warning-ink",
  },
  REMOVED: {
    badge: "bg-danger-soft text-danger",
    dot: "bg-danger",
  },
  SUBMITTED_TO_MLA: {
    badge: "bg-success-soft text-success",
    dot: "bg-success",
  },
  INTRODUCED_AS_PRIVATE_BILL: {
    badge: "bg-success-soft text-success",
    dot: "bg-success",
  },
  REJECTED: {
    badge: "bg-danger-soft text-danger",
    dot: "bg-danger",
  },
  PASSED: {
    badge: "bg-success-soft text-success",
    dot: "bg-success",
  },
  OPEN: {
    badge: "bg-accent-soft text-accent",
    dot: "bg-accent",
  },
  ACCEPTED: {
    badge: "bg-success-soft text-success",
    dot: "bg-success",
  },
};

const DEFAULT_STYLE: StatusStyle = {
  badge: "bg-accent-soft text-accent",
  dot: "bg-accent",
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const style = STATUS_STYLES[status] ?? DEFAULT_STYLE;
  const label = status.replaceAll("_", " ").toLowerCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${style.badge} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full ${style.dot}`}
      />
      {label}
    </span>
  );
}