import FreelancerLayout from '@/components/layouts/FreelancerLayout';
import { SkeletonTable } from '@/components/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/skeleton';

export default function InvoicesLoading() {
    return (
        <FreelancerLayout>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <Skeleton className="h-9 w-48 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </div>

                    {/* Billing Data Section */}
                    <Card className="border-2 border-blue-200 bg-blue-50">
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-96" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white p-4 rounded-lg border border-blue-100 space-y-3">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-blue-100 space-y-3">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-8 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoices Table */}
                    <div className="bg-white rounded-lg shadow">
                        <SkeletonTable rows={5} />
                    </div>
                </div>
            </div>
        </FreelancerLayout>
    );
}
