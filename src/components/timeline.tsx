import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp?: string | Date
  icon: LucideIcon
  status?: "completed" | "current" | "pending"
  color?: "default" | "success" | "warning" | "danger" | "info"
  metadata?: {
    label: string
    value: string
  }[]
}

interface TimelineProps {
  items: TimelineItem[]
  direction?: "vertical" | "horizontal"
}

const statusColors = {
  completed: "bg-green-100 text-green-700 border-green-300",
  current: "bg-blue-100 text-blue-700 border-blue-300",
  pending: "bg-gray-100 text-gray-700 border-gray-300",
}

const colorClasses = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
}

export function Timeline({ items, direction = "vertical" }: TimelineProps) {
  return (
    <div
      className={cn(
        "space-y-0",
        direction === "horizontal" && "flex gap-4 overflow-x-auto pb-4"
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        const statusColor = statusColors[item.status || "pending"]
        const color = colorClasses[item.color || "default"]
        const isLast = index === items.length - 1

        return (
          <div
            key={item.id}
            className={cn(
              "relative",
              direction === "vertical" ? "pb-8" : "flex-shrink-0 w-64"
            )}
          >
            {/* Connector line */}
            {direction === "vertical" && !isLast && (
              <div className="absolute left-[19px] top-12 h-8 w-0.5 bg-gray-200" />
            )}

            {/* Main content */}
            <div className="flex gap-4">
              {/* Icon circle */}
              <div className={cn("relative z-10 flex-shrink-0")}>
                <div
                  className={cn(
                    "h-10 w-10 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    statusColor
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {/* Content */}
              <div className={cn("flex-1 pt-1 min-w-0")}>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {item.title}
                </h4>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </p>
                )}

                {item.timestamp && (
                  <p className="text-xs text-gray-500 mb-2">
                    {typeof item.timestamp === "string"
                      ? item.timestamp
                      : item.timestamp.toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </p>
                )}

                {item.metadata && item.metadata.length > 0 && (
                  <div
                    className={cn(
                      "grid gap-2 mt-2 p-2 rounded",
                      color,
                      "bg-opacity-20"
                    )}
                  >
                    {item.metadata.map((meta) => (
                      <div key={meta.label} className="text-xs">
                        <span className="font-medium">{meta.label}:</span>{" "}
                        <span>{meta.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Variantes predefinidas

interface ProposalTimelineEvent {
  id: string
  event: "sent" | "accepted" | "rejected" | "negotiations" | "completed"
  date: Date
  notes?: string
}

export function ProposalTimeline({
  events,
}: {
  events: ProposalTimelineEvent[]
}) {
  const eventConfig = {
    sent: {
      title: "Propuesta enviada",
      icon: require("lucide-react").Send,
      status: "completed" as const,
      color: "info" as const,
    },
    accepted: {
      title: "Propuesta aceptada",
      icon: require("lucide-react").CheckCircle2,
      status: "completed" as const,
      color: "success" as const,
    },
    rejected: {
      title: "Propuesta rechazada",
      icon: require("lucide-react").X,
      status: "completed" as const,
      color: "danger" as const,
    },
    negotiations: {
      title: "En negociación",
      icon: require("lucide-react").MessageSquare,
      status: "current" as const,
      color: "warning" as const,
    },
    completed: {
      title: "Proyecto completado",
      icon: require("lucide-react").CheckCircle2,
      status: "completed" as const,
      color: "success" as const,
    },
  }

  const timelineItems: TimelineItem[] = events.map((event) => {
    const config = eventConfig[event.event]
    return {
      id: event.id,
      title: config.title,
      description: event.notes,
      timestamp: event.date,
      icon: config.icon,
      status: config.status,
      color: config.color,
    }
  })

  return <Timeline items={timelineItems} />
}

interface TransactionTimelineEvent {
  id: string
  type: "earned" | "withdrawn" | "pending" | "completed"
  amount: number
  date: Date
  description?: string
  status?: "completed" | "pending"
}

export function TransactionTimeline({
  events,
}: {
  events: TransactionTimelineEvent[]
}) {
  const eventConfig = {
    earned: {
      title: "Pago recibido",
      icon: require("lucide-react").DollarSign,
      color: "success" as const,
    },
    withdrawn: {
      title: "Retiro solicitado",
      icon: require("lucide-react").CreditCard,
      color: "info" as const,
    },
    pending: {
      title: "Pago pendiente",
      icon: require("lucide-react").Clock,
      color: "warning" as const,
    },
    completed: {
      title: "Retiro completado",
      icon: require("lucide-react").CheckCircle2,
      color: "success" as const,
    },
  }

  const timelineItems: TimelineItem[] = events.map((event) => {
    const config = eventConfig[event.type]
    return {
      id: event.id,
      title: config.title,
      description: event.description,
      timestamp: event.date,
      icon: config.icon,
      status: event.status || "pending",
      color: config.color,
      metadata: [
        {
          label: "Monto",
          value: `€${event.amount.toFixed(2)}`,
        },
      ],
    }
  })

  return <Timeline items={timelineItems} />
}

interface ProjectTimelineEvent {
  id: string
  event:
    | "created"
    | "proposal_sent"
    | "proposal_accepted"
    | "started"
    | "milestone_completed"
    | "completed"
    | "paid"
  date: Date
  description?: string
  details?: string
}

export function ProjectTimeline({
  events,
}: {
  events: ProjectTimelineEvent[]
}) {
  const eventConfig = {
    created: {
      title: "Proyecto creado",
      icon: require("lucide-react").Briefcase,
      status: "completed" as const,
      color: "info" as const,
    },
    proposal_sent: {
      title: "Propuesta enviada",
      icon: require("lucide-react").Send,
      status: "completed" as const,
      color: "info" as const,
    },
    proposal_accepted: {
      title: "Propuesta aceptada",
      icon: require("lucide-react").CheckCircle2,
      status: "completed" as const,
      color: "success" as const,
    },
    started: {
      title: "Proyecto iniciado",
      icon: require("lucide-react").Zap,
      status: "completed" as const,
      color: "success" as const,
    },
    milestone_completed: {
      title: "Hito completado",
      icon: require("lucide-react").Flag,
      status: "completed" as const,
      color: "success" as const,
    },
    completed: {
      title: "Proyecto completado",
      icon: require("lucide-react").CheckCircle2,
      status: "completed" as const,
      color: "success" as const,
    },
    paid: {
      title: "Pago recibido",
      icon: require("lucide-react").DollarSign,
      status: "completed" as const,
      color: "success" as const,
    },
  }

  const timelineItems: TimelineItem[] = events.map((event) => {
    const config = eventConfig[event.event]
    return {
      id: event.id,
      title: config.title,
      description: event.description,
      timestamp: event.date,
      icon: config.icon,
      status: config.status,
      color: config.color,
    }
  })

  return <Timeline items={timelineItems} />
}
