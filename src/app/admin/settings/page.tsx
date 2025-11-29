"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

type AdminUser = {
    id: string
    email: string
    created_at: string
}

export default function AdminSettingsPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [newEmail, setNewEmail] = useState("")

    useEffect(() => {
        fetchAdmins()
    }, [])

    const fetchAdmins = async () => {
        try {
            const res = await fetch("/api/admin/users")
            if (res.ok) {
                const data = await res.json()
                setAdmins(data.admins || [])
            } else {
                setError("Error al cargar administradores")
            }
        } catch (err) {
            console.error("Error fetching admins:", err)
            setError("Error al cargar datos")
        } finally {
            setLoading(false)
        }
    }

    const handleAddAdmin = async () => {
        if (!newEmail.trim()) {
            setError("Ingresa un email")
            return
        }

        setAdding(true)
        setError("")
        setSuccess("")

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newEmail }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Error al agregar administrador")
                return
            }

            setSuccess("Administrador agregado correctamente")
            setNewEmail("")
            fetchAdmins()
        } catch (err) {
            console.error("Error adding admin:", err)
            setError("Error al agregar administrador")
        } finally {
            setAdding(false)
        }
    }

    const handleRemoveAdmin = async (adminId: string, email: string) => {
        if (!confirm(`¿Estás seguro de que deseas remover a ${email} como administrador?`)) {
            return
        }

        try {
            const res = await fetch(`/api/admin/users/${adminId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                setError("Error al remover administrador")
                return
            }

            setSuccess("Administrador removido correctamente")
            fetchAdmins()
        } catch (err) {
            console.error("Error removing admin:", err)
            setError("Error al remover administrador")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C5C]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-8 py-6">
                    <Link href="/admin/dashboard">
                        <Button variant="outline" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Configuración de Administradores</h1>
                    <p className="text-gray-600 mt-1">Gestiona quién tiene acceso al panel de administración</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-8 py-12">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                        {success}
                    </div>
                )}

                {/* Add Admin Form */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Agregar Nuevo Administrador</CardTitle>
                        <CardDescription>Ingresa el email de la persona que deseas agregar como administrador</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@ejemplo.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleAddAdmin()}
                                />
                                <Button
                                    onClick={handleAddAdmin}
                                    disabled={adding || !newEmail.trim()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {adding ? "Agregando..." : "Agregar"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Admins List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Administradores Actuales</CardTitle>
                        <CardDescription>Total: {admins.length}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {admins.length === 0 ? (
                            <p className="text-gray-600">No hay administradores agregados aún</p>
                        ) : (
                            <div className="space-y-3">
                                {admins.map((admin) => (
                                    <div
                                        key={admin.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{admin.email}</p>
                                            <p className="text-sm text-gray-600">
                                                Agregado: {new Date(admin.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="mt-8 bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-900">ℹ️ Instrucciones</CardTitle>
                    </CardHeader>
                    <CardContent className="text-blue-800 space-y-2">
                        <p>• Cada email agregado aquí podrá acceder al panel de administración</p>
                        <p>• El usuario debe registrarse con el email especificado</p>
                        <p>• Al iniciar sesión, serán redirigidos automáticamente al panel de admin</p>
                        <p>• Pueden remover a cualquier admin (excepto el suyo propio si no hay otro)</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
