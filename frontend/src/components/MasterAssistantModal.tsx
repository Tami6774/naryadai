import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { AssistantResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { useVoiceInput } from '../utils/useVoice';
import { 
  X, Sparkles, Send, Mic, MicOff, Users, Clock, AlertTriangle, 
  CheckCircle, ArrowRight, ExternalLink, Bot, RotateCcw 
} from 'lucide-react';

interface MasterAssistantModalProps {
  onClose: () => void;
  onSelectOrder?: (orderId: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  response?: AssistantResponse;
  timestamp: string;
}

export const MasterAssistantModal: React.FC<MasterAssistantModalProps> = ({ onClose, onSelectOrder }) => {
  const { tr, ts, lang } = useAuth();
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: tr('Здравствуйте! Я автономный ИИ-ассистент мастера «НарядAI». Задайте мне вопрос текстом или голосом — я проанализирую текущую смену, статусы слесарей и электриков, просрочки и оборудование.', 'Сәлеметсіз бе! Мен «НарядAI» шебері үшін автономды ЖИ-көмекшімін. Маған мәтінмен немесе дауыспен сұрақ қойыңыз — мен ағымдағы ауысымды, слесарьлер мен электриктердің мәртебелерін, мерзімнің өтуін және жабдықты талдаймын.'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, toggleListening } = useVoiceInput((transcript) => {
    if (transcript && transcript.trim()) {
      setInputQuery(transcript);
      handleSend(transcript);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askAssistant(q);
      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        sender: 'assistant',
        text: res.answer,
        response: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        sender: 'assistant',
        text: tr('❌ Не удалось получить ответ: ', '❌ Жауап алу мүмкін болмады: ') + (err.message || tr('Ошибка связи с сервером', 'Сервермен байланыс қатесі')),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Кнопка отправляет запрос на языке интерфейса; сервер разбирает обе версии фраз
  const samplePrompts: Array<[string, string]> = [
    ['Кто сейчас свободен из электриков?', 'Электриктерден қазір кім бос?'],
    ['Кто сейчас свободен из слесарей?', 'Слесарьлерден қазір кім бос?'],
    ['Что просрочено на смене?', 'Ауысымда не мерзімінен өтті?'],
    ['Сводка по смене', 'Ауысым қорытындысы'],
    ['Топ проблемного оборудования', 'Мәселелі жабдықтың топ-тізімі'],
    ['Сформируй отчёт по участку дробления', 'Ұсақтау бөлімшесі бойынша есеп жаса'],
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-850 border border-slate-700 w-full max-w-2xl h-[85vh] max-h-[750px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Заголовок */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30 flex items-center justify-center">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">{tr('ИИ-Ассистент мастера смены', 'Ауысым шебері ЖИ-көмекшісі')}</h3>
                <span className="text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  On-Premise NLP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {tr('Раздел 6.7 кейса • Голосовой и текстовый диалог со сменными данными', 'Кейстің 6.7-бөлімі • Ауысым деректерімен дауыстық және мәтіндік диалог')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Быстрые подсказки */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 shrink-0 overflow-x-auto">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center space-x-1 shrink-0">
              <Sparkles size={13} className="text-emerald-400" />
              <span>{tr('Примеры:', 'Мысалдар:')}</span>
            </span>
            {samplePrompts.map(([p, pKz], idx) => (
              <button
                key={idx}
                onClick={() => handleSend(lang === 'kz' ? pKz : p)}
                className="shrink-0 px-2.5 py-1 bg-slate-850 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-700 rounded-lg transition text-xs whitespace-nowrap"
              >
                {lang === 'kz' ? pKz : p}
              </button>
            ))}
          </div>
        </div>

        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-md ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {/* Заголовок сообщения ИИ */}
                {m.sender === 'assistant' && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold mb-1.5 pb-1 border-b border-slate-700">
                    <span className="flex items-center space-x-1">
                      <Sparkles size={12} />
                      <span>{tr('ИИ-Аналитик «НарядAI»', '«НарядAI» ЖИ-талдаушысы')}</span>
                    </span>
                    <span className="text-slate-400 font-normal">{m.timestamp}</span>
                  </div>
                )}

                {/* Основной текст ответа */}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>

                {/* Если в ответе есть структурированные данные по исполнителям */}
                {m.response?.intent === 'free_workers' && Array.isArray(m.response.data) && m.response.data.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-2">
                    <div className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
                      <Users size={13} className="text-emerald-400" />
                      <span>{tr('Исполнители, готовые к назначению:', 'Тағайындауға дайын орындаушылар:')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.response.data.map((w: any) => (
                        <div
                          key={w.id}
                          className="p-2 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-white">{w.name}</div>
                            <div className="text-[10px] text-slate-400">{ts(w.specialty)} • {w.grade} {tr('разряд', 'разряд')}</div>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                            {w.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Если в ответе есть структурированные данные по просроченным нарядам */}
                {m.response?.intent === 'overdue_orders' && Array.isArray(m.response.data) && m.response.data.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-2">
                    <div className="text-[11px] font-bold text-red-400 flex items-center space-x-1">
                      <AlertTriangle size={13} />
                      <span>{tr('Просроченные наряды:', 'Мерзімі өткен нарядтар:')}</span>
                    </div>
                    <div className="space-y-1.5">
                      {m.response.data.map((ord: any) => (
                        <div
                          key={ord.id}
                          className="p-2.5 bg-red-950/30 rounded-xl border border-red-800/80 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-white">
                              {tr('Наряд', 'Наряд')} #{ord.number} — <span className="text-slate-300 font-normal">{ord.equipment}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{tr('Исполнитель:', 'Орындаушы:')} {ord.assignee}</div>
                          </div>
                          {onSelectOrder && (
                            <button
                              onClick={() => onSelectOrder(ord.id)}
                              className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 transition"
                            >
                              <span>{tr('Открыть', 'Ашу')}</span>
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Рекомендации следующих вопросов */}
                {m.response?.suggestions && m.response.suggestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700">
                    <div className="text-[10px] text-slate-400 font-semibold mb-1.5">{tr('Возможные уточнения:', 'Мүмкін нақтылаулар:')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.response.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="text-[11px] px-2 py-0.5 bg-slate-900 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-700 rounded-md transition text-left"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Время отправки пользователем */}
                {m.sender === 'user' && (
                  <div className="text-[10px] text-emerald-200 mt-1 text-right font-medium">
                    {m.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 w-fit">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              <span>{tr('ИИ анализирует оперативные данные смены...', 'ЖИ ауысымның жедел деректерін талдауда...')}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода вопроса + Голосовой ввод */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-700/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            {/* Кнопка микрофона для голосового ввода */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border transition flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-900/50'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title={isListening ? tr('Идёт распознавание голоса... Нажмите для отмены', 'Дауыс танылуда... Бас тарту үшін басыңыз') : tr('Голосовой запрос (микрофон)', 'Дауыстық сұрау (микрофон)')}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isListening ? tr('Говорите вопрос в микрофон...', 'Сұрағыңызды микрофонға айтыңыз...') : tr('Задайте вопрос смены (текстом или голосом)...', 'Ауысым бойынша сұрақ қойыңыз (мәтінмен немесе дауыспен)...')}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Send size={16} />
              <span className="hidden sm:inline">{tr('Спросить', 'Сұрау')}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
