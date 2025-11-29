"use client"

import { useState, useEffect } from "react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Project = {
    id: string;
    title: string;
    description: string;
    status: string;
    allocated_budget?: number;
    skills_required?: string[];
    created_at: string;
    updated_at: string;
};

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [project, setProject] = useState<Project | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");
    const [budget, setBudget] = useState("");

    useEffect(() => {
        const resolveParams = async () => {
            try {
                const resolvedParams = await params;
                setProjectId(resolvedParams.id);
            } catch (err) {
                console.error("Error resolving params:", err);
                setError("Error al cargar los parámetros");
                setLoading(false);
            }
        }
        resolveParams();
    }, [params]);

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                const proj = data.project;
                setProject(proj);
                setTitle(proj.title);
                setDescription(proj.description);
                setSkills(proj.skills_required || []);
                setBudget(proj.allocated_budget?.toString() || "");
            } else {
                setError("No se pudo cargar el proyecto");
            }
        } catch (err) {
            console.error("Error fetching project:", err);
            setError("Error al cargar el proyecto");
        } finally {
            setLoading(false);
        }
    };

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

        if (!projectId) {
            setError("ID de proyecto no disponible");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    skills_required: skills,
                    allocated_budget: budget ? parseFloat(budget) : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al actualizar el proyecto");
            }

            router.push(`/projects/${projectId}`);
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ClientLayout>
                <div className="p-8 flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C5C]"></div>
                </div>
            </ClientLayout>
        );
    }

    if (!project) {
        return (
            <ClientLayout>
                <div className="p-8">
                    <Card className="p-8 text-center">
                        <p className="text-red-600 mb-4">{error || "Proyecto no encontrado"}</p>
                        <Button onClick={() => router.back()}>Volver</Button>
                    </Card>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8 flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Editar Proyecto</h1>
                            <p className="text-gray-600 mt-1">
                                Modifica los detalles de tu proyecto
                            </p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles del Proyecto</CardTitle>
                            <CardDescription>
                                Actualiza la información de tu proyecto
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
                                <Label htmlFor="budget">Presupuesto (opcional)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="budget"
                                        type="number"
                                        placeholder="0.00"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        step="0.01"
                                        min="0"
                                    />
                                    <span className="flex items-center text-gray-600">€</span>
                                </div>
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

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
                                >
                                    {saving ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ClientLayout>
    );
}
