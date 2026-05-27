'use client';

import { ReactNode } from 'react';
import ScrollToTop from './components/ScrollToTop';
import { NotificationProvider } from './components/NotificationContext';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      {children}
      <ScrollToTop />
    </NotificationProvider>
  );
}
