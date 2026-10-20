import { InstalledExtension, ExtensionManifest } from './types';

const EXTENSIONS_STORAGE_KEY = 'kamui_installed_extensions_v1';
const FIRST_INSTALL_NOTICE_KEY = 'kamui_ext_notice_acknowledged';

/**
 * Load all installed extensions from localStorage
 */
export function getStoredExtensions(): InstalledExtension[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EXTENSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Sort by order ascending
    return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (err) {
    console.error('Failed to read extensions from storage:', err);
    return [];
  }
}

/**
 * Save extensions list to localStorage
 */
export function setStoredExtensions(extensions: InstalledExtension[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXTENSIONS_STORAGE_KEY, JSON.stringify(extensions));
  } catch (err) {
    console.error('Failed to write extensions to storage:', err);
  }
}

/**
 * Install a new extension
 */
export function installExtension(baseUrl: string, manifest: ExtensionManifest): InstalledExtension {
  const current = getStoredExtensions();
  const cleanBase = baseUrl.replace(/\/+$/, '');

  // Check if already installed
  const existingIndex = current.findIndex((e) => e.id === manifest.id);
  const now = Date.now();

  const newExtension: InstalledExtension = {
    id: manifest.id,
    baseUrl: cleanBase,
    manifest,
    enabled: true,
    order: existingIndex >= 0 ? current[existingIndex].order : current.length,
    installedAt: existingIndex >= 0 ? current[existingIndex].installedAt : now,
    lastCheckedAt: now,
    healthStatus: 'ok'
  };

  if (existingIndex >= 0) {
    current[existingIndex] = newExtension;
  } else {
    current.push(newExtension);
  }

  setStoredExtensions(current);
  return newExtension;
}

/**
 * Toggle enable/disable status for an extension
 */
export function toggleExtensionEnabled(id: string): InstalledExtension[] {
  const current = getStoredExtensions();
  const updated = current.map((ext) => (ext.id === id ? { ...ext, enabled: !ext.enabled } : ext));
  setStoredExtensions(updated);
  return updated;
}

/**
 * Remove an extension by ID
 */
export function removeInstalledExtension(id: string): InstalledExtension[] {
  const current = getStoredExtensions();
  const updated = current.filter((ext) => ext.id !== id);
  // Re-index order
  const reindexed = updated.map((ext, idx) => ({ ...ext, order: idx }));
  setStoredExtensions(reindexed);
  return reindexed;
}

/**
 * Re-order extensions
 */
export function reorderExtensions(sourceIndex: number, destinationIndex: number): InstalledExtension[] {
  const current = getStoredExtensions();
  if (
    sourceIndex < 0 ||
    sourceIndex >= current.length ||
    destinationIndex < 0 ||
    destinationIndex >= current.length
  ) {
    return current;
  }

  const result = Array.from(current);
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);

  const reordered = result.map((ext, idx) => ({ ...ext, order: idx }));
  setStoredExtensions(reordered);
  return reordered;
}

/**
 * Check if the user has seen the neutral first-install legal/privacy notice
 */
export function isNoticeAcknowledged(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(FIRST_INSTALL_NOTICE_KEY));
}

/**
 * Acknowledge the first-install notice
 */
export function acknowledgeNotice(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FIRST_INSTALL_NOTICE_KEY, 'true');
  } catch {}
}
