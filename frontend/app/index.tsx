// @ts-nocheck
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Alert,
  Easing,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { COLORS } from '../src/theme';
import {
  Question,
  PdfBank,
  loadUserQuestions,
  saveUserQuestions,
  loadPdfBanks,
  savePdfBanks,
  buildPool,
  checkAns,
  sanitizeTopicKey,
} from '../src/utils/questions';
import {
  speakQ,
  spkEn,
  cancelAllSpeech,
  waitForVoices,
  createRecognition,
  parsePdfFromUrl,
  parseLinesIntoQuestions,
  ttsController,
} from '../src/utils/speech';

const TOPIC_OPTIONS: { key: string; label: string }[] = [
  { key: 'general', label: '🌐 General' },
  { key: 'daily', label: '☀️ Daily Life' },
  { key: 'work', label: '💼 Work' },
  { key: 'family', label: '👨‍👩‍👧 Family' },
  { key: 'food', label: '🍽 Food' },
  { key: 'travel', label: '✈️ Travel' },
  { key: 'shopping', label: '🛍 Shopping' },
  { key: 'health', label: '🏥 Health' },
  { key: 'school', label: '🏫 School' },
];

const webStyle = (styles: React.CSSProperties) => (Platform.OS === 'web' ? (styles as any) : {});
const webClass = (cls: string) => (Platform.OS === 'web' ? ({ className: cls } as any) : {});

type ChatMsg = {
  id: string;
  role: 'bot' | 'user';
  kind?: 'question' | 'correct' | 'wrong' | 'info';
  teluguText?: string;
  bodyText?: string;
  correctAnswer?: string;
  hint?: string;
};

export default function Index() {
  // ====== State ======
  const [mode, setMode] = useState<'chat' | 'call'>('chat');
  const [syllabus, setSyllabus] = useState<string>('all');
  const [userQs, setUserQs] = useState<Question[]>([]);
  const [pdfBanks, setPdfBanks] = useState<PdfBank[]>([]);

  const [poolIdx, setPoolIdx] = useState(0);
  const poolRef = useRef<Question[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [qNum, setQNum] = useState(0);

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const [status, setStatus] = useState<'idle' | 'speaking' | 'listening'>('idle');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [typedInput, setTypedInput] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [sessEnded, setSessEnded] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [recBlocked, setRecBlocked] = useState(false);
  const [showReconnect, setShowReconnect] = useState(false);
  const [toast, setToast] = useState<string>('');

  const [mgrOpen, setMgrOpen] = useState(false);
  const [mgrTab, setMgrTab] = useState<'add' | 'pdf' | 'io'>('add');

  // Add form
  const [addTe, setAddTe] = useState('');
  const [addEn, setAddEn] = useState('');
  const [addHint, setAddHint] = useState('');
  const [addTopic, setAddTopic] = useState('general');

  // Feedback bubble (call)
  const [feedback, setFeedback] = useState<{ kind: 'correct' | 'wrong'; text: string; hint?: string } | null>(null);

  // Countdown
  const [countdown, setCountdown] = useState<number>(20);
  const countdownTimer = useRef<any>(null);
  const chatScrollRef = useRef<any>(null);

  // Recognition
  const recRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const waitAnsRef = useRef(false);
  const sessEndedRef = useRef(false);
  const currentQRef = useRef<Question | null>(null);
  const modeRef = useRef<'chat' | 'call'>('chat');

  useEffect(() => {
    currentQRef.current = currentQ;
  }, [currentQ]);
  useEffect(() => {
    sessEndedRef.current = sessEnded;
  }, [sessEnded]);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // ====== Toast ======
  const showToast = useCallback((t: string) => {
    setToast(t);
    setTimeout(() => setToast(''), 2400);
  }, []);

  // ====== Init ======
  useEffect(() => {
    (async () => {
      const [u, b] = await Promise.all([loadUserQuestions(), loadPdfBanks()]);
      setUserQs(u);
      setPdfBanks(b);
      await waitForVoices();

      // Build pool & start
      const pool = buildPool(u, b, 'all');
      poolRef.current = pool;
      setPoolIdx(0);

      // Init recognition
      const rec = createRecognition({
        onStart: () => {},
        onInterim: (t) => setLiveTranscript(t),
        onFinal: (t) => {
          setLiveTranscript('');
          handleAnswer(t);
        },
        onBlocked: () => {
          setRecBlocked(true);
          showToast('🎤 Microphone blocked. Please allow mic access.');
        },
        onEnd: () => {},
      });
      rec.onSilenceTimeout(() => {
        if (modeRef.current === 'call') {
          // In call mode, trigger repeat
          if (!isMutedRef.current && currentQRef.current) {
            spkEn('No answer heard. Let me repeat.', () => {
              if (currentQRef.current)
                speakQ(currentQRef.current.te, () => rec.openMic(), isMutedRef.current);
            }, isMutedRef.current);
          }
        } else {
          setShowReconnect(true);
        }
      });
      rec.build();
      recRef.current = rec;

      // Start first question
      setTimeout(() => nextQuestion(pool, 0), 400);
    })();

    return () => {
      if (recRef.current) recRef.current.abort();
      cancelAllSpeech();
      stopCountdown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== Pool rebuild on data/syllabus change ======
  const rebuildPool = useCallback(
    (uq: Question[], banks: PdfBank[], sy: string) => {
      const pool = buildPool(uq, banks, sy);
      poolRef.current = pool;
      setPoolIdx(0);
      return pool;
    },
    []
  );

  // ====== Countdown (Call mode) ======
  const startCountdown = () => {
    stopCountdown();
    setCountdown(20);
    countdownTimer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          stopCountdown();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };
  const stopCountdown = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  };

  // ====== Auto-scroll chat ======
  useEffect(() => {
    if (chatScrollRef.current && mode === 'chat') {
      setTimeout(() => {
        try {
          chatScrollRef.current.scrollToEnd({ animated: true });
        } catch {}
      }, 80);
    }
  }, [messages, mode]);

  // ====== Session flow ======
  const nextQuestion = useCallback(
    (poolOverride?: Question[], startIdx?: number) => {
      if (sessEndedRef.current) return;
      let pool = poolOverride || poolRef.current;
      let idx = startIdx !== undefined ? startIdx : poolIdx;

      if (pool.length === 0) {
        // Empty pool - show info message (replace any previous info msg)
        setCurrentQ(null);
        setMessages([
          {
            id: `info_${Date.now()}`,
            role: 'bot',
            kind: 'info',
            bodyText:
              '📭 No questions yet for this topic. Tap ⚙ Manage Questions to add some or upload a PDF.',
          },
        ]);
        setStatus('idle');
        return;
      }
      // Starting real question — clear any lingering info/empty state messages
      setMessages((m) => m.filter((msg) => msg.kind !== 'info'));

      if (idx >= pool.length) {
        // Reshuffle
        pool = buildPool(userQs, pdfBanks, syllabus);
        poolRef.current = pool;
        idx = 0;
      }

      const q = pool[idx];
      setCurrentQ(q);
      setQNum((n) => n + 1);
      setPoolIdx(idx + 1);
      setFeedback(null);
      setLiveTranscript('');
      setStatus('speaking');

      setMessages((m) => [
        ...m,
        { id: `b${Date.now()}`, role: 'bot', kind: 'question', teluguText: q.te },
      ]);

      // Speak Telugu, then open mic
      speakQ(
        q.te,
        () => {
          if (sessEndedRef.current) return;
          setStatus('listening');
          if (recRef.current) recRef.current.openMic();
          waitAnsRef.current = true;
          if (modeRef.current === 'call') startCountdown();
        },
        isMutedRef.current
      );
    },
    [poolIdx, userQs, pdfBanks, syllabus]
  );

  const handleAnswer = (ans: string) => {
    const q = currentQRef.current;
    if (!q) return;
    if (recRef.current) recRef.current.closeMic();
    stopCountdown();
    setStatus('idle');
    setLiveTranscript('');

    // Add user msg
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', bodyText: ans }]);

    const isCorrect = checkAns(ans, q);
    const best = q.en[0];

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setFeedback({ kind: 'correct', text: `✓ ${best}` });
      setMessages((m) => [
        ...m,
        {
          id: `bc${Date.now()}`,
          role: 'bot',
          kind: 'correct',
          bodyText: `✓ Correct!`,
          correctAnswer: best,
        },
      ]);
      spkEn(
        'Correct! Well done.',
        () => setTimeout(() => nextQuestion(), 350),
        isMutedRef.current
      );
    } else {
      setWrong((w) => w + 1);
      setFeedback({ kind: 'wrong', text: `✗ ${best}`, hint: q.hint });
      setMessages((m) => [
        ...m,
        {
          id: `bw${Date.now()}`,
          role: 'bot',
          kind: 'wrong',
          bodyText: `✗ Not quite.`,
          correctAnswer: best,
          hint: q.hint,
        },
      ]);
      spkEn(
        `Not quite. The answer is: ${best}. ${q.hint ? 'Tip: ' + q.hint : ''}`,
        () => setTimeout(() => nextQuestion(), 400),
        isMutedRef.current
      );
    }
  };

  // ====== Controls ======
  const onRepeat = () => {
    const q = currentQRef.current;
    if (!q) return;
    cancelAllSpeech();
    if (recRef.current) recRef.current.closeMic();
    stopCountdown();
    setStatus('speaking');
    speakQ(
      q.te,
      () => {
        if (sessEndedRef.current) return;
        setStatus('listening');
        if (recRef.current) recRef.current.openMic();
        if (modeRef.current === 'call') startCountdown();
      },
      isMutedRef.current
    );
  };

  const onMicTap = () => {
    if (recBlocked) {
      showToast('🎤 Microphone blocked. Reload page to retry.');
      return;
    }
    if (!recRef.current) return;
    if (status === 'listening') {
      recRef.current.closeMic();
      setStatus('idle');
      stopCountdown();
    } else {
      recRef.current.openMic();
      setStatus('listening');
      if (modeRef.current === 'call') startCountdown();
    }
  };

  const onToggleMute = () => {
    cancelAllSpeech();
    setIsMuted((m) => !m);
  };

  const onSubmitTyped = () => {
    const t = typedInput.trim();
    if (!t) return;
    setTypedInput('');
    handleAnswer(t);
  };

  const endSession = () => {
    setSessEnded(true);
    sessEndedRef.current = true;
    if (recRef.current) recRef.current.abort();
    cancelAllSpeech();
    stopCountdown();
    setShowSummary(true);
  };

  const endCall = () => {
    // Just switch back to chat (session continues)
    setMode('chat');
  };

  const restartSession = () => {
    setShowSummary(false);
    setSessEnded(false);
    sessEndedRef.current = false;
    setCorrect(0);
    setWrong(0);
    setQNum(0);
    setPoolIdx(0);
    setCurrentQ(null);
    currentQRef.current = null;
    setMessages([]);
    setFeedback(null);
    setLiveTranscript('');
    setIsMuted(false);
    isMutedRef.current = false;
    setRecBlocked(false);
    setStatus('idle');
    cancelAllSpeech();
    const pool = buildPool(userQs, pdfBanks, syllabus);
    poolRef.current = pool;
    setTimeout(() => {
      if (recRef.current) {
        recRef.current.build();
      } else {
        const rec = createRecognition({
          onStart: () => {},
          onInterim: (t) => setLiveTranscript(t),
          onFinal: (t) => {
            setLiveTranscript('');
            handleAnswer(t);
          },
          onBlocked: () => setRecBlocked(true),
          onEnd: () => {},
        });
        rec.build();
        recRef.current = rec;
      }
      // Directly trigger first question here (bypass useCallback closure issues)
      if (pool.length === 0) {
        setMessages([
          {
            id: `info_${Date.now()}`,
            role: 'bot',
            kind: 'info',
            bodyText:
              '📭 No questions yet for this topic. Tap ⚙ Manage Questions to add some or upload a PDF.',
          },
        ]);
        return;
      }
      const q = pool[0];
      setCurrentQ(q);
      currentQRef.current = q;
      setQNum(1);
      setPoolIdx(1);
      setStatus('speaking');
      setMessages([
        { id: `b${Date.now()}`, role: 'bot', kind: 'question', teluguText: q.te },
      ]);
      speakQ(
        q.te,
        () => {
          if (sessEndedRef.current) return;
          setStatus('listening');
          if (recRef.current) recRef.current.openMic();
          if (modeRef.current === 'call') startCountdown();
        },
        isMutedRef.current
      );
    }, 350);
  };

  const restartSoft = (pool: Question[]) => {
    // Does NOT touch recognition
    setQNum(0);
    setCorrect(0);
    setWrong(0);
    setPoolIdx(0);
    setMessages([]);
    setFeedback(null);
    setLiveTranscript('');
    setCurrentQ(null);
    cancelAllSpeech();
    setTimeout(() => nextQuestion(pool, 0), 300);
  };

  // ====== Syllabus selection ======
  const onSelectSyllabus = (key: string) => {
    if (key === syllabus) return;
    setSyllabus(key);
    const pool = buildPool(userQs, pdfBanks, key);
    poolRef.current = pool;
    restartSoft(pool);
  };

  // ====== Add manual question ======
  const onAddQuestion = async () => {
    const te = addTe.trim();
    const enRaw = addEn.trim();
    if (!te || !enRaw) {
      showToast('Please provide Telugu sentence and English answers');
      return;
    }
    const en = enRaw.split('|').map((s) => s.trim()).filter(Boolean);
    const newQ: Question = {
      te,
      en,
      hint: addHint.trim(),
      topic: addTopic,
    };
    const newArr = [...userQs, newQ];
    setUserQs(newArr);
    await saveUserQuestions(newArr);
    setAddTe('');
    setAddEn('');
    setAddHint('');
    showToast('✓ Question added');

    // If current pool is empty for this syllabus, auto-start
    const newPool = buildPool(newArr, pdfBanks, syllabus);
    poolRef.current = newPool;
    if (!currentQ && newPool.length > 0) {
      setTimeout(() => nextQuestion(newPool, 0), 200);
    }
  };

  const onDeleteUserQ = async (idx: number) => {
    const arr = userQs.filter((_, i) => i !== idx);
    setUserQs(arr);
    await saveUserQuestions(arr);
    showToast('Question deleted');
  };

  const onClearAllUserQs = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Delete all custom questions? This cannot be undone.')) return;
    }
    setUserQs([]);
    await saveUserQuestions([]);
    showToast('All custom questions cleared');
  };

  // ====== PDF upload ======
  const onPickPdfs = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const files = (res.assets || []) as any[];
      const newBanks: PdfBank[] = [];
      for (const f of files) {
        try {
          const bank = await parsePdfFromUrl(f.uri, f.name);
          if (bank.questions.length > 0) {
            newBanks.push(bank);
          } else {
            showToast(`⚠ No Q/A found in ${f.name}`);
          }
        } catch (e: any) {
          showToast(`PDF parse failed: ${e?.message || 'unknown'}`);
        }
      }
      if (newBanks.length === 0) return;
      // Merge — replace banks with same name
      const merged = [...pdfBanks];
      for (const nb of newBanks) {
        const idx = merged.findIndex((b) => b.name === nb.name);
        if (idx >= 0) merged[idx] = nb;
        else merged.push(nb);
      }
      setPdfBanks(merged);
      await savePdfBanks(merged);
      showToast(`✓ Loaded ${newBanks.length} PDF${newBanks.length > 1 ? 's' : ''}`);

      const pool = buildPool(userQs, merged, syllabus);
      poolRef.current = pool;
      if (!currentQ && pool.length > 0) {
        setTimeout(() => nextQuestion(pool, 0), 200);
      }
    } catch (e: any) {
      showToast(`Upload failed: ${e?.message || 'error'}`);
    }
  };

  const onDeleteBank = async (name: string) => {
    const arr = pdfBanks.filter((b) => b.name !== name);
    setPdfBanks(arr);
    await savePdfBanks(arr);
    showToast('PDF removed');
  };

  const onClearPdfs = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Remove all PDFs?')) return;
    }
    setPdfBanks([]);
    await savePdfBanks([]);
    showToast('All PDFs cleared');
  };

  // ====== Export / Import ======
  const onExport = () => {
    const payload = JSON.stringify({ userQuestions: userQs, pdfBanks }, null, 2);
    if (Platform.OS === 'web') {
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `english-coach-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('✓ Export downloaded');
    } else {
      showToast('Export available on web');
    }
  };

  const onImport = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = async (e: any) => {
        const f = e.target.files?.[0];
        if (!f) return;
        try {
          const txt = await f.text();
          const data = JSON.parse(txt);
          const uq: Question[] = Array.isArray(data.userQuestions) ? data.userQuestions : [];
          const banks: PdfBank[] = Array.isArray(data.pdfBanks) ? data.pdfBanks : [];
          const mergedU = [...userQs, ...uq];
          const mergedB = [...pdfBanks];
          for (const nb of banks) {
            const idx = mergedB.findIndex((b) => b.name === nb.name);
            if (idx >= 0) mergedB[idx] = nb;
            else mergedB.push(nb);
          }
          setUserQs(mergedU);
          setPdfBanks(mergedB);
          await saveUserQuestions(mergedU);
          await savePdfBanks(mergedB);
          showToast('✓ Import successful');
        } catch (err: any) {
          showToast('Import failed: invalid JSON');
        }
      };
      input.click();
    } else {
      showToast('Import available on web');
    }
  };

  // ====== Derived ======
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progressPct = total > 0 ? Math.min(100, (total / Math.max(1, poolRef.current.length || 10)) * 100) : 0;

  const syllabusPills = [
    { key: 'all', label: '📚 All Topics' },
    ...pdfBanks.map((b) => ({
      key: b.topic,
      label: '📄 ' + (b.name.length > 14 ? b.name.slice(0, 14) + '…' : b.name),
    })),
  ];

  const statusText =
    status === 'speaking'
      ? '● SPEAKING'
      : status === 'listening'
      ? '● LISTENING — speak now'
      : '● READY';

  const statusDotColor =
    status === 'speaking' ? COLORS.gold : status === 'listening' ? COLORS.red : COLORS.muted;

  // Countdown ring
  const ringRadius = 19;
  const ringCirc = 2 * Math.PI * ringRadius; // ~119.38
  const ringOffset = ringCirc * (1 - countdown / 20);
  const ringColor =
    countdown <= 5 ? COLORS.red : countdown <= 10 ? '#fb923c' : COLORS.gold;

  return (
    <View style={s.root} {...webClass('sans-font')}>
      {/* Background orbs */}
      <View pointerEvents="none" style={[s.bgWrap, { pointerEvents: 'none' } as any]}>
        <View style={[s.orb, s.orb1]} {...webClass('orb1')} />
        <View style={[s.orb, s.orb2]} {...webClass('orb2')} />
        <View style={[s.orb, s.orb3]} {...webClass('orb3')} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          mode === 'call' && { alignItems: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Card */}
        <View
          style={[s.card, mode === 'call' ? { maxWidth: 420 } : { maxWidth: 520 }]}
          testID="app-card"
        >
          {/* ============== HEADER ============== */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.logoBox}>
                <Text style={{ fontSize: 22 }}>🎓</Text>
              </View>
              <View>
                <Text style={s.title} {...webClass('serif-font')}>English Coach</Text>
                <Text style={s.subtitle}>Telugu → English</Text>
              </View>
            </View>
            <View style={s.headerRight}>
              <View style={s.freeBadge}>
                <Text style={s.freeBadgeTxt}>FREE</Text>
              </View>
              <View style={s.modeToggle}>
                <TouchableOpacity
                  style={[s.modeBtn, mode === 'chat' && s.modeBtnActive]}
                  onPress={() => setMode('chat')}
                  testID="mode-chat-btn"
                >
                  <Text
                    style={[s.modeBtnTxt, mode === 'chat' && s.modeBtnTxtActive]}
                  >
                    Chat
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.modeBtn, mode === 'call' && s.modeBtnActive]}
                  onPress={() => setMode('call')}
                  testID="mode-call-btn"
                >
                  <Text
                    style={[s.modeBtnTxt, mode === 'call' && s.modeBtnTxtActive]}
                  >
                    Call
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ============== SYLLABUS BAR ============== */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.pillsRow}
            contentContainerStyle={{ paddingHorizontal: 4, gap: 8, paddingVertical: 4 }}
          >
            {syllabusPills.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[s.pill, syllabus === p.key && s.pillActive]}
                onPress={() => onSelectSyllabus(p.key)}
                testID={`pill-${p.key}`}
              >
                <Text
                  style={[s.pillTxt, syllabus === p.key && s.pillTxtActive]}
                  numberOfLines={1}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ============== QUESTION MANAGER TOGGLE ============== */}
          <TouchableOpacity
            style={s.mgrToggleBtn}
            onPress={() => setMgrOpen((o) => !o)}
            testID="mgr-toggle-btn"
          >
            <Text style={s.mgrToggleTxt}>
              ⚙ Manage Questions  {mgrOpen ? '▲' : '▼'}
            </Text>
            <Text style={s.mgrToggleCount}>
              {userQs.length} custom · {pdfBanks.reduce((n, b) => n + b.questions.length, 0)} PDF
            </Text>
          </TouchableOpacity>

          {mgrOpen && (
            <View style={s.mgrPanel} testID="mgr-panel">
              {/* Tab headers */}
              <View style={s.mgrTabs}>
                {[
                  { k: 'add', l: '✏️ Add' },
                  { k: 'pdf', l: '📄 PDF' },
                  { k: 'io', l: '💾 Backup' },
                ].map((t) => (
                  <TouchableOpacity
                    key={t.k}
                    style={[s.mgrTab, mgrTab === (t.k as any) && s.mgrTabActive]}
                    onPress={() => setMgrTab(t.k as any)}
                    testID={`mgr-tab-${t.k}`}
                  >
                    <Text
                      style={[s.mgrTabTxt, mgrTab === (t.k as any) && s.mgrTabTxtActive]}
                    >
                      {t.l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {mgrTab === 'add' && (
                <View>
                  <Text style={s.label}>Telugu Sentence</Text>
                  <TextInput
                    value={addTe}
                    onChangeText={setAddTe}
                    placeholder="ఇక్కడ టెలుగు వాక్యం టైప్ చేయండి..."
                    placeholderTextColor={COLORS.muted}
                    multiline
                    style={[s.input, s.textarea]}
                    {...webClass('telugu-font')}
                    testID="add-te-input"
                  />
                  <Text style={s.label}>English Answers (pipe | separated)</Text>
                  <TextInput
                    value={addEn}
                    onChangeText={setAddEn}
                    placeholder="answer1 | answer2 | alternate answer"
                    placeholderTextColor={COLORS.muted}
                    style={s.input}
                    testID="add-en-input"
                  />
                  <Text style={s.label}>Hint (optional)</Text>
                  <TextInput
                    value={addHint}
                    onChangeText={setAddHint}
                    placeholder="grammar tip e.g. use 'has' for he/she/it"
                    placeholderTextColor={COLORS.muted}
                    style={s.input}
                    testID="add-hint-input"
                  />
                  <Text style={s.label}>Topic</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 10 }}
                    contentContainerStyle={{ gap: 6 }}
                  >
                    {TOPIC_OPTIONS.map((t) => (
                      <TouchableOpacity
                        key={t.key}
                        style={[s.topicChip, addTopic === t.key && s.topicChipActive]}
                        onPress={() => setAddTopic(t.key)}
                        testID={`topic-${t.key}`}
                      >
                        <Text
                          style={[s.topicChipTxt, addTopic === t.key && s.topicChipTxtActive]}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={s.primaryBtn}
                    onPress={onAddQuestion}
                    testID="add-question-btn"
                  >
                    <Text style={s.primaryBtnTxt}>➕ Add Question</Text>
                  </TouchableOpacity>

                  <Text style={[s.label, { marginTop: 14 }]}>
                    {userQs.length} custom question{userQs.length !== 1 ? 's' : ''} saved
                  </Text>
                  <View style={{ maxHeight: 220 }}>
                    <ScrollView nestedScrollEnabled>
                      {userQs.length === 0 && (
                        <Text style={s.emptyTxt}>No custom questions yet.</Text>
                      )}
                      {userQs.map((q, i) => (
                        <View key={i} style={s.qItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={s.qTe} {...webClass('telugu-font')}>{q.te}</Text>
                            <Text style={s.qEn} numberOfLines={1}>
                              {q.en.join(' | ')}
                            </Text>
                            <View style={s.qTopicBadge}>
                              <Text style={s.qTopicTxt}>{q.topic}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={s.deleteBtn}
                            onPress={() => onDeleteUserQ(i)}
                            testID={`del-q-${i}`}
                          >
                            <Text style={{ color: COLORS.red, fontSize: 16 }}>🗑</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                  {userQs.length > 0 && (
                    <TouchableOpacity
                      style={s.dangerBtn}
                      onPress={onClearAllUserQs}
                      testID="clear-all-user-qs"
                    >
                      <Text style={s.dangerBtnTxt}>🗑 Clear All Custom Questions</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {mgrTab === 'pdf' && (
                <View>
                  <TouchableOpacity
                    style={s.pdfUploadBtn}
                    onPress={onPickPdfs}
                    testID="pdf-upload-btn"
                  >
                    <Text style={{ fontSize: 28 }}>📄</Text>
                    <Text style={s.pdfUploadTxt}>Tap to upload PDF(s)</Text>
                    <Text style={s.pdfHintTxt}>
                      Format: Q: Telugu / A: English | alt / H: hint
                    </Text>
                  </TouchableOpacity>

                  <Text style={[s.label, { marginTop: 12 }]}>
                    Loaded PDFs ({pdfBanks.length})
                  </Text>
                  {pdfBanks.length === 0 && (
                    <Text style={s.emptyTxt}>No PDFs loaded.</Text>
                  )}
                  {pdfBanks.map((b) => (
                    <View key={b.name} style={s.pdfItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.pdfName} numberOfLines={1}>📄 {b.name}</Text>
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                          <View style={s.countBadge}>
                            <Text style={s.countBadgeTxt}>{b.questions.length} Q</Text>
                          </View>
                          <View style={s.qTopicBadge}>
                            <Text style={s.qTopicTxt} numberOfLines={1}>{b.topic}</Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={s.deleteBtn}
                        onPress={() => onDeleteBank(b.name)}
                        testID={`del-pdf-${b.name}`}
                      >
                        <Text style={{ color: COLORS.red, fontSize: 16 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {pdfBanks.length > 0 && (
                    <TouchableOpacity
                      style={s.dangerBtn}
                      onPress={onClearPdfs}
                      testID="clear-all-pdfs"
                    >
                      <Text style={s.dangerBtnTxt}>Clear All PDFs</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {mgrTab === 'io' && (
                <View>
                  <TouchableOpacity
                    style={s.primaryBtn}
                    onPress={onExport}
                    testID="export-btn"
                  >
                    <Text style={s.primaryBtnTxt}>⬇ Download All Questions as JSON</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.primaryBtn, { marginTop: 10, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.gold }]}
                    onPress={onImport}
                    testID="import-btn"
                  >
                    <Text style={[s.primaryBtnTxt, { color: COLORS.gold }]}>⬆ Import JSON</Text>
                  </TouchableOpacity>
                  <Text style={[s.emptyTxt, { marginTop: 12, textAlign: 'center' }]}>
                    Back up or transfer your question bank.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ============== SCORE BAR ============== */}
          <View style={s.scoreRow}>
            <Text style={s.scoreQ}>Q{qNum || '–'}</Text>
            <Text style={[s.scoreItem, { color: COLORS.green }]}>✓ {correct}</Text>
            <Text style={[s.scoreItem, { color: COLORS.red }]}>✗ {wrong}</Text>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={s.scoreAcc}>{accuracy}%</Text>
          </View>

          {/* ============== CALL VIEW ============== */}
          {mode === 'call' && (
            <View style={s.callView} testID="call-view">
              <View style={s.avatarWrap}>
                {status === 'speaking' && (
                  <>
                    <View style={s.pulseRing} {...webClass('pulse-ring')} />
                    <View style={s.pulseRing} {...webClass('pulse-ring r2')} />
                    <View style={s.pulseRing} {...webClass('pulse-ring r3')} />
                  </>
                )}
                <View style={s.avatar}>
                  <Text style={{ fontSize: 48 }}>🎓</Text>
                </View>
              </View>

              <Text style={s.callName} {...webClass('serif-font')}>English Coach</Text>
              <Text style={[s.callStatus, { color: statusDotColor }]}>{statusText}</Text>

              {/* Waveform */}
              <View style={s.waveform}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <View
                    key={i}
                    style={[
                      s.waveBar,
                      status === 'speaking' && Platform.OS === 'web'
                        ? { animationDelay: `${i * 0.1}s` } as any
                        : {},
                      status !== 'speaking' && { height: 6, opacity: 0.3 },
                    ]}
                    {...(status === 'speaking' ? webClass('wave-bar') : {})}
                  />
                ))}
              </View>

              {/* Countdown ring */}
              {status === 'listening' && (
                <View style={s.countdownWrap}>
                  {Platform.OS === 'web' ? (
                    <svg width={44} height={44} viewBox="0 0 44 44">
                      <circle
                        cx={22}
                        cy={22}
                        r={ringRadius}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={3}
                        fill="none"
                      />
                      <circle
                        cx={22}
                        cy={22}
                        r={ringRadius}
                        stroke={ringColor}
                        strokeWidth={3}
                        fill="none"
                        strokeDasharray={ringCirc}
                        strokeDashoffset={ringOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 22 22)"
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' } as any}
                      />
                      <text
                        x={22}
                        y={27}
                        textAnchor="middle"
                        fill={ringColor}
                        fontSize={13}
                        fontWeight={700}
                      >
                        {countdown}
                      </text>
                    </svg>
                  ) : (
                    <View style={[s.countdownFallback, { borderColor: ringColor }]}>
                      <Text style={{ color: ringColor, fontWeight: '700' }}>{countdown}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Question card */}
              {currentQ && (
                <View style={s.questionCard}>
                  <Text style={s.questionLabel}>Translate to English:</Text>
                  <Text style={s.questionTe} {...webClass('telugu-font')}>{currentQ.te}</Text>
                </View>
              )}

              {/* Live transcript */}
              {liveTranscript ? (
                <View style={s.transcriptBox}>
                  <Text style={s.transcriptTxt}>&ldquo;{liveTranscript}&rdquo;</Text>
                </View>
              ) : null}

              {/* Feedback bubble */}
              {feedback && (
                <View
                  style={[
                    s.feedbackBubble,
                    feedback.kind === 'correct' ? s.feedbackCorrect : s.feedbackWrong,
                  ]}
                >
                  <Text
                    style={[
                      s.feedbackTxt,
                      { color: feedback.kind === 'correct' ? COLORS.green : COLORS.red },
                    ]}
                  >
                    {feedback.text}
                  </Text>
                  {feedback.hint && feedback.kind === 'wrong' ? (
                    <Text style={s.feedbackHint}>💡 {feedback.hint}</Text>
                  ) : null}
                </View>
              )}

              {/* Q# badge */}
              {qNum > 0 && (
                <View style={s.qBadge}>
                  <Text style={s.qBadgeTxt}>Q{qNum}</Text>
                </View>
              )}

              {/* Controls */}
              <View style={s.callControls}>
                <TouchableOpacity
                  style={[s.circleBtn, s.circleBtnSubtle]}
                  onPress={onRepeat}
                  testID="call-repeat"
                >
                  <Text style={s.circleBtnIcon}>🔁</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.circleBtn, s.circleBtnRed]}
                  onPress={endCall}
                  testID="call-end"
                >
                  <Text style={[s.circleBtnIcon, { fontSize: 22 }]}>📵</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.circleBtn, s.circleBtnSubtle]}
                  onPress={onToggleMute}
                  testID="call-mute"
                >
                  <Text style={s.circleBtnIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={s.disconnectPill}
                onPress={endSession}
                testID="call-disconnect"
              >
                <Text style={s.disconnectPillTxt}>⏹ Disconnect & End Session</Text>
              </TouchableOpacity>

              <Text style={s.callFooter}>
                Bot speaks Telugu → you answer in English
              </Text>
            </View>
          )}

          {/* ============== CHAT VIEW ============== */}
          {mode === 'chat' && (
            <View style={s.chatView} testID="chat-view">
              {/* Status bar */}
              <View style={s.chatStatusBar}>
                <View
                  style={[
                    s.statusDot,
                    { backgroundColor: statusDotColor },
                  ]}
                  {...(status !== 'idle' ? webClass('status-pulse') : {})}
                />
                <Text style={[s.statusTxt, { color: statusDotColor }]}>
                  {statusText}
                </Text>
                <View style={{ flex: 1 }} />
                {qNum > 0 && (
                  <View style={s.qBadgeSmall}>
                    <Text style={s.qBadgeSmallTxt}>Q{qNum}</Text>
                  </View>
                )}
              </View>

              {/* Messages */}
              <ScrollView
                ref={chatScrollRef}
                style={s.chatMsgsScroll}
                contentContainerStyle={{ padding: 12, gap: 10 }}
                showsVerticalScrollIndicator={false}
              >
                {messages.length === 0 && (
                  <View style={s.chatEmpty}>
                    <Text style={{ fontSize: 38 }}>🎓</Text>
                    <Text style={s.chatEmptyTxt}>
                      Starting your session...
                    </Text>
                  </View>
                )}
                {messages.map((m) => (
                  <View
                    key={m.id}
                    style={[
                      s.msgRow,
                      m.role === 'user' && { justifyContent: 'flex-end' },
                    ]}
                    {...webClass('msg-enter')}
                  >
                    {m.role === 'bot' && (
                      <View style={s.botAvatar}>
                        <Text style={{ fontSize: 14 }}>🎓</Text>
                      </View>
                    )}
                    <View
                      style={[
                        s.bubble,
                        m.role === 'user' ? s.bubbleUser : s.bubbleBot,
                        m.kind === 'correct' && { borderColor: COLORS.green, borderWidth: 1 },
                        m.kind === 'wrong' && { borderColor: COLORS.red, borderWidth: 1 },
                      ]}
                    >
                      {m.kind === 'question' && (
                        <>
                          <Text style={s.bubbleLabel}>Translate to English:</Text>
                          <View style={s.teBox}>
                            <Text style={s.teText} {...webClass('telugu-font')}>
                              {m.teluguText}
                            </Text>
                          </View>
                        </>
                      )}
                      {m.kind === 'correct' && (
                        <>
                          <Text style={{ color: COLORS.green, fontWeight: '700' }}>
                            {m.bodyText}
                          </Text>
                          <Text style={{ color: COLORS.gold, marginTop: 4 }}>
                            ✦ {m.correctAnswer}
                          </Text>
                        </>
                      )}
                      {m.kind === 'wrong' && (
                        <>
                          <Text style={{ color: COLORS.red, fontWeight: '700' }}>
                            {m.bodyText}
                          </Text>
                          <Text style={{ color: COLORS.gold, marginTop: 4 }}>
                            ✦ Correct: {m.correctAnswer}
                          </Text>
                          {m.hint ? (
                            <Text style={{ color: COLORS.muted, marginTop: 4, fontStyle: 'italic' }}>
                              💡 Tip: {m.hint}
                            </Text>
                          ) : null}
                        </>
                      )}
                      {m.kind === 'info' && (
                        <Text style={{ color: COLORS.text }}>{m.bodyText}</Text>
                      )}
                      {!m.kind && m.role === 'user' && (
                        <Text style={{ color: '#fff', fontWeight: '500' }}>{m.bodyText}</Text>
                      )}
                    </View>
                  </View>
                ))}
                {liveTranscript ? (
                  <View style={s.liveBox}>
                    <Text style={s.liveTxt}>&ldquo;{liveTranscript}&rdquo;</Text>
                  </View>
                ) : null}
              </ScrollView>

              {/* Input area */}
              <View style={s.inputArea}>
                <View style={s.row1}>
                  <TouchableOpacity
                    style={[s.iconBtn, { borderColor: COLORS.border }]}
                    onPress={() => setMode('call')}
                    testID="switch-call-btn"
                  >
                    <Text style={s.iconBtnTxt}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.micBtn,
                      status === 'listening' && s.micBtnActive,
                    ]}
                    onPress={onMicTap}
                    testID="mic-btn"
                    {...(status === 'listening' ? webClass('mic-pulse') : {})}
                  >
                    <Text style={{ fontSize: 28 }}>
                      {status === 'listening' ? '⏹' : '🎤'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.iconBtn, { borderColor: COLORS.border }]}
                    onPress={onRepeat}
                    testID="chat-repeat-btn"
                  >
                    <Text style={s.iconBtnTxt}>🔁</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.row2}>
                  <TextInput
                    value={typedInput}
                    onChangeText={setTypedInput}
                    placeholder="Or type your English answer..."
                    placeholderTextColor={COLORS.muted}
                    style={s.chatInput}
                    onSubmitEditing={onSubmitTyped}
                    returnKeyType="send"
                    testID="chat-input"
                  />
                  <TouchableOpacity
                    style={s.sendBtn}
                    onPress={onSubmitTyped}
                    testID="chat-send-btn"
                  >
                    <Text style={{ fontSize: 16, color: '#000', fontWeight: '700' }}>➤</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.row3}>
                  <Text style={s.row3Hint}>
                    🎤 Tap mic & speak, or type above
                  </Text>
                  <TouchableOpacity
                    style={s.disconnectBtn}
                    onPress={endSession}
                    testID="chat-disconnect"
                  >
                    <Text style={s.disconnectBtnTxt}>⏹ Disconnect</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        <Text style={s.footerNote}>
          Made with ♡ · Web Speech + Google TTS · All data stored locally
        </Text>
      </ScrollView>

      {/* Reconnect floating button */}
      {showReconnect && (
        <TouchableOpacity
          style={s.reconnectBtn}
          {...webClass('reconnect-pulse')}
          onPress={() => {
            setShowReconnect(false);
            if (recRef.current) recRef.current.reconnect();
          }}
          testID="reconnect-btn"
        >
          <Text style={s.reconnectTxt}>🎤 Tap to Reconnect Mic</Text>
        </TouchableOpacity>
      )}

      {/* Toast */}
      {!!toast && (
        <View style={s.toast} pointerEvents="none" testID="toast">
          <Text style={s.toastTxt}>{toast}</Text>
        </View>
      )}

      {/* Summary overlay */}
      {showSummary && (
        <View style={s.summaryOverlay} testID="summary-overlay">
          <View style={s.summaryCard}>
            <Text style={{ fontSize: 56 }}>🎓</Text>
            <Text style={s.summaryTitle} {...webClass('serif-font')}>Session Complete</Text>
            <View style={s.gradeBadge}>
              <Text style={s.gradeTxt}>
                {accuracy >= 80
                  ? '🏆 Excellent'
                  : accuracy >= 60
                  ? '👍 Good job'
                  : accuracy >= 40
                  ? '📈 Keep going'
                  : '💪 Keep practicing'}
              </Text>
            </View>
            <View style={s.summaryStats}>
              <View style={s.statItem}>
                <Text style={[s.statVal, { color: COLORS.green }]}>{correct}</Text>
                <Text style={s.statLbl}>Correct</Text>
              </View>
              <View style={s.statItem}>
                <Text style={[s.statVal, { color: COLORS.red }]}>{wrong}</Text>
                <Text style={s.statLbl}>Wrong</Text>
              </View>
              <View style={s.statItem}>
                <Text style={[s.statVal, { color: COLORS.gold }]}>{accuracy}%</Text>
                <Text style={s.statLbl}>Score</Text>
              </View>
            </View>
            <View style={s.summaryProgressTrack}>
              <View style={[s.summaryProgressFill, { width: `${accuracy}%` }]} />
            </View>
            <Text style={s.summaryTotalTxt}>
              {total} total question{total !== 1 ? 's' : ''} answered
            </Text>
            <TouchableOpacity
              style={s.primaryBtn}
              onPress={restartSession}
              testID="summary-restart"
            >
              <Text style={s.primaryBtnTxt}>🔄 Start New Session</Text>
            </TouchableOpacity>
            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={[s.primaryBtn, { marginTop: 10, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border }]}
                onPress={() => {
                  if (typeof window !== 'undefined') window.location.reload();
                }}
                testID="summary-reload"
              >
                <Text style={[s.primaryBtnTxt, { color: COLORS.text }]}>↺ Reload Page</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    position: 'relative',
  },
  bgWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    ...Platform.select({
      web: { filter: 'blur(110px)' as any },
      default: { opacity: 0.3 },
    }),
  },
  orb1: {
    top: -180,
    left: -120,
    backgroundColor: 'rgba(139,92,246,0.35)',
  },
  orb2: {
    bottom: -200,
    right: -150,
    backgroundColor: 'rgba(245,200,66,0.28)',
  },
  orb3: {
    top: '50%',
    left: '50%',
    backgroundColor: 'rgba(59,130,246,0.22)',
    width: 620,
    height: 620,
    borderRadius: 310,
    marginLeft: -310,
    marginTop: -310,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: '100%' as any,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(22px) saturate(180%)' as any,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.4)' as any,
      },
      default: { elevation: 12 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 6px 20px rgba(245,200,66,0.4)' as any },
      default: { elevation: 4 },
    }),
  },
  title: { fontSize: 20, color: COLORS.text, fontWeight: '700', letterSpacing: 0.2 },
  subtitle: { fontSize: 11, color: COLORS.muted, marginTop: 1, letterSpacing: 0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  freeBadge: {
    backgroundColor: COLORS.greenDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  freeBadgeTxt: { color: COLORS.green, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  modeBtnActive: { backgroundColor: COLORS.gold },
  modeBtnTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  modeBtnTxtActive: { color: '#000' },
  pillsRow: { marginTop: 4, marginBottom: 10, maxHeight: 44 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  pillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  pillTxt: { color: COLORS.subtle, fontSize: 12, fontWeight: '600' },
  pillTxtActive: { color: '#000', fontWeight: '700' },
  mgrToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  mgrToggleTxt: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  mgrToggleCount: { color: COLORS.muted, fontSize: 11 },
  mgrPanel: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  mgrTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 3,
    borderRadius: 10,
  },
  mgrTab: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 8 },
  mgrTabActive: { backgroundColor: COLORS.gold },
  mgrTabTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  mgrTabTxtActive: { color: '#000', fontWeight: '700' },
  label: { color: COLORS.subtle, fontSize: 11, fontWeight: '600', marginBottom: 5, marginTop: 6, letterSpacing: 0.3 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  textarea: { minHeight: 70, textAlignVertical: 'top' },
  topicChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  topicChipActive: { backgroundColor: COLORS.goldDim, borderColor: COLORS.gold },
  topicChipTxt: { color: COLORS.subtle, fontSize: 11, fontWeight: '500' },
  topicChipTxtActive: { color: COLORS.gold },
  primaryBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 6px 20px rgba(245,200,66,0.35)' as any, cursor: 'pointer' as any },
      default: { elevation: 3 },
    }),
  },
  primaryBtnTxt: { color: '#000', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  emptyTxt: { color: COLORS.muted, fontSize: 12, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
  qItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    marginBottom: 6,
  },
  qTe: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  qEn: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  qTopicBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.goldDim,
    borderRadius: 6,
  },
  qTopicTxt: { color: COLORS.gold, fontSize: 10, fontWeight: '600' },
  deleteBtn: { padding: 6 },
  dangerBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.red,
    backgroundColor: COLORS.redDim,
  },
  dangerBtnTxt: { color: COLORS.red, fontSize: 13, fontWeight: '600' },
  pdfUploadBtn: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(245,200,66,0.04)',
    gap: 6,
  },
  pdfUploadTxt: { color: COLORS.gold, fontSize: 14, fontWeight: '600', marginTop: 4 },
  pdfHintTxt: { color: COLORS.muted, fontSize: 10, textAlign: 'center', paddingHorizontal: 12 },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    marginBottom: 6,
  },
  pdfName: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
  countBadge: {
    backgroundColor: COLORS.greenDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeTxt: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  scoreQ: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
  scoreItem: { fontSize: 13, fontWeight: '700' },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  scoreAcc: { color: COLORS.text, fontSize: 13, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  // Call view
  callView: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  avatarWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg,#fbbf24,#f59e0b)' as any,
        boxShadow: '0 10px 40px rgba(245,200,66,0.4)' as any,
      },
      default: { elevation: 8 },
    }),
  },
  pulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  callName: { fontSize: 20, color: COLORS.text, fontWeight: '700', letterSpacing: 0.3 },
  callStatus: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    marginTop: 2,
  },
  waveBar: {
    width: 4,
    height: 22,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  countdownWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  countdownFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionCard: {
    width: '100%',
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(245,200,66,0.06)',
    alignItems: 'center',
  },
  questionLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  questionTe: { color: COLORS.text, fontSize: 22, fontWeight: '500', textAlign: 'center', marginTop: 6, lineHeight: 32 },
  transcriptBox: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(99,102,241,0.5)',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  transcriptTxt: { color: COLORS.text, fontStyle: 'italic', textAlign: 'center' },
  feedbackBubble: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  feedbackCorrect: { borderColor: COLORS.green, backgroundColor: COLORS.greenDim },
  feedbackWrong: { borderColor: COLORS.red, backgroundColor: COLORS.redDim },
  feedbackTxt: { fontSize: 15, fontWeight: '700' },
  feedbackHint: { color: COLORS.muted, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  qBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.goldDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  qBadgeTxt: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  qBadgeSmall: {
    backgroundColor: COLORS.goldDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  qBadgeSmallTxt: { color: COLORS.gold, fontSize: 10, fontWeight: '700' },
  callControls: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  circleBtnSubtle: { backgroundColor: 'rgba(255,255,255,0.04)' },
  circleBtnRed: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
    ...Platform.select({
      web: { boxShadow: '0 6px 20px rgba(239,68,68,0.4)' as any },
      default: { elevation: 4 },
    }),
  },
  circleBtnIcon: { fontSize: 18 },
  disconnectPill: {
    width: '100%',
    backgroundColor: COLORS.red,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      web: { boxShadow: '0 6px 20px rgba(239,68,68,0.35)' as any },
      default: { elevation: 3 },
    }),
  },
  disconnectPillTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  callFooter: { color: COLORS.muted, fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  // Chat view
  chatView: {},
  chatStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  chatMsgsScroll: {
    height: 340,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginBottom: 10,
  },
  chatEmpty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  chatEmptyTxt: { color: COLORS.muted, fontSize: 13 },
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  bubbleBot: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleUser: {
    backgroundColor: COLORS.purple,
    ...Platform.select({
      web: { backgroundImage: 'linear-gradient(135deg,#8b5cf6,#6366f1)' as any },
      default: {},
    }),
  },
  bubbleLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  teBox: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(245,200,66,0.06)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  teText: { color: COLORS.text, fontSize: 16, fontWeight: '500', lineHeight: 24 },
  liveBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(99,102,241,0.5)',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  liveTxt: { color: COLORS.text, fontStyle: 'italic' },
  inputArea: {},
  row1: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnTxt: { fontSize: 18 },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(245,200,66,0.4)' as any },
      default: { elevation: 6 },
    }),
  },
  micBtnActive: { backgroundColor: COLORS.red },
  row2: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  row3Hint: { color: COLORS.muted, fontSize: 11, flex: 1 },
  disconnectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.red,
    backgroundColor: COLORS.redDim,
  },
  disconnectBtnTxt: { color: COLORS.red, fontSize: 11, fontWeight: '700' },
  footerNote: { color: COLORS.muted, fontSize: 11, marginTop: 12, marginBottom: 10 },
  reconnectBtn: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: [{ translateX: -110 }] as any,
    width: 220,
    backgroundColor: COLORS.red,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 30px rgba(239,68,68,0.5)' as any },
      default: { elevation: 8 },
    }),
  },
  reconnectTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  toast: {
    position: 'absolute',
    bottom: 90,
    left: '50%',
    transform: [{ translateX: -120 }] as any,
    width: 240,
    backgroundColor: 'rgba(10,14,24,0.96)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 30px rgba(0,0,0,0.5)' as any },
      default: { elevation: 6 },
    }),
  },
  toastTxt: { color: COLORS.text, fontSize: 13, textAlign: 'center' },
  summaryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7,9,15,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 200 as any,
    ...Platform.select({
      web: { backdropFilter: 'blur(14px)' as any },
      default: {},
    }),
  },
  summaryCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  summaryTitle: { fontSize: 26, color: COLORS.text, fontWeight: '700', marginTop: 6 },
  gradeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  gradeTxt: { color: COLORS.gold, fontWeight: '700', fontSize: 13 },
  summaryStats: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 10,
  },
  statItem: { alignItems: 'center', minWidth: 70 },
  statVal: { fontSize: 28, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  summaryProgressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  summaryProgressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 5,
    ...Platform.select({
      web: { backgroundImage: 'linear-gradient(90deg,#f5c842,#4ade80)' as any, transition: 'width 0.8s ease' as any },
      default: {},
    }),
  },
  summaryTotalTxt: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
});
