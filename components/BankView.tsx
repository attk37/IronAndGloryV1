
import React, { useState } from 'react';
import { Player } from '../types';
import { IconBank, IconCoin, IconGem } from './Icons';
import { CreditCard, Tag } from 'lucide-react';

interface BankViewProps {
  player: Player;
  onRedeemCode: (code: string) => void;
}

export const BankView: React.FC<BankViewProps> = ({ player, onRedeemCode }) => {
  const [promoCode, setPromoCode] = useState("");

  const handleRedeem = () => {
      if (promoCode.trim()) {
          onRedeemCode(promoCode.trim());
          setPromoCode("");
      }
  };

  const PACKAGES = [
      { name: "Çırak Kesesi", silver: 5000, gems: 50, price: "$4.99" },
      { name: "Savaşçı Sandığı", silver: 25000, gems: 300, price: "$19.99" },
      { name: "Kraliyet Hazinesi", silver: 100000, gems: 1500, price: "$99.99" },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="relative mb-8 p-6 rounded-xl border border-stone-800 overflow-hidden text-center bg-[#1c1917]">
            <h2 className="relative z-10 text-3xl rpg-font text-amber-500 mb-2 flex items-center justify-center gap-3">
                <IconBank size={32} /> Krallık Hazinesi
            </h2>
            <p className="relative z-10 text-stone-400 font-serif italic">
                "Servet güçtür, güç ise her şeydir."
            </p>
        </div>

        {/* Promo Code Section */}
        <div className="bg-stone-900 border border-amber-900/30 p-6 rounded-xl mb-8 flex flex-col md:flex-row gap-4 items-end shadow-lg">
            <div className="flex-1 w-full">
                <label className="text-xs text-stone-500 uppercase font-bold mb-2 flex items-center gap-2">
                    <Tag size={14} /> Promosyon Kodu
                </label>
                <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Kodunuzu buraya girin..."
                    className="w-full bg-stone-950 border border-stone-700 p-3 rounded text-stone-200 outline-none focus:border-amber-600 uppercase tracking-widest"
                />
            </div>
            <button 
                onClick={handleRedeem}
                disabled={!promoCode.trim()}
                className={`px-8 py-3 rounded font-bold uppercase tracking-wider text-sm transition-all h-[50px]
                    ${promoCode.trim() 
                        ? 'bg-amber-700 text-white hover:bg-amber-600 shadow-lg' 
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'}
                `}
            >
                Kullan
            </button>
        </div>

        {/* Packages Grid */}
        <h3 className="text-xl rpg-font text-stone-300 mb-4 border-b border-stone-800 pb-2">Altın Paketleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg, idx) => (
                <div key={idx} className="bg-[#151210] border border-stone-800 rounded-xl p-6 flex flex-col items-center hover:border-amber-700 transition-all hover:-translate-y-1 group">
                    <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center border-2 border-stone-700 mb-4 group-hover:border-amber-600 transition-colors shadow-xl">
                        <IconCoin size={32} className="text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-stone-200 mb-4">{pkg.name}</h4>
                    
                    <div className="space-y-2 mb-6 text-center w-full">
                        <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center justify-center gap-2">
                            <IconCoin size={16} className="text-slate-300" /> <span className="font-mono font-bold text-stone-300">{pkg.silver.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center justify-center gap-2">
                            <IconGem size={16} className="text-purple-500" /> <span className="font-mono font-bold text-purple-300">{pkg.gems.toLocaleString('tr-TR')}</span>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-stone-800 hover:bg-emerald-800 hover:text-white text-stone-400 font-bold rounded border border-stone-700 hover:border-emerald-600 transition-all uppercase text-sm flex items-center justify-center gap-2">
                        <CreditCard size={16} /> Satın Al {pkg.price}
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};
