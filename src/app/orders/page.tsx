import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

type Order = {
    id: string;
    title: string;
    allocated_budget: number;
    status: string;
    created_at: string;
    client_id: string;
    freelancer_id?: string;
};

async function getOrders() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/orders`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) return [];

        const data = await res.json();
        return data.orders || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

export default async function OrdersPage() {
    const orders = await getOrders();

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': 'Pendiente',
            'in_progress': 'En Progreso',
            'completed': 'Completado',
            'cancelled': 'Cancelado',
        };
        return statusMap[status] || status;
    };

    const getStatusVariant = (status: string) => {
        if (status === 'completed') return 'secondary';
        if (status === 'cancelled') return 'destructive';
        return 'default';
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Mis Órdenes</h1>
            {orders.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>No hay órdenes aún.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: Order) => (
                        <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                            <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{order.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.created_at).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                    <Badge variant={getStatusVariant(order.status)}>
                                        {getStatusLabel(order.status)}
                                    </Badge>
                                    <span className="font-bold text-lg">€{order.allocated_budget}</span>
                                    <Link href={`/orders/${order.id}`}>
                                        <Button variant="outline" size="sm">Ver Detalles</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
