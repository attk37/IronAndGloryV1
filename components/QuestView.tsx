
import React, { useState, useEffect } from 'react';
import { Quest, Player, QuestDifficulty, Region, QuestAlignment, Enemy } from '../types';
import { REGIONS } from '../constants';
import { IconMap, IconSkull, IconSword, IconCoin, IconScroll, EnemyAvatar, RegionAvatar, IconShield, IconHeart } from './Icons';
import { ChevronRight, ChevronLeft, HeartPulse, Lock, AlertTriangle, Swords, Crown, Skull, Map as MapIcon, Shield, Star, Navigation, Flame } from 'lucide-react';

interface QuestViewProps {
  player: Player;
  onStartQuest: (quest: Quest) => void;
  playSfx?: (key: string) => void;
}

// Fallback generator if a specific difficulty is missing in data
const getFallbackQuest = (region: Region, difficulty: QuestDifficulty): Quest => {
    const base = region.quests[0].enemyTemplate;
    let mult = 1;
    if (difficulty === QuestDifficulty.NORMAL) mult = 1.5;
    if (difficulty === QuestDifficulty.HARD) mult = 2.5;
    
    return {
        id: `fallback_${region.id}_${difficulty}`,
        name: `${difficulty} Keşif`,
        description: "Bu bölgede standart bir devriye görevi.",
        difficulty: difficulty,
        alignment: QuestAlignment.GOOD,
        energyCost: difficulty === QuestDifficulty.EASY ? 2 : difficulty === QuestDifficulty.NORMAL ? 4 : 6,
        karmaReward: 0,
        enemyTemplate: {
            ...base,
            name: `${base.name} (${difficulty})`,
            hp: Math.floor(base.hp * mult),
            damage: Math.floor(base.damage * mult),
            xpReward: Math.floor(base.xpReward * mult),
            silverReward: Math.floor(base.silverReward * mult)
        }
    };
};

// Story Boss Card Component
const BossCard = ({ region, player, onStart, isLocked }: { region: Region, player: Player, onStart: (q: Quest) => void, isLocked: boolean }) => {
    // The boss is explicitly the last quest in the region list
    const bossQuest = region.quests[region.quests.length - 1];
    const canAfford = player.energy >= bossQuest.energyCost;
    const isWounded = player.hp <= 10;

    return (
        <div className="relative w-full bg-[#1a0f0f] border-2 border-red-900/50 rounded-xl overflow-hidden mb-8 group hover:border-red-600 transition-all duration-500 shadow-2xl">
            {/* Background Art */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <RegionAvatar type={region.imageUrl} size={400} className="w-full h-full object-cover opacity-50 text-red-900" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Boss Info */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-red-800 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] overflow-hidden">
                            <EnemyAvatar type={bossQuest.enemyTemplate.imgUrl} />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-red-900 text-red-100 text-[10px] font-bold px-3 py-1 rounded-full border border-red-700 uppercase tracking-widest whitespace-nowrap">
                             Bölge Patronu
                        </div>
                    </div>
                    <div>
                        <div className="text-red-500 font-bold tracking-[0.3em] text-xs uppercase mb-1">Ana Hikaye Görevi</div>
                        <h2 className="text-3xl rpg-font text-stone-100 mb-2">{bossQuest.name}</h2>
                        <p className="text-stone-400 text-sm max-w-md italic mb-4">"{bossQuest.description}"</p>
                        
                        <div className="flex items-center gap-4 text-xs font-mono">
                            <div className="flex items-center gap-1 text-red-400">
                                <IconSkull size={14} /> Sv. {bossQuest.enemyTemplate.level} {bossQuest.enemyTemplate.name}
                            </div>
                            <div className="flex items-center gap-1 text-stone-500">
                                <Shield size={14} /> Zırh: {bossQuest.enemyTemplate.defense}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="flex flex-col items-end gap-3 min-w-[150px]">
                    <div className="flex items-center gap-4 bg-black/40 px-3 py-2 rounded border border-white/5">
                         <div className="text-slate-300 font-bold flex items-center gap-1"><IconCoin size={14}/> {bossQuest.enemyTemplate.silverReward.toLocaleString('tr-TR')}</div>
                         <div className="text-cyan-500 font-bold flex items-center gap-1"><IconScroll size={14}/> {bossQuest.enemyTemplate.xpReward.toLocaleString('tr-TR')}</div>
                    </div>

                    <button
                        onClick={() => onStart(bossQuest)}
                        disabled={isLocked || !canAfford || isWounded}
                        className={`
                            px-8 py-3 rounded border-2 font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2
                            ${isLocked 
                                ? 'bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed' 
                                : isWounded
                                    ? 'bg-red-950/20 border-red-900 text-red-500 cursor-not-allowed'
                                    : !canAfford
                                        ? 'bg-stone-800 border-stone-600 text-stone-400'
                                        : 'bg-red-900 hover:bg-red-800 border-red-700 text-white hover:scale-105 hover:shadow-red-900/40'}
                        `}
                    >
                        {isLocked ? <Lock size={16}/> : isWounded ? <HeartPulse size={16}/> : <Swords size={16}/>}
                        {isLocked ? 'Kilitli' : isWounded ? 'Yaralısın' : !canAfford ? `${bossQuest.energyCost} Enerji` : 'Savaş'}
                    </button>
                    {isLocked && <span className="text-[10px] text-stone-500">Önceki bölgeyi tamamla.</span>}
                </div>
            </div>
        </div>
    );
}

// Compact Horizontal Epic Quest Card
const EpicMissionCard = ({ quest, player, onStart }: { quest: Quest, player: Player, onStart: (q: Quest) => void }) => {
    const canAfford = player.energy >= quest.energyCost;
    const isWounded = player.hp <= 5;
    
    // Calculate Win Chance Estimate
    const levelDiff = player.level - quest.enemyTemplate.level;
    let chance = 30; // Epic Base Chance
    chance = Math.min(100, Math.max(10, chance + (levelDiff * 5)));

    return (
        <div className="relative w-full bg-[#150a15] border-2 border-purple-900/50 rounded-xl overflow-hidden group hover:border-purple-600 transition-all duration-300 shadow-lg hover:shadow-purple-900/20">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-5">
                
                {/* Visual */}
                <div className="shrink-0 relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-purple-500 bg-stone-900 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                         <EnemyAvatar type={quest.enemyTemplate.imgUrl} />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-900 text-purple-100 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-700 uppercase tracking-widest whitespace-nowrap shadow-md">
                        Destansı
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left min-w-0">
                    <h3 className="text-lg font-bold text-purple-100 mb-1 truncate">{quest.name}</h3>
                    <p className="text-xs text-stone-400 italic mb-3 line-clamp-1">{quest.description}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs">
                        <div className="flex items-center gap-1 text-stone-400 bg-black/40 px-2 py-1 rounded border border-stone-800/50">
                            <IconSkull size={12} className="text-purple-500"/> <span>Lv.{quest.enemyTemplate.level} {quest.enemyTemplate.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-stone-400 bg-black/40 px-2 py-1 rounded border border-stone-800/50">
                            <span className="text-stone-500 font-bold">Şans</span>
                            <span className={`font-mono font-bold ${chance < 50 ? 'text-red-400' : 'text-green-400'}`}>%{chance}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center md:items-end gap-3 min-w-[120px]">
                    <div className="flex items-center justify-end gap-3 text-xs w-full bg-black/20 p-1.5 rounded-lg border border-white/5">
                         <div className="text-slate-300 font-bold flex items-center gap-1" title="Gümüş"><IconCoin size={12}/> {quest.enemyTemplate.silverReward.toLocaleString('tr-TR')}</div>
                         <div className="w-px h-3 bg-stone-700"></div>
                         <div className="text-cyan-500 font-bold flex items-center gap-1" title="Tecrübe"><IconScroll size={12}/> {quest.enemyTemplate.xpReward.toLocaleString('tr-TR')}</div>
                    </div>

                    <button
                        onClick={() => onStart(quest)}
                        disabled={!canAfford || isWounded}
                        className={`
                            w-full px-4 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-all border flex items-center justify-center gap-2
                            ${isWounded 
                                ? 'bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed'
                                : !canAfford
                                    ? 'bg-stone-800 border-stone-700 text-stone-500'
                                    : 'bg-purple-900 hover:bg-purple-800 text-purple-100 border-purple-700 hover:shadow-lg'}
                        `}
                    >
                        {isWounded ? 'Yaralısın' : !canAfford ? `${quest.energyCost} Enerji` : <>Savaş <Swords size={14}/></>}
                    </button>
                </div>

            </div>
        </div>
    )
}

// 3-Tier Mission Card
const MissionCard = ({ quest, player, onStart, isTutorialHighlight }: { quest: Quest, player: Player, onStart: (q: Quest) => void, isTutorialHighlight?: boolean }) => {
    const isHard = quest.difficulty === QuestDifficulty.HARD;
    const isNormal = quest.difficulty === QuestDifficulty.NORMAL;
    
    const canAfford = player.energy >= quest.energyCost;
    const isWounded = player.hp <= 5;
    
    // Calculate Win Chance Estimate
    const levelDiff = player.level - quest.enemyTemplate.level;
    let chance = 95;
    if (isHard) chance = 50;
    else if (isNormal) chance = 75;
    
    chance = Math.min(100, Math.max(10, chance + (levelDiff * 5)));

    let riskColor = 'text-green-500';
    if (chance < 50) riskColor = 'text-red-500';
    else if (chance < 80) riskColor = 'text-amber-500';

    const cardBorder = isTutorialHighlight 
        ? 'border-green-500 ring-2 ring-green-500/50' 
        : isHard ? 'border-amber-900/30 hover:border-amber-700' : isNormal ? 'border-stone-800 hover:border-stone-600' : 'border-emerald-900/30 hover:border-emerald-700';

    return (
        <div className={`
            relative flex flex-col justify-between h-full bg-[#151210] border-2 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group overflow-hidden
            ${cardBorder}
        `}>
             {/* Background Pattern */}
             <div className={`absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
                ${isHard ? 'from-amber-900/10' : isNormal ? 'from-stone-800/10' : 'from-emerald-900/10'} to-transparent
             `} />

             <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 
                            ${isHard ? 'text-amber-600' : isNormal ? 'text-stone-500' : 'text-emerald-600'}`}>
                            {isHard ? 'Zorlu Görev' : isNormal ? 'Normal Görev' : 'Kolay Görev'}
                        </span>
                        <h3 className="text-lg font-bold text-stone-200 leading-tight">{quest.name}</h3>
                    </div>
                    <div className={`p-2 rounded-lg border bg-stone-950 
                        ${isHard ? 'border-amber-900 text-amber-500' : isNormal ? 'border-stone-800 text-stone-500' : 'border-emerald-900 text-emerald-500'}`}>
                        {isHard ? <IconSkull size={20} /> : isNormal ? <Swords size={20} /> : <Shield size={20} />}
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-stone-500 italic mb-6 min-h-[40px]">{quest.description}</p>
                
                {/* Enemy Preview */}
                <div className="bg-black/30 rounded p-3 border border-white/5 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-stone-900 flex items-center justify-center border border-stone-700">
                             <EnemyAvatar type={quest.enemyTemplate.imgUrl} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-stone-300">{quest.enemyTemplate.name}</div>
                            <div className="text-xs text-stone-600">Sv. {quest.enemyTemplate.level}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-stone-500 uppercase">Şans</div>
                        <div className={`font-bold text-sm ${riskColor}`}>~%{chance}</div>
                    </div>
                </div>
             </div>

             {/* Footer: Rewards & Button */}
             <div>
                 <div className="flex justify-between items-center mb-4 text-sm font-mono text-stone-400">
                     <div className="flex items-center gap-1.5" title="Gümüş Ödülü">
                         <IconCoin size={14} className="text-slate-300" /> 
                         <span>{quest.enemyTemplate.silverReward.toLocaleString('tr-TR')}</span>
                     </div>
                     <div className="flex items-center gap-1.5" title="XP Ödülü">
                         <IconScroll size={14} className="text-cyan-500" /> 
                         <span>{quest.enemyTemplate.xpReward.toLocaleString('tr-TR')}</span>
                     </div>
                 </div>

                 <button
                    onClick={() => onStart(quest)}
                    disabled={!canAfford || isWounded}
                    className={`
                        w-full py-3 rounded font-bold text-xs uppercase tracking-widest transition-all border
                        ${isWounded 
                            ? 'bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed'
                            : !canAfford 
                                ? 'bg-stone-800 border-stone-700 text-stone-500'
                                : isTutorialHighlight
                                    ? 'bg-green-700 text-white border-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                                    : isHard 
                                        ? 'bg-amber-900 hover:bg-amber-800 text-white border-amber-700' 
                                        : isNormal
                                            ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-600'
                                            : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border-emerald-700'}
                    `}
                >
                    {isWounded ? 'Yaralısın' : !canAfford ? `${quest.energyCost} Enerji` : 'Görevi Al'}
                </button>
             </div>
        </div>
    )
}

export const QuestView: React.FC<QuestViewProps> = ({ player, onStartQuest, playSfx }) => {
  const [currentRegionIndex, setCurrentRegionIndex] = useState(0);

  // Auto-select highest unlocked region on mount
  useEffect(() => {
      const highestUnlockedIndex = REGIONS.reduce((acc, r, idx) => {
          return player.level >= r.minLevel ? idx : acc;
      }, 0);
      setCurrentRegionIndex(highestUnlockedIndex);
  }, []);

  const selectedRegion = REGIONS[currentRegionIndex];
  const isLocked = player.level < selectedRegion.minLevel;
  const isLast = currentRegionIndex === REGIONS.length - 1;
  const isFirst = currentRegionIndex === 0;

  const handleNextRegion = () => {
      if (!isLast) {
          setCurrentRegionIndex(prev => prev + 1);
          if (playSfx) playSfx('ui_click');
      }
  };

  const handlePrevRegion = () => {
      if (!isFirst) {
          setCurrentRegionIndex(prev => prev - 1);
          if (playSfx) playSfx('ui_click');
      }
  };

  // Find specific quests for the slots. We expect data to be present, but use fallback if not.
  const easyQuest = selectedRegion.quests.find(q => q.difficulty === QuestDifficulty.EASY) || getFallbackQuest(selectedRegion, QuestDifficulty.EASY);
  const normalQuest = selectedRegion.quests.find(q => q.difficulty === QuestDifficulty.NORMAL) || getFallbackQuest(selectedRegion, QuestDifficulty.NORMAL);
  const hardQuest = selectedRegion.quests.find(q => q.difficulty === QuestDifficulty.HARD) || getFallbackQuest(selectedRegion, QuestDifficulty.HARD);
  
  // Extra Epic Quest for Region 5+ (Index 4+)
  const hasEpicSlot = currentRegionIndex >= 4; 
  // Epic quest is any quest marked EPIC that IS NOT the last quest (the boss)
  const bossQuestId = selectedRegion.quests[selectedRegion.quests.length - 1].id;
  const epicQuest = selectedRegion.quests.find(q => q.difficulty === QuestDifficulty.EPIC && q.id !== bossQuestId);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
        
        {/* REGION NAVIGATION HEADER */}
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden border-2 border-stone-800 shadow-2xl mb-8 group">
            {/* Background Image */}
            <div className="absolute inset-0">
                <RegionAvatar type={selectedRegion.imageUrl} size={800} className={`w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000 ${isLocked ? 'grayscale' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
            </div>

            {/* Navigation Controls */}
            <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 z-20">
                <button 
                    onClick={handlePrevRegion}
                    disabled={isFirst}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center backdrop-blur-md transition-all
                        ${isFirst 
                            ? 'border-stone-800 text-stone-700 cursor-not-allowed opacity-50' 
                            : 'border-stone-600 text-stone-300 hover:bg-white/10 hover:border-amber-500 hover:text-white'}
                    `}
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="text-center">
                    <div className="text-amber-500 font-bold tracking-[0.3em] text-xs uppercase mb-2 drop-shadow-md">Keşif Bölgesi {currentRegionIndex + 1}/{REGIONS.length}</div>
                    <h1 className="text-4xl md:text-6xl rpg-font text-stone-100 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                        {selectedRegion.name}
                    </h1>
                    {isLocked && (
                        <div className="flex items-center justify-center gap-2 mt-2 text-red-500 font-bold bg-black/60 px-4 py-1 rounded-full border border-red-900/50 backdrop-blur-sm mx-auto w-max">
                            <Lock size={14} /> Gereken Seviye: {selectedRegion.minLevel}
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleNextRegion}
                    disabled={isLast}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center backdrop-blur-md transition-all
                        ${isLast 
                            ? 'border-stone-800 text-stone-700 cursor-not-allowed opacity-50' 
                            : 'border-stone-600 text-stone-300 hover:bg-white/10 hover:border-amber-500 hover:text-white'}
                    `}
                >
                    <ChevronRight size={24} />
                </button>
            </div>
            
            {/* Description at bottom */}
            <div className="absolute bottom-6 left-0 right-0 text-center z-20 px-4">
                <p className="text-stone-400 text-sm md:text-base italic max-w-2xl mx-auto">
                    "{selectedRegion.description}"
                </p>
            </div>
        </div>

        {/* LOCKED STATE */}
        {isLocked ? (
            <div className="flex flex-col items-center justify-center py-20 bg-stone-900/30 border-2 border-dashed border-red-900/30 rounded-xl text-center animate-in zoom-in-95">
                <div className="w-24 h-24 bg-stone-950 rounded-full flex items-center justify-center border-4 border-red-900/50 mb-6 shadow-[0_0_50px_rgba(185,28,28,0.2)]">
                    <Lock size={48} className="text-red-600" />
                </div>
                <h3 className="text-3xl font-bold text-stone-300 mb-2 rpg-font">Bölge Kilitli</h3>
                <p className="text-stone-500 mb-8 max-w-md">
                    Bu diyarların tehlikelerine göğüs germek için yeterince tecrübeli değilsin.
                </p>
                <div className="px-8 py-3 bg-red-950/20 border border-red-900 rounded text-red-400 font-bold font-mono">
                    Gereken Seviye: {selectedRegion.minLevel}
                </div>
            </div>
        ) : (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
                {/* 1. Main Story Boss Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-700 to-transparent"></span>
                        <div className="flex items-center gap-2 text-stone-400 font-bold uppercase tracking-widest text-sm">
                            <Crown size={18} className="text-red-600" /> Bölge Lideri
                        </div>
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-700 to-transparent"></span>
                    </div>
                    <BossCard region={selectedRegion} player={player} onStart={onStartQuest} isLocked={isLocked} />
                </div>

                {/* 2. Three Mission Choices */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-700 to-transparent"></span>
                        <div className="flex items-center gap-2 text-stone-400 font-bold uppercase tracking-widest text-sm">
                            <Swords size={18} className="text-amber-600" /> Saha Görevleri
                        </div>
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-700 to-transparent"></span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MissionCard 
                            quest={easyQuest} 
                            player={player} 
                            onStart={onStartQuest} 
                            isTutorialHighlight={player.tutorialStep === 3} // Highlight if tutorial step is 3
                        />
                        <MissionCard quest={normalQuest} player={player} onStart={onStartQuest} />
                        <MissionCard quest={hardQuest} player={player} onStart={onStartQuest} />
                    </div>
                </div>

                {/* 3. Epic Quest (Region 5+ / Level 20+) */}
                {hasEpicSlot && epicQuest && (
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-900 to-transparent"></span>
                            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                                <Flame size={18} /> Destansı Baskın
                            </div>
                            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-900 to-transparent"></span>
                        </div>
                        <div className="max-w-2xl mx-auto">
                            <EpicMissionCard quest={epicQuest} player={player} onStart={onStartQuest} />
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  )
}
