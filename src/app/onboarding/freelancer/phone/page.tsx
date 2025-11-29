"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Info, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PhoneNumberPage() {
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
                                Añadir número de teléfono
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Cabe la posibilidad de que nuestro equipo se ponga en contacto contigo para presentarte nuevas propuestas de proyecto o para optimizar tu perfil para clientes específicos.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tu número de teléfono</label>
                            <div className="flex gap-2">
                                <Select defaultValue="es">
                                    <SelectTrigger className="w-[100px] h-14 rounded-full border-2">
                                        <SelectValue placeholder="País" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="es">🇪🇸 +34</SelectItem>
                                        <SelectItem value="fr">🇫🇷 +33</SelectItem>
                                        <SelectItem value="us">🇺🇸 +1</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    className="h-14 pl-6 text-lg rounded-full border-2 flex-1"
                                    placeholder="Escribe un número de teléfono"
                                />
                            </div>
                            <p className="text-destructive text-sm flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" /> Número de teléfono incorrecto.
                            </p>
                        </div>

                        <div className="flex justify-between pt-8 items-center">
                            <Button variant="outline" className="h-12 px-8 rounded-full border-2" onClick={() => router.back()}>
                                Volver
                            </Button>
                            <div className="flex items-center gap-4">
                                <button className="text-[#0F4C5C] font-bold text-sm hover:underline">Lo haré en otro momento</button>
                                <Button className="h-12 px-8 rounded-full bg-muted text-muted-foreground hover:bg-muted" onClick={() => router.push('/onboarding/freelancer/privacy')}>
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
