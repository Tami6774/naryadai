import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Sparkles, AlertOctagon, TrendingUp, ShieldAlert, 
  FileSpreadsheet, Package, RefreshCw, Layers, CheckCircle2, Clock, Activity
} from 'lucide-react';
import { EquipmentHistoryModal } from '../components/EquipmentHistoryModal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';

const LEVEL_STYLE: Record<string, { label: string; cls: string }> = {
  high: { label: 'Высокий риск', cls: 'bg-red-900 text-red-200 border-red-700' },
  medium: { label: 'Средний риск', cls: 'bg-amber-900 text-amber-200 border-amber-700' },
  low: { label: 'Низкий риск', cls: 'bg-slate-700 text-slate-300 border-slate-600' },
};

export const AnalyticsView: React.FC = () => {
  const [periodDays, setPeriodDays] = useState<number>(90);
  const [anomaliesData, setAnomaliesData] = useState<any>(null);
  const [materialsData, setMaterialsData] = useState<any>(null);
  const [downtimeData, setDowntimeData] = useState<any>(null);
  const [historyEquipmentId, setHistoryEquipmentId] = useState<number | null>(null);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  const loadData = async (days: number) => {
    setLoading(true);
    try {
      const [anom, mat, down] = await Promise.all([
        api.getAnomalies(days),
        api.getMaterialsReport(days),
        api.getDowntimeReport({ days }),
      ]);
      setAnomaliesData(anom);
      setMaterialsData(mat);
      setDowntimeData(down);
    } catch (err) {
      console.error('Error loading analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(periodDays);
  }, [periodDays]);

  const handleDownloadMaterials = async () => {
    setExporting('materials');
    try {
      await api.downloadMaterialsExcel(periodDays);
    } catch (err: any) {
      alert(err.message || 'Ошибка выгрузки ТМЦ');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Шапка страницы аналитики */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="text-emerald-400" size={22} />
              <span>ИИ-Аналитика оборудования и контроль ТМЦ</span>
            </h2>
            <span className="text-xs bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-800 font-bold">
              Раздел 6.5 & 7
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ИИ-аудит поломок за 3 месяца: аномалии после ППР, прогноз отказов, простои и перерасход материалов
          </p>
        </div>

        {/* Переключатель периода анализа */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-700">
          <span className="text-[11px] text-slate-400 font-medium px-2">Период:</span>
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriodDays(days)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                periodDays === days
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {days} дней
            </button>
          ))}
          <button
            onClick={() => loadData(periodDays)}
            title="Обновить данные"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-emerald-400 font-bold animate-pulse flex flex-col items-center justify-center space-y-3">
          <Sparkles className="animate-spin text-emerald-400" size={32} />
          <span>ИИ-модель анализирует 3-месячную историю нарядов и отказов...</span>
        </div>
      ) : (
        <>
          {/* Сводные KPI за период */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
              <div className="text-xs text-slate-400 font-semibold">Всего нарядов ({periodDays} дн)</div>
              <div className="text-2xl font-black text-white mt-1">{anomaliesData?.total_orders ?? '—'}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">В базе данных ЕК АСУ ГОП</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
              <div className="text-xs text-slate-400 font-semibold">Внеплановых поломок</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{anomaliesData?.unplanned_orders ?? '—'}</div>
              <div className="text-[11px] text-amber-500/80 mt-0.5">Требуют внимания</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
              <div className="text-xs text-slate-400 font-semibold">Плановых ППР</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{anomaliesData?.planned_orders ?? '—'}</div>
              <div className="text-[11px] text-emerald-500/80 mt-0.5">График ТО соблюдён</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
              <div className="text-xs text-slate-400 font-semibold">Найдено аномалий ИИ</div>
              <div className="text-2xl font-black text-red-400 mt-1">{anomaliesData?.insights?.length ?? 0}</div>
              <div className="text-[11px] text-red-400/80 mt-0.5">Критических отклонений</div>
            </div>
          </div>

          {/* Карточки выявленных закономерностей и рекомендаций ИИ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <Sparkles size={16} className="text-emerald-400" />
                <span>Ключевые закономерности и рекомендации ИИ</span>
              </h3>
              <span className="text-xs text-slate-400">
                Автоматический анализ корреляций поломок и качества ремонтов
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {anomaliesData?.insights?.map((ins: any, idx: number) => {
                const isCrit = ins.severity === 'critical';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border shadow-lg space-y-3 transition ${
                      isCrit 
                        ? 'bg-red-950/20 border-red-800/80' 
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
                        <h4 className="font-bold text-sm text-white">{ins.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        isCrit ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-amber-900 text-amber-200 border border-amber-700'
                      }`}>
                        {isCrit ? 'Критично' : 'Предупреждение'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ins.text}
                    </p>

                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-emerald-300 leading-relaxed">
                      <strong className="block text-emerald-400 mb-0.5 font-bold flex items-center space-x-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>Рекомендация ИИ:</span>
                      </strong>
                      {ins.recommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Таблица: Топ проблемного оборудования */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-200">
                  Топ оборудования по количеству внеплановых остановок
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Узлы с максимальным коэффициентом превышения средней аварийности. Нажмите на строку — полная история агрегата
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Оборудование</th>
                    <th className="py-2.5 px-3">Участок</th>
                    <th className="py-2.5 px-3 text-center">Остановок</th>
                    <th className="py-2.5 px-3 text-center">Превышение ср.</th>
                    <th className="py-2.5 px-3">Частый шифр отказа</th>
                    <th className="py-2.5 px-3 text-right">Простой (ч)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {anomaliesData?.top_problematic?.map((row: any) => (
                    <tr
                      key={row.equipment_id}
                      onClick={() => setHistoryEquipmentId(row.equipment_id)}
                      className={`cursor-pointer ${row.ratio_to_avg >= 2.0 ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-slate-700/40'}`}
                    >
                      <td className="py-2.5 px-3 font-bold text-white flex items-center space-x-1.5">
                        {row.ratio_to_avg >= 2.0 && <AlertOctagon size={13} className="text-red-400" />}
                        <span>{row.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{row.section}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-400">{row.unplanned_count}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.ratio_to_avg >= 2.0 ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-slate-700 text-slate-300'
                        }`}>
                          ×{row.ratio_to_avg}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">{row.top_fault || '—'} ({row.top_fault_count})</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200">{row.downtime_hours} ч</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Прогноз вероятных отказов (раздел 6.5, бонус) */}
          {anomaliesData?.forecast?.length > 0 && (
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-3">
              <div>
                <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                  <Activity size={16} className="text-red-400" />
                  <span>Прогноз отказов на 7 дней</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Отказы — пуассоновский поток: интенсивность по последним 30 дням (вес 60%) и предыдущим 90 (40%);
                  вероятность отказа P = 1 − e<sup>−λ·7</sup>. Риск оценивается относительно среднего по парку.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {anomaliesData.forecast.slice(0, 6).map((f: any) => (
                  <button
                    key={f.equipment_id}
                    type="button"
                    onClick={() => setHistoryEquipmentId(f.equipment_id)}
                    className="text-left bg-slate-900/70 hover:bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-1.5 transition"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-white text-xs">{f.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${LEVEL_STYLE[f.level]?.cls}`}>
                        {LEVEL_STYLE[f.level]?.label} · {f.probability_7d}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${f.level === 'high' ? 'bg-red-500' : f.level === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`}
                        style={{ width: `${f.probability_7d}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{f.explanation}</p>
                    <p className="text-[11px] text-emerald-400 leading-snug">💡 {f.recommendation}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Отчёт по простоям оборудования (раздел 7) */}
          {downtimeData && (
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-3">
              <div>
                <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                  <Clock size={16} className="text-amber-400" />
                  <span>Простои оборудования за {periodDays} дней</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Внеплановый простой — от выдачи наряда до «Исполнено»; плановый — чистое время работ ППР.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
                  <div className="text-slate-400">Внеплановый простой</div>
                  <div className="text-lg font-black text-red-400">{downtimeData.totals.unplanned_hours} ч</div>
                </div>
                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
                  <div className="text-slate-400">Плановые работы</div>
                  <div className="text-lg font-black text-emerald-400">{downtimeData.totals.planned_hours} ч</div>
                </div>
                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
                  <div className="text-slate-400">Доля внеплановых</div>
                  <div className="text-lg font-black text-amber-400">{downtimeData.totals.unplanned_share}%</div>
                </div>
                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
                  <div className="text-slate-400">Главная причина</div>
                  <div className="text-sm font-black text-white">
                    {downtimeData.by_fault[0] ? `${downtimeData.by_fault[0].code} · ${downtimeData.by_fault[0].hours} ч` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{downtimeData.by_fault[0]?.name}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="py-2 px-3">Оборудование</th>
                      <th className="py-2 px-3">Участок</th>
                      <th className="py-2 px-3 text-right">Внеплан., ч</th>
                      <th className="py-2 px-3 text-right">ППР, ч</th>
                      <th className="py-2 px-3">Доля внеплановых</th>
                      <th className="py-2 px-3">Причины (шифр · ч)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {downtimeData.items.slice(0, 10).map((row: any) => (
                      <tr key={row.equipment_id} onClick={() => setHistoryEquipmentId(row.equipment_id)} className="cursor-pointer hover:bg-slate-700/40">
                        <td className="py-2 px-3 font-bold text-white">{row.name}</td>
                        <td className="py-2 px-3 text-slate-400">{row.section}</td>
                        <td className="py-2 px-3 text-right font-bold text-red-400">{row.unplanned_hours}</td>
                        <td className="py-2 px-3 text-right">{row.planned_hours}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500" style={{ width: `${row.unplanned_share}%` }} />
                            </div>
                            <span>{row.unplanned_share}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono text-emerald-400">
                          {row.top_causes.map((c: any) => `${c.code} · ${c.hours}`).join(', ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Блок контроля списания ТМЦ (Раздел 7 ТЗ) */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <Package className="text-emerald-400" size={18} />
                  <h3 className="font-bold text-base text-white">
                    Контроль списания ТМЦ и отклонений от норм (Раздел 7 ТЗ)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Сверка фактического расхода запчастей с технологическими нормативами и выявление перерасхода &gt;40%
                </p>
              </div>
              <button
                onClick={handleDownloadMaterials}
                disabled={exporting === 'materials'}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg"
              >
                <FileSpreadsheet size={15} />
                <span>{exporting === 'materials' ? 'Экспорт...' : 'Выгрузить отчёт ТМЦ в Excel'}</span>
              </button>
            </div>

            {/* Метрики ТМЦ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-semibold">Номенклатурных позиций</div>
                <div className="text-xl font-black text-white mt-1">{materialsData?.items?.length || 0}</div>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-semibold">Всего актов списания</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{materialsData?.total_writeoffs || 0}</div>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-semibold">Аномалий перерасхода (&gt;40%)</div>
                <div className={`text-xl font-black mt-1 ${(materialsData?.anomalies_count || 0) > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  {materialsData?.anomalies_count || 0}
                </div>
              </div>
            </div>

            {/* Таблица списаний */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Материал / ТМЦ</th>
                    <th className="py-2.5 px-3 text-center">Ед. изм.</th>
                    <th className="py-2.5 px-3 text-right">Факт списано</th>
                    <th className="py-2.5 px-3 text-right">По норме</th>
                    <th className="py-2.5 px-3 text-center">Отклонение</th>
                    <th className="py-2.5 px-3 text-center">Нарядов</th>
                    <th className="py-2.5 px-3 text-center">Превышений</th>
                    <th className="py-2.5 px-3">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {materialsData?.items?.map((item: any) => (
                    <tr key={item.material_id} className={item.is_anomaly ? 'bg-red-950/20' : 'hover:bg-slate-700/30'}>
                      <td className="py-2.5 px-3 font-bold text-white">{item.name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">{item.total_qty}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{item.norm_qty}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.diff_pct > 20
                            ? 'bg-red-900/80 text-red-200 border border-red-700'
                            : item.diff_pct < -10
                            ? 'bg-emerald-900/60 text-emerald-200'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {item.diff_pct > 0 ? `+${item.diff_pct}%` : `${item.diff_pct}%`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{item.orders_count}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-400">{item.overuse_count}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.is_anomaly
                            ? 'bg-red-900 text-red-200 border border-red-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {item.status_label}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!materialsData?.items || materialsData.items.length === 0) && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500">
                        Данные о списаниях ТМЦ за выбранный период отсутствуют
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

      {historyEquipmentId && (
        <EquipmentHistoryModal
          equipmentId={historyEquipmentId}
          onClose={() => setHistoryEquipmentId(null)}
          onOpenOrder={setOpenOrderId}
        />
      )}
      {openOrderId && (
        <OrderDetailsModal orderId={openOrderId} onClose={() => setOpenOrderId(null)} onRefresh={() => {}} />
      )}
    </div>
  );
};
