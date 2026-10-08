import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Section, Equipment, User, Priority, WorkType } from '../types';
import { X, Sparkles, AlertTriangle, Clock, Camera, Check, ShieldAlert, Mic, MicOff, QrCode, Search } from 'lucide-react';
import { useVoiceInput } from '../utils/useVoice';
import { useAuth } from '../context/AuthContext';

const MAX_PHOTOS = 5;  // как на сервере (routers/orders.py)

interface NewOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ onClose, onSuccess }) => {
  const { tr, ts, lang } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);

  const [sectionId, setSectionId] = useState<number | ''>('');
  const [equipmentId, setEquipmentId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('emergency');
  const [workType, setWorkType] = useState<WorkType>('unplanned');
  const [assigneeId, setAssigneeId] = useState<number | ''>('');
  // Кому выдаётся наряд: конкретному исполнителю или бригаде (раздел 5.1)
  const [assignMode, setAssignMode] = useState<'worker' | 'brigade'>('worker');
  const [brigades, setBrigades] = useState<Array<{ id: number; name: string }>>([]);
  const [brigadeId, setBrigadeId] = useState<number | ''>('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);  // фото неисправности, до MAX_PHOTOS

  const [suggestedFault, setSuggestedFault] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [deadlineMinutes, setDeadlineMinutes] = useState<number>(priority === 'emergency' ? 120 : 480);
  const [masterComment, setMasterComment] = useState('');

  const handleSelectByQr = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    const found = allEquipment.find(e => 
      (e.qr_code && e.qr_code.toUpperCase() === code) ||
      (e.inv_no && e.inv_no.toUpperCase() === code) ||
      (e.qr_code && e.qr_code.toUpperCase().includes(code)) ||
      (e.inv_no && e.inv_no.toUpperCase().includes(code)) ||
      (e.name && e.name.toUpperCase().includes(code))
    );
    if (found) {
      setSectionId(found.section_id);
      setEquipmentId(found.id);
      setShowQrModal(false);
      setQrInput('');
      setError(null);
    } else {
      setError(tr(`Оборудование с кодом "${rawCode}" не найдено в базе данных`, `"${rawCode}" кодты жабдық дерекқорда табылмады`));
    }
  };

  const { isListening, toggleListening } = useVoiceInput((transcript) => {
    setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
  });

  useEffect(() => {
    async function loadData() {
      try {
        const dicts = await api.getDictionaries();
        setSections(dicts.sections);
        setAllEquipment(dicts.equipment);
        setBrigades(dicts.brigades || []);
        const wList = await api.getWorkers();
        setWorkers(wList);

        // По умолчанию для демо выбираем Обогатительную фабрику и Насос ГрАТ-1400 №1
        if (dicts.sections.length > 1) {
          const enrichSec = dicts.sections.find(s => s.name.includes('Обогатительная')) || dicts.sections[0];
          setSectionId(enrichSec.id);
          const pump = dicts.equipment.find((e: any) => e.section_id === enrichSec.id && e.name.includes('ГрАТ'));
          if (pump) {
            setEquipmentId(pump.id);
            setDescription(tr('Течь масла на насосе из-под уплотнения вала', 'Сорғыдағы білік тығыздағышынан май ағып жатыр'));
          }
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadData();
  }, []);

  // ИИ-подбор исполнителя при выборе оборудования или описания
  useEffect(() => {
    if (!equipmentId) return;
    async function fetchAiCandidates() {
      setLoadingAi(true);
      try {
        const candidates = await api.suggestAssignee(Number(equipmentId), description);
        setAiSuggestions(candidates);
        if (candidates.length > 0 && !assigneeId) {
          setAssigneeId(candidates[0].id); // автоматически выбираем лучшего кандидата!
        }
      } catch {
        // ignore
      } finally {
        setLoadingAi(false);
      }
    }
    const timer = setTimeout(fetchAiCandidates, 300);
    return () => clearTimeout(timer);
  }, [equipmentId, description]);

  // ИИ-подсказка шифра неисправности и норматива времени по описанию (раздел 5.1 п.4)
  useEffect(() => {
    if (!description || description.trim().length < 4) {
      setSuggestedFault(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.suggestFaultCode(description);
        if (res && res.code) {
          setSuggestedFault(res);
        } else {
          setSuggestedFault(null);
        }
      } catch {
        setSuggestedFault(null);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [description]);

  const filteredEquipment = allEquipment.filter(e => !sectionId || e.section_id === Number(sectionId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId) {
      setError(tr('Выберите оборудование', 'Жабдықты таңдаңыз'));
      return;
    }
    if (!description.trim()) {
      setError(tr('Укажите описание проблемы', 'Мәселенің сипаттамасын көрсетіңіз'));
      return;
    }
    if (assignMode === 'brigade' && !brigadeId) {
      setError(tr('Выберите бригаду', 'Бригаданы таңдаңыз'));
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const deadlineDate = new Date(Date.now() + Number(deadlineMinutes) * 60000).toISOString();
      const order = await api.createOrder({
        work_type: workType,
        description,
        equipment_id: Number(equipmentId),
        assignee_id: assignMode === 'worker' && assigneeId ? Number(assigneeId) : null,
        brigade_id: assignMode === 'brigade' && brigadeId ? Number(brigadeId) : null,
        priority,
        deadline: deadlineDate,
        comment: masterComment.trim() || undefined,
      });

      if (order.id) {
        for (const file of photoFiles) {
          await api.uploadPhoto(order.id, 'before', file);
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || tr('Ошибка создания наряда', 'Наряд жасау қатесі'));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Заголовок */}
        <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">{tr('Выдача наряда (быстро в ≤ 6 нажатий)', 'Наряд беру (≤ 6 басуда жылдам)')}</h3>
              <p className="text-xs text-slate-400">{tr('Мастер смены • мобильный ввод', 'Ауысым шебері • мобильді енгізу')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          
          {/* Приоритет (Крупные кнопки) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">{tr('Приоритет наряда', 'Наряд басымдығы')}</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setPriority('emergency'); setWorkType('unplanned'); }}
                className={`p-2.5 rounded-xl font-bold flex flex-col items-center justify-center border transition btn-touch ${
                  priority === 'emergency' 
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tr('🚨 Аварийный', '🚨 Апаттық')}</span>
                <span className="text-[10px] opacity-80">{tr('срочно в работу', 'шұғыл жұмысқа')}</span>
              </button>

              <button
                type="button"
                onClick={() => { setPriority('high'); setWorkType('unplanned'); }}
                className={`p-2.5 rounded-xl font-bold flex flex-col items-center justify-center border transition btn-touch ${
                  priority === 'high' 
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-950' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tr('⚠️ Высокий', '⚠️ Жоғары')}</span>
                <span className="text-[10px] opacity-80">{tr('в течение 4ч', '4 сағат ішінде')}</span>
              </button>

              <button
                type="button"
                onClick={() => { setPriority('normal'); }}
                className={`p-2.5 rounded-xl font-bold flex flex-col items-center justify-center border transition btn-touch ${
                  priority === 'normal' 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tr('📋 Обычный', '📋 Қалыпты')}</span>
                <span className="text-[10px] opacity-80">{tr('по очереди', 'кезек бойынша')}</span>
              </button>
            </div>
          </div>

          {/* Быстрый выбор по QR-коду (Бонус Section 10) */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
            <span className="text-slate-400 text-xs font-medium">{tr('Агрегат / Цех:', 'Агрегат / Цех:')}</span>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-600 rounded-lg text-xs font-bold transition btn-touch"
            >
              <QrCode size={14} />
              <span>{tr('📷 Сканировать QR-код', '📷 QR-кодты сканерлеу')}</span>
            </button>
          </div>

          {/* Участок и оборудование */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">{tr('Участок', 'Бөлімше')}</label>
              <select
                value={sectionId}
                onChange={(e) => {
                  setSectionId(Number(e.target.value));
                  setEquipmentId('');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">{tr('Выберите участок...', 'Бөлімшені таңдаңыз...')}</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{ts(s.name)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">{tr('Оборудование *', 'Жабдық *')}</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                required
              >
                <option value="">{tr('Выберите оборудование...', 'Жабдықты таңдаңыз...')}</option>
                {filteredEquipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.inv_no})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Описание проблемы */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">{tr('Описание неисправности', 'Ақаудың сипаттамасы')}</label>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold transition ${
                    isListening
                      ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-md shadow-red-950'
                      : 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-emerald-400'
                  }`}
                  title={tr('Голосовой ввод (распознавание речи)', 'Дауыспен енгізу (сөйлеуді тану)')}
                >
                  {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                  <span>{isListening ? tr('Слушаю...', 'Тыңдап тұрмын...') : tr('Голос', 'Дауыс')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDescription(tr('Течь масла на насосе из-под уплотнения', 'Сорғыдағы тығыздағыштан май ағып жатыр'))}
                  className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300"
                >
                  {tr('Пресет: Течь масла', 'Пресет: Май ағуы')}
                </button>
                <button
                  type="button"
                  onClick={() => setDescription(tr('Сильный нагрев и шум подшипникового узла', 'Мойынтірек торабы қатты қызып, шулап тұр'))}
                  className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300"
                >
                  {tr('Пресет: Подшипник', 'Пресет: Мойынтірек')}
                </button>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={tr('Опишите видимый дефект или симптомы поломки (или надиктуйте голосом)...', 'Көрінетін ақауды немесе бұзылу белгілерін сипаттаңыз (немесе дауыспен айтыңыз)...')}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
            {suggestedFault && (
              <div className="mt-1.5 p-2 bg-emerald-950/40 border border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
                <div className="flex items-center space-x-1.5 truncate">
                  <Sparkles size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {tr('ИИ-подсказка шифра:', 'ЖИ шифр кеңесі:')} <strong>[{suggestedFault.code}] {ts(suggestedFault.name)}</strong> ({tr('норматив:', 'норматив:')} ~{suggestedFault.norm_hours}{tr('ч', 'сағ')})
                  </span>
                </div>
                <span className="text-[10px] text-emerald-300 font-bold ml-2 shrink-0 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                  {suggestedFault.confidence}% {tr('совпадение', 'сәйкестік')}
                </span>
              </div>
            )}
          </div>

          {/* ИИ-подбор исполнителя */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <Sparkles size={16} className="text-emerald-400" />
                <span>{tr('ИИ-подбор исполнителя (раздел 5.1 п.3)', 'ЖИ орындаушы таңдауы (5.1-бөлім 3-т.)')}</span>
              </label>
              {loadingAi && <span className="text-[11px] text-emerald-400 animate-pulse">{tr('ИИ подбирает...', 'ЖИ таңдап жатыр...')}</span>}
            </div>

            {/* Кому выдать: исполнителю или бригаде */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {(['worker', 'brigade'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAssignMode(mode)}
                  className={`min-h-[48px] rounded-xl border text-xs font-bold transition ${
                    assignMode === mode
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {mode === 'worker' ? tr('👷 Исполнителю', '👷 Орындаушыға') : tr('👥 Бригаде', '👥 Бригадаға')}
                </button>
              ))}
            </div>

            {assignMode === 'brigade' && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {brigades.map(b => {
                    const members = workers.filter(w => w.brigade?.id === b.id);
                    const free = members.filter(w => w.live?.state === 'free').length;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBrigadeId(b.id)}
                        className={`min-h-[48px] p-2 rounded-xl border text-left transition ${
                          brigadeId === b.id
                            ? 'bg-emerald-950/60 border-emerald-500'
                            : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold text-white text-xs">{b.name}</div>
                        <div className={`text-[11px] ${free ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {free ? '🟢' : '🟡'} {tr('свободно', 'бос')} {free} {tr('из', '/')} {members.length}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-slate-400">
                  {tr('ИИ назначит лучшего свободного члена бригады нужной специальности; выбор попадёт в журнал наряда.', 'ЖИ бригаданың қажетті мамандықтағы ең жақсы бос мүшесін тағайындайды; таңдау наряд журналына түседі.')}
                </div>
              </div>
            )}

            {assignMode === 'worker' && aiSuggestions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {aiSuggestions.slice(0, 2).map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => setAssigneeId(cand.id)}
                    className={`p-2 rounded-xl border cursor-pointer transition ${
                      assigneeId === cand.id
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950'
                        : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{cand.short_name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300">
                        {cand.live?.state === 'free' ? tr('🟢 Свободен', '🟢 Бос') : tr('🟡 В работе', '🟡 Жұмыста')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{ts(cand.specialty)}, {cand.grade} {tr('разряд', 'разряд')}</div>
                    <div className="text-[10px] text-emerald-400 mt-1 italic leading-tight">
                      ★ {cand.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Выпадающий список всех исполнителей */}
            {assignMode === 'worker' && (
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">{tr('Назначить позже / свободный пул', 'Кейін тағайындау / бос пул')}</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.short_name} ({ts(w.specialty)}) — {ts(w.live?.label)}
                </option>
              ))}
            </select>
            )}
          </div>

          {/* Нормативный срок / Дедлайн (с пресетом Демо: 1 мин для Шага 4) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold text-xs flex items-center space-x-1.5">
                <span>{tr('Срок выполнения наряда (дедлайн)', 'Нарядты орындау мерзімі (дедлайн)')}</span>
              </label>
              <span className={`text-[11px] font-bold ${deadlineMinutes === 1 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {deadlineMinutes === 1 ? tr('⚡ ДЕМО: 1 минута (просрочка вживую)', '⚡ ДЕМО: 1 минут (мерзімнің өтуі тікелей)') : `+${deadlineMinutes >= 60 ? (deadlineMinutes/60) + ' ' + tr('ч', 'сағ') : deadlineMinutes + ' ' + tr('мин', 'мин')}`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: tr('⚡ Демо 1м', '⚡ Демо 1м'), val: 1 },
                { label: tr('30 мин', '30 мин'), val: 30 },
                { label: tr('2 часа', '2 сағат'), val: 120 },
                { label: tr('4 часа', '4 сағат'), val: 240 },
                { label: tr('8 часов', '8 сағат'), val: 480 },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setDeadlineMinutes(opt.val)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition text-center ${
                    deadlineMinutes === opt.val
                      ? opt.val === 1 
                        ? 'bg-red-950 border-red-500 text-red-200 shadow-md shadow-red-950' 
                        : 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Комментарий мастера */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-xs">{tr('Указания мастера смены (опционально)', 'Ауысым шебері нұсқаулары (міндетті емес)')}</label>
            <input
              type="text"
              value={masterComment}
              onChange={(e) => setMasterComment(e.target.value)}
              placeholder={tr('Особые условия: выставить ограждение, проверить давление...', 'Ерекше шарттар: қоршау қою, қысымды тексеру...')}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Фото дефекта (Камера/галерея) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">{tr('Фото неисправности (до 5 фото)', 'Ақаудың фотосы (5 фотоға дейін)')}</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer flex items-center space-x-2 bg-slate-900 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition">
                <Camera size={18} className="text-emerald-400" />
                <span className="text-xs">
                  {photoFiles.length >= MAX_PHOTOS ? tr(`Выбрано ${MAX_PHOTOS} фото`, `${MAX_PHOTOS} фото таңдалды`) : photoFiles.length ? tr('Добавить ещё фото', 'Тағы фото қосу') : tr('Сделать фото / Галерея', 'Фото түсіру / Галерея')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={photoFiles.length >= MAX_PHOTOS}
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    setPhotoFiles(prev => [...prev, ...picked].slice(0, MAX_PHOTOS));
                    e.target.value = '';  // позволяет выбрать тот же файл повторно
                  }}
                />
              </label>
              {photoFiles.length > 0 && (
                <span className="text-xs text-emerald-400 font-medium">
                  {photoFiles.length}/{MAX_PHOTOS} {tr('(будут сжаты ≤ 1600px)', '(≤ 1600px дейін сығылады)')}
                </span>
              )}
            </div>
            {photoFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photoFiles.map((f, i) => (
                  <div key={`${f.name}_${i}`} className="flex items-center bg-slate-900 border border-slate-700 rounded-lg pl-2 text-[11px] text-slate-300">
                    <span className="truncate max-w-[9rem]">✓ {f.name}</span>
                    <button
                      type="button"
                      onClick={() => setPhotoFiles(prev => prev.filter((_, j) => j !== i))}
                      className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-400 hover:text-red-400"
                      aria-label={tr('Убрать фото', 'Фотоны алып тастау')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white bg-slate-700/60 rounded-xl transition"
            >
              {tr('Отмена', 'Бас тарту')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center space-x-2 btn-touch disabled:opacity-50"
            >
              {submitting ? (
                <span>{tr('Выдаётся...', 'Берілуде...')}</span>
              ) : (
                <>
                  <Check size={18} />
                  <span>{tr('Выдать наряд', 'Наряд беру')}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* Модальное окно быстрого сканирования QR-кода оборудования */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-850 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                  <QrCode size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{tr('Сканер QR-кода оборудования', 'Жабдық QR-код сканері')}</h4>
                  <p className="text-[11px] text-slate-400">{tr('Мгновенный выбор агрегата в 1 тап (Бонус Section 10)', 'Агрегатты 1 басумен лезде таңдау (Бонус Section 10)')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Визуальная рамка сканера с анимацией лазера */}
              <div className="relative w-full h-32 bg-slate-900 rounded-xl border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse top-1/2 -translate-y-1/2"></div>
                <QrCode size={40} className="text-slate-700 mb-1" />
                <span className="text-xs text-emerald-300 font-medium z-10 bg-slate-900/80 px-2 py-0.5 rounded">
                  {tr('Камера готова • Наведите на QR-шильдик агрегата', 'Камера дайын • Агрегаттың QR-тақтайшасына бағыттаңыз')}
                </span>
              </div>

              {/* Ручной ввод / быстрый поиск по коду */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {tr('Или введите инв. номер / QR вручную:', 'Немесе инв. нөмірді / QR-ды қолмен енгізіңіз:')}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder={tr('Например: НС-001, ДР-001, СБ-001...', 'Мысалы: НС-001, ДР-001, СБ-001...')}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSelectByQr(qrInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectByQr(qrInput)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Search size={14} />
                    <span>{tr('Найти', 'Табу')}</span>
                  </button>
                </div>
              </div>

              {/* Быстрые пресеты оборудования комбината для Demo */}
              <div className="space-y-2 pt-2 border-t border-slate-700/80">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {tr('Шильдики на агрегатах комбината (клик для быстрого выбора):', 'Комбинат агрегаттарындағы тақтайшалар (жылдам таңдау үшін басыңыз):')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {allEquipment.slice(0, 10).map((eq) => (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => handleSelectByQr(eq.inv_no || eq.qr_code || eq.name)}
                      className="p-2 bg-slate-900 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-700 rounded-xl text-left transition flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-xs text-white truncate">{eq.name}</div>
                        <div className="text-[10px] text-slate-400">{ts(eq.section)}</div>
                      </div>
                      <span className="font-mono text-[10px] font-black bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
                        {eq.inv_no}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
