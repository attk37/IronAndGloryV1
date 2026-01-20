
import React, { useEffect, useState, useRef } from 'react';
import { Player, MapNode } from '../types';
import { IconSword, IconShield, IconSkull, IconFlag } from './Icons';
import { FastForward, Users, Swords, Crown, ShieldAlert } from 'lucide-react';

interface MapSimulationModalProps {
  player: Player;
  node: MapNode;
  action: 'raid' | 'rescue' | 'conquer' | 'recruit';
  onComplete: (won: boolean) => void;
  playSfx?: (key: string) => void;
}

const BATTLE_PHASES = [
    { title: "Birliklerin Konuşlanması", desc: "Ordular savaş düzeni alıyor...", icon: IconFlag },
    { title: "Okçu Atışı", desc: "Gökyüzü oklarla karardı!", icon: ShieldAlert },
    { title: "Süvari Hücumu", desc: "Kanatlar birbirine giriyor.", icon: Swords },
    { title: "Meydan Savaşı", desc: "Çelik çeliğe çarpıyor, kader belirleniyor.", icon: IconSword },
    { title: "Sonuç", desc: "Savaş sona eriyor...", icon: Crown }
];

export const MapSimulationModal: React.FC<MapSimulationModalProps> = ({ player, node, action, onComplete, playSfx }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [playerStrengthVisual, setPlayerStrengthVisual] = useState(100);
  const [enemyStrengthVisual, setEnemyStrengthVisual] = useState(100);
  const [logs, setLogs] = useState<string[]>([]);

  // Simulation Data
  const myArmySize = player.kingdom?.army || 0;
  const myArmyQuality = player.kingdom?.armyLevel || 1;
  const myPower = myArmySize * myArmyQuality;
  
  const enemyPowerBase = node.difficulty * 50; // Base power from difficulty
  const enemyPower = Math.floor(enemyPowerBase * (0.8 + Math.random() * 0.4)); // Variance
  
  const winChance = myPower / (myPower + enemyPower);
  const isWin = Math.random() < winChance;

  const intervalRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 3));

  const finishSimulation = () => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      onComplete(isWin);
  };

  useEffect(() => {
    if(playSfx) playSfx('horn');
    let step = 0;
    
    intervalRef.current = window.setInterval(() => {
        step++;

        // Phase Logic
        if (step % 20 === 0 && phaseIndex < BATTLE_PHASES.length - 1) {
            setPhaseIndex(prev => prev + 1);
            if(playSfx) playSfx('sword_clash');
        }

        // Strength Depletion Animation
        if (step > 10 && step < 90) {
            if (isWin) {
                // Player loses less
                setPlayerStrengthVisual(prev => Math.max(60, prev - 0.5));
                setEnemyStrengthVisual(prev => Math.max(0, prev - 1.5));
            } else {
                // Player loses more
                setPlayerStrengthVisual(prev => Math.max(0, prev - 1.5));
                setEnemyStrengthVisual(prev => Math.max(40, prev - 0.5));
            }
        }

        // Random Logs based on phase
        if (step === 20) addLog("Okçular! Atış serbest!");
        if (step === 40) addLog("Süvariler düşman hattını yardı!");
        if (step === 60) addLog("Piyadeler göğüs göğüse çarpışıyor!");
        if (step === 80) addLog(isWin ? "Düşman sancağı düştü!" : "Hatlarımız kırılıyor!");

        if (step >= 100) {
            finishSimulation();
        }

    }, 50); // 5 seconds total duration

    return () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const currentPhase = BATTLE_PHASES[phaseIndex];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-500">
        
        {/* Skip Button */}
        <button 
            onClick={finishSimulation}
            className="absolute top-6 right-6 z-50 flex items-center gap-2 px-5 py-2 bg-stone-900 border border-stone-700 rounded-full text-stone-400 hover:text-white hover:border-amber-500 hover:bg-stone-800 transition-all uppercase text-xs font-bold tracking-wider group"
        >
            <span>Sonucu Göster</span>
            <FastForward size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="w-full max-w-5xl h-full md:h-auto md:aspect-video bg-[#0c0a09] relative overflow-hidden md:rounded-2xl border-y md:border-2 border-stone-800 shadow-2xl flex flex-col">
            
            {/* Background Map Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-30 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 text-center pt-8 pb-4">
                <div className="text-amber-600 text-xs font-bold uppercase tracking-[0.3em] mb-2">Savaş Alanı</div>
                <h2 className="text-3xl rpg-font text-stone-200">{node.name} Kuşatması</h2>
            </div>

            {/* Battlefield Visualization */}
            <div className="flex-1 relative flex items-center justify-between px-8 md:px-20">
                
                {/* Player Army */}
                <div className="flex flex-col items-center gap-4 w-1/3 transition-all duration-300">
                    <div className="relative">
                        <div className="w-24 h-24 bg-blue-900/20 rounded-full border-4 border-blue-800 flex items-center justify-center shadow-[0_0_30px_rgba(30,58,138,0.4)] relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 bg-blue-600/50 transition-all duration-300" style={{ height: `${playerStrengthVisual}%` }} />
                            <IconFlag size={40} className="text-blue-400 relative z-10" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-stone-900 text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-900">
                            {myArmySize} Asker
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-blue-400 font-bold text-lg rpg-font">Ordun</h3>
                        <div className="h-2 w-32 bg-stone-900 rounded-full overflow-hidden border border-stone-700 mt-1">
                            <div className="h-full bg-blue-600 transition-all duration-100" style={{ width: `${playerStrengthVisual}%` }} />
                        </div>
                    </div>
                </div>

                {/* Center Action */}
                <div className="flex flex-col items-center justify-center w-1/3 shrink-0">
                    <div className="mb-6 animate-pulse">
                        {React.createElement(currentPhase.icon, { size: 48, className: "text-amber-500" })}
                    </div>
                    <div className="text-center">
                        <div className="text-stone-300 font-bold text-lg mb-1">{currentPhase.title}</div>
                        <div className="text-stone-500 text-xs italic">{currentPhase.desc}</div>
                    </div>
                    
                    {/* Visual Clash Animation */}
                    <div className="mt-8 flex gap-4">
                        <div className={`transition-transform duration-100 ${phaseIndex > 1 ? 'translate-x-4' : ''}`}>
                            <IconSword size={32} className="text-blue-500 transform rotate-90" />
                        </div>
                        <div className={`transition-transform duration-100 ${phaseIndex > 1 ? '-translate-x-4' : ''}`}>
                            <IconSword size={32} className="text-red-500 transform -rotate-90 scale-x-[-1]" />
                        </div>
                    </div>
                </div>

                {/* Enemy Army */}
                <div className="flex flex-col items-center gap-4 w-1/3 transition-all duration-300">
                    <div className="relative">
                        <div className="w-24 h-24 bg-red-900/20 rounded-full border-4 border-red-800 flex items-center justify-center shadow-[0_0_30px_rgba(153,27,27,0.4)] relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 bg-red-600/50 transition-all duration-300" style={{ height: `${enemyStrengthVisual}%` }} />
                            <IconSkull size={40} className="text-red-400 relative z-10" />
                        </div>
                        <div className="absolute -bottom-2 -left-2 bg-stone-900 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-900">
                            Güç: {node.difficulty}
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-red-400 font-bold text-lg rpg-font">Garnizon</h3>
                        <div className="h-2 w-32 bg-stone-900 rounded-full overflow-hidden border border-stone-700 mt-1">
                            <div className="h-full bg-red-600 transition-all duration-100" style={{ width: `${enemyStrengthVisual}%` }} />
                        </div>
                    </div>
                </div>

            </div>

            {/* Battle Log */}
            <div className="relative z-10 bg-black/40 border-t border-stone-800 p-4 h-32 flex flex-col items-center justify-center space-y-2">
                {logs.map((log, i) => (
                    <div key={i} className={`text-sm font-mono ${i === 0 ? 'text-amber-200 font-bold text-base' : 'text-stone-500 opacity-60'}`}>
                        {log}
                    </div>
                ))}
                {logs.length === 0 && <div className="text-stone-600 italic text-sm">Savaş raporları bekleniyor...</div>}
            </div>

        </div>
    </div>
  );
};
