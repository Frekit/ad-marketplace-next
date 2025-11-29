import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const MOCK_ORDERS = [
    { id: "101", title: "Facebook Ads Campaign", freelancer: "Alex Marketing", status: "in_progress", amount: 450, date: "2023-10-25" },
    { id: "102", title: "Logo Design", freelancer: "Design Pro", status: "completed", amount: 100, date: "2023-09-15" },
];

export default function OrdersPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            <div className="space-y-4">
                {MOCK_ORDERS.map((order) => (
                    <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                            <div>
                                <h3 className="font-semibold text-lg">{order.title}</h3>
                                <p className="text-sm text-muted-foreground">with {order.freelancer} • {order.date}</p>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                <Badge variant={order.status === "completed" ? "secondary" : "default"}>
                                    {order.status === "completed" ? "Completed" : "In Progress"}
                                </Badge>
                                <span className="font-bold">${order.amount}</span>
                                <Link href={`/orders/${order.id}`}>
                                    <Button variant="outline" size="sm">View Details</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
