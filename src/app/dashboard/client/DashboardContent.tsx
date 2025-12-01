"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Briefcase, Clock, TrendingUp, ArrowRight, LogOut, FileText, CheckCircle, XCircle, AlertCircle, Search, Bell, MessageSquare, Star, RotateCw } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    created_at: string;
    metadata: any;
}

interface ActiveProject {
    id: string;
    title: string;
    description: string;
    status: string;
    budget: number;
    proposalsReceived: number;
    postedDate: string;
    deadline: string | null;
}

interface RecommendedFreelancer {
    id: string;
    name: string;
    skills: string[];
    hourlyRate: number;
    availability: string;
    rating: number;
    totalReviews: number;
    completedProjects: number;
}

interface DashboardContentProps {
    balance: number;
    transactions: Transaction[];
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function DashboardContent({ balance, transactions, user }: DashboardContentProps) {
    const [projects, setProjects] = useState<ActiveProject[]>([]);
    const [freelancers, setFreelancers] = useState<RecommendedFreelancer[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingFreelancers, setLoadingFreelancers] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/client/projects/active");
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data.projects || []);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoadingProjects(false);
            }
        };

        const fetchFreelancers = async () => {
            try {
                const res = await fetch("/api/client/freelancers/recommended");
                if (res.ok) {
                    const data = await res.json();
                    setFreelancers(data.freelancers || []);
                }
            } catch (error) {
                console.error("Error fetching freelancers:", error);
            } finally {
                setLoadingFreelancers(false);
            }
        };

        fetchProjects();
        fetchFreelancers();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                (async () => {
                    const res = await fetch("/api/client/projects/active");
                    if (res.ok) {
                        const data = await res.json();
                        setProjects(data.projects || []);
                    }
                })(),
                (async () => {
                    const res = await fetch("/api/client/freelancers/recommended");
                    if (res.ok) {
                        const data = await res.json();
                        setFreelancers(data.freelancers || []);
                    }
                })()
            ]);
        } catch (error) {
            console.error("Error refreshing dashboard:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
        });
    };

    return (
        <div className="p-8">
            <main className="max-w-6xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-text">Welcome back, {user.name?.split(' ')[0] || "Client"}</h2>
                        <p className="text-text-muted mt-1">Here's what's happening with your projects today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            variant="outline"
                            className="gap-2"
                        >
                            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Link href="/projects/new">
                            <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                <Plus className="h-5 w-5 mr-2" />
                                Create New Project
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Action Required */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-text">Action Required</h3>
                            </div>
                            <Card className="border-l-4 border-l-warning shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-warning/20 rounded-full">
                                            <Clock className="h-6 w-6 text-warning" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-text">Complete your profile</p>
                                            <p className="text-sm text-text-muted">Add your company details to attract better freelancers.</p>
                                        </div>
                                    </div>
                                    <Link href="/onboarding/client">
                                        <Button variant="outline" size="sm">Complete Setup</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Active Projects */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-text">Active Projects</h3>
                                <Link href="/projects" className="text-sm text-primary hover:underline">View all</Link>
                            </div>
                            {loadingProjects ? (
                                <div className="space-y-3">
                                    {[1, 2].map((i) => (
                                        <Card key={i} className="shadow-sm animate-pulse">
                                            <CardContent className="p-5">
                                                <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                                <div className="h-3 bg-muted rounded w-3/4"></div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : projects.length > 0 ? (
                                <div className="space-y-3">
                                    {projects.map((project) => (
                                        <Link key={project.id} href={`/projects/${project.id}`}>
                                            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                <CardContent className="p-5">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-text">{project.title}</h4>
                                                            <p className="text-sm text-text-muted mt-1">{project.description?.substring(0, 100)}</p>
                                                            <div className="flex items-center gap-4 mt-3">
                                                                <span className="text-xs text-text-muted">
                                                                    Budget: <span className="font-medium">€{project.budget.toFixed(2)}</span>
                                                                </span>
                                                                <span className="text-xs text-text-muted">
                                                                    Proposals: <span className="font-medium">{project.proposalsReceived}</span>
                                                                </span>
                                                                <Badge variant="outline" className="text-xs capitalize">{project.status}</Badge>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="h-5 w-5 text-text-muted" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Card className="shadow-sm border-dashed border-2">
                                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                                        <div className="p-4 bg-muted rounded-full mb-4">
                                            <Briefcase className="h-8 w-8 text-text-muted" />
                                        </div>
                                        <h4 className="text-lg font-medium text-text">No active projects</h4>
                                        <p className="text-text-muted max-w-sm mt-2 mb-6">
                                            You haven't posted any projects yet. Start by creating a brief for what you need.
                                        </p>
                                        <Link href="/projects/new">
                                            <Button variant="outline">Post a Project</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </section>

                        {/* Suggested Freelancers */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-text">Top Freelancers for You</h3>
                                <Link href="/freelancers" className="text-sm text-primary hover:underline">Browse all</Link>
                            </div>
                            {loadingFreelancers ? (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[1, 2].map((i) => (
                                        <Card key={i} className="animate-pulse">
                                            <CardContent className="p-5">
                                                <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                                <div className="h-3 bg-muted rounded w-3/4"></div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : freelancers.length > 0 ? (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {freelancers.map((freelancer) => (
                                        <Link key={freelancer.id} href={`/freelancers/${freelancer.id}`}>
                                            <Card className="hover:shadow-md transition-all cursor-pointer group">
                                                <CardContent className="p-5">
                                                    <div className="flex items-start gap-4">
                                                        <Avatar className="h-12 w-12 border-2 border-surface shadow-sm">
                                                            <AvatarFallback>{freelancer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-text group-hover:text-primary transition-colors">{freelancer.name}</h4>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                {freelancer.rating > 0 && (
                                                                    <>
                                                                        <Star className="h-3 w-3 fill-warning text-warning" />
                                                                        <span className="text-xs font-medium">{freelancer.rating.toFixed(1)}</span>
                                                                        <span className="text-xs text-text-muted">({freelancer.totalReviews})</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge className={`text-xs font-normal ${
                                                                    freelancer.availability === 'available' ? 'bg-success/30 text-success' : 'bg-warning/30 text-warning'
                                                                }`}>
                                                                    {freelancer.availability}
                                                                </Badge>
                                                                <span className="text-xs text-text-muted">€{freelancer.hourlyRate}/hr</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {freelancer.skills.slice(0, 3).map((skill) => (
                                                            <Badge key={skill} variant="secondary" className="text-xs font-normal">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                        {freelancer.skills.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs font-normal">
                                                                +{freelancer.skills.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-8 text-center border-dashed border-2">
                                    <div className="p-4 bg-muted rounded-full mb-4 mx-auto w-fit">
                                        <Briefcase className="h-8 w-8 text-text-muted" />
                                    </div>
                                    <p className="text-text font-medium">No freelancers found</p>
                                    <p className="text-sm text-text-muted mt-2">Create a project first to get freelancer recommendations</p>
                                </Card>
                            )}
                        </section>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Wallet Summary */}
                        <Card className="bg-gradient-to-br from-secondary to-secondary/80 text-white border-none shadow-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                    <Wallet className="h-4 w-4" />
                                    Wallet Balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6">
                                    <p className="text-3xl font-bold">€{balance.toFixed(2)}</p>
                                    <p className="text-xs text-text-secondary mt-1">Available funds</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-white/10 rounded p-2">
                                        <p className="text-xs text-text-secondary">Escrow</p>
                                        <p className="font-semibold text-white">€0.00</p>
                                    </div>
                                    <div className="bg-white/10 rounded p-2">
                                        <p className="text-xs text-text-secondary">Spent</p>
                                        <p className="font-semibold text-white">€{transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0).toFixed(2)}</p>
                                    </div>
                                </div>
                                <Link href="/wallet">
                                    <Button className="w-full bg-white text-secondary hover:bg-gray-100 border-none">
                                        Manage Wallet
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-text">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {transactions.slice(0, 3).map((tx) => (
                                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-surface transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-success/30 text-success' : 'bg-muted text-text-muted'}`}>
                                                    {tx.type === 'deposit' ? <ArrowRight className="h-3 w-3 rotate-45" /> : <ArrowRight className="h-3 w-3 -rotate-45" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-text capitalize">{tx.type}</p>
                                                    <p className="text-xs text-text-muted">{formatDate(tx.created_at)}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-medium ${tx.type === 'deposit' ? 'text-success' : 'text-text'}`}>
                                                {tx.type === 'deposit' ? '+' : '-'}€{tx.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    {transactions.length === 0 && (
                                        <div className="p-4 text-center text-sm text-text-muted">
                                            No recent activity
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t border-border">
                                    <Link href="/wallet">
                                        <Button variant="ghost" size="sm" className="w-full text-xs text-text-muted">
                                            View all transactions
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
