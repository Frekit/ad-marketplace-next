"use client"

import { useState, useEffect } from "react"
import PortfolioItemCard from "./portfolio-item-card"
import { Loader2 } from "lucide-react"

interface PortfolioItem {
    id: string
    title: string
    description: string
    client_name?: string
    project_url?: string
    year?: number
    portfolio_media: Array<{
        id: string
        media_url: string
        display_order: number
    }>
}

interface PortfolioGridProps {
    freelancerId?: string
    featured?: boolean
    onItemClick?: (item: PortfolioItem) => void
}

export default function PortfolioGrid({ freelancerId, featured, onItemClick }: PortfolioGridProps) {
    const [items, setItems] = useState<PortfolioItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchPortfolio()
    }, [freelancerId, featured])

    const fetchPortfolio = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()

            if (freelancerId) params.append('freelancer_id', freelancerId)
            if (featured) params.append('featured', 'true')

            const response = await fetch(`/api/portfolio?${params}`)

            if (!response.ok) throw new Error('Failed to fetch portfolio')

            const data = await response.json()
            setItems(data.items || [])
        } catch (err: any) {
            console.error('Error fetching portfolio:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">
                    No hay casos de estudio todavía
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <PortfolioItemCard
                    key={item.id}
                    item={item}
                    onClick={() => onItemClick?.(item)}
                />
            ))}
        </div>
    )
}
