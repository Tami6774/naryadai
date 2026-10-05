import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Sparkles, AlertOctagon, TrendingUp, Award, Clock, 
  BarChart3, ShieldAlert, CheckCircle, FileText, FileSpreadsheet, Download, Package 
} from 'lucide-react';

interface ManagerDashboardProps {
  viewMode?: 'analytics' | 'rating';
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ viewMode = 'analytics' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'anomalies' | 'rating' | 'shift' | 'materials'>(
    viewMode === 'rating' ? 'rating' : 'anomalies'
  );
  
  const [anomaliesData, setAnomaliesData] = useState<any>(null);
  const [ratingData, setRatingData] = useState<any>(null);
  const [shiftData, setShiftData] = useState<any>(null);
  const [materialsData, setMaterialsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const [anom, rate, sh, mat] = await Promise.all([
          api.getAnomalies(90),
          api.getRating(),
          api.getShiftReport(),
          api.getMaterialsReport(90),
        ]);
        setAnomaliesData(anom);
        setRatingData(rate);
        setShiftData(sh);
        setMaterialsData(mat);
      } catch (err) {
        console.error('Error loading dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleDownloadShift = async () => {
    setExporting('shift');
    try {
      await api.downloadShiftExcel();
    } catch (err: any) {
      alert(err.message || 'Ошибка выгрузки отчёта');
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadRating = async () => {
    setExporting('rating');
    try {
      await api.downloadRatingExcel(90);
    } catch (err: any) {
      alert(err.message || 'Ошибка выгрузки рейтинга');
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadMaterials = async () => {
    setExporting('materials');
    try {
      await api.downloadMaterialsExcel(90);
    } catch (err: any) {
      alert(err.message || 'Ошибка выгрузки ТМЦ');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-emerald-400 font-bold animate-pulse">Анализ данных ИИ...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Шапка дашборда */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Аналитический центр и отчёты</span>
            <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
              ИИ-модуль 6.5
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Сводка по сменам, лидерборд качества и поиск аномалий в истории за 3 месяца
          </p>
        </div>

        {/* Переключатель вкладок */}
        <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSubTab('anomalies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'anomalies' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Аномалии и ИИ-выводы (Шаг 9)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'rating' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award size={14} />
            <span>Рейтинг рабочих (Шаг 8)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('shift')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'shift' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Отчёт за смену</span>
          </button>
          <button
            onClick={() => setActiveSubTab('materials')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'materials' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Списание ТМЦ (раздел 7)</span>
          </button>
        </div>
      </div>

      {/* Вкладка 1: ИИ-Аналитика и аномалии (Шаг 9 демо) */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-5">
          
          {/* Сводка за 90 дней */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Всего нарядов (90 дней)</div>
              <div className="text-2xl font-black text-white mt-1">{anomaliesData?.total_orders}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Внеплановых поломок</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{anomaliesData?.unplanned_orders}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Плановых ППР</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{anomaliesData?.planned_orders}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Найдено аномалий ИИ</div>
              <div className="text-2xl font-black text-red-400 mt-1">{anomaliesData?.insights?.length || 0}</div>
            </div>
          </div>

          {/* Карточки найденных закономерностей с выводами ИИ */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <Sparkles size={16} className="text-emerald-400" />
              <span>Ключевые закономерности и рекомендации ИИ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anomaliesData?.insights?.map((ins: any, idx: number) => {
                const isCrit = ins.severity === 'critical';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border shadow-md space-y-2.5 transition ${
                      isCrit 
                        ? 'bg-red-950/20 border-red-800' 
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        <h4 className="font-bold text-sm text-white">{ins.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        isCrit ? 'bg-red-900 text-red-200' : 'bg-amber-900 text-amber-200'
                      }`}>
                        {ins.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ins.text}
                    </p>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-emerald-300 leading-relaxed">
                      <strong className="block text-emerald-400 mb-0.5 font-bold">💡 Рекомендация ИИ:</strong>
                      {ins.recommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Топ проблемного оборудования */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3">
            <h3 className="font-bold text-sm text-slate-200">
              Топ-10 оборудования по количеству внеплановых остановок
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Оборудование</th>
                    <th className="py-2.5 px-3">Участок</th>
                    <th className="py-2.5 px-3 text-center">Остановок</th>
                    <th className="py-2.5 px-3 text-center">Превышение ср.</th>
                    <th className="py-2.5 px-3">Частый шифр</th>
                    <th className="py-2.5 px-3 text-right">Простой (ч)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {anomaliesData?.top_problematic?.map((row: any) => (
                    <tr key={row.equipment_id} className={row.ratio_to_avg >= 2.0 ? 'bg-red-950/20' : ''}>
                      <td className="py-2.5 px-3 font-bold text-white">{row.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{row.section}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-400">{row.unplanned_count}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.ratio_to_avg >= 2.0 ? 'bg-red-900 text-red-200' : 'bg-slate-700 text-slate-300'
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

        </div>
      )}

      {/* Вкладка 2: Рейтинг исполнителей и бригад (Шаг 8 демо) */}
      {activeSubTab === 'rating' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-200 mb-1">
                  Рейтинг исполнителей смены и бригад (раздел 6.6)
                </h3>
                <p className="text-xs text-slate-400">
                  Формула: <strong>0.35·Качество + 0.25·Сроки + 0.20·(100 - Повторы) + 0.15·Объём + 0.05·(100 - Отказы)</strong>
                </p>
              </div>
              <button
                onClick={handleDownloadRating}
                disabled={exporting === 'rating'}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
              >
                <FileSpreadsheet size={14} />
                <span>{exporting === 'rating' ? 'Экспорт...' : 'Выгрузить в Excel'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Место</th>
                    <th className="py-2.5 px-3">Сотрудник</th>
                    <th className="py-2.5 px-3">Специальность</th>
                    <th className="py-2.5 px-3 text-center">Итоговый балл</th>
                    <th className="py-2.5 px-3 text-center">Качество</th>
                    <th className="py-2.5 px-3 text-center">В срок</th>
                    <th className="py-2.5 px-3 text-center">Повторные отказы</th>
                    <th className="py-2.5 px-3 text-center">Нарядов</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {ratingData?.rows?.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-700/30">
                      <td className="py-2.5 px-3 text-center font-black text-sm text-slate-400">
                        {row.place === 1 ? '🥇 1' : row.place === 2 ? '🥈 2' : row.place === 3 ? '🥉 3' : `#${row.place}`}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{row.full_name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{row.specialty}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-black text-sm">
                          {row.rating}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-200">{row.components?.quality}</td>
                      <td className="py-2.5 px-3 text-center text-slate-200">{row.components?.on_time}%</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-400">{row.repeat_failures}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-300">{row.orders_closed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Вкладка 3: Отчёт за смену */}
      {activeSubTab === 'shift' && shiftData && (
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-white">Итоговая сводка за смену</h3>
              <span className="text-xs text-slate-400">
                Суммарный простой оборудования: <strong className="text-amber-400 font-bold">{shiftData.downtime_hours} ч</strong>
              </span>
            </div>
            <button
              onClick={handleDownloadShift}
              disabled={exporting === 'shift'}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
            >
              <FileSpreadsheet size={14} />
              <span>{exporting === 'shift' ? 'Экспорт...' : 'Выгрузить в Excel'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed">
            <strong className="block text-emerald-400 font-bold mb-1">ИИ-Резюме смены:</strong>
            {shiftData.summary}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Загрузка ремонтного персонала:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {shiftData.load?.map((item: any) => (
                <div key={item.worker_id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="text-slate-400">{item.orders} нарядов • {Math.round(item.minutes / 60)} ч работы</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Вкладка 4: Списание ТМЦ и отклонения от норм */}
      {activeSubTab === 'materials' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-white mb-1">
                  Контроль списания ТМЦ и отклонений от норм (Раздел 7)
                </h3>
                <p className="text-xs text-slate-400">
                  Анализ фактического списания запчастей и материалов в сравнении с технологическими нормативами
                </p>
              </div>
              <button
                onClick={handleDownloadMaterials}
                disabled={exporting === 'materials'}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
              >
                <FileSpreadsheet size={14} />
                <span>{exporting === 'materials' ? 'Экспорт...' : 'Выгрузить в Excel'}</span>
              </button>
            </div>

            {/* Сводка KPI по материалам */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-semibold">Номенклатурных позиций</div>
                <div className="text-xl font-black text-white mt-0.5">{materialsData?.items?.length || 0}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-semibold">Всего актов списания</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{materialsData?.total_writeoffs || 0}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-semibold">Аномалий перерасхода (&gt;40%)</div>
                <div className={`text-xl font-black mt-0.5 ${(materialsData?.anomalies_count || 0) > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  {materialsData?.anomalies_count || 0}
                </div>
              </div>
            </div>

            {/* Таблица списаний */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Материал / ТМЦ</th>
                    <th className="py-2.5 px-3 text-center">Ед. изм.</th>
                    <th className="py-2.5 px-3 text-right">Факт списано</th>
                    <th className="py-2.5 px-3 text-right">По норме</th>
                    <th className="py-2.5 px-3 text-center">Отклонение</th>
                    <th className="py-2.5 px-3 text-center">Нарядов</th>
                    <th className="py-2.5 px-3 text-center">Перерасходов</th>
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
        </div>
      )}

    </div>
  );
};
