"use client"

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000];

export function DepositModal() {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) < 10) {
            alert("Minimum deposit is €10");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create checkout session");
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectPresetAmount = (preset: number) => {
        setAmount(preset.toString());
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="rounded-full flex-1 gap-2">
                    <Plus className="h-5 w-5" />
                    Depositar Fondos
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-primary" />
                        Depositar Fondos
                    </DialogTitle>
                    <DialogDescription>
                        Añade fondos a tu wallet para asignar a proyectos
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Preset Amounts */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Cantidades sugeridas</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {PRESET_AMOUNTS.map((preset) => (
                                <Button
                                    key={preset}
                                    variant={amount === preset.toString() ? "default" : "outline"}
                                    className="rounded-full"
                                    onClick={() => selectPresetAmount(preset)}
                                >
                                    ${preset.toLocaleString()}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-3">
                        <Label htmlFor="amount" className="text-sm font-medium">
                            O ingresa una cantidad personalizada
                        </Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                $
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-8 h-12 rounded-full text-lg"
                                min="0"
                                step="100"
                            />
                        </div>
                    </div>

                    {/* Info Badge */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                        <p className="text-sm text-muted-foreground">
                            💳 Los fondos se procesarán de forma segura a través de Stripe.
                            El dinero estará disponible inmediatamente en tu wallet.
                        </p>
                    </div>

                    {/* Summary */}
                    {amount && parseFloat(amount) > 0 && (
                        <div className="space-y-2 p-4 bg-muted/30 rounded-2xl">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Monto a depositar</span>
                                <span className="font-semibold">${parseFloat(amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Comisión de procesamiento</span>
                                <span className="font-semibold">$0.00</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="font-bold text-lg">${parseFloat(amount).toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-full"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 rounded-full gap-2"
                            onClick={handleDeposit}
                            disabled={!amount || parseFloat(amount) <= 0 || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    Depositar ${amount ? parseFloat(amount).toLocaleString() : '0'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
