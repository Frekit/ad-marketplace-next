"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SkillsPage() {
    const router = useRouter()
    const [skills, setSkills] = useState<string[]>([])
    const [inputValue, setInputValue] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)

    const suggestions = [
        "Communication", "Social media", "Stratégie de communication",
        "E-commerce", "Estrategia de comunicación", "Community management",
        "Communication digitale", "Comunicación digital", "Comunicación",
        "Communication strategy"
    ]

    const addSkill = (skill: string) => {
        if (skills.length < 5 && !skills.includes(skill)) {
            setSkills([...skills, skill])
        }
        setInputValue("")
        setShowSuggestions(false)
    }

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove))
    }

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
                                        {skills.length > 0 ? skills.map(skill => (
                                            <span key={skill} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{skill}</span>
                                        )) : (
                                            <>
                                                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                                                <div className="h-6 w-24 bg-gray-100 rounded-full" />
                                                <div className="h-6 w-16 bg-gray-100 rounded-full" />
                                            </>
                                        )}
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
                                Tus 5 superpoderes principales
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Ejemplos de habilidades profesionales: Planificación estratégica, Consultoría, Estrategia empresarial, Dirección de proyecto, Transformación digital
                            </p>
                        </div>

                        <div className="space-y-4 relative">
                            <Input
                                className="h-14 pl-6 text-lg rounded-full border-2"
                                placeholder="Escribe aqui..."
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value)
                                    setShowSuggestions(true)
                                }}
                                onFocus={() => setShowSuggestions(true)}
                            />

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && inputValue && (
                                <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-lg mt-2 z-10 max-h-60 overflow-y-auto">
                                    <div className="p-2 text-xs text-muted-foreground border-b">
                                        Crea "{inputValue}" (Utilizado por 0 freelance)
                                    </div>
                                    {suggestions.filter(s => s.toLowerCase().includes(inputValue.toLowerCase())).map((suggestion) => (
                                        <div
                                            key={suggestion}
                                            className="p-3 hover:bg-gray-50 cursor-pointer text-sm"
                                            onClick={() => addSkill(suggestion)}
                                        >
                                            <div className="font-medium">{suggestion}</div>
                                            <div className="text-xs text-muted-foreground">Utilizado por {Math.floor(Math.random() * 10000)} freelance</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selected Skills Chips */}
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <div key={skill} className="bg-muted px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                                        {skill}
                                        <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {Array.from({ length: 5 - skills.length }).map((_, i) => (
                                    <div key={i} className="bg-muted/30 px-4 py-2 rounded-full w-24 h-9" />
                                ))}
                            </div>

                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className={`h-4 w-4 rounded-full border-2 ${skills.length === 5 ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                                {5 - skills.length} habilidades por completar
                            </p>
                        </div>

                        <div className="flex justify-between pt-8">
                            <Button variant="outline" className="h-12 px-8 rounded-full border-2" onClick={() => router.back()}>
                                Volver
                            </Button>
                            <Button
                                className="h-12 px-8 rounded-full"
                                onClick={() => router.push('/onboarding/freelancer/languages')}
                                disabled={skills.length === 0}
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
