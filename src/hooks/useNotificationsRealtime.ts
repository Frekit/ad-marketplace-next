import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
  updated_at?: string;
}

export function useNotificationsRealtime(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let isSubscribed = true;

    // 1. Cargar notificaciones iniciales
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('[useNotificationsRealtime] Error loading notifications:', error);
          return;
        }

        if (isSubscribed && data) {
          setNotifications(data as Notification[]);
          const unread = data.filter((n: any) => !n.read_at).length;
          setUnreadCount(unread);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    // 2. Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (isSubscribed) {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (isSubscribed) {
            const updated = payload.new as Notification;
            const oldData = payload.old as any;

            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );

            // Si se marcó como leído
            if (updated.read_at && !oldData.read_at) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
            // Si se desmarcó como leído (raro, pero posible)
            if (!updated.read_at && oldData.read_at) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      channel.unsubscribe();
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
  };

  const markAllAsRead = async () => {
    const supabase = createClient();
    const unreadIds = notifications
      .filter((n) => !n.read_at)
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}
