# English Coach — Telugu to English Speaking Practice

## Product Overview
A production-ready Telugu-to-English speaking practice coach. Bot speaks Telugu questions, user responds in English via voice (Web Speech) or text. Zero backend — all data stored locally.

## Core Features
- **Bot voice (Telugu)**: Google Translate TTS via `<audio>.src` (web) / expo-speech fallback (native)
- **User input**: Web Speech API speech recognition (continuous:true with keepalive) OR text input
- **English feedback voice**: Web Speech API en-US
- **Two modes**: Chat (message thread) and Call (avatar, rings, waveform, 20s countdown)
- **Question bank**: Manual add, PDF upload (PDF.js via CDN), Export/Import JSON
- **Syllabus filtering**: Pills for "All Topics" + dynamic PDF topic pills
- **Answer checking**: Normalization with contraction expansion (i'm → i am, etc.) and article stripping
- **Session**: Scores, progress bar, accuracy %, grade badge, summary overlay with restart
- **Persistence**: AsyncStorage (web: localStorage fallback) — keys `eq_user_questions`, `eq_pdf_banks`

## Critical Technical Requirements Met
- `<audio>.src` for Google TTS (no fetch/CORS)
- `continuous:true` on SpeechRecognition (no re-prompt on restart)
- Keepalive every 50s via stop+restart same instance
- 20s silence watchdog with floating "Tap to Reconnect Mic" button
- `ttsController.id` increment + guard prevents stale callbacks
- `settled` flag in `speakQ` prevents double-fire (onerror + play().catch())
- EXACTLY ONE `speechSynthesis.speak(u)` call per spkEn invocation
- On Telugu TTS failure: open mic silently, do NOT fall back to any other voice
- Noto Sans Telugu font applied to all Telugu text elements

## File Structure
- `/app/frontend/app/index.tsx` — main app (single-page)
- `/app/frontend/app/+html.tsx` — HTML root with Google Fonts + PDF.js CDN + CSS animations
- `/app/frontend/src/theme.ts` — glassmorphism color palette
- `/app/frontend/src/utils/questions.ts` — storage, normalization, answer checking, pool building
- `/app/frontend/src/utils/speech.ts` — TTS (Telugu/English), recognition controller, PDF parser

## Visual Design
- Dark glassmorphism (#07090f bg, gold #f5c842, red #ef4444, green #4ade80)
- 3 animated blurred orbs (purple/gold/blue)
- Rounded-3xl card (max 520px chat, 420px call)
- DM Serif Display for headings, DM Sans for body, Noto Sans Telugu for Telugu

## Known Limitations
- Speech recognition only works on WEB (Chrome/Edge). On native Expo Go, users must type answers.
- Google Translate TTS works only on web. Native uses expo-speech with Telugu locale (te-IN) fallback.
- PDF parsing runs in-browser via PDF.js — web only.
