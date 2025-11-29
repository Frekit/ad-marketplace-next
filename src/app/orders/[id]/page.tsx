import { MilestoneTracker } from "@/components/milestone-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MOCK_ORDER = {
    id: "101",
    gigTitle: "Professional Facebook Ad Campaign Management",
    freelancer: "Alex Marketing",
    client: "TechCorp Inc.",
    totalAmount: 450,
    status: "in_progress",
    milestones: [
        { id: "m1", title: "Campaign Strategy & Setup", amount: 150, status: "paid" },
        { id: "m2", title: "Ad Creatives & Copywriting", amount: 150, status: "active" },
        { id: "m3", title: "Optimization & Final Report", amount: 150, status: "pending" },
    ] as const,
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // In real app, fetch order by id
    const order = MOCK_ORDER;

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                    <p className="text-muted-foreground">
                        {order.gigTitle} • with <span className="font-medium text-foreground">{order.freelancer}</span>
                    </p>
                </div>
                <Button variant="outline">Contact Support</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Milestones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MilestoneTracker milestones={order.milestones as any} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Budget</span>
                                <span className="font-bold">${order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Paid so far</span>
                                <span className="font-bold text-green-600">$150</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Remaining</span>
                                <span>$300</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
