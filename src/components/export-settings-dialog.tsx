/**
 * Export Settings Dialog
 * Allows users to configure export preferences
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useExport } from '../store/store';
import { ExportFormat } from '../services/interfaces/IExportService';

interface ExportSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportSettingsDialog: React.FC<ExportSettingsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { exportPreferences, updateExportPreferences } = useExport();

  const handlePreferenceUpdate = (key: string, value: any) => {
    updateExportPreferences({ [key]: value });
  };

  const handleCompanyInfoUpdate = (key: string, value: string) => {
    updateExportPreferences({
      companyInfo: {
        ...exportPreferences.companyInfo,
        [key]: value
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Settings</DialogTitle>
          <DialogDescription>
            Configure your default export preferences and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* General Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">General Settings</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultFormat">Default Export Format</Label>
                <Select
                  value={exportPreferences.defaultFormat}
                  onValueChange={(value: string) => 
                    handlePreferenceUpdate('defaultFormat', value as ExportFormat)
                  }
                >
                  <SelectTrigger id="defaultFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Image Quality</Label>
                <Input
                  id="quality"
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={exportPreferences.quality}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handlePreferenceUpdate('quality', parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          {/* Data Export Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Data Export Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHeaders"
                  checked={exportPreferences.includeHeaders}
                  onCheckedChange={(checked: boolean) => 
                    handlePreferenceUpdate('includeHeaders', checked)
                  }
                />
                <Label htmlFor="includeHeaders">Include column headers</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={exportPreferences.dateFormat}
                    onValueChange={(value: string) => 
                      handlePreferenceUpdate('dateFormat', value)
                    }
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberFormat">Number Format</Label>
                  <Select
                    value={exportPreferences.numberFormat}
                    onValueChange={(value: string) => 
                      handlePreferenceUpdate('numberFormat', value as 'decimal' | 'currency')
                    }
                  >
                    <SelectTrigger id="numberFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="currency">Currency ($1,234.56)</SelectItem>
                      <SelectItem value="decimal">Decimal (1,234.56)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Report Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">PDF Report Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={exportPreferences.includeCharts}
                  onCheckedChange={(checked: boolean) => 
                    handlePreferenceUpdate('includeCharts', checked)
                  }
                />
                <Label htmlFor="includeCharts">Include charts in reports</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeRawData"
                  checked={exportPreferences.includeRawData}
                  onCheckedChange={(checked: boolean) => 
                    handlePreferenceUpdate('includeRawData', checked)
                  }
                />
                <Label htmlFor="includeRawData">Include raw data tables</Label>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Company Information</h4>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={exportPreferences.companyInfo.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleCompanyInfoUpdate('name', e.target.value)
                  }
                  placeholder="Your Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Input
                  id="companyAddress"
                  value={exportPreferences.companyInfo.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleCompanyInfoUpdate('address', e.target.value)
                  }
                  placeholder="123 Business St, City, State 12345"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};