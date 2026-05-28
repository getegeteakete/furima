'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminEvent, getEventManagers } from '../../../lib/mockStore';
import { useStoreData, PREFECTURES } from '../../../lib/useStore';
import { CheckIcon } from '../../../components/Icons';

export default function CreateEventPage() {
  const router = useRouter();
  const [managers] = useStoreData(getEventManagers);

  const [form, setForm] = useState({
    title: '',
    date: '',
    startTime: '20:00',
    endTime: '22:00',
    region: '滋賀県',
    description: '',
    maxSellers: 5,
    maxBuyers: 100,
    managerId: managers[0]?.id || '',
  });
  const [created, setCreated] = useState(false);

  const set = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.title || !form.date || !form.managerId) {
      alert('タイトル・開催日・管理者は必須です');
      return;
    }
    const manager = managers.find((m) => m.id === form.managerId);
    createAdminEvent({
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      region: form.region,
      description: form.description,
      maxSellers: Number(form.maxSellers),
      maxBuyers: Number(form.maxBuyers),
      status: 'recruiting',
      managerId: form.managerId,
      managerName: manager?.name || '',
    });
    setCreated(true);
    setTimeout(() => router.push('/admin/events'), 1200);
  };

  if (created) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
          <CheckIcon size={40} stroke={2.5} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">イベントを作成しました！</h2>
        <p className="text-sm text-gray-500 mt-2">イベント管理ページへ移動します...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">イベント作成</h1>
        <p className="text-sm text-gray-600">運営がイベントを作成し、出店者を募集します</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        {/* タイトル */}
        <Field label="イベントタイトル" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="【滋賀】夜のハンドメイドフリマ"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </Field>

        {/* 日時 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="開催日" required>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </Field>
          <Field label="開始時間">
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </Field>
          <Field label="終了時間">
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => set('endTime', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </Field>
        </div>

        {/* 地域 */}
        <Field label="開催地域" required>
          <select
            value={form.region}
            onChange={(e) => set('region', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
          >
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        {/* ④ イベント管理者割当 */}
        <Field label="担当イベント管理者" required>
          <select
            value={form.managerId}
            onChange={(e) => set('managerId', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
          >
            <option value="">--- 選択してください ---</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}（{m.role === 'admin' ? '管理者' : 'イベント管理者'}）</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">※ ユーザー・権限ページで管理者を追加できます</p>
        </Field>

        {/* ⑤ 参加者上限設定 */}
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-sm font-bold text-orange-700 mb-3">参加者上限設定</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="出店者の上限数">
              <input
                type="number"
                min={1}
                max={50}
                value={form.maxSellers}
                onChange={(e) => set('maxSellers', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </Field>
            <Field label="来場者の上限数">
              <input
                type="number"
                min={1}
                max={1000}
                value={form.maxBuyers}
                onChange={(e) => set('maxBuyers', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </Field>
          </div>
        </div>

        {/* 説明 */}
        <Field label="イベント説明">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="このイベントについて..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
          />
        </Field>

        <button
          onClick={handleSubmit}
          className="w-full py-3.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all active:scale-[0.99]"
        >
          イベントを作成して募集開始
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
