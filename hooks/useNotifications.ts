'use client';

import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bazaar_notifications_enabled';

export function getNotificationsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function useNotifications() {
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermission();
    if (granted) {
      localStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  }, [requestPermission]);

  const disable = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'false');
  }, []);

  const notify = useCallback((title: string, body: string, icon = '/icon-192.png') => {
    if (!getNotificationsEnabled()) return;
    if (Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return; // only notify when tab is in background

    try {
      const n = new Notification(title, { body, icon, badge: '/icon-192.png' });
      n.onclick = () => { window.focus(); n.close(); };
      setTimeout(() => n.close(), 6000);
    } catch {}
  }, []);

  return { enable, disable, notify, getNotificationsEnabled };
}
