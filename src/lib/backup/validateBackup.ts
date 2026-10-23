import { BackupValidationResult } from './schema';

/**
 * Strictly validate an untrusted backup payload before applying any changes.
 */
export function validateBackup(data: any): BackupValidationResult {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Backup data must be a valid JSON object' };
  }

  // Schema version check
  if (data.schemaVersion !== 1) {
    return {
      valid: false,
      error: `Unsupported backup schemaVersion: ${data.schemaVersion}. Only version 1 is supported in Kamui v0.1.`
    };
  }

  // Timestamp check
  if (typeof data.exportedAt !== 'string' || !data.exportedAt.trim()) {
    return { valid: false, error: 'Backup is missing valid exportedAt ISO timestamp.' };
  }

  // Reject root credentials or secrets injection
  if (data.accessToken || data.token || data.password || data.secret || data.sessionCookie) {
    return { valid: false, error: 'Suspicious credential or token fields detected in backup payload.' };
  }

  // Saved anime check
  if (!data.savedAnime || typeof data.savedAnime !== 'object' || Array.isArray(data.savedAnime)) {
    return { valid: false, error: 'Backup is missing valid savedAnime container.' };
  }

  const isNumericString = (val: any) => typeof val === 'string' && /^\d+$/.test(val);

  if (!Array.isArray(data.savedAnime.watchlist) || !data.savedAnime.watchlist.every(isNumericString)) {
    return { valid: false, error: 'savedAnime.watchlist must be an array of numeric anime ID strings.' };
  }

  if (!Array.isArray(data.savedAnime.likedTitles) || !data.savedAnime.likedTitles.every(isNumericString)) {
    return { valid: false, error: 'savedAnime.likedTitles must be an array of numeric anime ID strings.' };
  }

  if (typeof data.savedAnime.trackerStatus !== 'object' || Array.isArray(data.savedAnime.trackerStatus)) {
    return { valid: false, error: 'savedAnime.trackerStatus must be an object map.' };
  }

  // Watch history check
  if (!Array.isArray(data.watchHistory)) {
    return { valid: false, error: 'watchHistory must be an array.' };
  }
  for (const item of data.watchHistory) {
    if (!item || !isNumericString(item.animeId) || typeof item.episodeNum !== 'number') {
      return { valid: false, error: 'Malformed watchHistory entry encountered in backup.' };
    }
  }

  // Local comments check
  if (!data.localComments || typeof data.localComments !== 'object' || Array.isArray(data.localComments)) {
    return { valid: false, error: 'localComments must be an object keyed by anime ID.' };
  }

  let totalComments = 0;
  for (const [animeId, commentsList] of Object.entries(data.localComments)) {
    if (!isNumericString(animeId)) {
      return { valid: false, error: `Invalid animeId key in localComments: "${animeId}". Expected numeric ID.` };
    }
    if (!Array.isArray(commentsList)) {
      return { valid: false, error: `localComments[${animeId}] must be an array of comment objects.` };
    }
    totalComments += commentsList.length;
  }

  // Extensions check
  if (!Array.isArray(data.extensions)) {
    return { valid: false, error: 'extensions must be an array of extension configurations.' };
  }
  for (const ext of data.extensions) {
    if (!ext || typeof ext.id !== 'string' || typeof ext.baseUrl !== 'string' || typeof ext.manifest !== 'object') {
      return { valid: false, error: 'Malformed extension record in backup.' };
    }
    const cleanUrl = ext.baseUrl.trim().toLowerCase();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return { valid: false, error: 'Invalid or insecure extension baseUrl in backup.' };
    }
    // Reject any attempt to inject secrets or script execution
    if ((ext as any).secret || (ext as any).token || (ext as any).password) {
      return { valid: false, error: 'Backup contains forbidden credential fields in extensions.' };
    }
  }

  // Reserved chats field must be an empty array if present
  if (data.chats !== undefined && (!Array.isArray(data.chats) || data.chats.length !== 0)) {
    return { valid: false, error: 'chats field must be an empty array reserved for future compatibility.' };
  }

  return {
    valid: true,
    summary: {
      schemaVersion: 1,
      exportedAt: data.exportedAt,
      watchlistCount: data.savedAnime.watchlist.length,
      likedCount: data.savedAnime.likedTitles.length,
      historyCount: data.watchHistory.length,
      commentsCount: totalComments,
      extensionsCount: data.extensions.length
    }
  };
}
