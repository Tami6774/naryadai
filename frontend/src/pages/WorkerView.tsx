import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { WorkOrder } from '../types';
import { useAuth } from '../context/AuthContext';
import { CloseOrderModal } from '../components/CloseOrderModal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { 
  CheckCircle, Play, Pause, ListPlus, XCircle, Wrench, 
  Clock, AlertTriangle, Sparkles, Award, ChevronRight, ShieldAlert 
} from 'lucide-react';

// Статусы, при переходе в которые у исполнителя может измениться рейтинг
const RATING_STATUSES = new Set(['ai_review', 'closed', 'rework', 'done']);
const RATING_NOTIFICATIONS = new Set(['ai_result', 'closed', 'rework', 'ai_rework']);

/** Какие данные исполнителя устарели после WebSocket-события. */
export function workerEventRelevance(
  event: any, userId: number, myOrders: Array<{ id: number }>
): { orders: boolean; rating: boolean } {
  const isMine = (orderId?: number) => orderId !== undefined && myOrders.some(o => o.id === orderId);
  switch (event?.type) {
    case 'reconnected':
      return { orders: true, rating: true };
    case 'notification':  // отправляется только адресату
      return { orders: true, rating: RATING_NOTIFICATIONS.has(event.notification?.kind) };
    case 'order_updated': {
      const o = event.order;
      const assignedToMe = o?.assignee?.id === userId;
      const relevant = assignedToMe || isMine(o?.id);  // в т.ч. наряд переназначили с меня
      return { orders: relevant, rating: relevant && assignedToMe && RATING_STATUSES.has(o?.status) };
    }
    case 'order_photo':
      return { orders: isMine(event.order_id), rating: false };
    case 'worker_updated':
      return { orders: event.worker_id === userId, rating: false };
    default:
      return { orders: true, rating: false };  // неизвестное событие — обновляем список на всякий случай
  }
}

export const WorkerView: React.FC = () => {
  const { user, lastEvent, offlineCount, offlineQueue, syncOfflineNow, retryOffline, discardOffline, tr, ts, lang } = useAuth();
  const locale = lang === 'kz' ? 'kk-KZ' : 'ru-RU';
  const problemActions = offlineQueue.filter(a => a.status === 'conflict' || a.status === 'failed');
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [ratingData, setRatingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'orders' | 'rating'>('orders');
  const [closingOrder, setClosingOrder] = useState<WorkOrder | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [rejectReasonModal, setRejectReasonModal] = useState<number | null>(null);
  const [pauseReasonModal, setPauseReasonModal] = useState<number | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  const userId = user?.id;
  const ordersRef = useRef<WorkOrder[]>([]);
  ordersRef.current = orders;
  // Рейтинг — тяжёлый расчёт на сервере (30 дней нарядов): запрашиваем только когда он мог измениться
  const ratingDirtyRef = useRef(false);

  const fetchWorkerData = useCallback(async (withRating: boolean = true) => {
    if (!userId) return;
    try {
      const [ordList, rate] = await Promise.all([
        api.getOrders({ assignee_id: userId }),
        withRating ? api.getRating() : Promise.resolve(undefined),
      ]);
      setOrders(ordList);
      if (rate !== undefined) setRatingData(rate);
    } catch (err) {
      console.error('Error fetching worker data', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWorkerData();
  }, [fetchWorkerData]);

  // Широковещательные события приходят всем клиентам — реагируем только на касающиеся этого исполнителя
  useEffect(() => {
    if (!lastEvent || !userId) return;
    const relevance = workerEventRelevance(lastEvent, userId, ordersRef.current);
    if (!relevance.orders) return;
    if (relevance.rating) ratingDirtyRef.current = true;
    const timer = setTimeout(() => {
      const withRating = ratingDirtyRef.current;
      ratingDirtyRef.current = false;
      fetchWorkerData(withRating);
    }, 300);
    return () => clearTimeout(timer);
  }, [lastEvent, userId, fetchWorkerData]);

  const handleAction = async (orderId: number, action: string, reason?: string) => {
    setActionLoading(true);
    setOfflineNotice(null);
    try {
      const res: any = await api.applyAction(orderId, action, reason);
      setRejectReasonModal(null);
      setPauseReasonModal(null);
      setReasonInput('');
      if (res?.__offline) {
        setOfflineNotice(tr('Действие сохранено офлайн и будет передано при восстановлении связи', 'Әрекет офлайн сақталды және байланыс қалпына келгенде жіберіледі'));
        if (res.status) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: res.status } : o));
        }
      } else {
        await fetchWorkerData();
      }
    } catch (err: any) {
      alert(err.message || tr('Ошибка выполнения действия', 'Әрекетті орындау қатесі'));
    } finally {
      setActionLoading(false);
    }
  };

  // Активный наряд на исполнении (в работе, на паузе или возвращён на доработку)
  const activeOrder = orders.find(o => o.status === 'in_progress' || o.status === 'paused');
  
  // Если наряда в работе нет, берём первый принятый, на доработке или выданный
  const currentOrder = activeOrder || orders.find(o => o.status === 'rework' || o.status === 'accepted' || o.status === 'issued');

  // Все остальные входящие наряды, требующие решения мастера/исполнителя, кроме currentOrder
  const otherIncomingOrders = orders.filter(o => 
    (o.status === 'issued' || o.status === 'accepted' || o.status === 'rework') && o.id !== currentOrder?.id
  );

  const queuedOrders = orders.filter(o => o.status === 'queued');
  const completedOrders = orders.filter(o => o.status === 'closed' || o.status === 'ai_review' || o.status === 'done');

  // Личные данные рейтинга
  const myRating = Array.isArray(ratingData) ? ratingData.find((r: any) => r.id === user?.id) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      
      {/* Шапка сотрудника */}
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>{user?.full_name}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {ts(user?.specialty)}, {user?.grade} {tr('разряд', 'разряд')} • {user?.brigade?.name || tr('Бригада №1', '№1 бригада')}
          </p>
        </div>

        {/* Переключатель вкладок: Наряды / Мой рейтинг */}
        <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            {tr('Наряды', 'Нарядтар')}
          </button>
          <button
            onClick={() => setActiveTab('rating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              activeTab === 'rating' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Award size={14} />
            <span>{tr('Рейтинг', 'Рейтинг')}</span>
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Уведомление об офлайн-сохранении */}
          {offlineNotice && (
            <div className="p-3 bg-amber-950/80 border border-amber-500 rounded-2xl flex items-center justify-between text-xs text-amber-200">
              <span>📴 {offlineNotice}</span>
              <button
                type="button"
                onClick={() => setOfflineNotice(null)}
                className="text-amber-400 hover:text-white font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Плашка накопленной офлайн-очереди */}
          {offlineCount > 0 && (
            <div className="bg-amber-950/70 border border-amber-600/80 p-3 rounded-2xl flex items-center justify-between shadow text-xs">
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-base">📴</span>
                <div>
                  <span className="font-bold">{tr('Офлайн-режим:', 'Офлайн-режим:')}</span> {tr('сохранено', 'құрылғы жадында')} {offlineCount} {tr('действий в памяти устройства.', 'әрекет сақталды.')}
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const res = await syncOfflineNow();
                  if (res.synced > 0) {
                    await fetchWorkerData();
                  }
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shadow text-xs"
              >
                {tr('Синхронизировать', 'Синхрондау')}
              </button>
            </div>
          )}

          {/* Действия, которые не удалось применить при синхронизации: решает исполнитель */}
          {problemActions.map(a => (
            <div key={a.id} className="bg-red-950/60 border border-red-700 p-3 rounded-2xl shadow text-xs space-y-2">
              <div className="text-red-200">
                <span className="font-bold">
                  {a.status === 'conflict' ? tr('Конфликт', 'Қақтығыс') : tr('Ошибка', 'Қате')} {tr('синхронизации', 'синхрондау')}
                  {a.orderNumber ? ` · ${tr('наряд', 'наряд')} №${a.orderNumber}` : ''}:
                </span>{' '}
                {tr('действие', 'әрекет')} «{a.action}» {tr('от', '')} {new Date(a.createdAt).toLocaleString(locale)}
                {a.photos?.length ? ` (+${a.photos.length} ${tr('фото', 'фото')})` : ''}.
                {a.errorMessage && <div className="text-red-300 mt-1">{a.errorMessage}</div>}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => retryOffline(a.id)}
                  className="min-h-[48px] flex-1 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition"
                >
                  {tr('Повторить', 'Қайталау')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(tr('Удалить сохранённое действие? Данные (включая фото) будут потеряны.', 'Сақталған әрекетті жою керек пе? Деректер (фотосуреттерді қоса) жоғалады.'))) {
                      discardOffline(a.id);
                    }
                  }}
                  className="min-h-[48px] flex-1 px-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition"
                >
                  {tr('Удалить', 'Жою')}
                </button>
              </div>
            </div>
          ))}

          {/* Главный блок: Текущий активный наряд */}
          {currentOrder ? (
            <div className={`p-5 rounded-2xl border shadow-xl space-y-4 transition ${
              currentOrder.priority === 'emergency' 
                ? 'bg-red-950/20 border-red-800/80 shadow-red-950/30' 
                : 'bg-slate-800 border-slate-700'
            }`}>
              
              {/* Статус и номер */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {tr('НАРЯД', 'НАРЯД')} #{currentOrder.number}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      currentOrder.priority === 'emergency' ? 'bg-red-600 text-white animate-pulse' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {ts(currentOrder.priority_label)}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-1.5">{currentOrder.equipment.name}</h3>
                  <p className="text-xs text-slate-400">{ts(currentOrder.section.name)}</p>
                </div>

                <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400">
                  {ts(currentOrder.status_label)}
                </span>
              </div>

              {/* Если наряд вернулся на доработку — яркий алерт */}
              {currentOrder.status === 'rework' && (
                <div className="p-3 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-xl flex items-start space-x-2">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-red-100 font-bold mb-0.5">{tr('Требует доработки по заключению ИИ:', 'ЖИ қорытындысы бойынша қайта қарауды қажет етеді:')}</strong>
                    <span>{currentOrder.assessment?.explanation || tr('Устраните замечания и повторно отправьте наряд', 'Ескертулерді жойып, нарядты қайта жіберіңіз')}</span>
                  </div>
                </div>
              )}

              {/* Описание проблемы */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 text-xs text-slate-200 leading-relaxed">
                <span className="text-slate-400 font-semibold block mb-0.5">{tr('Задача:', 'Тапсырма:')}</span>
                {currentOrder.description}
              </div>

              {/* Срок выполнения */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center space-x-1.5">
                  <Clock size={15} />
                  <span>{tr('Срок до:', 'Мерзімі:')} <strong>{new Date(currentOrder.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </span>
                {currentOrder.overdue && (
                  <span className="font-bold text-red-400 animate-pulse">
                    ⚠ {tr('Просрочен на', 'Мерзімі өтті:')} {currentOrder.overdue_minutes} {tr('мин!', 'мин!')}
                  </span>
                )}
              </div>

              {/* Крупные кнопки действий под рабочие перчатки (раздел 5.3 п.2) */}
              <div className="pt-2 space-y-2.5">
                
                {/* 1. Если наряд только выдан: Принять / В очередь / Отклонить */}
                {currentOrder.status === 'issued' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAction(currentOrder.id, 'accept')}
                      disabled={actionLoading}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch"
                    >
                      <CheckCircle size={20} />
                      <span>{tr('Принять в работу', 'Жұмысқа қабылдау')}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAction(currentOrder.id, 'queue')}
                        disabled={actionLoading}
                        className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 btn-touch"
                      >
                        <ListPlus size={16} />
                        <span>{tr('Поставить в очередь', 'Кезекке қою')}</span>
                      </button>

                      <button
                        onClick={() => setRejectReasonModal(currentOrder.id)}
                        disabled={actionLoading}
                        className="py-3 bg-slate-700 hover:bg-red-900/80 text-slate-200 hover:text-red-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 btn-touch"
                      >
                        <XCircle size={16} />
                        <span>{tr('Отклонить...', 'Бас тарту...')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Если наряд принят или на доработке: Начать исполнение */}
                {(currentOrder.status === 'accepted' || currentOrder.status === 'rework') && (
                  <button
                    onClick={() => handleAction(currentOrder.id, 'start')}
                    disabled={actionLoading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch"
                  >
                    <Play size={20} />
                    <span>{tr('Начать исполнение', 'Орындауды бастау')}</span>
                  </button>
                )}

                {/* 3. Если в работе: Исполнено / Приостановить */}
                {currentOrder.status === 'in_progress' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setClosingOrder(currentOrder)}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch"
                    >
                      <CheckCircle size={22} />
                      <span>{tr('Исполнено (закрыть наряд)', 'Орындалды (нарядты жабу)')}</span>
                    </button>

                    <button
                      onClick={() => setPauseReasonModal(currentOrder.id)}
                      disabled={actionLoading}
                      className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 btn-touch"
                    >
                      <Pause size={16} />
                      <span>{tr('Приостановить смену/работу', 'Жұмысты тоқтата тұру')}</span>
                    </button>
                  </div>
                )}

                {/* 4. Если на паузе: Возобновить */}
                {currentOrder.status === 'paused' && (
                  <button
                    onClick={() => handleAction(currentOrder.id, 'resume')}
                    disabled={actionLoading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-base rounded-xl shadow-lg shadow-blue-950 transition flex items-center justify-center space-x-2 btn-touch"
                  >
                    <Play size={22} />
                    <span>{tr('Возобновить выполнение', 'Жұмысты жалғастыру')}</span>
                  </button>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-800">
                <CheckCircle size={24} />
              </div>
              <h3 className="font-bold text-base text-white">{tr('Вы свободны', 'Сіз бос')}</h3>
              <p className="text-xs text-slate-400">
                {tr('Новые аварийные и плановые наряды от мастера поступят мгновенно по сети.', 'Шебердің жаңа апаттық және жоспарлы нарядтары желі арқылы бірден келеді.')}
              </p>
            </div>
          )}

          {/* Другие входящие наряды (раздел 5.3 п.1: аварийные выделены красным и требуют ответа) */}
          {otherIncomingOrders.length > 0 && (
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert size={16} className="text-amber-400" />
                  <span>{tr('Входящие наряды', 'Кіріс нарядтар')} ({otherIncomingOrders.length})</span>
                </div>
                <span className="text-[10px] text-slate-400">{tr('Требуют внимания', 'Назар аударуды қажет етеді')}</span>
              </h4>
              <div className="space-y-2.5">
                {otherIncomingOrders.map(inc => (
                  <div
                    key={inc.id}
                    className={`p-3 rounded-xl border transition ${
                      inc.priority === 'emergency' 
                        ? 'bg-red-950/40 border-red-700 shadow-md' 
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-emerald-400 text-xs">#{inc.number}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            inc.priority === 'emergency' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {ts(inc.priority_label)}
                          </span>
                          <span className="text-[10px] text-slate-400">{ts(inc.status_label)}</span>
                        </div>
                        <strong className="text-white text-xs block mt-1">{inc.equipment.name}</strong>
                        <p className="text-slate-300 text-xs mt-0.5">{inc.description}</p>
                      </div>
                    </div>

                    {/* Кнопки действий для входящего наряда */}
                    <div className="mt-2.5 flex items-center space-x-2">
                      {inc.status === 'issued' ? (
                        <>
                          <button
                            onClick={() => handleAction(inc.id, 'accept')}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition btn-touch"
                          >
                            {tr('Принять', 'Қабылдау')}
                          </button>
                          <button
                            onClick={() => handleAction(inc.id, 'queue')}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition btn-touch"
                          >
                            {tr('В очередь', 'Кезекке')}
                          </button>
                          <button
                            onClick={() => setRejectReasonModal(inc.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1.5 bg-slate-700 hover:bg-red-900/80 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition btn-touch"
                          >
                            {tr('Отклонить', 'Бас тарту')}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAction(inc.id, 'start')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition btn-touch"
                        >
                          {tr('Начать исполнение', 'Орындауды бастау')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Очередь нарядов (раздел 5.3 п.4) */}
          {queuedOrders.length > 0 && (
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <ListPlus size={16} className="text-blue-400" />
                <span>{tr('Ваша очередь нарядов', 'Сіздің наряд кезегіңіз')} ({queuedOrders.length})</span>
              </h4>
              <div className="space-y-2">
                {queuedOrders.map(q => (
                  <div key={q.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-emerald-400">#{q.number}</span>
                      <strong className="text-white ml-2">{q.equipment.name}</strong>
                      <p className="text-slate-400 mt-0.5 line-clamp-1">{q.description}</p>
                    </div>
                    <button
                      onClick={() => handleAction(q.id, 'start')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shrink-0"
                    >
                      {tr('Взять', 'Алу')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* История закрытых нарядов и отчёты ИИ */}
          {completedOrders.length > 0 && (
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow space-y-3">
              <h4 className="font-bold text-sm text-slate-200">
                {tr('Недавно выполненные наряды', 'Жақында орындалған нарядтар')}
              </h4>
              <div className="divide-y divide-slate-700/60">
                {completedOrders.slice(0, 5).map(o => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className="py-3 flex justify-between items-center text-xs cursor-pointer hover:bg-slate-700/30 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-400">#{o.number}</span>
                        <strong className="text-slate-200">{o.equipment.name}</strong>
                      </div>
                      <span className="text-[11px] text-slate-400">{ts(o.status_label)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {o.score !== null && o.score !== undefined && (
                        <span className="font-black text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {o.score}/100
                        </span>
                      )}
                      <ChevronRight size={16} className="text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Вкладка личного рейтинга сотрудника (раздел 6.6) */
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-white">{tr('Ваш рейтинг качества', 'Сіздің сапа рейтингіңіз')}</h3>
              <p className="text-xs text-slate-400">{tr('Расчёт по прозрачной формуле за 30 дней', '30 күндегі ашық формула бойынша есептеу')}</p>
            </div>
            {myRating && (
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400">{myRating.rating}</span>
                <span className="text-xs text-slate-400 block font-semibold">{tr('Место в смене:', 'Ауысымдағы орны:')} #{myRating.place}</span>
              </div>
            )}
          </div>

          {myRating?.components && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{tr('Составляющие балла:', 'Балл құраушылары:')}</h4>
              
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{tr('Качество работ (оценка ИИ / мастера):', 'Жұмыс сапасы (ЖИ / шебер бағасы):')}</span>
                    <strong className="text-emerald-400">{myRating.components.quality} / 100</strong>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${myRating.components.quality}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{tr('Соблюдение сроков (выполнено вовремя):', 'Мерзімді сақтау (уақтылы орындалған):')}</span>
                    <strong className="text-emerald-400">{myRating.components.on_time} / 100</strong>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${myRating.components.on_time}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{tr('Надёжность (без доработок и повторов за 7 дней):', 'Сенімділік (7 күнде қайта қарау мен қайталаусыз):')}</span>
                    <strong className="text-emerald-400">{myRating.components.no_rework} / 100</strong>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${myRating.components.no_rework}%` }}></div>
                  </div>
                </div>
              </div>

              {myRating.explanation && (
                <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-slate-300 italic">
                  💬 {myRating.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Модалка закрытия наряда */}
      {closingOrder && (
        <CloseOrderModal
          order={closingOrder}
          onClose={() => setClosingOrder(null)}
          onSuccess={(offline) => {
            const id = closingOrder.id;
            setClosingOrder(null);
            if (offline) {
              setOfflineNotice(tr('Закрытие наряда и фото сохранены офлайн и будут переданы при восстановлении связи', 'Нарядты жабу және фотосуреттер офлайн сақталды және байланыс қалпына келгенде жіберіледі'));
              setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'done' } : o));
            } else {
              fetchWorkerData();
            }
          }}
        />
      )}

      {/* Модалка просмотра деталей наряда */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onRefresh={fetchWorkerData}
        />
      )}

      {/* Модалка причины отклонения */}
      {rejectReasonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl max-w-sm w-full space-y-4">
            <h4 className="font-bold text-sm text-white">{tr('Причина отклонения наряда', 'Нарядтан бас тарту себебі')}</h4>
            <div className="space-y-1.5">
              {([['Нет материалов', 'Материал жоқ'], ['Нет допуска', 'Рұқсат жоқ'], ['Занят аварийным нарядом', 'Апаттық нарядпен айналысып жатыр'], ['Не моя специальность', 'Менің мамандығым емес']] as const).map(([r, rKz]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReasonInput(r)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl border transition ${
                    reasonInput === r ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {lang === 'kz' ? rKz : r}
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectReasonModal(null)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                {tr('Отмена', 'Бас тарту')}
              </button>
              <button
                onClick={() => handleAction(rejectReasonModal, 'reject', reasonInput)}
                disabled={!reasonInput}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                {tr('Отклонить наряд', 'Нарядтан бас тарту')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка причины паузы */}
      {pauseReasonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl max-w-sm w-full space-y-4">
            <h4 className="font-bold text-sm text-white">{tr('Причина приостановки', 'Тоқтата тұру себебі')}</h4>
            <div className="space-y-1.5">
              {([['Ждёт запчасти со склада', 'Қоймадан қосалқы бөлшектерді күтуде'], ['Ждёт остановки оборудования', 'Жабдықтың тоқтауын күтуде'], ['Обед / перерыв', 'Түскі ас / үзіліс'], ['Переключён на аварийный', 'Апаттық нарядқа ауыстырылды']] as const).map(([r, rKz]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReasonInput(r)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl border transition ${
                    reasonInput === r ? 'bg-amber-950 border-amber-500 text-amber-200' : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {lang === 'kz' ? rKz : r}
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setPauseReasonModal(null)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                {tr('Отмена', 'Бас тарту')}
              </button>
              <button
                onClick={() => handleAction(pauseReasonModal, 'pause', reasonInput)}
                disabled={!reasonInput}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                {tr('Приостановить', 'Тоқтата тұру')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
