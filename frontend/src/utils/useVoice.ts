import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// Браузер даёт микрофон только в защищённом контексте (https или localhost).
// При входе с телефона по http://<IP-ПК>:8000 работает голосовой ввод клавиатуры (значок 🎤 Gboard).
const MIC_BLOCKED_HINT = {
  ru: 'Браузер блокирует микрофон на странице без HTTPS. Нажмите на поле ввода и используйте ' +
    'кнопку микрофона 🎤 на клавиатуре телефона — текст надиктуется так же.',
  kz: 'Браузер HTTPS жоқ беттегі микрофонды бұғаттайды. Енгізу өрісін басып, телефон пернетақтасындағы ' +
    '🎤 микрофон түймесін пайдаланыңыз — мәтін дәл солай жазылады.',
};

export function useVoiceInput(onTranscript: (text: string) => void) {
  const { lang, tr } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'kz' ? 'kk-KZ' : 'ru-RU';

      recognition.onresult = (event: any) => {
        const text = event.results[0]?.[0]?.transcript;
        if (text) {
          onTranscript(text);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          alert(MIC_BLOCKED_HINT[lang]);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript, lang]);

  const toggleListening = useCallback(() => {
    if (!window.isSecureContext) {
      alert(MIC_BLOCKED_HINT[lang]);
      return;
    }
    if (!recognitionRef.current) {
      alert(tr(
        'Голосовой ввод не поддерживается этим браузером (доступен в Google Chrome и Microsoft Edge). ' +
          'Можно надиктовать текст кнопкой микрофона 🎤 на клавиатуре телефона.',
        'Бұл браузер дауыспен енгізуді қолдамайды (Google Chrome және Microsoft Edge-де қолжетімді). ' +
          'Мәтінді телефон пернетақтасындағы 🎤 микрофон түймесімен айтуға болады.',
      ));
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('SpeechRecognition start error', err);
        setIsListening(false);
      }
    }
  }, [isListening, lang, tr]);

  return { isListening, isSupported, toggleListening };
}
