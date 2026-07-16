import { GitHubSyncService } from './github';

export class SyncEngine {
  private static isSyncing = false;
  private static intervalId: any = null;

  /**
   * Starts a background polling sequence that monitors database deltas.
   * Runs every 5 minutes during browser idle periods.
   */
  public static startBackgroundSync(intervalMs = 300000) {
    if (this.intervalId) return;

    const performSync = () => {
      if (this.isSyncing) return;

      const execute = async () => {
        this.isSyncing = true;
        try {
          console.log('[SyncEngine] Starting scheduled background delta flush...');
          const report = await GitHubSyncService.syncPendingNotes();
          if (report.success > 0 || report.failed > 0) {
            console.log(`[SyncEngine] Sync run complete. Success: ${report.success}, Failed: ${report.failed}`);
          }
        } catch (error) {
          console.error('[SyncEngine] Background execution failed:', error);
        } finally {
          this.isSyncing = false;
        }
      };

      // Delegate execution to browser idle blocks to eliminate UI stuttering
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => execute(), { timeout: 10000 });
      } else {
        execute();
      }
    };

    // Run immediately on boot, then schedule standard intervals
    performSync();
    this.intervalId = setInterval(performSync, intervalMs);
  }

  /**
   * Safe teardown mechanics for Hot Module Replacement (HMR) or app logouts.
   */
  public static stopBackgroundSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[SyncEngine] Background synchronization disabled.');
    }
  }
}

