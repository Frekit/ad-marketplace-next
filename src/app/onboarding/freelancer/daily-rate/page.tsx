"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DailyRatePage() {
    const router = useRouter()
    const [rate, setRate] = useState("100")

    const calculateNet = (amount: string) => {
        const val = parseInt(amount) || 0
        return Math.floor(val * 0.9) // Mock 10% fee
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
                                    <Info className="h-3 w-3 inline mr-1" /> {rate} € /día
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
                                Vamos a fijar tu tarifa diaria
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Puedes adaptarla posteriormente para cada proyecto.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Lo que ven los clientes</label>
                                <div className="relative">
                                    <Input
                                        className="h-14 pl-6 text-lg rounded-full border-2"
                                        value={rate}
                                        onChange={(e) => setRate(e.target.value)}
                                        type="number"
                                    />
                                    <div className="absolute right-4 top-4 font-medium text-muted-foreground">€</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tus ingresos netos (después de los gastos de gestión freelance)</label>
                                <div className="relative">
                                    <Input
                                        className="h-14 pl-6 text-lg rounded-full border-2 bg-muted/20"
                                        value={calculateNet(rate)}
                                        readOnly
                                    />
                                    <div className="absolute right-4 top-4 font-medium text-muted-foreground">€</div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-2 pt-2">
                                <Checkbox id="hide-rate" className="mt-1" />
                                <label
                                    htmlFor="hide-rate"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground leading-relaxed"
                                >
                                    Ocultar tarifa diaria. Los clientes no podrán contactarte. Solo los equipos de Malt podrán.
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-between pt-8">
                            <Button variant="outline" className="h-12 px-8 rounded-full border-2" onClick={() => router.back()}>
                                Volver
                            </Button>
                            <Button className="h-12 px-8 rounded-full bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white" onClick={() => router.push('/onboarding/freelancer/profile-picture')}>
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
