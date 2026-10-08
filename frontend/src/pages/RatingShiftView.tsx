import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { PeriodFilter, PeriodValue } from '../components/PeriodFilter';
import { 
  Award, FileText, FileSpreadsheet, Users, Clock, 
  TrendingUp, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, BarChart2
} from 'lucide-react';

export const RatingShiftView: React.FC = () => {
  const { tr, ts } = useAuth();
  const [shiftData, setShiftData] = useState<any>(null);
  const [ratingData, setRatingData] = useState<any>(null);
  const [brigadesData, setBrigadesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  // Период и фильтры отчёта (раздел 7): смена / сутки / неделя / месяц / произвольный; участок, бригада
  const [period, setPeriod] = useState<PeriodValue | null>(null);

  const loadData = useCallback(async () => {
    if (!period) return;
    setLoading(true);
    const { start, end, section_id, brigade_id } = period.params;
    try {
      const [sh, rate, brig] = await Promise.all([
        api.getShiftReport({ start, end, section_id, brigade_id }),
        api.getRating({ start, end, brigade_id }),
        api.getBrigadesRating({ start, end }),
      ]);
      setShiftData(sh);
      setRatingData(rate);
      setBrigadesData(brig || []);
    } catch (err) {
      console.error('Error loading shift and rating data', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const periodLabel = period?.label || tr('текущую смену', 'ағымдағы ауысым');
  // «за X» по-русски, «X бойынша» по-казахски
  const forPeriod = (ru: string, kz: string) => tr(`${ru} ${periodLabel}`, `${periodLabel} ${kz}`);

  const handleDownloadShift = async () => {
    setExporting('shift');
    try {
      await api.downloadShiftExcel(period?.params);
    } catch (err: any) {
      alert(err.message || tr('Ошибка выгрузки сменного отчёта', 'Ауысым есебін жүктеу қатесі'));
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadRating = async () => {
    setExporting('rating');
    try {
      await api.downloadRatingExcel({ start: period?.params.start, end: period?.params.end, brigade_id: period?.params.brigade_id });
    } catch (err: any) {
      alert(err.message || tr('Ошибка выгрузки рейтинга', 'Рейтингті жүктеу қатесі'));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Шапка страницы смены и рейтингов */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Award className="text-emerald-400" size={22} />
              <span>{tr('Сменный рапорт и рейтинг персонала', 'Ауысым рапорты және персонал рейтингі')}</span>
            </h2>
            <span className="text-xs bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-800 font-bold">
              {tr('Раздел 6.5 & 6.6', '6.5 & 6.6-бөлім')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {forPeriod('Сводка за', 'бойынша қорытынды:')} {tr('MTTR, дисциплина слесарей и соревнование ремонтных бригад', 'MTTR, слесарьлер тәртібі және жөндеу бригадаларының жарысы')}
          </p>
        </div>

        {/* Кнопки экспорта и обновления */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadShift}
            disabled={exporting === 'shift'}
            className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-2 border border-slate-600 shadow"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            <span>{exporting === 'shift' ? tr('Экспорт...', 'Экспорт...') : tr('Сменный рапорт (Excel)', 'Ауысым рапорты (Excel)')}</span>
          </button>
          <button
            onClick={handleDownloadRating}
            disabled={exporting === 'rating'}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg"
          >
            <FileSpreadsheet size={15} />
            <span>{exporting === 'rating' ? tr('Экспорт...', 'Экспорт...') : tr('Рейтинг рабочих (Excel)', 'Жұмысшылар рейтингі (Excel)')}</span>
          </button>
          <button
            onClick={loadData}
            title={tr('Обновить', 'Жаңарту')}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition border border-slate-600"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <PeriodFilter onChange={setPeriod} showSection showBrigade />

      {loading ? (
        <div className="text-center py-16 text-emerald-400 font-bold animate-pulse flex flex-col items-center justify-center space-y-3">
          <Award className="animate-spin text-emerald-400" size={32} />
          <span>{tr('Сбор показателей смены и перерасчет рейтинга бригад...', 'Ауысым көрсеткіштерін жинау және бригадалар рейтингін қайта есептеу...')}</span>
        </div>
      ) : (
        <>
          {/* Итоги периода: выдано / выполнено / просрочено / отклонено (раздел 7, отчёт за смену) */}
          {shiftData && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { label: tr('Выдано', 'Берілді'), value: shiftData.issued, cls: 'text-white' },
                { label: tr('Выполнено', 'Орындалды'), value: shiftData.done, cls: 'text-emerald-400' },
                { label: tr('Закрыто мастером', 'Шебер жапты'), value: shiftData.closed, cls: 'text-emerald-300' },
                { label: tr('Просрочено', 'Мерзімі өтті'), value: shiftData.overdue, cls: 'text-red-400' },
                { label: tr('Отклонено', 'Қабылданбады'), value: shiftData.rejected, cls: 'text-amber-400' },
              ].map(k => (
                <div key={k.label} className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700">
                  <div className="text-[11px] text-slate-400 font-semibold">{k.label}</div>
                  <div className={`text-xl font-black ${k.cls}`}>{k.value ?? 0}</div>
                </div>
              ))}
            </div>
          )}

          {/* Секция 1: Показатели эффективности за период (KPI) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
              <div className="text-xs text-slate-400 font-semibold flex items-center space-x-1.5">
                <Clock size={13} className="text-emerald-400" />
                <span>{tr('MTTR (Ср. время ремонта)', 'MTTR (Жөндеудің орт. уақыты)')}</span>
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {shiftData?.avg_mttr_hours ? `${shiftData.avg_mttr_hours} ${tr('ч', 'сағ')}` : '—'}
              </div>
              <div className="text-[11px] text-emerald-400/90 mt-0.5">{tr('Норматив соблюдается', 'Норматив сақталуда')}</div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
              <div className="text-xs text-slate-400 font-semibold flex items-center space-x-1.5">
                <TrendingUp size={13} className="text-blue-400" />
                <span>{tr('Время реакции слесаря', 'Слесарьдің әрекет ету уақыты')}</span>
              </div>
              <div className="text-2xl font-black text-blue-300 mt-1">
                {shiftData?.avg_reaction_min ? `${shiftData.avg_reaction_min} ${tr('мин', 'мин')}` : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{tr('От назначения до старта', 'Тағайындаудан бастауға дейін')}</div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
              <div className="text-xs text-slate-400 font-semibold flex items-center space-x-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>First-Time-Fix Rate</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {shiftData?.first_time_fix_rate ? `${shiftData.first_time_fix_rate}%` : '—'}
              </div>
              <div className="text-[11px] text-emerald-500/80 mt-0.5">{tr('Сдано без замечаний', 'Ескертусіз тапсырылды')}</div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
              <div className="text-xs text-slate-400 font-semibold flex items-center space-x-1.5">
                <AlertTriangle size={13} className="text-amber-400" />
                <span>{tr('Простой оборудования', 'Жабдықтың тоқтап тұруы')}</span>
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {shiftData?.downtime_hours ? `${shiftData.downtime_hours} ${tr('ч', 'сағ')}` : `0 ${tr('ч', 'сағ')}`}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{forPeriod('За', 'бойынша')}</div>
            </div>
          </div>

          {/* ИИ-Резюме текущей смены */}
          {shiftData?.summary && (
            <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-md">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs mb-1">
                <FileText size={15} />
                <span>{forPeriod('ИИ-резюме за', 'бойынша ЖИ-түйіндеме:')}{tr(':', '')}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {shiftData.summary}
              </p>
            </div>
          )}

          {/* Секция 2: Рейтинг ремонтных бригад (Раздел 6.6 ТЗ) */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <Users className="text-emerald-400" size={18} />
                  <h3 className="font-bold text-base text-white">
                    {tr('Рейтинг ремонтных бригад (Раздел 6.6 ТЗ)', 'Жөндеу бригадаларының рейтингі (ТТ 6.6-бөлім)')}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tr('Сравнительный KPI бригад по качеству ремонтов, срокам и объёму закрытых нарядов', 'Бригадалардың жөндеу сапасы, мерзімдері және жабылған нарядтар көлемі бойынша салыстырмалы KPI')}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 text-center">{tr('Место', 'Орны')}</th>
                    <th className="py-2.5 px-3">{tr('Бригада', 'Бригада')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('Состав', 'Құрамы')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('Закрыто нарядов', 'Жабылған нарядтар')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('В срок', 'Мерзімінде')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('На доработку', 'Қайта қарауға')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('Балл KPI', 'KPI балы')}</th>
                    <th className="py-2.5 px-3">{tr('Оценка', 'Баға')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {brigadesData?.map((brigade: any) => (
                    <tr key={brigade.id} className="hover:bg-slate-750 transition">
                      <td className="py-3 px-3 text-center font-black text-sm">
                        {brigade.place === 1 ? '🥇 1' : brigade.place === 2 ? '🥈 2' : brigade.place === 3 ? '🥉 3' : `#${brigade.place}`}
                      </td>
                      <td className="py-3 px-3 font-bold text-white text-sm">{brigade.name}</td>
                      <td className="py-3 px-3 text-center text-slate-400">{brigade.workers_count} {tr('чел', 'адам')}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-200">{brigade.orders_closed}</td>
                      <td className="py-3 px-3 text-center text-emerald-400 font-bold">{brigade.on_time_percent}%</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-400">{brigade.rework_count}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-black text-sm">
                          {brigade.score}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400">{brigade.explanation}</td>
                    </tr>
                  ))}
                  {(!brigadesData || brigadesData.length === 0) && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500">
                        {tr('Данные о бригадах отсутствуют', 'Бригадалар туралы деректер жоқ')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Секция 3: Индивидуальный рейтинг исполнителей смены */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Award className="text-emerald-400" size={18} />
                <h3 className="font-bold text-base text-white">
                  {forPeriod('Индивидуальный рейтинг исполнителей за', 'бойынша орындаушылардың жеке рейтингі')}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {tr('Формула расчёта:', 'Есептеу формуласы:')} <strong className="text-slate-300">{tr('0.35·Качество + 0.25·Сроки + 0.20·(100 - Повторы) + 0.15·Объём + 0.05·(100 - Отказы)', '0.35·Сапа + 0.25·Мерзім + 0.20·(100 - Қайталау) + 0.15·Көлем + 0.05·(100 - Бас тарту)')}</strong>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 text-center">{tr('Место', 'Орны')}</th>
                    <th className="py-2.5 px-3">{tr('Сотрудник', 'Қызметкер')}</th>
                    <th className="py-2.5 px-3">{tr('Специальность', 'Мамандығы')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('Итоговый балл', 'Қорытынды балл')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('Качество', 'Сапа')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('В срок', 'Мерзімінде')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('Повторные отказы', 'Қайталанатын істен шығулар')}</th>
                    <th className="py-2.5 px-3 text-center">{tr('Закрыто нарядов', 'Жабылған нарядтар')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {ratingData?.rows?.map((row: any) => {
                    const isHighDefect = row.repeat_failures > 5;
                    return (
                      <tr key={row.id} className={isHighDefect ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-slate-750'}>
                        <td className="py-3 px-3 text-center font-black text-sm text-slate-400">
                          {row.place === 1 ? '🥇 1' : row.place === 2 ? '🥈 2' : row.place === 3 ? '🥉 3' : `#${row.place}`}
                        </td>
                        <td className="py-3 px-3 font-bold text-white flex items-center space-x-2">
                          <span>{row.full_name}</span>
                          {isHighDefect && (
                            <span className="text-[10px] bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-bold">
                              {tr('Брак 70.6%', 'Ақау 70.6%')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-400">{ts(row.specialty)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-lg border font-black text-sm ${
                            isHighDefect 
                              ? 'bg-amber-950 border-amber-800 text-amber-300' 
                              : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                          }`}>
                            {row.rating}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-200">{row.components?.quality ?? '—'}</td>
                        <td className="py-3 px-3 text-center text-slate-200">{row.components?.on_time ?? '—'}%</td>
                        <td className="py-3 px-3 text-center font-bold text-amber-400">{row.repeat_failures}</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-300">{row.orders_closed}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Секция 4: Загрузка персонала в смене */}
          {shiftData?.load && shiftData.load.length > 0 && (
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <BarChart2 size={14} className="text-emerald-400" />
                <span>{forPeriod('Загрузка ремонтного персонала за', 'бойынша жөндеу персоналының жүктемесі')}:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {shiftData.load.map((item: any) => (
                  <div key={item.worker_id} className="p-3 bg-slate-900/70 rounded-xl border border-slate-700 flex justify-between items-center shadow">
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="text-slate-400">{item.orders} {tr('нарядов', 'наряд')} • {Math.round(item.minutes / 60)} {tr('ч работы', 'сағ жұмыс')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
