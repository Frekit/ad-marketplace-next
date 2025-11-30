"use client"

import { useState, useEffect } from "react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Search, DollarSign, Plus, Briefcase, ArrowRight, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { EmptyState, EmptySearchResults } from "@/components/empty-state";

type Freelancer = {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    skills: string[];
    rating: number;
    reviewCount: number;
    hourlyRate: number;
    location: string;
    bio: string;
    availability: string;
};

type Project = {
    id: string;
    title: string;
    allocated_budget: number;
    status: string;
};

export default function FreelancersPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [inviteMessage, setInviteMessage] = useState("");
    const [estimatedHours, setEstimatedHours] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [loadingFreelancers, setLoadingFreelancers] = useState(true);

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                const res = await fetch("/api/freelancers/search");
                if (res.ok) {
                    const data = await res.json();
                    setFreelancers(data.freelancers || []);
                } else {
                    console.error("Failed to fetch freelancers");
                    setFreelancers([]);
                }
            } catch (error) {
                console.error("Error fetching freelancers:", error);
                setFreelancers([]);
            } finally {
                setLoadingFreelancers(false);
            }
        };

        fetchFreelancers();
    }, []);

    const filteredFreelancers = freelancers.filter(f =>
        f.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleInviteClick = async (freelancer: Freelancer) => {
        setSelectedFreelancer(freelancer);
        setSheetOpen(true);
        setLoadingProjects(true);

        try {
            const res = await fetch('/api/projects');

            if (res.ok) {
                const data = await res.json();
                setProjects(data.projects || []);
            } else {
                setProjects([]);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            setProjects([]);
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleSendInvitation = async () => {
        if (!selectedProject || !selectedFreelancer) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${selectedProject}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    freelancerId: selectedFreelancer.id,
                    message: inviteMessage,
                    proposedRate: selectedFreelancer.hourlyRate,
                    estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send invitation");
            }

            toast({ variant: "success", title: "Éxito", description: "Invitation sent successfully!" });
            setSheetOpen(false);
            setInviteMessage("");
            setEstimatedHours("");
            setSelectedProject("");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'available':
                return 'bg-green-100 text-green-700'
            case 'busy':
                return 'bg-yellow-100 text-yellow-700'
            case 'unavailable':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    };

    const getAvailabilityLabel = (availability: string) => {
        switch (availability) {
            case 'available':
                return 'Disponible'
            case 'busy':
                return 'Ocupado'
            case 'unavailable':
                return 'No disponible'
            default:
                return availability
        }
    };

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Buscar Freelancers</h1>
                        <p className="text-gray-600 mt-1">Encuentra el talento perfecto para tu proyecto</p>
                    </div>

                    {/* Search Bar */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre, rol o habilidades..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {loadingFreelancers ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#FF5C5C]" />
                        </div>
                    ) : filteredFreelancers.length === 0 ? (
                        <Card>
                            {searchTerm ? (
                                <EmptySearchResults query={searchTerm} />
                            ) : freelancers.length === 0 ? (
                                <EmptyState
                                    icon={Users}
                                    title="No hay freelancers disponibles"
                                    description="Actualmente no hay freelancers registrados en la plataforma."
                                />
                            ) : (
                                <EmptySearchResults query={searchTerm} />
                            )}
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredFreelancers.map((freelancer) => (
                                <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {freelancer.firstName} {freelancer.lastName}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {freelancer.role}
                                                </p>
                                            </div>
                                            <Badge className={getAvailabilityColor(freelancer.availability)}>
                                                {getAvailabilityLabel(freelancer.availability)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Rating */}
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold">{freelancer.rating}</span>
                                            <span className="text-sm text-muted-foreground">
                                                ({freelancer.reviewCount} reviews)
                                            </span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            {freelancer.location}
                                        </div>

                                        {/* Hourly Rate */}
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-[#FF5C5C]" />
                                            <span className="font-semibold text-[#FF5C5C]">
                                                €{freelancer.hourlyRate}/h
                                            </span>
                                        </div>

                                        {/* Skills */}
                                        <div className="flex flex-wrap gap-2">
                                            {freelancer.skills.slice(0, 3).map((skill, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>

                                        {/* Bio */}
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {freelancer.bio}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Link href={`/freelancers/${freelancer.id}`} className="flex-1">
                                                <Button variant="outline" className="w-full" size="sm">
                                                    Ver Perfil
                                                </Button>
                                            </Link>
                                            <Button
                                                className="flex-1 bg-[#FF5C5C] hover:bg-[#FF5C5C]/90"
                                                size="sm"
                                                onClick={() => handleInviteClick(freelancer)}
                                            >
                                                Invitar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Invitation Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            Invitar a {selectedFreelancer?.firstName} {selectedFreelancer?.lastName}
                        </SheetTitle>
                        <SheetDescription>
                            Selecciona un proyecto existente o crea uno nuevo
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                        {/* Create New Project Option */}
                        <div className="p-4 border-2 border-dashed rounded-lg hover:border-[#FF5C5C] transition-colors">
                            <Link href={`/projects/new?freelancer=${selectedFreelancer?.id}`}>
                                <Button variant="ghost" className="w-full h-auto py-4 justify-start">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[#FF5C5C]/10 rounded-lg">
                                            <Plus className="h-6 w-6 text-[#FF5C5C]" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold">Crear Nuevo Proyecto</p>
                                            <p className="text-sm text-muted-foreground">
                                                Define un nuevo proyecto con hitos
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 ml-auto" />
                                </Button>
                            </Link>
                        </div>

                        {/* Loading Projects */}
                        {loadingProjects && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-[#FF5C5C]" />
                            </div>
                        )}

                        {/* Existing Projects */}
                        {!loadingProjects && projects.length > 0 && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            O selecciona un proyecto existente
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedProject === project.id
                                                ? 'border-[#FF5C5C] bg-[#FF5C5C]/5'
                                                : 'hover:border-[#FF5C5C]/50'
                                                }`}
                                            onClick={() => setSelectedProject(project.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-muted rounded">
                                                        <Briefcase className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{project.title}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Presupuesto: €{project.allocated_budget}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{project.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedProject && (
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="hours">Horas/Días Estimados</Label>
                                            <Input
                                                id="hours"
                                                type="number"
                                                placeholder="ej: 40 horas o 5 días"
                                                value={estimatedHours}
                                                onChange={(e) => setEstimatedHours(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Tiempo estimado para este proyecto
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Mensaje Personal (Opcional)</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Agrega un mensaje personal a tu invitación..."
                                                value={inviteMessage}
                                                onChange={(e) => setInviteMessage(e.target.value)}
                                                rows={4}
                                            />
                                        </div>

                                        <Button
                                            className="w-full bg-[#FF5C5C] hover:bg-[#FF5C5C]/90"
                                            onClick={handleSendInvitation}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Enviando...
                                                </>
                                            ) : (
                                                "Enviar Invitación"
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {!loadingProjects && projects.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">No se encontraron proyectos existentes.</p>
                                <p className="text-sm">Crea un nuevo proyecto para invitar a este freelancer.</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </ClientLayout>
    );
}
