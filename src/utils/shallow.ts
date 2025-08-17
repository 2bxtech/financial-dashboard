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
 * Creates a selector that uses shallow comparison
 * This prevents re-renders when the selected object has the same properties
 */
export function createShallowSelector<T, U>(
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