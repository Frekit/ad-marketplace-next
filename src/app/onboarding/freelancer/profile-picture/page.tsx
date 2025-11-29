"use client"

import { useState, useEffect } from "react"

export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { MapPin, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import ProfilePictureUpload from "@/components/profile-picture-upload"
import { createClient } from "@/lib/supabase"

export default function ProfilePicturePage() {
    const router = useRouter()
    const [userId, setUserId] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
            }
            setLoading(false)
        }
        getUser()
    }, [])

    const handleUploadComplete = (url: string) => {
        console.log('Avatar uploaded:', url)
        // Optionally auto-advance to next step
        // router.push('/onboarding/freelancer/phone')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C5C]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header Progress */}
            <div className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex gap-8">
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">¡Hora de presentarte!</span>
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">Destaca tus habilidades</span>
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">Selecciona tus preferencias</span>
                        <span>¡Todo listo!</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side - Preview Card */}
                    <div className="hidden lg:block">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border max-w-sm mx-auto transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                            <div className="h-48 bg-[#FF5C5C] relative p-6 flex flex-col justify-end text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                <h2 className="text-2xl font-bold">Alvaro Romero</h2>
                                <div className="flex items-center gap-1 text-sm opacity-90 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    Madrid, España
                                </div>
                                <div className="absolute -bottom-8 left-6 h-20 w-20 bg-white rounded-full border-4 border-white shadow-sm" />
                            </div>
                            <div className="pt-12 px-6 pb-8 space-y-4">
                                <div className="inline-block bg-white border shadow-sm rounded-full px-4 py-1 text-sm font-bold text-foreground -mt-16 relative z-10">
                                    <Info className="h-3 w-3 inline mr-1" /> 100 € /día
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-foreground">Global Strategic Planner</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">coma</span>
                                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">Test driven development</span>
                                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">Strategic Planning</span>
                                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">Comms Strategy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                                ¡Ponle cara a tu nombre!
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Necesitas una foto de perfil para aparecer en los resultados de búsqueda.
                            </p>
                        </div>

                        {/* Profile Picture Upload Component */}
                        <ProfilePictureUpload
                            userId={userId}
                            onUploadComplete={handleUploadComplete}
                        />

                        <div className="flex justify-between pt-8 items-center">
                            <Button variant="outline" className="h-12 px-8 rounded-full border-2" onClick={() => router.back()}>
                                Volver
                            </Button>
                            <div className="flex items-center gap-4">
                                <button
                                    className="text-[#0F4C5C] font-bold text-sm hover:underline"
                                    onClick={() => router.push('/onboarding/freelancer/phone')}
                                >
                                    Lo haré en otro momento
                                </button>
                                <Button className="h-12 px-8 rounded-full bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white" onClick={() => router.push('/onboarding/freelancer/phone')}>
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
