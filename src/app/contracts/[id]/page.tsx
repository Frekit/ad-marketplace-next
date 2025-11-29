"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, AlertCircle, DollarSign, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Milestone = {
    id: number;
    name: string;
    amount: number;
    due_date: string;
    description: string;
    status: 'pending' | 'completed' | 'approved';
    completed_at?: string;
    approved_at?: string;
    deliverables?: string;
};

type Contract = {
    id: string;
    project_id: string;
    freelancer_id: string;
    client_id: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    milestones: Milestone[];
};

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const contractId = params.id as string;

    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [deliverables, setDeliverables] = useState("");
    const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

    useEffect(() => {
        fetchContract();
    }, [contractId]);

    const fetchContract = async () => {
        try {
            // TODO: Replace with actual API call
            // Mock data for now
            setContract({
                id: contractId,
                project_id: "proj-1",
                freelancer_id: "freelancer-1",
                client_id: "client-1",
                total_amount: 400,
                paid_amount: 150,
                status: "active",
                milestones: [
                    {
                        id: 1,
                        name: "Design Phase",
                        amount: 150,
                        due_date: "2024-12-01",
                        description: "Complete UI/UX design",
                        status: "approved",
                        completed_at: "2024-11-20T10:00:00Z",
                        approved_at: "2024-11-21T14:00:00Z",
                    },
                    {
                        id: 2,
                        name: "Development",
                        amount: 200,
                        due_date: "2024-12-15",
                        description: "Implement features",
                        status: "completed",
                        completed_at: "2024-11-24T16:00:00Z",
                    },
                    {
                        id: 3,
                        name: "Testing",
                        amount: 50,
                        due_date: "2024-12-20",
                        description: "QA and bug fixes",
                        status: "pending",
                    },
                ],
            });
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleCompleteMilestone = async (milestoneId: number) => {
        setActionLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/contracts/${contractId}/milestones/${milestoneId}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deliverables }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to complete milestone");
            }

            setDeliverables("");
            setSelectedMilestone(null);
            fetchContract();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReleasePayment = async (milestoneId: number) => {
        setActionLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/contracts/${contractId}/milestones/${milestoneId}/release`, {
                method: "POST",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to release payment");
            }

            alert(data.message);
            fetchContract();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading contract...</p>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Contract not found</p>
            </div>
        );
    }

    const progress = (contract.paid_amount / contract.total_amount) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
            <header className="border-b bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold">Contract Details</h1>
                        <Link href="/dashboard/client">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl space-y-6">
                {/* Contract Overview */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Contract Overview</CardTitle>
                                <CardDescription>ID: {contract.id}</CardDescription>
                            </div>
                            <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                                {contract.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-2xl font-bold">€{contract.total_amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Paid Amount</p>
                                <p className="text-2xl font-bold text-green-600">€{contract.paid_amount.toFixed(2)}</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Progress</span>
                                <span>{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Milestones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Milestones</CardTitle>
                        <CardDescription>Track progress and manage payments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {contract.milestones.map((milestone) => (
                            <div
                                key={milestone.id}
                                className="p-4 border rounded-lg space-y-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold">{milestone.name}</h3>
                                            <Badge
                                                variant={
                                                    milestone.status === 'approved'
                                                        ? 'default'
                                                        : milestone.status === 'completed'
                                                            ? 'secondary'
                                                            : 'outline'
                                                }
                                            >
                                                {milestone.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                {milestone.status === 'completed' && <Clock className="h-3 w-3 mr-1" />}
                                                {milestone.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {milestone.description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">€{milestone.amount.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(milestone.due_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {milestone.deliverables && (
                                    <div className="p-3 bg-muted rounded text-sm">
                                        <p className="font-medium mb-1">Deliverables:</p>
                                        <p className="text-muted-foreground">{milestone.deliverables}</p>
                                    </div>
                                )}

                                {/* Freelancer Actions */}
                                {milestone.status === 'pending' && (
                                    <div className="space-y-2">
                                        {selectedMilestone === milestone.id ? (
                                            <>
                                                <Label>Deliverables Description</Label>
                                                <Textarea
                                                    placeholder="Describe what you've completed..."
                                                    value={deliverables}
                                                    onChange={(e) => setDeliverables(e.target.value)}
                                                    rows={3}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleCompleteMilestone(milestone.id)}
                                                        disabled={actionLoading || !deliverables}
                                                        size="sm"
                                                    >
                                                        Submit for Approval
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedMilestone(null);
                                                            setDeliverables("");
                                                        }}
                                                        size="sm"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedMilestone(milestone.id)}
                                                size="sm"
                                            >
                                                Mark as Complete
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Client Actions */}
                                {milestone.status === 'completed' && (
                                    <Button
                                        onClick={() => handleReleasePayment(milestone.id)}
                                        disabled={actionLoading}
                                        size="sm"
                                        className="w-full"
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Release Payment (€{milestone.amount.toFixed(2)})
                                    </Button>
                                )}

                                {milestone.status === 'approved' && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        Payment released on {new Date(milestone.approved_at!).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
