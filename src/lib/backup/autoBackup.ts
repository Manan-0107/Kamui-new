import { generateBackupData } from './exportBackup';
import { KamuiBackupV1 } from './schema';

export const AUTO_BACKUP_STORAGE_KEY = 'kamui_auto_backups';
export const MAX_AUTO_GENERATIONS = 3;

export interface AutoBackupEntry {
  timestamp: string;
  data: KamuiBackupV1;
}

/**
 * Creates an automatic snapshot of user data and saves it locally.
 * Enforces capped retention of 3 generations to prevent uncontrolled storage growth.
 */
export function createAutoBackupSnapshot(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const currentData = generateBackupData();
    const existingRaw = localStorage.getItem(AUTO_BACKUP_STORAGE_KEY);
    const existing: AutoBackupEntry[] = existingRaw ? JSON.parse(existingRaw) : [];

    const newEntry: AutoBackupEntry = {
      timestamp: new Date().toISOString(),
      data: currentData
    };

    // Prepend new backup, limit to MAX_AUTO_GENERATIONS
    const updated = [newEntry, ...existing].slice(0, MAX_AUTO_GENERATIONS);
    localStorage.setItem(AUTO_BACKUP_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Auto backup skipped due to storage error', e);
  }
}

/**
 * Get all available local auto backup snapshots.
 */
export function getAutoBackupSnapshots(): AutoBackupEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUTO_BACKUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear automatic backup snapshots.
 */
export function clearAutoBackups(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(AUTO_BACKUP_STORAGE_KEY);
}
