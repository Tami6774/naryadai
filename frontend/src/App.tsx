import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { MasterView } from './pages/MasterView';
import { WorkerView } from './pages/WorkerView';
import { AnalyticsView } from './pages/AnalyticsView';
import { RatingShiftView } from './pages/RatingShiftView';

import { ServerOfflineScreen } from './components/ServerOfflineScreen';

export const AppContent: React.FC = () => {
  const { user, loading, serverConnected, recheckServer, forceOffline, setForceOffline, tr } = useAuth();
  const [currentTab, setCurrentTab] = useState<'master' | 'analytics' | 'rating'>('master');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-emerald-400 font-bold text-sm animate-pulse">
          {tr('Загрузка «НарядAI»...', '«НарядAI» жүктелуде...')}
        </div>
      </div>
    );
  }

  // Если сервер недоступен — выводим полноценный экран ошибки подключения
  if (!serverConnected && !forceOffline && !user) {
    return (
      <ServerOfflineScreen
        onConnected={recheckServer}
        onContinueOffline={() => setForceOffline(true)}
      />
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar currentTab={currentTab} setCurrentTab={(tab: any) => setCurrentTab(tab)} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {user.role === 'worker' ? (
          <WorkerView />
        ) : currentTab === 'master' ? (
          <MasterView />
        ) : currentTab === 'analytics' ? (
          <AnalyticsView />
        ) : (
          <RatingShiftView />
        )}
      </main>

      <footer className="py-3 text-center text-[11px] text-slate-600 border-t border-slate-800">
        «НарядAI» © 2026 {tr('АО «Костанайские Минералы»', '«Қостанай минералдары» АҚ')} • Qostanai AI Industry Hackathon
      </footer>
    </div>
  );
};
