"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react"

type VerificationStatus = 'pending' | 'submitted' | 'approved' | 'rejected'

type DocumentStatus = {
    verification_status: VerificationStatus
    verification_notes: string | null
    doc_hacienda_url: string | null
    doc_hacienda_filename: string | null
    doc_seguridad_social_url: string | null
    doc_seguridad_social_filename: string | null
    doc_autonomo_url: string | null
    doc_autonomo_filename: string | null
    country: string
}

export default function FreelancerVerificationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [status, setStatus] = useState<DocumentStatus | null>(null)

    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/freelancer/verification/status')
            if (res.ok) {
                const data = await res.json()
                setStatus(data)
            }
        } catch (error) {
            console.error('Error fetching status:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (docType: string, file: File) => {
        setUploading(docType)
        setError("")

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('docType', docType)

            const res = await fetch('/api/freelancer/verification/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Error al subir el documento')
            }

            await fetchStatus()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUploading(null)
        }
    }

    const handleSubmitForReview = async () => {
        setSubmitting(true)
        setError("")

        try {
            const res = await fetch('/api/freelancer/verification/submit', {
                method: 'POST',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al enviar documentos')
            }

            alert('¡Documentos enviados para revisión! Te notificaremos cuando sean aprobados.')
            await fetchStatus()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <FreelancerLayout>
                <div className="p-8 flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C5C]"></div>
                </div>
            </FreelancerLayout>
        )
    }

    const isSpanish = status?.country === 'ES'
    const allDocsUploaded = status?.doc_hacienda_url && status?.doc_seguridad_social_url && status?.doc_autonomo_url
    const canSubmit = isSpanish && allDocsUploaded && status?.verification_status === 'pending'

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Verificación de Documentos</h1>
                        <p className="text-gray-600 mt-1">
                            Sube los documentos requeridos para poder facturar en la plataforma
                        </p>
                    </div>

                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Estado de Verificación</CardTitle>
                                <Badge className={
                                    status?.verification_status === 'approved' ? 'bg-green-100 text-green-700' :
                                        status?.verification_status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                            status?.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                }>
                                    {status?.verification_status === 'approved' ? 'Aprobado' :
                                        status?.verification_status === 'submitted' ? 'En Revisión' :
                                            status?.verification_status === 'rejected' ? 'Rechazado' :
                                                'Pendiente'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {status?.verification_status === 'approved' && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Tus documentos han sido aprobados. Puedes facturar sin restricciones.</span>
                                </div>
                            )}
                            {status?.verification_status === 'submitted' && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Clock className="h-5 w-5" />
                                    <span>Tus documentos están siendo revisados. Te notificaremos pronto.</span>
                                </div>
                            )}
                            {status?.verification_status === 'rejected' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-5 w-5" />
                                        <span>Tus documentos han sido rechazados. Por favor, corrígelos y vuelve a enviarlos.</span>
                                    </div>
                                    {status?.verification_notes && (
                                        <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                                            <p className="text-sm text-red-700"><strong>Motivo:</strong> {status.verification_notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {status?.verification_status === 'pending' && !isSpanish && (
                                <div className="text-gray-600">
                                    <p>Como freelancer fuera de España, no necesitas subir documentos de verificación.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {isSpanish && (
                        <>
                            {/* Required Documents */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Documentos Requeridos (España)</CardTitle>
                                    <CardDescription>
                                        Necesitamos estos 3 documentos para verificar que puedes facturar legalmente
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Document 1: Hacienda */}
                                    <DocumentUploadSection
                                        title="1. Certificado de Hacienda"
                                        description="Certificado de estar al corriente de obligaciones tributarias"
                                        docType="hacienda"
                                        currentFile={status?.doc_hacienda_filename}
                                        currentUrl={status?.doc_hacienda_url}
                                        uploading={uploading === 'hacienda'}
                                        disabled={status?.verification_status === 'submitted' || status?.verification_status === 'approved'}
                                        onUpload={handleFileUpload}
                                    />

                                    {/* Document 2: Seguridad Social */}
                                    <DocumentUploadSection
                                        title="2. Certificado de Seguridad Social"
                                        description="Certificado de estar al corriente de pago con la Seguridad Social"
                                        docType="seguridad_social"
                                        currentFile={status?.doc_seguridad_social_filename}
                                        currentUrl={status?.doc_seguridad_social_url}
                                        uploading={uploading === 'seguridad_social'}
                                        disabled={status?.verification_status === 'submitted' || status?.verification_status === 'approved'}
                                        onUpload={handleFileUpload}
                                    />

                                    {/* Document 3: Alta Autónomo */}
                                    <DocumentUploadSection
                                        title="3. Alta de Autónomo"
                                        description="Certificado de alta en el régimen especial de trabajadores autónomos (RETA)"
                                        docType="autonomo"
                                        currentFile={status?.doc_autonomo_filename}
                                        currentUrl={status?.doc_autonomo_url}
                                        uploading={uploading === 'autonomo'}
                                        disabled={status?.verification_status === 'submitted' || status?.verification_status === 'approved'}
                                        onUpload={handleFileUpload}
                                    />
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            {canSubmit && (
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">¿Todos los documentos subidos?</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Envía tus documentos para revisión. Normalmente tarda 24-48 horas.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleSubmitForReview}
                                                disabled={submitting}
                                                className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                                            >
                                                {submitting ? 'Enviando...' : 'Enviar para Revisión'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </div>
        </FreelancerLayout>
    )
}

function DocumentUploadSection({
    title,
    description,
    docType,
    currentFile,
    currentUrl,
    uploading,
    disabled,
    onUpload,
}: {
    title: string
    description: string
    docType: string
    currentFile: string | null
    currentUrl: string | null
    uploading: boolean
    disabled: boolean
    onUpload: (docType: string, file: File) => void
}) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'application/pdf') {
            onUpload(docType, file)
        } else {
            alert('Por favor selecciona un archivo PDF válido')
        }
    }

    return (
        <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-600 mb-3">{description}</p>

            {currentFile ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{currentFile}</span>
                    </div>
                    {currentUrl && (
                        <a
                            href={currentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Ver documento
                        </a>
                    )}
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={disabled || uploading}
                        className="hidden"
                        id={`upload-${docType}`}
                    />
                    <label htmlFor={`upload-${docType}`} className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
                        {uploading ? (
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                                <span>Subiendo...</span>
                            </div>
                        ) : (
                            <div>
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">Click para seleccionar PDF</p>
                            </div>
                        )}
                    </label>
                </div>
            )}
        </div>
    )
}
