import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Wrench, BarChart2, Key, AlertTriangle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickSwitch } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { login: 'master1', name: 'Исмаилов Марат', role: 'Мастер смены', icon: Shield, color: 'text-emerald-400' },
    { login: 'ahmetov', name: 'Ахметов Ерлан', role: 'Слесарь (свободен)', icon: Wrench, color: 'text-blue-400' },
    { login: 'serikov', name: 'Сериков Данияр', role: 'Слесарь (в работе)', icon: Wrench, color: 'text-amber-400' },
    { login: 'boss', name: 'Сагинтаев Болат', role: 'Главный механик', icon: BarChart2, color: 'text-purple-400' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !pinInput) {
      setError('Введите логин и ПИН-код');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(loginInput, pinInput);
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Логотип */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-emerald-950">
            НAI
          </div>
          <h1 className="text-2xl font-black text-white">«НарядAI»</h1>
          <p className="text-xs text-slate-400">
            АО «Костанайские Минералы» • «Наряд выдан — ИИ на контроле»
          </p>
        </div>

        {/* Форма входа */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200">Вход по логину и ПИН-коду</h2>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Логин</label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="master1 / ahmetov / serikov / boss"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">ПИН-код (демо: 1234)</label>
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
              <span>{loading ? 'Вход...' : 'Войти в систему'}</span>
            </button>
          </form>

          {/* Быстрый вход для Demo Day */}
          <div className="pt-4 border-t border-slate-700/60 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Быстрый вход для защиты на Demo Day (1 клик):
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

          {/* Скачать APK */}
          <div className="pt-3 border-t border-slate-700/60 text-center">
            <a
              href="/media/naryad-ai.apk"
              download
              className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-4 py-2.5 rounded-xl transition shadow"
            >
              <span>📲 Скачать установочный APK (Android)</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
