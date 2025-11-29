"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ExperienceReviewPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header Progress */}
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

            <div className="flex-1 flex flex-col items-center justify-start p-8">
                <div className="max-w-3xl w-full space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-foreground">
                            Vamos a ver lo que hemos encontrado
                        </h1>
                    </div>

                    <div className="space-y-4">
                        {/* Experience Card 1 */}
                        <Card className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">McCann Worldgroup,</h3>
                                    <div className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium mt-1">
                                        Importado de tu CV
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold">Global Strategic Planner</h4>
                                <p className="text-sm text-muted-foreground">septiembre de 2022 - Hoy (3 años y 3 meses)</p>
                                <p className="text-sm text-muted-foreground">Madrid, Spain</p>
                            </div>

                            <div className="space-y-2">
                                <h5 className="text-sm font-medium">Commerce</h5>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                    Designed multi-market strategic frameworks connecting social, digital and experiential channels, including social commerce touchpoints relevant to platforms like TikTok Sho...
                                </p>
                                <button className="text-primary text-sm font-medium hover:underline">Ver más</button>
                            </div>
                        </Card>

                        {/* Experience Card 2 */}
                        <Card className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">LightBros,</h3>
                                    <div className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium mt-1">
                                        Importado de tu CV
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold">Head of Digital</h4>
                                <p className="text-sm text-muted-foreground">septiembre de 2021 - septiembre de 2022 (1 año)</p>
                                <p className="text-sm text-muted-foreground">Madrid, Spain</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                    Spearheaded transformative digital strategies, driving unparalleled engagement and su...
                                </p>
                                <button className="text-primary text-sm font-medium hover:underline">Ver más</button>
                            </div>
                        </Card>
                    </div>

                    <div className="flex justify-between pt-8">
                        <Button variant="outline" className="h-12 px-8 rounded-full border-2" onClick={() => router.back()}>
                            Volver
                        </Button>
                        <Button className="h-12 px-8 rounded-full" onClick={() => router.push('/onboarding/freelancer/job-title')}>
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
