import { Card } from "@/components/ui/card"

export function DashboardSkeleton() {
    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Profile Completion Alert Skeleton */}
                <Card className="bg-warning/10 border-warning p-6 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                        <div className="h-2 bg-muted rounded w-full"></div>
                    </div>
                </Card>

                {/* Welcome Section Skeleton */}
                <div className="flex items-center justify-between animate-pulse">
                    <div className="flex-1">
                        <div className="h-8 bg-muted rounded mb-2 w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 bg-muted rounded w-32"></div>
                        <div className="h-10 bg-muted rounded w-40"></div>
                    </div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6">
                            <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                            <div className="h-8 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded w-3/4"></div>
                        </Card>
                    ))}
                </div>

                {/* Earnings Section Skeleton */}
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4 w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="p-6">
                                <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                <div className="h-8 bg-muted rounded mb-2"></div>
                                <div className="h-3 bg-muted rounded w-3/4"></div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Proposals Section Skeleton */}
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4 w-1/4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                        <div className="h-3 bg-muted rounded w-1/3"></div>
                                    </div>
                                    <div className="h-6 bg-muted rounded w-20"></div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Milestones Section Skeleton */}
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4 w-1/4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                        <div className="h-3 bg-muted rounded w-1/3 mb-2"></div>
                                        <div className="h-3 bg-muted rounded w-1/4"></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="h-6 bg-muted rounded mb-2 w-20"></div>
                                        <div className="h-6 bg-muted rounded w-16"></div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
