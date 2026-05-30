'use client';

import { ReactNode } from 'react';
import ScrollToTop from './components/ScrollToTop';
import PageViewTracker from './components/PageViewTracker';
import { NotificationProvider } from './components/NotificationContext';
import { FavoritesProvider } from './components/FavoritesContext';
import StoreProvider from './components/StoreProvider';
import { AuthProvider } from './components/AuthProvider';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <NotificationProvider>
          <FavoritesProvider>
            {children}
            <ScrollToTop />
            <PageViewTracker />
          </FavoritesProvider>
        </NotificationProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
