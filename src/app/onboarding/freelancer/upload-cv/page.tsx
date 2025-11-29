"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Linkedin, FileText, Download, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UploadCVPage() {
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

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="max-w-5xl w-full space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold text-foreground">
                            Empieza subiendo tu CV a tu perfil
                        </h1>
                        <p className="text-muted-foreground">
                            Podrás editar todos los campos más adelante.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                        {/* Manual Upload */}
                        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center p-12 space-y-4 min-h-[400px] bg-muted/5">
                            <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-muted-foreground">Desplaza tu documento aquí</p>
                            <div className="text-xs text-muted-foreground mt-auto pt-8">
                                Formatos aceptados: pdf, png, jpeg
                            </div>
                        </Card>

                        {/* LinkedIn Import */}
                        <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer p-8 min-h-[400px] flex flex-col relative overflow-hidden" onClick={() => router.push('/onboarding/freelancer/experience-review')}>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-2 text-[#0077B5]">
                                    <Linkedin className="h-6 w-6" />
                                    <span className="font-semibold">¿Sin CV?</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#0077B5]">
                                    Recuperarlo de <br /> tu perfil de LinkedIn
                                </h3>
                            </div>

                            {/* Mock UI of the import preview */}
                            <div className="mt-8 bg-white rounded-lg shadow-sm border p-4 transform rotate-2 translate-y-4 translate-x-4 opacity-90">
                                <div className="h-24 bg-slate-400 rounded-t-lg -mx-4 -mt-4 mb-8 relative">
                                    <div className="absolute -bottom-8 left-4 h-16 w-16 rounded-full bg-gray-200 border-4 border-white" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 rounded" />
                                    <div className="flex gap-2">
                                        <div className="h-6 w-20 bg-blue-600 rounded-full" />
                                        <div className="h-6 w-24 bg-gray-100 rounded-full" />
                                    </div>
                                </div>

                                {/* Context Menu Mock */}
                                <div className="absolute bottom-4 right-4 bg-white shadow-lg rounded-lg p-2 border text-xs space-y-2 w-40">
                                    <div className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded">
                                        <Share2 className="h-3 w-3" /> Enviar perfil
                                    </div>
                                    <div className="flex items-center gap-2 p-1 bg-blue-50 text-blue-600 rounded font-medium">
                                        <Download className="h-3 w-3" /> Guardar en PDF
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="flex justify-between max-w-4xl mx-auto pt-8">
                        <Button variant="outline" className="h-12 px-8 rounded-full border-2" onClick={() => router.push('/onboarding/freelancer/manual-cv')}>
                            Crear CV manualmente
                        </Button>
                        <Button className="h-12 px-8 rounded-full bg-muted text-muted-foreground hover:bg-muted" disabled>
                            Importar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
