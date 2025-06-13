/**
 * Performance monitoring utility for tracking execution time of critical paths
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.enabled = process.env.ENABLE_PERFORMANCE_MONITORING === 'true';
    this.logThreshold = process.env.PERFORMANCE_LOG_THRESHOLD || 100; // ms
  }

  /**
   * Starts timing for a specific operation
   * @param {string} operationName - Name of the operation to time
   * @returns {Function} - Function to call when operation is complete
   */
  startTimer(operationName) {
    if (!this.enabled) return () => {}; // No-op if monitoring disabled
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Store the metric
      if (!this.metrics[operationName]) {
        this.metrics[operationName] = {
          calls: 0,
          totalDuration: 0,
          maxDuration: 0,
          minDuration: Infinity
        };
      }
      
      const metric = this.metrics[operationName];
      metric.calls++;
      metric.totalDuration += duration;
      metric.maxDuration = Math.max(metric.maxDuration, duration);
      metric.minDuration = Math.min(metric.minDuration, duration);
      
      // Log slow operations
      if (duration > this.logThreshold) {
        console.warn(`[Performance] Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
      }
    };
  }
  
  /**
   * Wraps a function with performance monitoring
   * @param {Function} fn - Function to monitor
   * @param {string} operationName - Name of the operation
   * @returns {Function} - Wrapped function
   */
  monitor(fn, operationName) {
    if (!this.enabled) return fn; // Return original function if monitoring disabled
    
    return (...args) => {
      const endTimer = this.startTimer(operationName);
      try {
        const result = fn(...args);
        // Handle promises
        if (result instanceof Promise) {
          return result.finally(endTimer);
        }
        endTimer();
        return result;
      } catch (error) {
        endTimer();
        throw error;
      }
    };
  }
  
  /**
   * Gets performance metrics for all monitored operations
   * @returns {Object} - Performance metrics
   */
  getMetrics() {
    return Object.entries(this.metrics).map(([name, data]) => ({
      name,
      calls: data.calls,
      avgDuration: data.totalDuration / data.calls,
      maxDuration: data.maxDuration,
      minDuration: data.minDuration === Infinity ? 0 : data.minDuration,
      totalDuration: data.totalDuration
    }));
  }
  
  /**
   * Prints performance metrics to console
   */
  printMetrics() {
    if (!this.enabled) return;
    
    console.log('\n=== Performance Metrics ===');
    const metrics = this.getMetrics();
    metrics.sort((a, b) => b.totalDuration - a.totalDuration);
    
    metrics.forEach(metric => {
      console.log(`${metric.name}:`);
      console.log(`  Calls: ${metric.calls}`);
      console.log(`  Avg: ${metric.avgDuration.toFixed(2)}ms`);
      console.log(`  Min: ${metric.minDuration.toFixed(2)}ms`);
      console.log(`  Max: ${metric.maxDuration.toFixed(2)}ms`);
      console.log(`  Total: ${metric.totalDuration.toFixed(2)}ms`);
    });
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

export { performanceMonitor }; 