// Lưu, lấy, xóa phim yêu thích bằng localStorage

const FAVORITES_KEY = 'favorite_movie_ids';

export function getFavoriteIds(): string[] {
  const raw = localStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveFavorite(id: string) {
  const ids = getFavoriteIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  }
}

export function removeFavorite(id: string) {
  const ids = getFavoriteIds().filter((item) => item !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function clearFavorites() {
  localStorage.removeItem(FAVORITES_KEY);
}
