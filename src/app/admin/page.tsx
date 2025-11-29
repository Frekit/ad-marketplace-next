"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Users, Settings } from "lucide-react"

export default function AdminRoot() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to dashboard
        router.push("/admin/dashboard")
    }, [router])

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
                <p className="text-gray-600 mb-8">Redirigiendo al dashboard...</p>

                <div className="grid grid-cols-2 gap-4">
                    <Link href="/admin/dashboard">
                        <Button className="w-full" variant="outline">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/admin/invoices">
                        <Button className="w-full" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            Invoices
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button className="w-full" variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Usuarios
                        </Button>
                    </Link>
                    <Link href="/admin/settings">
                        <Button className="w-full" variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Configuración
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
