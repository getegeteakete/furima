'use client';

import { ReactNode } from 'react';
import ScrollToTop from './components/ScrollToTop';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ScrollToTop />
    </>
  );
}
