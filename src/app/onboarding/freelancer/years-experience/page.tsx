"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ExperienceYearsPage() {
    const router = useRouter()
    const [selectedRange, setSelectedRange] = useState<string | null>(null)

    const ranges = [
        { id: "junior", label: "0-2 años", sub: "Junior" },
        { id: "intermediate", label: "3-7 años", sub: "Intermedio" },
        { id: "senior", label: "8-15 años", sub: "Senior" },
        { id: "expert", label: ">15 años", sub: "Experto" },
    ]

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header Progress */}
            <div className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex gap-8">
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">¡Hora de presentarte!</span>
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">Destaca tus habilidades</span>
                        <span>Selecciona tus preferencias</span>
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
                                    Donde las oportunidades brillan
                                </div>
                                <div className="absolute -bottom-8 left-6 h-20 w-20 bg-white rounded-full border-4 border-white shadow-sm" />
                            </div>
                            <div className="pt-12 px-6 pb-8 space-y-4">
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
                                Tu años de experiencia en esta actividad
                            </h1>
                        </div>

                        <div className="space-y-4">
                            {ranges.map((range) => (
                                <Card
                                    key={range.id}
                                    className={`p-4 cursor-pointer transition-all border-2 hover:border-primary/50 flex flex-col items-center justify-center text-center h-20 ${selectedRange === range.id ? 'border-primary bg-primary/5' : ''}`}
                                    onClick={() => setSelectedRange(range.id)}
                                >
                                    <span className="font-bold text-lg">{range.label}</span>
                                    <span className="text-sm text-muted-foreground">{range.sub}</span>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-between pt-8">
                            <Button variant="outline" className="h-12 px-8 rounded-full border-2" onClick={() => router.back()}>
                                Volver
                            </Button>
                            <Button
                                className="h-12 px-8 rounded-full"
                                onClick={() => router.push('/onboarding/freelancer/location')}
                                disabled={!selectedRange}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
