/**
 * Storage Quota Management Utility
 * Handles localStorage quota monitoring and cleanup for the Financial Dashboard
 */

export class StorageQuotaManager {
  private static readonly QUOTA_THRESHOLD = 0.85; // 85% usage threshold
  private static readonly STORAGE_KEY = 'financial-dashboard-storage-info';

  /**
   * Check current storage quota usage
   */
  static async checkQuota(): Promise<{ usage: number; quota: number; usagePercentage: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const usagePercentage = quota > 0 ? usage / quota : 0;
        
        return { usage, quota, usagePercentage };
      }
    } catch (error) {
      console.warn('Storage estimate not available:', error);
    }
    
    // Fallback: estimate localStorage usage
    return this.estimateLocalStorageUsage();
  }

  /**
   * Estimate localStorage usage when StorageManager API is not available
   */
  private static estimateLocalStorageUsage(): { usage: number; quota: number; usagePercentage: number } {
    try {
      let totalSize = 0;
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += key.length + item.length;
          }
        }
      }
      
      // Convert to bytes (assuming UTF-16 encoding)
      const usage = totalSize * 2;
      
      // Typical localStorage quota is 5-10MB, we'll assume 5MB
      const quota = 5 * 1024 * 1024; // 5MB
      const usagePercentage = usage / quota;
      
      return { usage, quota, usagePercentage };
    } catch (error) {
      console.warn('Could not estimate localStorage usage:', error);
      return { usage: 0, quota: 0, usagePercentage: 0 };
    }
  }

  /**
   * Check if cleanup is needed based on usage threshold
   */
  static async needsCleanup(threshold = this.QUOTA_THRESHOLD): Promise<boolean> {
    const { usagePercentage } = await this.checkQuota();
    return usagePercentage > threshold;
  }

  /**
   * Perform storage cleanup to free up space
   */
  static async cleanup(threshold = this.QUOTA_THRESHOLD): Promise<void> {
    try {
      const { usagePercentage } = await this.checkQuota();
      
      if (usagePercentage <= threshold) {
        return; // No cleanup needed
      }

      console.log(`Storage usage at ${(usagePercentage * 100).toFixed(1)}%, performing cleanup...`);

      // Step 1: Clear old performance history (least important data)
      this.clearOldPerformanceData();

      // Step 2: Clear old error history
      this.clearOldErrorHistory();

      // Step 3: Clear cached file data if still over threshold
      const newQuota = await this.checkQuota();
      if (newQuota.usagePercentage > threshold) {
        this.clearTemporaryData();
      }

      // Step 4: Record cleanup event
      this.recordCleanupEvent();

      console.log('Storage cleanup completed');
    } catch (error) {
      console.error('Storage cleanup failed:', error);
    }
  }

  /**
   * Clear old performance history data
   */
  private static clearOldPerformanceData(): void {
    try {
      const storeData = localStorage.getItem('financial-dashboard-store');
      if (storeData) {
        const parsedData = JSON.parse(storeData);
        if (parsedData.state && parsedData.state.performanceHistory) {
          // Keep only the last 10 performance entries
          parsedData.state.performanceHistory = parsedData.state.performanceHistory.slice(-10);
          localStorage.setItem('financial-dashboard-store', JSON.stringify(parsedData));
        }
      }
    } catch (error) {
      console.warn('Could not clear old performance data:', error);
    }
  }

  /**
   * Clear old error history
   */
  private static clearOldErrorHistory(): void {
    try {
      const storeData = localStorage.getItem('financial-dashboard-store');
      if (storeData) {
        const parsedData = JSON.parse(storeData);
        if (parsedData.state && parsedData.state.errorHistory) {
          // Keep only the last 5 error entries
          parsedData.state.errorHistory = parsedData.state.errorHistory.slice(-5);
          localStorage.setItem('financial-dashboard-store', JSON.stringify(parsedData));
        }
      }
    } catch (error) {
      console.warn('Could not clear old error history:', error);
    }
  }

  /**
   * Clear temporary/cached data
   */
  private static clearTemporaryData(): void {
    try {
      // Remove any non-essential localStorage items
      const keysToRemove: string[] = [];
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          // Remove old session data or temporary cache
          if (key.startsWith('temp-') || key.startsWith('cache-') || key.includes('session-')) {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Could not clear temporary data:', error);
    }
  }

  /**
   * Record cleanup event for monitoring
   */
  private static recordCleanupEvent(): void {
    try {
      const cleanupInfo = {
        timestamp: Date.now(),
        type: 'storage-cleanup',
        reason: 'quota-threshold-exceeded'
      };
      
      localStorage.setItem(`cleanup-log-${Date.now()}`, JSON.stringify(cleanupInfo));
    } catch (error) {
      // Ignore cleanup logging errors
    }
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<{
    quota: { usage: number; quota: number; usagePercentage: number };
    itemCounts: { total: number; dashboardItems: number; otherItems: number };
    largestItems: Array<{ key: string; size: number }>;
  }> {
    const quota = await this.checkQuota();
    
    let total = 0;
    let dashboardItems = 0;
    let otherItems = 0;
    const itemSizes: Array<{ key: string; size: number }> = [];
    
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const item = localStorage.getItem(key);
          if (item) {
            const size = (key.length + item.length) * 2; // UTF-16 bytes
            itemSizes.push({ key, size });
            total++;
            
            if (key.includes('financial-dashboard')) {
              dashboardItems++;
            } else {
              otherItems++;
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not calculate storage stats:', error);
    }
    
    // Sort by size (largest first) and take top 10
    const largestItems = itemSizes
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    return {
      quota,
      itemCounts: { total, dashboardItems, otherItems },
      largestItems
    };
  }

  /**
   * Monitor storage usage and automatically cleanup if needed
   */
  static startStorageMonitoring(intervalMs = 60000): () => void {
    const monitor = async () => {
      try {
        if (await this.needsCleanup()) {
          await this.cleanup();
        }
      } catch (error) {
        console.error('Storage monitoring error:', error);
      }
    };

    // Initial check
    monitor();
    
    // Set up periodic monitoring
    const intervalId = setInterval(monitor, intervalMs);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  /**
   * Emergency storage clear (last resort)
   */
  static emergencyClear(): void {
    try {
      // Only clear non-essential items, preserve user preferences
      const essentialKeys = ['financial-dashboard-store'];
      const keysToRemove: string[] = [];
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && !essentialKeys.includes(key)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Emergency storage clear: removed ${keysToRemove.length} items`);
    } catch (error) {
      console.error('Emergency storage clear failed:', error);
    }
  }
}