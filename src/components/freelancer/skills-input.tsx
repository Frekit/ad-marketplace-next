"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface SkillsInputProps {
    initialSkills?: string[]
    onChange: (skills: string[]) => void
    maxSkills?: number
}

const SUGGESTED_SKILLS = [
    "React",
    "TypeScript",
    "Next.js",
    "Vue.js",
    "Angular",
    "Node.js",
    "Python",
    "Django",
    "PHP",
    "Laravel",
    "Java",
    "C#",
    "AWS",
    "Docker",
    "GraphQL",
    "REST API",
    "MongoDB",
    "PostgreSQL",
    "Firebase",
    "UI/UX Design",
    "Figma",
    "Webpack",
    "CSS",
    "HTML",
    "JavaScript",
    "Git",
    "Linux",
    "SQL",
]

export default function SkillsInput({
    initialSkills = [],
    onChange,
    maxSkills = 15,
}: SkillsInputProps) {
    const [skills, setSkills] = useState<string[]>(initialSkills)
    const [inputValue, setInputValue] = useState("")
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)

        if (value.trim().length > 0) {
            const filtered = SUGGESTED_SKILLS.filter(
                (skill) =>
                    skill.toLowerCase().includes(value.toLowerCase()) &&
                    !skills.includes(skill)
            )
            setFilteredSuggestions(filtered.slice(0, 5))
        } else {
            setFilteredSuggestions([])
        }
    }

    const addSkill = (skill: string) => {
        const trimmedSkill = skill.trim()
        if (
            trimmedSkill &&
            !skills.includes(trimmedSkill) &&
            skills.length < maxSkills
        ) {
            const updatedSkills = [...skills, trimmedSkill]
            setSkills(updatedSkills)
            onChange(updatedSkills)
            setInputValue("")
            setFilteredSuggestions([])
        }
    }

    const removeSkill = (skillToRemove: string) => {
        const updatedSkills = skills.filter((skill) => skill !== skillToRemove)
        setSkills(updatedSkills)
        onChange(updatedSkills)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addSkill(inputValue)
        }
    }

    const addSuggestedSkill = (skill: string) => {
        addSkill(skill)
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Añade una habilidad y presiona Enter"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        onClick={() => addSkill(inputValue)}
                        disabled={!inputValue.trim() || skills.length >= maxSkills}
                        variant="outline"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Suggestions dropdown */}
                {filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
                        {filteredSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => addSuggestedSkill(suggestion)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-md last:rounded-b-md"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Skills display */}
            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-red-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <p className="text-xs text-gray-500">
                {skills.length}/{maxSkills} habilidades
            </p>
        </div>
    )
}
