import { useLocalStorage } from "./useLocalStorage";

function sanitize(str: string) {
  return str.replace(/(%[0-9a-fA-F]{2})/gim,'').replace(/[^a-zA-Z0-9/]/gim, '').trim();
}

export function useFavorites(): readonly [(s: string) => boolean, (s:string) => void] {
  const [favorite, setFavorite] = useLocalStorage<string[]>('favorites', []);

  function isFavorite(slug: string) {
    return favorite.includes(sanitize(slug));
  }
  function toggleFavorite(slug: string) {
    setFavorite((() => {
      const idx = favorite.indexOf(sanitize(slug));
      if (idx === -1) {
        return [...favorite, sanitize(slug)];
      }
      return favorite.toSpliced(idx);
    })());
  }
  return [isFavorite, toggleFavorite] as const;
}

export function useFavorite(slug: string): readonly [() => boolean, () => void] {
  const [favorite, setFavorite] = useLocalStorage<string[]>('favorites', []);
  const sanitizedSlug = sanitize(slug);

  function isFavorite() {
    return favorite.includes(sanitizedSlug);
  }
  function toggleFavorite() {
    setFavorite((() => {
      const idx = favorite.indexOf(sanitizedSlug);
      if (idx === -1) {
        return [...favorite, sanitizedSlug];
      }
      return favorite.toSpliced(idx);
    })());
  }
  return [isFavorite, toggleFavorite] as const;
}