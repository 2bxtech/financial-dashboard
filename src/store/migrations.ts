/**
 * Store Migration Utilities
 * Handles versioning and migration of store state between application updates
 */

import { AppStore } from '../store/types';

export interface MigrationContext {
  version: number;
  timestamp: number;
  userAgent: string;
  previousVersion?: number;
}

export type MigrationFunction = (state: any, context: MigrationContext) => any;

/**
 * Migration definitions for each version
 */
export const migrations: Record<number, MigrationFunction> = {
  // Version 0: Initial version (no migration needed)
  0: (state: any) => state,

  // Version 1: Add user preferences with defaults
  1: (state: any, context: MigrationContext) => {
    return {
      ...state,
      preferences: state.preferences || {
        theme: 'light',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/dd/yyyy',
        numberFormat: 'US',
        autoSave: true,
        showWelcome: true,
        enableAnimations: true,
        compactMode: false,
        showTooltips: true,
      },
      // Ensure chart settings exist
      chartSettings: state.chartSettings || {
        type: 'line',
        showGrid: true,
        showLegend: true,
        showTooltips: true,
        colors: ['#8884d8', '#82ca9d', '#ffc658'],
        animations: true,
      },
      // Ensure dashboard layout exists
      dashboardLayout: state.dashboardLayout || {
        components: {
          fileUploader: { visible: true, order: 0 },
          chartContainer: { visible: true, order: 1 },
          dataPreview: { visible: true, order: 2 },
          metricsPanel: { visible: true, order: 3 },
        },
        layout: 'grid',
        sidebarPosition: 'left',
      },
    };
  },

  // Version 2: Add processing metrics tracking
  2: (state: any, context: MigrationContext) => {
    return {
      ...state,
      // Initialize metrics if not present
      totalFilesProcessed: state.totalFilesProcessed || 0,
      totalProcessingTime: state.totalProcessingTime || 0,
      averageProcessingTime: state.averageProcessingTime || 0,
      successfulUploads: state.successfulUploads || 0,
      failedUploads: state.failedUploads || 0,
      performanceHistory: state.performanceHistory || [],
      // Add migration marker
      _migrationHistory: [
        ...(state._migrationHistory || []),
        {
          version: 2,
          timestamp: context.timestamp,
          changes: ['Added processing metrics tracking']
        }
      ]
    };
  },

  // Version 3: Enhanced error handling and circuit breaker
  3: (state: any, context: MigrationContext) => {
    return {
      ...state,
      // Initialize error state if not present
      errorHistory: state.errorHistory || [],
      circuitBreakerState: state.circuitBreakerState || {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
      },
      // Update migration history
      _migrationHistory: [
        ...(state._migrationHistory || []),
        {
          version: 3,
          timestamp: context.timestamp,
          changes: ['Enhanced error handling', 'Added circuit breaker']
        }
      ]
    };
  },

  // Version 4: File comparison features
  4: (state: any, context: MigrationContext) => {
    return {
      ...state,
      // Initialize file comparison state
      comparisonFiles: state.comparisonFiles || [],
      activeComparison: state.activeComparison || null,
      // Update migration history
      _migrationHistory: [
        ...(state._migrationHistory || []),
        {
          version: 4,
          timestamp: context.timestamp,
          changes: ['Added file comparison features']
        }
      ]
    };
  },
};

/**
 * Get the current store version
 */
export const getCurrentVersion = (): number => {
  return Math.max(...Object.keys(migrations).map(Number));
};

/**
 * Migrate store state to the latest version
 */
export const migrateStore = (state: any, fromVersion: number = 0): any => {
  const currentVersion = getCurrentVersion();
  
  if (fromVersion >= currentVersion) {
    return state; // No migration needed
  }

  console.log(`Migrating store from version ${fromVersion} to ${currentVersion}`);
  
  let migratedState = state;
  const context: MigrationContext = {
    version: currentVersion,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    previousVersion: fromVersion,
  };

  // Apply migrations sequentially
  for (let version = fromVersion + 1; version <= currentVersion; version++) {
    if (migrations[version]) {
      try {
        context.previousVersion = version - 1;
        context.version = version;
        migratedState = migrations[version](migratedState, context);
      } catch (error) {
        console.error(`Migration to version ${version} failed:`, error);
        // Continue with next migration to prevent total failure
      }
    }
  }

  // Mark the final version
  migratedState._version = currentVersion;
  migratedState._lastMigration = context.timestamp;

  return migratedState;
};

/**
 * Validate migrated state structure
 */
export const validateMigratedState = (state: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required top-level properties
  const requiredProperties = [
    'preferences',
    'chartSettings', 
    'dashboardLayout',
    'totalFilesProcessed',
    'successfulUploads',
    'failedUploads'
  ];

  for (const prop of requiredProperties) {
    if (!(prop in state)) {
      errors.push(`Missing required property: ${prop}`);
    }
  }

  // Validate preferences structure
  if (state.preferences) {
    const requiredPrefs = ['theme', 'language', 'currency'];
    for (const pref of requiredPrefs) {
      if (!(pref in state.preferences)) {
        errors.push(`Missing preference: ${pref}`);
      }
    }
  }

  // Validate chart settings
  if (state.chartSettings) {
    const requiredChartProps = ['type', 'showGrid', 'showLegend'];
    for (const prop of requiredChartProps) {
      if (!(prop in state.chartSettings)) {
        errors.push(`Missing chart setting: ${prop}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a backup of current state before migration
 */
export const createMigrationBackup = (state: any, version: number): void => {
  try {
    const backup = {
      state,
      version,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };
    
    const backupKey = `financial-dashboard-backup-v${version}-${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));
    
    // Clean up old backups (keep only the last 3)
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('financial-dashboard-backup-'))
      .sort()
      .reverse();
    
    if (backupKeys.length > 3) {
      backupKeys.slice(3).forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.warn('Could not create migration backup:', error);
  }
};

/**
 * Restore from backup if migration fails
 */
export const restoreFromBackup = (version?: number): any | null => {
  try {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('financial-dashboard-backup-'))
      .sort()
      .reverse();
    
    const targetKey = version 
      ? backupKeys.find(key => key.includes(`-v${version}-`))
      : backupKeys[0]; // Latest backup
    
    if (targetKey) {
      const backup = JSON.parse(localStorage.getItem(targetKey) || '{}');
      return backup.state;
    }
  } catch (error) {
    console.error('Could not restore from backup:', error);
  }
  
  return null;
};

/**
 * Dry run migration to test for issues
 */
export const testMigration = (state: any, fromVersion: number = 0): {
  success: boolean;
  migratedState?: any;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Test migration
    const migratedState = migrateStore(JSON.parse(JSON.stringify(state)), fromVersion);
    
    // Validate result
    const validation = validateMigratedState(migratedState);
    
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }
    
    // Check for data loss
    const originalKeys = Object.keys(state);
    const migratedKeys = Object.keys(migratedState);
    
    const lostKeys = originalKeys.filter(key => !migratedKeys.includes(key));
    if (lostKeys.length > 0) {
      warnings.push(`Potential data loss: ${lostKeys.join(', ')}`);
    }
    
    return {
      success: errors.length === 0,
      migratedState,
      errors,
      warnings
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Migration test failed: ${error}`],
      warnings
    };
  }
};

/**
 * Get migration information
 */
export const getMigrationInfo = () => {
  const currentVersion = getCurrentVersion();
  const availableVersions = Object.keys(migrations).map(Number).sort((a, b) => a - b);
  
  return {
    currentVersion,
    availableVersions,
    migrationCount: availableVersions.length - 1,
    canMigrate: (fromVersion: number) => fromVersion < currentVersion && fromVersion >= 0
  };
};