/**
 * Storage utility that provides localStorage-like API
 * Works in both browser and NW.js environments
 */

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// NW.js storage adapter using file system
class NWStorageAdapter implements StorageAdapter {
  private storagePath: string;
  private cache: Map<string, string> = new Map();
  private initialized: boolean = false;

  constructor() {
    // Initialize NW.js storage path
    try {
      // @ts-ignore - NW.js global (v0.1.0+)
      const nw = (window as any).nw || (window as any).require?.('nw.gui');
      if (nw) {
        // Try different ways to require Node.js modules in NW.js
        const requireFn = nw.require || (window as any).require;
        if (requireFn && typeof requireFn === 'function') {
          const path = requireFn('path');
          const fs = requireFn('fs');
          
          // Get app data path
          let dataPath: string;
          if (nw.App && typeof nw.App.getDataPath === 'function') {
            dataPath = nw.App.getDataPath();
          } else if (nw.App && nw.App.dataPath) {
            dataPath = nw.App.dataPath;
          } else {
            // Fallback: use user data directory
            const os = requireFn('os');
            dataPath = path.join(os.homedir(), '.layout-manager-demo');
          }
          
          // Ensure directory exists
          if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
          }
          
          this.storagePath = path.join(dataPath, 'storage.json');
          
          // Load existing data
          this.loadFromFile(fs);
          this.initialized = true;
        }
      }
    } catch (error) {
      console.warn('Failed to initialize NW.js storage:', error);
    }
  }

  private loadFromFile(fs: any): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf8');
        const parsed = JSON.parse(data);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load storage file:', error);
      this.cache = new Map();
    }
  }

  private saveToFile(fs: any): void {
    try {
      const data = Object.fromEntries(this.cache);
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.warn('Failed to save storage file:', error);
    }
  }

  getItem(key: string): string | null {
    if (!this.initialized) {
      return null;
    }
    return this.cache.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (!this.initialized) {
      return;
    }
    this.cache.set(key, value);
    try {
      // @ts-ignore - NW.js global
      const nw = (window as any).nw || (window as any).require?.('nw.gui');
      if (nw) {
        const requireFn = nw.require || (window as any).require;
        if (requireFn) {
          const fs = requireFn('fs');
          this.saveToFile(fs);
        }
      }
    } catch (error) {
      console.warn('Failed to save to NW.js storage:', error);
    }
  }

  removeItem(key: string): void {
    if (!this.initialized) {
      return;
    }
    this.cache.delete(key);
    try {
      // @ts-ignore - NW.js global
      const nw = (window as any).nw || (window as any).require?.('nw.gui');
      if (nw) {
        const requireFn = nw.require || (window as any).require;
        if (requireFn) {
          const fs = requireFn('fs');
          this.saveToFile(fs);
        }
      }
    } catch (error) {
      console.warn('Failed to remove from NW.js storage:', error);
    }
  }

  clear(): void {
    if (!this.initialized) {
      return;
    }
    this.cache.clear();
    try {
      // @ts-ignore - NW.js global
      const nw = (window as any).nw || (window as any).require?.('nw.gui');
      if (nw) {
        const requireFn = nw.require || (window as any).require;
        if (requireFn) {
          const fs = requireFn('fs');
          if (fs.existsSync(this.storagePath)) {
            fs.unlinkSync(this.storagePath);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear NW.js storage:', error);
    }
  }
}

// Browser localStorage adapter
class BrowserStorageAdapter implements StorageAdapter {
  private storage: Storage;

  constructor() {
    this.storage = window.localStorage;
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.warn('Failed to get item from localStorage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set item in localStorage:', error);
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove item from localStorage:', error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}

// Memory storage adapter (fallback)
class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

// Detect environment and create appropriate adapter
function createStorageAdapter(): StorageAdapter {
  // Check if we're in NW.js
  try {
    // @ts-ignore - NW.js global (v0.1.0+)
    const nw = (window as any).nw || (window as any).require?.('nw.gui');
    const requireFn = nw?.require || (window as any).require;
    if (nw && requireFn && typeof requireFn === 'function') {
      // Test if we can actually use Node.js modules
      try {
        requireFn('fs');
        return new NWStorageAdapter();
      } catch {
        // Can't use Node.js modules, fall through to browser storage
      }
    }
  } catch (error) {
    // Not in NW.js, continue to check browser localStorage
  }

  // Check if browser localStorage is available
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Test if localStorage actually works
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return new BrowserStorageAdapter();
    }
  } catch (error) {
    // localStorage not available, use memory storage
  }

  // Fallback to memory storage
  return new MemoryStorageAdapter();
}

// Create singleton storage instance
const storageAdapter = createStorageAdapter();

// Export localStorage-like API
export const storage = {
  getItem: (key: string): string | null => storageAdapter.getItem(key),
  setItem: (key: string, value: string): void => storageAdapter.setItem(key, value),
  removeItem: (key: string): void => storageAdapter.removeItem(key),
  clear: (): void => storageAdapter.clear(),
};

// Check if storage is available
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_availability_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

