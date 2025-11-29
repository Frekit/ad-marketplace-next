import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Star, MapPin, Briefcase, Calendar, Award, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";

async function getFreelancer(id: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/freelancers/search?id=${id}`, {
            cache: 'no-store'
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.freelancers?.[0] || null;
    } catch (error) {
        console.error('Error fetching freelancer:', error);
        return null;
    }
}

export default async function FreelancerProfilePage({ params }: { params: { id: string } }) {
    const freelancer = await getFreelancer(params.id);

    if (!freelancer) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer">
                            AdMarket
                        </h1>
                    </Link>
                    <nav className="flex gap-4 items-center">
                        <Link href="/">
                            <Button variant="ghost">Browse</Button>
                        </Link>
                        <Link href="/messages">
                            <Button variant="ghost">Messages</Button>
                        </Link>
                        <Link href="/profile">
                            <Button>My Profile</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-muted/50 to-background border-b">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary shrink-0">
                            {freelancer.firstName[0]}{freelancer.lastName[0]}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2">
                                {freelancer.firstName} {freelancer.lastName}
                            </h1>
                            <p className="text-xl text-muted-foreground mb-4">{freelancer.role}</p>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{freelancer.rating}</span>
                                    <span className="text-muted-foreground">({freelancer.reviewCount} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-5 w-5" />
                                    <span>{freelancer.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="h-5 w-5" />
                                    <span>${freelancer.hourlyRate}/day</span>
                                </div>
                            </div>

                            <p className="text-lg mb-6 max-w-3xl">{freelancer.bio}</p>

                            <div className="flex gap-3">
                                <Link href="/messages">
                                    <Button size="lg" className="gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        Contact Me
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline">Hire Now</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Portfolio */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {freelancer.portfolio?.map((project: any) => (
                                    <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-primary/10">
                                                {project.id}
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                                                {project.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.tags?.map((tag: string) => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6">Experience</h2>
                            <div className="space-y-6">
                                {freelancer.experience?.map((exp: any, idx: number) => (
                                    <Card key={idx}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Briefcase className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg">{exp.title}</h3>
                                                    <p className="text-muted-foreground mb-2">{exp.company}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{exp.period}</span>
                                                    </div>
                                                    <p className="text-sm">{exp.description}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Skills & Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {freelancer.skills?.map((skill: string) => (
                                        <Badge key={skill} variant="secondary">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    Certifications
                                </h3>
                                <ul className="space-y-3">
                                    {freelancer.certifications?.map((cert: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                            <span className="text-sm">{cert}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Starting at</p>
                                    <p className="text-3xl font-bold mb-4">${freelancer.hourlyRate}/day</p>
                                    <Link href="/messages">
                                        <Button className="w-full mb-2">Contact Me</Button>
                                    </Link>
                                    <Button variant="outline" className="w-full">Hire Now</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
