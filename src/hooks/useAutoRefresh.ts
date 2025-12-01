import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
    interval?: number; // Interval in milliseconds (default: 30 seconds)
    enabled?: boolean; // Enable/disable auto refresh
    onRefresh: () => Promise<void>;
}

/**
 * Hook for automatic data refresh at specified intervals
 * Handles cleanup and graceful error handling
 *
 * @example
 * useAutoRefresh({
 *   interval: 30000, // 30 seconds
 *   onRefresh: async () => await fetchData(),
 *   enabled: true
 * });
 */
export function useAutoRefresh({
    interval = 30000,
    enabled = true,
    onRefresh
}: UseAutoRefreshOptions) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    const refresh = useCallback(async () => {
        // Prevent concurrent refreshes
        if (isRefreshingRef.current) {
            return;
        }

        try {
            isRefreshingRef.current = true;
            await onRefresh();
        } catch (error) {
            console.error('Error during auto-refresh:', error);
            // Silently fail - don't break the UI
        } finally {
            isRefreshingRef.current = false;
        }
    }, [onRefresh]);

    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Set up interval
        intervalRef.current = setInterval(refresh, interval);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [interval, enabled, refresh]);

    return {
        refresh,
        isRefreshing: isRefreshingRef.current
    };
}

/**
 * Hook for focus-based data refresh
 * Refreshes data when window regains focus
 *
 * @example
 * useFocusRefresh(async () => await fetchData());
 */
export function useFocusRefresh(onRefresh: () => Promise<void>) {
    useEffect(() => {
        const handleFocus = async () => {
            try {
                await onRefresh();
            } catch (error) {
                console.error('Error refreshing on focus:', error);
            }
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [onRefresh]);
}

/**
 * Hook combining both auto-refresh and focus-based refresh
 */
export function useDashboardRefresh(
    onRefresh: () => Promise<void>,
    autoRefreshInterval: number = 30000
) {
    const autoRefresh = useAutoRefresh({
        interval: autoRefreshInterval,
        enabled: true,
        onRefresh
    });

    useFocusRefresh(onRefresh);

    return autoRefresh;
}
