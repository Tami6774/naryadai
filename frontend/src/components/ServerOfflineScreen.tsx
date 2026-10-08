import React, { useState } from 'react';
import { WifiOff, RefreshCw, Server, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { getApiBaseUrl, setApiHost, checkServerHealth } from '../api';
import { useAuth } from '../context/AuthContext';

interface ServerOfflineScreenProps {
  onConnected: () => void;
  onContinueOffline?: () => void;
}

export const ServerOfflineScreen: React.FC<ServerOfflineScreenProps> = ({
  onConnected,
  onContinueOffline,
}) => {
  const { tr } = useAuth();
  const [currentHost, setCurrentHost] = useState(() => getApiBaseUrl() || 'http://192.168.3.81:8000');
  const [customHost, setCustomHost] = useState(() => getApiBaseUrl() || 'http://192.168.3.81:8000');
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);

  const presets = [
    { label: tr('Wi-Fi ПК (192.168.3.81)', 'Wi-Fi ДК (192.168.3.81)'), url: 'http://192.168.3.81:8000' },
    { label: tr('Точка доступа (10.42.0.1)', 'Қолжетімділік нүктесі (10.42.0.1)'), url: 'http://10.42.0.1:8000' },
    { label: tr('Локально (127.0.0.1)', 'Жергілікті (127.0.0.1)'), url: 'http://127.0.0.1:8000' },
  ];

  const handleApplyPreset = (url: string) => {
    setCustomHost(url);
    setApiHost(url);
    setCurrentHost(url);
    handleRetry(url);
  };

  const handleRetry = async (hostToTest?: string) => {
    const target = hostToTest || customHost;
    if (!target) return;
    
    setIsChecking(true);
    setErrorMessage(null);
    setPingMs(null);
    setApiHost(target);
    setCurrentHost(target);

    try {
      const result = await checkServerHealth(3500);
      if (result.ok) {
        setPingMs(result.pingMs || 15);
        setTimeout(() => {
          onConnected();
        }, 500);
      } else {
        setErrorMessage(result.error || tr('Сервер не ответил на запрос health check', 'Сервер health check сұрауына жауап бермеді'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || tr('Сетевая ошибка: хост недоступен', 'Желі қатесі: хост қолжетімсіз'));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        
        {/* Верхняя статусная карточка */}
        <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse"></div>

          {/* Иконка антенны/сервера */}
          <div className="w-20 h-20 bg-red-950/60 border-2 border-red-600/80 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-red-950/50">
            <WifiOff size={38} className="text-red-400 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-white tracking-tight">
              {tr('Нет связи с сервером «НарядAI»', '«НарядAI» серверімен байланыс жоқ')}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {tr('Мобильное приложение не смогло подключиться к бэкенду. Убедитесь, что сервер запущен, а смартфон находится в одной Wi-Fi сети с сервером.', 'Мобильді қосымша бэкендке қосыла алмады. Сервердің іске қосылғанын және смартфонның сервермен бір Wi-Fi желісінде екенін тексеріңіз.')}
            </p>
          </div>

          {/* Текущий адрес */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">{tr('Целевой URL:', 'Мақсатты URL:')}</span>
            <span className="text-amber-400 font-bold truncate max-w-[220px]">{currentHost || 'http://localhost:8000'}</span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-2xl text-red-200 text-xs flex items-start space-x-2 text-left">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {pingMs !== null && (
            <div className="p-2.5 bg-emerald-950/70 border border-emerald-800 rounded-2xl text-emerald-300 text-xs flex items-center justify-center space-x-2 font-bold animate-pulse">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{tr('Связь установлена! Задержка:', 'Байланыс орнатылды! Кідіріс:')} {pingMs} {tr('мс', 'мс')}</span>
            </div>
          )}

          {/* Кнопка повторной проверки */}
          <button
            onClick={() => handleRetry()}
            disabled={isChecking}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch text-sm"
          >
            <RefreshCw size={17} className={isChecking ? 'animate-spin' : ''} />
            <span>{isChecking ? tr('Проверка соединения...', 'Байланыс тексерілуде...') : tr('Повторить попытку подключения', 'Қосылуға қайта әрекет жасау')}</span>
          </button>
        </div>

        {/* Карточка выбора адреса сервера */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <Server size={16} className="text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {tr('Настройка IP-адреса сервера', 'Сервердің IP-мекенжайын баптау')}
            </h2>
          </div>

          {/* Быстрые пресеты в один тап */}
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 font-medium">{tr('Быстрый выбор сети (в 1 тап):', 'Желіні жылдам таңдау (1 басу):')}</div>
            <div className="grid grid-cols-1 gap-2">
              {presets.map((p) => (
                <button
                  key={p.url}
                  onClick={() => handleApplyPreset(p.url)}
                  disabled={isChecking}
                  className={`py-2 px-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                    customHost === p.url
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="font-mono text-[10px] text-slate-400">{p.url}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ручной ввод URL */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="block text-[11px] text-slate-400 font-medium">
              {tr('Или введите IP вручную (http://IP:8000):', 'Немесе IP-ді қолмен енгізіңіз (http://IP:8000):')}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customHost}
                onChange={(e) => setCustomHost(e.target.value)}
                placeholder="http://192.168.3.81:8000"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleRetry(customHost)}
                disabled={isChecking}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <span>{tr('ОК', 'ОК')}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Кнопка работы в автономном режиме (если есть кэш) */}
        {onContinueOffline && (
          <div className="text-center pt-1">
            <button
              onClick={onContinueOffline}
              className="text-xs text-slate-400 hover:text-emerald-400 transition font-medium underline py-2 px-4"
            >
              {tr('Продолжить в автономном режиме (Офлайн-кэш) →', 'Автономды режимде жалғастыру (Офлайн-кэш) →')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
