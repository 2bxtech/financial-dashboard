/**
 * Checkbox UI Component
 * Styled checkbox component for forms
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id, checked = false, onCheckedChange, disabled, className, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        id={id}
        ref={ref}
        className={cn(
          'h-4 w-4 shrink-0 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
          checked && 'bg-blue-600 text-white border-blue-600',
          className
        )}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        {checked && (
          <Check className="h-4 w-4" />
        )}
      </button>
    );
  }
);

Checkbox.displayName = 'Checkbox';