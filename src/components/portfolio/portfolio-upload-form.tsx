"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Loader2, Check } from "lucide-react"
import { createClient } from "@/lib/supabase"
import Image from "next/image"

interface PortfolioUploadFormProps {
    onSuccess?: () => void
}

export default function PortfolioUploadForm({ onSuccess }: PortfolioUploadFormProps) {
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [clientName, setClientName] = useState("")
    const [projectUrl, setProjectUrl] = useState("")
    const [year, setYear] = useState("")

    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        // Max 3 images
        const remainingSlots = 3 - images.length
        const filesToAdd = files.slice(0, remainingSlots)

        if (files.length > remainingSlots) {
            setError(`Solo puedes subir ${remainingSlots} imágenes más (máximo 3 total)`)
            setTimeout(() => setError(""), 3000)
        }

        // Validate file types and sizes
        const validFiles = filesToAdd.filter(file => {
            if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
                setError("Solo se permiten archivos JPG, PNG o WebP")
                return false
            }
            if (file.size > 10 * 1024 * 1024) {
                setError("Las imágenes deben ser menores a 10MB")
                return false
            }
            return true
        })

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file)
        })

        setImages(prev => [...prev, ...validFiles])
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const uploadImages = async (): Promise<string[]> => {
        const uploadedUrls: string[] = []

        for (const file of images) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `portfolio/${fileName}`

            const { data, error } = await supabase.storage
                .from('portfolio-media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-media')
                .getPublicUrl(filePath)

            uploadedUrls.push(publicUrl)
        }

        return uploadedUrls
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) {
            setError("El título es obligatorio")
            return
        }

        if (images.length === 0) {
            setError("Debes subir al menos 1 imagen")
            return
        }

        setUploading(true)
        setError("")

        try {
            // Upload images to storage
            const mediaUrls = await uploadImages()

            // Create portfolio item
            const response = await fetch('/api/portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    client_name: clientName || null,
                    project_url: projectUrl || null,
                    year: year ? parseInt(year) : null,
                    media_urls: mediaUrls
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create portfolio item')
            }

            setSuccess(true)

            // Reset form
            setTitle("")
            setDescription("")
            setClientName("")
            setProjectUrl("")
            setYear("")
            setImages([])
            setImagePreviews([])

            setTimeout(() => {
                setSuccess(false)
                onSuccess?.()
            }, 2000)

        } catch (err: any) {
            console.error('Error creating portfolio item:', err)
            setError(err.message || 'Error al crear el caso de estudio')
        } finally {
            setUploading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nuevo Caso de Estudio</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Campaña de lanzamiento para marca X"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe el proyecto, objetivos y resultados..."
                            rows={4}
                        />
                    </div>

                    {/* Client Name */}
                    <div className="space-y-2">
                        <Label htmlFor="client">Cliente (opcional)</Label>
                        <Input
                            id="client"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Nombre del cliente o marca"
                        />
                    </div>

                    {/* Year and URL */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="year">Año</Label>
                            <Input
                                id="year"
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="2024"
                                min="2000"
                                max={new Date().getFullYear()}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">URL del proyecto</Label>
                            <Input
                                id="url"
                                type="url"
                                value={projectUrl}
                                onChange={(e) => setProjectUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label>Imágenes * (máximo 3)</Label>

                        {/* Preview grid */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                        <Image
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload button */}
                        {images.length < 3 && (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Subir imágenes ({images.length}/3)
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            ¡Caso de estudio creado correctamente!
                        </div>
                    )}

                    {/* Submit button */}
                    <Button
                        type="submit"
                        disabled={uploading || !title || images.length === 0}
                        className="w-full"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            'Crear Caso de Estudio'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
