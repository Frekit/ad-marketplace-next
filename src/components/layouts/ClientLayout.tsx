"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Search, Globe, Menu, Briefcase, Wallet, Users, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { signOut } from "next-auth/react"

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
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
                        <button className="p-2 hover:bg-surface-hover rounded-full relative transition">
                            <Bell className="h-5 w-5 text-text-muted" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
                        </button>
                        <button className="p-2 hover:bg-surface-hover rounded-full transition">
                            <Globe className="h-5 w-5 text-text-muted" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="p-1 hover:bg-surface-hover rounded-full transition"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-[#FF5C5C] text-white text-sm">CL</AvatarFallback>
                                </Avatar>
                            </button>
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border z-50">
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-text hover:bg-accent/20 rounded-t-lg"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Mi Perfil
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="block px-4 py-2 text-sm text-text hover:bg-accent/20"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Configuración
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false)
                                            handleLogout()
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-b-lg flex items-center gap-2 border-t"
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
                <aside className="hidden lg:block w-64 border-r bg-surface min-h-screen">
                    <nav className="p-4 space-y-1">
                        <Link
                            href="/dashboard/client"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/dashboard/client') ? 'bg-accent/20 text-gray-900 font-medium' : 'hover:bg-accent/20 text-text-muted'}`}
                        >
                            <div className="h-5 w-5">📊</div>
                            Dashboard
                        </Link>
                        <Link
                            href="/projects"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/projects') ? 'bg-accent/20 text-gray-900 font-medium' : 'hover:bg-accent/20 text-text-muted'}`}
                        >
                            <Briefcase className="h-5 w-5" />
                            Mis Proyectos
                        </Link>
                        <Link
                            href="/freelancers"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancers') ? 'bg-accent/20 text-gray-900 font-medium' : 'hover:bg-accent/20 text-text-muted'}`}
                        >
                            <Users className="h-5 w-5" />
                            Buscar Freelancers
                        </Link>

                        <div className="pt-4 pb-2">
                            <div className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Gestión</div>
                        </div>

                        <Link
                            href="/wallet"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/wallet') ? 'bg-accent/20 text-gray-900 font-medium' : 'hover:bg-accent/20 text-text-muted'}`}
                        >
                            <Wallet className="h-5 w-5" />
                            Wallet
                        </Link>
                        <Link
                            href="/settings"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/settings') ? 'bg-accent/20 text-gray-900 font-medium' : 'hover:bg-accent/20 text-text-muted'}`}
                        >
                            <Settings className="h-5 w-5" />
                            Configuración
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
