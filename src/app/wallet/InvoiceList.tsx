"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, XCircle, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Invoice {
    id: string;
    number: string | null;
    amount: number;
    status: string | null;
    created: number;
    invoice_pdf: string | null;
    hosted_invoice_url: string | null;
    currency: string;
}

interface InvoiceListProps {
    invoices: Invoice[];
}

export default function InvoiceList({ invoices }: InvoiceListProps) {
    const [cancelingId, setCancelingId] = useState<string | null>(null);
    const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case "paid":
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                    </Badge>
                );
            case "open":
                return (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <Clock className="h-3 w-3 mr-1" />
                        Open
                    </Badge>
                );
            case "void":
                return (
                    <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                        <XCircle className="h-3 w-3 mr-1" />
                        Canceled
                    </Badge>
                );
            case "uncollectible":
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Uncollectible
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        {status || "Unknown"}
                    </Badge>
                );
        }
    };

    const handleCancelClick = (invoice: Invoice) => {
        setInvoiceToCancel(invoice);
    };

    const handleCancelConfirm = async () => {
        if (!invoiceToCancel) return;

        setCancelingId(invoiceToCancel.id);
        setInvoiceToCancel(null);

        try {
            const res = await fetch("/api/stripe/cancel-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceId: invoiceToCancel.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to cancel invoice");
            }

            setNotification({
                type: 'success',
                message: `Invoice ${invoiceToCancel.number || invoiceToCancel.id.slice(-8)} canceled successfully!`
            });

            // Reload page after showing success message
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: error.message
            });
            setCancelingId(null);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <>
            {/* Notification Banner */}
            {notification && (
                <div className={`mb-4 p-4 rounded-lg border ${notification.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <div className="flex items-center gap-2">
                        {notification.type === 'success' ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            <AlertCircle className="h-5 w-5" />
                        )}
                        <p className="font-medium">{notification.message}</p>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {invoices.map((invoice) => (
                    <div
                        key={invoice.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-medium">
                                    {invoice.number || `Invoice ${invoice.id.slice(-8)}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(invoice.created)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">
                                    €{invoice.amount.toFixed(2)}
                                </p>
                                {getStatusBadge(invoice.status)}
                            </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {invoice.invoice_pdf && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <a
                                        href={invoice.invoice_pdf}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </a>
                                </Button>
                            )}

                            {invoice.hosted_invoice_url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <a
                                        href={invoice.hosted_invoice_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Invoice
                                    </a>
                                </Button>
                            )}

                            {invoice.status === "open" && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancelClick(invoice)}
                                    disabled={cancelingId === invoice.id}
                                >
                                    {cancelingId === invoice.id ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Canceling...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={!!invoiceToCancel} onOpenChange={(open) => !open && setInvoiceToCancel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel invoice{" "}
                            <strong>{invoiceToCancel?.number || invoiceToCancel?.id.slice(-8)}</strong>{" "}
                            for <strong>€{invoiceToCancel?.amount.toFixed(2)}</strong>?
                            <br /><br />
                            This action cannot be undone. The invoice will be marked as void and cannot be paid.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Invoice</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Yes, Cancel Invoice
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
