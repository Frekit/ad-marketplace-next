"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Globe, Menu, MessageSquare, TrendingUp, Briefcase, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import NotificationBell from "@/components/notifications/notification-bell"

export default function FreelancerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [showUserMenu, setShowUserMenu] = useState(false)

    const isActive = (path: string) => pathname?.startsWith(path)

    const handleLogout = async () => {
        await signOut({ redirectTo: "/sign-in" })
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <header className="border-b border-border bg-surface sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="text-primary font-bold text-2xl">malt</div>
                        </Link>
                        <button className="lg:hidden">
                            <Menu className="h-6 w-6 text-text" />
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-surface-hover rounded-full transition">
                            <Search className="h-5 w-5 text-text-muted" />
                        </button>
                        <NotificationBell userId={session?.user?.id} />
                        <button className="p-2 hover:bg-surface-hover rounded-full transition">
                            <Globe className="h-5 w-5 text-text-muted" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="p-1 hover:bg-surface-hover rounded-full transition"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-white text-sm">FR</AvatarFallback>
                                </Avatar>
                            </button>
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border z-50">
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-text hover:bg-surface-hover rounded-t-lg transition"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Mi Perfil
                                    </Link>
                                    <Link
                                        href="/preferences"
                                        className="block px-4 py-2 text-sm text-text hover:bg-surface-hover transition"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Preferencias
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false)
                                            handleLogout()
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-b-lg flex items-center gap-2 border-t border-border transition"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 border-r border-border bg-surface min-h-screen">
                    <nav className="p-4 space-y-1">
                        <Link
                            href="/dashboard/freelancer"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard/freelancer') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <div className="h-5 w-5">📊</div>
                            Panel de control
                        </Link>
                        <Link
                            href="/freelancer/messages"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/freelancer/messages') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <MessageSquare className="h-5 w-5" />
                            Mensajes
                        </Link>
                        <Link
                            href="/freelancer/proposals"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/freelancer/proposals') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <Briefcase className="h-5 w-5" />
                            Propuestas de Proyectos
                        </Link>
                        <Link
                            href="/freelancer/projects"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancer/projects') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <div className="h-5 w-5">📁</div>
                            Mis Proyectos Activos
                        </Link>
                        <Link
                            href="/freelancer/wallet"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancer/wallet') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <div className="h-5 w-5">💰</div>
                            Mi Wallet
                        </Link>
                        <Link
                            href="/freelancer/verification"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancer/verification') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <div className="h-5 w-5">📄</div>
                            Verificación
                        </Link>
                        <Link
                            href="/freelancer/reviews"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancer/reviews') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <TrendingUp className="h-5 w-5" />
                            Reseñas y Calificaciones
                        </Link>
                        <Link
                            href="/freelancer/notifications"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancer/notifications') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <div className="h-5 w-5">🔔</div>
                            Notificaciones
                        </Link>

                        <div className="pt-4 pb-2">
                            <div className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Mi cuenta</div>
                        </div>

                        <Link
                            href="/profile/edit"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/profile/edit') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <div className="h-5 w-5">👤</div>
                            Ver o editar mi perfil
                        </Link>
                        <Link
                            href="/stats"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/stats') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <TrendingUp className="h-5 w-5" />
                            Mis estadísticas
                        </Link>
                        <Link
                            href="/preferences"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/preferences') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <div className="h-5 w-5">⚙️</div>
                            Mis preferencias
                        </Link>

                        <div className="pt-4 pb-2">
                            <div className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Área de clientes</div>
                        </div>

                        <Link
                            href="/payments"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/payments') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <div className="h-5 w-5">💳</div>
                            Facturas y pagos
                        </Link>
                        <Link
                            href="/reviews"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/reviews') ? 'bg-accent/20 text-accent font-medium' : 'hover:bg-surface-hover text-text-muted'}`}
                        >
                            <div className="h-5 w-5">⭐</div>
                            Reseñas
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
