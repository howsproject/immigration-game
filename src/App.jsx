import React, { useState, useEffect, useRef } from 'react';
import { Shield, Activity, Clock, X, Check, Zap, ChevronRight, AlertCircle, RotateCcw, Search, AlertTriangle } from 'lucide-react';

// --- Anime Character Component (Visuals) ---
const AnimeCivilServant = ({ mood }) => {
  const getExpression = () => {
    switch(mood) {
      case 'panic': return 'O_O';
      case 'angry': return '><';
      case 'dead': return '-_-';
      default: return '=_=';
    }
  };

  return (
    <div className="relative w-48 h-64 md:w-64 md:h-80 transition-all duration-300 pointer-events-none">
      {/* Body/Suit */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-slate-800 rounded-t-3xl shadow-lg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white skew-x-6 opacity-10"></div>
        <div 
          className="absolute top-10 left-1/2 -translate-x-1/2 w-6 h-32 bg-red-700"
          style={{ clipPath: 'polygon(50% 0%, 100% 85%, 50% 100%, 0% 85%)' }}
        ></div>
      </div>
      
      {/* Head */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-40 bg-[#f0d5be] rounded-2xl shadow-md border-b-4 border-black/10 z-10 flex flex-col items-center justify-center">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-36 h-20 bg-slate-900 rounded-t-full"></div>
        <div className="absolute top-0 -left-2 w-10 h-20 bg-slate-900 rotate-45 rounded-full"></div>
        <div className="absolute top-0 -right-2 w-10 h-20 bg-slate-900 -rotate-45 rounded-full"></div>
        <div className="flex gap-2 mt-4 relative z-20">
          <div className="w-10 h-8 border-2 border-slate-800 bg-white/30 rounded backdrop-blur-sm"></div>
          <div className="w-1 bg-slate-800 mt-4"></div>
          <div className="w-10 h-8 border-2 border-slate-800 bg-white/30 rounded backdrop-blur-sm"></div>
        </div>
        <div className="flex gap-8 -mt-6 z-10 font-bold text-slate-800 text-lg">
           {mood === 'panic' ? (
             <>
               <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
               <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
             </>
           ) : mood === 'angry' ? (
             <span className="tracking-widest font-mono text-xl">＞ ＜</span>
           ) : (
             <span className="tracking-widest font-mono text-xl">{getExpression() === '-_-' ? '— —' : '━ ━'}</span>
           )}
        </div>
        {mood === 'panic' && <div className="absolute top-4 right-2 text-blue-400 text-2xl animate-bounce">💧</div>}
        {mood === 'angry' && <div className="absolute top-2 right-4 text-red-500 text-2xl font-bold animate-pulse">💢</div>}
      </div>
    </div>
  );
};

// --- Slide to Action Button Component ---
const SlideButton = ({ onComplete, label }) => {
  const [dragX, setDragX] = useState(0);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const maxDrag = useRef(200); 

  useEffect(() => {
    if (containerRef.current) {
      maxDrag.current = containerRef.current.clientWidth - 50; 
    }
  }, []);

  const handleStart = (clientX) => {
    isDragging.current = true;
  };

  const handleMove = (clientX) => {
    if (!isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left - 25; 
    const clampedX = Math.max(0, Math.min(offsetX, maxDrag.current));
    setDragX(clampedX);
    
    if (clampedX >= maxDrag.current - 5) {
      isDragging.current = false;
      onComplete();
    }
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragX < maxDrag.current) {
      setDragX(0); 
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-14 bg-slate-700 rounded-full overflow-hidden shadow-inner select-none touch-none"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onMouseUp={handleEnd}
      onTouchEnd={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold animate-pulse pointer-events-none">
        {label} <ChevronRight className="ml-1" size={16} />
      </div>
      <div 
        className="absolute top-1 left-1 bottom-1 w-12 bg-white rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        style={{ transform: `translateX(${dragX}px)`, transition: isDragging.current ? 'none' : 'transform 0.3s' }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        <ChevronRight className="text-slate-800" />
      </div>
      <div 
        className="absolute top-0 left-0 bottom-0 bg-green-500 opacity-50 transition-all duration-0"
        style={{ width: `${dragX + 25}px` }}
      />
    </div>
  );
};

const Game = () => {
  const [phase, setPhase] = useState('menu');
  const [mode, setMode] = useState('6yr');
  const [citizens, setCitizens] = useState(Array(10).fill({ type: 'local', id: 'init' }));
  const [score, setScore] = useState(100);
  const [resources, setResources] = useState(100);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentApplicant, setCurrentApplicant] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [animState, setAnimState] = useState('normal');
  const [isResultInteractive, setIsResultInteractive] = useState(false);
  const [gameOverReason, setGameOverReason] = useState(null);

  const feedbackTimerRef = useRef(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [spiesIn, setSpiesIn] = useState(0);
  const [localsDisplaced, setLocalsDisplaced] = useState(0);

  // --- Dynamic Mood Logic ---
  const getDynamicMood = () => {
    if (animState !== 'normal') return animState;
    if (score <= 20) return 'dead'; 
    if (resources <= 20) return 'angry';
    if (score <= 50 || resources <= 50) return 'panic';
    return 'normal';
  };

  const handleRestart = () => {
    setPhase('menu');
    setFeedback(null);
    setGameOverReason(null);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
  };

  const startGame = (selectedMode) => {
    setMode(selectedMode);
    setPhase('game');
    setCitizens(Array(12).fill({ type: 'local', id: 'start' }));
    setScore(100);
    setResources(100);
    setTimeLeft(30);
    setProcessedCount(0);
    setSpiesIn(0);
    setLocalsDisplaced(0);
    setAnimState('normal');
    setFeedback(null);
    setGameOverReason(null);
    setIsResultInteractive(false);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    nextApplicant(selectedMode);
  };

  const nextApplicant = (currentMode) => {
    const rand = Math.random();
    let type = 'good';
    let visual = '👤';
    let clue = 'none';
    let isFlagged = false; 
    let descriptionText = ""; 

    const innocentFaces = ['🙂', '🧑', '👩', '🧔', '👱'];
    const randomFace = innocentFaces[Math.floor(Math.random() * innocentFaces.length)];

    if (currentMode === '6yr') {
      if (rand > 0.8) type = 'spy';
      else if (rand > 0.6) type = 'resource_heavy';
    } else {
      if (rand > 0.7) type = 'spy';
      else if (rand > 0.4) type = 'resource_heavy';
    }

    const goodTexts = [
      "資料顯示：文件齊全，有穩定工作",
      "資料顯示：文件齊全，良民證核發",
      "資料顯示：文件齊全，納稅紀錄良好"
    ];

    const spyHiddenTexts = [
      "資料顯示：文件齊全，無犯罪紀錄",
      "資料顯示：文件齊全，有穩定收入", 
      "資料顯示：文件齊全，資金證明充足"
    ];

    if (type === 'spy') {
      visual = randomFace; 
      if (currentMode === '6yr') {
        clue = 'obvious';
        isFlagged = true; 
        descriptionText = spyHiddenTexts[Math.floor(Math.random() * spyHiddenTexts.length)];
      } else {
        clue = 'hidden'; 
        isFlagged = false;
        descriptionText = spyHiddenTexts[Math.floor(Math.random() * spyHiddenTexts.length)];
      }
    } else if (type === 'resource_heavy') {
      visual = '🤒';
      descriptionText = "資料顯示：一入境就有重大醫療需求";
    } else {
      visual = randomFace;
      descriptionText = goodTexts[Math.floor(Math.random() * goodTexts.length)];
    }
    
    setCurrentApplicant({ type, visual, clue, isFlagged, description: descriptionText, id: Date.now() });
  };

  const handleDecision = (approve) => {
    if (!currentApplicant) return;

    let newFeedback = '';
    let anim = 'normal';
    
    let newScore = score;
    let newResources = resources;
    let newSpiesIn = spiesIn; 

    if (approve) {
      setCitizens(prev => {
        const newArr = [...prev];
        newArr.push({ type: currentApplicant.type, id: currentApplicant.id, visual: currentApplicant.visual });
        if (newArr.length > 12) {
          const removed = newArr.shift(); 
          if (removed.type === 'local') {
            setLocalsDisplaced(d => d + 1);
            newFeedback = '排擠效應！原本的國民被擠出去了！';
            anim = 'panic';
          }
        }
        return newArr;
      });

      if (currentApplicant.type === 'spy') {
        newScore -= 20;
        setSpiesIn(s => s + 1);
        newSpiesIn += 1;
        if (!newFeedback) newFeedback = '糟糕！放入了間諜！(隱藏風險)';
        anim = 'dead';
      } else if (currentApplicant.type === 'resource_heavy') {
        newResources -= 15;
        if (!newFeedback) newFeedback = '社福資源大幅消耗...';
        anim = 'angry';
      } else {
         if (newScore < 90) {
            newScore += 1;
         }
         newResources -= 2; 
      }
    } else {
      if (currentApplicant.type === 'good') {
        newScore -= 5;
      }
    }

    setScore(newScore);
    setResources(newResources);
    setFeedback(newFeedback);
    setAnimState(anim);
    setProcessedCount(p => p + 1);

    if (newScore <= 0) {
      if (newSpiesIn > 0) {
        setGameOverReason("國家安全崩潰：間諜滲透已達臨界點，政府失去控制能力。");
      } else {
        setGameOverReason("國家安全崩潰：過度排外導致國際孤立，國家信用破產。");
      }
      setPhase('result');
      setTimeout(() => setIsResultInteractive(true), 1000);
      return; 
    }
    if (newResources <= 0) {
      setGameOverReason("社福資源破產：醫療與財政體系徹底癱瘓，社會發生暴動。");
      setPhase('result');
      setTimeout(() => setIsResultInteractive(true), 1000);
      return; 
    }

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
      if (phase === 'game') setAnimState('normal');
    }, 2500);

    nextApplicant(mode);
  };

  useEffect(() => {
    if (phase === 'game' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && phase === 'game') {
      setPhase('result');
      setTimeout(() => setIsResultInteractive(true), 1000);
    }
  }, [timeLeft, phase]);

  const Classroom = () => {
    const isFull = citizens.length >= 12;
    return (
      <div className={`rounded-lg w-full min-h-[9rem] h-auto relative transition-all duration-300 shadow-inner bg-amber-100 shrink-0
        ${isFull ? 'border-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'border-4 border-amber-800'}`}>
        
        <div className="absolute top-0 left-2 text-xs font-bold px-2 rounded-b bg-amber-200 text-amber-900 z-10">
          社會資源池 (班級教室)
        </div>
        {isFull && (
          <div className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse z-10 flex items-center gap-1 shadow-sm">
            <AlertCircle size={10} /> 滿載！
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mt-auto pt-6 content-end items-end relative z-0">
          {citizens.map((c, i) => (
            <div key={i} className={`text-2xl transition-all duration-300 animate-in zoom-in
              ${c.type === 'spy' ? 'grayscale-0' : ''}
            `}>
              {c.type === 'local' ? '👶' : c.visual}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ResultScreen = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 animate-in fade-in overflow-y-auto">
      <div className="shrink-0 mb-4">
        <AnimeCivilServant mood={gameOverReason ? 'dead' : (score <= 50 || localsDisplaced > 3 ? 'dead' : 'normal')} />
      </div>
      
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full border-4 border-slate-800 flex flex-col shrink-0">
        <div className={`text-white p-3 font-bold text-lg text-center shrink-0 ${gameOverReason ? 'bg-red-800' : 'bg-slate-800'}`}>
          {gameOverReason ? "⚠️ 任務失敗：緊急終止 ⚠️" : `審查報告 (${mode === '6yr' ? '6年制' : '4年制'})`}
        </div>
        
        <div className="p-4 space-y-3">
          {gameOverReason && (
            <div className="bg-red-100 border-2 border-red-500 p-4 rounded text-red-900 font-bold flex gap-3 items-center animate-pulse">
               <AlertTriangle size={32} className="shrink-0" />
               <div className="text-sm">{gameOverReason}</div>
            </div>
          )}

          <div className="flex justify-between items-center border-b pb-1">
            <span className="text-sm">🛡️ 國家安全</span>
            <span className={`font-bold ${score <= 0 ? 'text-red-600' : score < 60 ? 'text-orange-600' : 'text-green-600'}`}>
              {Math.max(0, score)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-1">
            <span className="text-sm">🕵️ 混入間諜</span>
            <span className="font-bold text-red-600">{spiesIn} 人</span>
          </div>
          <div className="flex justify-between items-center border-b pb-1">
            <span className="text-sm">📉 國民被排擠</span>
            <span className="font-bold text-orange-600">{localsDisplaced} 人</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded mt-2 animate-in slide-in-from-right">
            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1">
              <Search size={14} /> 🔍 關鍵字解密 (間諜是怎麼偽裝的？)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] leading-tight">
              <div className="p-2 bg-green-100 rounded border border-green-200">
                <div className="font-bold text-green-800 mb-1">✅ 好公民特徵</div>
                <ul className="list-disc pl-3 text-green-700 space-y-1">
                  <li>有穩定工作</li>
                  <li>納稅紀錄良好</li>
                  <li>良民證核發</li>
                </ul>
              </div>
              <div className="p-2 bg-red-100 rounded border border-red-200">
                <div className="font-bold text-red-800 mb-1">❌ 間諜偽裝術</div>
                <ul className="list-disc pl-3 text-red-700 space-y-1">
                  <li>無犯罪紀錄 (空泛)</li>
                  <li>有穩定收入 (來源?)</li>
                  <li>資金證明充足 (買通?)</li>
                </ul>
              </div>
            </div>
            <p className="mt-2 text-slate-600 text-[10px] italic">
              {mode === '6yr' 
                ? "* 6年制因為有時間深度調查，系統會直接幫你標示出異常，讓你不用單靠文字分辨真偽。" 
                : "* 4年制因為時間壓力，你必須在這些極為相似的文字中自行分辨，極易出錯。"}
            </p>
          </div>

          <div className="bg-slate-100 p-3 rounded text-sm leading-relaxed text-slate-700 mt-2">
            <strong>注意到了嗎？</strong><br/>
            {gameOverReason ? 
               "這就是底線。國家安全與社會資源一旦崩潰，就沒有重來的機會了。這就是為什麼審查制度需要如此謹慎的原因。" :
               (mode === '4yr' ? (
                 spiesIn > 0 ? "門戶洞開！好人跟壞人的資料寫得太像了，時間這麼趕根本分不出來！" :
                 localsDisplaced > 2 ? "為了求快，結果把原本的國民都擠出去了（鳩佔鵲巢）。" :
                 "運氣好守住了，但這種高風險賭博，現實中玩不起。"
              ) : (
                 "雖然慢，但因為時間充裕，系統能查出偽裝成好人的間諜（看到那些紅色標記了嗎？）。這就是「時間」帶來的安全感。"
              ))
            }
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          {isResultInteractive ? (
            <SlideButton label="滑動來重新開始" onComplete={() => setPhase('menu')} />
          ) : (
             <div className="w-full h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 font-bold">
               {gameOverReason ? "系統崩潰重啟中..." : "系統結算中..."}
             </div>
          )}
        </div>
      </div>
    </div>
  );

  const IntroScreen = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center overflow-y-auto">
      <div className="shrink-0 mb-6">
        <AnimeCivilServant mood="normal" />
      </div>
      <div className="bg-white p-5 rounded-xl border-b-4 border-r-4 border-slate-800 text-left max-w-md shadow-xl shrink-0">
        <h1 className="text-2xl font-black mb-2 text-slate-900">移民官：守護家園</h1>
        <p className="text-slate-600 mb-4 text-sm">
          我是資深移民官。現在有兩個選擇，決定台灣的未來：
        </p>
        <div className="grid gap-3">
          <button onClick={() => startGame('6yr')} className="p-3 bg-blue-100 border-2 border-blue-800 rounded-lg flex items-center gap-3 active:scale-95 transition-transform text-left">
            <div className="bg-blue-600 text-white p-2 rounded"><Clock size={20}/></div>
            <div>
              <div className="font-bold text-blue-900">現行 6 年制</div>
              <div className="text-xs text-blue-700">有充裕時間進行深度調查，能揭穿間諜的偽裝。</div>
            </div>
          </button>
          
          <button onClick={() => startGame('4yr')} className="p-3 bg-red-100 border-2 border-red-800 rounded-lg flex items-center gap-3 active:scale-95 transition-transform text-left">
            <div className="bg-red-600 text-white p-2 rounded"><Zap size={20}/></div>
            <div>
              <div className="font-bold text-red-900">挑戰 4 年制</div>
              <div className="text-xs text-red-700">時間減半！調查來不及完成！文字陷阱極多！</div>
            </div>
          </button>
        </div>
        
        {/* Author Signature */}
        <div className="mt-6 text-center">
           <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase border-t border-slate-200 pt-2 inline-block">
             How's Safety Homeland Project
           </div>
        </div>
      </div>
    </div>
  );

  const GameScreen = () => (
    <div className="flex flex-col h-full max-w-lg mx-auto relative">
      <div className="sticky top-0 left-0 right-0 flex justify-between items-center bg-slate-800 text-white p-3 rounded-b-xl shadow-lg z-30 shrink-0">
        <button 
          onClick={handleRestart}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-slate-700 rounded-full hover:bg-slate-600 active:scale-95 transition-all text-xs flex items-center gap-1 z-40 border border-slate-500"
          title="重新開始"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">重置</span>
        </button>

        <div className="flex flex-col items-center w-1/3 pl-8">
           <span className="text-[10px] text-slate-400">國家安全</span>
           <div className="flex items-center gap-1">
             <Shield size={14} className={score <= 20 ? 'text-red-500 animate-pulse' : 'text-blue-400'} />
             <span className={`font-mono font-bold text-sm ${score <= 50 ? 'text-red-400' : ''}`}>{score}</span>
           </div>
        </div>
        <div className="flex flex-col items-center w-1/3 border-x border-slate-600">
           <span className="text-[10px] text-slate-400">剩餘時間</span>
           <span className="font-mono text-xl font-bold text-yellow-400">{timeLeft}s</span>
        </div>
        <div className="flex flex-col items-center w-1/3">
           <span className="text-[10px] text-slate-400">社福資源</span>
           <div className="flex items-center gap-1">
             <Activity size={14} className={resources <= 20 ? 'text-red-500 animate-pulse' : 'text-green-400'} />
             <span className="font-mono font-bold text-sm">{resources}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center overflow-y-auto relative w-full">
        
        <div className="w-full h-48 relative shrink-0 mb-4 flex justify-center items-start">
             <div className="absolute top-0 opacity-90 scale-90 origin-top z-0">
                <AnimeCivilServant mood={getDynamicMood()} />
             </div>
        </div>

        {feedback && (
          <div className="absolute top-20 w-full text-center z-50 pointer-events-none px-4">
             <span className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold shadow-xl animate-bounce inline-block border-2 border-white text-base">
              {feedback}
             </span>
          </div>
        )}

        <div className="w-full mb-4 z-10 shrink-0">
          <Classroom />
        </div>

        <div className="w-full mt-auto bg-white rounded-xl shadow-2xl p-4 border-2 border-slate-200 z-20 flex flex-col items-center transition-all animate-in slide-in-from-bottom duration-300 shrink-0 relative">
          
          {/* Avatar Container */}
          <div className="relative">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-5xl mb-2 border-4 border-slate-300 shrink-0">
                {currentApplicant?.visual}
             </div>
             {/* 6-YEAR MODE: RISK INDICATOR */}
             {currentApplicant?.isFlagged && (
               <div className="absolute -top-2 -right-4 bg-red-600 text-white font-bold text-xs px-2 py-1 rounded shadow-lg animate-pulse border-2 border-white flex items-center gap-1">
                 <Search size={12} /> 異常示警
               </div>
             )}
          </div>
          
          <div className="w-full space-y-1 mb-4 text-center shrink-0">
            <h3 className="font-bold text-lg text-slate-800">入境申請人</h3>
            {/* Text Logic: Uniform Deception */}
            <p className={`text-xs bg-slate-100 py-1 rounded px-2 min-h-[2.5em] flex items-center justify-center
              ${mode === '4yr' ? 'font-serif tracking-wide text-slate-700' : 'text-slate-500'}
            `}>
              {currentApplicant?.description}
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <button 
              onClick={() => handleDecision(false)}
              className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center hover:bg-red-200 transition-colors border-b-4 border-red-700 active:border-b-0 active:translate-y-1 active:bg-red-300 min-h-[60px]"
            >
              <X size={20} className="mb-1" />
              拒絕申請
            </button>
            <button 
              onClick={() => handleDecision(true)}
              className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center hover:bg-green-200 transition-colors border-b-4 border-green-700 active:border-b-0 active:translate-y-1 active:bg-green-300 min-h-[60px]"
            >
              <Check size={20} className="mb-1" />
              發身分證
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-slate-300 font-sans select-none overflow-hidden">
      <div className="max-w-md mx-auto h-full bg-slate-50 shadow-2xl relative flex flex-col">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        {phase === 'menu' && <IntroScreen />}
        {phase === 'game' && <GameScreen />}
        {phase === 'result' && <ResultScreen />}
      </div>
    </div>
  );
};

export default Game;