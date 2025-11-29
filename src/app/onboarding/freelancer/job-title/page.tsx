"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function JobTitlePage() {
    const router = useRouter()

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
                                    <div className="flex gap-2">
                                        <div className="h-2 w-20 bg-gray-100 rounded-full" />
                                        <div className="h-2 w-12 bg-gray-100 rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <div className="h-2 w-full bg-gray-50 rounded-full" />
                                    <div className="h-2 w-5/6 bg-gray-50 rounded-full" />
                                    <div className="h-2 w-4/6 bg-gray-50 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                                El título con el que quieres presentarte al mundo entero
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Elige un título que refleje tu área de especialización y te haga destacar.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Input
                                    className="h-14 pl-6 pr-12 text-lg rounded-full border-2"
                                    placeholder="Global Strategic Planner"
                                    defaultValue="Global Strategic Planner"
                                />
                                <div className="absolute right-2 top-2 h-10 w-10 bg-[#0F4C5C] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#0F4C5C]/90">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6 flex items-center gap-1">
                                <span className="inline-block h-3 w-3 rounded-full border text-[10px] flex items-center justify-center">i</span>
                                Entre 5 y 50 caracteres
                            </p>
                        </div>

                        <div className="bg-muted/30 p-6 rounded-xl space-y-4">
                            <h3 className="font-medium text-foreground">¿Cuáles de estas categorías define mejor tu experiencia?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors">
                                    <Checkbox id="cat1" />
                                    <label htmlFor="cat1" className="text-sm font-medium cursor-pointer w-full">Director de medios</label>
                                </div>
                                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors">
                                    <Checkbox id="cat2" />
                                    <label htmlFor="cat2" className="text-sm font-medium cursor-pointer w-full">Consultor de estrategia</label>
                                </div>
                                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors">
                                    <Checkbox id="cat3" />
                                    <label htmlFor="cat3" className="text-sm font-medium cursor-pointer w-full">Consultor de Negocio</label>
                                </div>
                                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors">
                                    <Checkbox id="cat4" />
                                    <label htmlFor="cat4" className="text-sm font-medium cursor-pointer w-full">Consultor de comunicación</label>
                                </div>
                            </div>
                            <button className="text-sm font-bold text-[#0F4C5C] hover:underline">¿No encuentras tu categoría?</button>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" className="h-12 px-8 rounded-full border-2" onClick={() => router.back()}>
                                Volver
                            </Button>
                            <Button className="h-12 px-8 rounded-full" onClick={() => router.push('/onboarding/freelancer/skills')}>
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
