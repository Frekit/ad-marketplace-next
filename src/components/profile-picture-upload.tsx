"use client"

import { useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { Upload, X, Loader2, Check } from "lucide-react"
import Image from "next/image"

interface ProfilePictureUploadProps {
    userId: string
    currentAvatarUrl?: string
    onUploadComplete?: (url: string) => void
}

export default function ProfilePictureUpload({
    userId,
    currentAvatarUrl,
    onUploadComplete
}: ProfilePictureUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = useMemo(() => createClient(), [])

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
            setError("Solo se permiten archivos JPG, PNG o WebP")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("El archivo debe ser menor a 5MB")
            return
        }

        // Show preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to Supabase Storage
        await uploadFile(file)
    }

    const uploadFile = async (file: File) => {
        setUploading(true)
        setError("")
        setSuccess(false)

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update user record via API endpoint
            const updateRes = await fetch('/api/freelancer/profile/avatar', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_url: publicUrl })
            })

            if (!updateRes.ok) {
                const errorData = await updateRes.json()
                throw new Error(errorData.error || 'Failed to update avatar')
            }

            setSuccess(true)
            onUploadComplete?.(publicUrl)

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)

        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'Error al subir la imagen')
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) {
            const fakeEvent = {
                target: { files: [file] }
            } as any
            handleFileSelect(fakeEvent)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    return (
        <div className="space-y-4">
            {/* Preview or Upload Area */}
            {preview ? (
                <div className="relative">
                    <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <Image
                            src={preview}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <button
                        onClick={handleRemove}
                        className="absolute top-0 right-1/2 translate-x-20 -translate-y-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        disabled={uploading}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-8 flex items-center justify-center bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors h-32"
                >
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                            <Upload className="h-6 w-6" />
                        </div>
                        <span className="font-medium">Arrastra y suelta tu archivo aquí</span>
                    </div>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload button */}
            {preview && !currentAvatarUrl && (
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                    variant="outline"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            Cambiar imagen
                        </>
                    )}
                </Button>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Success message */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    ¡Imagen subida correctamente!
                </div>
            )}

            {/* Guidelines */}
            <div className="text-sm text-muted-foreground space-y-1">
                <p>Formato: <span className="font-medium">JPEG, PNG, WebP</span></p>
                <p>Dimensiones: <span className="font-medium">400×400px mínimo</span></p>
                <p>Peso: <span className="font-medium">5MB máximo</span></p>
            </div>

            <div className="text-sm text-muted-foreground space-y-2 pt-2">
                <p className="font-medium text-foreground">Recuerda:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>solo tú en la foto</li>
                    <li>mira directamente a la cámara</li>
                    <li>no uses gafas de sol</li>
                </ul>
            </div>
        </div>
    )
}
