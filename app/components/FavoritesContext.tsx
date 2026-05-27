'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type FavoritesContextType = {
  favoriteEvents: Set<string>;
  followingSellers: Set<string>;
  toggleFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
  toggleFollow: (sellerId: string) => void;
  isFollowing: (sellerId: string) => boolean;
  favoritesCount: number;
  followingCount: number;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // ダミーデータ：初期状態でいくつかのお気に入いとフォローを設定
  const [favoriteEvents, setFavoriteEvents] = useState<Set<string>>(
    new Set(['mina-craft', 'osaka-antique'])
  );
  const [followingSellers, setFollowingSellers] = useState<Set<string>>(
    new Set(['mina-craft', 'kyoto-vintage'])
  );

  const toggleFavorite = useCallback((eventId: string) => {
    setFavoriteEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  const isFavorite = useCallback(
    (eventId: string) => favoriteEvents.has(eventId),
    [favoriteEvents]
  );

  const toggleFollow = useCallback((sellerId: string) => {
    setFollowingSellers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sellerId)) {
        newSet.delete(sellerId);
      } else {
        newSet.add(sellerId);
      }
      return newSet;
    });
  }, []);

  const isFollowing = useCallback(
    (sellerId: string) => followingSellers.has(sellerId),
    [followingSellers]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteEvents,
        followingSellers,
        toggleFavorite,
        isFavorite,
        toggleFollow,
        isFollowing,
        favoritesCount: favoriteEvents.size,
        followingCount: followingSellers.size,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
