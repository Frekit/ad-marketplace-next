"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import SkillsInput from "@/components/freelancer/skills-input"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface ProfileData {
    user?: {
        id: string
        email: string
        first_name: string
        last_name: string
    }
    profile?: {
        bio?: string
        hourly_rate?: number
        skills?: string[]
        availability?: string
    }
}

type AvailabilityType = "available" | "busy" | "unavailable"

export default function FreelancerProfileSettings() {
    const router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push("/sign-in")
        },
    })

    const [profileData, setProfileData] = useState<ProfileData>({})
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        hourly_rate: "",
        skills: [] as string[],
        availability: "available" as AvailabilityType,
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{
        type: "success" | "error"
        text: string
    } | null>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/freelancer/profile")
            if (!res.ok) throw new Error("Failed to fetch profile")

            const data: ProfileData = await res.json()
            setProfileData(data)

            if (data.user && data.profile) {
                setFormData({
                    first_name: data.user.first_name || "",
                    last_name: data.user.last_name || "",
                    bio: data.profile.bio || "",
                    hourly_rate: data.profile.hourly_rate?.toString() || "",
                    skills: data.profile.skills || [],
                    availability: (data.profile.availability ||
                        "available") as AvailabilityType,
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
            const res = await fetch("/api/freelancer/profile", {
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
            <FreelancerLayout>
                <div className="p-8 flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </FreelancerLayout>
        )
    }

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Configuración del perfil
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Actualiza tu información profesional para atraer más clientes
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
                                    value={profileData.user?.email || ""}
                                    disabled
                                    className="bg-gray-50"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    No se puede cambiar el email
                                </p>
                            </div>
                        </Card>

                        {/* Professional Information */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Información profesional
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tarifa horaria (€/hora)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">€</span>
                                        <Input
                                            type="number"
                                            min="5"
                                            max="500"
                                            step="0.5"
                                            value={formData.hourly_rate}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    hourly_rate: e.target.value,
                                                })
                                            }
                                            placeholder="25"
                                            className="pl-7"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Mínimo recomendado: €5/hora
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio / Descripción
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                bio: e.target.value,
                                            })
                                        }
                                        placeholder="Cuéntale a los clientes sobre ti, tu experiencia y especialidades..."
                                        maxLength={500}
                                        rows={5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.bio.length}/500 caracteres
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Habilidades
                                    </label>
                                    <SkillsInput
                                        initialSkills={formData.skills}
                                        onChange={(skills) =>
                                            setFormData({
                                                ...formData,
                                                skills,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Disponibilidad
                                    </label>
                                    <div className="flex gap-2">
                                        {(["available", "busy", "unavailable"] as AvailabilityType[]).map(
                                            (status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            availability: status,
                                                        })
                                                    }
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.availability === status
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {status === "available" &&
                                                        "Disponible"}
                                                    {status === "busy" &&
                                                        "Ocupado"}
                                                    {status === "unavailable" &&
                                                        "No disponible"}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
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
        </FreelancerLayout>
    )
}
