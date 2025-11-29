"use client"

import { useState } from "react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Project Details
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");

    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleSubmit = async () => {
        setError("");

        if (!title || !description || skills.length === 0) {
            setError("Por favor completa todos los campos requeridos");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/projects/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    skills,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al crear el proyecto");
            }

            router.push(`/projects/${data.projectId}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Propuesta de Proyecto</h1>
                        <p className="text-gray-600 mt-2">
                            Describe tu proyecto y las habilidades que necesitas. Luego podrás invitar freelancers para que te envíen sus propuestas.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles del Proyecto</CardTitle>
                            <CardDescription>
                                Proporciona información clara sobre lo que necesitas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="title">Título del Proyecto *</Label>
                                <Input
                                    id="title"
                                    placeholder="ej. Campaña de Facebook Ads para E-commerce"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe los objetivos, alcance y cualquier detalle importante del proyecto..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                />
                                <p className="text-sm text-gray-500">
                                    Sé específico sobre lo que necesitas. Los freelancers usarán esta información para crear sus propuestas.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Habilidades Requeridas *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="ej. Facebook Ads, Google Analytics..."
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                                    />
                                    <Button type="button" onClick={addSkill} variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {skills.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="text-sm">
                                                {skill}
                                                <button
                                                    onClick={() => removeSkill(skill)}
                                                    className="ml-2 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">💡 Próximos pasos</h4>
                                <p className="text-sm text-blue-800">
                                    Después de crear la propuesta, podrás invitar freelancers. Ellos te enviarán sus ofertas con hitos y precios, y tú decidirás cuál aceptar.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
                                >
                                    {loading ? "Creando..." : "Crear Propuesta"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ClientLayout>
    );
}
