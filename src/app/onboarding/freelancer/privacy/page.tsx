"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Info } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrivacySettingsPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header Progress */}
            <div className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex gap-8">
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">¡Hora de presentarte!</span>
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">Destaca tus habilidades</span>
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">Selecciona tus preferencias</span>
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">¡Todo listo!</span>
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
                                ¡Todo listo! ¿Te gustaría recibir nuevas oportunidades?
                            </h1>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-3">
                                <Checkbox id="visibility" className="mt-1 h-6 w-6" />
                                <label
                                    htmlFor="visibility"
                                    className="text-base leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                                >
                                    Optar por no aparecer en los motores de búsqueda (Google, Bing, etc.). Si marcas esta casilla, tu perfil no será visible para todos los clientes de la plataforma.
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-between pt-12 items-center">
                            <Button variant="outline" className="h-12 px-8 rounded-full border-2" onClick={() => router.back()}>
                                Volver
                            </Button>
                            <Button className="h-12 px-8 rounded-full bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white" onClick={() => router.push('/dashboard/freelancer?welcome=true')}>
                                Empezar con Malt
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
