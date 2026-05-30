'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from './AuthProvider';
import { isSupabaseConfigured } from '../lib/supabase/client';
import {
  fetchNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
  subscribeToNotifications,
  type AppNotification,
} from '../lib/supabaseStore';

export type NotificationType = 'open' | 'event_start' | 'turn' | 'follow' | 'like' | 'info';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  eventName?: string;
  eventId?: string;
  timestamp: Date;
  read: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  /** 自分宛ての通知を作成（DBに永続化）。未ログイン時は何もしない */
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// DB行(AppNotification) → UI型(Notification)
function toUi(n: AppNotification): Notification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    eventName: n.eventName,
    eventId: n.eventId,
    timestamp: new Date(n.createdAt),
    read: n.read,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const userId = profile?.id ?? null;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userIdRef = useRef<string | null>(null);

  // ユーザー確定時に通知を読み込み + Realtime購読
  useEffect(() => {
    userIdRef.current = userId;
    if (!userId || !isSupabaseConfigured) return;

    let active = true;
    fetchNotifications(userId).then((rows) => {
      if (active) setNotifications(rows.map(toUi));
    });

    const unsubscribe = subscribeToNotifications(userId, ({ eventType, row, oldId }) => {
      setNotifications((prev) => {
        if (eventType === 'INSERT' && row) {
          if (prev.some((n) => n.id === row.id)) return prev;
          return [toUi(row), ...prev];
        }
        if (eventType === 'UPDATE' && row) {
          return prev.map((n) => (n.id === row.id ? toUi(row) : n));
        }
        if (eventType === 'DELETE' && oldId) {
          return prev.filter((n) => n.id !== oldId);
        }
        return prev;
      });
    });

    // ログアウト/ユーザー切替時はクリーンアップで購読解除＆一覧クリア
    return () => {
      active = false;
      unsubscribe();
      setNotifications([]);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const uid = userIdRef.current;
      if (!uid) return; // 未ログインでは送信先がないため何もしない
      // 楽観追加（Realtimeでも届くが即時反映のため）
      const tempId = `temp-${Date.now()}`;
      setNotifications((prev) => [
        {
          ...notification,
          id: tempId,
          timestamp: new Date(),
          read: false,
        },
        ...prev,
      ]);
      createNotification({
        userId: uid,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        eventId: notification.eventId,
        eventName: notification.eventName,
      }).then((created) => {
        if (created) {
          // 仮IDを実IDへ差し替え（Realtime重複は id 一致で吸収される）
          setNotifications((prev) =>
            prev.some((n) => n.id === created.id)
              ? prev.filter((n) => n.id !== tempId)
              : prev.map((n) => (n.id === tempId ? toUi(created) : n)),
          );
        }
      });
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    void deleteNotification(id);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    void markNotificationRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const uid = userIdRef.current;
    if (uid) void markAllNotificationsRead(uid);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    const uid = userIdRef.current;
    if (uid) void clearNotifications(uid);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
