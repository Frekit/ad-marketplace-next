import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  secondary?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondary,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-6">
        <Icon className="h-8 w-8 text-gray-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>

      {description && (
        <p className="text-gray-600 text-center mb-6 max-w-sm">
          {description}
        </p>
      )}

      <div className="flex gap-3">
        {actionLabel && (
          <Button
            onClick={onAction}
            asChild={!!actionHref}
            className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90"
          >
            {actionHref ? (
              <a href={actionHref}>{actionLabel}</a>
            ) : (
              actionLabel
            )}
          </Button>
        )}

        {secondary && (
          <Button
            variant="outline"
            onClick={secondary.onClick}
            asChild={!!secondary.href}
          >
            {secondary.href ? (
              <a href={secondary.href}>{secondary.label}</a>
            ) : (
              secondary.label
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// Variantes predefinidas comunes

export function EmptyProposals() {
  return (
    <EmptyState
      icon={require("lucide-react").MessageSquare}
      title="No hay propuestas recibidas"
      description="Mejora tu perfil y habilidades para atraer más clientes"
      actionLabel="Ir a mis habilidades"
      actionHref="/freelancer/profile-settings"
    />
  )
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={require("lucide-react").Mail}
      title="Tu inbox está vacío"
      description="Los mensajes de clientes aparecerán aquí"
    />
  )
}

export function EmptyProjects() {
  return (
    <EmptyState
      icon={require("lucide-react").Briefcase}
      title="Sin proyectos activos"
      description="Explora proyectos disponibles y envía tus propuestas"
      actionLabel="Ver proyectos"
      actionHref="/projects"
    />
  )
}

export function EmptyInvoices() {
  return (
    <EmptyState
      icon={require("lucide-react").FileText}
      title="Sin facturas"
      description="Los pagos que recibas tendrán una factura asociada"
    />
  )
}

export function EmptyPortfolio() {
  return (
    <EmptyState
      icon={require("lucide-react").Image}
      title="Tu portfolio está vacío"
      description="Añade casos de estudio para mostrar tu trabajo"
      actionLabel="Añadir caso de estudio"
      actionHref="/freelancer/portfolio"
    />
  )
}

export function EmptyTransactions() {
  return (
    <EmptyState
      icon={require("lucide-react").DollarSign}
      title="Sin transacciones"
      description="Tus transacciones y pagos aparecerán aquí"
    />
  )
}

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={require("lucide-react").Search}
      title="No se encontraron resultados"
      description={`No hay coincidencias para "${query}". Intenta con otros términos.`}
    />
  )
}
