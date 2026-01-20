
import React from 'react';
import { ActionReport } from '../types';
import { IconCoin, IconSkull, IconFlag, IconHammer, IconScroll } from './Icons';
import { Users, HeartPulse, CheckCircle2, XCircle } from 'lucide-react';

interface ActionReportModalProps {
    report: ActionReport;
    onClose: () => void;
}

export const ActionReportModal: React.FC<ActionReportModalProps> = ({ report, onClose }) => {
    const isSuccess = report.type === 'success';
    
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in zoom-in-95" onClick={onClose}>
            <div className={`w-full max-w-sm border-2 rounded-xl p-6 relative shadow-2xl text-center overflow-hidden bg-[#151210] ${isSuccess ? 'border-green-800' : report.type === 'neutral' ? 'border-stone-700' : 'border-red-800'}`} onClick={e => e.stopPropagation()}>
                
                {/* Header Icon */}
                <div className="flex justify-center mb-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl ${
                        isSuccess ? 'bg-green-950 border-green-600 text-green-500' : 
                        report.type === 'neutral' ? 'bg-stone-900 border-stone-600 text-stone-400' :
                        'bg-red-950 border-red-600 text-red-500'
                    }`}>
                        {report.title.includes('Yağma') ? <IconSkull size={40} /> : 
                         report.title.includes('Kurtar') ? <HeartPulse size={40} /> :
                         report.title.includes('Fetih') ? <IconFlag size={40} /> :
                         <CheckCircle2 size={40} />}
                    </div>
                </div>

                <h2 className={`text-2xl rpg-font mb-2 ${isSuccess ? 'text-green-500' : report.type === 'neutral' ? 'text-stone-300' : 'text-red-500'}`}>
                    {report.title}
                </h2>
                
                <p className="text-stone-400 text-sm mb-6 italic border-b border-stone-800 pb-4">
                    "{report.message}"
                </p>

                {/* Rewards Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {report.rewards.silver !== undefined && report.rewards.silver !== 0 && (
                        <div className="bg-stone-900 p-3 rounded border border-stone-800 flex items-center gap-3">
                            <IconCoin size={20} className="text-amber-500" />
                            <div className="text-left">
                                <div className="text-[10px] text-stone-500 uppercase font-bold">Gümüş</div>
                                <div className={`font-bold ${report.rewards.silver > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {report.rewards.silver > 0 ? '+' : ''}{report.rewards.silver}
                                </div>
                            </div>
                        </div>
                    )}
                    {report.rewards.supplies !== undefined && report.rewards.supplies !== 0 && (
                        <div className="bg-stone-900 p-3 rounded border border-stone-800 flex items-center gap-3">
                            <IconHammer size={20} className="text-amber-700" />
                            <div className="text-left">
                                <div className="text-[10px] text-stone-500 uppercase font-bold">Malzeme</div>
                                <div className={`font-bold ${report.rewards.supplies > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {report.rewards.supplies > 0 ? '+' : ''}{report.rewards.supplies}
                                </div>
                            </div>
                        </div>
                    )}
                    {report.rewards.population !== undefined && report.rewards.population !== 0 && (
                        <div className="bg-stone-900 p-3 rounded border border-stone-800 flex items-center gap-3">
                            <Users size={20} className="text-blue-400" />
                            <div className="text-left">
                                <div className="text-[10px] text-stone-500 uppercase font-bold">Nüfus</div>
                                <div className={`font-bold ${report.rewards.population > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {report.rewards.population > 0 ? '+' : ''}{report.rewards.population}
                                </div>
                            </div>
                        </div>
                    )}
                    {report.rewards.karma !== undefined && report.rewards.karma !== 0 && (
                        <div className="bg-stone-900 p-3 rounded border border-stone-800 flex items-center gap-3">
                            <IconScroll size={20} className="text-purple-400" />
                            <div className="text-left">
                                <div className="text-[10px] text-stone-500 uppercase font-bold">Karma</div>
                                <div className={`font-bold ${report.rewards.karma > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                    {report.rewards.karma > 0 ? '+' : ''}{report.rewards.karma}
                                </div>
                            </div>
                        </div>
                    )}
                     {report.rewards.army !== undefined && report.rewards.army !== 0 && (
                        <div className="bg-stone-900 p-3 rounded border border-stone-800 flex items-center gap-3 col-span-2">
                            <IconFlag size={20} className="text-stone-300" />
                            <div className="text-left">
                                <div className="text-[10px] text-stone-500 uppercase font-bold">Asker</div>
                                <div className={`font-bold ${report.rewards.army > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {report.rewards.army > 0 ? '+' : ''}{report.rewards.army}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={onClose} 
                    className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold border border-stone-600 rounded uppercase tracking-widest"
                >
                    Tamam
                </button>
            </div>
        </div>
    );
};
