import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { api, ReportParams } from '../api';
import { useAuth } from '../context/AuthContext';

/** Период отчёта (раздел 7 кейса): смена, сутки, неделя, месяц или произвольный. */
export type PeriodPreset = 'shift' | 'day' | 'week' | 'month' | 'custom';

const PRESETS: Array<{ id: PeriodPreset; label: string; kz: string }> = [
  { id: 'shift', label: 'Смена', kz: 'Ауысым' },
  { id: 'day', label: 'Сутки', kz: 'Тәулік' },
  { id: 'week', label: 'Неделя', kz: 'Апта' },
  { id: 'month', label: 'Месяц', kz: 'Ай' },
  { id: 'custom', label: 'Период', kz: 'Кезең' },
];

// Локальное время ПК без пояса — в этом формате сервер хранит и сравнивает даты
const pad = (n: number) => String(n).padStart(2, '0');
export const localIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
const dateInput = (d: Date) => localIso(d).slice(0, 10);

/** Границы текущей смены — как на сервере (reports.current_shift): день 08–20, ночь 20–08. */
export function currentShiftBounds(now: Date = new Date()): { start: Date; end: Date; night: boolean } {
  const h = now.getHours();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (h >= 8 && h < 20) {
    return { start: new Date(base.getTime() + 8 * 3600000), end: new Date(base.getTime() + 20 * 3600000), night: false };
  }
  const nightStart = new Date(base.getTime() + (h >= 20 ? 20 : -4) * 3600000);
  return { start: nightStart, end: new Date(nightStart.getTime() + 12 * 3600000), night: true };
}

export interface PeriodValue {
  params: ReportParams;
  label: string;
}

interface Props {
  onChange: (value: PeriodValue) => void;
  showSection?: boolean;
  showBrigade?: boolean;
  defaultPreset?: PeriodPreset;
  presets?: PeriodPreset[];
}

export const PeriodFilter: React.FC<Props> = ({
  onChange, showSection = false, showBrigade = false, defaultPreset = 'shift', presets,
}) => {
  const { tr, lang } = useAuth();
  const locale = lang === 'kz' ? 'kk-KZ' : 'ru-RU';
  const [preset, setPreset] = useState<PeriodPreset>(defaultPreset);
  const [from, setFrom] = useState(() => dateInput(new Date(Date.now() - 7 * 86400000)));
  const [to, setTo] = useState(() => dateInput(new Date()));
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [brigadeId, setBrigadeId] = useState<number | ''>('');
  const [sections, setSections] = useState<Array<{ id: number; name: string }>>([]);
  const [brigades, setBrigades] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    if (!showSection && !showBrigade) return;
    api.getDictionaries()
      .then(d => { setSections(d.sections); setBrigades(d.brigades || []); })
      .catch(() => {});
  }, [showSection, showBrigade]);

  const value = useMemo<PeriodValue>(() => {
    const now = new Date();
    const filters: ReportParams = {
      ...(showSection && sectionId ? { section_id: sectionId } : {}),
      ...(showBrigade && brigadeId ? { brigade_id: brigadeId } : {}),
    };
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let params: ReportParams;
    let label: string;
    switch (preset) {
      case 'shift': {
        const sh = currentShiftBounds(now);
        params = { start: localIso(sh.start), end: localIso(sh.end) };
        label = sh.night
          ? tr('текущую ночную смену', 'ағымдағы түнгі ауысым')
          : tr('текущую дневную смену', 'ағымдағы күндізгі ауысым');
        break;
      }
      case 'day':
        params = { start: localIso(startOfDay), end: localIso(now) };
        label = tr('сутки', 'тәулік');
        break;
      case 'week':
        params = { start: localIso(new Date(now.getTime() - 7 * 86400000)), end: localIso(now) };
        label = tr('неделю', 'апта');
        break;
      case 'month':
        params = { start: localIso(new Date(now.getTime() - 30 * 86400000)), end: localIso(now) };
        label = tr('месяц', 'ай');
        break;
      default: {
        const s = new Date(`${from}T00:00:00`);
        const e = new Date(`${to}T23:59:59`);
        params = { start: localIso(s), end: localIso(e) };
        label = `${s.toLocaleDateString(locale)} – ${e.toLocaleDateString(locale)}`;
      }
    }
    const filterLabel = [
      sectionId && sections.find(x => x.id === sectionId)?.name,
      brigadeId && brigades.find(x => x.id === brigadeId)?.name,
    ].filter(Boolean).join(', ');
    return { params: { ...params, ...filters }, label: filterLabel ? `${label} (${filterLabel})` : label };
  }, [preset, from, to, sectionId, brigadeId, sections, brigades, showSection, showBrigade, lang]);

  useEffect(() => {
    onChange(value);  // onChange не в зависимостях: родитель передаёт новую функцию на каждый рендер
  }, [value]);

  const visible = PRESETS.filter(p => !presets || presets.includes(p.id));
  const selectCls = 'min-h-[40px] bg-slate-900 border border-slate-700 rounded-xl px-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500';

  return (
    <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex flex-wrap items-center gap-2 text-xs">
      <CalendarDays size={16} className="text-emerald-400" />
      <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
        {visible.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`min-h-[40px] px-3 rounded-lg font-bold transition ${
              preset === p.id ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {lang === 'kz' ? p.kz : p.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="flex items-center gap-1">
          <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} className={selectCls} />
          <span className="text-slate-500">—</span>
          <input type="date" value={to} min={from} onChange={e => setTo(e.target.value)} className={selectCls} />
        </div>
      )}
      {showSection && (
        <select value={sectionId} onChange={e => setSectionId(e.target.value ? Number(e.target.value) : '')} className={selectCls}>
          <option value="">{tr('Все участки', 'Барлық бөлімшелер')}</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}
      {showBrigade && (
        <select value={brigadeId} onChange={e => setBrigadeId(e.target.value ? Number(e.target.value) : '')} className={selectCls}>
          <option value="">{tr('Все бригады', 'Барлық бригадалар')}</option>
          {brigades.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      )}
    </div>
  );
};
