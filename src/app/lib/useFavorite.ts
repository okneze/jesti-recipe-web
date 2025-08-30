import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

function sanitize(str: string) {
  return str.replace(/(%[0-9a-fA-F]{2})/gim,'').replace(/[^a-zA-Z0-9/]/gim, '').trim();
}

export function useFavorites(): readonly [(s: string) => boolean, (s:string) => void] {
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);

  const isFavorite = useCallback((slug: string) => {
    return favorites.includes(sanitize(slug));
  }, [favorites]);

  function toggleFavorite(slug: string) {
    const saneSlug = sanitize(slug);
    const idx = favorites.indexOf(saneSlug);
    if (idx === -1) {
      setFavorites([...favorites, saneSlug]);
    } else {
      setFavorites(favorites.toSpliced(idx));
    }
  }
  return [isFavorite, toggleFavorite] as const;
}

export function useFavorite(slug: string): readonly [() => boolean, () => void] {
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);
  const saneSlug = useMemo(() => sanitize(slug), [slug]);

  const isFavorite = useCallback(() => {
    return favorites.includes(sanitize(saneSlug));
  }, [favorites, saneSlug]);

  function toggleFavorite() {
    const idx = favorites.indexOf(saneSlug);
    if (idx === -1) {
      setFavorites([...favorites, saneSlug]);
    } else {
      setFavorites(favorites.toSpliced(idx));
    }
  }
  return [isFavorite, toggleFavorite] as const;
}