'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from './Icons';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" aria-label="パンくずナビゲーション">
      <div className="container-main py-3 sm:py-4">
        <ol className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs sm:text-sm">
          {/* Home */}
          <li className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
              <HomeIcon size={16} stroke={2} />
              <span className="hidden sm:inline">HOME</span>
            </Link>
          </li>

          {/* Breadcrumb items */}
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 flex-shrink-0">
              <ChevronRightIcon size={14} stroke={2} className="text-gray-400 dark:text-gray-600" />
              {item.href ? (
                <Link href={item.href} className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
