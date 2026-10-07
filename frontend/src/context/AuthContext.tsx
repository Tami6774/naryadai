import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, NotificationItem } from '../types';
import { api, getToken, setToken, getWsBaseUrl, checkServerHealth } from '../api';
import { Lang, translations } from '../utils/i18n';
import {
  discardOfflineAction, getOfflineQueue, retryOfflineAction, subscribeOfflineQueue, syncOfflineQueue,
  OfflineAction, SyncResult,
} from '../utils/offlineQueue';

const OFFLINE_RETRY_MS = 30000;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (login: string, pin: string) => Promise<void>;
  quickSwitch: (login: string) => Promise<void>;
  logout: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshUser: () => Promise<void>;
  playAlertSound: (urgent?: boolean, force?: boolean) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isOnline: boolean;
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof translations['ru']) => string;
  lastEvent: any;
  offlineCount: number;
  offlineQueue: OfflineAction[];
  syncOfflineNow: () => Promise<SyncResult>;
  retryOffline: (id: string) => void;
  discardOffline: (id: string) => Promise<void>;
  serverConnected: boolean;
  recheckServer: () => Promise<boolean>;
  forceOffline: boolean;
  setForceOffline: (val: boolean) => void;
  demoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('naryad_sound') !== 'false';
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => getOfflineQueue());
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('naryad_lang') as Lang) || 'ru';
  });
  const [serverConnected, setServerConnected] = useState<boolean>(true);
  const [forceOffline, setForceOffline] = useState<boolean>(false);
  // Демо-режим сервера (быстрый вход, подсказка ПИН). Старый сервер без флага — считаем включённым
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const wsRef = useRef<WebSocket | null>(null);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('naryad_lang', newLang);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('naryad_sound', String(next));
      return next;
    });
  }, []);

  const t = useCallback((key: keyof typeof translations['ru']): string => {
    const dict = translations[lang] || translations['ru'];
    return (dict as any)[key] || (translations['ru'] as any)[key] || key;
  }, [lang]);

  // Офлайн-очередь подписка
  useEffect(() => {
    return subscribeOfflineQueue((q) => {
      setOfflineQueue(q);
    });
  }, []);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Разблокировка Web Audio по первому клику/тачу пользователя (Autoplay Policy)
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
    };
  }, []);

  const playAlertSound = useCallback((urgent = false, force = false) => {
    if (!soundEnabled && !force) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (urgent) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // AudioContext may be restricted by browser policy before first gesture
    }
  }, [soundEnabled]);

  const loadNotifications = useCallback(async () => {
    if (!getToken()) return;
    try {
      const items = await api.getNotifications();
      setNotifications(items);
    } catch (err) {
      console.warn('Failed to load notifications', err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
      await loadNotifications();
    } catch (err) {
      console.error('Auth error', err);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadNotifications]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const recheckServer = useCallback(async (): Promise<boolean> => {
    const res = await checkServerHealth(3500);
    setServerConnected(res.ok);
    if (res.demoMode !== undefined) setDemoMode(res.demoMode);
    if (res.ok) {
      setForceOffline(false);
      await refreshUser();
    }
    return res.ok;
  }, [refreshUser]);

  useEffect(() => {
    checkServerHealth(3500).then((res) => {
      setServerConnected(res.ok);
      if (res.demoMode !== undefined) setDemoMode(res.demoMode);
    });
  }, []);

  const syncOfflineNow = useCallback(async () => {
    const res = await syncOfflineQueue({
      applyAction: api.applyActionDirect,
      uploadPhoto: api.uploadPhoto,
      getOrder: api.getOrder,
    });
    if (res.synced > 0) {
      await refreshUser();
    }
    return res;
  }, [refreshUser]);

  const pendingCount = offlineQueue.filter(x => x.status === 'pending').length;

  // Фоновая синхронизация при возвращении сети online и при появлении новых действий
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncOfflineNow();
    }
  }, [isOnline, pendingCount, syncOfflineNow]);

  // Повтор по таймеру: navigator.onLine остаётся true, когда Wi-Fi есть, а сервер недоступен
  useEffect(() => {
    if (pendingCount === 0) return;
    const timer = setInterval(() => {
      syncOfflineNow();
    }, OFFLINE_RETRY_MS);
    return () => clearInterval(timer);
  }, [pendingCount, syncOfflineNow]);

  const retryOffline = useCallback((id: string) => {
    retryOfflineAction(id);
  }, []);

  const discardOffline = useCallback(async (id: string) => {
    await discardOfflineAction(id);
  }, []);

  const playAlertSoundRef = useRef(playAlertSound);
  useEffect(() => {
    playAlertSoundRef.current = playAlertSound;
  }, [playAlertSound]);

  // WebSocket Connection с автоматическим переподключением (экспоненциальный backoff)
  useEffect(() => {
    const token = getToken();
    if (!token || !user) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    let isCancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let delay = 1000;
    const maxDelay = 30000;
    let hasConnected = false;

    const connect = () => {
      if (isCancelled) return;
      const currentToken = getToken();
      if (!currentToken) return;

      const wsBase = getWsBaseUrl();
      const wsUrl = `${wsBase}/ws?token=${currentToken}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCancelled) {
          ws.close();
          return;
        }
        delay = 1000; // Сброс задержки при успешном подключении
        loadNotifications();
        // После переподключения — синтетическое событие: экраны перезагрузят пропущенные изменения
        if (hasConnected) setLastEvent({ type: 'reconnected' });
        hasConnected = true;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);
          if (data.type === 'notification') {
            playAlertSoundRef.current(data.notification?.urgent);
            setNotifications(prev => [data.notification, ...prev]);
          }
        } catch (err) {
          console.error('WS parse error', err);
        }
      };

      ws.onclose = (event) => {
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        if (isCancelled) return;

        // 4401 — сервер отклонил токен (истёк/недействителен): переподключение бессмысленно
        if (event.code === 4401) {
          setToken(null);
          setUser(null);
          return;
        }

        // Повторное подключение с экспоненциальным backoff (1s -> 2s -> 4s ... макс 30s)
        reconnectTimer = setTimeout(() => {
          delay = Math.min(delay * 2, maxDelay);
          connect();
        }, delay);
      };

      ws.onerror = () => {
        // ws.onclose вызовется автоматически и обработает переподключение
      };

      if (pingInterval) clearInterval(pingInterval);
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 15000);
    };

    connect();

    return () => {
      isCancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingInterval) clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // Зависимость от id, а не объекта: refreshUser() не должен рвать рабочее соединение
  }, [user?.id, loadNotifications]);

  const login = async (loginName: string, pin: string) => {
    try {
      const res = await api.login(loginName, pin);
      setToken(res.token);
      setUser(res.user);
      setServerConnected(true);
      await loadNotifications();
    } catch (err: any) {
      if (err.message && (err.message.includes('Сетевая ошибка') || err.message.includes('Failed to fetch') || err.message.includes('Таймаут'))) {
        setServerConnected(false);
      }
      throw err;
    }
  };

  const quickSwitch = async (loginName: string) => {
    await login(loginName, '1234');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      quickSwitch,
      logout,
      notifications,
      unreadCount,
      refreshUser,
      playAlertSound,
      soundEnabled,
      toggleSound,
      isOnline,
      lang,
      setLang,
      t,
      lastEvent,
      offlineCount: offlineQueue.length,
      offlineQueue,
      syncOfflineNow,
      retryOffline,
      discardOffline,
      serverConnected,
      recheckServer,
      forceOffline,
      setForceOffline,
      demoMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
