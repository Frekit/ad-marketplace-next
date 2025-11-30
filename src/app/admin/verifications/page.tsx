"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, FileText, Download, Calendar, Mail, MapPin, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type Verification = {
    id: string
    email: string
    first_name: string
    last_name: string
    country: string
    verification_status: string
    verification_notes: string | null
    doc_hacienda_url: string | null
    doc_hacienda_filename: string | null
    doc_seguridad_social_url: string | null
    doc_seguridad_social_filename: string | null
    doc_autonomo_url: string | null
    doc_autonomo_filename: string | null
    documents_submitted_at: string | null
}

export default function VerificationsPage() {
    const [verifications, setVerifications] = useState<Verification[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchVerifications()
    }, [])

    const fetchVerifications = async () => {
        try {
            const res = await fetch('/api/admin/verifications?status=submitted')
            if (res.ok) {
                const data = await res.json()
                setVerifications(data.verifications)
            }
        } catch (error) {
            console.error('Error fetching verifications:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar las verificaciones"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que quieres aprobar la verificación de ${name}?`)) {
            return
        }

        setProcessing(id)
        try {
            const res = await fetch(`/api/admin/verifications/${id}/approve`, {
                method: 'POST'
            })

            if (res.ok) {
                toast({
                    variant: "success",
                    title: "Verificación Aprobada",
                    description: `${name} ha sido verificado exitosamente`
                })
                fetchVerifications()
            } else {
                throw new Error('Failed to approve')
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo aprobar la verificación"
            })
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (id: string, name: string) => {
        if (!rejectionReason.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Debes proporcionar una razón para el rechazo"
            })
            return
        }

        setProcessing(id)
        try {
            const res = await fetch(`/api/admin/verifications/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason })
            })

            if (res.ok) {
                toast({
                    variant: "success",
                    title: "Verificación Rechazada",
                    description: `La verificación de ${name} ha sido rechazada`
                })
                setShowRejectModal(null)
                setRejectionReason("")
                fetchVerifications()
            } else {
                throw new Error('Failed to reject')
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo rechazar la verificación"
            })
        } finally {
            setProcessing(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
                        ← Volver al Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Verificaciones Pendientes</h1>
                    <p className="text-muted-foreground mt-2">
                        Revisa y aprueba los documentos de verificación de freelancers
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pendientes</p>
                                    <p className="text-3xl font-bold text-foreground">{verifications.length}</p>
                                </div>
                                <FileText className="h-12 w-12 text-orange-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Verifications List */}
                {verifications.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No hay verificaciones pendientes
                            </h3>
                            <p className="text-muted-foreground">
                                Todas las solicitudes han sido procesadas
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {verifications.map((verification) => (
                            <Card key={verification.id} className="border-l-4 border-l-orange-500">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">
                                                {verification.first_name} {verification.last_name}
                                            </CardTitle>
                                            <CardDescription className="mt-2 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    {verification.email}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {verification.country}
                                                </div>
                                                {verification.documents_submitted_at && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        Enviado: {new Date(verification.documents_submitted_at).toLocaleDateString('es-ES')}
                                                    </div>
                                                )}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/20">
                                            Pendiente
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Documents */}
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3">Documentos:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {verification.doc_hacienda_url && (
                                                <a
                                                    href={verification.doc_hacienda_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                                                >
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground">Hacienda</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {verification.doc_hacienda_filename}
                                                        </p>
                                                    </div>
                                                    <Download className="h-4 w-4 text-muted-foreground" />
                                                </a>
                                            )}
                                            {verification.doc_seguridad_social_url && (
                                                <a
                                                    href={verification.doc_seguridad_social_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                                                >
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground">Seg. Social</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {verification.doc_seguridad_social_filename}
                                                        </p>
                                                    </div>
                                                    <Download className="h-4 w-4 text-muted-foreground" />
                                                </a>
                                            )}
                                            {verification.doc_autonomo_url && (
                                                <a
                                                    href={verification.doc_autonomo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                                                >
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground">Alta Autónomo</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {verification.doc_autonomo_filename}
                                                        </p>
                                                    </div>
                                                    <Download className="h-4 w-4 text-muted-foreground" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {showRejectModal === verification.id ? (
                                        <div className="space-y-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                            <label className="text-sm font-medium text-foreground">
                                                Razón del rechazo:
                                            </label>
                                            <Textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Explica por qué se rechaza la verificación..."
                                                className="min-h-[100px]"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleReject(verification.id, `${verification.first_name} ${verification.last_name}`)}
                                                    disabled={processing === verification.id || !rejectionReason.trim()}
                                                    variant="destructive"
                                                >
                                                    {processing === verification.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Rechazando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Confirmar Rechazo
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setShowRejectModal(null)
                                                        setRejectionReason("")
                                                    }}
                                                    variant="outline"
                                                    disabled={processing === verification.id}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => handleApprove(verification.id, `${verification.first_name} ${verification.last_name}`)}
                                                disabled={processing === verification.id}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {processing === verification.id ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Aprobando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Aprobar
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => setShowRejectModal(verification.id)}
                                                disabled={processing === verification.id}
                                                variant="destructive"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Rechazar
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
