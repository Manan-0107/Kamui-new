import { AnimeData } from './types';

/**
 * @deprecated Fake catalog data has been deleted.
 * All anime catalog data is now queried asynchronously from the AniList GraphQL API via `src/lib/anilist.ts`
 * and accessed through client-side hooks `useAnime(id)` and `useCatalogRow(kind)` in `src/hooks/useAnime.ts`.
 */
export const ANIME_CATALOG: Record<string, AnimeData> = {};
export const CATALOG_IDS: string[] = [];
export const ANIME_IMAGE_MAP: Record<string, any> = {};
