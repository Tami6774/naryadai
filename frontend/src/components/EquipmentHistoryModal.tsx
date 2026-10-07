import React, { useEffect, useState } from 'react';
import { X, History, AlertTriangle } from 'lucide-react';
import { api } from '../api';

/** История нарядов, ремонтов и простоев по единице оборудования (раздел 5.5 кейса). */
interface Props {
  equipmentId: number;
  onClose: () => void;
  onOpenOrder?: (orderId: number) => void;
}

const PERIODS = [90, 180, 365];

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtMinutes = (m?: number | null) => {
  if (m === null || m === undefined) return '—';
  const h = Math.floor(m / 60);
  return h ? `${h} ч ${Math.round(m % 60)} мин` : `${Math.round(m)} мин`;
};

export const EquipmentHistoryModal: React.FC<Props> = ({ equipmentId, onClose, onOpenOrder }) => {
  const [days, setDays] = useState(365);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    api.getEquipmentHistory(equipmentId, days).then(setData).catch(e => setError(e.message));
  }, [equipmentId, days]);

  const s = data?.summary;
  const kpis = s ? [
    { label: 'Нарядов', value: s.orders_total },
    { label: 'Внеплановых', value: s.unplanned, cls: 'text-amber-400' },
    { label: 'Плановых (ППР)', value: s.planned },
    { label: 'Простой', value: `${s.downtime_hours} ч`, cls: 'text-red-400' },
    { label: 'Ср. время ремонта', value: s.mttr_hours != null ? `${s.mttr_hours} ч` : '—' },
    { label: 'Ср. интервал между отказами', value: s.mtbf_days != null ? `${s.mtbf_days} дн.` : '—' },
  ] : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-slate-900/80 border-b border-slate-700 flex justify-between items-start gap-3">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold">
              <History size={18} className="text-emerald-400" />
              <span>История оборудования: {data?.equipment?.name || '…'}</span>
            </div>
            {data?.equipment && (
              <p className="text-xs text-slate-400 mt-0.5">
                {data.equipment.section} • Инв. № {data.equipment.inv_no} • {data.equipment.type} •
                критичность {data.equipment.criticality === 1 ? 'высокая' : data.equipment.criticality === 2 ? 'средняя' : 'низкая'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg" aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 w-fit">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setDays(p)}
                className={`min-h-[40px] px-3 rounded-lg font-bold transition ${days === p ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
              >
                {p === 365 ? 'Год' : `${p} дней`}
              </button>
            ))}
          </div>

          {error && <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-xl">{error}</div>}
          {!data && !error && <div className="text-emerald-400 animate-pulse py-8 text-center">Загрузка истории…</div>}

          {data && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {kpis.map(k => (
                  <div key={k.label} className="bg-slate-900/70 border border-slate-700 rounded-xl p-2.5">
                    <div className="text-[10px] text-slate-400 leading-tight">{k.label}</div>
                    <div className={`text-base font-black ${k.cls || 'text-white'}`}>{k.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 text-slate-300">
                <span>Последний отказ: <strong className="text-white">{fmtDate(s.last_failure_at)}</strong></span>
                {s.open_orders > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <AlertTriangle size={13} /> открытых нарядов: {s.open_orders}
                  </span>
                )}
              </div>

              {data.by_fault.length > 0 && (
                <div>
                  <div className="font-bold text-slate-300 mb-1.5">Причины по шифрам неисправностей</div>
                  <div className="flex flex-wrap gap-2">
                    {data.by_fault.map((f: any) => (
                      <span key={f.code} className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                        <span className="font-mono text-emerald-400">{f.code}</span> {f.name}: <strong>{f.count}</strong>
                        {f.downtime_hours > 0 && <span className="text-slate-400"> · {f.downtime_hours} ч простоя</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="py-2 px-2">№</th>
                      <th className="py-2 px-2">Выдан</th>
                      <th className="py-2 px-2">Тип</th>
                      <th className="py-2 px-2">Описание</th>
                      <th className="py-2 px-2">Шифр</th>
                      <th className="py-2 px-2">Исполнитель</th>
                      <th className="py-2 px-2">Статус</th>
                      <th className="py-2 px-2 text-right">Простой</th>
                      <th className="py-2 px-2 text-right">Оценка</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {data.orders.map((o: any) => (
                      <tr
                        key={o.id}
                        onClick={onOpenOrder ? () => onOpenOrder(o.id) : undefined}
                        className={onOpenOrder ? 'cursor-pointer hover:bg-slate-700/40' : ''}
                      >
                        <td className="py-2 px-2 font-mono text-emerald-400">#{o.number}</td>
                        <td className="py-2 px-2 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                        <td className="py-2 px-2">{o.work_type === 'unplanned' ? <span className="text-amber-400">Внеплан.</span> : 'ППР'}</td>
                        <td className="py-2 px-2 max-w-[16rem] truncate" title={o.description}>{o.description}</td>
                        <td className="py-2 px-2 font-mono">{o.fault_code || '—'}</td>
                        <td className="py-2 px-2 whitespace-nowrap">{o.assignee?.short_name || '—'}</td>
                        <td className="py-2 px-2 whitespace-nowrap">{o.status_label}</td>
                        <td className="py-2 px-2 text-right whitespace-nowrap">{fmtMinutes(o.downtime_minutes)}</td>
                        <td className="py-2 px-2 text-right">{o.score ?? '—'}</td>
                      </tr>
                    ))}
                    {data.orders.length === 0 && (
                      <tr><td colSpan={9} className="py-6 text-center text-slate-500">Нарядов за период нет</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
