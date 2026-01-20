
import React, { useState } from 'react';
import { Player } from '../types';
import { IconGem, IconCoin, IconExchange } from './Icons';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

interface ExchangeViewProps {
  player: Player;
  onExchange: (gems: number) => void;
  currentRate: number; // Dynamic Rate passed from App
}

export const ExchangeView: React.FC<ExchangeViewProps> = ({ player, onExchange, currentRate }) => {
  const [amount, setAmount] = useState<number>(1);
  const AVERAGE_RATE = 235; // (74+397)/2 approx

  const handleExchange = () => {
      if (amount > 0 && player.gems >= amount) {
          onExchange(amount);
          setAmount(1);
      }
  };

  const setMax = () => {
      setAmount(player.gems);
  }

  const isRateHigh = currentRate > AVERAGE_RATE;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500 max-w-xl mx-auto">
        <div className="w-full bg-[#1c1917] border border-stone-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-amber-900/10 blur-3xl rounded-full pointer-events-none"></div>

             <div className="text-center mb-8">
                 <IconExchange size={48} className="mx-auto text-amber-500 mb-4" />
                 <h2 className="text-3xl rpg-font text-stone-200 mb-2">Karaborsa Takasçısı</h2>
                 <p className="text-stone-500 text-sm italic">"Kurlar dalgalanır, ama gümüşün sesi hep aynıdır."</p>
             </div>

             {/* Rate Display */}
             <div className="flex justify-center mb-6">
                 <div className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 ${isRateHigh ? 'bg-green-950/30 border-green-800 text-green-400' : 'bg-red-950/30 border-red-800 text-red-400'}`}>
                     <div className="flex flex-col items-center leading-none">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Güncel Kur</span>
                         <span className="text-2xl font-mono font-bold">{currentRate}</span>
                     </div>
                     <div className="h-8 w-px bg-stone-700 mx-2"></div>
                     {isRateHigh ? (
                         <div className="flex items-center gap-1 text-xs font-bold uppercase"><TrendingUp size={16} /> Yüksek</div>
                     ) : (
                         <div className="flex items-center gap-1 text-xs font-bold uppercase"><TrendingDown size={16} /> Düşük</div>
                     )}
                 </div>
             </div>

             <div className="bg-stone-900/50 p-6 rounded-lg border border-stone-800 mb-8 flex items-center justify-between gap-4">
                 <div className="text-center flex-1">
                     <div className="text-stone-500 text-xs uppercase font-bold mb-1">Verilen</div>
                     <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-2">
                        <IconGem size={24} /> {amount}
                     </div>
                 </div>
                 <ArrowRight className="text-stone-600" />
                 <div className="text-center flex-1">
                     <div className="text-stone-500 text-xs uppercase font-bold mb-1">Alınan</div>
                     <div className="text-2xl font-bold text-slate-300 flex items-center justify-center gap-2">
                        <IconCoin size={24} /> {Math.floor(amount * currentRate).toLocaleString('tr-TR')}
                     </div>
                 </div>
             </div>

             <div className="space-y-4">
                 <div>
                     <label className="text-xs text-stone-500 uppercase font-bold mb-2 block">Mücevher Miktarı</label>
                     <div className="flex gap-2">
                         <input 
                            type="number" 
                            min="1" 
                            max={player.gems}
                            value={amount}
                            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                            className="flex-1 bg-stone-950 border border-stone-700 p-3 rounded text-stone-200 outline-none focus:border-amber-700 font-mono text-lg"
                         />
                         <button 
                            onClick={setMax}
                            className="px-4 py-2 bg-stone-800 border border-stone-700 text-stone-400 font-bold rounded hover:bg-stone-700 hover:text-stone-200 uppercase text-xs"
                         >
                            Tümü
                         </button>
                     </div>
                     <div className="text-right mt-1 text-xs text-stone-500">
                         Mevcut: <span className="text-purple-400 font-bold">{player.gems}</span>
                     </div>
                 </div>

                 <button
                    onClick={handleExchange}
                    disabled={amount <= 0 || player.gems < amount}
                    className={`w-full py-4 rounded font-bold text-lg uppercase tracking-widest transition-all
                        ${amount > 0 && player.gems >= amount 
                            ? 'bg-amber-900 text-amber-100 hover:bg-amber-800 border border-amber-700 shadow-lg' 
                            : 'bg-stone-800 text-stone-600 border border-stone-700 cursor-not-allowed'}
                    `}
                 >
                    Takas Et
                 </button>
             </div>
        </div>
    </div>
  );
};
