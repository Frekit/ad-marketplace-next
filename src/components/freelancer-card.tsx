import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Star, MapPin } from "lucide-react";
import Link from "next/link";

interface FreelancerCardProps {
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

export function FreelancerCard({
    id,
    firstName,
    lastName,
    role,
    skills,
    rating,
    reviewCount,
    hourlyRate,
    location,
    bio,
}: FreelancerCardProps) {
    return (
        <Card className="group relative overflow-hidden border-0 bg-card shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <CardHeader className="relative pb-4">
                <div className="flex items-start gap-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 ring-4 ring-background group-hover:ring-primary/10 transition-all duration-300">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                        {/* Status indicator */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-background" />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-xl mb-1 truncate group-hover:text-primary transition-colors">
                            {firstName} {lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium mb-3">{role}</p>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-1.5">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{rating}</span>
                                <span className="text-muted-foreground">({reviewCount})</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative space-y-5">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {bio}
                </p>

                <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 3).map((skill) => (
                        <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs font-medium px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                        >
                            {skill}
                        </Badge>
                    ))}
                    {skills.length > 3 && (
                        <Badge
                            variant="outline"
                            className="text-xs font-medium px-3 py-1 rounded-full border-dashed"
                        >
                            +{skills.length - 3}
                        </Badge>
                    )}
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Desde</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            ${hourlyRate}
                        </p>
                        <p className="text-xs text-muted-foreground">por jornada</p>
                    </div>
                    <Link href={`/freelancers/${id}`}>
                        <Button className="rounded-full px-6 shadow-sm hover:shadow-md transition-all">
                            Ver Perfil
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
