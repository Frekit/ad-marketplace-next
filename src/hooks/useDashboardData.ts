import { useCallback } from 'react'

interface UseDashboardDataOptions {
    onSuccess?: (data: any) => void
    onError?: (error: Error) => void
}

/**
 * Custom hook for dashboard data fetching with SWR pattern
 * Uses Stale-While-Revalidate pattern for instant cached responses
 */
export function useDashboardData(options: UseDashboardDataOptions = {}) {
    const fetchDashboardData = useCallback(async () => {
        const startTime = performance.now()

        try {
            const response = await fetch('/api/freelancer/dashboard/overview', {
                method: 'GET',
                headers: {
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'max-age=60'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const data = await response.json()
            const loadTime = performance.now() - startTime

            // Log performance metrics
            const cacheStatus = response.headers.get('X-Cache') || 'UNKNOWN'
            const cacheAge = response.headers.get('X-Cache-Age') || '0s'

            console.log(
                `[Dashboard] ${cacheStatus} (Age: ${cacheAge}) - Load time: ${loadTime.toFixed(1)}ms`
            )

            if (options.onSuccess) {
                options.onSuccess(data)
            }

            return data
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error')
            console.error('[Dashboard] Error fetching data:', err)

            if (options.onError) {
                options.onError(err)
            }

            throw err
        }
    }, [options])

    return {
        fetchDashboardData,
        refreshData: fetchDashboardData // Alias for clarity
    }
}
