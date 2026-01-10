const FAVORITES_KEY = 'movie-app-favorites';

export const localStorageUtils = {
  // Lấy danh sách ID phim yêu thích từ localStorage
  getFavoriteIds: (): number[] => {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error);
      return [];
    }
  },

  // Thêm phim vào localStorage favorites
  addToFavorites: (movieId: number): void => {
    try {
      const favorites = localStorageUtils.getFavoriteIds();
      if (!favorites.includes(movieId)) {
        favorites.push(movieId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  },

  // Xóa phim khỏi localStorage favorites
  removeFromFavorites: (movieId: number): void => {
    try {
      const favorites = localStorageUtils.getFavoriteIds();
      const updatedFavorites = favorites.filter(id => id !== movieId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  },

  // Kiểm tra phim có trong favorites không
  isFavorite: (movieId: number): boolean => {
    try {
      const favorites = localStorageUtils.getFavoriteIds();
      return favorites.includes(movieId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  // Set toàn bộ danh sách favorites (dùng cho GraphQL store)
  setFavoriteIds: (favoriteIds: number[]): void => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error('Error setting favorite IDs:', error);
    }
  },

  // Clear tất cả favorites
  clearFavorites: (): void => {
    try {
      localStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  },
};