// Speech recognition & synthesis service for Aura

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

export function isJapanese(text: string): boolean {
  return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(text);
}

export function speakText(text: string, rate = 1.0, preferredVoiceName = 'Kenji'): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.7, Math.min(1.5, rate));

    const isJp = isJapanese(text);
    utterance.lang = isJp ? 'ja-JP' : 'en-US';

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (isJp) {
        const jpVoice = voices.find((v) => v.lang.startsWith('ja') || v.name.includes('Japanese'));
        if (jpVoice) utterance.voice = jpVoice;
      } else {
        const targetVoice = voices.find((v) => v.name.includes(preferredVoiceName) || v.lang.startsWith('en'));
        if (targetVoice) utterance.voice = targetVoice;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function createSpeechRecognizer(
  onTranscript: (text: string, isFinal: boolean) => void,
  onStatusChange?: (status: 'listening' | 'idle' | 'error') => void,
  lang = 'en-US'
) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    return {
      isSupported: false,
      start: () => {},
      stop: () => {},
    };
  }

  const recognition = new SpeechRec();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onstart = () => {
    onStatusChange?.('listening');
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let fullTranscript = '';
    let isFinal = false;
    for (let i = 0; i < event.results.length; i++) {
      fullTranscript += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }
    onTranscript(fullTranscript, isFinal);
  };

  recognition.onerror = (e) => {
    console.warn('Speech recognition error:', e);
    onStatusChange?.('error');
  };

  recognition.onend = () => {
    onStatusChange?.('idle');
  };

  return {
    isSupported: true,
    start: () => {
      try {
        recognition.start();
      } catch (err) {
        console.warn('Recognition already started or blocked', err);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (err) {
        console.warn('Recognition stop error', err);
      }
    },
  };
}

export function triggerHaptic(enabled = true) {
  if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(30);
    } catch {
      // ignore
    }
  }
}
