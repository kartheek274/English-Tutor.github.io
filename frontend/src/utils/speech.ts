import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Question, sanitizeTopicKey } from './questions';

// ------------- TTS Controller (prevents stale/double-fire callbacks) -------------
export const ttsController = { id: 0 };
let ttsAudio: HTMLAudioElement | null = null;
let watchdogTimer: any = null;

export function cancelAllSpeech() {
  ttsController.id++;
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    if (ttsAudio) {
      try {
        ttsAudio.onended = null;
        ttsAudio.onerror = null;
        ttsAudio.oncanplay = null;
        ttsAudio.pause();
        ttsAudio.src = '';
      } catch {}
      ttsAudio = null;
    }
    if (watchdogTimer) {
      clearTimeout(watchdogTimer);
      watchdogTimer = null;
    }
  } else {
    Speech.stop();
  }
}

// ------------- Speak Telugu Question (Google Translate TTS on web, expo-speech on native) -------------
export function speakQ(text: string, done: () => void, isMuted = false) {
  if (isMuted) {
    setTimeout(done, 50);
    return;
  }
  ttsController.id++;
  const myId = ttsController.id;
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    if (ttsController.id !== myId) return;
    done();
  };

  if (Platform.OS !== 'web') {
    // Use expo-speech with Telugu
    Speech.speak(text, {
      language: 'te-IN',
      rate: 0.85,
      pitch: 1.0,
      onDone: finish,
      onStopped: finish,
      onError: finish,
    });
    // Safety watchdog
    setTimeout(() => finish(), 12000);
    return;
  }

  // Web path: Google Translate TTS via <audio>.src (no fetch, no CORS)
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=te&client=tw-ob&ttsspeed=0.6`;
    const audio = new Audio();
    ttsAudio = audio;
    audio.src = url;
    audio.onended = () => {
      if (ttsAudio === audio) ttsAudio = null;
      finish();
    };
    audio.onerror = () => {
      if (ttsAudio === audio) ttsAudio = null;
      // On error, open mic silently (per spec: do NOT speak with any other voice)
      finish();
    };
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        if (ttsAudio === audio) ttsAudio = null;
        finish();
      });
    }
    // 8-second watchdog
    if (watchdogTimer) clearTimeout(watchdogTimer);
    watchdogTimer = setTimeout(() => {
      if (!settled && ttsController.id === myId) finish();
    }, 8000);
  } catch {
    finish();
  }
}

// ------------- Speak English Feedback -------------
export function spkEn(text: string, done: () => void, isMuted = false) {
  if (isMuted) {
    setTimeout(done, 50);
    return;
  }
  ttsController.id++;
  const myId = ttsController.id;
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    if (ttsController.id !== myId) return;
    done();
  };

  if (Platform.OS !== 'web') {
    Speech.speak(text, {
      language: 'en-US',
      rate: 0.92,
      pitch: 1.0,
      onDone: finish,
      onStopped: finish,
      onError: finish,
    });
    setTimeout(() => finish(), 8000);
    return;
  }

  try {
    // Cancel any previous en speech then delay 120ms
    window.speechSynthesis.cancel();
    setTimeout(() => {
      if (ttsController.id !== myId) return;
      const u = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en'));
      if (voice) u.voice = voice;
      u.rate = 0.92;
      u.pitch = 1.0;
      u.volume = 1.0;
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u); // EXACTLY ONE call
      // Safety timeout in case onend doesn't fire
      setTimeout(() => finish(), 7000);
    }, 120);
  } catch {
    finish();
  }
}

// ------------- Wait for voices to load on web -------------
export function waitForVoices(): Promise<void> {
  if (Platform.OS !== 'web') return Promise.resolve();
  return new Promise(resolve => {
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) return resolve();
      const handler = () => resolve();
      window.speechSynthesis.onvoiceschanged = handler;
      setTimeout(() => resolve(), 2000);
    } catch {
      resolve();
    }
  });
}

// =========================================================================================
//                                    SPEECH RECOGNITION
// =========================================================================================
// Web: Web Speech API with continuous:true + keepalive pattern
// Native: stub (user uses text input)

export type RecognitionCallbacks = {
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onBlocked?: () => void;
  onEnd?: () => void;
};

type Controller = {
  build: () => void;
  openMic: () => void;
  closeMic: () => void;
  abort: () => void;
  reconnect: () => void;
  onSilenceTimeout: (cb: () => void) => void;
  isBlocked: () => boolean;
  isLive: () => boolean;
};

export function createRecognition(cbs: RecognitionCallbacks): Controller {
  if (Platform.OS !== 'web') {
    // Native stub - speech recognition not available in Expo Go
    return {
      build: () => {},
      openMic: () => {},
      closeMic: () => {},
      abort: () => {},
      reconnect: () => {},
      onSilenceTimeout: () => {},
      isBlocked: () => true,
      isLive: () => false,
    };
  }

  const w: any = typeof window !== 'undefined' ? window : {};
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!SR) {
    return {
      build: () => {},
      openMic: () => {},
      closeMic: () => {},
      abort: () => {},
      reconnect: () => {},
      onSilenceTimeout: () => {},
      isBlocked: () => true,
      isLive: () => false,
    };
  }

  let rec: any = null;
  let recLive = false;
  let recBlocked = false;
  let listeningGate = false;
  let procLock = false;
  let waitAns = false;
  let sessEnded = false;
  let keepaliveTimer: any = null;
  let silenceWatchTimer: any = null;
  let keepaliveRestart = false;
  let lastSpeechTs = 0;
  let silenceCb: (() => void) | null = null;

  const startKeepalive = () => {
    stopKeepalive();
    keepaliveTimer = setInterval(() => {
      if (rec && recLive) {
        keepaliveRestart = true;
        try {
          rec.stop();
        } catch {}
      }
    }, 50000);
  };
  const stopKeepalive = () => {
    if (keepaliveTimer) {
      clearInterval(keepaliveTimer);
      keepaliveTimer = null;
    }
  };

  const startSilenceWatch = () => {
    stopSilenceWatch();
    lastSpeechTs = Date.now();
    silenceWatchTimer = setInterval(() => {
      if (Date.now() - lastSpeechTs > 20000) {
        stopSilenceWatch();
        if (silenceCb) silenceCb();
      }
    }, 1000);
  };
  const stopSilenceWatch = () => {
    if (silenceWatchTimer) {
      clearInterval(silenceWatchTimer);
      silenceWatchTimer = null;
    }
  };

  const build = () => {
    if (rec) {
      try {
        rec.abort();
      } catch {}
    }
    rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      recLive = true;
      if (cbs.onStart) cbs.onStart();
      startKeepalive();
    };
    rec.onresult = (e: any) => {
      lastSpeechTs = Date.now();
      if (!listeningGate || procLock) return;
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (interim && cbs.onInterim) cbs.onInterim(interim);
      if (final) {
        listeningGate = false;
        procLock = true;
        stopSilenceWatch();
        if (cbs.onFinal) cbs.onFinal(final.trim());
      }
    };
    rec.onerror = (e: any) => {
      const err = e?.error || '';
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        recBlocked = true;
        if (cbs.onBlocked) cbs.onBlocked();
      }
      // no-speech / aborted / others: ignore, recover via onend
    };
    rec.onend = () => {
      recLive = false;
      if (cbs.onEnd) cbs.onEnd();
      if (sessEnded || recBlocked) {
        stopKeepalive();
        return;
      }
      if (keepaliveRestart) {
        keepaliveRestart = false;
        setTimeout(() => {
          try {
            rec.start();
          } catch {}
        }, 150);
      } else {
        stopKeepalive();
        setTimeout(build, 300);
      }
    };

    try {
      rec.start();
    } catch {}
  };

  const openMic = () => {
    procLock = false;
    listeningGate = true;
    waitAns = true;
    startSilenceWatch();
  };
  const closeMic = () => {
    listeningGate = false;
    waitAns = false;
    stopSilenceWatch();
  };

  const abort = () => {
    sessEnded = true;
    closeMic();
    stopKeepalive();
    if (rec) {
      try {
        rec.abort();
      } catch {}
    }
    rec = null;
  };

  const reconnect = () => {
    sessEnded = false;
    recBlocked = false;
    build();
    if (waitAns) setTimeout(() => openMic(), 500);
  };

  const onSilenceTimeout = (cb: () => void) => {
    silenceCb = cb;
  };

  return {
    build,
    openMic,
    closeMic,
    abort,
    reconnect,
    onSilenceTimeout,
    isBlocked: () => recBlocked,
    isLive: () => recLive,
  };
}

// =========================================================================================
//                                    PDF PARSING (web only)
// =========================================================================================

export async function parsePdfFromUrl(url: string, filename: string): Promise<{
  name: string;
  topic: string;
  questions: Question[];
}> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return { name: filename, topic: sanitizeTopicKey(filename), questions: [] };
  }
  const pdfjsLib: any = (window as any).pdfjsLib;
  if (!pdfjsLib) {
    throw new Error('PDF.js not loaded yet. Please wait a moment and retry.');
  }
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  } catch {}

  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  const allLines: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    // Group items by Y bucket (rounded to 2px)
    const rows: Record<number, { x: number; s: string }[]> = {};
    for (const it of tc.items as any[]) {
      const y = Math.round(it.transform[5] / 2) * 2;
      const x = it.transform[4];
      if (!rows[y]) rows[y] = [];
      rows[y].push({ x, s: it.str });
    }
    // Sort Y descending (PDF Y is bottom-up), X ascending within same line
    const yKeys = Object.keys(rows)
      .map(Number)
      .sort((a, b) => b - a);
    for (const y of yKeys) {
      const line = rows[y]
        .sort((a, b) => a.x - b.x)
        .map(r => r.s)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (line) allLines.push(line);
    }
  }

  const topic = sanitizeTopicKey(filename);
  const questions = parseLinesIntoQuestions(allLines, topic);
  return { name: filename, topic, questions };
}

export function parseLinesIntoQuestions(lines: string[], topic: string): Question[] {
  const out: Question[] = [];
  let current: Partial<Question> | null = null;
  const flush = () => {
    if (current && current.te && current.en && current.en.length) {
      out.push({
        te: current.te,
        en: current.en,
        hint: current.hint || '',
        topic,
      });
    }
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Q: / A: / H: format
    const qm = line.match(/^Q\s*[:\-]\s*(.+)$/i);
    const am = line.match(/^A\s*[:\-]\s*(.+)$/i);
    const hm = line.match(/^H\s*[:\-]\s*(.+)$/i);

    if (qm) {
      flush();
      current = { te: qm[1].trim(), en: [], hint: '', topic };
      continue;
    }
    if (am) {
      if (!current) current = { te: '', en: [], hint: '', topic };
      const parts = am[1].split('|').map(s => s.trim()).filter(Boolean);
      current.en = parts;
      continue;
    }
    if (hm) {
      if (!current) current = { te: '', en: [], hint: '', topic };
      current.hint = hm[1].trim();
      continue;
    }

    // "Telugu — English" or "Telugu - English" or "Telugu: English"
    const dash = line.match(/^(.+?)\s*[—–-]\s*(.+)$/);
    if (dash && /[\u0C00-\u0C7F]/.test(dash[1])) {
      flush();
      const enParts = dash[2].split('|').map(s => s.trim()).filter(Boolean);
      out.push({ te: dash[1].trim(), en: enParts, hint: '', topic });
      continue;
    }

    // "1. Telugu | English" numbered
    const num = line.match(/^\d+\.\s*(.+?)\s*[|:]\s*(.+)$/);
    if (num && /[\u0C00-\u0C7F]/.test(num[1])) {
      flush();
      const enParts = num[2].split('|').map(s => s.trim()).filter(Boolean);
      out.push({ te: num[1].trim(), en: enParts, hint: '', topic });
      continue;
    }

    // Numbered Telugu only — next line should be English
    const num2 = line.match(/^\d+\.\s*(.+)$/);
    if (num2 && /[\u0C00-\u0C7F]/.test(num2[1])) {
      flush();
      current = { te: num2[1].trim(), en: [], hint: '', topic };
      continue;
    }

    // Continuation / English for current
    if (current && current.te && (!current.en || !current.en.length)) {
      const enParts = line.split('|').map(s => s.trim()).filter(Boolean);
      current.en = enParts;
      continue;
    }
  }
  flush();
  return out;
}
