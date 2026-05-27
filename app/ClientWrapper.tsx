'use client';

import { ReactNode } from 'react';
import ScrollToTop from './components/ScrollToTop';
import { NotificationProvider } from './components/NotificationContext';
import { FavoritesProvider } from './components/FavoritesContext';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <FavoritesProvider>
        {children}
        <ScrollToTop />
      </FavoritesProvider>
    </NotificationProvider>
  );
}
