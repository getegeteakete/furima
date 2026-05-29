'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
  PlusIcon,
  StoreIcon,
} from '../components/Icons';
import AuthGuard from '../components/AuthGuard';

const NAV_ITEMS = [
  { href: '/admin', label: 'ダッシュボード', Icon: HomeIcon, exact: true },
  { href: '/admin/events', label: 'イベント管理', Icon: CalendarIcon },
  { href: '/admin/events/create', label: 'イベント作成', Icon: PlusIcon },
  { href: '/admin/users', label: 'ユーザー・権限', Icon: UserIcon },
  { href: '/admin/chat-settings', label: 'チャット設定', Icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGuard allow={['admin', 'event_manager']}>
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-900 text-white flex-col fixed h-screen">
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center font-black text-lg">
              F
            </div>
            <div>
              <p className="font-black text-lg leading-tight">運営管理</p>
              <p className="text-xs text-gray-400">Furima Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && (item.href !== '/admin/events' || pathname !== '/admin/events/create');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.Icon size={20} stroke={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:bg-gray-800 transition-all"
          >
            <StoreIcon size={20} stroke={2} />
            サイトへ戻る
          </Link>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 inset-x-0 bg-gray-900 text-white z-30">
        <div className="flex items-center gap-2 p-3 overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  active ? 'bg-orange-500' : 'bg-gray-800 text-gray-300'
                }`}
              >
                <item.Icon size={16} stroke={2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
    </AuthGuard>
  );
}
