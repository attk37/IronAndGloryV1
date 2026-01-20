
import React, { useState } from 'react';
import { Player } from '../types';
import { IconStats, IconSword, IconSkull, IconCoin, IconScroll } from './Icons';
import { Trophy, ShieldAlert, Target } from 'lucide-react';

interface StatisticsViewProps {
  player: Player;
}

const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
    <div className="bg-stone-900 border border-stone-800 rounded-lg p-5 flex items-center gap-4 hover:border-stone-600 transition-colors">
        <div className={`p-3 rounded-full bg-stone-950 border border-stone-800 ${color}`}>
            {icon}
        </div>
        <div>
            <div className="text-xs text-stone-500 uppercase font-bold tracking-widest">{label}</div>
            <div className="text-2xl font-mono font-bold text-stone-200">{value}</div>
        </div>
    </div>
);

export const StatisticsView: React.FC<StatisticsViewProps> = ({ player }) => {
  const winRate = player.records.totalBattles > 0 
    ? Math.round((player.records.battlesWon / player.records.totalBattles) * 100) 
    : 0;

  return (
    <div className="animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="relative mb-8 p-6 rounded-xl border border-stone-800 overflow-hidden text-center bg-[#1c1917]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
            <h2 className="relative z-10 text-3xl rpg-font text-amber-500 mb-2 flex items-center justify-center gap-3">
                <IconStats size={32} /> Savaş Kayıtları
            </h2>
            <p className="relative z-10 text-stone-400 font-serif italic">
                "Geçmişin yankıları, geleceğin zaferlerini şekillendirir."
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
                label="Toplam Savaş" 
                value={player.records.totalBattles} 
                icon={<IconSword size={24} />} 
                color="text-stone-400" 
            />
            <StatCard 
                label="Zafer Oranı" 
                value={`%${winRate}`} 
                icon={<Target size={24} />} 
                color="text-amber-500" 
            />
             <StatCard 
                label="Tamamlanan Görev" 
                value={player.records.questsCompleted} 
                icon={<ShieldAlert size={24} />} 
                color="text-emerald-500" 
            />
            <StatCard 
                label="Toplam Zafer" 
                value={player.records.battlesWon} 
                icon={<Trophy size={24} />} 
                color="text-yellow-500" 
            />
            <StatCard 
                label="Toplam Yenilgi" 
                value={player.records.battlesLost} 
                icon={<IconSkull size={24} />} 
                color="text-red-500" 
            />
            <StatCard 
                label="Arena Düelloları" 
                value={`${player.records.duelsWon} G - ${player.records.duelsLost} M`} 
                icon={<IconSword size={24} />} 
                color="text-purple-500" 
            />
            <StatCard 
                label="Kazanılan Gümüş" 
                value={player.records.totalSilverEarned.toLocaleString()} 
                icon={<IconCoin size={24} />} 
                color="text-slate-300" 
            />
            <StatCard 
                label="Kazanılan Tecrübe" 
                value={player.records.totalXpEarned.toLocaleString()} 
                icon={<IconScroll size={24} />} 
                color="text-cyan-400" 
            />
        </div>
    </div>
  );
};
