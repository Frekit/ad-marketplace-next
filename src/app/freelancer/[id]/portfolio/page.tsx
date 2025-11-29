"use client"

import { useParams } from "next/navigation"
import PortfolioGrid from "@/components/portfolio/portfolio-grid"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FreelancerPublicPortfolioPage() {
    const params = useParams()
    const freelancerId = params.id as string

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/client/find-freelancers">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a búsqueda
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Portfolio del Freelancer</h1>
                    <p className="text-muted-foreground mt-1">
                        Casos de estudio y trabajos realizados
                    </p>
                </div>

                {/* Portfolio Grid */}
                <PortfolioGrid freelancerId={freelancerId} />
            </div>
        </div>
    )
}
