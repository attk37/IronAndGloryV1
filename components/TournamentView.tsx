import React, { useState } from 'react';
import { Player, Rank } from '../types';
import { RANKS } from '../constants';
import { calculatePlayerDamage, calculatePlayerDefense } from '../services/gameLogic';
import { IconTournament, IconSword, IconGem, IconCoin, IconSkull, IconHelmet, EnemyAvatar, IconShield, IconCrossedSwords } from './Icons';
import { Lock, CheckCircle2, ChevronRight, Crown, Shield, Activity } from 'lucide-react';

interface TournamentViewProps {
  player: Player;
  onChallengeRank: (rank: Rank, won: boolean, remainingHp: number) => void;
  playSfx?: (key: string) => void;
}

interface CombatState {
    playerHp: number;
    playerMaxHp: number;
    enemyHp: number;
    enemyMaxHp: number;
    log: string;
    turn: number;
    isPlayerTurn: boolean;
    history: string[];
}

export const TournamentView: React.FC<TournamentViewProps> = ({ player, onChallengeRank, playSfx }) => {
  const [viewState, setViewState] = useState<'LADDER' | 'COMBAT' | 'RESULT'>('LADDER');
  const [activeRank, setActiveRank] = useState<Rank | null>(null);
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [actionEffect, setActionEffect] = useState<{ type: 'attack' | 'block' | 'crit', target: 'player' | 'enemy' } | null>(null);

  const currentRankIndex = player.rankIndex;
  const nextRank = RANKS[currentRankIndex + 1];
  const canChallenge = nextRank && player.level >= nextRank.minLevel;
  const isWounded = player.hp <= 5;

  // --- COMBAT LOGIC ---

  const startCombat = (rank: Rank) => {
      setActiveRank(rank);
      setCombat({
          playerHp: player.hp,
          playerMaxHp: player.maxHp,
          enemyHp: rank.guardian.hp,
          enemyMaxHp: rank.guardian.hp,
          log: `${rank.guardian.name} karşısına çıktın. Dövüş başlasın!`,
          turn: 1,
          isPlayerTurn: true,
          history: []
      });
      setViewState('COMBAT');
      if (playSfx) playSfx('ui_click');
  };

  const handleAction = (action: 'quick' | 'heavy' | 'defend') => {
      if (!combat || !activeRank || !combat.isPlayerTurn) return;

      let newEnemyHp = combat.enemyHp;
      let logMsg = "";
      let effect = null;
      const playerDmg = calculatePlayerDamage(player);

      if (action === 'defend') {
          logMsg = "Savunma pozisyonuna geçtin! Hasar azaltılacak.";
          effect = { type: 'block', target: 'player' };
          if (playSfx) playSfx('block');
      } else {
          let hitChance = 0;
          let dmgMultiplier = 1;

          if (action === 'quick') {
              hitChance = 95 + player.stats.skill; // High hit chance
              dmgMultiplier = 0.9;
          } else if (action === 'heavy') {
              hitChance = 65 + player.stats.skill; // Lower hit chance
              dmgMultiplier = 1.6;
          }

          const roll = Math.random() * 100;
          // Boss Dodge Chance based on level diff? Currently fixed slightly.
          const bossDodge = 5; 

          if (roll <= (hitChance - bossDodge)) {
              // Calculate Damage
              const rawDmg = playerDmg * dmgMultiplier;
              // Boss armor mitigation
              const actualDmg = Math.max(1, Math.floor(rawDmg - (activeRank.guardian.defense * 0.25))); 

              // Crit Check
              if (Math.random() * 100 <= player.stats.luck) {
                  const critDmg = Math.floor(actualDmg * 1.5);
                  newEnemyHp -= critDmg;
                  logMsg = `KRİTİK! ${activeRank.guardian.name} ${critDmg} hasar aldı!`;
                  effect = { type: 'crit', target: 'enemy' };
                  if (playSfx) playSfx('sword_clash');
              } else {
                  newEnemyHp -= actualDmg;
                  logMsg = `${activeRank.guardian.name} ${actualDmg} hasar aldı.`;
                  effect = { type: 'attack', target: 'enemy' };
                  if (playSfx) playSfx('sword_hit');
              }
          } else {
              logMsg = "Saldırın ıska geçti!";
          }
      }

      // Update State
      setCombat(prev => prev ? { 
          ...prev, 
          enemyHp: newEnemyHp, 
          log: logMsg, 
          history: [logMsg, ...prev.history].slice(0, 4),
          isPlayerTurn: false 
      } : null);
      
      setActionEffect(effect as any);
      setTimeout(() => setActionEffect(null), 600);

      // Check Win Condition
      if (newEnemyHp <= 0) {
          setTimeout(() => endCombat(true), 1000);
      } else {
          setTimeout(() => enemyTurn(action === 'defend'), 1200);
      }
  };

  const enemyTurn = (playerDefending: boolean) => {
      setCombat(prev => {
          if (!prev || !activeRank) return null;

          const boss = activeRank.guardian;
          let newPlayerHp = prev.playerHp;
          let logMsg = "";
          let effect = null;

          // Boss AI: 20% Chance for Heavy/Special attack
          const isSpecial = Math.random() < 0.2;
          const hitChance = 70 + (boss.level); 

          if (Math.random() * 100 <= hitChance) {
              let damage = isSpecial ? boss.damage * 1.4 : boss.damage;
              
              // Player Defense Calculation
              const playerDef = calculatePlayerDefense(player);
              damage = Math.max(1, Math.floor(damage - (playerDef * 0.5)));

              if (playerDefending) {
                  damage = Math.floor(damage * 0.4); // Defend reduces damage significantly
                  logMsg = `${boss.name} saldırdı ama blokladın! (${damage} hasar)`;
                  effect = { type: 'block', target: 'player' };
                  if (playSfx) playSfx('block');
              } else {
                  if (isSpecial) {
                      logMsg = `${boss.name} YIKICI bir darbe indirdi! (${Math.floor(damage)} hasar)`;
                      effect = { type: 'crit', target: 'player' };
                      if (playSfx) playSfx('sword_clash');
                  } else {
                      logMsg = `${boss.name} sana vurdu. (${Math.floor(damage)} hasar)`;
                      effect = { type: 'attack', target: 'player' };
                      if (playSfx) playSfx('sword_hit');
                  }
              }
              newPlayerHp -= damage;
          } else {
              logMsg = `${boss.name} saldırısını savuşturdun!`;
          }

          if (newPlayerHp <= 0) {
              setTimeout(() => endCombat(false), 1000);
          }

          setActionEffect(effect as any);
          setTimeout(() => setActionEffect(null), 600);

          return {
              ...prev,
              playerHp: newPlayerHp,
              log: logMsg,
              history: [logMsg, ...prev.history].slice(0, 4),
              isPlayerTurn: true,
              turn: prev.turn + 1
          };
      });
  };

  const endCombat = (won: boolean) => {
      setViewState('RESULT');
      // We don't call the prop yet, user needs to click "Continue"
  };

  const finishChallenge = () => {
      if (activeRank && combat) {
          const won = combat.enemyHp <= 0;
          onChallengeRank(activeRank, won, Math.max(0, combat.playerHp));
      }
      setViewState('LADDER');
      setCombat(null);
      setActiveRank(null);
      if (playSfx) playSfx('ui_click');
  };

  // --- RENDERING ---

  if (viewState === 'COMBAT' && combat && activeRank) {
      return (
          <div className="max-w-4xl mx-auto py-4 animate-in fade-in duration-500">
              {/* Header: Turn Info */}
              <div className="text-center mb-6">
                  <h2 className="text-3xl rpg-font text-amber-500 drop-shadow-md">RÜTBE SAVAŞI</h2>
                  <div className="text-stone-500 text-sm font-mono uppercase tracking-widest mt-1">Tur {combat.turn}</div>
              </div>

              {/* BATTLEGROUND */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 relative">
                  
                  {/* Player Side */}
                  <div className="w-full md:w-1/3 flex flex-col items-center relative">
                      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-stone-600 bg-stone-900 overflow-hidden shadow-2xl z-10">
                          <EnemyAvatar type={player.appearance.imgUrl || "knight"} /> {/* Reuse generic for player or race specific */}
                          {actionEffect?.target === 'player' && (
                              <div className={`absolute inset-0 flex items-center justify-center bg-black/60 z-20 font-bold text-xl animate-bounce ${actionEffect.type === 'block' ? 'text-blue-400' : 'text-red-500'}`}>
                                  {actionEffect.type === 'block' ? 'BLOK' : 'HASAR'}
                              </div>
                          )}
                      </div>
                      <div className="mt-4 w-full bg-stone-900 rounded-full h-4 border border-stone-700 overflow-hidden relative">
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white z-10">{Math.floor(combat.playerHp)}/{combat.playerMaxHp}</div>
                          <div className="h-full bg-gradient-to-r from-emerald-800 to-emerald-500 transition-all duration-500" style={{ width: `${(combat.playerHp / combat.playerMaxHp) * 100}%` }} />
                      </div>
                      <h3 className="text-stone-200 font-bold mt-2 text-lg">{player.name}</h3>
                  </div>

                  {/* VS Indicator */}
                  <div className="hidden md:flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center border-2 border-amber-700 animate-pulse">
                          <IconCrossedSwords size={24} className="text-amber-500" />
                      </div>
                  </div>

                  {/* Enemy Side */}
                  <div className="w-full md:w-1/3 flex flex-col items-center relative">
                      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-red-900 bg-stone-900 overflow-hidden shadow-2xl shadow-red-900/20 z-10">
                          <EnemyAvatar type={activeRank.guardian.imgUrl} />
                          {actionEffect?.target === 'enemy' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/30 z-20 font-bold text-xl animate-ping text-red-900">
                                  {actionEffect.type === 'crit' ? 'KRİTİK!' : 'İSABET!'}
                              </div>
                          )}
                      </div>
                      <div className="mt-4 w-full bg-stone-900 rounded-full h-4 border border-stone-700 overflow-hidden relative">
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white z-10">{combat.enemyHp}/{combat.enemyMaxHp}</div>
                          <div className="h-full bg-gradient-to-r from-red-900 to-red-600 transition-all duration-500" style={{ width: `${(combat.enemyHp / combat.enemyMaxHp) * 100}%` }} />
                      </div>
                      <h3 className="text-red-400 font-bold mt-2 text-lg">{activeRank.guardian.name}</h3>
                      <div className="text-stone-500 text-xs font-bold uppercase">{activeRank.title} Muhafızı</div>
                  </div>
              </div>

              {/* LOG & CONTROLS */}
              <div className="bg-[#151210] border border-stone-800 rounded-xl p-6 shadow-inner">
                  
                  {/* Combat Log */}
                  <div className="mb-6 h-24 overflow-hidden flex flex-col justify-end text-center border-b border-stone-800/50 pb-4">
                      {combat.history.map((msg, i) => (
                          <div key={i} className={`text-sm py-0.5 ${i === 0 ? 'text-amber-100 font-bold text-base' : 'text-stone-500 opacity-70 scale-95'}`}>
                              {msg}
                          </div>
                      ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-4">
                      <button
                          onClick={() => handleAction('quick')}
                          disabled={!combat.isPlayerTurn}
                          className={`
                              group relative overflow-hidden p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                              ${combat.isPlayerTurn 
                                  ? 'bg-stone-900 border-stone-600 hover:border-emerald-500 hover:bg-stone-800 hover:-translate-y-1 cursor-pointer' 
                                  : 'bg-stone-950 border-stone-800 opacity-50 cursor-not-allowed'}
                          `}
                      >
                          <div className="absolute inset-0 bg-emerald-900/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                          <Activity size={24} className="text-emerald-500 relative z-10" />
                          <span className="text-sm font-bold relative z-10">Hızlı Saldırı</span>
                          <span className="text-[10px] text-stone-500 relative z-10">%95 İsabet</span>
                      </button>

                      <button
                          onClick={() => handleAction('heavy')}
                          disabled={!combat.isPlayerTurn}
                          className={`
                              group relative overflow-hidden p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                              ${combat.isPlayerTurn 
                                  ? 'bg-stone-900 border-stone-600 hover:border-red-500 hover:bg-stone-800 hover:-translate-y-1 cursor-pointer' 
                                  : 'bg-stone-950 border-stone-800 opacity-50 cursor-not-allowed'}
                          `}
                      >
                          <div className="absolute inset-0 bg-red-900/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                          <IconSword size={24} className="text-red-500 relative z-10" />
                          <span className="text-sm font-bold relative z-10">Ağır Saldırı</span>
                          <span className="text-[10px] text-stone-500 relative z-10">Yüksek Hasar</span>
                      </button>

                      <button
                          onClick={() => handleAction('defend')}
                          disabled={!combat.isPlayerTurn}
                          className={`
                              group relative overflow-hidden p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                              ${combat.isPlayerTurn 
                                  ? 'bg-stone-900 border-stone-600 hover:border-blue-500 hover:bg-stone-800 hover:-translate-y-1 cursor-pointer' 
                                  : 'bg-stone-950 border-stone-800 opacity-50 cursor-not-allowed'}
                          `}
                      >
                          <div className="absolute inset-0 bg-blue-900/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                          <IconShield size={24} className="text-blue-500 relative z-10" />
                          <span className="text-sm font-bold relative z-10">Savunma</span>
                          <span className="text-[10px] text-stone-500 relative z-10">Hasar Azalt</span>
                      </button>
                  </div>
                  
                  {!combat.isPlayerTurn && (
                      <div className="text-center mt-4 text-stone-500 text-xs uppercase tracking-widest animate-pulse">
                          Düşman hamle yapıyor...
                      </div>
                  )}
              </div>
          </div>
      );
  }

  if (viewState === 'RESULT' && activeRank && combat) {
      const won = combat.enemyHp <= 0;
      return (
          <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95">
              <div className={`max-w-md w-full p-8 rounded-2xl border-2 text-center shadow-2xl relative overflow-hidden
                  ${won ? 'bg-stone-900 border-amber-600' : 'bg-stone-950 border-red-900'}
              `}>
                  {won && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/gold-scale.png')] opacity-10" />}
                  
                  <div className="relative z-10">
                      {won ? (
                          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce">
                              <Crown size={40} className="text-white" />
                          </div>
                      ) : (
                          <div className="w-20 h-20 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(153,27,27,0.6)] animate-pulse">
                              <IconSkull size={40} className="text-red-400" />
                          </div>
                      )}

                      <h2 className={`text-4xl rpg-font mb-2 ${won ? 'text-amber-500' : 'text-red-500'}`}>
                          {won ? 'ZAFER!' : 'YENİLGİ'}
                      </h2>
                      <p className="text-stone-300 font-serif italic mb-8">
                          {won 
                              ? `${activeRank.guardian.name} mağlup oldu. ${activeRank.title} rütbesine yükseldin!` 
                              : `${activeRank.guardian.name} çok güçlüydü. Daha fazla güçlenip geri dön.`}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                          <div className="bg-black/40 p-3 rounded border border-stone-800">
                              <div className="text-stone-500 text-[10px] uppercase font-bold">Kalan Can</div>
                              <div className={`font-mono font-bold text-lg ${won ? 'text-green-500' : 'text-red-500'}`}>{Math.max(0, Math.floor(combat.playerHp))}</div>
                          </div>
                          <div className="bg-black/40 p-3 rounded border border-stone-800">
                              <div className="text-stone-500 text-[10px] uppercase font-bold">Ödül</div>
                              <div className="font-mono font-bold text-lg text-stone-300">
                                  {won ? `${activeRank.rewardSilver} Gümüş` : 'Yok'}
                              </div>
                          </div>
                      </div>

                      <button 
                          onClick={finishChallenge}
                          className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all
                              ${won ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'}
                          `}
                      >
                          Devam Et
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- LADDER VIEW (DEFAULT) ---

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px] animate-in fade-in duration-500">
        
        {/* LEFT COLUMN: LADDER PROGRESS */}
        <div className="w-full lg:w-1/3 bg-[#0a0807] border border-stone-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-stone-800 bg-stone-900/50">
                 <h2 className="text-xl rpg-font text-stone-200 flex items-center gap-2">
                    <IconTournament size={24} className="text-amber-600"/> Şöhret Yolu
                 </h2>
                 <p className="text-xs text-stone-500 mt-1">Her zafer seni zirveye bir adım daha yaklaştırır.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                {/* Timeline Line */}
                <div className="absolute left-[2.2rem] top-6 bottom-6 w-0.5 bg-stone-800" />

                <div className="space-y-6 relative">
                    {RANKS.map((rank, idx) => {
                        const isPassed = idx < currentRankIndex;
                        const isCurrent = idx === currentRankIndex;
                        const isNext = idx === currentRankIndex + 1;
                        const isLocked = idx > currentRankIndex + 1;

                        return (
                            <div key={rank.id} className={`flex items-center gap-4 relative group ${isLocked ? 'opacity-40' : 'opacity-100'}`}>
                                {/* Node Indicator */}
                                <div className={`w-8 h-8 rounded-full border-4 shrink-0 z-10 flex items-center justify-center transition-all
                                    ${isCurrent ? 'bg-amber-950 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-110' : 
                                      isPassed ? 'bg-stone-900 border-stone-700 text-stone-500' :
                                      'bg-stone-950 border-stone-800 text-stone-700'}
                                `}>
                                    {isPassed ? <CheckCircle2 size={16} /> : isLocked ? <Lock size={12} /> : isCurrent ? <IconHelmet size={16} /> : <div className="w-2 h-2 bg-stone-600 rounded-full"/>}
                                </div>

                                {/* Label Card */}
                                <div className={`flex-1 p-3 rounded border transition-all
                                    ${isCurrent ? 'bg-amber-900/20 border-amber-800' : 
                                      isNext ? 'bg-stone-900 border-stone-700' :
                                      'bg-transparent border-transparent'}
                                `}>
                                    <div className="flex justify-between items-center">
                                        <h5 className={`font-bold text-sm ${isCurrent ? 'text-amber-500' : 'text-stone-300'}`}>{rank.title}</h5>
                                        {isCurrent && <span className="text-[10px] bg-amber-950 text-amber-500 px-1.5 rounded border border-amber-900">Mevcut</span>}
                                    </div>
                                    {!isPassed && idx > 0 && <div className="text-[10px] text-stone-500 mt-1">Sv. {rank.minLevel}</div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHALLENGE CARD */}
        <div className="w-full lg:w-2/3 flex flex-col justify-center">
             {nextRank ? (
                 <div className="relative w-full max-w-2xl mx-auto bg-[#1c1917] border border-stone-700 rounded-xl overflow-hidden shadow-2xl group">
                    {/* Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-black to-stone-900 opacity-80" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 pointer-events-none" />
                    
                    {/* Content */}
                    <div className="relative z-10 p-8 flex flex-col items-center text-center">
                        
                        {/* Header */}
                        <div className="mb-6">
                            <h3 className="text-stone-500 text-xs uppercase tracking-[0.4em] mb-2 font-bold">Sıradaki Meydan Okuma</h3>
                            <h2 className="text-4xl rpg-font text-stone-100 drop-shadow-lg">{nextRank.title}</h2>
                        </div>

                        {/* Guardian Visual */}
                        <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-amber-600/20 blur-3xl rounded-full animate-pulse" />
                            <div className="relative w-full h-full bg-stone-900 rounded-full border-4 border-amber-900/50 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                <EnemyAvatar type={nextRank.guardian.imgUrl} />
                            </div>
                            <div className="absolute -bottom-4 bg-stone-950 text-stone-300 text-xs px-3 py-1 rounded-full border border-stone-700 font-bold uppercase tracking-wide">
                                {nextRank.guardian.name}
                            </div>
                        </div>

                        {/* Stats & Requirements */}
                        <div className="grid grid-cols-2 gap-4 w-full mb-8">
                             <div className="bg-black/40 p-4 rounded border border-stone-800 flex flex-col items-center">
                                 <span className="text-stone-500 text-[10px] uppercase font-bold mb-1">Gereksinim</span>
                                 <div className={`text-xl font-mono font-bold ${player.level >= nextRank.minLevel ? 'text-green-500' : 'text-red-500'}`}>
                                     Lv. {player.level}/{nextRank.minLevel}
                                 </div>
                             </div>
                             <div className="bg-black/40 p-4 rounded border border-stone-800 flex flex-col items-center">
                                 <span className="text-stone-500 text-[10px] uppercase font-bold mb-1">Ödül</span>
                                 <div className="text-xl font-mono font-bold text-amber-500 flex items-center gap-1">
                                     +{nextRank.statBonus} <span className="text-xs text-stone-400">Stat</span>
                                 </div>
                             </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => startCombat(nextRank)}
                            disabled={!canChallenge || isWounded}
                            className={`
                                w-full py-5 rounded text-lg font-bold uppercase tracking-[0.2em] transition-all shadow-lg border relative overflow-hidden group/btn
                                ${!canChallenge 
                                    ? 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed' 
                                    : isWounded 
                                        ? 'bg-red-950/20 text-red-500 border-red-900/50 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-amber-900 to-amber-800 hover:from-amber-800 hover:to-amber-700 text-amber-100 border-amber-600 hover:shadow-amber-900/50'}
                            `}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <IconSword size={20} />
                                {isWounded ? "Yaralısın - İyileş" : !canChallenge ? "Seviye Yetersiz" : "Meydan Oku"}
                            </span>
                            {/* Hover Shine Effect */}
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                        </button>
                    </div>
                 </div>
             ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-stone-900/30 rounded-xl border border-stone-800 border-dashed">
                    <Crown size={80} className="text-amber-500 mb-6 drop-shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-bounce" />
                    <h2 className="text-4xl font-bold text-amber-500 rpg-font mb-4">Mutlak Hakimiyet</h2>
                    <p className="text-xl text-stone-400 font-serif max-w-md">
                        "Krallığın zirvesindesin. Senin üzerinde hüküm süren kimse yok."
                    </p>
                 </div>
             )}
        </div>

    </div>
  );
};