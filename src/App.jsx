import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RefreshCcw, Zap, Crosshair, Sparkles, Share2, Download, ScanLine, Fingerprint, Activity, Binary } from 'lucide-react';
import html2canvas from 'html2canvas';

// --- 0. 全域樣式 ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Zen+Kaku+Gothic+New:wght@400;700;900&display=swap');
    
    body { background-color: #050505; color: #fff; overflow-x: hidden; }
    .font-jp { font-family: 'Zen Kaku Gothic New', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    .vertical-text { writing-mode: vertical-rl; text-orientation: upright; letter-spacing: 0.2em; }
    
    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
    }
    
    .scanlines {
      background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
      background-size: 100% 4px; 
    }

    .bg-stripe-contrast {
      background: repeating-linear-gradient(45deg, #1a0b2e, #1a0b2e 10px, #2d124d 10px, #2d124d 20px);
    }

    /* 跑馬燈動畫 */
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      display: flex;
      white-space: nowrap;
      animation: marquee 10s linear infinite;
    }
  `}</style>
);

// --- 1. 資料結構 ---

const designers = [
  {
    id: 'luju',
    name: 'Lu Ju',
    jpName: 'ル・ジュ',
    typeCode: 'TYPE-01',
    title: 'The Structured Planner',
    description: '邏輯清晰、條理分明。你的世界裡沒有模糊地帶，只有完美的 Grid 和整理好的 Excel。',
    answers: ['C', 'B', 'B', 'A', 'D', 'B', 'A', 'B', 'B', 'C'],
    color: 'text-[#CCFF00]', borderColor: 'border-[#CCFF00]', bg: 'bg-[#CCFF00]', radarColor: '#CCFF00',
    stats: { logic: 100, speed: 60, aesthetic: 70, sanity: 90, social: 40 },
    luckyItem: '機械鍵盤', partner: 'Erin',
    imageSrc: '/luju.png'
  },
  {
    id: 'phoebe',
    name: 'Phoebe',
    jpName: 'フィービー',
    typeCode: 'TYPE-02',
    title: 'The Aesthetic Soul',
    description: '重視感覺與視覺。你是團隊的調色盤，用溫暖與直覺來與世界溝通。',
    answers: ['C', 'C', 'A', 'A', 'C', 'A', 'B', 'A', 'B', 'C'],
    color: 'text-[#FF0099]', borderColor: 'border-[#FF0099]', bg: 'bg-[#FF0099]', radarColor: '#FF0099',
    stats: { logic: 40, speed: 70, aesthetic: 100, sanity: 60, social: 90 },
    luckyItem: '香氛蠟燭', partner: 'Lu Ju',
    imageSrc: '/phoebe.jpg'
  },
  {
    id: 'erin',
    name: 'Erin',
    jpName: 'エリン',
    typeCode: 'TYPE-03',
    title: 'The Free Spirit',
    description: '隨遇而安、靈感跳躍。你不受規則拘束，總能從意想不到的角度解決問題。',
    answers: ['C', 'C', 'A', 'A', 'A', 'D', 'C', 'B', 'B', 'C'],
    color: 'text-[#00FFFF]', borderColor: 'border-[#00FFFF]', bg: 'bg-[#00FFFF]', radarColor: '#00FFFF',
    stats: { logic: 50, speed: 100, aesthetic: 80, sanity: 30, social: 80 },
    luckyItem: '冰美式', partner: 'Phoebe',
    imageSrc: '/erin.png'
  }
];

const questions = [
  { id: 1, q: "下載夾 (Downloads) 的狀態？", options: [{ label: "A. 無菌室 (立刻歸檔)", val: 'A' }, { label: "B. 考古現場 (依日期排)", val: 'B' }, { label: "C. 黑洞 (全混在一起)", val: 'C' }, { label: "D. 暫存區 (桌面是戰場)", val: 'D' }] },
  { id: 2, q: "瀏覽器分頁 (Tabs) 習慣？", options: [{ label: "A. 極簡 (維持5個內)", val: 'A' }, { label: "B. 管理派 (群組折疊)", val: 'B' }, { label: "C. 無限列車 (無標題)", val: 'C' }, { label: "D. 新視窗 (直接開新)", val: 'D' }] },
  { id: 3, q: "收到工作訊息時的反應？", options: [{ label: "A. 秒回表情包", val: 'A' }, { label: "B. 句點王 (收到、OK)", val: 'B' }, { label: "C. 小作文 (詳細回覆)", val: 'C' }, { label: "D. 潛水夫 (意念回覆)", val: 'D' }] },
  { id: 4, q: "早上進公司的第一件事？", options: [{ label: "A. 儀式感 (泡咖啡)", val: 'A' }, { label: "B. 社牛 (先聊天)", val: 'B' }, { label: "C. 進入戰鬥 (開軟體)", val: 'C' }, { label: "D. 還沒醒 (靈魂在路上)", val: 'D' }] },
  { id: 5, q: "戴上耳機都聽什麼？", options: [{ label: "A. Lo-Fi / 純音樂", val: 'A' }, { label: "B. 搖滾 / 重金屬", val: 'B' }, { label: "C. Podcast / 訪談", val: 'C' }, { label: "D. 沒播聲音 (假裝)", val: 'D' }] },
  { id: 6, q: "購買 3C 或設計用品風格？", options: [{ label: "A. 外貌協會 (好看)", val: 'A' }, { label: "B. CP值 (比價三天)", val: 'B' }, { label: "C. 信仰充值 (品牌全家)", val: 'C' }, { label: "D. 衝動購物 (已下單)", val: 'D' }] },
  { id: 7, q: "公司員旅或自由行風格？", options: [{ label: "A. Excel大師 (按分計)", val: 'A' }, { label: "B. 大略方向 (看心情)", val: 'B' }, { label: "C. 跟屁蟲 (跟著走)", val: 'C' }, { label: "D. 飯店地縛靈 (不出)", val: 'D' }] },
  { id: 8, q: "軟體更新通知跳出來時？", options: [{ label: "A. 立刻更新 (強迫症)", val: 'A' }, { label: "B. 拖延戰術 (明天再說)", val: 'B' }, { label: "C. 保守派 (怕新版Bug)", val: 'C' }, { label: "D. 釘子戶 (死都不按)", val: 'D' }] },
  { id: 9, q: "衣櫃裡最多的顏色？", options: [{ label: "A. 全黑 (Black)", val: 'A' }, { label: "B. 大地色 (Uniqlo)", val: 'B' }, { label: "C. 多巴胺 (Colorful)", val: 'C' }, { label: "D. 灰/白 (Minimal)", val: 'D' }] },
  { id: 10, q: "App icon 有紅色通知點？", options: [{ label: "A. 清零 (不能忍受)", val: 'A' }, { label: "B. 佛系 (隨緣點開)", val: 'B' }, { label: "C. 選擇性無視", val: 'C' }, { label: "D. 全部關閉通知", val: 'D' }] },
];

// --- 2. 輔助元件 ---

const AcidButton = ({ children, onClick, className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative px-8 py-4 bg-transparent border border-white text-white font-mono font-bold tracking-widest uppercase 
    hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] hover:shadow-[4px_4px_0px_0px_#fff] transition-all duration-200 ${className}`}
  >
    {children}
  </motion.button>
);

const RadarChart = ({ stats, color }) => {
  const points = [
    [50, 50 - (stats.logic * 0.4)], 
    [50 + (stats.speed * 0.38), 50 - (stats.speed * 0.12)], 
    [50 + (stats.aesthetic * 0.23), 50 + (stats.aesthetic * 0.32)], 
    [50 - (stats.sanity * 0.23), 50 + (stats.sanity * 0.32)], 
    [50 - (stats.social * 0.38), 50 - (stats.social * 0.12)], 
  ].map(p => p.join(',')).join(' ');

  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#333" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="#333" strokeWidth="0.5" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="#333" strokeWidth="0.5" />
        <motion.polygon 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
          points={points} 
          fill={color + '33'} stroke={color} strokeWidth="1.5"
          className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
        />
        {points.split(' ').map((p, i) => <circle key={i} cx={p.split(',')[0]} cy={p.split(',')[1]} r="1.5" fill="#fff" />)}
      </svg>
      <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 font-mono bg-black px-1">LOGIC</span>
      <span className="absolute top-[30%] right-[-10px] text-[9px] text-gray-500 font-mono bg-black px-1">SPD</span>
      <span className="absolute bottom-[10%] right-0 text-[9px] text-gray-500 font-mono bg-black px-1">ART</span>
      <span className="absolute bottom-[10%] left-0 text-[9px] text-gray-500 font-mono bg-black px-1">SAN</span>
      <span className="absolute top-[30%] left-[-10px] text-[9px] text-gray-500 font-mono bg-black px-1">SOC</span>
    </div>
  );
};

// 裝飾性條碼
const Barcode = ({ className }) => (
  <div className={`flex items-end h-8 gap-[2px] opacity-70 ${className}`}>
    {[...Array(20)].map((_, i) => (
      <div key={i} className="bg-white" style={{ width: Math.random() > 0.5 ? '2px' : '4px', height: Math.random() * 100 + '%' }}></div>
    ))}
  </div>
);

// 跑馬燈元件
const Marquee = ({ text }) => (
  <div className="overflow-hidden border-y border-white/20 bg-black/50 py-1 mb-4 select-none">
    <div className="animate-marquee flex gap-8">
      {[...Array(4)].map((_, i) => (
        <span key={i} className="text-[#CCFF00] font-mono text-xs tracking-[0.2em]">{text}</span>
      ))}
    </div>
  </div>
);

// --- 3. 新的 Loading 動畫 (Fancy Terminal) ---
const FancyLoader = () => {
  const [log, setLog] = useState([]);
  const logs = [
    "> INITIALIZING KERNEL...", "> LOADING ASSETS...", "> DECRYPTING NEURAL PATTERNS...", 
    "> SYNCING WITH DATABASE...", "> ERROR: REALITY_DISTORTION DETECTED", "> RECALIBRATING...", 
    "> TARGET LOCKED.", "> GENERATING REPORT..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setLog(prev => [...prev.slice(-4), logs[i]]); // Keep last 5 logs
        i++;
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="flex flex-col items-center justify-center w-full max-w-md p-6 border-2 border-[#00FFFF] bg-black/80 backdrop-blur relative">
      <div className="absolute top-2 left-2 flex gap-1"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/></div>
      <Binary size={48} className="text-[#00FFFF] mb-4 animate-pulse" />
      
      <div className="w-full font-mono text-xs text-[#00FFFF] h-32 overflow-hidden mb-4 border-b border-[#00FFFF]/30 pb-2">
        {log.map((l, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-1">
            {l}
          </motion.div>
        ))}
      </div>
      
      <div className="w-full h-1 bg-[#333] overflow-hidden">
        <motion.div 
          className="h-full bg-[#CCFF00]" 
          initial={{ width: 0 }} 
          animate={{ width: "100%" }} 
          transition={{ duration: 2.5, ease: "easeInOut" }} 
        />
      </div>
      <div className="flex justify-between w-full mt-1">
         <span className="text-[10px] text-gray-500 font-mono">CPU: 98%</span>
         <span className="text-[10px] text-gray-500 font-mono">RAM: 402MB</span>
      </div>
    </motion.div>
  );
};

// --- 4. 主程式 ---

export default function App() {
  const [step, setStep] = useState('landing');
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [matchedDesigner, setMatchedDesigner] = useState(null);
  const [oppositeDesigner, setOppositeDesigner] = useState(null);
  const resultRef = useRef(null);

  const handleAnswer = (val) => {
    const newAnswers = [...userAnswers, val];
    setUserAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 150);
    } else {
      setTimeout(() => {
        let bestMatch = null, worstMatch = null, maxScore = -1, minScore = Infinity;
        designers.forEach(designer => {
          let score = 0;
          designer.answers.forEach((ans, index) => { if (ans === newAnswers[index]) score++; });
          if (score > maxScore) { maxScore = score; bestMatch = designer; }
          if (score < minScore) { minScore = score; worstMatch = designer; }
        });
        setMatchedDesigner(bestMatch);
        setOppositeDesigner(worstMatch);
        setStep('loading');
      }, 300);
    }
  };

  const resetQuiz = () => {
    setStep('landing');
    setCurrentQ(0);
    setUserAnswers([]);
    setMatchedDesigner(null);
    setOppositeDesigner(null);
  };

  // 原生分享邏輯
  const handleShare = async () => {
    if (!resultRef.current) return;
    try {
      // 1. 產生圖片 Blob
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // 2. 建立 File 物件
        const file = new File([blob], `workplace-type-${matchedDesigner?.id}.png`, { type: 'image/png' });

        // 3. 嘗試使用原生分享
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: '我的職場設計師人格',
              text: `我是 ${matchedDesigner?.name}！測測你是哪一型？`
            });
          } catch (shareError) {
            console.log('Share dismissed', shareError); // 用戶取消分享不報錯
          }
        } else {
          // 4. 降級處理：直接下載
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `workplace-archetype-${matchedDesigner?.id}.png`;
          link.click();
        }
      });
    } catch (err) {
      console.error("Failed to capture:", err);
    }
  };

  useEffect(() => {
    if (step === 'loading') {
      const timer = setTimeout(() => setStep('result'), 3000); // 增加一點時間展示動畫
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="min-h-screen w-full font-jp relative selection:bg-[#CCFF00] selection:text-black">
      <GlobalStyles />
      <div className="fixed inset-0 bg-noise pointer-events-none z-0"></div>
      <div className="fixed inset-0 scanlines pointer-events-none z-10 opacity-30"></div>

      <div className="relative z-20 max-w-5xl mx-auto min-h-screen flex flex-col justify-center px-4">
        <AnimatePresence mode='wait'>
          
          {/* --- LANDING --- */}
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(20px)' }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="flex gap-4 mb-6 font-mono text-xs tracking-widest text-gray-500">
                <span className="border border-[#333] px-2 py-1">SYS.VER.4.0</span>
                <span className="border border-[#333] px-2 py-1">NEO_TOKYO</span>
              </div>
              <h1 className="text-6xl md:text-9xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600 mix-blend-difference tracking-tighter">
                你哪位設計師？
              </h1>
              <div className="text-[#CCFF00] font-mono tracking-[0.5em] text-sm md:text-xl mb-12">
                WORKPLACE ANTHROPOLOGY
              </div>
              <AcidButton onClick={() => setStep('quiz')} className="bg-black relative">
                START DIAGNOSIS <ArrowRight className="inline ml-2" />
              </AcidButton>
            </motion.div>
          )}

          {/* --- QUIZ --- */}
          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="w-full max-w-3xl mx-auto"
            >
              <div className="flex justify-between items-end mb-4 border-b border-white/20 pb-2">
                <span className="font-mono text-[#00FFFF] text-xl">Q.{currentQ + 1 < 10 ? `0${currentQ+1}` : currentQ+1}</span>
                <span className="font-mono text-xs text-gray-500">PROGRESS [{currentQ + 1}/10]</span>
              </div>
              <div className="relative border-l-4 border-[#00FFFF] pl-6 py-4 mb-8">
                 <h2 className="text-3xl md:text-5xl font-black leading-tight text-white/90">{questions[currentQ].q}</h2>
              </div>
              <div className="space-y-3">
                {questions[currentQ].options.map((option, idx) => (
                  <motion.button
                    key={option.val}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleAnswer(option.val)}
                    className="w-full text-left p-5 border border-white/20 hover:border-[#CCFF00] hover:bg-white/5 transition-all duration-200 group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-gray-500 group-hover:text-[#CCFF00]">{option.val}</span>
                      <span className="font-bold text-lg">{option.label}</span>
                    </div>
                    <Crosshair size={16} className="opacity-0 group-hover:opacity-100 text-[#CCFF00]" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- LOADING (NEW FANCY TERMINAL) --- */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              className="flex items-center justify-center w-full"
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <FancyLoader />
            </motion.div>
          )}

          {/* --- RESULT --- */}
          {step === 'result' && matchedDesigner && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col gap-8 py-8"
            >
              {/* This container will be captured */}
              <div ref={resultRef} className="bg-[#050505] p-4 md:p-8 border-2 border-white/10 relative overflow-hidden">
                  
                  {/* Decorative Elements (Visible in Share) */}
                  <div className="absolute top-4 right-4 text-[#555] font-mono text-[10px] flex items-center gap-2">
                     <Barcode /> 
                     <span>NO. {Math.floor(Math.random() * 999999)}</span>
                  </div>
                  <div className="absolute top-4 left-4 border border-[#333] text-[#555] px-2 py-[2px] text-[10px]">機密</div>
                  <div className="absolute bottom-4 left-4 text-[#333] text-[10px] font-mono tracking-widest">© WORKPLACE ANTHRO.</div>

                  {/* 1. MAIN CARD */}
                  <div className="relative border border-white/20 p-1 flex flex-col md:flex-row gap-0 md:gap-8 bg-black/50 backdrop-blur-sm min-h-[500px] mb-8 mt-6">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#CCFF00]"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#CCFF00]"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#CCFF00]"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#CCFF00]"></div>

                    {/* Left: Image */}
                    <div className="w-full md:w-5/12 relative group overflow-hidden border-r border-white/10">
                       <div className="absolute top-0 left-0 h-full w-12 bg-black/80 border-r border-white/20 z-10 flex flex-col items-center justify-center py-4">
                          <div className={`vertical-text font-black text-2xl tracking-widest ${matchedDesigner.color}`}>
                            {matchedDesigner.jpName}
                          </div>
                       </div>
                       <img src={matchedDesigner.imageSrc} alt={matchedDesigner.name} className="w-full h-full object-cover grayscale contrast-125" />
                       <div className="absolute inset-0 scanlines opacity-50 pointer-events-none"></div>
                       {/* Overlay Tag */}
                       <div className="absolute bottom-2 right-2 bg-[#CCFF00] text-black text-xs font-bold px-2 py-1">
                          TYPE CONFIRMED
                       </div>
                    </div>

                    {/* Right: Info */}
                    <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col">
                       <Marquee text="ANALYSIS COMPLETE // 解析完了 // ARCHETYPE IDENTIFIED // " />
                       
                       <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="font-mono text-xs text-gray-500 mb-1">SUBJECT: {matchedDesigner.typeCode}</div>
                            <h2 className={`text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter ${matchedDesigner.color}`}>
                              {matchedDesigner.name}
                            </h2>
                            <h3 className="text-xl text-white mt-2 border-l-2 border-white pl-3">{matchedDesigner.title}</h3>
                          </div>
                          <div className="hidden md:block scale-90 origin-top-right">
                             <RadarChart stats={matchedDesigner.stats} color={matchedDesigner.radarColor} />
                          </div>
                       </div>
                       <p className="text-gray-300 leading-relaxed text-lg mb-8 font-jp">{matchedDesigner.description}</p>
                       <div className="grid grid-cols-2 gap-4 mt-auto">
                          <div className="border border-white/20 p-3 relative overflow-hidden">
                             <div className="font-mono text-xs text-gray-500 mb-1">LUCKY ITEM</div>
                             <div className="font-bold text-[#00FFFF] flex items-center gap-2 relative z-10"><Zap size={16} /> {matchedDesigner.luckyItem}</div>
                             <Fingerprint className="absolute bottom-[-10px] right-[-10px] text-white/5 w-16 h-16" />
                          </div>
                          <div className="border border-white/20 p-3">
                             <div className="font-mono text-xs text-gray-500 mb-1">BEST PARTNER</div>
                             <div className="font-bold text-[#FF0099] flex items-center gap-2"><Crosshair size={16} /> {matchedDesigner.partner}</div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* 2. THE OPPOSITE (Synergy) */}
                  {oppositeDesigner && (
                    <div className="w-full border-2 border-[#D000FF] bg-stripe-contrast p-1 relative overflow-hidden">
                      <div className="bg-[#0f0518]/95 p-6 flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="flex flex-col items-center md:items-start text-[#D000FF] min-w-[150px]">
                           <Sparkles size={48} className="mb-2 animate-pulse" />
                           <div className="font-mono font-bold tracking-widest text-lg">CONTRAST</div>
                           <div className="text-xs font-mono">SYNERGY DETECTED</div>
                        </div>
                        <div className="flex-1 flex items-center gap-4 border-l border-[#D000FF]/30 pl-0 md:pl-6">
                           <div className="w-20 h-20 border border-white/30 overflow-hidden relative rounded-full">
                              <img src={oppositeDesigner.imageSrc} className="w-full h-full object-cover grayscale opacity-80" />
                              <div className="absolute inset-0 bg-[#D000FF] mix-blend-color opacity-50"></div>
                           </div>
                           <div>
                              <div className="font-mono text-xs text-gray-400">COMPLEMENTARY POLE</div>
                              <div className="text-2xl font-black text-white uppercase">{oppositeDesigner.name}</div>
                              <div className="text-sm text-gray-300 font-jp">完全不同的思考路徑，卻能激盪出最強火花。</div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Action Buttons (Floating) */}
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-4 pb-12 sticky bottom-4 z-50">
                 <button onClick={resetQuiz} className="px-6 py-3 bg-black/80 backdrop-blur border border-white/30 hover:bg-white hover:text-black transition flex items-center justify-center gap-2 font-mono shadow-lg rounded-full">
                    <RefreshCcw size={16} /> RESTART
                 </button>
                 <button onClick={handleShare} className="px-8 py-3 bg-[#CCFF00] text-black font-bold hover:bg-[#b3e600] transition flex items-center justify-center gap-2 font-mono border border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.5)] rounded-full">
                    <Share2 size={16} /> SHARE RESULT
                 </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
