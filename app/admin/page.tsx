'use client';

import Link from 'next/link';
import { getAdminEvents, getUsers } from '../lib/mockStore';
import { useStoreData } from '../lib/useStore';
import { CalendarIcon, UserIcon, StoreIcon, PlusIcon, ArrowRightIcon } from '../components/Icons';

export default function AdminDashboard() {
  const [events] = useStoreData(getAdminEvents);
  const [users] = useStoreData(getUsers);

  const recruiting = events.filter((e) => e.status === 'recruiting').length;
  const live = events.filter((e) => e.status === 'live').length;
  const pendingApplications = events.reduce(
    (sum, e) => sum + e.sellerApplications.filter((a) => a.status === 'pending').length,
    0
  );
  const totalSellers = users.filter((u) => u.role === 'seller').length;
  const totalManagers = users.filter((u) => u.role === 'event_manager').length;

  const stats = [
    { label: '募集中イベント', value: recruiting, Icon: CalendarIcon, color: 'from-orange-400 to-orange-600' },
    { label: '開催中イベント', value: live, Icon: StoreIcon, color: 'from-red-400 to-red-600' },
    { label: '承認待ち申請', value: pendingApplications, Icon: UserIcon, color: 'from-yellow-400 to-yellow-600' },
    { label: 'イベント管理者', value: totalManagers, Icon: UserIcon, color: 'from-blue-400 to-blue-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">ダッシュボード</h1>
        <p className="text-sm text-gray-600">運営全体の状況を確認できます</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>
              <s.Icon size={22} stroke={2} />
            </div>
            <p className="text-3xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/events/create"
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 hover:shadow-lg transition-all group"
        >
          <PlusIcon size={28} stroke={2} />
          <p className="font-black text-lg mt-3">新しいイベントを作成</p>
          <p className="text-sm text-white/80 mt-1">日時・地域・募集人数を設定</p>
          <div className="flex items-center gap-1 text-sm font-bold mt-3 group-hover:gap-2 transition-all">
            作成する <ArrowRightIcon size={16} stroke={2.5} />
          </div>
        </Link>

        <Link
          href="/admin/events"
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
        >
          <CalendarIcon size={28} stroke={2} className="text-orange-600" />
          <p className="font-black text-lg mt-3 text-gray-900">イベントを管理</p>
          <p className="text-sm text-gray-500 mt-1">承認・OPEN/CLOSE・出店者確認</p>
          <div className="flex items-center gap-1 text-sm font-bold mt-3 text-orange-600 group-hover:gap-2 transition-all">
            管理する <ArrowRightIcon size={16} stroke={2.5} />
          </div>
        </Link>
      </div>

      {/* Recent Events */}
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4">最近のイベント</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {events.slice(0, 5).map((e, i) => (
            <Link
              key={e.id}
              href={`/admin/events/${e.id}`}
              className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-all ${
                i !== 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{e.title}</p>
                <p className="text-xs text-gray-500">
                  {e.date} {e.startTime}〜{e.endTime} ・ {e.region}
                </p>
              </div>
              <StatusBadge status={e.status} />
            </Link>
          ))}
          {events.length === 0 && (
            <p className="p-8 text-center text-gray-400 text-sm">イベントがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    recruiting: { label: '募集中', cls: 'bg-orange-100 text-orange-700' },
    seller_closed: { label: '募集終了', cls: 'bg-gray-100 text-gray-600' },
    live: { label: 'LIVE', cls: 'bg-red-500 text-white' },
    ended: { label: '終了', cls: 'bg-gray-200 text-gray-500' },
    cancelled: { label: '中止', cls: 'bg-gray-300 text-gray-600' },
  };
  const s = map[status] || map.recruiting;
  return <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${s.cls}`}>{s.label}</span>;
}
