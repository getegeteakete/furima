'use client';

import Link from 'next/link';
import { getAdminEvents } from '../../lib/mockStore';
import { useStoreData } from '../../lib/useStore';
import { PlusIcon, ArrowRightIcon, UserIcon, StoreIcon } from '../../components/Icons';

export default function AdminEventsPage() {
  const [events] = useStoreData(getAdminEvents);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">イベント管理</h1>
          <p className="text-sm text-gray-600">全{events.length}件のイベント</p>
        </div>
        <Link
          href="/admin/events/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all"
        >
          <PlusIcon size={18} stroke={2.5} /> 新規作成
        </Link>
      </div>

      <div className="space-y-3">
        {events.map((e) => {
          const approvedSellers = e.sellerApplications.filter((a) => a.status === 'approved').length;
          const pendingSellers = e.sellerApplications.filter((a) => a.status === 'pending').length;
          return (
            <Link
              key={e.id}
              href={`/admin/events/${e.id}`}
              className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={e.status} />
                    {pendingSellers > 0 && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold">
                        承認待ち {pendingSellers}
                      </span>
                    )}
                  </div>
                  <p className="font-black text-gray-900 truncate">{e.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {e.date} {e.startTime}〜{e.endTime} ・ {e.region}
                  </p>
                </div>
                <ArrowRightIcon size={18} stroke={2} className="text-gray-400 flex-shrink-0 mt-1" />
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <StoreIcon size={14} stroke={2} className="text-orange-500" />
                  出店者 {approvedSellers}/{e.maxSellers}
                </span>
                <span className="flex items-center gap-1">
                  <UserIcon size={14} stroke={2} className="text-blue-500" />
                  来場者 {e.buyerReservations.length}/{e.maxBuyers}
                </span>
                <span className="ml-auto text-gray-400">担当: {e.managerName}</span>
              </div>
            </Link>
          );
        })}

        {events.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-400 mb-4">まだイベントがありません</p>
            <Link href="/admin/events/create" className="text-orange-600 font-bold text-sm">
              最初のイベントを作成 →
            </Link>
          </div>
        )}
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
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>{s.label}</span>;
}
