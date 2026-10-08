import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { WorkOrder, FaultCode, Material } from '../types';
import { X, Camera, Plus, Trash2, CheckCircle2, AlertTriangle, Sparkles, Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../utils/useVoice';
import { useAuth } from '../context/AuthContext';
import { hasPendingForOrder, isNetworkError, queueOfflineAction } from '../utils/offlineQueue';

interface CloseOrderModalProps {
  order: WorkOrder;
  onClose: () => void;
  onSuccess: (offline?: boolean) => void;
}

export const CloseOrderModal: React.FC<CloseOrderModalProps> = ({ order, onClose, onSuccess }) => {
  const { tr, ts } = useAuth();
  const [faultCodes, setFaultCodes] = useState<FaultCode[]>([]);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);

  const [workDone, setWorkDone] = useState('');
  const [faultCodeId, setFaultCodeId] = useState<number | ''>('');
  const [materials, setMaterials] = useState<Array<{ material_id: number; qty: number }>>([]);
  const [comment, setComment] = useState('');
  const [photoAfter, setPhotoAfter] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isListening: isListeningWork, toggleListening: toggleVoiceWork } = useVoiceInput((transcript) => {
    setWorkDone(prev => (prev ? `${prev} ${transcript}` : transcript));
  });

  useEffect(() => {
    async function loadDicts() {
      try {
        const dicts = await api.getDictionaries();
        setFaultCodes(dicts.fault_codes);
        setMaterialsList(dicts.materials);

        // Авто-подбор шифра по описанию
        const lowerDesc = order.description.toLowerCase();
        let matched = dicts.fault_codes.find((f: any) => lowerDesc.includes(f.name.toLowerCase()));
        if (!matched) {
          if (lowerDesc.includes('масл') || lowerDesc.includes('течь')) {
            matched = dicts.fault_codes.find((f: any) => f.code === 'Г-01');
          } else if (lowerDesc.includes('подшипник')) {
            matched = dicts.fault_codes.find((f: any) => f.code === 'М-02');
          }
        }
        if (matched) {
          setFaultCodeId(matched.id);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadDicts();
  }, [order.description]);

  // Демо-пресет: Заполнить корректно с материалами и фото
  const fillGoodDemo = () => {
    const fc = faultCodes.find(f => f.code === 'Г-01') || faultCodes[0];
    if (fc) setFaultCodeId(fc.id);
    setWorkDone(tr('Заменены изношенные манжеты и уплотнительные кольца гидронасоса, долито индустриальное масло И-40, течь устранена, проверена работа под нагрузкой', 'Гидрсорғының тозған манжеттері мен тығыздағыш сақиналары ауыстырылды, И-40 индустриалды майы құйылды, ағу жойылды, жүктеме астында жұмысы тексерілді'));
    
    const m1 = materialsList.find(m => m.name.includes('Манжета'));
    const m2 = materialsList.find(m => m.name.includes('Масло индустриальное'));
    const mats: any[] = [];
    if (m1) mats.push({ material_id: m1.id, qty: 2 });
    if (m2) mats.push({ material_id: m2.id, qty: 10 });
    setMaterials(mats);
    setComment(tr('Оборудование выведено на номинальный режим работы', 'Жабдық номиналды жұмыс режиміне шығарылды'));
  };

  // Демо-пресет: Заполнить с нарушениями (без фото, завышение материалов) для Шага 7
  const fillBadDemo = () => {
    const fc = faultCodes.find(f => f.code === 'Г-01') || faultCodes[0];
    if (fc) setFaultCodeId(fc.id);
    setWorkDone(tr('Сделано быстро', 'Тез жасалды'));
    const m2 = materialsList.find(m => m.name.includes('Масло индустриальное'));
    if (m2) {
      setMaterials([{ material_id: m2.id, qty: 40 }]); // норма 10 -> завышение в 4 раза!
    }
    setPhotoAfter(null);
    setComment(tr('Без замечаний', 'Ескертусіз'));
  };

  const addMaterialRow = () => {
    if (materialsList.length > 0) {
      setMaterials([...materials, { material_id: materialsList[0].id, qty: 1 }]);
    }
  };

  const removeMaterialRow = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterialRow = (index: number, field: 'material_id' | 'qty', value: any) => {
    const next = [...materials];
    next[index] = { ...next[index], [field]: value };
    setMaterials(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const closing = {
      work_done: workDone,
      fault_code_id: faultCodeId ? Number(faultCodeId) : null,
      materials: materials.map(m => ({ material_id: Number(m.material_id), qty: Number(m.qty) })),
      comment,
    };

    // Нет связи: фото (в IndexedDB) и закрытие уходят в офлайн-очередь одной записью
    const queueOffline = async () => {
      await queueOfflineAction(
        { orderId: order.id, orderNumber: order.number, action: 'complete', closing },
        photoAfter ? [{ kind: 'after', file: photoAfter }] : []
      );
      onSuccess(true);
    };

    try {
      // По наряду уже есть неотправленные действия — закрытие встаёт за ними
      if (hasPendingForOrder(order.id)) {
        await queueOffline();
        return;
      }

      // 1. Сначала загружаем фото «после», если приложено
      if (photoAfter) {
        try {
          await api.uploadPhoto(order.id, 'after', photoAfter);
        } catch (err) {
          if (!isNetworkError(err)) throw err;
          await queueOffline();
          return;
        }
      }

      // 2. Отправляем действие complete с формой закрытия (при обрыве связи api сам поставит его в очередь)
      const res: any = await api.applyAction(order.id, 'complete', undefined, undefined, closing);
      onSuccess(Boolean(res?.__offline));
    } catch (err: any) {
      setError(err.message || tr('Ошибка закрытия наряда', 'Нарядты жабу қатесі'));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Заголовок */}
        <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-white">{tr('Форма закрытия наряда', 'Нарядты жабу пішіні')} №{order.number}</h3>
            <p className="text-xs text-slate-400">{order.equipment.name} • {order.section.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Быстрые кнопки пресетов для сценария защиты */}
        <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-700/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">{tr('Пресеты сценария демо:', 'Демо сценарий пресеттері:')}</span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={fillGoodDemo}
              className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg font-medium transition"
            >
              {tr('✓ Шаг 5: Идеально с фото', '✓ 5-қадам: Фотомен тамаша')}
            </button>
            <button
              type="button"
              onClick={fillBadDemo}
              className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg font-medium transition"
            >
              {tr('⚠ Шаг 7: Ошибка для ИИ', '⚠ 7-қадам: ЖИ үшін қате')}
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          
          {/* Шифр неисправности */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {tr('Шифр неисправности (раздел 5.3) *', 'Ақау шифры (5.3-бөлім) *')}
            </label>
            <select
              value={faultCodeId}
              onChange={(e) => setFaultCodeId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              required
            >
              <option value="">{tr('Выберите шифр...', 'Шифрді таңдаңыз...')}</option>
              {faultCodes.map(f => (
                <option key={f.id} value={f.id}>
                  [{f.code}] {ts(f.name)} ({tr('норма:', 'норма:')} {f.norm_hours}{tr('ч', 'сағ')})
                </option>
              ))}
            </select>
          </div>

          {/* Описание выполненных работ */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">
                {tr('Выполненные работы (текст / голос) *', 'Орындалған жұмыстар (мәтін / дауыс) *')}
              </label>
              <button
                type="button"
                onClick={toggleVoiceWork}
                className={`flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold transition ${
                  isListeningWork
                    ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-md shadow-red-950'
                    : 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-emerald-400'
                }`}
                title={tr('Голосовой ввод выполненных работ', 'Орындалған жұмыстарды дауыспен енгізу')}
              >
                {isListeningWork ? <MicOff size={12} /> : <Mic size={12} />}
                <span>{isListeningWork ? tr('Слушаю...', 'Тыңдап тұрмын...') : tr('Голос', 'Дауыс')}</span>
              </button>
            </div>
            <textarea
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              rows={3}
              placeholder={tr('Детально опишите, какие узлы заменены, что отрегулировано (или надиктуйте голосом)...', 'Қандай тораптар ауыстырылғанын, не реттелгенін толық сипаттаңыз (немесе дауыспен айтыңыз)...')}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Списание материалов */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-300 font-semibold">{tr('Списанные материалы и запчасти', 'Есептен шығарылған материалдар мен қосалқы бөлшектер')}</label>
              <button
                type="button"
                onClick={addMaterialRow}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
              >
                <Plus size={14} />
                <span>{tr('Добавить материал', 'Материал қосу')}</span>
              </button>
            </div>

            {materials.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                {tr('Материалы не добавлены (нажмите «Добавить материал», если использовались запчасти)', 'Материалдар қосылмаған (қосалқы бөлшектер қолданылса, «Материал қосу» түймесін басыңыз)')}
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((m, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                    <select
                      value={m.material_id}
                      onChange={(e) => updateMaterialRow(idx, 'material_id', Number(e.target.value))}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                    >
                      {materialsList.map(mat => (
                        <option key={mat.id} value={mat.id}>{mat.name} ({mat.unit})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={m.qty}
                      onChange={(e) => updateMaterialRow(idx, 'qty', Number(e.target.value))}
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => removeMaterialRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Фото «после» */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {tr('Фото «после» ремонта (обязательно для внеплановых работ)', 'Жөндеуден «кейінгі» фото (жоспардан тыс жұмыстар үшін міндетті)')}
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer flex items-center space-x-2 bg-slate-900 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition">
                <Camera size={18} className="text-emerald-400" />
                <span className="text-xs">{photoAfter ? tr('Фото «после» выбрано', '«Кейінгі» фото таңдалды') : tr('Сделать фото «после»', '«Кейінгі» фото түсіру')}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPhotoAfter(e.target.files[0]);
                    }
                  }}
                />
              </label>
              {photoAfter ? (
                <span className="text-xs text-emerald-400 font-semibold truncate max-w-xs">
                  ✓ {photoAfter.name}
                </span>
              ) : (
                <span className="text-xs text-amber-400">
                  {tr('(ИИ требует фото для вердикта «Принято»)', '(«Қабылданды» үкімі үшін ЖИ фотоны талап етеді)')}
                </span>
              )}
            </div>
          </div>

          {/* Комментарий */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">{tr('Дополнительный комментарий', 'Қосымша түсініктеме')}</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={tr('Примечание мастера / рабочего...', 'Шебердің / жұмысшының ескертпесі...')}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Кнопки действий */}
          <div className="pt-3 flex justify-end space-x-3">
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
                <span>{tr('ИИ проверяет наряд...', 'ЖИ нарядты тексеруде...')}</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{tr('Отправить на проверку ИИ', 'ЖИ тексеруіне жіберу')}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
