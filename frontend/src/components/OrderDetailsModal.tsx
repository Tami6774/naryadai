import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { WorkOrder, User, Priority } from '../types';
import { useAuth } from '../context/AuthContext';
import { EquipmentHistoryModal } from './EquipmentHistoryModal';
import { 
  X, CheckCircle, AlertOctagon, Clock, Wrench, Shield, Sparkles, 
  Image as ImageIcon, ArrowRight, MessageSquare, Printer,
  UserPlus, Flag, Ban, History,
} from 'lucide-react';

interface OrderDetailsModalProps {
  orderId: number;
  onClose: () => void;
  onRefresh: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, onClose, onRefresh }) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [masterScoreInput, setMasterScoreInput] = useState<number | ''>('');
  const [masterComment, setMasterComment] = useState('');
  const [reworkReason, setReworkReason] = useState('');
  const [showReworkInput, setShowReworkInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Управление нарядом мастером (раздел 5.1 п.5)
  const [workersList, setWorkersList] = useState<User[]>([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignWorkerId, setReassignWorkerId] = useState<number | ''>('');
  const [reassignComment, setReassignComment] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const fetchOrder = async () => {
    try {
      const data = await api.getOrder(orderId);
      setOrder(data);
      if (data.assessment) {
        setMasterScoreInput(data.assessment.master_score ?? data.assessment.score);
        setMasterComment(data.assessment.master_comment || '');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="text-emerald-400 font-semibold text-sm animate-pulse">Загрузка данных наряда...</div>
      </div>
    );
  }

  const isMaster = user?.role === 'master' || user?.role === 'admin';
  const photosBefore = order.photos?.filter(p => p.kind === 'before') || [];
  const photosAfter = order.photos?.filter(p => p.kind === 'after') || [];

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.applyAction(order.id, 'approve');
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const handleReturnRework = async () => {
    if (!reworkReason.trim()) {
      setError('Укажите причину возврата на доработку');
      return;
    }
    setActionLoading(true);
    try {
      await api.applyAction(order.id, 'return_rework', reworkReason);
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const handleSaveScore = async () => {
    if (masterScoreInput === '') return;
    try {
      await api.setMasterScore(order.id, Number(masterScoreInput), masterComment);
      await fetchOrder();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user?.role === 'master' || user?.role === 'admin') {
      api.getWorkers().then(setWorkersList).catch(() => {});
    }
  }, [user]);

  const handleReassign = async () => {
    if (!reassignWorkerId) {
      setError('Выберите нового исполнителя');
      return;
    }
    setActionLoading(true);
    try {
      await api.reassignOrder(order.id, Number(reassignWorkerId), reassignComment);
      setShowReassignModal(false);
      setReassignComment('');
      await fetchOrder();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка переназначения исполнителя');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePriority = async (p: Priority) => {
    setActionLoading(true);
    try {
      await api.changeOrderPriority(order.id, p);
      setShowPriorityModal(false);
      await fetchOrder();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка изменения приоритета');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setError('Укажите причину отмены наряда');
      return;
    }
    setActionLoading(true);
    try {
      await api.cancelOrder(order.id, cancelReason);
      setShowCancelModal(false);
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка отмены наряда');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Шапка модалки */}
        <div className="px-5 py-4 bg-slate-900/80 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-lg font-black text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
              #{order.number}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">{order.equipment.name}</h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  order.priority === 'emergency' ? 'bg-red-500/20 text-red-400 border border-red-800' :
                  order.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-800' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {order.priority_label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                  {order.status_label}
                </span>
              </div>
              <p className="text-xs text-slate-400">{order.section.name} • Инв. № {order.equipment.inv_no}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user?.role !== 'worker' && (
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-600 text-xs font-semibold transition"
                title="История нарядов, ремонтов и простоев по оборудованию"
              >
                <History size={15} className="text-emerald-400" />
                <span className="hidden sm:inline">История</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.open(api.getOrderPrintUrl(order.id), '_blank')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-600 text-xs font-semibold transition"
              title="Печать или экспорт наряда в PDF"
            >
              <Printer size={15} className="text-emerald-400" />
              <span className="hidden sm:inline">Печать / PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Тело карточки со скроллом */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* Основные детали */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
            <div>
              <span className="text-slate-400 text-xs block">Описание проблемы (мастер):</span>
              <p className="font-medium text-slate-200 mt-0.5">{order.description}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Исполнитель:</span>
              <p className="font-medium text-slate-200 mt-0.5">
                {order.assignee ? `${order.assignee.full_name} (${order.assignee.specialty})` : 'Не назначен'}
              </p>
              {order.brigade && (
                <p className="text-[11px] text-slate-400 mt-0.5">Наряд на бригаду: {order.brigade.name}</p>
              )}
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Срок исполнения:</span>
              <p className={`font-medium mt-0.5 ${order.overdue ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                {new Date(order.deadline).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                {order.overdue && ` (Просрочен на ${order.overdue_minutes} мин)`}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Мастер смены:</span>
              <p className="font-medium text-slate-200 mt-0.5">{order.master.full_name}</p>
            </div>
          </div>

          {/* Панель оперативного управления мастера (раздел 5.1 п.5: переназначение, приоритет, отмена) */}
          {isMaster && order.status !== 'closed' && order.status !== 'cancelled' && (
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Shield size={14} className="text-emerald-400" />
                <span>Мастер смены (раздел 5.1 п.5):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setReassignWorkerId(order.assignee?.id || ''); setShowReassignModal(true); }}
                  className="px-2.5 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1 btn-touch"
                  title="Переназначить исполнителя"
                >
                  <UserPlus size={13} />
                  <span>Переназначить</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPriorityModal(true)}
                  className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1 btn-touch"
                  title="Изменить приоритет наряда"
                >
                  <Flag size={13} />
                  <span>Приоритет: {order.priority_label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1 btn-touch"
                  title="Отменить наряд с фиксацией причины"
                >
                  <Ban size={13} />
                  <span>Отменить...</span>
                </button>
              </div>
            </div>
          )}

          {/* Результаты выполнения (если закрыто или на проверке) */}
          {(order.work_done || order.fault_code) && (
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-sm text-white mb-2 flex items-center space-x-2">
                <Wrench size={16} className="text-emerald-400" />
                <span>Отчёт о выполненной работе</span>
              </h4>
              <div className="space-y-2">
                {order.fault_code && (
                  <div>
                    <span className="text-slate-400 text-xs">Шифр неисправности: </span>
                    <span className="font-bold text-emerald-400">[{order.fault_code.code}] {order.fault_code.name}</span>
                    <span className="text-xs text-slate-500 ml-2">(норма: {order.fault_code.norm_hours} ч)</span>
                  </div>
                )}
                {order.work_done && (
                  <div>
                    <span className="text-slate-400 text-xs block">Выполненные операции:</span>
                    <p className="text-slate-200 mt-0.5">{order.work_done}</p>
                  </div>
                )}
                {order.materials && order.materials.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-xs block mb-1">Списанные материалы:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {order.materials.map(m => (
                        <span key={m.id} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">
                          {m.name}: <strong className="text-white">{m.qty} {m.unit}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Фотографии До и После (сравнение) */}
          {(photosBefore.length > 0 || photosAfter.length > 0) && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
              <h4 className="font-bold text-sm text-white mb-3 flex items-center space-x-2">
                <ImageIcon size={16} className="text-emerald-400" />
                <span>Фотофиксация: «До» и «После» (раздел 6.3)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Фото ДО */}
                <div>
                  <span className="text-xs text-slate-400 font-semibold block mb-1.5">Фото ДО (Неисправность):</span>
                  {photosBefore.length === 0 ? (
                    <div className="h-36 bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 border border-slate-700">
                      Нет фото дефекта
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {photosBefore.map(p => (
                        <div key={p.id} className="relative group overflow-hidden rounded-xl border border-slate-700">
                          <img src={p.url} alt="До ремонта" className="w-full h-36 object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded">
                            {new Date(p.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Фото ПОСЛЕ */}
                <div>
                  <span className="text-xs text-slate-400 font-semibold block mb-1.5">Фото ПОСЛЕ (Устранение):</span>
                  {photosAfter.length === 0 ? (
                    <div className="h-36 bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 border border-slate-700">
                      Фото после ремонта отсутствует
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {photosAfter.map(p => (
                        <div key={p.id} className="relative group overflow-hidden rounded-xl border border-emerald-800/80">
                          <img src={p.url} alt="После ремонта" className="w-full h-36 object-cover" />
                          <span className="absolute bottom-1 right-1 bg-emerald-950/80 text-[10px] text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                            Проверено ИИ
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ИИ-Заключение и Оценка качества */}
          {order.assessment && (
            <div className={`p-4 rounded-xl border ${
              order.assessment.verdict === 'needs_rework' 
                ? 'bg-red-950/30 border-red-800' 
                : order.assessment.verdict === 'accepted_with_remarks'
                ? 'bg-amber-950/30 border-amber-800'
                : 'bg-emerald-950/30 border-emerald-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">ИИ-Проверка качества наряда</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Оценка ИИ:</span>
                  <span className="font-black text-lg text-emerald-400">{order.assessment.score}/100</span>
                  {order.assessment.master_score !== null && (
                    <span className="text-xs font-bold text-amber-300">
                      (Мастер изменил на {order.assessment.master_score})
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  order.assessment.verdict === 'needs_rework'
                    ? 'bg-red-900/60 text-red-200 border border-red-700'
                    : order.assessment.verdict === 'accepted_with_remarks'
                    ? 'bg-amber-900/60 text-amber-200 border border-amber-700'
                    : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700'
                }`}>
                  {order.assessment.verdict_label}
                </span>
                {order.assessment.photo_score != null && (
                  <span className="ml-2 inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-600">
                    Фото: {order.assessment.photo_score}/5
                  </span>
                )}
                {order.assessment.needs_master_check && (
                  <span className="ml-2 inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-900/60 text-amber-200 border border-amber-700">
                    Нужна проверка мастером
                  </span>
                )}
                <span className="ml-2 inline-block text-[10px] text-slate-400" title="Чем выполнена проверка">
                  {String(order.assessment.details?.engine || '').includes('+')
                    ? 'Правила + языковая и мультимодальная модель'
                    : 'Правила и онтология (без облака)'}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed mb-3">
                {order.assessment.explanation}
              </p>

              {/* Корректировка оценки мастером (раздел 6.4 кейса) */}
              {isMaster && (
                <div className="pt-3 border-t border-slate-700/60 flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Финальное слово за мастером:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={masterScoreInput}
                    onChange={(e) => setMasterScoreInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-bold text-white"
                  />
                  <input
                    type="text"
                    placeholder="Комментарий мастера..."
                    value={masterComment}
                    onChange={(e) => setMasterComment(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleSaveScore}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg transition"
                  >
                    Сохранить
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Журнал событий и хронология (раздел 5.5) */}
          <div>
            <h4 className="font-bold text-sm text-slate-300 mb-2">Хронология выполнения наряда</h4>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-2 max-h-40 overflow-y-auto">
              {order.events?.map(ev => (
                <div key={ev.id} className="text-xs flex items-center justify-between text-slate-300 py-1 border-b border-slate-800 last:border-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-200">{ev.action_label}</span>
                    <span className="text-slate-500">({ev.actor?.short_name || 'ИИ / система'})</span>
                    {ev.reason && <span className="text-amber-400 italic">«{ev.reason}»</span>}
                    {ev.comment && <span className="text-slate-400">({ev.comment})</span>}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Футер с кнопками принятия мастером */}
        {isMaster && order.status === 'ai_review' && (
          <div className="p-4 bg-slate-900/90 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Наряд ожидает решения мастера после проверки ИИ
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {showReworkInput ? (
                <div className="flex items-center space-x-2 w-full">
                  <input
                    type="text"
                    placeholder="Причина возврата на доработку..."
                    value={reworkReason}
                    onChange={(e) => setReworkReason(e.target.value)}
                    className="bg-slate-800 border border-red-800 rounded-xl px-3 py-2 text-xs text-white flex-1"
                  />
                  <button
                    onClick={handleReturnRework}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
                  >
                    Вернуть
                  </button>
                  <button
                    onClick={() => setShowReworkInput(false)}
                    className="text-slate-400 hover:text-white text-xs px-2"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowReworkInput(true)}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs rounded-xl transition"
                  >
                    На доработку
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition flex items-center space-x-1"
                  >
                    <CheckCircle size={16} />
                    <span>Подтвердить и закрыть наряд</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Модалка переназначения */}
        {showReassignModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 w-full max-w-md space-y-3 shadow-2xl">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                  <UserPlus size={16} className="text-blue-400" />
                  <span>Переназначение исполнителя</span>
                </h4>
                <button onClick={() => setShowReassignModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Выберите исполнителя смены:</label>
                <select
                  value={reassignWorkerId}
                  onChange={(e) => setReassignWorkerId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="">Выберите сотрудника...</option>
                  {workersList.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.short_name} ({w.specialty}) — {w.live?.label || (w.on_shift ? 'На смене' : 'Не на смене')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Причина переназначения (комментарий):</label>
                <input
                  type="text"
                  placeholder="Например: Срочный аварийный вызов на другой участок"
                  value={reassignComment}
                  onChange={(e) => setReassignComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleReassign}
                  disabled={actionLoading || !reassignWorkerId}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                >
                  Переназначить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модалка изменения приоритета */}
        {showPriorityModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-2xl">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Flag size={16} className="text-amber-400" />
                  <span>Изменение приоритета наряда</span>
                </h4>
                <button onClick={() => setShowPriorityModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['emergency', 'high', 'normal', 'planned'] as Priority[]).map((p) => {
                  const label = p === 'emergency' ? '🚨 Аварийный' : p === 'high' ? '⚠️ Высокий' : p === 'normal' ? '📋 Обычный' : '📅 Плановый';
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleChangePriority(p)}
                      disabled={actionLoading}
                      className={`p-2.5 rounded-xl font-bold text-xs border text-left transition ${
                        order.priority === p 
                          ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300' 
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Модалка отмены наряда */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-red-800 rounded-2xl p-4 w-full max-w-md space-y-3 shadow-2xl">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-red-300 flex items-center space-x-2">
                  <Ban size={16} className="text-red-400" />
                  <span>Отмена наряда мастером</span>
                </h4>
                <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Причина отмены (обязательно):</label>
                <input
                  type="text"
                  placeholder="Например: Ложное срабатывание датчика / дубликат наряда"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-900 border border-red-900/80 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={actionLoading || !cancelReason.trim()}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                >
                  Подтвердить отмену
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      {showHistory && (
        <EquipmentHistoryModal equipmentId={order.equipment.id} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
};
