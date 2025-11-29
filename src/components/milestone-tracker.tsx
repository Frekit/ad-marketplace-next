import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, Lock } from "lucide-react";

interface Milestone {
    id: string;
    title: string;
    amount: number;
    status: "pending" | "active" | "completed" | "paid";
}

export function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
    return (
        <div className="space-y-4">
            {milestones.map((milestone, index) => (
                <Card key={milestone.id} className={milestone.status === "active" ? "border-primary border-2" : ""}>
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-8">
                                {milestone.status === "paid" ? <CheckCircle2 className="text-green-500 h-6 w-6" /> :
                                    milestone.status === "completed" ? <CheckCircle2 className="text-blue-500 h-6 w-6" /> :
                                        milestone.status === "active" ? <Clock className="text-primary h-6 w-6" /> :
                                            <Circle className="text-muted-foreground h-6 w-6" />
                                }
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{milestone.title}</h3>
                                <p className="text-sm text-muted-foreground">${milestone.amount} USD</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant={
                                milestone.status === "paid" ? "default" :
                                    milestone.status === "active" ? "secondary" : "outline"
                            } className="bg-opacity-10">
                                {milestone.status.toUpperCase()}
                            </Badge>

                            {milestone.status === "completed" && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Release Payment</Button>
                            )}
                            {milestone.status === "pending" && (
                                <Button size="sm" variant="ghost" disabled><Lock className="h-4 w-4 mr-2" /> Locked</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
