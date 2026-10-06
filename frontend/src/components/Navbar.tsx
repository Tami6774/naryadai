import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, LogOut, Shield, Wrench, BarChart2, RefreshCw, 
  Wifi, WifiOff, Volume2, VolumeX, Globe 
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    user, quickSwitch, logout, notifications, unreadCount,
    soundEnabled, toggleSound, playAlertSound, isOnline, lang, setLang, t,
    offlineCount, syncOfflineNow
  } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const demoUsers = [
    { login: 'master1', name: 'Исмаилов М. (Мастер смены)', role: 'master', icon: Shield },
    { login: 'ahmetov', name: 'Ахметов Е. (Слесарь, свободен)', role: 'worker', icon: Wrench },
    { login: 'serikov', name: 'Сериков Д. (Слесарь, в работе)', role: 'worker', icon: Wrench },
    { login: 'boss', name: 'Сагинтаев Б. (Гл. механик)', role: 'manager', icon: BarChart2 },
  ];

  return (
    <>
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Логотип и слоган */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl font-black text-xl tracking-wider shadow-lg shadow-emerald-900/40">
              НAI
            </div>
            <div>
              <div className="font-bold text-lg text-white leading-tight flex items-center gap-2">
                {t('appName')}
                <span className="text-[10px] uppercase font-semibold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  {t('orgName')}
                </span>
              </div>
              <div className="text-xs text-slate-400 hidden sm:block">
                {t('slogan')}
              </div>
            </div>
          </div>

          {/* Навигационные табы (для мастера/руководителя) */}
          {user && user.role !== 'worker' && (
            <nav className="hidden md:flex space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setCurrentTab('master')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentTab === 'master' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('tabMaster')}
              </button>
              <button
                onClick={() => setCurrentTab('analytics')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentTab === 'analytics' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('tabAnalytics')}
              </button>
              <button
                onClick={() => setCurrentTab('rating')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentTab === 'rating' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('tabRating')}
              </button>
            </nav>
          )}

          {/* Правый блок: Индикатор сети, Звук, Язык, Демо-роль, Колокольчик */}
          {user && (
            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              
              {/* Индикатор онлайн/офлайн */}
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                  isOnline 
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                    : 'bg-red-950/60 border-red-700 text-red-300 animate-pulse'
                }`}
                title={isOnline ? t('online') : t('offline')}
              >
                {isOnline ? <Wifi size={13} className="text-emerald-400" /> : <WifiOff size={13} className="text-red-400" />}
                <span className="hidden xl:inline">{isOnline ? t('online') : t('offline')}</span>
              </div>

              {/* Очередь офлайн-действий */}
              {offlineCount > 0 && (
                <button
                  onClick={() => syncOfflineNow()}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950/80 border border-amber-500 text-amber-200 hover:bg-amber-900 transition shadow animate-pulse"
                  title="Есть сохранённые офлайн-действия. Нажмите для синхронизации с сервером"
                >
                  <RefreshCw size={12} className="text-amber-400" />
                  <span>{offlineCount} {lang === 'kz' ? 'офлайн' : 'офлайн'}</span>
                </button>
              )}

              {/* Переключатель звука + тест звука */}
              <div className="flex items-center bg-slate-700/60 rounded-lg border border-slate-600">
                <button
                  onClick={toggleSound}
                  className={`p-1.5 rounded-l-lg transition ${
                    soundEnabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={soundEnabled ? t('soundOn') : t('soundMuted')}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => playAlertSound(true, true)}
                  className="px-1.5 py-1 text-[10px] text-slate-400 hover:text-white border-l border-slate-600 font-semibold"
                  title="Тест звукового оповещения"
                >
                  Тест
                </button>
              </div>

              {/* Переключатель языка RU / KZ */}
              <button
                onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
                className="flex items-center space-x-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-2 py-1.5 rounded-lg border border-slate-600 font-bold transition"
                title="Тілді ауыстыру / Сменить язык"
              >
                <Globe size={13} className="text-emerald-400" />
                <span>{lang.toUpperCase()}</span>
              </button>

              {/* Кнопка быстрого переключения роли для Демо */}
              <div className="relative">
                <button
                  onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                  className="flex items-center space-x-1 text-xs bg-slate-700/80 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-600 transition"
                  title="Переключить роль для демонстрации"
                >
                  <RefreshCw size={13} className="text-emerald-400" />
                  <span className="hidden sm:inline">Роль:</span>
                  <span className="font-semibold text-emerald-400">{user.short_name}</span>
                </button>

                {showSwitchMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 z-50">
                    <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700/60 mb-1">
                      Быстрое переключение (Demo Day)
                    </div>
                    {demoUsers.map((u) => (
                      <button
                        key={u.login}
                        onClick={() => {
                          quickSwitch(u.login);
                          setShowSwitchMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 transition ${
                          user.login === u.login ? 'bg-emerald-950/60 text-emerald-300 font-semibold' : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <u.icon size={15} className={user.login === u.login ? 'text-emerald-400' : 'text-slate-400'} />
                        <span>{u.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Колокольчик уведомлений */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg relative transition"
                  title="Уведомления"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                      <span className="font-semibold text-sm text-slate-200">Уведомления ИИ</span>
                      <span className="text-xs text-slate-400">{notifications.length} событий</span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Уведомлений нет</div>
                    ) : (
                      <div className="divide-y divide-slate-700/50">
                        {notifications.map((n) => (
                          <div key={n.id} className={`p-3 text-xs ${n.urgent ? 'bg-red-950/20' : ''}`}>
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span className={n.urgent ? 'text-red-400' : 'text-emerald-400'}>
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Кнопка выхода */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 bg-slate-700/60 hover:bg-slate-700 rounded-lg transition"
                title="Выйти"
              >
                <LogOut size={17} />
              </button>

            </div>
          )}

        </div>
      </header>

      {/* Мобильная панель переключения вкладок (для мастера и руководителя) */}
      {user && user.role !== 'worker' && (
        <div className="md:hidden bg-slate-900 border-b border-slate-700/80 px-3 py-2 flex space-x-1.5 overflow-x-auto shadow-inner">
          <button
            onClick={() => setCurrentTab('master')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center whitespace-nowrap transition btn-touch ${
              currentTab === 'master' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {t('tabMaster')}
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center whitespace-nowrap transition btn-touch ${
              currentTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {t('tabAnalytics')}
          </button>
          <button
            onClick={() => setCurrentTab('rating')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center whitespace-nowrap transition btn-touch ${
              currentTab === 'rating' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {t('tabRating')}
          </button>
        </div>
      )}

      {/* Оповещение об отключении от сети (офлайн-индикатор) */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center shadow flex items-center justify-center space-x-2">
          <WifiOff size={14} />
          <span>Связь с сервером прервана. НарядAI работает в автономном режиме кэширования.</span>
        </div>
      )}
    </>
  );
};

