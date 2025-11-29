"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface FreelancerSearchProps {
    onSearch: (filters: SearchFilters) => void
    onReset: () => void
}

export interface SearchFilters {
    q: string
    skills: string[]
    minRate: number
    maxRate: number
    availability: string
    sort: string
}

const COMMON_SKILLS = [
    "React", "Node.js", "TypeScript", "Python", "JavaScript",
    "Next.js", "Vue.js", "Angular", "PHP", "Ruby",
    "Java", "C#", "Go", "Rust", "Swift",
    "UI/UX Design", "Graphic Design", "Content Writing", "SEO", "Marketing"
]

export default function FreelancerSearch({ onSearch, onReset }: FreelancerSearchProps) {
    const [keyword, setKeyword] = useState("")
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [rateRange, setRateRange] = useState<[number, number]>([0, 200])
    const [availability, setAvailability] = useState<string>("all")
    const [sort, setSort] = useState("rating_desc")

    const handleSearch = () => {
        onSearch({
            q: keyword,
            skills: selectedSkills,
            minRate: rateRange[0],
            maxRate: rateRange[1],
            availability: availability === "all" ? "" : availability,
            sort
        })
    }

    const handleReset = () => {
        setKeyword("")
        setSelectedSkills([])
        setRateRange([0, 200])
        setAvailability("all")
        setSort("rating_desc")
        onReset()
    }

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill))
        } else {
            setSelectedSkills([...selectedSkills, skill])
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Buscar Freelancers</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="text-gray-600"
                >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                </Button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
                <Label htmlFor="keyword">Palabra clave</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="keyword"
                        placeholder="Buscar por nombre o bio..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
                <Label>Habilidades</Label>
                <div className="flex flex-wrap gap-2">
                    {COMMON_SKILLS.map((skill) => (
                        <Badge
                            key={skill}
                            variant={selectedSkills.includes(skill) ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${selectedSkills.includes(skill)
                                    ? "bg-[#FF5C5C] hover:bg-[#FF5C5C]/90"
                                    : "hover:bg-gray-100"
                                }`}
                            onClick={() => toggleSkill(skill)}
                        >
                            {skill}
                        </Badge>
                    ))}
                </div>
                {selectedSkills.length > 0 && (
                    <p className="text-sm text-gray-500">
                        {selectedSkills.length} habilidad(es) seleccionada(s)
                    </p>
                )}
            </div>

            {/* Hourly Rate Range */}
            <div className="space-y-4">
                <Label>Tarifa por hora (€/h)</Label>
                <div className="px-2">
                    <Slider
                        min={0}
                        max={200}
                        step={5}
                        value={rateRange}
                        onValueChange={(value) => setRateRange(value as [number, number])}
                        className="w-full"
                    />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>€{rateRange[0]}/h</span>
                    <span>€{rateRange[1]}/h</span>
                </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
                <Label htmlFor="availability">Disponibilidad</Label>
                <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger id="availability">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="available">Disponible</SelectItem>
                        <SelectItem value="busy">Ocupado</SelectItem>
                        <SelectItem value="unavailable">No disponible</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
                <Label htmlFor="sort">Ordenar por</Label>
                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger id="sort">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rating_desc">Mejor valorados</SelectItem>
                        <SelectItem value="rate_asc">Tarifa: Menor a Mayor</SelectItem>
                        <SelectItem value="rate_desc">Tarifa: Mayor a Menor</SelectItem>
                        <SelectItem value="newest">Más recientes</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Search Button */}
            <Button
                onClick={handleSearch}
                className="w-full bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
            >
                <Search className="h-4 w-4 mr-2" />
                Buscar
            </Button>
        </div>
    )
}
