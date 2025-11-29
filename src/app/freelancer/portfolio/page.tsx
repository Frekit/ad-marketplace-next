"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import PortfolioGrid from "@/components/portfolio/portfolio-grid"
import PortfolioUploadForm from "@/components/portfolio/portfolio-upload-form"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function FreelancerPortfolioPage() {
    const router = useRouter()
    const [showUploadForm, setShowUploadForm] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)

    // Check authentication and role
    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch('/api/auth/session')
                if (!res.ok) {
                    router.push('/sign-in')
                    return
                }

                const session = await res.json()

                // Only freelancers can access this page
                if (session.user.role !== 'freelancer') {
                    router.push('/dashboard/client')
                    return
                }

                setAuthorized(true)
            } catch (error) {
                console.error('Auth check failed:', error)
                router.push('/sign-in')
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [router])

    const handleUploadSuccess = () => {
        setShowUploadForm(false)
        setRefreshKey(prev => prev + 1) // Trigger grid refresh
    }

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FF5C5C]" />
                </div>
            </div>
        )
    }

    // Don't render if not authorized (will redirect)
    if (!authorized) {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Mi Portfolio</h1>
                    <p className="text-muted-foreground mt-1">
                        Muestra tus mejores trabajos (máximo 3 imágenes por caso)
                    </p>
                </div>
                <Button onClick={() => setShowUploadForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Caso
                </Button>
            </div>

            {/* Portfolio Grid */}
            <PortfolioGrid key={refreshKey} />

            {/* Upload Dialog */}
            <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Agregar Caso de Estudio</DialogTitle>
                    </DialogHeader>
                    <PortfolioUploadForm onSuccess={handleUploadSuccess} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
