import { StateStorage } from 'zustand/middleware';

export interface PersistenceOptions {
  name: string;
  version: number;
  migrate?: (persistedState: any, version: number) => any;
  serialize?: (state: any) => string;
  deserialize?: (str: string) => any;
}

export class LocalStoragePersistence implements StateStorage {
  private options: PersistenceOptions;

  constructor(options: PersistenceOptions) {
    this.options = options;
  }

  getItem(name: string): string | null | Promise<string | null> {
    try {
      const item = localStorage.getItem(name);
      if (!item) return null;

      const parsed = this.options.deserialize 
        ? this.options.deserialize(item) 
        : JSON.parse(item);

      // Handle version migration
      if (parsed.version !== this.options.version && this.options.migrate) {
        const migrated = this.options.migrate(parsed.state, parsed.version || 0);
        this.setItem(name, this.options.serialize 
          ? this.options.serialize({ state: migrated, version: this.options.version })
          : JSON.stringify({ state: migrated, version: this.options.version })
        );
        return this.options.serialize 
          ? this.options.serialize(migrated)
          : JSON.stringify(migrated);
      }

      return this.options.serialize 
        ? this.options.serialize(parsed.state)
        : JSON.stringify(parsed.state);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  setItem(name: string, value: string): void | Promise<void> {
    try {
      const parsed = this.options.deserialize 
        ? this.options.deserialize(value)
        : JSON.parse(value);

      const toStore = {
        state: parsed,
        version: this.options.version,
        timestamp: Date.now(),
      };

      localStorage.setItem(name, JSON.stringify(toStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  removeItem(name: string): void | Promise<void> {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
}

// Session recovery utilities
export const SessionRecovery = {
  saveSession: (sessionData: any, sessionId: string = 'default') => {
    try {
      const sessionKey = `financial-dashboard-session-${sessionId}`;
      const sessionInfo = {
        data: sessionData,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      localStorage.setItem(sessionKey, JSON.stringify(sessionInfo));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  loadSession: (sessionId: string = 'default') => {
    try {
      const sessionKey = `financial-dashboard-session-${sessionId}`;
      const sessionInfo = localStorage.getItem(sessionKey);
      
      if (!sessionInfo) return null;
      
      const parsed = JSON.parse(sessionInfo);
      
      // Check if session is not too old (24 hours)
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > twentyFourHours) {
        SessionRecovery.clearSession(sessionId);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  },

  clearSession: (sessionId: string = 'default') => {
    try {
      const sessionKey = `financial-dashboard-session-${sessionId}`;
      localStorage.removeItem(sessionKey);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  listSessions: () => {
    try {
      const sessions: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('financial-dashboard-session-')) {
          sessions.push(key.replace('financial-dashboard-session-', ''));
        }
      }
      return sessions;
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  },
};

// Dashboard configuration import/export
export const DashboardConfig = {
  export: (state: any) => {
    try {
      const config = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        appName: 'Financial Dashboard',
        data: {
          userPreferences: state.preferences,
          chartSettings: state.chartSettings,
          dashboardLayout: state.dashboardLayout,
        },
      };

      const blob = new Blob([JSON.stringify(config, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-dashboard-config-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Failed to export dashboard config:', error);
      return false;
    }
  },

  import: (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const config = JSON.parse(content);
          
          // Validate config structure
          if (!config.data || !config.version) {
            throw new Error('Invalid configuration file format');
          }

          resolve(config.data);
        } catch (error) {
          reject(new Error(`Failed to parse configuration file: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read configuration file'));
      };

      reader.readAsText(file);
    });
  },
};

// Storage size monitoring
export const StorageMonitor = {
  getUsage: () => {
    try {
      let totalSize = 0;
      let dashboardSize = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          const size = new Blob([value]).size;
          totalSize += size;
          
          if (key.startsWith('financial-dashboard')) {
            dashboardSize += size;
          }
        }
      }

      return {
        totalSize,
        dashboardSize,
        availableSize: 5 * 1024 * 1024, // Typical localStorage limit is 5MB
        usagePercentage: (totalSize / (5 * 1024 * 1024)) * 100,
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return null;
    }
  },

  cleanup: () => {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('financial-dashboard-session-')) {
          const sessionInfo = localStorage.getItem(key);
          if (sessionInfo) {
            const parsed = JSON.parse(sessionInfo);
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            if (parsed.timestamp < oneWeekAgo) {
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      return keysToRemove.length;
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
      return 0;
    }
  },
};