/**
 * Shallow comparison utility for Zustand selectors
 * Prevents unnecessary re-renders when objects have the same properties
 */

export function shallow<T extends Record<string, any>>(
  a: T,
  b: T
): boolean {
  const keys = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keys.length !== keysB.length) {
    return false;
  }
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (a[key] !== b[key]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Factory function that creates a shallow selector
 * Each call returns a new selector instance with its own closure variables
 * This prevents memory leaks and stale data from closure variable persistence
 * 
 * Usage:
 * const shallowSelector = createShallowSelector<StoreState, SelectedData>();
 * const selectData = shallowSelector((state) => ({ 
 *   user: state.user, 
 *   settings: state.settings 
 * }));
 */
export function createShallowSelector<T, U>() {
  return (selector: (state: T) => U) => {
    let lastResult: U;
    let lastState: T;
    
    return (state: T): U => {
      if (state === lastState) {
        return lastResult;
      }
      
      const newResult = selector(state);
      
      if (lastResult && typeof newResult === 'object' && newResult !== null) {
        if (shallow(lastResult as any, newResult as any)) {
          return lastResult;
        }
      }
      
      lastState = state;
      lastResult = newResult;
      return newResult;
    };
  };
}

/**
 * Direct shallow selector creator (legacy API)
 * Creates a new selector instance with its own closure variables
 * Recommended for one-off usage where you don't need a factory
 * 
 * Usage:
 * const selectData = createShallowSelectorInstance((state) => ({ 
 *   user: state.user, 
 *   settings: state.settings 
 * }));
 */
export function createShallowSelectorInstance<T, U>(
  selector: (state: T) => U
) {
  let lastResult: U;
  let lastState: T;
  
  return (state: T): U => {
    if (state === lastState) {
      return lastResult;
    }
    
    const newResult = selector(state);
    
    if (lastResult && typeof newResult === 'object' && newResult !== null) {
      if (shallow(lastResult as any, newResult as any)) {
        return lastResult;
      }
    }
    
    lastState = state;
    lastResult = newResult;
    return newResult;
  };
}