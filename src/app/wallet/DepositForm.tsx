"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";

export default function DepositForm() {
    const [amount, setAmount] = useState("100");
    const [poCode, setPoCode] = useState("");
    const [billingDetails, setBillingDetails] = useState({
        name: "",
        tax_id: "",
        address: "",
        city: "",
        postal_code: "",
        country: "ES",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [invoiceUrl, setInvoiceUrl] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");

    const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBillingDetails({ ...billingDetails, [e.target.id]: e.target.value });
    };

    const handleGenerateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setInvoiceUrl("");
        setLoading(true);

        try {
            const res = await fetch("/api/stripe/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    poCode,
                    billingDetails,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate invoice");
            }

            setInvoiceUrl(data.url);
            setInvoiceNumber(data.number);

            // Reload page after 2 seconds to show new invoice in history
            setTimeout(() => window.location.reload(), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Deposit Funds</CardTitle>
                <CardDescription>Generate an invoice for bank transfer</CardDescription>
            </CardHeader>
            <CardContent>
                {!invoiceUrl ? (
                    <form onSubmit={handleGenerateInvoice} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (€)</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="10"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="poCode">Purchase Order (Orden de Compra)</Label>
                            <Input
                                id="poCode"
                                placeholder="e.g., PO-2024-001"
                                value={poCode}
                                onChange={(e) => setPoCode(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">Required for invoice generation</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Billing Details</Label>
                            <div className="grid gap-2">
                                <Input
                                    id="name"
                                    placeholder="Company Name / Full Name"
                                    value={billingDetails.name}
                                    onChange={handleBillingChange}
                                    required
                                    disabled={loading}
                                />
                                <Input
                                    id="tax_id"
                                    placeholder="Tax ID (CIF/NIF)"
                                    value={billingDetails.tax_id}
                                    onChange={handleBillingChange}
                                    required
                                    disabled={loading}
                                />
                                <Input
                                    id="address"
                                    placeholder="Address Line 1"
                                    value={billingDetails.address}
                                    onChange={handleBillingChange}
                                    required
                                    disabled={loading}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        id="city"
                                        placeholder="City"
                                        value={billingDetails.city}
                                        onChange={handleBillingChange}
                                        required
                                        disabled={loading}
                                    />
                                    <Input
                                        id="postal_code"
                                        placeholder="Postal Code"
                                        value={billingDetails.postal_code}
                                        onChange={handleBillingChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Invoice...
                                </>
                            ) : (
                                "Generate Invoice"
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6 text-center py-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Invoice Generated!</h3>
                            <p className="text-muted-foreground">
                                Invoice <strong>{invoiceNumber}</strong> is ready.
                            </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-sm text-left space-y-2">
                            <p><strong>Next Steps:</strong></p>
                            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                <li>Download the invoice PDF.</li>
                                <li>Make the bank transfer using the details in the invoice.</li>
                                <li>Funds will be added to your wallet once received (1-3 days).</li>
                            </ol>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button asChild size="lg" className="w-full">
                                <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                                    View & Pay Invoice
                                </a>
                            </Button>
                            <Button variant="outline" onClick={() => setInvoiceUrl("")} className="w-full">
                                Make Another Deposit
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
