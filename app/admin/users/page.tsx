'use client';

import { getUsers, updateUserRole, type UserRole } from '../../lib/supabaseStore';
import { useStoreData } from '../../lib/useStore';
import { UserIcon } from '../../components/Icons';

const ROLE_LABELS: Record<UserRole, { label: string; cls: string }> = {
  admin: { label: '運営管理者', cls: 'bg-purple-100 text-purple-700' },
  event_manager: { label: 'イベント管理者', cls: 'bg-blue-100 text-blue-700' },
  seller: { label: '出店者', cls: 'bg-orange-100 text-orange-700' },
  buyer: { label: '購入者', cls: 'bg-gray-100 text-gray-600' },
};

export default function AdminUsersPage() {
  const [users] = useStoreData(getUsers);

  const managers = users.filter((u) => u.role === 'event_manager' || u.role === 'admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">ユーザー・権限管理</h1>
        <p className="text-sm text-gray-600">
          イベント管理者: {managers.length}名 / 全{users.length}名
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          💡 ユーザーに「イベント管理者」権限を付与すると、イベント作成時に担当者として割り当てられます。
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {users.map((u, i) => (
          <div
            key={u.id}
            className={`flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 p-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}
          >
            <div className="w-11 h-11 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <UserIcon size={20} stroke={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate">{u.name}</p>
              <p className="text-xs text-gray-500 truncate">{u.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${ROLE_LABELS[u.role].cls}`}>
              {ROLE_LABELS[u.role].label}
            </span>
            {/* スマホでは下段に全幅で表示 */}
            <select
              value={u.role}
              onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 sm:py-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-orange-500 outline-none flex-shrink-0 order-last sm:order-none"
            >
              <option value="admin">運営管理者</option>
              <option value="event_manager">イベント管理者</option>
              <option value="seller">出店者</option>
              <option value="buyer">購入者</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
