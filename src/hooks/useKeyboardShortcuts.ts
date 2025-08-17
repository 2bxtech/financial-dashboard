/**
 * Keyboard Shortcuts Hook for Financial Dashboard
 * Provides global keyboard shortcuts for undo/redo and other common actions
 */

import { useEffect } from 'react';
import { useUndo, useRedo } from '../store';

export interface KeyboardShortcutsOptions {
  enableUndoRedo?: boolean;
  enableSave?: boolean;
  enableRefresh?: boolean;
  customShortcuts?: Array<{
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description: string;
  }>;
}

/**
 * Hook to register global keyboard shortcuts
 */
export const useKeyboardShortcuts = (options: KeyboardShortcutsOptions = {}) => {
  const {
    enableUndoRedo = true,
    enableSave = true,
    enableRefresh = true,
    customShortcuts = []
  } = options;

  const undo = useUndo();
  const redo = useRedo();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const isModifier = ctrlKey || metaKey; // Support both Ctrl (Windows/Linux) and Cmd (Mac)

      // Undo/Redo shortcuts
      if (enableUndoRedo && isModifier && key.toLowerCase() === 'z') {
        event.preventDefault();
        
        if (shiftKey) {
          // Ctrl+Shift+Z or Cmd+Shift+Z = Redo
          redo();
        } else {
          // Ctrl+Z or Cmd+Z = Undo
          undo();
        }
        return;
      }

      // Redo alternative (Ctrl+Y / Cmd+Y)
      if (enableUndoRedo && isModifier && key.toLowerCase() === 'y' && !shiftKey) {
        event.preventDefault();
        redo();
        return;
      }

      // Save shortcut (Ctrl+S / Cmd+S)
      if (enableSave && isModifier && key.toLowerCase() === 's') {
        event.preventDefault();
        // Trigger save action (could be export or save state)
        console.log('Save shortcut triggered');
        return;
      }

      // Refresh/Reload shortcut (F5 or Ctrl+R / Cmd+R)
      if (enableRefresh && (key === 'F5' || (isModifier && key.toLowerCase() === 'r'))) {
        // Let the default refresh behavior happen, but could add custom logic here
        console.log('Refresh shortcut triggered');
        return;
      }

      // Custom shortcuts
      for (const shortcut of customShortcuts) {
        const matchesKey = key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = !shortcut.ctrlKey || (ctrlKey || metaKey);
        const matchesShift = !shortcut.shiftKey || shiftKey;
        const matchesAlt = !shortcut.altKey || altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, enableUndoRedo, enableSave, enableRefresh, customShortcuts]);
};

/**
 * Hook for component-specific keyboard shortcuts
 */
export const useLocalKeyboardShortcuts = (
  shortcuts: Array<{
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description: string;
  }>,
  elementRef?: React.RefObject<HTMLElement>
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const isModifier = ctrlKey || metaKey;

      for (const shortcut of shortcuts) {
        const matchesKey = key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = !shortcut.ctrlKey || isModifier;
        const matchesShift = !shortcut.shiftKey || shiftKey;
        const matchesAlt = !shortcut.altKey || altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          return;
        }
      }
    };

    const element = elementRef?.current || window;
    element.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      element.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [shortcuts, elementRef]);
};

/**
 * Predefined shortcut configurations
 */
export const ShortcutPresets = {
  /**
   * Dashboard shortcuts for common actions
   */
  dashboard: () => [
    {
      key: 'o',
      ctrlKey: true,
      action: () => {
        // Trigger file open dialog
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
        }
      },
      description: 'Open file'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        // Clear current data (new session)
        window.location.reload();
      },
      description: 'New session'
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals or reset state
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[aria-label="Close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        });
      },
      description: 'Close modals'
    }
  ],

  /**
   * Chart shortcuts for visualization controls
   */
  chart: () => [
    {
      key: '1',
      ctrlKey: true,
      action: () => console.log('Switch to line chart'),
      description: 'Switch to line chart'
    },
    {
      key: '2',
      ctrlKey: true,
      action: () => console.log('Switch to bar chart'),
      description: 'Switch to bar chart'
    },
    {
      key: '3',
      ctrlKey: true,
      action: () => console.log('Switch to area chart'),
      description: 'Switch to area chart'
    },
    {
      key: 'g',
      ctrlKey: true,
      action: () => console.log('Toggle grid'),
      description: 'Toggle grid'
    },
    {
      key: 'l',
      ctrlKey: true,
      action: () => console.log('Toggle legend'),
      description: 'Toggle legend'
    }
  ],

  /**
   * Development shortcuts (only in dev mode)
   */
  development: () => process.env.NODE_ENV === 'development' ? [
    {
      key: 'd',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Toggle dev tools or debug info
        console.log('Development shortcut triggered');
      },
      description: 'Toggle debug info'
    },
    {
      key: 'r',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Hard refresh
        window.location.reload();
      },
      description: 'Hard refresh'
    }
  ] : []
};

/**
 * Shortcut help utility
 */
export const getShortcutHelp = (shortcuts: Array<{
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
}>) => {
  return shortcuts.map(shortcut => {
    const keys: string[] = [];
    
    if (shortcut.ctrlKey) {
      keys.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl');
    }
    if (shortcut.shiftKey) {
      keys.push('Shift');
    }
    if (shortcut.altKey) {
      keys.push('Alt');
    }
    keys.push(shortcut.key.toUpperCase());
    
    return {
      combination: keys.join(' + '),
      description: shortcut.description
    };
  });
};

/**
 * Hook to display shortcut help
 */
export const useShortcutHelp = () => {
  const showHelp = () => {
    const basicShortcuts = [
      { key: 'z', ctrlKey: true, description: 'Undo' },
      { key: 'z', ctrlKey: true, shiftKey: true, description: 'Redo' },
      { key: 'y', ctrlKey: true, description: 'Redo' },
      { key: 's', ctrlKey: true, description: 'Save/Export' },
      { key: 'o', ctrlKey: true, description: 'Open file' },
      { key: 'n', ctrlKey: true, description: 'New session' },
      { key: 'Escape', description: 'Close modals' },
    ];

    const chartShortcuts = ShortcutPresets.chart();
    const allShortcuts = [...basicShortcuts, ...chartShortcuts];
    const dashboardShortcuts = getShortcutHelp(allShortcuts);

    console.table(dashboardShortcuts);
    
    return dashboardShortcuts;
  };

  return { showHelp };
};