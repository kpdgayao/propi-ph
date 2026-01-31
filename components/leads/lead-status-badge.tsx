import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  NEW: {
    label: "New",
    className: "bg-blue-100 text-blue-800",
  },
  CONTACTED: {
    label: "Contacted",
    className: "bg-yellow-100 text-yellow-800",
  },
  VIEWING_SCHEDULED: {
    label: "Viewing Scheduled",
    className: "bg-purple-100 text-purple-800",
  },
  NEGOTIATING: {
    label: "Negotiating",
    className: "bg-orange-100 text-orange-800",
  },
  CONVERTED: {
    label: "Converted",
    className: "bg-green-100 text-green-800",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-gray-100 text-gray-800",
  },
};

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
