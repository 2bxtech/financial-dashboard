/**
 * Select UI Component
 * Styled select dropdown component
 */

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ id, children, className }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  return (
    <button
      id={id}
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className={cn(
      'absolute top-full z-50 w-full min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-lg',
      className
    )}>
      {children}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className }) => {
  const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext);
  const isSelected = value === selectedValue;

  const handleSelect = () => {
    onValueChange?.(value);
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
        className
      )}
      onClick={handleSelect}
    >
      {isSelected && (
        <Check className="absolute left-2 h-4 w-4" />
      )}
      {children}
    </div>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className }) => {
  const { value } = React.useContext(SelectContext);

  return (
    <span className={cn('truncate', className)}>
      {value || placeholder}
    </span>
  );
};