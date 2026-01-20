
import React, { useEffect, useState, useRef } from 'react';
import { Player, Enemy } from '../types';
import { EnemyAvatar, IconCrossedSwords } from './Icons';
import { FastForward } from 'lucide-react';

interface CombatSimulationModalProps {
  player: Player;
  enemy: Enemy;
  onComplete: () => void;
  playSfx?: (key: string) => void;
}

const BATTLE_PHRASES = [
    "Kılıçlar çekildi!",
    "Amansız bir mücadele...",
    "Düşman saldırıyor!",
    "Karşı saldırıya geçtin!",
    "Büyü ve çelik çarpışıyor...",
    "Son darbe için hazırlanıyor..."
];

export const CombatSimulationModal: React.FC<CombatSimulationModalProps> = ({ player, enemy, onComplete, playSfx }) => {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [clashEffect, setClashEffect] = useState(false);

  // Refs prevent the interval from resetting if the parent component re-renders (fixing the stutter)
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const playSfxRef = useRef(playSfx);

  // Update refs when props change so the closure inside useEffect always has the latest function
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { playSfxRef.current = playSfx; }, [playSfx]);

  const handleSkip = () => {
      if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
      }
      setProgress(100);
      // Call complete immediately
      onCompleteRef.current();
  };

  useEffect(() => {
    const duration = 3000; // 3 seconds simulation
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    intervalRef.current = window.setInterval(() => {
      currentStep++;
      const newProgress = Math.min(100, (currentStep / steps) * 100);
      setProgress(newProgress);

      // Random shake/clash effect logic
      if (currentStep % 10 === 0) {
          setClashEffect(true);
          setTimeout(() => setClashEffect(false), 200);
          setPhraseIndex(prev => (prev + 1) % BATTLE_PHRASES.length);
          
          if (playSfxRef.current) {
              playSfxRef.current('sword_clash');
          }
      }

      if (currentStep >= steps) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        setTimeout(() => onCompleteRef.current(), 200); // Small buffer before closing
      }
    }, intervalTime);

    return () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []); // Empty dependency array ensures simulation runs only once upon mount

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Skip Button */}
      <button 
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-700 rounded-full text-stone-400 hover:text-white hover:border-amber-500 hover:bg-stone-800 transition-all uppercase text-xs font-bold tracking-wider group"
      >
          <span>Atla</span>
          <FastForward size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="w-full max-w-4xl relative overflow-hidden flex flex-col items-center justify-center h-full md:h-auto md:py-20">
        
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/20 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-900/20 blur-[100px] animate-pulse delay-700"></div>
        </div>

        {/* BATTLE STAGE */}
        <div className={`relative z-10 flex flex-col md:flex-row items-center justify-between w-full px-8 gap-12 transition-transform duration-100 ${clashEffect ? 'scale-[1.02] translate-y-1' : ''}`}>
            
            {/* PLAYER */}
            <div className={`flex flex-col items-center transition-all duration-500 ${progress < 10 ? '-translate-x-20 opacity-0' : 'translate-x-0 opacity-100'}`}>
                <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-stone-500 bg-stone-900 shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden z-10">
                    <EnemyAvatar type={player.appearance.imgUrl || "knight"} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent mix-blend-overlay"></div>
                </div>
                <div className="mt-4 text-center">
                    <h3 className="text-2xl rpg-font text-stone-200">{player.name}</h3>
                    <div className="text-amber-500 font-bold text-sm">Lv. {player.level}</div>
                </div>
            </div>

            {/* VS CENTER */}
            <div className="relative flex flex-col items-center justify-center shrink-0">
                <div className={`relative z-20 transition-all duration-300 ${clashEffect ? 'scale-125 text-red-500' : 'scale-100 text-amber-600'}`}>
                    <IconCrossedSwords size={80} />
                </div>
                <div className="mt-8 font-serif text-stone-400 italic text-lg h-8 text-center min-w-[200px] animate-pulse">
                    {BATTLE_PHRASES[phraseIndex]}
                </div>
            </div>

            {/* ENEMY */}
            <div className={`flex flex-col items-center transition-all duration-500 ${progress < 10 ? 'translate-x-20 opacity-0' : 'translate-x-0 opacity-100'}`}>
                <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-red-900 bg-stone-900 shadow-[0_0_50px_rgba(220,38,38,0.3)] overflow-hidden z-10">
                    <EnemyAvatar type={enemy.imgUrl} />
                    <div className="absolute inset-0 bg-gradient-to-bl from-red-500/20 to-transparent mix-blend-overlay"></div>
                </div>
                <div className="mt-4 text-center">
                    <h3 className="text-2xl rpg-font text-red-400">{enemy.name}</h3>
                    <div className="text-stone-500 font-bold text-sm">Lv. {enemy.level}</div>
                </div>
            </div>

        </div>

        {/* PROGRESS BAR */}
        <div className="w-full max-w-lg mt-12 px-8 relative z-10">
            <div className="flex justify-between text-xs text-stone-500 uppercase font-bold mb-2">
                <span>Savaş Başladı</span>
                <span>Sonuç Bekleniyor</span>
            </div>
            <div className="h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800 cursor-pointer" onClick={handleSkip} title="Savaşı Hızlandır">
                <div 
                    className="h-full bg-gradient-to-r from-amber-800 via-amber-500 to-white shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-75 ease-linear" 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>

      </div>
    </div>
  );
};
