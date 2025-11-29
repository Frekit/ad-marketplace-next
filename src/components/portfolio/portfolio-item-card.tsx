"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

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

interface PortfolioItemCardProps {
    item: PortfolioItem
    onClick?: () => void
}

export default function PortfolioItemCard({ item, onClick }: PortfolioItemCardProps) {
    const [imageError, setImageError] = useState(false)

    // Get first image as thumbnail
    const thumbnail = item.portfolio_media
        ?.sort((a, b) => a.display_order - b.display_order)[0]?.media_url

    return (
        <Card
            className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {thumbnail && !imageError ? (
                    <Image
                        src={thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <span className="text-4xl font-bold text-muted-foreground/20">
                            {item.title[0]}
                        </span>
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                        Ver detalles
                    </span>
                </div>

                {/* Image count badge */}
                {item.portfolio_media && item.portfolio_media.length > 1 && (
                    <Badge className="absolute top-2 right-2 bg-black/60 text-white border-0">
                        {item.portfolio_media.length} imágenes
                    </Badge>
                )}
            </div>

            {/* Content */}
            <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                    </h3>
                    {item.year && (
                        <span className="text-sm text-muted-foreground shrink-0">
                            {item.year}
                        </span>
                    )}
                </div>

                {item.client_name && (
                    <p className="text-sm text-muted-foreground">
                        Cliente: <span className="font-medium text-foreground">{item.client_name}</span>
                    </p>
                )}

                {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                    </p>
                )}

                {item.project_url && (
                    <a
                        href={item.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Ver proyecto <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </CardContent>
        </Card>
    )
}
