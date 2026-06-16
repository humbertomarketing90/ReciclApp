/**
 * Centralized Storage Service (ReciclApp Storage Manager)
 * Centralizes read, write, update, and delete access.
 * Prepares the application structure for a future migration to database infrastructures
 * like Firebase, Supabase, or custom Cloud SQL APIs.
 */

import { TrashReport, Product, UserProfile, ExtendedUserRecord, RecyclingCenter, PickupRequest } from '../types';

// STORAGE KEYS CONSTANTS
export const STORAGE_KEYS = {
  PROFILE: 'reciclapp_profile',
  CHALLENGES: 'reciclapp_challenges',
  PICKUPS: 'reciclapp_pickups',
  REPORTS: 'reciclapp_reports',
  CENTERS: 'reciclapp_centers',
  PRODUCTS: 'reciclapp_products',
  VIRTUAL_USERS_DB: 'reciclapp_virtual_users_db',
  CURRENT_USER_RECORD: 'reciclapp_current_user_record'
};

/**
 * GENERIC LOW-LEVEL PERSISTENCE INTERFACE
 */

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error loading key "${key}" from localStorage:`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
  }
}

/**
 * DOMAIN-SPECIFIC CRITICAL TRASH REPORT REUSABLE CRUD INTERFACE
 * Handles Create, Read, Update, Delete for TrashReports.
 * Future transition to Firebase or Supabase only requires swapping implementation of these functions.
 */
export const StorageReports = {
  getAll: (initial: TrashReport[] = []): TrashReport[] => {
    return loadFromStorage<TrashReport[]>(STORAGE_KEYS.REPORTS, initial);
  },
  
  saveAll: (reports: TrashReport[]): void => {
    saveToStorage<TrashReport[]>(STORAGE_KEYS.REPORTS, reports);
  },

  create: (newReport: TrashReport): void => {
    const reports = StorageReports.getAll();
    StorageReports.saveAll([newReport, ...reports]);
  },

  update: (id: string, updatedFields: Partial<TrashReport>): void => {
    const reports = StorageReports.getAll();
    const nextReports = reports.map(r => r.id === id ? { ...r, ...updatedFields } : r);
    StorageReports.saveAll(nextReports);
  },

  delete: (id: string): void => {
    const reports = StorageReports.getAll();
    StorageReports.saveAll(reports.filter(r => r.id !== id));
  }
};

/**
 * DOMAIN-SPECIFIC MARKETPLACE PRODUCT REUSABLE CRUD INTERFACE
 */
export const StorageProducts = {
  getAll: (initial: Product[] = []): Product[] => {
    return loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initial);
  },

  saveAll: (products: Product[]): void => {
    saveToStorage<Product[]>(STORAGE_KEYS.PRODUCTS, products);
  },

  create: (p: Product): void => {
    const products = StorageProducts.getAll();
    StorageProducts.saveAll([p, ...products]);
  },

  update: (id: string, updatedFields: Partial<Product>): void => {
    const products = StorageProducts.getAll();
    const nextProducts = products.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    StorageProducts.saveAll(nextProducts);
  },

  delete: (id: string): void => {
    const products = StorageProducts.getAll();
    StorageProducts.saveAll(products.filter(p => p.id !== id));
  }
};

/**
 * DOMAIN-SPECIFIC PICKUP REQUESTS CRUD INTERFACE
 */
export const StoragePickups = {
  getAll: (initial: PickupRequest[] = []): PickupRequest[] => {
    return loadFromStorage<PickupRequest[]>(STORAGE_KEYS.PICKUPS, initial);
  },

  saveAll: (pickups: PickupRequest[]): void => {
    saveToStorage<PickupRequest[]>(STORAGE_KEYS.PICKUPS, pickups);
  },

  create: (newRequest: PickupRequest): void => {
    const pickups = StoragePickups.getAll();
    StoragePickups.saveAll([newRequest, ...pickups]);
  },

  update: (id: string, updatedFields: Partial<PickupRequest>): void => {
    const pickups = StoragePickups.getAll();
    const nextPickups = pickups.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    StoragePickups.saveAll(nextPickups);
  },

  delete: (id: string): void => {
    const pickups = StoragePickups.getAll();
    StoragePickups.saveAll(pickups.filter(p => p.id !== id));
  }
};

/**
 * DOMAIN-SPECIFIC USERS DATABASE CRUD INTERFACE
 */
export const StorageUsers = {
  getVirtualDb: (initial: ExtendedUserRecord[] = []): ExtendedUserRecord[] => {
    return loadFromStorage<ExtendedUserRecord[]>(STORAGE_KEYS.VIRTUAL_USERS_DB, initial);
  },

  saveVirtualDb: (db: ExtendedUserRecord[]): void => {
    saveToStorage<ExtendedUserRecord[]>(STORAGE_KEYS.VIRTUAL_USERS_DB, db);
  },

  getCurrentUser: (): ExtendedUserRecord | null => {
    return loadFromStorage<ExtendedUserRecord | null>(STORAGE_KEYS.CURRENT_USER_RECORD, null);
  },

  saveCurrentUser: (user: ExtendedUserRecord | null): void => {
    if (user) {
      saveToStorage<ExtendedUserRecord>(STORAGE_KEYS.CURRENT_USER_RECORD, user);
    } else {
      removeFromStorage(STORAGE_KEYS.CURRENT_USER_RECORD);
    }
  },

  updateUserInDb: (uid: string, updatedFields: Partial<ExtendedUserRecord>): void => {
    const db = StorageUsers.getVirtualDb();
    const updatedDb = db.map(u => u.uid === uid ? { ...u, ...updatedFields } : u);
    StorageUsers.saveVirtualDb(updatedDb);

    const currentUser = StorageUsers.getCurrentUser();
    if (currentUser && currentUser.uid === uid) {
      StorageUsers.saveCurrentUser({ ...currentUser, ...updatedFields });
    }
  }
};
