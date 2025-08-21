import { StateCreator } from 'zustand';
import { UndoRedoSlice, Command } from './types';

export const createUndoRedoSlice: StateCreator<
  UndoRedoSlice,
  [],
  [],
  UndoRedoSlice
> = (set, get) => ({
  // Initial state
  undoStack: [],
  redoStack: [],
  maxHistorySize: 50,

  // Actions
  executeCommand: (command) => {
    try {
      // Execute the command
      command.execute();

      set((state) => {
        const newUndoStack = [...state.undoStack, command];
        
        // Limit stack size
        const limitedUndoStack = newUndoStack.slice(-state.maxHistorySize);
        
        return {
          undoStack: limitedUndoStack,
          redoStack: [], // Clear redo stack when new command is executed
        };
      });
    } catch (error) {
      console.error('❌ Failed to execute command:', command.description, error);
    }
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;

    const commandToUndo = state.undoStack[state.undoStack.length - 1];
    
    try {
      // Execute undo
      commandToUndo.undo();

      set((state) => ({
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, commandToUndo],
      }));
    } catch (error) {
      console.error('❌ Failed to undo command:', commandToUndo.description, error);
    }
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;

    const commandToRedo = state.redoStack[state.redoStack.length - 1];
    
    try {
      // Execute redo
      commandToRedo.execute();

      set((state) => ({
        undoStack: [...state.undoStack, commandToRedo],
        redoStack: state.redoStack.slice(0, -1),
      }));
    } catch (error) {
      console.error('❌ Failed to redo command:', commandToRedo.description, error);
    }
  },

  clearHistory: () => {
    set({
      undoStack: [],
      redoStack: [],
    });
  },

  canUndo: () => {
    return get().undoStack.length > 0;
  },

  canRedo: () => {
    return get().redoStack.length > 0;
  },
});