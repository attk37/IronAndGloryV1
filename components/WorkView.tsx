
import React, { useState, useEffect } from 'react';
import { Player, Job, JobType } from '../types';
import { JOBS } from '../constants';
import { Clock, AlertTriangle, Play, CheckCircle2 } from 'lucide-react';
import { IconHammer, IconSkull, IconCoin, IconScroll, IconHeart, IconEnergy } from './Icons';

interface WorkViewProps {
  player: Player;
  activeJob: Job | null;
  jobEndTime: number | null;
  onStartJob: (job: Job) => void;
  playSfx?: (key: string) => void;
}

interface JobCardProps {
    job: Job;
    player: Player;
    onStartJob: (j: Job) => void;
    isWounded: boolean;
    isTutorialHighlight?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, player, onStartJob, isWounded, isTutorialHighlight }) => {
    const isCriminal = job.type === JobType.CRIMINAL;
    const baseColor = isCriminal ? 'red' : 'emerald';
    const borderColor = isCriminal ? 'border-red-900/50' : 'border-emerald-900/50';
    const hoverBorder = isCriminal ? 'group-hover:border-red-600' : 'group-hover:border-emerald-500';
    const bgGradient = isCriminal ? 'from-red-950/20 to-stone-950' : 'from-emerald-950/20 to-stone-950';

    const tutorialClass = isTutorialHighlight ? 'border-green-500 ring-4 ring-green-500/30 animate-pulse' : '';

    // Calculate Scaled Rewards for Display (Matching App.tsx Logic)
    const silverMultiplier = 1 + (player.level * 0.25);
    const xpMultiplier = 1 + (player.level * 0.05);
    const scaledSilver = Math.floor(job.silverReward * silverMultiplier);
    const scaledXp = Math.floor(job.xpReward * xpMultiplier);

    return (
        <div className={`group relative bg-[#151210] border-2 ${borderColor} ${hoverBorder} rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden ${tutorialClass}`}>
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg border bg-stone-900 ${isCriminal ? 'border-red-900 text-red-500' : 'border-emerald-900 text-emerald-500'}`}>
                            {isCriminal ? <IconSkull size={24} /> : <IconHammer size={24} />}
                        </div>
                        <div>
                            <h4 className={`font-bold text-lg rpg-font tracking-wide ${isCriminal ? 'text-red-200' : 'text-emerald-200'}`}>{job.name}</h4>
                            <span className="text-[10px] uppercase tracking-widest text-stone-500">{isCriminal ? 'Yasa Dışı' : 'Namuslu'} İş</span>
                        </div>
                    </div>
                    {/* Risk Badge */}
                    {job.risk > 0 && (
                        <div className="flex flex-col items-end" title="Yakalanma/Yaralanma Riski">
                            <span className={`text-xs font-bold ${job.risk > 30 ? 'text-red-500' : 'text-amber-500'} flex items-center gap-1`}>
                                <AlertTriangle size={12} /> %{job.risk} Risk
                            </span>
                            <div className="w-16 h-1.5 bg-stone-800 rounded-full mt-1 overflow-hidden">
                                <div className={`h-full ${job.risk > 30 ? 'bg-red-600' : 'bg-amber-600'}`} style={{ width: `${job.risk}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-stone-400 font-serif italic border-l-2 border-stone-800 pl-2 leading-relaxed">
                    "{job.description}"
                </p>

                {/* Rewards Grid */}
                <div className="grid grid-cols-3 gap-2 bg-black/20 p-2 rounded border border-stone-800/50">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-stone-500 uppercase">Kazanç</span>
                        <div className="text-slate-300 font-mono font-bold flex items-center gap-1">
                            +{scaledSilver.toLocaleString('tr-TR')} <IconCoin size={10} />
                        </div>
                    </div>
                    <div className="flex flex-col items-center border-l border-stone-800">
                        <span className="text-[10px] text-stone-500 uppercase">Tecrübe</span>
                        <div className="text-cyan-400 font-mono font-bold flex items-center gap-1">
                            +{scaledXp.toLocaleString('tr-TR')} <IconScroll size={10} />
                        </div>
                    </div>
                    <div className="flex flex-col items-center border-l border-stone-800">
                        <span className="text-[10px] text-stone-500 uppercase">Karma</span>
                        <div className={`font-mono font-bold flex items-center gap-1 ${job.karmaReward < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                            {job.karmaReward > 0 ? '+' : ''}{job.karmaReward}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between gap-3 mt-1">
                    <div className="text-xs text-stone-500 flex items-center gap-1">
                        <Clock size={14} /> {job.durationSeconds} sn
                    </div>
                    <button
                        onClick={() => onStartJob(job)}
                        disabled={isWounded}
                        className={`
                            flex-1 py-2 rounded font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all border
                            ${isWounded 
                                ? 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed' 
                                : isCriminal 
                                    ? 'bg-red-950/50 border-red-900 text-red-400 hover:bg-red-900 hover:text-white hover:border-red-500' 
                                    : 'bg-emerald-950/50 border-emerald-900 text-emerald-400 hover:bg-emerald-900 hover:text-white hover:border-emerald-500'
                            }
                        `}
                    >
                        {isWounded ? 'Yaralı' : <>Başla <Play size={10} className="fill-current" /></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const WorkView: React.FC<WorkViewProps> = ({ player, activeJob, jobEndTime, onStartJob, playSfx }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  // Sync visual timer with global endTime
  useEffect(() => {
    if (!activeJob || !jobEndTime) return;

    const interval = setInterval(() => {
        const secondsRemaining = Math.max(0, Math.ceil((jobEndTime - Date.now()) / 1000));
        setTimeLeft(secondsRemaining);
    }, 500);

    setTimeLeft(Math.max(0, Math.ceil((jobEndTime - Date.now()) / 1000)));

    return () => clearInterval(interval);
  }, [activeJob, jobEndTime]);

  const isWounded = player.hp <= 5;
  const honestJobs = JOBS.filter(j => j.type === JobType.HONEST);
  const criminalJobs = JOBS.filter(j => j.type === JobType.CRIMINAL);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      {/* Header Area */}
      <div className="relative mb-8 p-6 rounded-xl border border-stone-800 overflow-hidden text-center bg-[#1c1917]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
          <h2 className="relative z-10 text-3xl rpg-font text-amber-500 mb-2">Çalışma Alanı</h2>
          <p className="relative z-10 text-stone-400 font-serif italic text-sm md:text-base">
            "Kese boş kalmaz, ama nasıl dolacağı sana kalmış. <br/>Dürüst bir yaşam mı, yoksa gölgelerin yolu mu?"
          </p>
          
          {isWounded && !activeJob && (
            <div className="relative z-10 mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-950/40 border border-red-900 rounded-full text-red-400 text-sm font-bold animate-pulse">
                <IconHeart size={16} /> Yaraların çok ağır! Çalışmadan önce iyileşmelisin.
            </div>
          )}
      </div>

      {/* Active Job Panel */}
      {activeJob && (
        <div className="mb-10 mx-auto max-w-lg relative">
            <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-[#151210] border-2 border-amber-600 rounded-xl p-6 shadow-[0_0_30px_rgba(217,119,6,0.2)] flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center border-2 border-amber-600 mb-4 animate-[spin_10s_linear_infinite]">
                    <Clock size={32} className="text-amber-500" />
                </div>
                
                <h3 className="text-2xl font-bold text-amber-100 mb-1">{activeJob.name}</h3>
                <p className="text-amber-500/80 text-sm font-mono mb-6 uppercase tracking-widest">İşlem Sürüyor...</p>
                
                <div className="text-5xl font-mono text-white font-bold mb-6 drop-shadow-lg tabular-nums">
                    {timeLeft}<span className="text-xl text-stone-500 ml-1">sn</span>
                </div>

                <div className="w-full h-4 bg-stone-900 rounded-full overflow-hidden border border-stone-700 relative">
                    <div 
                        className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                        style={{ width: `${((activeJob.durationSeconds - timeLeft) / activeJob.durationSeconds) * 100}%` }}
                    />
                </div>
                <p className="mt-4 text-xs text-stone-500 animate-pulse flex items-center gap-2">
                    <IconEnergy size={12} /> Emeğin karşılığı hazırlanıyor...
                </p>
            </div>
        </div>
      )}

      {/* Jobs Grid */}
      {!activeJob && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Honest Jobs Section */}
              <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-stone-800 pb-2 mb-2">
                      <div className="p-2 bg-emerald-950/30 rounded border border-emerald-900 text-emerald-500">
                          <IconHammer size={20} />
                      </div>
                      <h3 className="text-xl rpg-font text-stone-200">Şehir Meydanı</h3>
                  </div>
                  <div className="grid gap-4">
                      {honestJobs.map((job, index) => (
                          <JobCard 
                            key={job.id} 
                            job={job} 
                            player={player} 
                            onStartJob={onStartJob} 
                            isWounded={isWounded} 
                            isTutorialHighlight={player.tutorialStep === 5 && index === 0} // Highlight first job if tutorial
                          />
                      ))}
                  </div>
              </div>

              {/* Criminal Jobs Section */}
              <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-stone-800 pb-2 mb-2">
                      <div className="p-2 bg-red-950/30 rounded border border-red-900 text-red-500">
                          <IconSkull size={20} />
                      </div>
                      <h3 className="text-xl rpg-font text-stone-200">Arka Sokaklar</h3>
                  </div>
                  <div className="grid gap-4">
                      {criminalJobs.map(job => (
                          <JobCard key={job.id} job={job} player={player} onStartJob={onStartJob} isWounded={isWounded} />
                      ))}
                  </div>
              </div>

          </div>
      )}
    </div>
  );
};
