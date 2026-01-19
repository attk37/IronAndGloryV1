
import React, { useState } from 'react';
import { Item, Player, Rarity, ItemType } from '../types';
import { POTIONS, RUNES, UPGRADE_RATES } from '../constants';
import { IconSword, IconShield, IconArmor, IconHelmet, IconRelic, IconBag, IconRefresh, IconGem, IconHammer, IconScroll, IconCoin, IconEnergy, IconHeart, IconPaw, IconBoot, IconFire, IconIce, IconShock, IconPoison } from './Icons';
import { Hammer, FlaskConical, Gem, ArrowRight, Flame, Skull, Zap, CheckCircle2 } from 'lucide-react';

interface ShopViewProps {
  player: Player;
  shopInventory: Item[];
  onBuyItem: (item: Item) => void;
  onRefreshShop: () => void;
  onUpgradeItem: (item: Item, cost: number) => void;
  onSocketRune?: (targetItem: Item, rune: Item) => void;
  playSfx?: (key: string) => void;
}

const RarityColor = {
  [Rarity.COMMON]: 'text-stone-400',
  [Rarity.RARE]: 'text-cyan-400',
  [Rarity.EPIC]: 'text-purple-400',
  [Rarity.LEGENDARY]: 'text-amber-500',
};

const RarityBorder = {
  [Rarity.COMMON]: 'border-stone-700',
  [Rarity.RARE]: 'border-cyan-900',
  [Rarity.EPIC]: 'border-purple-900',
  [Rarity.LEGENDARY]: 'border-amber-700',
};

const ItemIcon = ({ type, rarity, size = 48 }: { type: string, rarity: Rarity, size?: number }) => {
  const className = `${RarityColor[rarity]} drop-shadow-md`;
  switch (type) {
    case 'weapon': return <IconSword size={size} className={className} />;
    case 'armor': return <IconArmor size={size} className={className} />;
    case 'helmet': return <IconHelmet size={size} className={className} />;
    case 'shield': return <IconShield size={size} className={className} />;
    case 'leggings': return <IconBoot size={size} className={className} />;
    case 'mount': return <IconPaw size={size} className={className} />;
    case 'artifact': return <IconRelic size={size} className={className} />;
    case 'potion': return <FlaskConical size={size} className={className} />;
    case 'rune': return <Gem size={size} className={className} />;
    default: return <IconBag size={size} className={className} />;
  }
};

type ShopTab = 'weapon' | 'armor' | 'artifact' | 'potion' | 'blacksmith' | 'rune' | 'mount';

export const ShopView: React.FC<ShopViewProps> = ({ player, shopInventory, onBuyItem, onRefreshShop, onUpgradeItem, onSocketRune, playSfx }) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('weapon');
  const [selectedUpgradeItem, setSelectedUpgradeItem] = useState<Item | null>(null);
  const [selectedRuneToSocket, setSelectedRuneToSocket] = useState<Item | null>(null);

  // Filter inventory based on active tab
  const getVisibleItems = () => {
      if (activeTab === 'weapon') return shopInventory.filter(i => i.type === 'weapon');
      if (activeTab === 'armor') return shopInventory.filter(i => ['armor', 'helmet', 'shield', 'leggings'].includes(i.type));
      if (activeTab === 'artifact') return shopInventory.filter(i => i.type === 'artifact');
      if (activeTab === 'mount') return shopInventory.filter(i => i.type === 'mount');
      if (activeTab === 'potion') return POTIONS; // Static list
      if (activeTab === 'rune') return RUNES; // Static list
      return [];
  };

  const getUpgradeCost = (item: Item) => {
      // Base cost + (Level * BaseCost) + Rarity Multiplier roughly
      const base = item.cost * 0.5;
      const levelMult = (item.upgradeLevel || 0) + 1;
      return Math.floor(base * levelMult);
  }

  const handleTabChange = (tab: ShopTab) => {
      setActiveTab(tab);
      if(playSfx) playSfx('ui_click');
  }

  const renderItemCard = (item: Item, isBlacksmith = false) => {
    const costSilver = isBlacksmith ? getUpgradeCost(item) : item.cost;
    const canAffordSilver = player.silver >= costSilver;
    // Fix: If blacksmith, gem cost is irrelevant (or 0), so assume afford logic for gems passes or check explicitly if upgrade costs gems
    const canAffordGems = isBlacksmith ? true : player.gems >= (item.costGems || 0);
    const canAfford = canAffordSilver && canAffordGems;
    
    // Ownership check for buying (not for consumables or blacksmith)
    const isOwned = !isBlacksmith && item.type !== 'potion' && item.type !== 'rune' && (
                    player.inventory.some(i => i.id === item.id) || 
                    Object.values(player.equipment).some((eq: any) => eq?.id === item.id));

    // Determine current level for visual
    const currentLevel = item.upgradeLevel || 0;
    const isMaxLevel = isBlacksmith && currentLevel >= 9;

    return (
      <div 
        key={item.id + (isBlacksmith ? '_up' : '')} 
        className={`bg-stone-900 p-4 rounded-xl border-2 ${RarityBorder[item.rarity]} flex flex-col gap-3 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
      >
        {isOwned && (
          <div className="absolute top-2 right-2 bg-emerald-900/90 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-700 z-10 uppercase tracking-wider">
            Sahipsin
          </div>
        )}
        
        <div className="flex justify-center py-6 bg-stone-950/50 rounded-lg border-inner border-stone-800 relative">
          <ItemIcon type={item.type} rarity={item.rarity} />
          {item.upgradeLevel ? (
              <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow">
                  +{item.upgradeLevel}
              </div>
          ) : null}
          
          {/* Element Badge */}
          {item.element && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded border border-stone-700 backdrop-blur-sm">
                  {item.element === 'fire' && <IconFire size={12} className="text-red-500" />}
                  {item.element === 'ice' && <IconIce size={12} className="text-blue-400" />}
                  {item.element === 'shock' && <IconShock size={12} className="text-yellow-400" />}
                  {item.element === 'poison' && <IconPoison size={12} className="text-green-500" />}
                  <span className="text-[10px] font-bold text-stone-200">+{item.elementValue}</span>
              </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
             <h3 className={`font-bold text-base md:text-lg leading-tight ${RarityColor[item.rarity]}`}>{item.name}</h3>
             <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 rounded border ${RarityColor[item.rarity]} ${RarityBorder[item.rarity]} bg-black/40`}>
                 {item.rarity}
             </span>
          </div>
          
          <p className="text-xs text-stone-500 mb-3 italic leading-relaxed line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-2 text-sm text-stone-300 bg-stone-950/50 p-2 rounded">
            <span className="bg-stone-800 px-1.5 rounded text-xs capitalize text-stone-400">
                {item.type === 'weapon' ? 'Silah' : 
                 item.type === 'armor' ? 'Zırh' :
                 item.type === 'helmet' ? 'Miğfer' : 
                 item.type === 'leggings' ? 'Tozluk' : 
                 item.type === 'mount' ? 'Binek' : 
                 item.type === 'artifact' ? 'Tılsım' : 
                 item.type === 'potion' ? 'İksir' : 
                 item.type === 'rune' ? 'Rune' : 'Kalkan'}
            </span>
            <span className="text-green-500 font-bold text-xs md:text-sm">
                {item.type === 'potion' ? `+${item.bonus} Etki` : `+${item.bonus}`}
            </span>
          </div>
        </div>

        <button
          onClick={() => isBlacksmith ? setSelectedUpgradeItem(item) : onBuyItem(item)}
          disabled={!canAfford || (isOwned && !isBlacksmith) || isMaxLevel}
          className={`
            w-full py-3 rounded font-bold text-sm transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-1
            ${(isOwned && !isBlacksmith)
              ? 'bg-stone-800 text-stone-600 cursor-default border border-stone-700' 
              : isMaxLevel
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                : canAfford 
                    ? isBlacksmith ? 'bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-700' : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600' 
                    : 'bg-stone-800 text-stone-600 opacity-50 cursor-not-allowed border border-stone-700'}
          `}
        >
          {isOwned && !isBlacksmith ? (
              'Satın Alındı'
          ) : isMaxLevel ? (
              'Maksimum'
          ) : (
              <>
                <span>{isBlacksmith ? 'İşle' : 'Satın Al'}</span>
                {!isMaxLevel && (
                    <div className="flex items-center gap-2 text-xs opacity-80">
                        <span className="flex items-center gap-1"><IconCoin size={10}/> {costSilver}</span>
                        {item.costGems ? <span className="text-purple-300 flex items-center gap-1"><IconGem size={10} /> {item.costGems}</span> : null}
                    </div>
                )}
              </>
          )}
        </button>
      </div>
    );
  };

  // Logic to gather upgradeable items from player
  const getUpgradeableItems = () => {
      const items = [
          ...Object.values(player.equipment).filter(Boolean),
          ...player.inventory.filter(i => ['weapon','armor','helmet','shield','leggings','mount','artifact'].includes(i.type))
      ] as Item[];
      
      const uniqueItems = Array.from(new Map(items.map(item => [item.id, item])).values());
      return uniqueItems;
  }

  // --- ANVIL MODAL ---
  const renderAnvilModal = () => {
      if (!selectedUpgradeItem) return null;

      const currentLevel = selectedUpgradeItem.upgradeLevel || 0;
      const nextLevel = currentLevel + 1;
      const cost = getUpgradeCost(selectedUpgradeItem);
      const successRate = UPGRADE_RATES[nextLevel] || 0;
      const isRisky = successRate < 100;
      const nextBonus = Math.max(selectedUpgradeItem.bonus + 1, Math.floor(selectedUpgradeItem.bonus * 1.2)); // Show accurate preview

      // Inventory Runes
      const availableRunes = player.inventory.filter(i => i.type === 'rune');

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setSelectedUpgradeItem(null)}>
              <div className="w-full max-w-md bg-[#151210] border-2 border-stone-600 rounded-xl p-6 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  
                  {/* Close Btn */}
                  <button onClick={() => setSelectedUpgradeItem(null)} className="absolute top-4 right-4 text-stone-500 hover:text-white">✕</button>

                  <div className="text-center mb-6">
                      <h2 className="text-3xl rpg-font text-stone-200">Demirci</h2>
                      <p className="text-stone-500 text-sm">"Şansın yaver gitsin, yoksa külleri kalır."</p>
                  </div>

                  {/* --- SECTION 1: UPGRADE --- */}
                  <div className="mb-8 border-b border-stone-800 pb-6">
                      <div className="flex items-center gap-2 mb-4 text-amber-500 font-bold uppercase tracking-widest text-xs">
                          <IconHammer size={16} /> Eşya Geliştirme
                      </div>

                      {/* Transformation Visual */}
                      <div className="flex items-center justify-center gap-4 mb-4">
                          {/* Current */}
                          <div className="flex flex-col items-center gap-2 opacity-60">
                              <div className={`w-16 h-16 rounded border-2 ${RarityBorder[selectedUpgradeItem.rarity]} bg-stone-900 flex items-center justify-center`}>
                                  <ItemIcon type={selectedUpgradeItem.type} rarity={selectedUpgradeItem.rarity} size={32} />
                              </div>
                              <div className="text-xs text-stone-400 font-bold">+{currentLevel}</div>
                              <div className="text-xs text-stone-500">{selectedUpgradeItem.bonus} Stat</div>
                          </div>

                          <ArrowRight className="text-amber-600 animate-pulse" />

                          {/* Next */}
                          <div className="flex flex-col items-center gap-2 scale-110">
                              <div className={`w-20 h-20 rounded border-2 ${RarityBorder[selectedUpgradeItem.rarity]} bg-stone-900 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]`}>
                                  <ItemIcon type={selectedUpgradeItem.type} rarity={selectedUpgradeItem.rarity} size={40} />
                                  <div className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">+{nextLevel}</div>
                              </div>
                              <div className="text-sm text-amber-500 font-bold">+{nextLevel}</div>
                              <div className="text-sm text-green-500 font-bold">{nextBonus} Stat</div>
                          </div>
                      </div>

                      {/* Stats & Risk */}
                      <div className="bg-stone-950 p-4 rounded border border-stone-800 mb-4 space-y-2">
                          <div className="flex justify-between items-center">
                              <span className="text-stone-400 text-xs uppercase font-bold">Başarı Şansı</span>
                              <span className={`font-mono font-bold text-lg ${successRate >= 80 ? 'text-green-500' : successRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                  %{successRate}
                              </span>
                          </div>
                          
                          {isRisky && (
                              <div className="flex items-center gap-2 text-red-400 text-xs border-t border-stone-800 pt-2 animate-pulse">
                                  <Flame size={14} />
                                  <span>Dikkat: Başarısız olursa eşya <strong>YANAR (Yok Olur)</strong>!</span>
                              </div>
                          )}

                          <div className="flex justify-between items-center border-t border-stone-800 pt-2">
                              <span className="text-stone-400 text-xs uppercase font-bold">İşlem Ücreti</span>
                              <span className={`font-mono font-bold flex items-center gap-1 ${player.silver >= cost ? 'text-amber-400' : 'text-red-500'}`}>
                                  <IconCoin size={14} /> {cost}
                              </span>
                          </div>
                      </div>

                      {/* Actions */}
                      <button 
                          onClick={() => {
                              onUpgradeItem(selectedUpgradeItem, cost);
                              setSelectedUpgradeItem(null); // Close modal
                          }}
                          disabled={player.silver < cost}
                          className={`
                              w-full py-4 rounded font-bold uppercase tracking-[0.2em] text-lg transition-all flex items-center justify-center gap-2
                              ${player.silver >= cost 
                                  ? 'bg-gradient-to-r from-amber-900 to-red-900 hover:from-amber-800 hover:to-red-800 text-white border border-amber-700 shadow-lg' 
                                  : 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'}
                          `}
                      >
                          {player.silver >= cost ? (
                              <><IconHammer size={20} /> Bas (Yükselt)</>
                          ) : (
                              "Yetersiz Gümüş"
                          )}
                      </button>
                  </div>

                  {/* --- SECTION 2: RUNE SOCKETING --- */}
                  <div className="mb-2">
                      <div className="flex items-center gap-2 mb-4 text-purple-400 font-bold uppercase tracking-widest text-xs">
                          <Gem size={16} /> Rune İşçiliği
                      </div>

                      <div className="bg-stone-950 p-4 rounded border border-stone-800">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-black rounded-full border border-stone-700 flex items-center justify-center shrink-0">
                                  {selectedUpgradeItem.socketedRune ? (
                                      <Gem size={24} className="text-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
                                  ) : (
                                      <div className="w-4 h-4 bg-stone-800 rounded-full"></div>
                                  )}
                              </div>
                              <div>
                                  <h4 className="text-stone-300 font-bold text-sm">
                                      {selectedUpgradeItem.socketedRune ? selectedUpgradeItem.socketedRune.name : "Boş Rune Yuvası"}
                                  </h4>
                                  <p className="text-xs text-stone-500">
                                      {selectedUpgradeItem.socketedRune 
                                          ? `Etki: +${selectedUpgradeItem.socketedRune.bonus} ${selectedUpgradeItem.socketedRune.element ? selectedUpgradeItem.socketedRune.element : 'Stat'}`
                                          : "Rune ekleyerek eşyaya ekstra güç kazandır."}
                                  </p>
                              </div>
                          </div>

                          {!selectedUpgradeItem.socketedRune ? (
                              <>
                                  <div className="text-xs text-stone-500 mb-2 uppercase font-bold">Çantandaki Runeler:</div>
                                  {availableRunes.length > 0 ? (
                                      <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                                          {availableRunes.map(rune => (
                                              <button 
                                                  key={rune.id} 
                                                  onClick={() => {setSelectedRuneToSocket(rune); if(playSfx) playSfx('ui_click');}}
                                                  className={`p-2 border rounded bg-stone-900 flex items-center justify-center transition-all ${selectedRuneToSocket?.id === rune.id ? 'border-purple-500 bg-purple-900/20' : 'border-stone-700 hover:border-stone-500'}`}
                                                  title={rune.description}
                                              >
                                                  <Gem size={20} className="text-purple-400" />
                                              </button>
                                          ))}
                                      </div>
                                  ) : (
                                      <div className="text-stone-600 text-xs italic text-center py-2">Çantanda hiç rune yok.</div>
                                  )}

                                  <button 
                                      onClick={() => {
                                          if (onSocketRune && selectedRuneToSocket) {
                                              onSocketRune(selectedUpgradeItem, selectedRuneToSocket);
                                              setSelectedUpgradeItem(null);
                                              setSelectedRuneToSocket(null);
                                          }
                                      }}
                                      disabled={!selectedRuneToSocket}
                                      className={`w-full mt-4 py-3 rounded font-bold uppercase text-xs tracking-wider transition-all
                                          ${selectedRuneToSocket 
                                              ? 'bg-purple-900 hover:bg-purple-800 text-purple-100 border border-purple-700' 
                                              : 'bg-stone-900 text-stone-600 cursor-not-allowed border border-stone-800'}
                                      `}
                                  >
                                      {selectedRuneToSocket ? `Rune Ekle (${selectedRuneToSocket.name})` : "Rune Seçin"}
                                  </button>
                              </>
                          ) : (
                              <div className="text-center py-2 text-green-500 text-xs font-bold bg-green-900/10 rounded border border-green-900/30">
                                  <CheckCircle2 size={14} className="inline mr-1" /> Rune Takılı
                              </div>
                          )}
                      </div>
                  </div>

              </div>
          </div>
      )
  }

  return (
    <div className="animate-in zoom-in-95 duration-500 pb-20">
      
      {renderAnvilModal()}

      {/* MARKET HEADER */}
      <div className="relative mb-8 p-6 rounded-xl border border-stone-800 overflow-hidden text-center bg-[#1c1917]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
          <h2 className="relative z-10 text-3xl rpg-font text-amber-500 mb-2">Pazar Meydanı</h2>
          <div className="relative z-10 flex justify-center gap-6 text-sm text-stone-400">
             <div className="flex items-center gap-2 bg-stone-950/50 px-4 py-1 rounded-full border border-stone-800">
                 <IconCoin size={14} className="text-amber-500" /> {player.silver} Gümüş
             </div>
             <div className="flex items-center gap-2 bg-stone-950/50 px-4 py-1 rounded-full border border-stone-800">
                 <IconGem size={14} className="text-purple-500" /> {player.gems} Mücevher
             </div>
          </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {[
              { id: 'weapon', label: 'Silahçı', icon: IconSword },
              { id: 'armor', label: 'Zırhçı', icon: IconArmor },
              { id: 'mount', label: 'Ahır', icon: IconPaw },
              { id: 'artifact', label: 'Artefakt', icon: IconRelic },
              { id: 'potion', label: 'Simyacı', icon: FlaskConical },
              { id: 'rune', label: 'Rune Ustası', icon: Gem },
              { id: 'blacksmith', label: 'Demirci', icon: Hammer },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as ShopTab)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-lg border transition-all font-bold text-xs md:text-sm uppercase tracking-wide
                    ${activeTab === tab.id 
                        ? 'bg-amber-950 border-amber-600 text-amber-500 shadow-lg scale-105' 
                        : 'bg-stone-900 border-stone-800 text-stone-500 hover:bg-stone-800 hover:text-stone-300'}
                `}
              >
                  <tab.icon size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="hidden md:inline">{tab.label}</span>
              </button>
          ))}
      </div>

      {/* CONTENT AREA */}
      <div>
          {/* Refresh Button for Standard Merchants */}
          {['weapon', 'armor', 'artifact', 'mount'].includes(activeTab) && (
             <div className="flex justify-end mb-4">
                 <button 
                    onClick={onRefreshShop}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-900/50 bg-stone-950 hover:bg-purple-900/20 text-purple-300 font-bold transition-all text-xs"
                 >
                    <IconRefresh size={14} />
                    <span>Malları Yenile (2 <IconGem size={10} className="inline"/>)</span>
                 </button>
             </div>
          )}

          {/* Blacksmith UI */}
          {activeTab === 'blacksmith' ? (
              <div className="bg-[#151210] p-6 rounded-xl border border-stone-800">
                  <div className="text-center mb-8">
                      <IconHammer size={48} className="mx-auto text-amber-600 mb-2" />
                      <h3 className="text-xl font-bold text-stone-300">Demirci Atölyesi</h3>
                      <p className="text-stone-500 italic text-sm">"Eşyalarını güçlendir veya büyülü runelerle donat."</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getUpgradeableItems().map(item => renderItemCard(item, true))}
                      {getUpgradeableItems().length === 0 && (
                          <div className="col-span-full text-center text-stone-500 py-10 border-2 border-dashed border-stone-800 rounded">
                              <p className="mb-2">Yükseltilecek veya rune takılacak eşyan yok.</p>
                              <p className="text-xs">Çantanda silah veya zırh bulundurmalısın.</p>
                          </div>
                      )}
                  </div>
              </div>
          ) : (
              /* Other Shops UI */
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {getVisibleItems().map(item => renderItemCard(item))}
                  {getVisibleItems().length === 0 && (
                      <div className="col-span-full text-center py-20 text-stone-600 border-2 border-dashed border-stone-800 rounded-xl bg-stone-900/30">
                        <IconBag size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Bu tüccarın şu an satacak bir şeyi yok.</p>
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};
