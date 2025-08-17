import React from 'react';
import { 
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useUndoStack,
  useRedoStack
} from '../store';
import { Undo, Redo } from 'lucide-react';

// Simple button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
  };
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const UndoRedoControls: React.FC = () => {
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const undoStack = useUndoStack();
  const redoStack = useRedoStack();

  const lastUndoCommand = undoStack.length > 0 ? undoStack[undoStack.length - 1] : null;
  const lastRedoCommand = redoStack.length > 0 ? redoStack[redoStack.length - 1] : null;

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        title={lastUndoCommand ? `Undo: ${lastUndoCommand.description}` : 'Nothing to undo'}
        className="flex items-center space-x-1"
      >
        <Undo className="h-4 w-4" />
        <span className="hidden sm:inline">Undo</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        title={lastRedoCommand ? `Redo: ${lastRedoCommand.description}` : 'Nothing to redo'}
        className="flex items-center space-x-1"
      >
        <Redo className="h-4 w-4" />
        <span className="hidden sm:inline">Redo</span>
      </Button>
    </div>
  );
};

interface UndoRedoStatusProps {
  showDetails?: boolean;
}

export const UndoRedoStatus: React.FC<UndoRedoStatusProps> = ({ 
  showDetails = false 
}) => {
  const undoStack = useUndoStack();
  const redoStack = useRedoStack();

  if (!showDetails) {
    return null;
  }

  return (
    <div className="text-xs text-gray-500 space-y-1">
      <div className="flex items-center space-x-4">
        <span>Undo Stack: {undoStack.length}</span>
        <span>Redo Stack: {redoStack.length}</span>
      </div>
      
      {undoStack.length > 0 && (
        <div className="max-w-xs truncate">
          Last: {undoStack[undoStack.length - 1].description}
        </div>
      )}
    </div>
  );
};