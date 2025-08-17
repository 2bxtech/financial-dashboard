import React, { useState } from 'react';
import { 
  usePreferences, 
  useChartSettings, 
  useDashboardLayout,
  useUndoStack,
  useRedoStack
} from '../store';
import { CommandHelpers } from '../store/commands';
import { UndoRedoControls } from './undo-redo-controls';

export const StoreDemo: React.FC = () => {
  const preferences = usePreferences();
  const chartSettings = useChartSettings();
  const dashboardLayout = useDashboardLayout();
  const undoStack = useUndoStack();
  const redoStack = useRedoStack();

  const [newTheme, setNewTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [newChartType, setNewChartType] = useState<'line' | 'bar' | 'area'>('line');

  const handleUpdateTheme = () => {
    CommandHelpers.handlePreferencesUpdate({ theme: newTheme });
  };

  const handleUpdateChartType = () => {
    CommandHelpers.handleChartSettingsUpdate({ chartType: newChartType });
  };

  const handleToggleDataPreview = () => {
    CommandHelpers.handleDashboardLayoutUpdate({ 
      showDataPreview: !dashboardLayout.showDataPreview 
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Zustand Store Demo with Undo/Redo</h2>
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Store Operations</h3>
          <UndoRedoControls />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Preferences Section */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">User Preferences</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Current Theme:</label>
                <div className="text-sm text-gray-600">{preferences.theme}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Change Theme:</label>
                <div className="flex space-x-2">
                  <select 
                    value={newTheme} 
                    onChange={(e) => setNewTheme(e.target.value as any)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                  <button
                    onClick={handleUpdateTheme}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <strong>Other Preferences:</strong><br />
                Currency: {preferences.currency}<br />
                Auto Save: {preferences.autoSave ? 'On' : 'Off'}<br />
                Compact Mode: {preferences.compactMode ? 'On' : 'Off'}
              </div>
            </div>
          </div>

          {/* Chart Settings Section */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Chart Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Current Chart Type:</label>
                <div className="text-sm text-gray-600">{chartSettings.chartType}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Change Chart Type:</label>
                <div className="flex space-x-2">
                  <select 
                    value={newChartType} 
                    onChange={(e) => setNewChartType(e.target.value as any)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="line">Line</option>
                    <option value="bar">Bar</option>
                    <option value="area">Area</option>
                  </select>
                  <button
                    onClick={handleUpdateChartType}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <strong>Other Settings:</strong><br />
                Show Grid: {chartSettings.showGrid ? 'Yes' : 'No'}<br />
                Show Legend: {chartSettings.showLegend ? 'Yes' : 'No'}<br />
                Theme: {chartSettings.theme}
              </div>
            </div>
          </div>

          {/* Dashboard Layout Section */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Dashboard Layout</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Show Data Preview:</label>
                <div className="text-sm text-gray-600">
                  {dashboardLayout.showDataPreview ? 'Visible' : 'Hidden'}
                </div>
              </div>
              
              <button
                onClick={handleToggleDataPreview}
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
              >
                Toggle Data Preview
              </button>

              <div className="text-xs text-gray-500">
                <strong>Other Layout Settings:</strong><br />
                Show Trend Metrics: {dashboardLayout.showTrendMetrics ? 'Yes' : 'No'}<br />
                Chart Order: {dashboardLayout.chartOrder.join(', ')}
              </div>
            </div>
          </div>

          {/* Undo/Redo Status Section */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Undo/Redo Status</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Undo Stack:</strong> {undoStack.length} operations
              </div>
              <div>
                <strong>Redo Stack:</strong> {redoStack.length} operations
              </div>
              
              {undoStack.length > 0 && (
                <div className="text-xs text-gray-600">
                  <strong>Last operation:</strong><br />
                  {undoStack[undoStack.length - 1].description}
                </div>
              )}
              
              {undoStack.length > 3 && (
                <div className="text-xs text-gray-500">
                  <strong>Recent operations:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {undoStack.slice(-3).map((cmd, index) => (
                      <li key={cmd.id}>{cmd.description}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Make changes using the controls above</li>
            <li>• Use the Undo/Redo buttons to revert or reapply changes</li>
            <li>• All changes are automatically persisted to localStorage</li>
            <li>• Refresh the page to see persistence in action</li>
            <li>• Try keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};