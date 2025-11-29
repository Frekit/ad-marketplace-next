"use client"

import { useState, useEffect } from "react";
import { FreelancerCard } from "@/components/freelancer-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";

interface Freelancer {
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
}

export function FreelancerList() {
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                const res = await fetch("/api/freelancers/search");
                if (res.ok) {
                    const data = await res.json();
                    setFreelancers(data.freelancers || []);
                }
            } catch (error) {
                console.error("Error fetching freelancers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFreelancers();
    }, []);

    const filteredFreelancers = freelancers.filter(
        (freelancer) =>
            freelancer.firstName.toLowerCase().includes(search.toLowerCase()) ||
            freelancer.lastName.toLowerCase().includes(search.toLowerCase()) ||
            freelancer.role.toLowerCase().includes(search.toLowerCase()) ||
            freelancer.skills.some((skill) =>
                skill.toLowerCase().includes(search.toLowerCase())
            )
    );

    return (
        <div className="space-y-8">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/30 p-6 rounded-3xl border">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, rol o habilidad..."
                        className="pl-12 h-12 rounded-full border-0 bg-background shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    className="rounded-full px-6 h-12 gap-2 border-2 hover:bg-background"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                </Button>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Mostrando <span className="font-semibold text-foreground">{filteredFreelancers.length}</span> freelancers
                </p>
            </div>

            {/* Freelancer Grid */}
            {loading ? (
                <div className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-4">Cargando freelancers...</p>
                </div>
            ) : filteredFreelancers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFreelancers.map((freelancer) => (
                        <FreelancerCard key={freelancer.id} {...freelancer} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
                    <p className="text-muted-foreground">
                        Intenta con otros términos de búsqueda
                    </p>
                </div>
            )}
        </div>
    );
}
