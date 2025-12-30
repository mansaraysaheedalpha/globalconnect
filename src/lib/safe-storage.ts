// src/lib/safe-storage.ts

/**
 * Safe localStorage wrapper
 *
 * Provides error-safe localStorage operations that handle:
 * - Private browsing mode (localStorage unavailable)
 * - Storage quota exceeded
 * - Server-side rendering (no window object)
 */

class SafeStorage {
  private isAvailable(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely get item from localStorage
   * Returns null if operation fails or item doesn't exist
   */
  getItem(key: string): string | null {
    if (!this.isAvailable()) return null;

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Safely set item in localStorage
   * Returns true if successful, false otherwise
   */
  setItem(key: string, value: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to set item in localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Safely remove item from localStorage
   * Returns true if successful, false otherwise
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item from localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Safely clear all items from localStorage
   * Returns true if successful, false otherwise
   */
  clear(): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear localStorage', error);
      return false;
    }
  }

  /**
   * Get parsed JSON from localStorage
   * Returns null if parsing fails or item doesn't exist
   */
  getJSON<T>(key: string): T | null {
    const item = this.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Failed to parse JSON from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set JSON object in localStorage
   * Returns true if successful, false otherwise
   */
  setJSON<T>(key: string, value: T): boolean {
    try {
      const json = JSON.stringify(value);
      return this.setItem(key, json);
    } catch (error) {
      console.warn(`Failed to stringify JSON for localStorage: ${key}`, error);
      return false;
    }
  }
}

export const safeStorage = new SafeStorage();
