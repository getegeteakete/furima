'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Link from 'next/link';
import {
  getAdminEventById,
  setEventStatus,
  updateSellerApplication,
  deleteAdminEvent,
  type AdminEventStatus,
} from '../../../lib/supabaseStore';
import { useStoreData } from '../../../lib/useStore';
import {
  ArrowLeftIcon,
  CheckIcon,
  CloseIcon,
  UserIcon,
  StoreIcon,
  CalendarIcon,
  MapPinIcon,
} from '../../../components/Icons';

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const getter = useCallback(() => getAdminEventById(eventId), [eventId]);
  const [event] = useStoreData(getter);

  if (!event) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">イベントが見つかりません</p>
        <Link href="/admin/events" className="text-orange-600 font-bold text-sm mt-4 inline-block">
          ← イベント一覧へ
        </Link>
      </div>
    );
  }

  const approvedSellers = event.sellerApplications.filter((a) => a.status === 'approved');
  const pendingSellers = event.sellerApplications.filter((a) => a.status === 'pending');

  const handleStatusChange = (status: AdminEventStatus) => {
    setEventStatus(event.id, status);
  };

  const handleDelete = () => {
    if (confirm('このイベントを削除しますか？この操作は取り消せません。')) {
      deleteAdminEvent(event.id);
      router.push('/admin/events');
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium">
        <ArrowLeftIcon size={16} stroke={2} /> イベント一覧へ
      </Link>

      {/* ヘッダー */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <StatusBadge status={event.status} />
            <h1 className="text-2xl font-black text-gray-900 mt-2">{event.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Info Icon={CalendarIcon} label="開催日時" value={`${event.date} ${event.startTime}〜${event.endTime}`} />
          <Info Icon={MapPinIcon} label="地域" value={event.region} />
          <Info Icon={UserIcon} label="担当管理者" value={event.managerName} />
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">{event.description}</p>
        )}
      </div>

      {/* ② OPEN/CLOSE 制御 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-black text-gray-900 mb-4">開催ステータス管理</h2>
        <div className="flex flex-wrap gap-2">
          {([
            { status: 'recruiting', label: '募集中にする', cls: 'bg-orange-500' },
            { status: 'seller_closed', label: '募集終了', cls: 'bg-gray-500' },
            { status: 'live', label: 'OPEN（LIVE開始）', cls: 'bg-red-500' },
            { status: 'ended', label: 'CLOSE（終了）', cls: 'bg-gray-700' },
            { status: 'cancelled', label: '中止', cls: 'bg-gray-400' },
          ] as const).map((b) => (
            <button
              key={b.status}
              onClick={() => handleStatusChange(b.status)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ${
                event.status === b.status ? `${b.cls} ring-2 ring-offset-2 ring-orange-300` : `${b.cls} opacity-70 hover:opacity-100`
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          現在のステータス: <span className="font-bold">{event.status}</span>
        </p>
      </div>

      {/* ④ 出店者申請・承認 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900">出店者管理</h2>
          <span className="text-sm font-bold text-gray-500">
            承認済み {approvedSellers.length}/{event.maxSellers}
          </span>
        </div>

        {/* 承認待ち */}
        {pendingSellers.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-yellow-700 mb-2">⏳ 承認待ち（{pendingSellers.length}）</p>
            <div className="space-y-2">
              {pendingSellers.map((s) => (
                <div key={s.sellerId} className="flex items-center gap-3 bg-yellow-50 rounded-xl p-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white">
                    <StoreIcon size={18} stroke={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900">{s.sellerName}</p>
                    <p className="text-xs text-gray-500">申請日: {new Date(s.appliedAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <button
                    onClick={() => updateSellerApplication(event.id, s.sellerId, 'approved')}
                    disabled={approvedSellers.length >= event.maxSellers}
                    className="w-9 h-9 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    title="承認"
                  >
                    <CheckIcon size={18} stroke={2.5} />
                  </button>
                  <button
                    onClick={() => updateSellerApplication(event.id, s.sellerId, 'rejected')}
                    className="w-9 h-9 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-all"
                    title="却下"
                  >
                    <CloseIcon size={18} stroke={2.5} />
                  </button>
                </div>
              ))}
            </div>
            {approvedSellers.length >= event.maxSellers && (
              <p className="text-xs text-red-500 mt-2">⚠️ 出店者が上限に達しています</p>
            )}
          </div>
        )}

        {/* 承認済み */}
        <div>
          <p className="text-xs font-bold text-green-700 mb-2">✅ 承認済み（{approvedSellers.length}）</p>
          {approvedSellers.length === 0 ? (
            <p className="text-sm text-gray-400 py-3 text-center">まだ承認された出店者はいません</p>
          ) : (
            <div className="space-y-2">
              {approvedSellers.map((s) => (
                <div key={s.sellerId} className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white">
                    <StoreIcon size={18} stroke={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900">{s.sellerName}</p>
                  </div>
                  <span className="text-xs text-green-600 font-bold">出店確定</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ⑤ 来場者 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-gray-900">来場者予約</h2>
          <span className="text-sm font-bold text-gray-500">
            {event.buyerReservations.length}/{event.maxBuyers} 名
          </span>
        </div>
        <div className="mt-3 w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
            style={{ width: `${Math.min(100, (event.buyerReservations.length / event.maxBuyers) * 100)}%` }}
          />
        </div>
      </div>

      {/* 削除 */}
      <button
        onClick={handleDelete}
        className="text-sm text-red-500 hover:text-red-700 font-bold"
      >
        このイベントを削除
      </button>
    </div>
  );
}

function Info({ Icon, label, value }: { Icon: React.ComponentType<{ size: number; stroke: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={18} stroke={2} className="text-orange-500 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="font-bold text-gray-900 truncate">{value}</p>
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
  return <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${s.cls}`}>{s.label}</span>;
}
