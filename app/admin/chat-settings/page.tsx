'use client';

import { getChatSettings, updateChatSettings } from '../../lib/supabaseStore';
import { useStoreData } from '../../lib/useStore';
import { ClockIcon, CheckIcon } from '../../components/Icons';
import { useState } from 'react';

export default function ChatSettingsPage() {
  const [settings] = useStoreData(getChatSettings);
  const [saved, setSaved] = useState(false);

  const update = (updates: Parameters<typeof updateChatSettings>[0]) => {
    updateChatSettings(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">チャット設定</h1>
        <p className="text-sm text-gray-600">接客チャットの動作を管理します</p>
      </div>

      {saved && (
        <div className="fixed top-20 right-6 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 z-50 shadow-lg">
          <CheckIcon size={16} stroke={2.5} /> 保存しました
        </div>
      )}

      {/* ⑨ 接客時間 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon size={20} stroke={2} className="text-orange-500" />
          <h2 className="font-black text-gray-900">接客時間の設定</h2>
        </div>

        <label className="block text-sm font-bold text-gray-700 mb-2">
          1人あたりの接客時間（分）
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={30}
            value={settings.sessionDurationSeconds / 60}
            onChange={(e) => update({ sessionDurationSeconds: Number(e.target.value) * 60 })}
            className="flex-1 accent-orange-500"
          />
          <span className="text-2xl font-black text-orange-600 w-20 text-right">
            {settings.sessionDurationSeconds / 60}分
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <Toggle
            label="時間切れで自動退出"
            description="設定時間が経過したら自動的にチャットを終了します"
            checked={settings.autoCloseOnTimeout}
            onChange={(v) => update({ autoCloseOnTimeout: v })}
          />
          <Toggle
            label="再リクエストを許可"
            description="接客終了後、同じ出店者へ再度リクエストできます（順番の最後に並びます）"
            checked={settings.allowReRequest}
            onChange={(v) => update({ allowReRequest: v })}
          />
        </div>
      </div>

      {/* ⑧ 画像送信 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-black text-gray-900 mb-4">画像送信の設定</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              画像の最大サイズ（MB）
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={settings.maxImageSizeMB}
                onChange={(e) => update({ maxImageSizeMB: Number(e.target.value) })}
                className="flex-1 accent-orange-500"
              />
              <span className="text-2xl font-black text-orange-600 w-20 text-right">
                {settings.maxImageSizeMB}MB
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              1メッセージあたりの画像枚数
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={settings.maxImagesPerMessage}
                onChange={(e) => update({ maxImagesPerMessage: Number(e.target.value) })}
                className="flex-1 accent-orange-500"
              />
              <span className="text-2xl font-black text-orange-600 w-20 text-right">
                {settings.maxImagesPerMessage}枚
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
        <p className="font-bold mb-1">現在の設定値（チャット画面に反映されます）</p>
        <p>接客時間: {settings.sessionDurationSeconds / 60}分 ・ 自動退出: {settings.autoCloseOnTimeout ? 'ON' : 'OFF'} ・ 再リクエスト: {settings.allowReRequest ? 'ON' : 'OFF'}</p>
        <p>画像: 最大{settings.maxImageSizeMB}MB ・ {settings.maxImagesPerMessage}枚まで</p>
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 bg-gray-50 rounded-xl p-3">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-all flex-shrink-0 ${checked ? 'bg-orange-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
