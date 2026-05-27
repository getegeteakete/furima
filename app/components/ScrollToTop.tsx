'use client';

import { useEffect, useState } from 'react';
import { ArrowLeftIcon } from './Icons';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // スクロール位置が 300px 以上で表示
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="ページトップへ戻る"
          className="fixed bottom-8 right-6 sm:bottom-10 sm:right-8 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all active:scale-95 flex items-center justify-center animate-slide-in"
        >
          <ArrowLeftIcon size={20} stroke={2.5} className="rotate-90" />
        </button>
      )}
    </>
  );
}
