"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

interface ClientData {
    user?: {
        id: string
        email: string
        first_name: string
        last_name: string
        company_name?: string
    }
}

export default function ClientSettingsPage() {
    const router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push("/sign-in")
        },
    })

    const [clientData, setClientData] = useState<ClientData>({})
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        company_name: "",
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{
        type: "success" | "error"
        text: string
    } | null>(null)

    useEffect(() => {
        fetchClientData()
    }, [])

    const fetchClientData = async () => {
        try {
            const res = await fetch("/api/client/profile")
            if (!res.ok) throw new Error("Failed to fetch profile")

            const data: ClientData = await res.json()
            setClientData(data)

            if (data.user) {
                setFormData({
                    first_name: data.user.first_name || "",
                    last_name: data.user.last_name || "",
                    company_name: data.user.company_name || "",
                })
            }
        } catch (error) {
            console.error("Error fetching profile:", error)
            setMessage({
                type: "error",
                text: "Error al cargar el perfil",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch("/api/client/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to update profile")
            }

            setMessage({
                type: "success",
                text: "Perfil actualizado exitosamente",
            })

            setTimeout(() => {
                setMessage(null)
            }, 3000)
        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Error al actualizar el perfil",
            })
        } finally {
            setSaving(false)
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <Link href="/dashboard/client" className="text-blue-600 hover:text-blue-900 font-medium mb-4 inline-block">
                            ← Volver al dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Configuración del perfil
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Actualiza tu información de empresa
                        </p>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div
                            className={`flex items-center gap-3 p-4 rounded-lg ${message.type === "success"
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                                }`}
                        >
                            {message.type === "success" ? (
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            )}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Información personal
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                first_name: e.target.value,
                                            })
                                        }
                                        placeholder="Tu nombre"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Apellido
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                last_name: e.target.value,
                                            })
                                        }
                                        placeholder="Tu apellido"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={clientData.user?.email || ""}
                                    disabled
                                    className="bg-gray-50"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    No se puede cambiar el email
                                </p>
                            </div>
                        </Card>

                        {/* Company Information */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Información de la empresa
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la empresa
                                </label>
                                <Input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            company_name: e.target.value,
                                        })
                                    }
                                    placeholder="Nombre de tu empresa"
                                />
                            </div>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar cambios"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
