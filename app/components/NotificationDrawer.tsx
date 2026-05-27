'use client';

import Link from 'next/link';
import { useNotifications } from './NotificationContext';
import { BellIcon, CloseIcon, CheckIcon, BoltIcon, CalendarIcon, UserIcon, HeartIcon, ArrowRightIcon } from './Icons';

type NotificationDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const getIconByType = (type: string) => {
  switch (type) {
    case 'open':
      return <BoltIcon size={16} stroke={2} className="text-orange-600" />;
    case 'event_start':
      return <CalendarIcon size={16} stroke={2} className="text-blue-600" />;
    case 'turn':
      return <UserIcon size={16} stroke={2} className="text-purple-600" />;
    case 'follow':
      return <UserIcon size={16} stroke={2} className="text-gray-600" />;
    case 'like':
      return <HeartIcon size={16} stroke={2} className="text-red-600" />;
    default:
      return <BellIcon size={16} stroke={2} className="text-gray-600" />;
  }
};

const getBgByType = (type: string) => {
  switch (type) {
    case 'open':
      return 'bg-orange-50';
    case 'event_start':
      return 'bg-blue-50';
    case 'turn':
      return 'bg-purple-50';
    case 'follow':
      return 'bg-gray-50';
    case 'like':
      return 'bg-red-50';
    default:
      return 'bg-gray-50';
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  
  if (minutes < 1) return '今';
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  
  return date.toLocaleDateString('ja-JP');
};

export default function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-16 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl z-50 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">通知</h2>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline transition-colors"
              >
                すべて既読
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close notifications"
            >
              <CloseIcon size={20} stroke={2} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    notification.read
                      ? 'border-l-transparent bg-white dark:bg-gray-900'
                      : 'border-l-orange-500 bg-orange-50 dark:bg-gray-800'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${getBgByType(notification.type)}`}>
                      {getIconByType(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{notification.title}</p>
                        {!notification.read && (
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">NEW</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>

                    {notification.eventId && (
                      <Link href={`/event/${notification.eventId}`} className="flex-shrink-0">
                        <button
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                          }}
                        >
                          <ArrowRightIcon size={16} stroke={2} className="text-orange-600 dark:text-orange-400" />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-gray-400 dark:text-gray-600">
                <BellIcon size={24} stroke={1.5} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">通知はありません</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              onClick={clearAll}
              className="w-full text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors py-2"
            >
              すべてクリア
            </button>
          </div>
        )}
      </div>
    </>
  );
}
