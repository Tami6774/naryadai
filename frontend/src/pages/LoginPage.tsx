import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Wrench, BarChart2, Key, AlertTriangle, ArrowRight, Settings, Smartphone, Globe } from 'lucide-react';
import { api, getApiBaseUrl, setApiHost } from '../api';

export const LoginPage: React.FC = () => {
  const { login, quickSwitch, demoMode, lang, setLang, tr } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverHost, setServerHost] = useState(() => getApiBaseUrl() || '');
  const [isEditingHost, setIsEditingHost] = useState(false);
  const [customHostInput, setCustomHostInput] = useState(() => getApiBaseUrl() || 'http://10.42.0.1:8000');
  // Страница открыта на самом ПК с сервером — показываем адрес и QR-код для телефонов
  const openedOnServerPc = ['localhost', '127.0.0.1'].includes(window.location.hostname) && !getApiBaseUrl();
  const [phoneUrls, setPhoneUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!openedOnServerPc) return;
    api.getConnectInfo().then(r => setPhoneUrls(r.urls)).catch(() => setPhoneUrls([]));
  }, [openedOnServerPc]);

  const demoAccounts = [
    { login: 'master1', name: tr('Исмаилов Марат', 'Исмаилов Марат'), role: tr('Мастер смены', 'Ауысым шебері'), icon: Shield, color: 'text-emerald-400' },
    { login: 'ahmetov', name: 'Ахметов Ерлан', role: tr('Слесарь (свободен)', 'Слесарь (бос)'), icon: Wrench, color: 'text-blue-400' },
    { login: 'serikov', name: 'Сериков Данияр', role: tr('Слесарь (в работе)', 'Слесарь (жұмыста)'), icon: Wrench, color: 'text-amber-400' },
    { login: 'boss', name: tr('Сагинтаев Болат', 'Сағынтаев Болат'), role: tr('Главный механик', 'Бас механик'), icon: BarChart2, color: 'text-purple-400' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !pinInput) {
      setError(tr('Введите логин и ПИН-код', 'Логин мен ПИН-кодты енгізіңіз'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(loginInput, pinInput);
    } catch (err: any) {
      setError(err.message || tr('Ошибка входа', 'Кіру қатесі'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
            className="flex items-center space-x-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-3 min-h-[48px] rounded-lg border border-slate-600 font-bold transition"
            title="Тілді ауыстыру / Сменить язык"
          >
            <Globe size={14} className="text-emerald-400" />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>

        {/* Логотип */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-emerald-950">
            НAI
          </div>
          <h1 className="text-2xl font-black text-white">«НарядAI»</h1>
          <p className="text-xs text-slate-400">
            {tr('АО «Костанайские Минералы»', '«Қостанай минералдары» АҚ')} • {tr('«Наряд выдан — ИИ на контроле»', '«Наряд берілді — ЖИ бақылауда»')}
          </p>
        </div>

        {/* Форма входа */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200">{tr('Вход по логину и ПИН-коду', 'Логин және ПИН-код арқылы кіру')}</h2>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{tr('Логин', 'Логин')}</label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="master1 / ahmetov / serikov / boss"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">{tr('ПИН-код', 'ПИН-код')}{demoMode ? tr(' (демо: 1234)', ' (демо: 1234)') : ''}</label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-center text-lg tracking-widest focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch disabled:opacity-50"
            >
              <Key size={16} />
              <span>{loading ? tr('Вход...', 'Кіру...') : tr('Войти в систему', 'Жүйеге кіру')}</span>
            </button>
          </form>

          {/* Быстрый вход для Demo Day (скрыт, если сервер запущен с DEMO_MODE=false) */}
          {demoMode && (
          <div className="pt-4 border-t border-slate-700/60 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              {tr('Быстрый вход для защиты на Demo Day (1 клик):', 'Demo Day қорғауы үшін жылдам кіру (1 басу):')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.login}
                  type="button"
                  onClick={() => quickSwitch(acc.login)}
                  className="p-2.5 bg-slate-900/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 text-left transition flex items-center space-x-2 group"
                >
                  <acc.icon size={16} className={acc.color} />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 truncate">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{acc.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Открыть на телефоне: адрес в локальной сети + QR-код */}
          {openedOnServerPc && phoneUrls.length > 0 && (
            <div className="pt-3 border-t border-slate-700/60 text-xs">
              <div className="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                <img
                  src={api.getConnectQrUrl(phoneUrls[0])}
                  alt={tr('QR-код для входа с телефона', 'Телефоннан кіруге арналған QR-код')}
                  className="w-24 h-24 bg-white rounded-lg p-1 shrink-0"
                />
                <div className="space-y-1">
                  <div className="font-bold text-slate-200 flex items-center space-x-1">
                    <Smartphone size={14} className="text-emerald-400" />
                    <span>{tr('Открыть на телефоне', 'Телефонда ашу')}</span>
                  </div>
                  <div className="text-slate-400">{tr('Подключите телефон к той же сети Wi-Fi и отсканируйте QR-код или введите:', 'Телефонды сол Wi-Fi желісіне қосып, QR-кодты сканерлеңіз немесе енгізіңіз:')}</div>
                  {phoneUrls.map(u => (
                    <div key={u} className="font-mono text-emerald-400 break-all">{u}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Скачать APK */}
          <div className="pt-3 border-t border-slate-700/60 text-center">
            <a
              href="/media/naryad-ai.apk"
              download
              className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-4 py-2.5 rounded-xl transition shadow"
            >
              <span>{tr('📲 Скачать установочный APK (Android)', '📲 Орнату APK жүктеу (Android)')}</span>
            </a>
          </div>

          {/* Настройка адреса сервера API (для мобильного приложения / Wi-Fi) */}
          <div className="pt-3 border-t border-slate-700/60 text-xs">
            {isEditingHost ? (
              <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-700">
                <label className="text-slate-300 font-semibold block text-[11px]">
                  {tr('Адрес сервера API:', 'API сервер мекенжайы:')}
                </label>
                <input
                  type="text"
                  value={customHostInput}
                  onChange={(e) => setCustomHostInput(e.target.value)}
                  placeholder={tr('Например: http://10.42.0.1:8000', 'Мысалы: http://10.42.0.1:8000')}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomHostInput('');
                      setApiHost(null);
                      setServerHost('');
                      setIsEditingHost(false);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                  >
                    {tr('Сбросить (авто)', 'Бастапқыға қайтару (авто)')}
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingHost(false)}
                      className="px-2.5 py-1 text-slate-400 hover:text-white text-xs"
                    >
                      {tr('Отмена', 'Бас тарту')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setApiHost(customHostInput);
                        setServerHost(customHostInput);
                        setIsEditingHost(false);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                    >
                      {tr('Сохранить', 'Сақтау')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-slate-400 px-1">
                <span className="truncate text-[11px] flex items-center space-x-1">
                  <Settings size={12} className="text-slate-500" />
                  <span>{tr('Сервер:', 'Сервер:')}</span>
                  <span className="font-mono text-slate-300 truncate max-w-[170px]">
                    {serverHost || tr('авто (текущий хост)', 'авто (ағымдағы хост)')}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomHostInput(getApiBaseUrl() || (window.location.origin.includes('localhost') ? 'http://10.42.0.1:8000' : window.location.origin));
                    setIsEditingHost(true);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold underline ml-2"
                >
                  {tr('Изменить', 'Өзгерту')}
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
