/**
 * Performance monitoring and debugging utilities
 * Helps track API performance, cache hits, and identify bottlenecks
 */

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: Date;
    status: 'success' | 'error';
    error?: string;
}

interface CacheMetric {
    endpoint: string;
    hits: number;
    misses: number;
    hitRate: number;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private cacheMetrics: Map<string, CacheMetric> = new Map();
    private readonly maxMetrics = 1000; // Keep last 1000 metrics
    private isDev = typeof window !== 'undefined' && process.env.NODE_ENV === 'development';

    /**
     * Track API call performance
     */
    async trackApiCall<T>(
        endpoint: string,
        fetchFn: () => Promise<T>,
        cacheKey?: string
    ): Promise<T> {
        const start = performance.now();

        try {
            const result = await fetchFn();
            const duration = performance.now() - start;

            this.recordMetric({
                name: endpoint,
                duration,
                timestamp: new Date(),
                status: 'success'
            });

            if (this.isDev && duration > 1000) {
                console.warn(`Slow API call: ${endpoint} took ${duration.toFixed(0)}ms`);
            }

            if (cacheKey) {
                this.recordCacheHit(cacheKey);
            }

            return result;
        } catch (error: any) {
            const duration = performance.now() - start;

            this.recordMetric({
                name: endpoint,
                duration,
                timestamp: new Date(),
                status: 'error',
                error: error.message
            });

            if (cacheKey) {
                this.recordCacheMiss(cacheKey);
            }

            throw error;
        }
    }

    /**
     * Record a performance metric
     */
    private recordMetric(metric: PerformanceMetric): void {
        this.metrics.push(metric);

        // Keep only last N metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }

        if (this.isDev) {
            console.debug(`[Performance] ${metric.name}: ${metric.duration.toFixed(0)}ms`);
        }
    }

    /**
     * Record cache hit
     */
    private recordCacheHit(endpoint: string): void {
        const metric = this.cacheMetrics.get(endpoint) || {
            endpoint,
            hits: 0,
            misses: 0,
            hitRate: 0
        };

        metric.hits++;
        metric.hitRate = Math.round((metric.hits / (metric.hits + metric.misses)) * 100);
        this.cacheMetrics.set(endpoint, metric);

        if (this.isDev) {
            console.debug(`[Cache Hit] ${endpoint} (${metric.hitRate}% hit rate)`);
        }
    }

    /**
     * Record cache miss
     */
    private recordCacheMiss(endpoint: string): void {
        const metric = this.cacheMetrics.get(endpoint) || {
            endpoint,
            hits: 0,
            misses: 0,
            hitRate: 0
        };

        metric.misses++;
        metric.hitRate = Math.round((metric.hits / (metric.hits + metric.misses)) * 100);
        this.cacheMetrics.set(endpoint, metric);

        if (this.isDev) {
            console.debug(`[Cache Miss] ${endpoint} (${metric.hitRate}% hit rate)`);
        }
    }

    /**
     * Get performance summary
     */
    getMetricsSummary() {
        if (this.metrics.length === 0) {
            return {
                totalRequests: 0,
                averageResponseTime: 0,
                successRate: 0,
                slowestEndpoints: [],
                errorCount: 0
            };
        }

        const total = this.metrics.length;
        const errors = this.metrics.filter(m => m.status === 'error').length;
        const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / total;

        // Group by endpoint and calculate slowest
        const byEndpoint = new Map<string, PerformanceMetric[]>();
        this.metrics.forEach(m => {
            const current = byEndpoint.get(m.name) || [];
            current.push(m);
            byEndpoint.set(m.name, current);
        });

        const slowestEndpoints = Array.from(byEndpoint.entries())
            .map(([name, metrics]) => ({
                name,
                avgDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
                calls: metrics.length
            }))
            .sort((a, b) => b.avgDuration - a.avgDuration)
            .slice(0, 5);

        return {
            totalRequests: total,
            averageResponseTime: Math.round(avgDuration),
            successRate: Math.round(((total - errors) / total) * 100),
            slowestEndpoints,
            errorCount: errors
        };
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return Array.from(this.cacheMetrics.values())
            .sort((a, b) => b.hitRate - a.hitRate);
    }

    /**
     * Clear metrics
     */
    clear(): void {
        this.metrics = [];
        this.cacheMetrics.clear();
    }

    /**
     * Get all metrics (for debugging)
     */
    getAllMetrics() {
        return this.metrics;
    }

    /**
     * Log summary to console
     */
    logSummary(): void {
        const summary = this.getMetricsSummary();
        const cacheStats = this.getCacheStats();

        console.group('📊 Performance Metrics');
        console.table({
            'Total Requests': summary.totalRequests,
            'Avg Response Time': `${summary.averageResponseTime}ms`,
            'Success Rate': `${summary.successRate}%`,
            'Error Count': summary.errorCount
        });

        if (summary.slowestEndpoints.length > 0) {
            console.group('🐌 Slowest Endpoints');
            console.table(summary.slowestEndpoints);
            console.groupEnd();
        }

        if (cacheStats.length > 0) {
            console.group('💾 Cache Statistics');
            console.table(cacheStats);
            console.groupEnd();
        }

        console.groupEnd();
    }
}

// Export singleton
export const monitor = new PerformanceMonitor();

/**
 * Wrapper function for tracked API calls
 */
export async function trackedFetch<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    cacheKey?: string
): Promise<T> {
    return monitor.trackApiCall(endpoint, fetchFn, cacheKey);
}

/**
 * Simple timing function
 */
export function measureTime(name: string, fn: () => void): number {
    const start = performance.now();
    fn();
    const duration = performance.now() - start;
    console.debug(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
}

/**
 * Async timing function
 */
export async function measureTimeAsync<T>(
    name: string,
    fn: () => Promise<T>
): Promise<[T, number]> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    console.debug(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return [result, duration];
}
