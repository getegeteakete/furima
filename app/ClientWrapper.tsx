'use client';

import { ReactNode } from 'react';
import ScrollToTop from './components/ScrollToTop';
import { NotificationProvider } from './components/NotificationContext';
import { FavoritesProvider } from './components/FavoritesContext';
import StoreProvider from './components/StoreProvider';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <NotificationProvider>
        <FavoritesProvider>
          {children}
          <ScrollToTop />
        </FavoritesProvider>
      </NotificationProvider>
    </StoreProvider>
  );
}
