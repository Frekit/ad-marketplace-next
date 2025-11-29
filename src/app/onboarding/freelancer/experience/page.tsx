"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Puzzle, Layers, Box } from "lucide-react"

export default function ExperienceLevelPage() {
    const router = useRouter()

    const handleSelect = (level: string) => {
        // In a real app, save this to state/context
        console.log("Selected level:", level)
        router.push("/onboarding/freelancer/create-account")
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header Progress (Mock) */}
            <div className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex gap-8">
                        <span className="text-primary font-medium border-b-2 border-primary pb-4 -mb-4.5">¡Hora de presentarte!</span>
                        <span>Destaca tus habilidades</span>
                        <span>Selecciona tus preferencias</span>
                        <span>¡Todo listo!</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="max-w-5xl w-full space-y-12 text-center">
                    <h1 className="text-4xl font-bold text-foreground">
                        Tu experiencia freelance
                    </h1>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {/* Level 1 */}
                        <Card
                            className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer h-[320px] flex flex-col items-center justify-between p-8 hover:shadow-xl text-left"
                            onClick={() => handleSelect('beginner')}
                        >
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Acabo de empezar mi actividad freelance</h3>
                            </div>
                            <div className="w-full flex justify-center mt-auto">
                                <Puzzle className="h-24 w-24 text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
                            </div>
                        </Card>

                        {/* Level 2 */}
                        <Card
                            className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer h-[320px] flex flex-col items-center justify-between p-8 hover:shadow-xl text-left"
                            onClick={() => handleSelect('intermediate')}
                        >
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">He realizado un número limitado de proyectos</h3>
                            </div>
                            <div className="w-full flex justify-center mt-auto">
                                <Layers className="h-24 w-24 text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
                            </div>
                        </Card>

                        {/* Level 3 */}
                        <Card
                            className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer h-[320px] flex flex-col items-center justify-between p-8 hover:shadow-xl text-left"
                            onClick={() => handleSelect('expert')}
                        >
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Tengo una base sólida de clientes</h3>
                            </div>
                            <div className="w-full flex justify-center mt-auto">
                                <Box className="h-24 w-24 text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
