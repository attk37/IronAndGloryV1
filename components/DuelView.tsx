
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { calculatePlayerDamage, calculatePlayerDefense } from '../services/gameLogic';
import { IconCrossedSwords, IconShield, IconSkull, IconEnergy, IconGem, IconHelmet } from './Icons';
import { Trophy } from 'lucide-react';

interface DuelViewProps {
  player: Player;
  onDuelComplete: (won: boolean, rewardGold: number, rewardGems: number, lostSilver?: number) => void;
  playSfx?: (key: string) => void;
}

interface DuelState {
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemyName: string;
  enemyLevel: number;
  enemyStats: { damage: number; defense: number };
  log: string;
  turn: number;
  isPlayerTurn: boolean;
}

// Bot names generator
const BOT_NAMES = ["Demir Kıran", "Gölge Gezgin", "Kemik Kıran", "Sör Lancelot", "Kara Dul", "Vahşi Baron", "Ejder Kanı"];
const BOT_TITLES = ["Acımasız", "Sessiz", "Yıkıcı", "Korkusuz", "Lanetli"];

export const DuelView: React.FC<DuelViewProps> = ({ player, onDuelComplete, playSfx }) => {
  const [gameState, setGameState] = useState<'LOBBY' | 'COMBAT' | 'RESULT'>('LOBBY');
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [duelResult, setDuelResult] = useState<{ won: boolean; gold: number; gems: number; lostSilver?: number } | null>(null);
  const [actionEffect, setActionEffect] = useState<{ type: 'attack' | 'block' | 'crit', target: 'player' | 'enemy' } | null>(null);

  // Generate a random opponent based on player level
  const findOpponent = () => {
    if (player.energy < 10) return;

    const levelVariance = Math.floor(Math.random() * 3) - 1; // Level -1, 0, or +1
    const enemyLevel = Math.max(1, player.level + levelVariance);
    
    // Simulate enemy stats based on level
    const baseStat = enemyLevel * 5;
    const enemyMaxHp = 60 + (enemyLevel * 15);
    const enemyDamage = 5 + (enemyLevel * 2);
    const enemyDefense = 2 + (enemyLevel * 1.5);

    const name = `${BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]} ${BOT_TITLES[Math.floor(Math.random() * BOT_TITLES.length)]}`;

    setDuel({
      playerHp: player.hp,
      playerMaxHp: player.maxHp,
      enemyHp: enemyMaxHp,
      enemyMaxHp: enemyMaxHp,
      enemyName: name,
      enemyLevel: enemyLevel,
      enemyStats: { damage: enemyDamage, defense: enemyDefense },
      log: "Düello başladı! Hamleni yap.",
      turn: 1,
      isPlayerTurn: true
    });
    setGameState('COMBAT');
    if(playSfx) playSfx('sword_clash');
  };

  // Combat Actions
  const handleAction = (action: 'quick' | 'heavy' | 'defend') => {
    if (!duel || !duel.isPlayerTurn) return;

    let newEnemyHp = duel.enemyHp;
    let logMsg = "";
    let effect = null;

    const playerDmg = calculatePlayerDamage(player);
    
    // --- PLAYER MOVE ---
    if (action === 'defend') {
        logMsg = "Savunma pozisyonuna geçtin! Gelen hasar azalacak.";
        effect = { type: 'block', target: 'player' };
        if(playSfx) playSfx('block');
    } else {
        let hitChance = 0;
        let dmgMultiplier = 1;
        
        if (action === 'quick') {
            hitChance = 90 + player.stats.skill;
            dmgMultiplier = 0.8;
        } else if (action === 'heavy') {
            hitChance = 60 + player.stats.skill;
            dmgMultiplier = 1.5;
        }

        const roll = Math.random() * 100;
        if (roll <= hitChance) {
            // Hit
            const rawDmg = playerDmg * dmgMultiplier;
            const actualDmg = Math.max(1, Math.floor(rawDmg - (duel.enemyStats.defense * 0.3))); // Enemy armor mitigation
            
            // Crit Check
            const critRoll = Math.random() * 100;
            if (critRoll <= player.stats.luck) {
                newEnemyHp -= Math.floor(actualDmg * 1.5);
                logMsg = `KRİTİK VURUŞ! Rakibe ${Math.floor(actualDmg * 1.5)} hasar verdin!`;
                effect = { type: 'crit', target: 'enemy' };
                if(playSfx) playSfx('sword_clash');
            } else {
                newEnemyHp -= actualDmg;
                logMsg = `Rakibe ${actualDmg} hasar verdin.`;
                effect = { type: 'attack', target: 'enemy' };
                if(playSfx) playSfx('sword_hit');
            }
        } else {
            // Miss
            logMsg = "Saldırını ıska geçtin!";
        }
    }

    setDuel(prev => prev ? { ...prev, enemyHp: newEnemyHp, log: logMsg, isPlayerTurn: false } : null);
    setActionEffect(effect as any);

    // Remove visual effect after short delay
    setTimeout(() => setActionEffect(null), 500);

    // Check Win
    if (newEnemyHp <= 0) {
        setTimeout(() => endDuel(true), 1000);
    } else {
        // Enemy Turn Trigger
        setTimeout(() => enemyTurn(action === 'defend'), 1000);
    }
  };

  const enemyTurn = (playerDefending: boolean) => {
      setDuel(prev => {
          if (!prev) return null;
          
          const enemyAction = Math.random() > 0.3 ? 'attack' : 'heavy'; // Simple AI
          let newPlayerHp = prev.playerHp;
          let logMsg = "";
          let effect = null;

          const enemyDmgBase = prev.enemyStats.damage;

          if (enemyAction === 'attack') {
             let damage = Math.max(1, Math.floor(enemyDmgBase - (calculatePlayerDefense(player) * 0.4)));
             
             if (playerDefending) {
                 damage = Math.floor(damage * 0.3); // Block reduces damage by 70%
                 logMsg = `Rakibin saldırısını kalkanınla karşıladın! Sadece ${damage} hasar aldın.`;
                 effect = { type: 'block', target: 'player' };
                 if(playSfx) playSfx('block');
             } else {
                 logMsg = `Rakip sana vurdu! ${damage} hasar aldın.`;
                 effect = { type: 'attack', target: 'player' };
                 if(playSfx) playSfx('sword_hit');
             }
             newPlayerHp -= damage;

          } else {
              // Heavy attack logic
              const hitRoll = Math.random();
              if (hitRoll > 0.4) { // 60% hit chance for bot heavy
                  let damage = Math.floor(enemyDmgBase * 1.5);
                  if (playerDefending) damage = Math.floor(damage * 0.6); // Heavy breaks block partially
                  
                  newPlayerHp -= damage;
                  logMsg = `Rakip AĞIR bir darbe indirdi! ${damage} hasar aldın.`;
                  effect = { type: 'crit', target: 'player' };
                  if(playSfx) playSfx('sword_clash');
              } else {
                  logMsg = "Rakibin ağır saldırısı boşa gitti!";
              }
          }

          if (newPlayerHp <= 0) {
              setTimeout(() => endDuel(false), 1000);
          }

          setActionEffect(effect as any);
          setTimeout(() => setActionEffect(null), 500);

          return {
              ...prev,
              playerHp: newPlayerHp,
              log: logMsg,
              isPlayerTurn: true,
              turn: prev.turn + 1
          };
      });
  };

  const endDuel = (won: boolean) => {
      let gold = 0;
      let gems = 0;
      let lostSilver = 0;

      if (won) {
          gold = 50 + (player.level * 20);
          gems = Math.floor(Math.random() * 2) + 1; // 1 or 2 gems
      } else {
          // Penalty: 5% to 10% of current silver
          const penaltyPercent = 0.05 + Math.random() * 0.05;
          lostSilver = Math.floor(player.silver * penaltyPercent);
      }

      setDuelResult({ won, gold, gems, lostSilver });
      setGameState('RESULT');
      onDuelComplete(won, gold, gems, lostSilver);
  };

  if (gameState === 'LOBBY') {
    return (
      <div className="flex flex-col items-center justify-center py-10 animate-in fade-in">
        <div className="bg-stone-900 border-2 border-amber-900/50 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-stone-900 via-amber-700 to-stone-900" />
            
            <IconCrossedSwords size={64} className="mx-auto text-amber-600 mb-6 drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]" />
            
            <h2 className="text-3xl rpg-font text-stone-100 mb-2">Arena Düellosu</h2>
            <p className="text-stone-400 mb-8 italic">"Yeteneklerini diğer savaşçılara karşı sına. Şan, şöhret ve ganimet kazan."</p>

            <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 mb-8">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-stone-500">Giriş Bedeli:</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1"><IconEnergy size={14}/> 10 Enerji</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Olası Ödül:</span>
                    <span className="text-stone-400 font-bold flex items-center gap-1">Gümüş & <IconGem size={14}/></span>
                </div>
            </div>

            <button
                onClick={findOpponent}
                disabled={player.energy < 10}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 active:scale-95 border-2 
                    ${player.energy >= 10 
                        ? 'bg-amber-900 border-amber-600 text-white shadow-[0_0_20px_rgba(180,83,9,0.4)] hover:bg-amber-800' 
                        : 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed'}`}
            >
                {player.energy >= 10 ? "Rakip Ara" : "Yetersiz Enerji"}
            </button>
        </div>
      </div>
    );
  }

  if (gameState === 'RESULT' && duelResult) {
      return (
        <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-90">
             <div className="bg-stone-900 border-2 border-stone-700 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
                 {duelResult.won ? (
                     <>
                        <Trophy size={80} className="mx-auto text-amber-400 mb-4 animate-bounce" />
                        <h2 className="text-3xl rpg-font text-amber-500 mb-4">ZAFER!</h2>
                        <p className="text-stone-300 mb-6">Rakibini arenanın tozuna gömdün.</p>
                        <div className="flex justify-center gap-4 mb-8">
                            <div className="bg-stone-950 px-4 py-2 rounded border border-amber-900 text-stone-300 font-bold">
                                +{duelResult.gold} Gümüş
                            </div>
                            {duelResult.gems > 0 && (
                                <div className="bg-stone-950 px-4 py-2 rounded border border-purple-900 text-purple-400 font-bold">
                                    +{duelResult.gems} Gem
                                </div>
                            )}
                        </div>
                     </>
                 ) : (
                     <>
                        <IconSkull size={80} className="mx-auto text-red-500 mb-4 animate-pulse" />
                        <h2 className="text-3xl rpg-font text-red-500 mb-4">YENİLGİ</h2>
                        <p className="text-stone-300 mb-6">Bu sefer rakibin daha güçlüydü. Yaralarını sar ve tekrar dene.</p>
                        
                        {/* Penalty Display */}
                        {duelResult.lostSilver && duelResult.lostSilver > 0 ? (
                             <div className="bg-red-950/30 px-4 py-2 rounded border border-red-900 text-red-400 font-bold mb-8 inline-block">
                                -{duelResult.lostSilver} Gümüş
                             </div>
                        ) : null}
                     </>
                 )}
                 <button 
                    onClick={() => setGameState('LOBBY')}
                    className="w-full bg-stone-800 hover:bg-stone-700 py-3 rounded text-stone-200 font-bold border border-stone-600"
                 >
                    Arenaya Dön
                 </button>
             </div>
        </div>
      );
  }

  if (gameState === 'COMBAT' && duel) {
      return (
        <div className="max-w-3xl mx-auto py-6 animate-in fade-in">
            {/* Health Bars Section */}
            <div className="flex justify-between items-center mb-8 gap-4">
                {/* Player Stats */}
                <div className="flex-1 bg-stone-900 p-3 rounded-lg border border-amber-900/30 shadow-lg relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border border-amber-700">
                            <IconHelmet size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-stone-200">{player.name}</div>
                            <div className="text-xs text-stone-500">Lv {player.level} Şövalye</div>
                        </div>
                    </div>
                    <div className="h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                        <div 
                            className="h-full bg-gradient-to-r from-red-800 to-red-600 transition-all duration-500" 
                            style={{ width: `${(duel.playerHp / duel.playerMaxHp) * 100}%` }}
                        />
                    </div>
                    <div className="text-xs text-center mt-1 text-red-400 font-mono">{duel.playerHp}/{duel.playerMaxHp}</div>
                    
                    {/* Visual Damage Effect */}
                    {actionEffect?.target === 'player' && (
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/60 z-20 font-bold text-xl animate-bounce ${actionEffect.type === 'block' ? 'text-blue-400' : 'text-red-500'}`}>
                            {actionEffect.type === 'block' ? 'BLOK' : 'HASAR'}
                        </div>
                    )}
                </div>

                {/* VS Indicator */}
                <div className="flex flex-col items-center justify-center px-4">
                    <div className="text-2xl rpg-font text-amber-600 font-bold">VS</div>
                    <div className="text-stone-500 text-xs mt-1">Tur {duel.turn}</div>
                </div>

                {/* Enemy Stats */}
                <div className="flex-1 bg-stone-900 p-3 rounded-lg border border-red-900/30 shadow-lg relative overflow-hidden text-right">
                     <div className="flex flex-row-reverse items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border border-red-700">
                            <IconSkull size={20} className="text-red-500" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-red-200">{duel.enemyName}</div>
                            <div className="text-xs text-stone-500">Lv {duel.enemyLevel} Rakip</div>
                        </div>
                    </div>
                    <div className="h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                        <div 
                            className="h-full bg-gradient-to-l from-red-800 to-red-600 transition-all duration-500" 
                            style={{ width: `${(duel.enemyHp / duel.enemyMaxHp) * 100}%` }}
                        />
                    </div>
                    <div className="text-xs text-center mt-1 text-red-400 font-mono">{duel.enemyHp}/{duel.enemyMaxHp}</div>

                    {/* Visual Damage Effect */}
                    {actionEffect?.target === 'enemy' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 z-20 font-bold text-xl animate-ping text-red-500">
                            {actionEffect.type === 'crit' ? 'KRİTİK!' : 'İSABET!'}
                        </div>
                    )}
                </div>
            </div>

            {/* Combat Log */}
            <div className="bg-stone-950 border border-stone-800 rounded p-4 mb-6 text-center min-h-[60px] flex items-center justify-center font-mono text-sm text-stone-300">
                {duel.log}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => handleAction('quick')}
                    disabled={!duel.isPlayerTurn}
                    className={`p-4 rounded border-2 flex flex-col items-center gap-2 transition-all ${duel.isPlayerTurn ? 'bg-stone-900 border-stone-700 hover:border-emerald-500 cursor-pointer hover:bg-stone-800' : 'bg-stone-950 border-stone-800 opacity-50 cursor-not-allowed'}`}
                >
                   <IconCrossedSwords size={24} className="text-emerald-500" />
                   <span className="text-xs font-bold uppercase">Hızlı</span>
                </button>

                <button
                    onClick={() => handleAction('heavy')}
                    disabled={!duel.isPlayerTurn}
                    className={`p-4 rounded border-2 flex flex-col items-center gap-2 transition-all ${duel.isPlayerTurn ? 'bg-stone-900 border-stone-700 hover:border-red-500 cursor-pointer hover:bg-stone-800' : 'bg-stone-950 border-stone-800 opacity-50 cursor-not-allowed'}`}
                >
                   <IconSkull size={24} className="text-red-500" />
                   <span className="text-xs font-bold uppercase">Ağır</span>
                </button>

                <button
                    onClick={() => handleAction('defend')}
                    disabled={!duel.isPlayerTurn}
                    className={`p-4 rounded border-2 flex flex-col items-center gap-2 transition-all ${duel.isPlayerTurn ? 'bg-stone-900 border-stone-700 hover:border-blue-500 cursor-pointer hover:bg-stone-800' : 'bg-stone-950 border-stone-800 opacity-50 cursor-not-allowed'}`}
                >
                   <IconShield size={24} className="text-blue-500" />
                   <span className="text-xs font-bold uppercase">Defans</span>
                </button>
            </div>
        </div>
      );
  }

  return null;
};
