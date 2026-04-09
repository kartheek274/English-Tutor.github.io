# English-Tutor.github.io
theme: jekyll-theme-minimal
title: English Tutor
description: native language to English translator style coaching 
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>English Speaking Coach</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600&family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<style>
:root{
  --gold:#f5c842;--gdim:rgba(245,200,66,0.13);
  --red:#ef4444;--green:#4ade80;--blue:#60a5fa;
  --bg:#07090f;--bdr:rgba(255,255,255,0.08);
  --tx:rgba(255,255,255,0.87);--mt:rgba(255,255,255,0.32);
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);min-height:100vh;font-family:'DM Sans',sans-serif;color:var(--tx);
  display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:16px;
}
/* orbs */
.orbs{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.orb{position:absolute;border-radius:50%;filter:blur(90px);animation:drift 14s ease-in-out infinite alternate}
.o1{width:480px;height:480px;background:rgba(75,40,170,0.2);top:-130px;left:-100px}
.o2{width:320px;height:320px;background:rgba(245,200,66,0.07);bottom:-80px;right:-60px;animation-duration:10s;animation-delay:-5s}
.o3{width:180px;height:180px;background:rgba(59,130,246,0.08);top:38%;left:58%;animation-duration:16s;animation-delay:-8s}
@keyframes drift{from{transform:translate(0,0)}to{transform:translate(32px,42px) scale(1.1)}}

/* app shell */
#app{position:relative;z-index:1;width:500px;max-width:100%;
  background:rgba(10,14,24,0.92);backdrop-filter:blur(28px);
  border:1px solid rgba(255,255,255,0.09);border-radius:24px;
  box-shadow:0 28px 64px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.06);
  overflow:hidden;transition:width .35s}
#app.callmode{width:400px}

/* ── HEADER ── */
.hdr{padding:15px 18px 12px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:10px}
.hico{width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,#f5c842,#f59e0b);
  display:flex;align-items:center;justify-content:center;font-size:1.25rem;
  box-shadow:0 4px 14px rgba(245,200,66,0.28);flex-shrink:0}
.htxt h1{font-family:'DM Serif Display',serif;font-size:1.05rem;color:#fff;line-height:1.2}
.htxt p{font-size:0.65rem;color:var(--mt);letter-spacing:1.5px;text-transform:uppercase;margin-top:1px}
.fbadge{background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.22);border-radius:20px;
  padding:2px 9px;font-size:0.65rem;color:var(--green);letter-spacing:1px;white-space:nowrap;margin-left:auto}
.modetabs{display:flex;gap:4px;background:rgba(255,255,255,0.05);border-radius:8px;padding:3px;margin-left:8px}
.mtab{padding:4px 9px;border-radius:6px;border:none;cursor:pointer;font-size:0.68rem;
  font-family:'DM Sans',sans-serif;font-weight:500;background:transparent;color:var(--mt);transition:all .2s}
.mtab.on{background:var(--gold);color:#000;box-shadow:0 2px 6px rgba(245,200,66,0.3)}

/* ── SYLLABUS BAR ── */
.sylbar{padding:8px 16px;border-bottom:1px solid var(--bdr);background:rgba(0,0,0,0.1);
  display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.sylbar-label{font-size:0.63rem;color:var(--mt);letter-spacing:1px;text-transform:uppercase;white-space:nowrap}
.sylpill{padding:3px 10px;border-radius:20px;border:1px solid var(--bdr);background:transparent;
  color:var(--mt);font-size:0.67rem;cursor:pointer;font-family:'DM Sans',sans-serif;
  transition:all .2s;white-space:nowrap}
.sylpill:hover{border-color:rgba(245,200,66,0.35);color:var(--gold)}
.sylpill.on{background:rgba(245,200,66,0.12);border-color:rgba(245,200,66,0.4);color:var(--gold)}

/* ── PDF STRIP ── */
.pdfstrip{padding:8px 16px;border-bottom:1px solid var(--bdr);background:rgba(0,0,0,0.1);
  display:flex;flex-direction:column;gap:6px}
.pdf-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.pdf-upload-btn{display:flex;align-items:center;gap:5px;background:rgba(245,200,66,0.09);
  border:1px dashed rgba(245,200,66,0.32);border-radius:8px;padding:5px 11px;cursor:pointer;
  color:var(--gold);font-size:0.72rem;font-family:'DM Sans',sans-serif;font-weight:500;
  transition:all .2s;white-space:nowrap;flex-shrink:0}
.pdf-upload-btn:hover{background:rgba(245,200,66,0.16);border-color:rgba(245,200,66,0.55)}
#pdfInput{display:none}
.pdf-hint{font-size:0.62rem;color:var(--mt);line-height:1.5}
.pdf-list{display:flex;flex-direction:column;gap:4px}
.pdf-item{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.04);
  border:1px solid var(--bdr);border-radius:8px;padding:5px 10px;font-size:0.72rem}
.pdf-item-name{flex:1;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pdf-item-count{color:var(--gold);font-weight:600;flex-shrink:0}
.pdf-item-topic{background:rgba(245,200,66,0.1);border:1px solid rgba(245,200,66,0.2);
  border-radius:10px;padding:1px 7px;font-size:0.6rem;color:var(--gold)}
.pdf-item-del{background:none;border:none;color:var(--mt);cursor:pointer;font-size:0.9rem;
  padding:2px 4px;border-radius:4px;flex-shrink:0}
.pdf-item-del:hover{color:var(--red)}
.pdf-clear-all{background:none;border:1px solid rgba(239,68,68,0.25);border-radius:6px;
  padding:2px 8px;color:#f87171;font-size:0.65rem;cursor:pointer;font-family:'DM Sans',sans-serif}
.pdf-clear-all:hover{background:rgba(239,68,68,0.1)}

/* ── SCORE BAR ── */
.scorebar{padding:6px 18px;border-bottom:1px solid var(--bdr);
  display:flex;align-items:center;gap:9px;background:rgba(0,0,0,0.12)}
.si{display:flex;align-items:center;gap:4px;font-size:0.7rem;color:var(--mt)}
.si span{font-weight:700;font-size:0.78rem}
.sc{color:var(--green)}.sw{color:var(--red)}.sq{color:var(--gold)}
.pw{flex:1;height:4px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;margin-left:3px}
.pb{height:100%;background:linear-gradient(90deg,#f5c842,#4ade80);border-radius:4px;transition:width .5s;width:0%}

/* ── CALL VIEW ── */
.callview{display:none;flex-direction:column;align-items:center;padding:24px 20px 20px;gap:12px}
.callview.vis{display:flex}
.cav{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#f5c842,#f59e0b);
  display:flex;align-items:center;justify-content:center;font-size:2.3rem;position:relative;
  box-shadow:0 0 0 10px rgba(245,200,66,0.07),0 0 0 20px rgba(245,200,66,0.03)}
.ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(245,200,66,0.28);animation:re 2s ease-out infinite}
.ring:nth-child(2){animation-delay:.7s}.ring:nth-child(3){animation-delay:1.4s}
@keyframes re{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.4);opacity:0}}
.cname{font-family:'DM Serif Display',serif;font-size:1.25rem;color:#fff}
.cstat{font-size:0.7rem;color:var(--gold);letter-spacing:2px;text-transform:uppercase;min-height:16px}
.wfrow{display:flex;align-items:center;gap:12px}
.wf{display:flex;align-items:center;gap:3px;height:28px}
.wb{width:3px;border-radius:2px;background:var(--gold);animation:wa .85s ease-in-out infinite alternate}
.wb:nth-child(1){height:6px;animation-delay:0s}.wb:nth-child(2){height:16px;animation-delay:.1s}
.wb:nth-child(3){height:26px;animation-delay:.2s}.wb:nth-child(4){height:17px;animation-delay:.3s}
.wb:nth-child(5){height:9px;animation-delay:.4s}.wb:nth-child(6){height:22px;animation-delay:.5s}
.wb:nth-child(7){height:13px;animation-delay:.6s}.wb:nth-child(8){height:6px;animation-delay:.7s}
@keyframes wa{from{transform:scaleY(.3);opacity:.4}to{transform:scaleY(1);opacity:1}}
.wf.p .wb{animation-play-state:paused}
.cdwrap{position:relative;width:46px;height:46px;flex-shrink:0;display:none}
.cdsvg{width:46px;height:46px;transform:rotate(-90deg)}
.cdtrack{fill:none;stroke:rgba(255,255,255,0.06);stroke-width:3}
.cdcirc{fill:none;stroke:var(--gold);stroke-width:3;stroke-linecap:round;
  transition:stroke-dashoffset .5s linear,stroke .3s;stroke-dasharray:119.38;stroke-dashoffset:0}
.cdnum{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-size:.78rem;font-weight:700;color:var(--gold)}
.cqcard{width:100%;background:rgba(245,200,66,0.07);border:1px solid rgba(245,200,66,0.2);
  border-radius:13px;padding:12px 14px;display:flex;flex-direction:column;gap:5px}
.cqlabel{font-size:0.62rem;color:rgba(245,200,66,0.55);letter-spacing:2px;text-transform:uppercase}
.cqte{font-family:'Noto Sans Telugu',sans-serif;font-size:1.05rem;font-weight:600;color:#fde68a;line-height:1.5}
.cfeed{width:100%;border-radius:11px;padding:9px 12px;font-size:0.85rem;text-align:center;
  line-height:1.5;display:none}
.cfeed.vis{display:block}
.cfeed.ok{background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.22);color:var(--green)}
.cfeed.err{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.22);color:#fca5a5}
.ctrans{width:100%;font-size:.82rem;font-style:italic;color:rgba(255,255,255,.4);text-align:center;min-height:18px}
.qbadge{display:inline-flex;align-items:center;gap:4px;background:var(--gdim);
  border:1px solid rgba(245,200,66,0.18);border-radius:20px;padding:2px 10px;font-size:.68rem;color:var(--gold)}
/* call controls */
.ctrls{display:flex;gap:12px;align-items:center;justify-content:center}
.ctrl{width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .2s}
.ctrl.rep{background:rgba(255,255,255,.08);border:1px solid var(--bdr)}
.ctrl.rep:hover{background:rgba(255,255,255,.14)}
.ctrl.end{background:rgba(239,68,68,0.85);box-shadow:0 4px 14px rgba(239,68,68,.4)}
.ctrl.end:hover{transform:scale(1.08)}
.ctrl.mute{background:rgba(255,255,255,.08);border:1px solid var(--bdr)}
.ctrl.mute:hover{background:rgba(255,255,255,.14)}
.ctrl.mute.on{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.35)}
/* disconnect in call mode — prominent red pill button */
.disc-call{display:flex;align-items:center;justify-content:center;gap:7px;
  background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.4);
  border-radius:22px;padding:8px 22px;color:#f87171;font-size:0.78rem;font-weight:600;
  cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;width:100%}
.disc-call:hover{background:rgba(239,68,68,0.22);border-color:rgba(239,68,68,0.7);color:#fff}

/* ── CHAT VIEW ── */
.chatview{display:flex;flex-direction:column}.chatview.hidden{display:none}
.sbar{padding:6px 18px;display:flex;align-items:center;gap:7px;
  background:rgba(0,0,0,.15);border-bottom:1px solid var(--bdr);min-height:32px}
.sdot{width:7px;height:7px;border-radius:50%;flex-shrink:0;transition:background .3s}
.sdot.idle{background:var(--mt)}.sdot.sp{background:var(--gold);animation:pd .9s infinite}
.sdot.ls{background:var(--red);animation:pd .6s infinite}
@keyframes pd{0%,100%{opacity:1}50%{opacity:.2}}
.slbl{font-size:.68rem;color:var(--mt);letter-spacing:1px;text-transform:uppercase}
.msgs{height:270px;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px;
  scrollbar-width:thin;scrollbar-color:rgba(245,200,66,.1) transparent}
.msgs::-webkit-scrollbar{width:3px}.msgs::-webkit-scrollbar-thumb{background:rgba(245,200,66,.1);border-radius:3px}
.msg{display:flex;align-items:flex-start;gap:8px}.msg.u{flex-direction:row-reverse}
.mav{width:27px;height:27px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#f5c842,#f59e0b);
  display:flex;align-items:center;justify-content:center;font-size:.82rem;margin-top:2px}
.mb{max-width:80%;padding:9px 12px;border-radius:13px;font-size:.86rem;line-height:1.56}
.msg.b .mb{background:rgba(255,255,255,.052);border:1px solid var(--bdr);border-radius:4px 13px 13px 13px}
.msg.u .mb{background:linear-gradient(135deg,rgba(79,70,229,.8),rgba(124,58,237,.8));
  border-radius:13px 4px 13px 13px;color:#fff}
.tl{font-family:'Noto Sans Telugu',sans-serif;background:rgba(245,200,66,.08);
  border:1px solid rgba(245,200,66,.2);border-radius:8px;padding:7px 10px;margin-top:4px;
  color:#fde68a;font-size:.98rem;font-weight:600}
.cl{color:var(--green);font-weight:700}.wl{color:#f87171;font-weight:700}.hl{color:#fde68a}
.tprev{margin:0 14px 6px;padding:7px 12px;background:rgba(99,102,241,.07);
  border:1px dashed rgba(99,102,241,.26);border-radius:9px;font-size:.82rem;
  font-style:italic;color:rgba(255,255,255,.52);display:none}
.tprev.on{display:block}
.iarea{padding:10px 14px 13px;border-top:1px solid var(--bdr);display:flex;flex-direction:column;gap:8px}
.microw{display:flex;justify-content:center;align-items:center;gap:12px}
.micbtn{position:relative;width:62px;height:62px;border-radius:50%;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:1.65rem;
  background:linear-gradient(135deg,#f5c842,#f59e0b);box-shadow:0 5px 20px rgba(245,200,66,.3);
  transition:all .25s}
.micbtn:hover:not(:disabled){transform:scale(1.05)}
.micbtn.rec{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 5px 20px rgba(239,68,68,.5);animation:mp .9s ease infinite}
.micbtn:disabled{background:rgba(255,255,255,.06);box-shadow:none;cursor:not-allowed;animation:none}
@keyframes mp{0%,100%{box-shadow:0 5px 20px rgba(239,68,68,.5)}50%{box-shadow:0 5px 36px rgba(239,68,68,.85)}}
.rip{position:absolute;inset:-13px;border-radius:50%;border:2px solid rgba(239,68,68,.28);
  animation:ro 1.4s ease-out infinite;display:none}
.micbtn.rec .rip{display:block}.rip:nth-child(2){animation-delay:.5s}
@keyframes ro{0%{transform:scale(1);opacity:1}100%{transform:scale(1.72);opacity:0}}
.ibtn{width:42px;height:42px;border-radius:50%;border:1px solid var(--bdr);
  background:rgba(255,255,255,.04);cursor:pointer;font-size:1.1rem;
  display:flex;align-items:center;justify-content:center;transition:all .2s;color:#fff}
.ibtn:hover{background:rgba(255,255,255,.1);border-color:var(--gold)}
.txtrow{display:flex;gap:7px}
.txtinp{flex:1;background:rgba(255,255,255,.04);border:1px solid var(--bdr);border-radius:9px;
  padding:9px 12px;color:var(--tx);font-size:.85rem;font-family:'DM Sans',sans-serif;outline:none;
  transition:border-color .2s}
.txtinp:focus{border-color:rgba(245,200,66,.4)}.txtinp::placeholder{color:var(--mt)}
.sendbtn{background:linear-gradient(135deg,#f5c842,#f59e0b);border:none;border-radius:9px;
  padding:9px 13px;color:#000;font-size:.95rem;cursor:pointer;font-weight:700}
.sendbtn:disabled{background:rgba(255,255,255,.06);color:rgba(255,255,255,.18);cursor:not-allowed}
.chatfooter{display:flex;align-items:center;justify-content:space-between;gap:8px}
.chatfooter-hint{font-size:.64rem;color:var(--mt)}
.disc-chat{background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);
  border-radius:8px;padding:4px 12px;color:#f87171;font-size:.7rem;font-weight:600;
  cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;white-space:nowrap}
.disc-chat:hover{background:rgba(239,68,68,0.22);border-color:rgba(239,68,68,0.6);color:#fff}
</style>
</head>
<body>
<div class="orbs"><div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div></div>

<div id="app">

  <!-- HEADER -->
  <div class="hdr">
    <div class="hico">🎓</div>
    <div class="htxt"><h1>English Coach</h1><p>Telugu → English</p></div>
    <div class="fbadge">✦ FREE</div>
    <div class="modetabs">
      <button class="mtab on" id="chatTab" onclick="switchView('chat')">💬 Chat</button>
      <button class="mtab" id="callTab" onclick="switchView('call')">📞 Call</button>
    </div>
  </div>

  <!-- SYLLABUS SELECTOR -->
  <div class="sylbar">
    <span class="sylbar-label">Topic:</span>
    <button class="sylpill on" data-syl="all" onclick="setSyl('all')">📚 All Topics</button>
    <button class="sylpill" data-syl="there" onclick="setSyl('there')">📍 There Form</button>
    <button class="sylpill" data-syl="past_have" onclick="setSyl('past_have')">⏮ Past Have</button>
    <button class="sylpill" data-syl="present_have" onclick="setSyl('present_have')">🔵 Present Have</button>
    <button class="sylpill" data-syl="future_have" onclick="setSyl('future_have')">🔮 Future Have</button>
    <button class="sylpill" data-syl="be_there_have" onclick="setSyl('be_there_have')">🔄 Be+There+Have</button>
    <button class="sylpill" data-syl="action_verbs" onclick="setSyl('action_verbs')">⚡ Action Verbs</button>
    <button class="sylpill" data-syl="past_av" onclick="setSyl('past_av')">⏮ Past Simple AV</button>
    <button class="sylpill" data-syl="present_av" onclick="setSyl('present_av')">🔵 Present Simple AV</button>
    <button class="sylpill" data-syl="future_av" onclick="setSyl('future_av')">🔮 Future Simple AV</button>
  </div>

  <!-- PDF UPLOAD -->
  <div class="pdfstrip">
    <div class="pdf-top">
      <label class="pdf-upload-btn" for="pdfInput">📄 Upload PDF</label>
      <input type="file" id="pdfInput" accept=".pdf" multiple onchange="loadPDFs(this)"/>
      <span class="pdf-hint">Format: &nbsp;<b>Q:</b> Telugu sentence &nbsp;<b>A:</b> English answer | alt answer &nbsp;<b>H:</b> hint (optional)</span>
    </div>
    <div class="pdf-list" id="pdfList"></div>
  </div>

  <!-- SCORE BAR -->
  <div class="scorebar">
    <div class="si">Q <span class="sq" id="sqn">1</span></div>
    <div class="si">✓ <span class="sc" id="sco">0</span></div>
    <div class="si">✗ <span class="sw" id="swrong">0</span></div>
    <div class="pw"><div class="pb" id="pbar"></div></div>
    <div class="si" style="margin-left:4px"><span id="spct" style="color:var(--gold)">0%</span></div>
  </div>

  <!-- ══ CALL VIEW ══ -->
  <div class="callview" id="callV">
    <div class="cav">🎓<div class="ring"></div><div class="ring"></div><div class="ring"></div></div>
    <div style="text-align:center">
      <div class="cname">English Coach</div>
      <div class="cstat" id="cstat">● READY</div>
    </div>
    <div class="wfrow">
      <div class="wf p" id="wf">
        <div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div>
        <div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div>
      </div>
      <div class="cdwrap" id="cdWrap">
        <svg class="cdsvg" viewBox="0 0 46 46">
          <circle class="cdtrack" cx="23" cy="23" r="19"/>
          <circle class="cdcirc" id="cdArc" cx="23" cy="23" r="19"/>
        </svg>
        <div class="cdnum" id="cdNum">20</div>
      </div>
    </div>
    <div class="cqcard">
      <div class="cqlabel">Translate to English ↓</div>
      <div class="cqte" id="cqTe">Loading...</div>
    </div>
    <div class="ctrans" id="ctrans"></div>
    <div class="cfeed" id="cfeed"></div>
    <div class="qbadge">Q#<span id="cqn">1</span></div>
    <!-- standard call controls -->
    <div class="ctrls">
      <button class="ctrl rep" onclick="doRepeat()" title="Repeat question">🔁</button>
      <button class="ctrl end" onclick="endCall()" title="End call (back to chat)">📵</button>
      <button class="ctrl mute" id="muteBtn" onclick="toggleMute()" title="Mute">🎙️</button>
    </div>
    <!-- DISCONNECT button — ends session entirely -->
    <button class="disc-call" onclick="endSession()">⏹ Disconnect &amp; End Session</button>
    <div style="font-size:.62rem;color:var(--mt);text-align:center">Bot speaks Telugu → you answer in English</div>
  </div>

  <!-- ══ CHAT VIEW ══ -->
  <div class="chatview" id="chatV">
    <div class="sbar">
      <div class="sdot idle" id="sdot"></div>
      <span class="slbl" id="slbl">Ready</span>
      <div class="qbadge" style="margin-left:auto">Q#<span id="hqn">1</span></div>
    </div>
    <div class="msgs" id="msgs"></div>
    <div class="tprev" id="tprev"></div>
    <div class="iarea">
      <div class="microw">
        <button class="ibtn" onclick="switchView('call')" title="Switch to call mode">📞</button>
        <button class="micbtn" id="micBtn" onclick="toggleMic()">🎤<div class="rip"></div><div class="rip"></div></button>
        <button class="ibtn" onclick="doRepeat()" title="Repeat question">🔁</button>
      </div>
      <div class="txtrow">
        <input class="txtinp" id="txtInp" placeholder="Or type your English answer here..." onkeydown="if(event.key==='Enter')submitText()"/>
        <button class="sendbtn" onclick="submitText()">➤</button>
      </div>
      <div class="chatfooter">
        <span class="chatfooter-hint">🎤 Tap mic &nbsp;|&nbsp; 🔁 Repeat</span>
        <button class="disc-chat" onclick="endSession()">⏹ Disconnect</button>
      </div>
    </div>
  </div>
</div><!-- /#app -->

<script>
// ─────────────────────────────────────────────────────────────
// PDF.js setup
// ─────────────────────────────────────────────────────────────
if(typeof pdfjsLib!=='undefined')
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ─────────────────────────────────────────────────────────────
// ▼▼▼  MY_QUESTIONS — add your own here  ▼▼▼
// { te:"Telugu sentence", en:["answer1","answer2"], hint:"tip", topic:"be|articles|prepositions|mixed" }
// ─────────────────────────────────────────────────────────────
const MY_QUESTIONS = [
  // {te:"నేను బెంగళూరులో ఉన్నాను.", en:["i am in bangalore"], hint:"'in' for cities", topic:"prepositions"},
];

// ─────────────────────────────────────────────────────────────
// BUILT-IN QUESTIONS — from 9 PDFs (Day 7–15)
// Topics: there|past_have|present_have|future_have|
//         be_there_have|action_verbs|past_av|present_av|future_av
// ─────────────────────────────────────────────────────────────
const BUILTIN = [

  // ══ DAY 7: THERE FORM ══
  {te:"ఇక్కడ దగ్గర్లో ఏదైనా పెట్రోల్ బంక్ ఉందా?",en:["is there any petrol bunk nearby here?"],hint:"Present there: Is there + object?",topic:"there"},
  {te:"ఒకప్పుడు అక్కడ పెట్రోల్ బంక్ ఉంది.",en:["there was a petrol bunk once."],hint:"Past there: There was + object",topic:"there"},
  {te:"Future లో అక్కడ ఒక రెస్టారెంట్ ఉంటుంది.",en:["there will be a restaurant here in the future."],hint:"Future there: There will be + object",topic:"there"},
  {te:"మీ ఊర్లో ఏదైనా Temple ఉందా?",en:["is there any temple in your village?"],hint:"Is there any + object?",topic:"there"},
  {te:"నిన్న క్లాస్ ఉంది.",en:["there was a class yesterday."],hint:"Past there: There was",topic:"there"},
  {te:"రేపు ఇక్కడ ఇంటర్వ్యూ ఉంటుంది.",en:["there will be an interview here tomorrow."],hint:"Future there: There will be",topic:"there"},
  {te:"ఇప్పుడు ఇక్కడ ఏదైనా Interview ఉందా?",en:["is there any interview here now?"],hint:"Is there any + object now?",topic:"there"},
  {te:"ఇప్పుడు ఇక్కడ ఎన్ని Fans ఉన్నాయి?",en:["how many fans are there here now?"],hint:"How many + are there?",topic:"there"},
  {te:"రేపు ఏదైనా Seminar ఉందా?",en:["will there be any seminar tomorrow?"],hint:"Will there be + object?",topic:"there"},
  {te:"ఇప్పుడు హైదరాబాద్ కి ఏదైనా Train ఉందా?",en:["is there any train to hyderabad now?"],hint:"Is there any + object?",topic:"there"},
  {te:"రేపు ఇక్కడ పార్టీ ఉంటుంది.",en:["there will be a party here tomorrow."],hint:"Future there form",topic:"there"},
  {te:"రేపు ఇక్కడ ఏదైనా పార్టీ ఉంటుందా?",en:["will there be any party here tomorrow?"],hint:"Will there be any + object?",topic:"there"},
  {te:"నిన్న ఇక్కడ పార్టీ ఉంది.",en:["there was a party yesterday."],hint:"Past there: There was",topic:"there"},
  {te:"నిన్న ఇక్కడ ఏదైనా పార్టీ ఉందా?",en:["was there any party here yesterday?"],hint:"Was there any + object?",topic:"there"},
  {te:"నిన్న ఇక్కడ ఏదైనా సెమినార్ ఉందా?",en:["was there any seminar yesterday?"],hint:"Was there any + object?",topic:"there"},
  {te:"ఒకప్పుడు అక్కడ A.T.M ఉంది.",en:["there was an atm last year.","there was an atm once."],hint:"'an ATM' — A sounds like vowel",topic:"there"},
  {te:"ఒకప్పుడు అక్కడ A.T.M ఉందా?",en:["was there an atm last year?","was there an atm once?"],hint:"Was there + object?",topic:"there"},
  {te:"ఒకప్పుడు అక్కడ బిల్డింగ్స్ ఉన్నాయి.",en:["there were buildings once."],hint:"Past there: There were (plural)",topic:"there"},
  {te:"ఇక్కడ దగ్గర్లో ఏదైనా Shopping mall ఉందా?",en:["is there any shopping mall nearby here?"],hint:"Is there any + object nearby?",topic:"there"},
  {te:"ఇక్కడ దగ్గర్లో ఏదైనా బస్ స్టాప్ ఉందా?",en:["is there any bus stop nearby here?"],hint:"Is there any + object nearby?",topic:"there"},

  // ══ DAY 8: PAST HAVE ══
  {te:"నాకు గత సంవత్సరం అప్పులు ఉన్నాయి.",en:["i had debts last year."],hint:"Past have: Subject + had + object",topic:"past_have"},
  {te:"అతనికి నిన్న ఒక మీటింగ్ ఉంది.",en:["he had a meeting yesterday."],hint:"Past have: He had + object",topic:"past_have"},
  {te:"మీకు గతవారం ఏదైనా ఇంటర్వ్యూ ఉందా?",en:["did you have any interview last week?"],hint:"Did + subject + have + object?",topic:"past_have"},
  {te:"అతనికి అతని చిన్నతనంలో సైకిల్ లేదు.",en:["he didn't have any cycle during his childhood."],hint:"Didn't have: negative past",topic:"past_have"},
  {te:"మీ నాన్నగారికి గత సంవత్సరం ఏ బైక్ ఉంది?",en:["what kind of bike did your father have last year?"],hint:"What kind of + did + have?",topic:"past_have"},
  {te:"అతనికి నిన్న Class లేదా?",en:["didn't he have a class yesterday?"],hint:"Didn't + subject + have?",topic:"past_have"},
  {te:"మీకు నిన్న ఎన్ని గంటలకు Class ఉంది?",en:["at what time did you have a class yesterday?"],hint:"At what time + did + have?",topic:"past_have"},
  {te:"మా చిన్నతనంలో మాకు ఒక Car ఉంది.",en:["we had a car during our childhood."],hint:"Past have: We had + object",topic:"past_have"},
  {te:"Last week మీకు classes ఉన్నాయా?",en:["did you have classes last week?"],hint:"Did + have + object?",topic:"past_have"},
  {te:"మీ B.Tech లో మీ దగ్గర Mobile ఉందా?",en:["did you have a mobile in your b.tech?"],hint:"Did + have + object?",topic:"past_have"},
  {te:"నిన్న నాకు భయంకరమైన తలపోటు ఉంది.",en:["i had a horrible headache yesterday."],hint:"Past have: I had + object",topic:"past_have"},
  {te:"మా నాన్నగారికి నిన్న Meeting లేదు.",en:["my father didn't have any meeting yesterday."],hint:"Didn't have: negative",topic:"past_have"},
  {te:"మాకు ఒకప్పుడు Problems ఉన్నాయి.",en:["we had problems once."],hint:"Past have: We had",topic:"past_have"},
  {te:"అతనికి ఒకప్పుడు Responsibilities ఉన్నాయి.",en:["he had a lot of responsibilities once."],hint:"Past have: He had",topic:"past_have"},
  {te:"మీ ఇంటికి ఒకప్పుడు A.C ఉందా?",en:["did your house have an a.c once?"],hint:"Did + subject + have + object?",topic:"past_have"},
  {te:"Last year నాకు Bike ఉంది.",en:["i had a bike last year."],hint:"Past have: I had",topic:"past_have"},
  {te:"నా Bike నిన్న Repair లో ఉంది.",en:["my bike was under repair yesterday."],hint:"Was under repair: past BE",topic:"past_have"},
  {te:"మీకు ఒకప్పుడు ఎంత మంది Friends ఉన్నారు?",en:["how many friends did you have once?"],hint:"How many + did + have?",topic:"past_have"},
  {te:"మా స్కూల్ కి నా చిన్నతనంలో Playground ఉంది.",en:["our school had a big playground during my childhood."],hint:"Past have: Subject + had",topic:"past_have"},
  {te:"అతనికి ఒకప్పుడు Job లేదు.",en:["he didn't have a job once."],hint:"Didn't have: negative past",topic:"past_have"},
  {te:"అతను ఒకప్పుడు ఇక్కడ Employee.",en:["he was an employee here once."],hint:"Past BE: He was + noun",topic:"past_have"},
  {te:"2005 లో మీరు ఏంటి?",en:["what were you in 2005?"],hint:"Past BE: What were you + time?",topic:"past_have"},

  // ══ DAY 9: PRESENT HAVE ══
  {te:"అతనికి ఇప్పుడు Class ఉంది.",en:["he has a class now."],hint:"Present have: He/She/It + has",topic:"present_have"},
  {te:"నాకు ఇప్పుడు Class లేదు.",en:["i don't have a class now."],hint:"Don't have: I/We/You/They",topic:"present_have"},
  {te:"మీకు ఇప్పుడు Class ఉందా?",en:["do you have a class now?"],hint:"Do + subject + have?",topic:"present_have"},
  {te:"అతనికి Friends లేరు.",en:["he doesn't have friends."],hint:"Doesn't have: He/She/It negative",topic:"present_have"},
  {te:"అతనికి టీచింగ్ లో Experience లేదు.",en:["he doesn't have any experience in teaching."],hint:"Doesn't have any + object",topic:"present_have"},
  {te:"విశాఖపట్నంకి ఒక Airport ఉంది.",en:["visakhapatnam has an airport now."],hint:"Subject + has: third person",topic:"present_have"},
  {te:"మా నాన్నగారికి Car ఉంది.",en:["my father has a car."],hint:"Has: third person singular",topic:"present_have"},
  {te:"మీకు Car లేదా?",en:["don't you have a car?"],hint:"Don't you have + object?",topic:"present_have"},
  {te:"అతని దగ్గర IPhone ఉంది.",en:["he has an iphone now."],hint:"Has + 'an' before vowel",topic:"present_have"},
  {te:"నా దగ్గర Smartphone లేదు.",en:["i don't have a smartphone."],hint:"Don't have: first person",topic:"present_have"},
  {te:"అతనికి English లో Fluency ఉంది.",en:["he has fluency in english."],hint:"Has + fluency in",topic:"present_have"},
  {te:"మీ ఊరికి Road facility ఉందా?",en:["does your hometown have a road facility?"],hint:"Does + subject + have?",topic:"present_have"},
  {te:"మీకు ఎంతమంది పిల్లలు ఉన్నారు?",en:["how many children do you have?"],hint:"How many + do + have?",topic:"present_have"},
  {te:"అతనికి ఇద్దరు పిల్లలు ఉన్నారు.",en:["he has 2 children."],hint:"Has + number + plural",topic:"present_have"},
  {te:"విశాఖపట్నంకి ఎన్ని Airports ఉన్నాయి?",en:["how many airports does visakhapatnam have now?"],hint:"How many + does + have?",topic:"present_have"},
  {te:"మీ Phone కి Screen guard ఉందా?",en:["does your mobile have a screen guard?"],hint:"Does + subject + have?",topic:"present_have"},
  {te:"మీకు ఎన్ని ఎకరాల వేలం ఉంది?",en:["how many acres of land do you have now?"],hint:"How many + do + have?",topic:"present_have"},
  {te:"మీకు Specs ఉన్నాయా?",en:["do you have spectacles?"],hint:"Do + you + have?",topic:"present_have"},
  {te:"అతనికి ఇప్పుడు Birthday party ఉంది.",en:["he has a birthday party now."],hint:"Has: third person present",topic:"present_have"},
  {te:"నాకు ఇప్పుడు Interview ఉంది.",en:["i have an interview now."],hint:"Have: first person; 'an' before vowel",topic:"present_have"},

  // ══ DAY 10: FUTURE HAVE ══
  {te:"రేపు మీకు ఎన్ని గంటలకు Class ఉంది?",en:["at what time will you have a class tomorrow?"],hint:"Will + have + object?",topic:"future_have"},
  {te:"నేను Next week available గా ఉండను.",en:["i won't be available next week."],hint:"Won't be: negative future BE",topic:"future_have"},
  {te:"అతను Next week available గా ఉంటాడా?",en:["will he be available next week?"],hint:"Will + be + available?",topic:"future_have"},
  {te:"మీకు ఎప్పటికల్లా సొంతిల్లు ఉంటుంది?",en:["by when will you have your own house?"],hint:"By when + will + have?",topic:"future_have"},
  {te:"రేపు మాకు ఒక Birthday పార్టీ ఉంది.",en:["we will have a birthday party tomorrow."],hint:"Will have: future",topic:"future_have"},
  {te:"అతనికి రేపు Exam ఉందా?",en:["will he have an exam tomorrow?"],hint:"Will + have + object?",topic:"future_have"},
  {te:"ఆమెకి రేపు ఒక Exam ఉంది.",en:["she will have an exam tomorrow."],hint:"Will have: future",topic:"future_have"},
  {te:"నువ్వు రేపు ఎక్కడ ఉంటావు?",en:["where will you be tomorrow?"],hint:"Where + will + be?",topic:"future_have"},
  {te:"గుంటూరు కి Future లో Airport ఉంటుందా?",en:["will guntur have an airport in the future?"],hint:"Will + subject + have + in the future?",topic:"future_have"},
  {te:"అతనికి Future లో Specs ఉంటాయి.",en:["he will have spectacles in the future."],hint:"Will have: future",topic:"future_have"},
  {te:"నీకు Future లో Own house ఉంటుందా?",en:["will you have your own house in the future?"],hint:"Will + have + own house?",topic:"future_have"},
  {te:"ఎవరికి రేపు Holiday ఉంది?",en:["who will have a holiday tomorrow?"],hint:"Who + will + have?",topic:"future_have"},
  {te:"అతనికి Future లో IPhone ఉంటుంది.",en:["he will have an iphone in the future."],hint:"Will have + 'an' before vowel",topic:"future_have"},
  {te:"ఒకప్పుడు నా దగ్గర Mobile లేదు.",en:["i didn't have a mobile once."],hint:"Didn't have: past negative",topic:"future_have"},
  {te:"మీకు రేపు Class ఉంటుందా?",en:["will you have a class tomorrow?"],hint:"Will + have + object?",topic:"future_have"},

  // ══ DAY 11: BE + THERE + HAVE REVISION ══
  {te:"అక్కడ ఏముంది?",en:["what is there?"],hint:"What is there?: present there",topic:"be_there_have"},
  {te:"నిన్న నాకు ఇంటర్వ్యూ ఉంది.",en:["i had an interview yesterday."],hint:"Past have: I had",topic:"be_there_have"},
  {te:"రేపు విజాగ్ లో స్ట్రైక్ ఉంది.",en:["there will be a strike in vizag tomorrow."],hint:"Future there form",topic:"be_there_have"},
  {te:"మీ నాన్నగారికి టూ వీలర్ ఉందా?",en:["does your father have a two wheeler?"],hint:"Does + have: third person",topic:"be_there_have"},
  {te:"విజాగ్ కి ఎన్ని డొమెస్టిక్ ఎయిర్‌పోర్ట్స్ ఉన్నాయి?",en:["how many domestic airports does vizag have?"],hint:"How many + does + have?",topic:"be_there_have"},
  {te:"నేను ఇప్పుడు ఎయిర్‌పోర్ట్ దగ్గర ఉన్నాను.",en:["i am at the airport now."],hint:"Present BE: I am at + place",topic:"be_there_have"},
  {te:"నా చిన్నతనంలో విజాగ్ లో ఒక ఎయిర్‌పోర్ట్ ఉంది.",en:["there was an airport in vizag in my childhood."],hint:"Past there: There was",topic:"be_there_have"},
  {te:"నిన్న మీకు ఎన్ని గంటలకు ఇంటర్వ్యూ ఉంది?",en:["at what time did you have the interview yesterday?"],hint:"At what time + did + have?",topic:"be_there_have"},
  {te:"అతనికి మంచి సెన్స్ ఆఫ్ హ్యూమర్ ఉంది.",en:["he has a good sense of humour."],hint:"Has: third person present",topic:"be_there_have"},
  {te:"ఇక్కడ ఏదైనా సమస్య ఉందా?",en:["is there any problem now?"],hint:"Is there any + object?",topic:"be_there_have"},
  {te:"నిన్న మీ అపార్ట్‌మెంట్‌లో ఏదైనా సమస్య ఉందా?",en:["was there any issue in your apartment yesterday?"],hint:"Was there any + object?",topic:"be_there_have"},
  {te:"రేపు మనకు important మీటింగ్ ఉంది.",en:["we will have an important meeting tomorrow."],hint:"Will have: future",topic:"be_there_have"},
  {te:"ఇక్కడ దగ్గర్లో ఏదైనా పెట్రోల్ స్టేషన్ ఉందా?",en:["is there any petrol station nearby here?"],hint:"Is there any + object nearby?",topic:"be_there_have"},
  {te:"ఇక్కడ ఏ సమస్య లేదు.",en:["there is no problem here."],hint:"There is no + object",topic:"be_there_have"},
  {te:"నీకు నిన్న ఎందుక క్లాస్ లేదు?",en:["why didn't you have a class yesterday?"],hint:"Why didn't + have?",topic:"be_there_have"},
  {te:"రేపు మీరు ఎంత టైం వరకు డ్యూటీలో ఉంటారు?",en:["till what time will you be on duty tomorrow?"],hint:"Will be: future BE",topic:"be_there_have"},
  {te:"మీకు ధైర్యం ఉందా?",en:["do you have courage?"],hint:"Do + have: present",topic:"be_there_have"},
  {te:"అతనికి ఎంతమంది Siblings ఉన్నారు?",en:["how many siblings does he have?"],hint:"How many + does + have?",topic:"be_there_have"},
  {te:"మీ ఫ్యామిలీలో ఎంత మంది బ్రెడ్ విన్నర్స్ ఉన్నారు?",en:["how many breadwinners are there in your family?"],hint:"How many + are there + in?",topic:"be_there_have"},
  {te:"ఒకప్పుడు ఇక్కడ Lake ఉండేది.",en:["there was a lake here once."],hint:"Past there form",topic:"be_there_have"},
  {te:"Future లో ఇక్కడ బస్ స్టేషన్ ఉంటుంది.",en:["there will be a bus station here in the future."],hint:"Future there form",topic:"be_there_have"},
  {te:"నేనిప్పుడు మా ఫ్రెండ్స్ తో ఉన్నాను.",en:["i'm with my friends now.","i am with my friends now."],hint:"Present BE: I am with",topic:"be_there_have"},
  {te:"రేపు మీరు ఎన్ని గంటలకు ఇక్కడ ఉంటారు?",en:["at what time will you be here tomorrow?"],hint:"Will be: future BE",topic:"be_there_have"},
  {te:"మీ ఊర్లో నీటి కొరత ఉందా?",en:["is there any scarcity of water in your village?"],hint:"Is there any + object?",topic:"be_there_have"},
  {te:"ఒకప్పుడు మాకు వాటర్ ఫెసిలిటీ లేదు.",en:["we didn't have a water facility once."],hint:"Didn't have: past negative",topic:"be_there_have"},
  {te:"మాకు భవిష్యత్తులో హాస్పిటల్ ఉంటుంది.",en:["we will have a hospital in the future."],hint:"Will have: future",topic:"be_there_have"},
  {te:"ఇక్కడికి దగ్గర్లో ఏదైనా డ్రగ్ స్టోర్ ఉందా?",en:["is there any drug store nearby here?"],hint:"Is there any + object nearby?",topic:"be_there_have"},

  // ══ DAY 12: ACTION VERBS ══
  {te:"Buy యొక్క 5 రూపాలు చెప్పండి.",en:["buy buys bought bought buying"],hint:"Irregular: Buy → Bought",topic:"action_verbs"},
  {te:"Catch యొక్క 5 రూపాలు చెప్పండి.",en:["catch catches caught caught catching"],hint:"Irregular: Catch → Caught",topic:"action_verbs"},
  {te:"Drink యొక్క 5 రూపాలు చెప్పండి.",en:["drink drinks drank drunk drinking"],hint:"Irregular: Drink → Drank → Drunk",topic:"action_verbs"},
  {te:"Eat యొక్క 5 రూపాలు చెప్పండి.",en:["eat eats ate eaten eating"],hint:"Irregular: Eat → Ate → Eaten",topic:"action_verbs"},
  {te:"Fight యొక్క 5 రూపాలు చెప్పండి.",en:["fight fights fought fought fighting"],hint:"Irregular: Fight → Fought",topic:"action_verbs"},
  {te:"Go యొక్క 5 రూపాలు చెప్పండి.",en:["go goes went gone going"],hint:"Irregular: Go → Went → Gone",topic:"action_verbs"},
  {te:"Run యొక్క 5 రూపాలు చెప్పండి.",en:["run runs ran run running"],hint:"Irregular: Run → Ran → Run",topic:"action_verbs"},
  {te:"Sing యొక్క 5 రూపాలు చెప్పండి.",en:["sing sings sang sung singing"],hint:"Irregular: Sing → Sang → Sung",topic:"action_verbs"},
  {te:"Take యొక్క 5 రూపాలు చెప్పండి.",en:["take takes took taken taking"],hint:"Irregular: Take → Took → Taken",topic:"action_verbs"},
  {te:"Make యొక్క 5 రూపాలు చెప్పండి.",en:["make makes made made making"],hint:"Irregular: Make → Made",topic:"action_verbs"},
  {te:"Play యొక్క 5 రూపాలు చెప్పండి.",en:["play plays played played playing"],hint:"Regular: Play → Played",topic:"action_verbs"},
  {te:"Do యొక్క 5 రూపాలు చెప్పండి.",en:["do does did done doing"],hint:"Irregular: Do → Did → Done",topic:"action_verbs"},
  {te:"Cut యొక్క 5 రూపాలు చెప్పండి.",en:["cut cuts cut cut cutting"],hint:"Same form: Cut → Cut → Cut",topic:"action_verbs"},
  {te:"Laugh యొక్క 5 రూపాలు చెప్పండి.",en:["laugh laughs laughed laughed laughing"],hint:"Regular: Laugh → Laughed",topic:"action_verbs"},

  // ══ DAY 13: PAST SIMPLE A.V ══
  {te:"నేను నిన్న తొందరగా నిద్రలేచాను.",en:["i woke up early yesterday."],hint:"Irregular: Wake → Woke",topic:"past_av"},
  {te:"మీరు నిన్న ఎన్ని గంటలకు నిద్రలేచారు?",en:["at what time did you wake up yesterday?"],hint:"At what time + did + V1?",topic:"past_av"},
  {te:"మీరు నిన్న Yoga చేశారా?",en:["did you do yoga yesterday?"],hint:"Did + subject + V1?",topic:"past_av"},
  {te:"అతను నిన్న Exercise చేయలేదు.",en:["he didn't exercise yesterday."],hint:"Didn't + V1: negative past",topic:"past_av"},
  {te:"నిన్న అతను ఎందుకు Exercise చేయలేదు?",en:["why didn't he exercise yesterday?"],hint:"Why + didn't + subject + V1?",topic:"past_av"},
  {te:"నేను Last year ఆ కంపెనీలో Job చేశాను.",en:["i worked in that company last year."],hint:"Regular: Work → Worked",topic:"past_av"},
  {te:"మీరు Last year ఎక్కడ Job చేశారు?",en:["where did you work last year?"],hint:"Where + did + V1?",topic:"past_av"},
  {te:"నేను నిన్న ఒక Temple కి వెళ్ళాను.",en:["i went to a temple yesterday."],hint:"Irregular: Go → Went",topic:"past_av"},
  {te:"మీరు నిన్న ఎవరితో Temple కి వెళ్ళారు?",en:["with whom did you go to temple yesterday?"],hint:"With whom + did + go?",topic:"past_av"},
  {te:"మీరు నిన్న ఎన్ని Games ఆడారు?",en:["how many games did you play yesterday?"],hint:"How many + did + play?",topic:"past_av"},
  {te:"అతను నిన్న కబడ్డీ ఆడారు.",en:["he played kabaddi yesterday."],hint:"Regular: Play → Played",topic:"past_av"},
  {te:"నేను లాస్ట్ ఇయర్ Money Save చేశాను.",en:["i saved money last year."],hint:"Regular: Save → Saved",topic:"past_av"},
  {te:"అతను ఎంత Money Save చేశాడు?",en:["how much money did he save?"],hint:"How much + did + save?",topic:"past_av"},
  {te:"అతను నిన్న Money ఎందుకు ఖర్చు పెట్టలేదు?",en:["why didn't he spend money yesterday?"],hint:"Why + didn't + spend?",topic:"past_av"},
  {te:"మీరు నిన్న Newspaper చదివారా?",en:["did you read a newspaper yesterday?"],hint:"Did + read?",topic:"past_av"},
  {te:"మా నాన్నగారు నిన్న Newspaper చదవలేదు.",en:["my father didn't read the newspaper yesterday."],hint:"Didn't + read: negative",topic:"past_av"},
  {te:"ఆమె నిన్న English Newspaper కొన్నారు.",en:["she bought an english newspaper yesterday."],hint:"Irregular: Buy → Bought",topic:"past_av"},
  {te:"నేను Last year Indian army లో Join అయ్యాను.",en:["i joined the indian army last year."],hint:"Regular: Join → Joined",topic:"past_av"},
  {te:"నేను అతన్ని మర్చిపోయాను.",en:["i forgot about him."],hint:"Irregular: Forget → Forgot",topic:"past_av"},
  {te:"మీరు నన్ను ఎందుకు క్షమించలేదు?",en:["why didn't you forgive me?"],hint:"Why + didn't + forgive?",topic:"past_av"},
  {te:"మీరు గతవారం ఎక్కడకు వెళ్ళారు?",en:["where did you go last week?"],hint:"Where + did + go?",topic:"past_av"},
  {te:"మా నాన్నగారు 2000 లో ఒక బిజినెస్ Start చేసారు.",en:["my father started a business in 2000."],hint:"Regular: Start → Started",topic:"past_av"},
  {te:"అతను నిన్న ఒక Exam రాసాడు.",en:["he wrote an exam yesterday."],hint:"Irregular: Write → Wrote",topic:"past_av"},

  // ══ DAY 14: PRESENT SIMPLE A.V ══
  {te:"అతను ఎక్కడ Work చేస్తాడు?",en:["where does he work?"],hint:"Does + subject + V1? (third person)",topic:"present_av"},
  {te:"మీరు ఏం చేస్తుంటారు?",en:["what do you do?"],hint:"What + do + you + V1?",topic:"present_av"},
  {te:"అతను ఏం చేస్తుంటాడు?",en:["what does he do?"],hint:"What + does + subject + V1?",topic:"present_av"},
  {te:"అతను Telugu మాట్లాడతాడా?",en:["does he speak telugu?"],hint:"Does + subject + V1?",topic:"present_av"},
  {te:"వాళ్లు కష్టపడతారు.",en:["they work hard."],hint:"Present simple: They + V1",topic:"present_av"},
  {te:"వాళ్లు God ని నమ్ముతారు.",en:["they do not believe in god.","they don't believe in god."],hint:"Don't: negative present",topic:"present_av"},
  {te:"మీరు Smoke చేస్తారా?",en:["do you smoke?"],hint:"Do + you + V1?",topic:"present_av"},
  {te:"అతను రోజు ఎన్ని గంటలు Work చేస్తాడు?",en:["for how many hours does he work a day?"],hint:"For how many hours + does + V1?",topic:"present_av"},
  {te:"అతను ఎందుకు మీ మాటనడు?",en:["why doesn't he listen to you?"],hint:"Why + doesn't + subject + V1?",topic:"present_av"},
  {te:"నేను ప్రతి రోజు Yoga చేస్తాను.",en:["i do yoga every day."],hint:"Present simple: I + V1 + every day",topic:"present_av"},
  {te:"అతను Year కి ఒకసారి Tirupathi వెళ్తాడు.",en:["he goes to tirupati once in a year."],hint:"Goes: V1s for third person",topic:"present_av"},
  {te:"మీరు ఎన్ని రోజులకు ఒకసారి మీ Village వెళ్తారు?",en:["how often do you go to your village?"],hint:"How often + do + go?",topic:"present_av"},
  {te:"అతను ఎన్ని రోజులకు ఒకసారి అతని Village వెళ్తాడు?",en:["how often does he go to his village?"],hint:"How often + does + V1?",topic:"present_av"},
  {te:"మీరు Non-Veg ఎందుకు తినరు?",en:["why don't you eat non-veg?"],hint:"Why + don't + V1?",topic:"present_av"},
  {te:"అతను Non-Veg ఎందుకు తినడు?",en:["why doesn't he eat non-veg?"],hint:"Why + doesn't + V1?",topic:"present_av"},
  {te:"అతను అబద్దాలు చెబుతాడా?",en:["does he lie?"],hint:"Does + subject + V1?",topic:"present_av"},
  {te:"అతను Cricket ఆడడా?",en:["doesn't he play cricket?"],hint:"Doesn't + V1? (negative question)",topic:"present_av"},
  {te:"మీ Father రోజు ఎన్ని గంటలకు Office కి వెళ్తారు?",en:["at what time does your father go to the office every day?"],hint:"At what time + does + go?",topic:"present_av"},
  {te:"అతను Weekly Once Movies చూస్తాడు.",en:["he watches movies weekly once."],hint:"Watches: V1s for third person",topic:"present_av"},
  {te:"అతను ఎప్పుడూ తన Family ని బయటకు తీసుకుపెళ్ళడు.",en:["he never takes his family out."],hint:"Never + V1s: negative present",topic:"present_av"},
  {te:"మీరు ఏ రకమైన Movies చూస్తారు?",en:["what kind of movies do you watch?"],hint:"What kind of + do + V1?",topic:"present_av"},
  {te:"అతను ఏ రకమైన Movies లో Act చేస్తాడు?",en:["in what kind of movies does he act?"],hint:"Does + subject + V1?",topic:"present_av"},
  {te:"మీరు Lunch ఎన్ని గంటలకు చేస్తారు?",en:["at what time do you take your lunch?"],hint:"At what time + do + V1?",topic:"present_av"},
  {te:"మీరు Car Drive చేస్తారా?",en:["do you drive a car?"],hint:"Do + you + V1?",topic:"present_av"},
  {te:"రాముడు Songs పాడతాడా?",en:["does ramu sing songs?"],hint:"Does + name + V1?",topic:"present_av"},
  {te:"మీరు ఏ Subject బాగా చదువుతారు?",en:["which subject do you study well?"],hint:"Which + do + V1?",topic:"present_av"},
  {te:"అతను ఎన్ని రోజులకు ఒకసారి మిమ్మల్ని Meet అవుతాడు?",en:["how often does he meet you?"],hint:"How often + does + V1?",topic:"present_av"},
  {te:"అతను ఎక్కువగా Phone Use చేయడు.",en:["he doesn't use his phone much."],hint:"Doesn't + V1: third person negative",topic:"present_av"},
  {te:"అతను 9am కి ఆఫీస్ కి వెళ్తాడు.",en:["he goes to the office at 9am."],hint:"Goes: V1s + at + time",topic:"present_av"},
  {te:"వాళ్ళు క్రికెట్ బాగా ఆడతారా?",en:["do they play cricket well?"],hint:"Do + they + V1?",topic:"present_av"},

  // ══ DAY 15: FUTURE SIMPLE A.V ══
  {te:"నేను ఈ Class తర్వాత మిమ్మల్ని కలుస్తాను.",en:["i will meet you after this class."],hint:"Will + V1: future simple",topic:"future_av"},
  {te:"ఈ రోజు Evening అతనికి Call చేస్తాను.",en:["i will call him in the evening today."],hint:"Will + V1: future",topic:"future_av"},
  {te:"రేపు మీరు ఎక్కడకు వెళ్తారు?",en:["where will you go tomorrow?"],hint:"Where + will + V1?",topic:"future_av"},
  {te:"రేపు ఎవరు Class కి రారు?",en:["who won't come for the class tomorrow?"],hint:"Who + won't + V1?",topic:"future_av"},
  {te:"రేపు ఎవరెవరు Class కి వస్తారు?",en:["who all will attend the class tomorrow?"],hint:"Who all + will + V1?",topic:"future_av"},
  {te:"రేపు మీరు ఏదైనా Interview Face చేస్తారా?",en:["will you face any interview tomorrow?"],hint:"Will + subject + V1?",topic:"future_av"},
  {te:"Next week అతను విజాగ్ వస్తాడు.",en:["he will come to vizag next week."],hint:"Will + V1: future",topic:"future_av"},
  {te:"మీరు రేపు ఎన్ని గంటలకు నిద్ర లేస్తారు?",en:["at what time will you wake up tomorrow?"],hint:"At what time + will + V1?",topic:"future_av"},
  {te:"మీ Father రేపు Office కి వెళ్తారా?",en:["will your father go to the office tomorrow?"],hint:"Will + subject + V1?",topic:"future_av"},
  {te:"రేపు ఎవరు నిన్ను కలుస్తారు?",en:["who will meet you tomorrow?"],hint:"Who + will + V1?",topic:"future_av"},
  {te:"మీరు రేపు ఎవర్ని కలుస్తారు?",en:["whom will you meet tomorrow?"],hint:"Whom + will + meet?",topic:"future_av"},
  {te:"మీరు అతని Money ఎప్పుడు తిరిగి చెల్లిస్తారు?",en:["when will you repay his money?"],hint:"When + will + V1?",topic:"future_av"},
  {te:"మీరు Next week ఎక్కడికి వెళ్తారు?",en:["where will you go next week?"],hint:"Where + will + V1?",topic:"future_av"},
  {te:"మీరు రేపు Yoga చేస్తారా?",en:["will you do yoga tomorrow?"],hint:"Will + do + yoga?",topic:"future_av"},
  {te:"మీరు రేపు Yoga చేయరా?",en:["won't you do yoga tomorrow?"],hint:"Won't + V1? (negative question)",topic:"future_av"},
  {te:"ఈ రోజు నుండి నేను మీతో మాట్లాడను.",en:["i won't talk to you from today."],hint:"Won't + V1: future negative",topic:"future_av"},
  {te:"మీరు అతనితో ఎంత తరచుగా మాట్లాడుతూ ఉంటారు?",en:["how often do you talk to him?"],hint:"How often + do + V1? (present simple)",topic:"future_av"},
  {te:"నేను రేపటి నుండి Kabaddi Practice చేస్తాను.",en:["i will practice kabaddi from tomorrow onwards."],hint:"Will + V1 + from tomorrow",topic:"future_av"},
  {te:"అతను రోజు 2 గంటలు Kabaddi Practice చేస్తాడు.",en:["he practices kabaddi for 2 hours everyday."],hint:"V1s + for + duration",topic:"future_av"},
  {te:"నేను Future లో French నేర్చుకుంటాను.",en:["i will learn french in the future."],hint:"Will + V1 + in the future",topic:"future_av"},
  {te:"మీరు Hindi ఎక్కడ నేర్చుకున్నారు?",en:["where did you learn hindi?"],hint:"Past simple: Where + did + V1?",topic:"future_av"},
  {te:"అతను ఎన్ని Languages మాట్లాడతాడు?",en:["how many languages does he speak?"],hint:"How many + does + speak?",topic:"future_av"},
  {te:"మా Father రేపు Party కి రారు.",en:["my father won't come for the party tomorrow."],hint:"Won't + V1: future negative",topic:"future_av"},
  {te:"మీరు ఎందుకు నిన్న Party కి వెళ్ళలేదు?",en:["why didn't you go to the party yesterday?"],hint:"Why + didn't + V1?",topic:"future_av"},
  {te:"మా అమ్మగారు సాధారణంగా Social gatherings కి Attend అవ్వారు.",en:["my mother doesn't attend social gatherings."],hint:"Doesn't + V1: negative present",topic:"future_av"},
  {te:"మీరు నిన్న అతనికి Money ఇచ్చారా?",en:["did you lend money to him?"],hint:"Did + lend: past simple",topic:"future_av"},
];
// ─────────────────────────────────────────────────────────────
// TELUGU PHONETIC MAP (fallback when Google TTS unavailable)
// ─────────────────────────────────────────────────────────────
const TE_MAP={'అ':'a','ఆ':'aa','ఇ':'i','ఈ':'ee','ఉ':'u','ఊ':'oo','ఋ':'ru','ఎ':'e','ఏ':'ay','ఐ':'ai','ఒ':'o','ఓ':'oh','ఔ':'au','ా':'aa','ి':'i','ీ':'ee','ు':'u','ూ':'oo','ృ':'ru','ె':'e','ే':'ay','ై':'ai','ొ':'o','ో':'oh','ౌ':'au','ం':'m','ః':'h','ఁ':'n','క':'ka','ఖ':'kha','గ':'ga','ఘ':'gha','ఙ':'nga','చ':'cha','ఛ':'chha','జ':'ja','ఝ':'jha','ఞ':'nya','ట':'ta','ఠ':'tha','డ':'da','ఢ':'dha','ణ':'na','త':'tha','థ':'thha','ద':'dha','ధ':'dhha','న':'na','ప':'pa','ఫ':'pha','బ':'ba','భ':'bha','మ':'ma','య':'ya','ర':'ra','ల':'la','వ':'va','శ':'sha','ష':'sha','స':'sa','హ':'ha','ళ':'la','ఱ':'ra','్':'',' ':' ','.':'.',',':',','?':'?','!':'!'};
function tePhonetic(txt){
  let r='';const ch=[...txt];let i=0;
  while(i<ch.length){
    const two=i+1<ch.length?ch[i]+ch[i+1]:'';
    if(two&&TE_MAP[two]!==undefined){r+=TE_MAP[two];i+=2;continue;}
    r+=TE_MAP[ch[i]]!==undefined?TE_MAP[ch[i]]:ch[i].charCodeAt(0)>127?'':ch[i];
    i++;
  }
  return r.replace(/\s+/g,' ').trim();
}

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────
let shuffled=[], qIdx=0, correct=0, wrong=0;
let currentQ=null, curView='chat', callOn=false, isMuted=false, sessEnded=false;
let speaking=false, waitAns=false, procLock=false;
let silTimer=null, cdInt=null, cdLeft=0;
let lastSpeechTs=Date.now();
let ttsAudio=null;
let syllabus='all';
let pdfBanks=[];

// ─────────────────────────────────────────────────────────────
// SPEECH RECOGNITION
//
// KEY DESIGN:
//   continuous:true → Chrome asks permission ONCE per page load.
//   The session lives as long as the page is open.
//
//   Chrome has a ~60s silent-kill bug: after ~60s of no speech
//   it fires onend even on continuous sessions. We prevent this
//   with a 50s keepalive: a silent utterance every 50s keeps
//   the session alive without restarting (no new permission needed).
//
//   20s SILENCE RULE: if the user hasn't spoken for 20s while
//   we're listening, we show a "Reconnect Mic" button. The user
//   taps it once to resume — no permission prompt.
//
//   listeningGate: we only process results when the bot has
//   finished speaking and we want user input.
// ─────────────────────────────────────────────────────────────
let rec=null, recLive=false, recBlocked=false;
let listeningGate=false;
let keepaliveTimer=null;      // fires every 50s to prevent silent-kill
let silenceWatchTimer=null;   // fires after 20s of user silence → show reconnect

function initRec(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    addMsg('b','⚠️ Voice needs Chrome browser. You can still type answers below.');
    return;
  }
  buildRec();
}

function buildRec(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR) return;

  // Tear down any existing instance cleanly
  stopKeepalive();
  if(rec){ try{rec.abort();}catch(e){} rec=null; }
  recLive=false;

  const r=new SR();
  r.lang='en-US';
  r.continuous=true;        // ← ONE permission grant for the whole page session
  r.interimResults=true;
  r.maxAlternatives=1;
  rec=r;

  r.onstart=()=>{
    recLive=true;
    hideReconnect();
    startKeepalive();
  };

  r.onresult=e=>{
    lastSpeechTs=Date.now();
    resetSilenceWatch();    // user is speaking — reset 20s timer
    if(!listeningGate||procLock) return;
    let interim='', final='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(e.results[i].isFinal) final+=e.results[i][0].transcript;
      else interim+=e.results[i][0].transcript;
    }
    const disp=final||interim;
    if(disp){
      const tp=document.getElementById('tprev');
      if(tp){tp.textContent=`"${disp}"`;tp.className='tprev on';}
      if(curView==='call') document.getElementById('ctrans').textContent=`"${disp}"`;
      resetSilTimer();
    }
    if(final.trim()){
      listeningGate=false; procLock=true; clearSilTimer();
      const tp=document.getElementById('tprev'); if(tp)tp.className='tprev';
      if(curView==='call') document.getElementById('ctrans').textContent='';
      handleAnswer(final.trim());
    }
  };

  r.onerror=e=>{
    if(e.error==='not-allowed'||e.error==='service-not-allowed'){
      recBlocked=true;
      addMsg('b','⚠️ Mic access denied. Click the 🔒 lock icon in your address bar, allow microphone, then reload.');
      return;
    }
    if(e.error==='no-speech') return; // completely normal — just silence
    if(e.error==='aborted')  return; // we triggered it intentionally
    // network / audio-capture: will recover via onend → rebuild
  };

  r.onend=()=>{
    recLive=false;
    if(sessEnded||recBlocked){ stopKeepalive(); return; }
    if(keepaliveRestart){
      // Planned keepalive stop — restart the SAME object, no new permission
      keepaliveRestart=false;
      setTimeout(()=>{
        if(!sessEnded&&!recBlocked){
          try{ rec.start(); } catch(e){ buildRec(); }
        }
      }, 150);
    } else {
      // Chrome killed it unexpectedly — rebuild (reuses existing grant)
      stopKeepalive();
      setTimeout(()=>{ if(!sessEnded&&!recBlocked){ buildRec(); } }, 300);
    }
  };

  try{
    r.start();
  } catch(err){
    if(err.name!=='InvalidStateError') setTimeout(buildRec, 800);
  }
}

// ── 50s keepalive: prevents Chrome's ~60s silent-kill ──
// Calls rec.stop() to reset Chrome's internal timer.
// onend will fire, but we catch it with a flag so we restart
// the SAME object rather than building a new one.
let keepaliveRestart=false;   // signals onend this is a planned keepalive restart
function startKeepalive(){
  stopKeepalive();
  keepaliveTimer=setInterval(()=>{
    if(sessEnded||recBlocked||!recLive) return;
    keepaliveRestart=true;  // tell onend: don't rebuild, just restart
    try{ rec.stop(); } catch(e){ keepaliveRestart=false; }
  }, 50000);
}

function stopKeepalive(){
  if(keepaliveTimer){ clearInterval(keepaliveTimer); keepaliveTimer=null; }
}

// ── 20s silence watcher: shows reconnect button ──
function startSilenceWatch(){
  stopSilenceWatch();
  silenceWatchTimer=setTimeout(()=>{
    if(!listeningGate) return; // user already answered
    showReconnect();
  }, 20000);
}
function resetSilenceWatch(){
  if(!listeningGate) return;
  stopSilenceWatch();
  startSilenceWatch();
}
function stopSilenceWatch(){
  if(silenceWatchTimer){ clearTimeout(silenceWatchTimer); silenceWatchTimer=null; }
}

// ── Reconnect UI ──
function showReconnect(){
  let btn=document.getElementById('reconnectBtn');
  if(!btn){
    btn=document.createElement('button');
    btn.id='reconnectBtn';
    btn.style.cssText=`
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:linear-gradient(135deg,#ef4444,#dc2626);
      border:none;border-radius:22px;padding:10px 28px;
      color:#fff;font-size:.88rem;font-weight:700;
      cursor:pointer;font-family:'DM Sans',sans-serif;
      box-shadow:0 4px 18px rgba(239,68,68,.5);
      z-index:999;animation:pulse 1.5s ease infinite;
    `;
    btn.innerHTML='🎤 Tap to Reconnect Mic';
    btn.onclick=()=>{ hideReconnect(); reconnectMic(); };
    document.body.appendChild(btn);
    // add pulse animation if not already
    if(!document.getElementById('reconnectStyle')){
      const s=document.createElement('style');
      s.id='reconnectStyle';
      s.textContent='@keyframes pulse{0%,100%{box-shadow:0 4px 18px rgba(239,68,68,.5)}50%{box-shadow:0 4px 32px rgba(239,68,68,.9)}}';
      document.head.appendChild(s);
    }
  }
  btn.style.display='block';
}
function hideReconnect(){
  const btn=document.getElementById('reconnectBtn');
  if(btn) btn.style.display='none';
}
function reconnectMic(){
  if(recBlocked) return;
  buildRec();
  // Re-open mic after short delay for recognition to start
  setTimeout(()=>{
    if(listeningGate||waitAns) openMic();
  }, 600);
}

function openMic(){
  procLock=false;
  listeningGate=true;
  waitAns=true;
  lastSpeechTs=Date.now();
  hideReconnect();
  startSilenceWatch();
  updMicBtn(); setStat('ls'); startSilTimer();
}

function closeMic(){
  listeningGate=false;
  waitAns=false;
  stopSilenceWatch();
  clearSilTimer();
  hideReconnect();
  const tp=document.getElementById('tprev'); if(tp)tp.className='tprev';
  if(curView==='call') document.getElementById('ctrans').textContent='';
}

// ─────────────────────────────────────────────────────────────
// SILENCE TIMER (20s)
// ─────────────────────────────────────────────────────────────
const SIL_MS=20000, CD_CIRC=119.38;

function startSilTimer(){
  clearSilTimer();
  cdLeft=SIL_MS/1000;
  const w=document.getElementById('cdWrap'); if(w)w.style.display='block';
  updCD(cdLeft);
  cdInt=setInterval(()=>{cdLeft--;updCD(cdLeft);if(cdLeft<=0)clearInterval(cdInt);},1000);
  silTimer=setTimeout(()=>{
    if(!waitAns) return;
    waitAns=false; clearSilTimer();
    if(curView==='call') showFeed('⏱ No answer heard. Repeating...','err');
    setStat('sp');
    spkEn('No answer heard. Let me repeat.',()=>{
      procLock=false;
      speakQ(currentQ.te,()=>openMic());
    });
  },SIL_MS);
}
function clearSilTimer(){
  if(silTimer){clearTimeout(silTimer);silTimer=null;}
  if(cdInt){clearInterval(cdInt);cdInt=null;}
  const w=document.getElementById('cdWrap'); if(w)w.style.display='none';
}
function resetSilTimer(){clearSilTimer();startSilTimer();}
function updCD(s){
  const a=document.getElementById('cdArc'),n=document.getElementById('cdNum');
  if(!a||!n)return;
  a.style.strokeDashoffset=CD_CIRC*(1-s/20);
  const c=s<=5?'#ef4444':s<=10?'#f59e0b':'#f5c842';
  a.style.stroke=c; n.style.color=c; n.textContent=s;
}

// ─────────────────────────────────────────────────────────────
// SYLLABUS SELECTOR
// ─────────────────────────────────────────────────────────────
function setSyl(val){
  syllabus=val;
  document.querySelectorAll('.sylpill').forEach(p=>p.classList.toggle('on',p.dataset.syl===val));
  restartSession_soft();
}

// ─────────────────────────────────────────────────────────────
// PDF UPLOAD — multi-file, each gets its own bank + topic pill
// ─────────────────────────────────────────────────────────────
async function loadPDFs(input){
  const files=[...input.files];
  if(!files.length)return;
  for(const file of files){
    try{
      const ab=await file.arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:ab}).promise;
      let allLines=[];
      for(let p=1;p<=pdf.numPages;p++){
        const pg=await pdf.getPage(p);
        const ct=await pg.getTextContent();
        // Group text items by their Y position (rounded to nearest 2px)
        // This preserves actual line breaks rather than merging everything
        const lineMap={};
        for(const item of ct.items){
          if(!item.str||!item.str.trim()) continue;
          const y=Math.round(item.transform[5]/2)*2; // round Y to group same-line items
          if(!lineMap[y]) lineMap[y]=[];
          lineMap[y].push({x:item.transform[4], str:item.str});
        }
        // Sort by Y descending (PDF Y is bottom-up), then X ascending within each line
        const ys=Object.keys(lineMap).map(Number).sort((a,b)=>b-a);
        for(const y of ys){
          const items=lineMap[y].sort((a,b)=>a.x-b.x);
          const lineStr=items.map(i=>i.str).join(' ').trim();
          if(lineStr) allLines.push(lineStr);
        }
        allLines.push(''); // blank line between pages
      }
      const qs=parsePDF(allLines.join('\n'));
      if(qs.length===0){
        alert(`"${file.name}": No questions found.\n\nExpected format:\nQ: Telugu sentence\nA: English answer | alternate answer\nH: hint (optional)`);
        continue;
      }
      const topicKey='pdf_'+file.name.replace(/\.[^.]+$/,'').replace(/[^a-z0-9]/gi,'_').toLowerCase();
      pdfBanks=pdfBanks.filter(b=>b.name!==file.name);
      pdfBanks.push({name:file.name, topic:topicKey, questions:qs});
    } catch(e){
      alert(`Could not read "${file.name}". Make sure it has selectable (non-scanned) text.`);
      console.error(e);
    }
  }
  input.value='';
  renderPDFList();
  restartSession_soft();
}

function parsePDF(rawText){
  const qs=[];
  // Normalise: collapse multiple spaces, clean up
  const lines=rawText
    .replace(/\r\n/g,'\n').replace(/\r/g,'\n')
    .split('\n')
    .map(l=>l.replace(/\s+/g,' ').trim())
    .filter(l=>l.length>0);

  let cur=null;

  const saveCur=()=>{
    // Only save if we have both question and at least one answer
    if(cur&&cur.te&&cur.en.length>0){
      qs.push({...cur});
    }
    cur=null;
  };

  for(let i=0;i<lines.length;i++){
    let line=lines[i];

    // ── Q: label ──
    const qm=line.match(/^[Qq]\s*[:\.\)]\s*(.+)/);
    if(qm){
      saveCur(); // save previous question before starting new one
      cur={te:qm[1].trim(), en:[], hint:'', topic:'mixed'};
      continue;
    }

    // ── A: label ──
    const am=line.match(/^[Aa]\s*[:\.\)]\s*(.+)/);
    if(am&&cur){
      // Split answers by pipe, comma-space, or semicolon
      const answers=am[1].split(/\s*[\|;]\s*/)
        .map(a=>a.trim().toLowerCase())
        .filter(a=>a.length>0);
      cur.en.push(...answers);
      continue;
    }

    // ── H: label (optional hint) ──
    const hm=line.match(/^[Hh]\s*[:\.\)]\s*(.+)/);
    if(hm&&cur){ cur.hint=hm[1].trim(); continue; }

    // ── Inline format: "Telugu — English answer" ──
    // Only match if the Telugu part contains actual Telugu script
    const dash=line.match(/^(.+?)\s*[—–]\s*(.+)$/);
    if(dash&&/[\u0C00-\u0C7F]/.test(dash[1])&&dash[2].trim()){
      saveCur();
      const answers=dash[2].split(/\s*[\|;]\s*/).map(a=>a.trim().toLowerCase()).filter(Boolean);
      if(answers.length>0){
        qs.push({te:dash[1].trim(), en:answers, hint:'', topic:'mixed'});
      }
      continue;
    }

    // ── Numbered format: "1. Telugu sentence" followed by answer ──
    const numQ=line.match(/^\d+[\.\)]\s*(.+)/);
    if(numQ&&/[\u0C00-\u0C7F]/.test(numQ[1])){
      saveCur();
      cur={te:numQ[1].trim(), en:[], hint:'', topic:'mixed'};
      continue;
    }

    // ── If we have an open question with no answer yet, and line looks like English ──
    // treat it as an answer (handles PDFs without A: labels)
    if(cur&&cur.en.length===0&&line.length>2&&!/[\u0C00-\u0C7F]/.test(line)){
      const answers=line.split(/\s*[\|;]\s*/).map(a=>a.trim().toLowerCase()).filter(Boolean);
      if(answers.length>0) cur.en.push(...answers);
      continue;
    }
  }

  saveCur(); // save last question
  return qs;
}

function renderPDFList(){
  const list=document.getElementById('pdfList');
  if(!list)return;
  list.innerHTML='';
  if(pdfBanks.length===0)return;
  const header=document.createElement('div');
  header.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:3px';
  header.innerHTML=`<span style="font-size:.65rem;color:var(--mt)">${pdfBanks.length} PDF${pdfBanks.length>1?'s':''} loaded</span>
    <button class="pdf-clear-all" onclick="clearAllPDFs()">Clear All</button>`;
  list.appendChild(header);
  pdfBanks.forEach(b=>{
    const row=document.createElement('div');
    row.className='pdf-item';
    row.innerHTML=`<span class="pdf-item-name">📄 ${b.name}</span>
      <span class="pdf-item-count">${b.questions.length}Q</span>
      <span class="pdf-item-topic">${b.topic.replace('pdf_','').replace(/_/g,' ')}</span>
      <button class="pdf-item-del" onclick="removePDF('${b.name}')">✕</button>`;
    list.appendChild(row);
  });
  // Add topic pills for each PDF
  updatePDFPills();
}

function updatePDFPills(){
  // Remove old pdf pills
  document.querySelectorAll('.sylpill.pdf-syl').forEach(p=>p.remove());
  const sylbar=document.querySelector('.sylbar');
  pdfBanks.forEach(b=>{
    const p=document.createElement('button');
    p.className='sylpill pdf-syl'+(syllabus===b.topic?' on':'');
    p.dataset.syl=b.topic;
    p.textContent='📄 '+b.name.replace(/\.[^.]+$/,'').replace(/_/g,' ').substring(0,14);
    p.onclick=()=>setSyl(b.topic);
    sylbar.appendChild(p);
  });
}

function addPDFPill(name,topic,count){
  // Pills are handled by updatePDFPills in renderPDFList
}

function removePDF(name){
  pdfBanks=pdfBanks.filter(b=>b.name!==name);
  if(syllabus.startsWith('pdf_')&&!pdfBanks.find(b=>b.topic===syllabus)) syllabus='all';
  renderPDFList();
  restartSession_soft();
}

function clearAllPDFs(){
  pdfBanks=[];
  if(syllabus.startsWith('pdf_')) syllabus='all';
  document.querySelectorAll('.sylpill.pdf-syl').forEach(p=>p.remove());
  document.getElementById('pdfList').innerHTML='';
  restartSession_soft();
}

// ─────────────────────────────────────────────────────────────
// QUESTION BUILDER
// ─────────────────────────────────────────────────────────────
function buildPool(){
  let pool=[];
  // Built-in — filter by topic or include all
  const bi = syllabus==='all' ? BUILTIN :
    syllabus.startsWith('pdf_') ? [] :
    BUILTIN.filter(q=>q.topic===syllabus);
  pool=[...bi];
  // My custom questions
  const mq = syllabus==='all' ? MY_QUESTIONS :
    MY_QUESTIONS.filter(q=>!q.topic||q.topic===syllabus);
  pool=[...pool,...mq];
  // PDF banks
  for(const bank of pdfBanks){
    if(syllabus==='all'||syllabus===bank.topic) pool=[...pool,...bank.questions];
  }
  if(pool.length===0) pool=[...BUILTIN]; // safety fallback
  return pool.sort(()=>Math.random()-.5);
}

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
window.onload=async()=>{
  // Wait for TTS voices
  await new Promise(res=>{
    const v=window.speechSynthesis.getVoices();
    if(v.length>0){res();return;}
    window.speechSynthesis.onvoiceschanged=res;
    setTimeout(res,2000);
  });
  shuffled=buildPool();
  initRec();
  nextQ();
};

// ─────────────────────────────────────────────────────────────
// QUESTIONS
// ─────────────────────────────────────────────────────────────
function nextQ(){
  if(sessEnded) return;
  if(qIdx>=shuffled.length){qIdx=0;shuffled=buildPool();}
  currentQ=shuffled[qIdx++];
  procLock=false; waitAns=false; clearSilTimer();
  const n=correct+wrong+1;
  ['sqn','cqn','hqn'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=n;});
  const cq=document.getElementById('cqTe'); if(cq)cq.textContent=currentQ.te;
  showFeed('','');
  addMsg('b',`📝 ${currentQ.te}`);
  updScore();
  speakQ(currentQ.te,()=>openMic());
}

// ─────────────────────────────────────────────────────────────
// ANSWER CHECKER
// ─────────────────────────────────────────────────────────────
function norm(s){
  return s.toLowerCase()
    .replace(/[''`]/g,"'").replace(/[^a-z0-9\s']/g,'')
    .replace(/\bi'm\b/g,'i am').replace(/\bshe's\b/g,'she is').replace(/\bhe's\b/g,'he is')
    .replace(/\bthey're\b/g,'they are').replace(/\bwe're\b/g,'we are').replace(/\byou're\b/g,'you are')
    .replace(/\bit's\b/g,'it is').replace(/\bi'll\b/g,'i will').replace(/\bshe'll\b/g,'she will')
    .replace(/\bhe'll\b/g,'he will').replace(/\bthey'll\b/g,'they will').replace(/\bwe'll\b/g,'we will')
    .replace(/\bi've\b/g,'i have').replace(/\s+/g,' ').trim();
}
function checkAns(user,q){
  const u=norm(user);
  for(const a of q.en){
    if(u===norm(a)) return true;
    const su=u.replace(/^(the |a |an )/,'').replace(/( the| a| an)$/,'');
    const sa=norm(a).replace(/^(the |a |an )/,'').replace(/( the| a| an)$/,'');
    if(su===sa) return true;
  }
  return false;
}
function handleAnswer(ans){
  if(!currentQ||!ans.trim()) return;
  closeMic();
  const ok=checkAns(ans,currentQ);
  addMsg('u',ans);
  if(ok){
    correct++;
    addMsg('b',`✓ Correct! "${currentQ.en[0]}"`);
    showFeed(`✓ Correct!  "${currentQ.en[0]}"`, 'ok');
    setStat('sp');
    spkEn('Correct! Well done.',()=>setTimeout(nextQ,350));
  } else {
    wrong++;
    const best=currentQ.en[0], hint=currentQ.hint||'';
    addMsg('b',`✗ Not quite.\n✦ Correct: ${best}${hint?'\n💡 Tip: '+hint:''}`);
    showFeed(`✗  "${best}"${hint?' — 💡 '+hint:''}`, 'err');
    setStat('sp');
    spkEn(`Not quite. The answer is: ${best}.${hint?' Tip: '+hint:''}`,()=>setTimeout(nextQ,400));
  }
  updScore();
}
function updScore(){
  const total=correct+wrong, pct=total?Math.round(correct/total*100):0;
  document.getElementById('sco').textContent=correct;
  document.getElementById('swrong').textContent=wrong;
  document.getElementById('pbar').style.width=pct+'%';
  document.getElementById('spct').textContent=pct+'%';
}

// ─────────────────────────────────────────────────────────────
// SPEECH SYNTHESIS
// Telugu: Google Translate TTS via <audio> element (direct src,
//   no proxy/fetch needed — browsers allow audio playback from
//   cross-origin URLs without CORS restriction on <audio>).
//   Fallback: Web Speech API te-IN → phonetic en-IN.
// English feedback: Web Speech API en-US.
// ─────────────────────────────────────────────────────────────

let ttsController={id:0}; // increment to cancel ALL stale callbacks

function cancelAllSpeech(){
  ttsController.id++;           // any pending done() with old id → no-op
  window.speechSynthesis.cancel();
  if(ttsAudio){
    // Detach ALL event handlers before pausing
    // so no late-firing event can trigger a callback
    ttsAudio.onended=null;
    ttsAudio.onerror=null;
    ttsAudio.oncanplaythrough=null;
    ttsAudio.onloadeddata=null;
    const a=ttsAudio; ttsAudio=null;
    a.pause(); a.src='';
  }
}

function speakQ(txt, cb){
  if(isMuted){if(cb)cb();return;}
  closeMic();
  cancelAllSpeech();
  speaking=true; updWF(true); updMicBtn(); setStat('sp');

  const myId=ttsController.id;
  const done=()=>{
    if(ttsController.id!==myId) return;
    speaking=false; updWF(false);
    if(cb) cb();
  };

  const url=`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(txt)}&tl=te&client=tw-ob&ttsspeed=0.6`;
  const audio=new Audio();
  ttsAudio=audio;
  audio.volume=1.0;

  let settled=false;
  const settle=(fn)=>{
    if(settled) return; settled=true;
    audio.onended=null; audio.onerror=null;
    audio.pause(); audio.src='';
    if(ttsAudio===audio) ttsAudio=null;
    fn();
  };

  const wd=setTimeout(()=>{
    settle(()=>{ if(ttsController.id===myId) fallbackTelugu(txt,myId,done); });
  }, 8000);

  audio.onended=()=>{ clearTimeout(wd); settle(done); };
  audio.onerror=()=>{ clearTimeout(wd); settle(()=>{ if(ttsController.id===myId) fallbackTelugu(txt,myId,done); }); };

  audio.src=url;
  audio.load();
  const playPromise=audio.play();
  if(playPromise){
    playPromise.catch(()=>{
      clearTimeout(wd);
      settle(()=>{ if(ttsController.id===myId) fallbackTelugu(txt,myId,done); });
    });
  }
}

function fallbackTelugu(txt, myId, done){
  if(ttsController.id!==myId) return;
  const voices=window.speechSynthesis.getVoices();
  const teVoice=voices.find(v=>v.lang==='te-IN')||voices.find(v=>v.lang.startsWith('te'));
  if(teVoice){
    const u=new SpeechSynthesisUtterance(txt);
    u.voice=teVoice; u.lang='te-IN'; u.rate=0.75; u.pitch=1.0;
    let d=false;
    const fin=()=>{ if(d||ttsController.id!==myId)return; d=true; done(); };
    const wd=setTimeout(()=>{ window.speechSynthesis.cancel(); phoneticFallback(txt,myId,done); },10000);
    u.onend=()=>{ clearTimeout(wd); fin(); };
    u.onerror=()=>{ clearTimeout(wd); phoneticFallback(txt,myId,done); };
    window.speechSynthesis.speak(u);
    return;
  }
  phoneticFallback(txt, myId, done);
}

function phoneticFallback(txt, myId, done){
  if(ttsController.id!==myId) return;
  const phonetic=tePhonetic(txt).split(' ').filter(Boolean).join(',  ');
  const voices=window.speechSynthesis.getVoices();
  const v=voices.find(x=>x.lang==='en-IN')||voices.find(x=>x.lang.startsWith('en'))||voices[0];
  const u=new SpeechSynthesisUtterance(phonetic);
  if(v){u.voice=v;u.lang=v.lang;}else u.lang='en-US';
  u.rate=0.6; u.pitch=0.92;
  let d=false;
  const fin=()=>{ if(d||ttsController.id!==myId)return; d=true; done(); };
  const wd=setTimeout(()=>{ window.speechSynthesis.cancel(); fin(); },12000);
  u.onend=()=>{ clearTimeout(wd); fin(); };
  u.onerror=()=>{ clearTimeout(wd); fin(); };
  setTimeout(()=>window.speechSynthesis.speak(u), 80);
}

function spkEn(txt, cb){
  if(isMuted){if(cb)cb();return;}
  cancelAllSpeech();
  speaking=true; updWF(true); updMicBtn(); setStat('sp');
  const myId=ttsController.id;

  // English feedback: Web Speech ONLY — fast, no network, no overlap risk
  const voices=window.speechSynthesis.getVoices();
  const v=voices.find(x=>x.lang==='en-US')||voices.find(x=>x.lang==='en-IN')||voices.find(x=>x.lang.startsWith('en'))||voices[0];
  const u=new SpeechSynthesisUtterance(txt);
  if(v){u.voice=v; u.lang=v.lang;} else u.lang='en-US';
  u.rate=0.92; u.pitch=1.0; u.volume=1.0;

  let done=false;
  const finish=()=>{
    if(done||ttsController.id!==myId) return;
    done=true; speaking=false; updWF(false); if(cb)cb();
  };
  const wd=setTimeout(()=>{ window.speechSynthesis.cancel(); finish(); }, 12000);
  u.onend=()=>{ clearTimeout(wd); finish(); };
  u.onerror=()=>{ clearTimeout(wd); finish(); };
  // Small delay ensures cancelAllSpeech fully settles before speaking
  setTimeout(()=>{
    if(ttsController.id!==myId){ clearTimeout(wd); return; }
    window.speechSynthesis.speak(u);
  }, 120);
}
function doRepeat(){
  if(currentQ&&!speaking){ clearSilTimer(); speakQ(currentQ.te,()=>openMic()); }
}

// ─────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────
function setStat(s){
  const sd=document.getElementById('sdot'), sl=document.getElementById('slbl'), cs=document.getElementById('cstat');
  if(sd) sd.className='sdot '+(s==='sp'?'sp':s==='ls'?'ls':'idle');
  const m={idle:'Ready',sp:'🔊 Speaking...',ls:'🎤 Listening...'};
  if(sl) sl.textContent=m[s]||'Ready';
  if(cs){
    if(s==='ls') cs.textContent='● LISTENING — speak now';
    else if(s==='sp') cs.textContent='● SPEAKING';
    else cs.textContent='● READY';
  }
}
function updWF(on){ const w=document.getElementById('wf'); if(w)w.className=on?'wf':'wf p'; }
function updMicBtn(){
  const b=document.getElementById('micBtn'); if(!b)return;
  if(waitAns){b.className='micbtn rec';b.innerHTML='⏹<div class="rip"></div><div class="rip"></div>';}
  else{b.className='micbtn';b.innerHTML='🎤<div class="rip"></div><div class="rip"></div>';}
  b.disabled=speaking;
}
function showFeed(txt,type){
  const f=document.getElementById('cfeed'); if(!f)return;
  if(!txt){f.className='cfeed';f.textContent='';return;}
  f.textContent=txt; f.className='cfeed vis '+(type||'ok');
}
function toggleMic(){
  if(waitAns){closeMic();setStat('idle');updMicBtn();}
  else if(!speaking) openMic();
}

// ─────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────
function addMsg(role,text){
  const c=document.getElementById('msgs'); if(!c)return;
  const d=document.createElement('div'); d.className='msg '+(role==='b'?'b':'u');
  if(role==='b'){
    const av=document.createElement('div'); av.className='mav'; av.textContent='🎓';
    const bub=document.createElement('div'); bub.className='mb'; bub.innerHTML=fmtBot(text);
    d.appendChild(av); d.appendChild(bub);
  } else {
    const bub=document.createElement('div'); bub.className='mb'; bub.textContent=text; d.appendChild(bub);
  }
  c.appendChild(d); c.scrollTop=c.scrollHeight;
}
function fmtBot(text){
  return text.split('\n').map(l=>{
    if(!l.trim())return '';
    if(l.startsWith('📝'))return `<div style="font-size:.68rem;color:var(--mt);margin-bottom:3px">Translate to English:</div><div class="tl">${l.replace('📝','').trim()}</div>`;
    if(l.startsWith('✓'))return `<div class="cl">${l}</div>`;
    if(l.startsWith('✗'))return `<div class="wl">${l}</div>`;
    if(l.startsWith('✦'))return `<div class="hl" style="margin-top:3px">${l}</div>`;
    if(l.startsWith('💡'))return `<div style="color:var(--mt);font-size:.78rem;margin-top:3px">${l}</div>`;
    return `<div>${l}</div>`;
  }).join('');
}

// ─────────────────────────────────────────────────────────────
// TEXT INPUT
// ─────────────────────────────────────────────────────────────
function submitText(){
  const inp=document.getElementById('txtInp'), v=inp.value.trim();
  if(!v||speaking)return; inp.value='';
  if(v.toUpperCase()==='STOP'){endSession();return;}
  procLock=true; waitAns=false; clearSilTimer();
  handleAnswer(v);
}

// ─────────────────────────────────────────────────────────────
// VIEW SWITCHING
// ─────────────────────────────────────────────────────────────
function switchView(v){
  curView=v;
  document.getElementById('chatV').className=v==='chat'?'chatview':'chatview hidden';
  document.getElementById('callV').className=v==='call'?'callview vis':'callview';
  document.getElementById('chatTab').className=v==='chat'?'mtab on':'mtab';
  document.getElementById('callTab').className=v==='call'?'mtab on':'mtab';
  document.getElementById('app').className=v==='call'?'callmode':'';
  if(v==='call'){
    callOn=true;
    if(currentQ) document.getElementById('cqTe').textContent=currentQ.te;
    if(speaking) setStat('sp');
    else if(waitAns){setStat('ls');resetSilTimer();}
    else if(currentQ) speakQ(currentQ.te,()=>openMic());
  } else {
    callOn=false; clearSilTimer(); showFeed('','');
  }
}

function endCall(){
  callOn=false; clearSilTimer();
  cancelAllSpeech();
  speaking=false;
  switchView('chat');
}

function toggleMute(){
  isMuted=!isMuted;
  const b=document.getElementById('muteBtn');
  b.textContent=isMuted?'🔇':'🎙️'; b.className=isMuted?'ctrl mute on':'ctrl mute';
  if(isMuted){ cancelAllSpeech(); speaking=false; updWF(false); }
}

// ─────────────────────────────────────────────────────────────
// END SESSION + SUMMARY OVERLAY
// ─────────────────────────────────────────────────────────────
function endSession(){
  if(sessEnded)return;
  sessEnded=true; callOn=false;
  closeMic(); clearSilTimer();
  stopKeepalive(); stopSilenceWatch(); hideReconnect();
  cancelAllSpeech();
  speaking=false;
  recBlocked=false; recLive=false;
  try{if(rec){rec.abort(); rec=null;}}catch(e){}

  const total=correct+wrong, pct=total?Math.round(correct/total*100):0;
  const grade=pct>=80?'🏆 Excellent!':pct>=60?'👍 Good job!':pct>=40?'📈 Keep going!':'💪 Keep practicing!';

  const ov=document.createElement('div');
  ov.id='summaryOv';
  ov.style.cssText='position:absolute;inset:0;z-index:200;background:rgba(7,9,15,0.97);backdrop-filter:blur(14px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:28px 22px;border-radius:24px;animation:fin .4s ease;';
  ov.innerHTML=`
    <style>@keyframes fin{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}</style>
    <div style="font-size:2.8rem">🎓</div>
    <div style="font-family:'DM Serif Display',serif;font-size:1.5rem;color:#fff;text-align:center">Session Complete</div>
    <div style="font-size:1.2rem;color:var(--gold)">${grade}</div>
    <div style="display:flex;gap:22px">
      <div style="text-align:center"><div style="font-size:1.9rem;font-weight:700;color:var(--green)">${correct}</div><div style="font-size:.65rem;color:var(--mt);text-transform:uppercase;letter-spacing:1px">Correct</div></div>
      <div style="text-align:center"><div style="font-size:1.9rem;font-weight:700;color:var(--red)">${wrong}</div><div style="font-size:.65rem;color:var(--mt);text-transform:uppercase;letter-spacing:1px">Wrong</div></div>
      <div style="text-align:center"><div style="font-size:1.9rem;font-weight:700;color:var(--gold)">${pct}%</div><div style="font-size:.65rem;color:var(--mt);text-transform:uppercase;letter-spacing:1px">Score</div></div>
    </div>
    <div style="width:100%;height:5px;background:rgba(255,255,255,.06);border-radius:5px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#f5c842,#4ade80);border-radius:5px;transition:width 1s .2s ease"></div>
    </div>
    <div style="font-size:.75rem;color:var(--mt);text-align:center">Answered: ${total} questions</div>
    <button onclick="restartSession()" style="width:100%;padding:13px;background:linear-gradient(135deg,#f5c842,#f59e0b);border:none;border-radius:11px;font-size:.95rem;font-weight:700;color:#000;cursor:pointer;font-family:'DM Sans',sans-serif;">🔄 Start New Session</button>
    <button onclick="location.reload()" style="background:none;border:1px solid var(--bdr);border-radius:9px;padding:8px 18px;color:var(--mt);font-size:.78rem;cursor:pointer;font-family:'DM Sans',sans-serif;">↺ Reload App</button>
  `;
  document.getElementById('app').style.position='relative';
  document.getElementById('app').appendChild(ov);
  document.getElementById('chatV').className='chatview';
  document.getElementById('callV').className='callview';
  document.getElementById('chatTab').className='mtab on';
  document.getElementById('callTab').className='mtab';
  document.getElementById('app').className='';
  setTimeout(()=>spkEn(`Session complete. You scored ${pct} percent. ${grade.replace(/[🏆👍📈💪]/g,'')}`,null),400);
}

function restartSession(){
  const ov=document.getElementById('summaryOv'); if(ov)ov.remove();
  sessEnded=false; correct=0; wrong=0; qIdx=0;
  waitAns=false; listeningGate=false; procLock=false;
  speaking=false; isMuted=false;
  recBlocked=false; recLive=false;
  lastSpeechTs=Date.now();
  stopKeepalive(); stopSilenceWatch(); hideReconnect();
  updScore();
  document.getElementById('msgs').innerHTML='';
  document.getElementById('muteBtn').textContent='🎙️';
  document.getElementById('muteBtn').className='ctrl mute';
  setStat('idle'); updMicBtn();
  // Rebuild recognition fresh
  setTimeout(()=>{ buildRec(); shuffled=buildPool(); nextQ(); }, 300);
}

// ─────────────────────────────────────────────────────────────
// SOFT RESTART (syllabus/pdf change — keeps recognition running)
// ─────────────────────────────────────────────────────────────
function restartSession_soft(){
  correct=0; wrong=0; qIdx=0;
  closeMic(); clearSilTimer();
  updScore();
  document.getElementById('msgs').innerHTML='';
  shuffled=buildPool();
  cancelAllSpeech();
  speaking=false; updWF(false);
  setTimeout(nextQ, 300);
}
</script>
</body>
</html>
