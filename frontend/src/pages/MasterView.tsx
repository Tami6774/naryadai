import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { WorkOrder, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { NewOrderModal } from '../components/NewOrderModal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { MasterAssistantModal } from '../components/MasterAssistantModal';
import { 
  Plus, Users, AlertTriangle, Clock, CheckCircle2, RefreshCw, 
  ChevronRight, Wrench, ShieldAlert, Sparkles, Search, Filter, X 
} from 'lucide-react';

export const MasterView: React.FC = () => {
  const { lastEvent } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [counters, setCounters] = useState({ shift: 'day', issued: 0, done: 0, overdue: 0, equipment_down: 0 });
  const [loading, setLoading] = useState(true);

  const [showNewModal, setShowNewModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Фильтры (Раздел 5.2 п. 3: участок, оборудование, исполнитель, приоритет)
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      const [ordList, wList, cnt] = await Promise.all([
        api.getOrders({ scope: 'active' }),
        api.getWorkers(),
        api.getCounters(),
      ]);
      setOrders(ordList);
      setWorkers(wList);
      setCounters(cnt);
    } catch (err) {
      console.error('Error fetching master data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Реакция на WebSocket-события (обновление без перезагрузки страницы!)
  useEffect(() => {
    if (lastEvent) {
      fetchData();
    }
  }, [lastEvent, fetchData]);

  const hasActiveFilters = 
    filterSection !== 'all' || 
    filterPriority !== 'all' || 
    filterAssignee !== 'all' || 
    onlyOverdue || 
    searchQuery.trim() !== '';

  const resetFilters = () => {
    setFilterSection('all');
    setFilterPriority('all');
    setFilterAssignee('all');
    setOnlyOverdue(false);
    setSearchQuery('');
  };

  const filteredOrders = orders.filter(o => {
    if (filterSection !== 'all' && o.section?.name !== filterSection) return false;
    if (filterPriority !== 'all' && o.priority !== filterPriority) return false;
    if (filterAssignee !== 'all' && o.assignee?.id !== Number(filterAssignee)) return false;
    if (onlyOverdue && !o.overdue) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = String(o.number ?? '').toLowerCase().includes(q);
      const matchEq = o.equipment?.name?.toLowerCase().includes(q);
      const matchDesc = o.description?.toLowerCase().includes(q);
      const matchAssignee = o.assignee?.short_name?.toLowerCase().includes(q);
      if (!matchNum && !matchEq && !matchDesc && !matchAssignee) return false;
    }
    return true;
  });

  const colNew = filteredOrders.filter(o => o.status === 'issued' || o.status === 'queued' || o.status === 'accepted' || o.status === 'rejected');
  const colProgress = filteredOrders.filter(o => o.status === 'in_progress' || o.status === 'paused');
  const colReview = filteredOrders.filter(o => o.status === 'ai_review' || o.status === 'rework');
  const colDone = filteredOrders.filter(o => o.status === 'closed' || o.status === 'done');
  const rejectedOrders = filteredOrders.filter(o => o.status === 'rejected');

  return (
    <div className="space-y-6">
      
      {/* Верхний блок: Счётчики смены и кнопка создания наряда */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Панель смены мастера</span>
            <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
              Смена: {counters.shift === 'day' ? '☀️ Дневная' : '🌙 Ночная'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Контроль выполнения работ и статусы исполнителей в реальном времени
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAssistantModal(true)}
            className="px-4 py-3 bg-slate-700/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-sm rounded-xl border border-slate-600 transition flex items-center justify-center space-x-2 btn-touch shadow"
            title="Задать вопрос ИИ-ассистенту мастера (раздел 6.7)"
          >
            <Sparkles size={18} className="text-emerald-400" />
            <span>🤖 ИИ-Ассистент мастера</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch"
          >
            <Plus size={20} />
            <span>+ Выдать наряд (≤ 6 нажатий)</span>
          </button>
        </div>
      </div>

      {/* 4 Ключевых счётчика (раздел 5.2 п.4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow flex items-center space-x-3">
          <div className="p-3 bg-blue-950/80 text-blue-400 rounded-xl border border-blue-800">
            <Wrench size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{counters.issued}</div>
            <div className="text-xs text-slate-400 font-medium">Выдано за смену</div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow flex items-center space-x-3">
          <div className="p-3 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">{counters.done}</div>
            <div className="text-xs text-slate-400 font-medium">Выполнено</div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow flex items-center space-x-3">
          <div className="p-3 bg-red-950/80 text-red-400 rounded-xl border border-red-800">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-red-400">{counters.overdue}</div>
            <div className="text-xs text-slate-400 font-medium">Просрочено</div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow flex items-center space-x-3">
          <div className="p-3 bg-amber-950/80 text-amber-400 rounded-xl border border-amber-800">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">{counters.equipment_down}</div>
            <div className="text-xs text-slate-400 font-medium">Оборудование в простое</div>
          </div>
        </div>
      </div>

      {/* Список исполнителей смены с цветовым статусом (раздел 5.2 п.1) */}
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
            <Users size={16} className="text-emerald-400" />
            <span>Статусы исполнителей смены в реальном времени (≤ 5 сек)</span>
          </h3>
          <span className="text-xs text-slate-400">
            На смене: {workers.filter(w => w.on_shift).length} из {workers.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {workers.map((w) => {
            const state = w.live?.state || 'off';
            const colorClass = 
              state === 'free' ? 'border-emerald-700 bg-emerald-950/20 text-emerald-300' :
              state === 'busy' ? 'border-amber-700 bg-amber-950/20 text-amber-300' :
              state === 'queue' ? 'border-blue-700 bg-blue-950/20 text-blue-300' :
              'border-slate-700 bg-slate-900/40 text-slate-400 opacity-60';

            const badgeBg =
              state === 'free' ? 'bg-emerald-500' :
              state === 'busy' ? 'bg-amber-500' :
              state === 'queue' ? 'bg-blue-500' :
              'bg-slate-500';

            return (
              <div key={w.id} className={`p-2.5 rounded-xl border ${colorClass} transition`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${badgeBg} animate-pulse`}></span>
                    <span className="font-bold text-xs text-white">{w.short_name}</span>
                  </div>
                  <span className="text-[10px] font-semibold opacity-90">{w.specialty}</span>
                </div>
                <div className="text-[11px] mt-1 font-medium truncate">
                  {w.live?.label || 'Свободен'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Канбан-доска нарядов смены (раздел 5.2 п.2, п.3) */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-emerald-400 shrink-0" />
            <span className="font-bold text-sm text-slate-200">
              Доска нарядов ({filteredOrders.length})
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 ml-2 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60 transition"
              >
                <X size={12} />
                <span>Сбросить</span>
              </button>
            )}
          </div>

          {/* Фильтры: поиск, участок, приоритет, исполнитель, просроченные */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Текстовый поиск */}
            <div className="relative min-w-[140px] flex-1 sm:flex-initial">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск по агрегату, №..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Фильтр по участку */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Все участки</option>
              <option value="Участок дробления">Дробление</option>
              <option value="Обогатительная фабрика">Обогащение</option>
              <option value="Участок сушки">Сушка</option>
              <option value="Ремонтно-механический цех">РМЦ</option>
            </select>

            {/* Фильтр по приоритету */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Все приоритеты</option>
              <option value="emergency">🚨 Аварийный</option>
              <option value="high">⚠️ Высокий</option>
              <option value="normal">📋 Обычный</option>
              <option value="planned">🛠️ Плановый</option>
            </select>

            {/* Фильтр по исполнителю */}
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Все исполнители</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.short_name} ({w.specialty})</option>
              ))}
            </select>

            {/* Кнопка-тумблер "Только просроченные" */}
            <button
              onClick={() => setOnlyOverdue(!onlyOverdue)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition border flex items-center space-x-1 ${
                onlyOverdue 
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950' 
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <span>🔥 Просроченные</span>
              {orders.filter(o => o.overdue).length > 0 && (
                <span className="ml-1 px-1 bg-red-950 text-red-200 text-[10px] rounded-full">
                  {orders.filter(o => o.overdue).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {rejectedOrders.length > 0 && (
          <div className="bg-red-950/80 border border-red-600 p-4 rounded-2xl flex items-center justify-between text-xs shadow-lg animate-pulse">
            <div className="flex items-center space-x-3 text-red-200">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="font-bold text-sm text-red-100">
                  Внимание! {rejectedOrders.length} наряд(ов) отклонено исполнителями:
                </div>
                <div className="text-red-300">
                  {rejectedOrders.map(o => `№${o.number} (${o.equipment?.name})`).join(', ')}. Нажмите для переназначения на другого слесаря.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOrderId(rejectedOrders[0].id)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow text-xs whitespace-nowrap"
            >
              Переназначить
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Колонка 1: Выданы / В очереди */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center px-1 font-bold text-xs text-blue-400 uppercase tracking-wider">
              <span>Ожидают ({colNew.length})</span>
            </div>
            <div className="space-y-2">
              {colNew.map(o => (
                <OrderCard key={o.id} order={o} onClick={() => setSelectedOrderId(o.id)} />
              ))}
              {colNew.length === 0 && <div className="text-xs text-slate-500 italic p-3 text-center">Нет нарядов</div>}
            </div>
          </div>

          {/* Колонка 2: В работе */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center px-1 font-bold text-xs text-amber-400 uppercase tracking-wider">
              <span>В работе ({colProgress.length})</span>
            </div>
            <div className="space-y-2">
              {colProgress.map(o => (
                <OrderCard key={o.id} order={o} onClick={() => setSelectedOrderId(o.id)} />
              ))}
              {colProgress.length === 0 && <div className="text-xs text-slate-500 italic p-3 text-center">Нет нарядов</div>}
            </div>
          </div>

          {/* Колонка 3: Проверка ИИ / Доработка */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center px-1 font-bold text-xs text-emerald-400 uppercase tracking-wider">
              <span>Проверка ИИ ({colReview.length})</span>
            </div>
            <div className="space-y-2">
              {colReview.map(o => (
                <OrderCard key={o.id} order={o} onClick={() => setSelectedOrderId(o.id)} />
              ))}
              {colReview.length === 0 && <div className="text-xs text-slate-500 italic p-3 text-center">Нет нарядов</div>}
            </div>
          </div>

          {/* Колонка 4: Закрыты мастером */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center px-1 font-bold text-xs text-slate-400 uppercase tracking-wider">
              <span>Закрыты ({colDone.length})</span>
            </div>
            <div className="space-y-2">
              {colDone.map(o => (
                <OrderCard key={o.id} order={o} onClick={() => setSelectedOrderId(o.id)} />
              ))}
              {colDone.length === 0 && <div className="text-xs text-slate-500 italic p-3 text-center">Нет нарядов</div>}
            </div>
          </div>

        </div>
      </div>

      {/* Модальные окна */}
      {showNewModal && (
        <NewOrderModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false);
            fetchData();
          }}
        />
      )}

      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onRefresh={fetchData}
        />
      )}

      {showAssistantModal && (
        <MasterAssistantModal
          onClose={() => setShowAssistantModal(false)}
          onSelectOrder={(id) => {
            setShowAssistantModal(false);
            setSelectedOrderId(id);
          }}
        />
      )}

    </div>
  );
};

// Карточка наряда для канбана
const OrderCard: React.FC<{ order: WorkOrder; onClick: () => void }> = ({ order, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border bg-slate-900/90 hover:bg-slate-900 cursor-pointer transition shadow-sm ${
        order.priority === 'emergency' ? 'border-red-800/80 hover:border-red-600' :
        order.priority === 'high' ? 'border-amber-800/80 hover:border-amber-600' :
        'border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-xs font-bold text-emerald-400">#{order.number}</span>
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
          order.priority === 'emergency' ? 'bg-red-950 text-red-400 border border-red-800' :
          order.priority === 'high' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
          'bg-slate-800 text-slate-300'
        }`}>
          {order.priority_label}
        </span>
      </div>

      {order.status === 'rejected' && (
        <div className="mb-2 p-1.5 bg-red-950/90 border border-red-500 rounded-lg text-[10px] font-bold text-red-200 flex items-center justify-between shadow">
          <span>❌ Отклонён слесарем</span>
          <span className="text-[9px] text-red-300 underline">Переназначить →</span>
        </div>
      )}

      <div className="font-bold text-xs text-white leading-snug line-clamp-1">{order.equipment.name}</div>
      <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">{order.description}</div>

      <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
        <span className="font-semibold text-slate-300">{order.assignee?.short_name || '—'}</span>
        <span className={order.overdue ? 'text-red-400 font-bold' : ''}>
          {order.overdue ? `Просрочен!` : new Date(order.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
