/**
 * Lightweight, account-free list sharing system for Kamui v0.1.
 * Operates purely peer-to-peer / file-based with no backend server requirement.
 */

export interface SharedAnimeListPayload {
  format: 'kamui_anime_list';
  version: 1;
  title: string;
  description?: string;
  exportedAt: string;
  animeIds: string[];
}

export interface ListValidationResult {
  valid: boolean;
  error?: string;
  payload?: SharedAnimeListPayload;
}

/**
 * Encodes a list into a compact shareable code string (base64).
 * Strictly excludes any private comments, notes, or credentials.
 */
export function exportListToShareCode(
  title: string,
  animeIds: string[],
  description?: string
): string {
  const isNumericString = (val: any) => typeof val === 'string' && /^\d+$/.test(val);
  const cleanIds = Array.from(new Set(animeIds.filter(isNumericString)));

  const payload: SharedAnimeListPayload = {
    format: 'kamui_anime_list',
    version: 1,
    title: (title || 'My Anime Recommendations').trim(),
    description: description ? description.trim() : undefined,
    exportedAt: new Date().toISOString(),
    animeIds: cleanIds
  };

  const json = JSON.stringify(payload);
  let b64: string;
  if (typeof window !== 'undefined' && typeof (window as any).btoa === 'function') {
    b64 = (window as any).btoa(unescape(encodeURIComponent(json)));
  } else {
    b64 = Buffer.from(json, 'utf-8').toString('base64');
  }
  return `KM-LIST-${b64}`;
}

/**
 * Creates the in-memory JSON payload for a shareable anime list.
 */
export function createSharedListPayload(
  title: string,
  animeIds: string[],
  description?: string
): SharedAnimeListPayload {
  const isNumericString = (val: any) => typeof val === 'string' && /^\d+$/.test(val);
  const cleanIds = Array.from(new Set(animeIds.filter(isNumericString)));

  return {
    format: 'kamui_anime_list',
    version: 1,
    title: (title || 'My Anime Recommendations').trim(),
    description: description ? description.trim() : undefined,
    exportedAt: new Date().toISOString(),
    animeIds: cleanIds
  };
}

/**
 * Validates and decodes a shared list from either:
 * 1. A JSON string (from a .json / .kamuilist.json file)
 * 2. A compact share code string (`KM-LIST-...` or raw base64)
 */
export function validateAndParseList(input: string): ListValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Input must be a non-empty string.' };
  }

  let jsonStr = input.trim();

  // If input is a compact base64 share code
  if (jsonStr.startsWith('KM-LIST-')) {
    const rawB64 = jsonStr.replace('KM-LIST-', '');
    try {
      if (typeof window !== 'undefined' && typeof window.atob === 'function') {
        jsonStr = decodeURIComponent(escape(window.atob(rawB64)));
      } else {
        jsonStr = Buffer.from(rawB64, 'base64').toString('utf-8');
      }
    } catch {
      return { valid: false, error: 'Invalid share code format: Failed to decode base64 payload.' };
    }
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { valid: false, error: 'Invalid list format: Payload is not valid JSON.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Malformed list data.' };
  }

  if (parsed.format !== 'kamui_anime_list') {
    return { valid: false, error: 'Unsupported format. Expected "kamui_anime_list".' };
  }

  if (parsed.version !== 1) {
    return { valid: false, error: `Unsupported list version: ${parsed.version}.` };
  }

  if (typeof parsed.title !== 'string' || !parsed.title.trim()) {
    return { valid: false, error: 'List is missing a valid title.' };
  }

  if (!Array.isArray(parsed.animeIds)) {
    return { valid: false, error: 'List is missing animeIds array.' };
  }

  const isNumericString = (val: any) => typeof val === 'string' && /^\d+$/.test(val);
  const validIds = parsed.animeIds.filter(isNumericString);

  if (validIds.length === 0) {
    return { valid: false, error: 'List contains no valid anime IDs.' };
  }

  return {
    valid: true,
    payload: {
      format: 'kamui_anime_list',
      version: 1,
      title: parsed.title,
      description: parsed.description,
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      animeIds: Array.from(new Set(validIds))
    }
  };
}

/**
 * Triggers a download of a shareable list JSON file.
 */
export function downloadListFile(
  title: string,
  animeIds: string[],
  description?: string
): { filename: string; count: number } {
  const isNumericString = (val: any) => typeof val === 'string' && /^\d+$/.test(val);
  const cleanIds = Array.from(new Set(animeIds.filter(isNumericString)));

  const payload: SharedAnimeListPayload = {
    format: 'kamui_anime_list',
    version: 1,
    title: (title || 'My Anime Recommendations').trim(),
    description: description ? description.trim() : undefined,
    exportedAt: new Date().toISOString(),
    animeIds: cleanIds
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'anime-list';
  const filename = `${safeTitle}.kamuilist.json`;

  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { filename, count: cleanIds.length };
}

/**
 * Merges a validated list into local watchlist with duplicate counting.
 */
export function importListToWatchlist(importedIds: string[]): {
  newlyAddedCount: number;
  existingCount: number;
  totalWatchlistCount: number;
} {
  if (typeof localStorage === 'undefined') {
    return { newlyAddedCount: 0, existingCount: 0, totalWatchlistCount: 0 };
  }

  try {
    const raw = localStorage.getItem('kamui_watchlist');
    const current: string[] = raw ? JSON.parse(raw) : [];
    const currentSet = new Set(current);

    let newlyAdded = 0;
    let existing = 0;

    for (const id of importedIds) {
      if (currentSet.has(id)) {
        existing++;
      } else {
        currentSet.add(id);
        newlyAdded++;
      }
    }

    const updated = Array.from(currentSet);
    localStorage.setItem('kamui_watchlist', JSON.stringify(updated));

    return {
      newlyAddedCount: newlyAdded,
      existingCount: existing,
      totalWatchlistCount: updated.length
    };
  } catch (e) {
    throw new Error('Failed to update watchlist in local storage');
  }
}
