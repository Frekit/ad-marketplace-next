"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Calculator } from "lucide-react"
import { calculateInvoiceTotals, formatCurrency, SUPPORTED_COUNTRIES } from "@/lib/invoice-utils"

type Project = {
    id: string
    title: string
    milestones: Array<{
        id: number
        name: string
        amount: number
        status: string
    }>
}

export default function CreateInvoicePage({ params }: { params: { id: string; milestoneIndex: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [project, setProject] = useState<Project | null>(null)
    const [pdfFile, setPdfFile] = useState<File | null>(null)

    // Form data
    const [legalName, setLegalName] = useState("")
    const [taxId, setTaxId] = useState("")
    const [address, setAddress] = useState("")
    const [postalCode, setPostalCode] = useState("")
    const [city, setCity] = useState("")
    const [country, setCountry] = useState("ES")
    const [iban, setIban] = useState("")
    const [swiftBic, setSwiftBic] = useState("")
    const [irpfRate, setIrpfRate] = useState(15)
    const [description, setDescription] = useState("")

    const milestoneIdx = parseInt(params.milestoneIndex)
    const milestone = project?.milestones?.[milestoneIdx]
    const baseAmount = milestone?.amount || 0

    // Calculate totals
    const calculation = calculateInvoiceTotals(baseAmount, country, irpfRate)

    useEffect(() => {
        fetchProjectAndProfile()
    }, [params.id])

    const fetchProjectAndProfile = async () => {
        try {
            const [projectRes, profileRes] = await Promise.all([
                fetch(`/api/freelancer/projects/${params.id}`),
                fetch(`/api/freelancer/profile`)
            ])

            if (projectRes.ok) {
                const data = await projectRes.json()
                setProject(data.project)
                setDescription(`Servicios profesionales - ${data.project.title} - Hito ${milestoneIdx + 1}`)
            }

            if (profileRes.ok) {
                const profile = await profileRes.json()
                setLegalName(profile.legal_name || "")
                setTaxId(profile.tax_id || "")
                setAddress(profile.address || "")
                setPostalCode(profile.postal_code || "")
                setCity(profile.city || "")
                setCountry(profile.country || "ES")
                setIban(profile.default_iban || "")
                setSwiftBic(profile.default_swift_bic || "")
                setIrpfRate(profile.default_irpf_rate || 15)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'application/pdf') {
            setPdfFile(file)
            setError("")
        } else {
            setError("Por favor selecciona un archivo PDF válido")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!pdfFile) {
            setError("Debes subir el PDF de la factura")
            return
        }

        setSubmitting(true)

        try {
            // Upload PDF to Supabase Storage
            const formData = new FormData()
            formData.append('file', pdfFile)
            formData.append('projectId', params.id)
            formData.append('milestoneIndex', params.milestoneIndex)

            const uploadRes = await fetch('/api/invoices/upload', {
                method: 'POST',
                body: formData,
            })

            if (!uploadRes.ok) {
                throw new Error('Error al subir el PDF')
            }

            const { pdfUrl, pdfFilename } = await uploadRes.json()

            // Create invoice
            const invoiceData = {
                projectId: params.id,
                milestoneIndex: milestoneIdx,
                legalName,
                taxId,
                address,
                postalCode,
                city,
                country,
                description,
                iban,
                swiftBic,
                pdfUrl,
                pdfFilename,
                ...calculation
            }

            const res = await fetch('/api/freelancer/invoices/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al crear la factura')
            }

            alert('¡Factura enviada correctamente! Será revisada por el equipo.')
            router.push('/freelancer/invoices')
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

    if (!project || !milestone) {
        return (
            <FreelancerLayout>
                <div className="p-8">
                    <Card className="p-8 text-center">
                        <p className="text-red-600 mb-4">Proyecto o hito no encontrado</p>
                        <Button onClick={() => router.back()}>Volver</Button>
                    </Card>
                </div>
            </FreelancerLayout>
        )
    }

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Crear Factura</h1>
                        <p className="text-gray-600 mt-1">
                            {project.title} - Hito {milestoneIdx + 1}: {milestone.name}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* PDF Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Subir Factura (PDF)</CardTitle>
                                <CardDescription>
                                    Sube el PDF de tu factura. Debe incluir todos los datos legales y fiscales.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="pdf-upload"
                                    />
                                    <label htmlFor="pdf-upload" className="cursor-pointer">
                                        {pdfFile ? (
                                            <div className="flex items-center justify-center gap-2 text-green-600">
                                                <FileText className="h-8 w-8" />
                                                <span className="font-medium">{pdfFile.name}</span>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-600">Click para seleccionar PDF</p>
                                                <p className="text-sm text-gray-500 mt-1">Máximo 10MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Legal Data */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Datos Legales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="legalName">Nombre/Razón Social *</Label>
                                        <Input
                                            id="legalName"
                                            value={legalName}
                                            onChange={(e) => setLegalName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="taxId">NIF/CIF/VAT Number *</Label>
                                        <Input
                                            id="taxId"
                                            value={taxId}
                                            onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección *</Label>
                                    <Input
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">Código Postal *</Label>
                                        <Input
                                            id="postalCode"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ciudad *</Label>
                                        <Input
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">País *</Label>
                                        <Select value={country} onValueChange={setCountry}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SUPPORTED_COUNTRIES.map(code => (
                                                    <SelectItem key={code} value={code}>{code}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Data */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Datos Financieros
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Base Imponible:</span>
                                        <span className="font-semibold">{formatCurrency(calculation.baseAmount)}</span>
                                    </div>
                                    {calculation.vatApplicable && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">IVA ({calculation.vatRate}%):</span>
                                            <span className="font-semibold">+{formatCurrency(calculation.vatAmount)}</span>
                                        </div>
                                    )}
                                    {calculation.reverseCharge && (
                                        <div className="flex justify-between text-blue-600">
                                            <span>IVA (Inversión del sujeto pasivo):</span>
                                            <span>€0.00</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-semibold">{formatCurrency(calculation.subtotal)}</span>
                                    </div>
                                    {calculation.irpfApplicable && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="irpfRate">IRPF (Retención) %</Label>
                                                <Input
                                                    id="irpfRate"
                                                    type="number"
                                                    step="0.01"
                                                    value={irpfRate}
                                                    onChange={(e) => setIrpfRate(parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="flex justify-between text-red-600">
                                                <span>IRPF ({calculation.irpfRate}%):</span>
                                                <span>-{formatCurrency(calculation.irpfAmount)}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between border-t-2 pt-2 text-lg">
                                        <span className="font-bold">Total a Transferir:</span>
                                        <span className="font-bold text-[#0F4C5C]">{formatCurrency(calculation.totalAmount)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción *</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bank Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Datos Bancarios</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="iban">IBAN *</Label>
                                    <Input
                                        id="iban"
                                        value={iban}
                                        onChange={(e) => setIban(e.target.value.toUpperCase())}
                                        placeholder="ES00 0000 0000 0000 0000 0000"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="swiftBic">SWIFT/BIC</Label>
                                    <Input
                                        id="swiftBic"
                                        value={swiftBic}
                                        onChange={(e) => setSwiftBic(e.target.value.toUpperCase())}
                                        placeholder="BBVAESMM"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !pdfFile}
                                className="flex-1 bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                            >
                                {submitting ? 'Enviando...' : 'Enviar Factura'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </FreelancerLayout>
    )
}
