import ClientLayout from "@/components/layouts/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Clock } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Stripe from "stripe";
import DepositForm from "./DepositForm";
import InvoiceList from "./InvoiceList";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

export default async function WalletPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/sign-in");
    }

    const supabase = createClient();

    // Fetch wallet balance
    const { data: wallet } = await supabase
        .from("client_wallets")
        .select("available_balance, locked_balance")
        .eq("client_id", session.user.id)
        .single();

    // Fetch transactions with Stripe metadata
    const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("type", "deposit")
        .order("created_at", { ascending: false });

    // Fetch invoice details from Stripe
    const invoices = [];
    if (transactions && transactions.length > 0) {
        const invoicePromises = transactions
            .filter(tx => tx.metadata?.stripe_invoice_id)
            .map(async (tx) => {
                try {
                    const invoice = await stripe.invoices.retrieve(tx.metadata.stripe_invoice_id);
                    return {
                        id: invoice.id,
                        number: invoice.number,
                        amount: invoice.amount_paid / 100,
                        status: invoice.status,
                        created: invoice.created,
                        invoice_pdf: invoice.invoice_pdf ?? null,
                        hosted_invoice_url: invoice.hosted_invoice_url ?? null,
                        currency: invoice.currency,
                    };
                } catch (error) {
                    console.error("Failed to fetch invoice:", error);
                    return null;
                }
            });

        const fetchedInvoices = await Promise.all(invoicePromises);
        invoices.push(...fetchedInvoices.filter(inv => inv !== null));
    }

    const availableBalance = wallet?.available_balance || 0;
    const lockedBalance = wallet?.locked_balance || 0;

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
                            <p className="text-gray-600 mt-1">Gestiona tus fondos y transacciones</p>
                        </div>
                        <Link href="/projects/new">
                            <Button className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90">
                                Crear Proyecto
                            </Button>
                        </Link>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Wallet className="h-4 w-4" />
                                    Fondos Disponibles
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-green-600">
                                    €{availableBalance.toFixed(2)}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Listos para usar en nuevos proyectos
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Fondos Bloqueados (Escrow)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-orange-600">
                                    €{lockedBalance.toFixed(2)}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Reservados para proyectos activos
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Deposit Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Añadir Fondos</CardTitle>
                            <CardDescription>
                                Deposita fondos en tu wallet para iniciar proyectos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DepositForm />
                        </CardContent>
                    </Card>

                    {/* Invoice List */}
                    <InvoiceList invoices={invoices} />
                </div>
            </div>
        </ClientLayout>
    );
}
