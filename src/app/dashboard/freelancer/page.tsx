import { auth } from '@/auth'
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import FreelancerDashboardContent from "@/components/dashboard/freelancer-dashboard-content"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Suspense } from "react"
import { redirect } from "next/navigation"

/**
 * Server-side fetched dashboard data
 * This runs on the server and caches the response
 */
async function getDashboardData() {
    try {
        // Fetch directly from API route on the server
        // This is more efficient than client-side fetch
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/freelancer/dashboard/overview`, {
            // Server-side fetch caching
            cache: 'force-cache', // Cache indefinitely
            next: {
                revalidate: 60 // Revalidate every 60 seconds (ISR)
            }
        })

        if (!response.ok) throw new Error('Failed to fetch dashboard')
        return await response.json()
    } catch (error) {
        console.error('Error fetching dashboard:', error)
        return null
    }
}

export default async function FreelancerDashboardPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'freelancer') {
        redirect('/sign-in')
    }

    // Fetch data on the server
    const dashboardData = await getDashboardData()

    if (!dashboardData) {
        redirect('/sign-in')
    }

    const userName = session.user.name || "Freelancer"

    return (
        <FreelancerLayout>
            {/* Suspense wrapper with skeleton fallback */}
            <Suspense fallback={<DashboardSkeleton />}>
                <FreelancerDashboardContent
                    initialData={dashboardData}
                    userName={userName}
                />
            </Suspense>
        </FreelancerLayout>
    )
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60; // Regenerate every 60 seconds
