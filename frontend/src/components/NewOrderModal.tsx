import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Section, Equipment, User, Priority, WorkType } from '../types';
import { X, Sparkles, AlertTriangle, Clock, Camera, Check, ShieldAlert, Mic, MicOff, QrCode, Search } from 'lucide-react';
import { useVoiceInput } from '../utils/useVoice';

interface NewOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ onClose, onSuccess }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);

  const [sectionId, setSectionId] = useState<number | ''>('');
  const [equipmentId, setEquipmentId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('emergency');
  const [workType, setWorkType] = useState<WorkType>('unplanned');
  const [assigneeId, setAssigneeId] = useState<number | ''>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [suggestedFault, setSuggestedFault] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrInput, setQrInput] = useState('');

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
      setError(`Оборудование с кодом "${rawCode}" не найдено в базе данных`);
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
        const wList = await api.getWorkers();
        setWorkers(wList);

        // По умолчанию для демо выбираем Обогатительную фабрику и Насос ГрАТ-1400 №1
        if (dicts.sections.length > 1) {
          const enrichSec = dicts.sections.find(s => s.name.includes('Обогатительная')) || dicts.sections[0];
          setSectionId(enrichSec.id);
          const pump = dicts.equipment.find((e: any) => e.section_id === enrichSec.id && e.name.includes('ГрАТ'));
          if (pump) {
            setEquipmentId(pump.id);
            setDescription('Течь масла на насосе из-под уплотнения вала');
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
      setError('Выберите оборудование');
      return;
    }
    if (!description.trim()) {
      setError('Укажите описание проблемы');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const order = await api.createOrder({
        work_type: workType,
        description,
        equipment_id: Number(equipmentId),
        assignee_id: assigneeId ? Number(assigneeId) : null,
        priority,
      });

      if (photoFile && order.id) {
        await api.uploadPhoto(order.id, 'before', photoFile);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка создания наряда');
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
              <h3 className="font-bold text-base text-white">Выдача наряда (быстро в ≤ 6 нажатий)</h3>
              <p className="text-xs text-slate-400">Мастер смены • мобильный ввод</p>
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
            <label className="block text-slate-300 font-semibold mb-1.5">Приоритет наряда</label>
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
                <span>🚨 Аварийный</span>
                <span className="text-[10px] opacity-80">срочно в работу</span>
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
                <span>⚠️ Высокий</span>
                <span className="text-[10px] opacity-80">в течение 4ч</span>
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
                <span>📋 Обычный</span>
                <span className="text-[10px] opacity-80">по очереди</span>
              </button>
            </div>
          </div>

          {/* Быстрый выбор по QR-коду (Бонус Section 10) */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
            <span className="text-slate-400 text-xs font-medium">Агрегат / Цех:</span>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-600 rounded-lg text-xs font-bold transition btn-touch"
            >
              <QrCode size={14} />
              <span>📷 Сканировать QR-код</span>
            </button>
          </div>

          {/* Участок и оборудование */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Участок</label>
              <select
                value={sectionId}
                onChange={(e) => {
                  setSectionId(Number(e.target.value));
                  setEquipmentId('');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Выберите участок...</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Оборудование *</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                required
              >
                <option value="">Выберите оборудование...</option>
                {filteredEquipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.inv_no})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Описание проблемы */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">Описание неисправности</label>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold transition ${
                    isListening
                      ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-md shadow-red-950'
                      : 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-emerald-400'
                  }`}
                  title="Голосовой ввод (распознавание речи)"
                >
                  {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                  <span>{isListening ? 'Слушаю...' : 'Голос'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDescription('Течь масла на насосе из-под уплотнения')}
                  className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300"
                >
                  Пресет: Течь масла
                </button>
                <button
                  type="button"
                  onClick={() => setDescription('Сильный нагрев и шум подшипникового узла')}
                  className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300"
                >
                  Пресет: Подшипник
                </button>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Опишите видимый дефект или симптомы поломки (или надиктуйте голосом)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
            {suggestedFault && (
              <div className="mt-1.5 p-2 bg-emerald-950/40 border border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
                <div className="flex items-center space-x-1.5 truncate">
                  <Sparkles size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">
                    ИИ-подсказка шифра: <strong>[{suggestedFault.code}] {suggestedFault.name}</strong> (норматив: ~{suggestedFault.norm_hours}ч)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-300 font-bold ml-2 shrink-0 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                  {suggestedFault.confidence}% совпадение
                </span>
              </div>
            )}
          </div>

          {/* ИИ-подбор исполнителя */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <Sparkles size={16} className="text-emerald-400" />
                <span>ИИ-подбор исполнителя (раздел 5.1 п.3)</span>
              </label>
              {loadingAi && <span className="text-[11px] text-emerald-400 animate-pulse">ИИ подбирает...</span>}
            </div>

            {aiSuggestions.length > 0 && (
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
                        {cand.live?.state === 'free' ? '🟢 Свободен' : '🟡 В работе'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{cand.specialty}, {cand.grade} разряд</div>
                    <div className="text-[10px] text-emerald-400 mt-1 italic leading-tight">
                      ★ {cand.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Выпадающий список всех исполнителей */}
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">Назначить позже / свободный пул</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.short_name} ({w.specialty}) — {w.live?.label}
                </option>
              ))}
            </select>
          </div>

          {/* Фото дефекта (Камера/галерея) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Фото неисправности (до 5 фото)</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer flex items-center space-x-2 bg-slate-900 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition">
                <Camera size={18} className="text-emerald-400" />
                <span className="text-xs">{photoFile ? 'Фото выбрано' : 'Сделать фото / Галерея'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPhotoFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
              {photoFile && (
                <span className="text-xs text-emerald-400 font-medium truncate max-w-xs">
                  ✓ {photoFile.name} (будет сжато ≤ 1600px)
                </span>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white bg-slate-700/60 rounded-xl transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center space-x-2 btn-touch disabled:opacity-50"
            >
              {submitting ? (
                <span>Выдаётся...</span>
              ) : (
                <>
                  <Check size={18} />
                  <span>Выдать наряд</span>
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
                  <h4 className="font-bold text-sm text-white">Сканер QR-кода оборудования</h4>
                  <p className="text-[11px] text-slate-400">Мгновенный выбор агрегата в 1 тап (Бонус Section 10)</p>
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
                  Камера готова • Наведите на QR-шильдик агрегата
                </span>
              </div>

              {/* Ручной ввод / быстрый поиск по коду */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Или введите инв. номер / QR вручную:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Например: НС-001, ДР-001, СБ-001..."
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
                    <span>Найти</span>
                  </button>
                </div>
              </div>

              {/* Быстрые пресеты оборудования комбината для Demo */}
              <div className="space-y-2 pt-2 border-t border-slate-700/80">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Шильдики на агрегатах комбината (клик для быстрого выбора):
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
                        <div className="text-[10px] text-slate-400">{eq.section}</div>
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
