
import React from 'react';
import { Player, Property } from '../types';
import { PROPERTIES } from '../constants';
import { IconCoin, IconPropertyHome, IconPropertyCastle, IconPropertyFarm, IconPropertyShop, IconPropertyWheat } from './Icons';
import { Coins, TrendingUp } from 'lucide-react';

interface PropertyViewProps {
  player: Player;
  onBuyProperty: (property: Property, cost: number) => void;
}

// Map imgUrl to Icon Component
const getPropertyIcon = (imgUrl: string, size: number = 24) => {
    switch(imgUrl) {
        case 'prop_stall': return <IconPropertyShop size={size} className="text-amber-600" />;
        case 'prop_home': return <IconPropertyHome size={size} className="text-emerald-600" />;
        case 'prop_wheat': return <IconPropertyWheat size={size} className="text-yellow-600" />;
        case 'prop_shop': return <IconPropertyShop size={size} className="text-purple-600" />;
        case 'prop_farm': return <IconPropertyFarm size={size} className="text-green-700" />;
        case 'prop_castle': return <IconPropertyCastle size={size} className="text-red-700" />;
        default: return <IconPropertyHome size={size} />;
    }
}

export const PropertyView: React.FC<PropertyViewProps> = ({ player, onBuyProperty }) => {
  
  // Calculate total passive income
  const totalIncome = PROPERTIES.reduce((acc, prop) => {
      const count = player.properties[prop.id] || 0;
      return acc + (count * prop.incomePerSecond);
  }, 0);

  const calculateCost = (baseCost: number, count: number) => {
      // Cost scaling: Base * (1.15 ^ Count)
      return Math.floor(baseCost * Math.pow(1.15, count));
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      {/* Header Stats */}
      <div className="bg-[#1c1917] border border-amber-900/30 p-6 rounded-xl mb-8 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-4 z-10 mb-4 md:mb-0">
              <div className="bg-stone-900 p-4 rounded-full border border-stone-700 shadow-inner">
                  <TrendingUp size={32} className="text-green-500" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-stone-200">Mülk Gelirleri</h2>
                  <p className="text-stone-500 text-sm">Yatırımların senin için çalışsın.</p>
              </div>
          </div>

          <div className="z-10 flex flex-col items-end">
              <div className="text-xs text-stone-500 uppercase font-bold tracking-widest mb-1">Toplam Pasif Gelir</div>
              <div className="text-4xl font-mono font-bold text-green-400 flex items-center gap-2 drop-shadow-md">
                  +{totalIncome.toLocaleString('tr-TR')} <span className="text-sm text-stone-600">/sn</span>
              </div>
          </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROPERTIES.map(prop => {
              const ownedCount = player.properties[prop.id] || 0;
              const currentCost = calculateCost(prop.baseCost, ownedCount);
              const canAfford = player.silver >= currentCost;

              return (
                  <div key={prop.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5 hover:border-amber-700/50 transition-all duration-300 relative group overflow-hidden">
                      {/* Background Icon Watermark */}
                      <div className="absolute -right-4 -bottom-4 opacity-5 transform scale-150 rotate-12 group-hover:scale-125 transition-transform duration-500">
                          {getPropertyIcon(prop.imgUrl, 100)}
                      </div>

                      <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="flex items-center gap-3">
                              <div className="p-3 bg-stone-950 rounded-lg border border-stone-700 shadow-sm">
                                  {getPropertyIcon(prop.imgUrl, 28)}
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-stone-200">{prop.name}</h3>
                                  <div className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-stone-950 inline-block text-stone-500 font-bold">
                                      {prop.category}
                                  </div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-2xl font-bold text-stone-700 group-hover:text-stone-500 transition-colors">x{ownedCount}</div>
                          </div>
                      </div>

                      <p className="text-xs text-stone-500 mb-4 italic h-8 line-clamp-2">
                          {prop.description}
                      </p>

                      <div className="flex items-center justify-between bg-stone-950/50 p-3 rounded-lg mb-4 border border-stone-800">
                          <div className="flex flex-col">
                              <span className="text-[10px] text-stone-600 uppercase font-bold">Gelir</span>
                              <span className="text-green-500 font-mono font-bold">+{prop.incomePerSecond}/sn</span>
                          </div>
                          <div className="flex flex-col items-end">
                              <span className="text-[10px] text-stone-600 uppercase font-bold">Toplam</span>
                              <span className="text-stone-300 font-mono font-bold">+{(ownedCount * prop.incomePerSecond).toLocaleString('tr-TR')}/sn</span>
                          </div>
                      </div>

                      <button
                          onClick={() => onBuyProperty(prop, currentCost)}
                          disabled={!canAfford}
                          className={`w-full py-3 rounded font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 relative z-10 border
                              ${canAfford 
                                  ? 'bg-amber-900 border-amber-700 text-white hover:bg-amber-800 shadow-[0_0_15px_rgba(180,83,9,0.3)] hover:scale-[1.02]' 
                                  : 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed opacity-70'}
                          `}
                      >
                          <span>Satın Al</span>
                          <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded">
                              <IconCoin size={12} className={canAfford ? 'text-slate-300' : 'text-stone-500'} />
                              <span>{currentCost.toLocaleString('tr-TR')}</span>
                          </div>
                      </button>
                  </div>
              );
          })}
      </div>
    </div>
  );
};
