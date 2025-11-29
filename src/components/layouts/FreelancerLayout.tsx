"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Search, Globe, Menu, MessageSquare, TrendingUp, Briefcase, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { signOut } from "next-auth/react"

export default function FreelancerLayout({
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
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="text-[#FF5C5C] font-bold text-2xl">malt</div>
                        </Link>
                        <button className="lg:hidden">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <Search className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full relative">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-[#FF5C5C] rounded-full"></span>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <Globe className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="p-1 hover:bg-gray-100 rounded-full transition"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-[#FF5C5C] text-white text-sm">FR</AvatarFallback>
                                </Avatar>
                            </button>
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Mi Perfil
                                    </Link>
                                    <Link
                                        href="/preferences"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Preferencias
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false)
                                            handleLogout()
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2 border-t"
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
                <aside className="hidden lg:block w-64 border-r bg-white min-h-screen">
                    <nav className="p-4 space-y-1">
                        <Link
                            href="/dashboard/freelancer"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/dashboard/freelancer') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="h-5 w-5">📊</div>
                            Panel de control
                        </Link>
                        <Link
                            href="/inbox"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/inbox') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <MessageSquare className="h-5 w-5" />
                            Bandeja de entrada
                        </Link>
                        <Link
                            href="/freelancer/proposals"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancer/proposals') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <Briefcase className="h-5 w-5" />
                            Propuestas de Proyectos
                        </Link>
                        <Link
                            href="/freelancer/projects"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancer/projects') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="h-5 w-5">📁</div>
                            Mis Proyectos Activos
                        </Link>
                        <Link
                            href="/freelancer/wallet"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancer/wallet') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="h-5 w-5">💰</div>
                            Mi Wallet
                        </Link>
                        <Link
                            href="/freelancer/verification"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/freelancer/verification') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="h-5 w-5">📄</div>
                            Verificación
                        </Link>

                        <div className="pt-4 pb-2">
                            <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mi cuenta</div>
                        </div>

                        <Link
                            href="/profile/edit"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/profile/edit') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="h-5 w-5">👤</div>
                            Ver o editar mi perfil
                        </Link>
                        <Link
                            href="/stats"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/stats') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <TrendingUp className="h-5 w-5" />
                            Mis estadísticas
                        </Link>
                        <Link
                            href="/preferences"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/preferences') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="h-5 w-5">⚙️</div>
                            Mis preferencias
                        </Link>

                        <div className="pt-4 pb-2">
                            <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Área de clientes</div>
                        </div>

                        <Link
                            href="/payments"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/payments') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="h-5 w-5">💳</div>
                            Facturas y pagos
                        </Link>
                        <Link
                            href="/reviews"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/reviews') ? 'bg-gray-50 text-gray-900 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
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
