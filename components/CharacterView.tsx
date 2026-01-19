
import React, { useState } from 'react';
import { Player, Item } from '../types';
import { STAT_UPGRADE_BASE_COST, INVENTORY_PAGE_SIZE } from '../constants';
import { calculatePlayerDamage, calculatePlayerDefense, calculatePlayerElementalDamage, calculatePlayerElementalResistance } from '../services/gameLogic';
import { IconSword, IconShield, IconEnergy, IconHeart, IconArmor, IconHelmet, IconRelic, IconCoin, IconGem, IconAvatarHuman, IconAvatarOrc, IconAvatarElf, IconAvatarVampire, IconBoot, IconPaw, IconFire, IconIce, IconShock, IconPoison } from './Icons';
import { X, Activity, Clover, FlaskConical, Gem, Lock, Unlock, Shield, ArrowUp, Skull, Zap } from 'lucide-react';

interface CharacterViewProps {
  player: Player;
  onUpgradeStat: (stat: keyof Player['stats']) => void;
  onEquip: (item: Item) => void;
  onUnequip: (slot: keyof Player['equipment']) => void;
  onSell: (item: Item) => void;
  onUse?: (item: Item) => void;
  onExpandInventory?: (cost: number) => void;
  playSfx?: (key: string) => void;
}

// Stat Row Component
const StatRow = ({ label, value, bonusValue = 0, canUpgrade, onUpgrade, cost, icon: Icon }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-stone-800 hover:bg-white/5 transition-colors group px-2">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded flex items-center justify-center bg-stone-950 border border-stone-700 text-stone-400 group-hover:text-amber-500 group-hover:border-amber-700 transition-colors">
          <Icon size={14} />
      </div>
      <span className="text-xs uppercase font-bold tracking-wide text-stone-400 group-hover:text-stone-200">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
          <span className="font-mono font-bold text-stone-200 text-sm block leading-none">{value}</span>
          {bonusValue > 0 && <span className="text-[10px] text-green-500 font-bold">+{bonusValue}</span>}
      </div>
      <button
        onClick={onUpgrade}
        disabled={!canUpgrade}
        className={`h-7 px-3 flex items-center gap-1.5 rounded border transition-all ${
          canUpgrade 
          ? 'bg-amber-950/40 border-amber-800 text-amber-500 hover:bg-amber-900 hover:text-white' 
          : 'bg-stone-950 border-stone-800 text-stone-700 cursor-not-allowed'
        }`}
      >
        <span className="text-[10px] font-bold font-mono">{cost}</span>
        <ArrowUp size={12} />
      </button>
    </div>
  </div>
);

// Elemental Stat Component
const ElementalStat = ({ icon: Icon, label, value, res, color }: any) => (
    <div className="flex flex-col items-center bg-stone-950/50 p-2 rounded border border-stone-800/50">
        <Icon size={16} className={`${color} mb-1`} />
        <span className="text-[9px] text-stone-500 uppercase font-bold mb-1">{label}</span>
        <div className="flex gap-2 text-xs font-mono">
            <div title="Hasar" className={`font-bold ${value > 0 ? color : 'text-stone-600'}`}>
                {value > 0 ? value : '-'}
            </div>
            <div className="w-px h-3 bg-stone-800"></div>
            <div title="Direnç" className={`font-bold ${res > 0 ? 'text-stone-300' : 'text-stone-600'}`}>
                {res > 0 ? `%${res}` : '-'}
            </div>
        </div>
    </div>
);

// Equipment Slot Component
const EquipmentSlot = ({ item, type, icon: Icon, onClick, slotName }: { item: Item | null, type: string, icon: any, onClick: () => void, slotName?: string }) => (
  <div onClick={onClick} className="relative group cursor-pointer w-[50px] h-[50px] md:w-[60px] md:h-[60px]">
      {/* Background Placeholder */}
      <div className={`absolute inset-0 bg-[#0c0a09] border-2 rounded-lg flex items-center justify-center transition-all duration-300 shadow-inner
        ${item 
            ? item.rarity === 'Efsanevi' ? 'border-amber-600/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
            : item.rarity === 'Destansı' ? 'border-purple-600/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
            : item.rarity === 'Nadir' ? 'border-cyan-600/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            : 'border-stone-500/60'
            : 'border-[#292524] group-hover:border-stone-600'
        }`}>
        {!item && <Icon size={20} className="text-stone-800 opacity-50" />}
      </div>
      
      {/* Item Icon */}
      {item && (
         <div className="absolute inset-0 flex items-center justify-center z-10">
             <Icon size={28} className="text-stone-200 drop-shadow-md filter brightness-110 md:scale-110" />
         </div>
      )}

      {/* Upgrade Level Badge */}
      {item?.upgradeLevel ? (
          <div className="absolute -top-1 -right-1 z-20 bg-amber-700 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow border border-amber-600">
              +{item.upgradeLevel}
          </div>
      ) : null}

      {/* Socket Indicator */}
      {item && ['weapon', 'armor', 'helmet', 'shield', 'leggings'].includes(item.type) && (
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#0c0a09] border border-stone-700 rounded-full flex items-center justify-center shadow-lg z-20">
                {item.socketedRune ? (
                    <Gem size={8} className="text-purple-400" />
                ) : (
                    <div className="w-1 h-1 bg-stone-800 rounded-full"></div>
                )}
            </div>
      )}

      {/* Tooltip */}
      <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black/95 border border-stone-700 p-2 rounded text-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
         <div className={`text-xs font-bold ${item ? (item.rarity === 'Efsanevi' ? 'text-amber-500' : item.rarity === 'Destansı' ? 'text-purple-400' : item.rarity === 'Nadir' ? 'text-cyan-400' : 'text-stone-300') : 'text-stone-500'}`}>
             {item ? item.name : type}
         </div>
         {item && <div className="text-[10px] text-green-400 mt-1">+{item.bonus} Etki</div>}
      </div>
  </div>
);

export const CharacterView: React.FC<CharacterViewProps> = ({ player, onUpgradeStat, onEquip, onUnequip, onSell, onUse, onExpandInventory, playSfx }) => {
  const [selectedItem, setSelectedItem] = useState<{ item: Item, source: 'inventory' | 'equipment', slot?: keyof Player['equipment'] } | null>(null);
  const [inventoryPage, setInventoryPage] = useState(0); 
  
  const weaponBonus = player.equipment.weapon?.bonus || 0;
  const avgDamage = calculatePlayerDamage(player);
  const armorRating = calculatePlayerDefense(player);
  const elemDmg = calculatePlayerElementalDamage(player);
  const elemRes = calculatePlayerElementalResistance(player);

  const handleSelectItem = (data: { item: Item, source: 'inventory' | 'equipment', slot?: keyof Player['equipment'] }) => {
      setSelectedItem(data);
      if(playSfx) playSfx('ui_click');
  }

  const getStatCost = (val: number) => Math.floor(STAT_UPGRADE_BASE_COST + (val * val * 0.5));
  const calculateSlotCost = (slotIndex: number) => 200 + (slotIndex * 50);

  const renderAvatar = () => {
      const race = player.race;
      const props = { size: 180, className: "text-stone-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-125" };
      if (race === 'Ork') return <IconAvatarOrc {...props} />;
      if (race === 'Elf') return <IconAvatarElf {...props} />;
      if (race === 'Vampir') return <IconAvatarVampire {...props} />;
      return <IconAvatarHuman {...props} />;
  }

  const getItemIcon = (item: Item) => {
      if (item.type === 'potion') return FlaskConical;
      if (item.type === 'rune') return Gem;
      if (item.type === 'weapon') return IconSword;
      if (item.type === 'armor') return IconArmor;
      if (item.type === 'helmet') return IconHelmet;
      if (item.type === 'shield') return IconShield;
      if (item.type === 'leggings') return IconBoot;
      if (item.type === 'mount') return IconPaw;
      if (item.type === 'artifact') return IconRelic;
      return IconGem;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 pb-20 lg:pb-0 max-w-7xl mx-auto items-start">
      
      {/* ITEM MODAL */}
      {selectedItem && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setSelectedItem(null)}>
              <div className="bg-[#151210] border-2 border-stone-600 p-6 max-w-sm w-full relative shadow-2xl rounded-xl" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-stone-500 hover:text-white"><X size={24}/></button>
                  
                  <div className="flex flex-col items-center mb-6">
                      <div className={`p-6 bg-black/50 border-2 mb-4 rounded-xl shadow-[inset_0_0_30px_rgba(0,0,0,1)] ${selectedItem.item.rarity === 'Efsanevi' ? 'border-amber-700' : 'border-stone-700'}`}>
                         {React.createElement(getItemIcon(selectedItem.item), { size: 64, className: selectedItem.item.rarity === 'Efsanevi' ? 'text-amber-500' : 'text-stone-300' })}
                      </div>
                      <h3 className="text-2xl rpg-font text-amber-500 text-center">{selectedItem.item.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                           <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-stone-900 border border-stone-700 text-stone-400">{selectedItem.item.type}</span>
                           <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-stone-900 border ${
                               selectedItem.item.rarity === 'Efsanevi' ? 'border-amber-900 text-amber-500' : 
                               selectedItem.item.rarity === 'Destansı' ? 'border-purple-900 text-purple-400' : 
                               'border-stone-800 text-stone-400'
                           }`}>{selectedItem.item.rarity}</span>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="bg-stone-900 p-3 rounded text-center">
                           <div className="text-[10px] text-stone-500 uppercase font-bold">Bonus</div>
                           <div className="text-green-500 font-bold text-xl font-mono">+{selectedItem.item.bonus}</div>
                       </div>
                       <div className="bg-stone-900 p-3 rounded text-center">
                           <div className="text-[10px] text-stone-500 uppercase font-bold">Değer</div>
                           <div className="text-amber-500 font-bold text-xl font-mono">{selectedItem.item.cost}</div>
                       </div>
                  </div>

                  <p className="text-stone-400 text-sm mb-6 text-center italic border-t border-b border-stone-800 py-3">"{selectedItem.item.description}"</p>

                  <div className="flex gap-2">
                      {selectedItem.source === 'inventory' ? (
                          <>
                            {selectedItem.item.type === 'potion' ? (
                                <button onClick={() => { onUse && onUse(selectedItem.item); setSelectedItem(null); }} className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 py-3 font-bold rounded border border-emerald-700 uppercase text-xs tracking-wider">Kullan</button>
                            ) : selectedItem.item.type === 'rune' ? (
                                <button disabled className="flex-1 bg-stone-800 text-stone-600 py-3 font-bold rounded border border-stone-700 uppercase text-xs tracking-wider cursor-not-allowed">Demircide</button>
                            ) : (
                                <button onClick={() => { onEquip(selectedItem.item); setSelectedItem(null); }} className="flex-1 bg-amber-900 hover:bg-amber-800 text-amber-100 py-3 font-bold rounded border border-amber-700 uppercase text-xs tracking-wider">Kuşan</button>
                            )}
                            <button onClick={() => { onSell(selectedItem.item); setSelectedItem(null); }} className="flex-1 bg-stone-900 hover:bg-red-900/50 text-stone-400 hover:text-red-200 py-3 font-bold rounded border border-stone-700 hover:border-red-800 uppercase text-xs tracking-wider">Sat</button>
                          </>
                      ) : (
                          <button onClick={() => { if(selectedItem.slot) onUnequip(selectedItem.slot); setSelectedItem(null); }} className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 py-3 font-bold rounded border border-stone-600 uppercase text-xs tracking-wider">Çıkar</button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* LEFT COLUMN: PAPERDOLL (CHARACTER) */}
      <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-[#151210] border-2 border-stone-800 rounded-xl p-0 overflow-hidden shadow-2xl relative h-[500px] md:h-[560px] mx-auto lg:mx-0 max-w-md">
              
              {/* Name Plate */}
              <div className="absolute top-0 inset-x-0 p-4 text-center z-20 bg-gradient-to-b from-black/80 to-transparent">
                  <h2 className="text-2xl rpg-font text-stone-100 drop-shadow-md">{player.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-[9px] bg-amber-950/80 text-amber-500 px-2 py-0.5 rounded border border-amber-900 font-bold uppercase">{player.rank}</span>
                      <span className="text-[9px] bg-stone-900/80 text-stone-400 px-2 py-0.5 rounded border border-stone-700 font-bold uppercase">{player.race}</span>
                  </div>
              </div>

              {/* Avatar Canvas */}
              <div className="absolute inset-0 top-12 bottom-12 flex items-center justify-center z-10 pointer-events-none">
                  <div className="relative">
                       {/* Aura/Glow based on level */}
                       <div className="absolute inset-0 bg-amber-500/5 blur-[50px] rounded-full"></div>
                       {renderAvatar()}
                  </div>
              </div>

              {/* EQUIPMENT SLOTS - Strategically Placed */}
              
              {/* Left Side */}
              <div className="absolute left-2 top-20 flex flex-col gap-2 md:gap-3 z-30 md:left-3">
                  <EquipmentSlot item={player.equipment.helmet} type="Miğfer" icon={IconHelmet} onClick={() => player.equipment.helmet ? handleSelectItem({item: player.equipment.helmet, source: 'equipment', slot: 'helmet'}) : null} />
                  <EquipmentSlot item={player.equipment.armor} type="Zırh" icon={IconArmor} onClick={() => player.equipment.armor ? handleSelectItem({item: player.equipment.armor, source: 'equipment', slot: 'armor'}) : null} />
                  <EquipmentSlot item={player.equipment.leggings} type="Tozluk" icon={IconBoot} onClick={() => player.equipment.leggings ? handleSelectItem({item: player.equipment.leggings, source: 'equipment', slot: 'leggings'}) : null} />
              </div>

              {/* Right Side */}
              <div className="absolute right-2 top-20 flex flex-col gap-2 md:gap-3 z-30 md:right-3">
                  <EquipmentSlot item={player.equipment.artifact1} type="Tılsım" icon={IconRelic} onClick={() => player.equipment.artifact1 ? handleSelectItem({item: player.equipment.artifact1, source: 'equipment', slot: 'artifact1'}) : null} />
                  <EquipmentSlot item={player.equipment.shield} type="Kalkan" icon={IconShield} onClick={() => player.equipment.shield ? handleSelectItem({item: player.equipment.shield, source: 'equipment', slot: 'shield'}) : null} />
                  <EquipmentSlot item={player.equipment.weapon} type="Silah" icon={IconSword} onClick={() => player.equipment.weapon ? handleSelectItem({item: player.equipment.weapon, source: 'equipment', slot: 'weapon'}) : null} />
              </div>

              {/* Bottom Row */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-12 md:gap-16 z-30">
                  <div className="translate-y-[-10px]">
                     <EquipmentSlot item={player.equipment.mount} type="Binek" icon={IconPaw} onClick={() => player.equipment.mount ? handleSelectItem({item: player.equipment.mount, source: 'equipment', slot: 'mount'}) : null} />
                  </div>
                  <div className="translate-y-[-10px]">
                     <EquipmentSlot item={player.equipment.artifact2} type="Tılsım" icon={IconRelic} onClick={() => player.equipment.artifact2 ? handleSelectItem({item: player.equipment.artifact2, source: 'equipment', slot: 'artifact2'}) : null} />
                  </div>
              </div>

              {/* Decorative Background Image */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
              </div>
          </div>
      </div>

      {/* RIGHT COLUMN: STATS & INVENTORY */}
      <div className="flex-1 flex flex-col gap-4 w-full">
          
          {/* STATS PANEL */}
          <div className="bg-[#151210] border border-stone-800 rounded-xl p-4 md:p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Skull size={100}/></div>

              <div className="flex items-center gap-3 border-b border-stone-800 pb-3 mb-3">
                  <Activity size={18} className="text-amber-600" />
                  <h3 className="rpg-font text-lg text-stone-200">Özellikler</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                  <div className="space-y-1">
                       <StatRow label="Güç" value={player.stats.strength} bonusValue={weaponBonus} cost={getStatCost(player.stats.strength)} canUpgrade={player.silver >= getStatCost(player.stats.strength)} onUpgrade={() => onUpgradeStat('strength')} icon={IconSword} />
                       <StatRow label="Bünye" value={player.stats.constitution} cost={getStatCost(player.stats.constitution)} canUpgrade={player.silver >= getStatCost(player.stats.constitution)} onUpgrade={() => onUpgradeStat('constitution')} icon={IconHeart} />
                       <StatRow label="Silah Sanatı" value={player.stats.weaponArt} cost={getStatCost(player.stats.weaponArt)} canUpgrade={player.silver >= getStatCost(player.stats.weaponArt)} onUpgrade={() => onUpgradeStat('weaponArt')} icon={IconEnergy} />
                  </div>
                  <div className="space-y-1">
                       <StatRow label="Kabiliyet" value={player.stats.skill} cost={getStatCost(player.stats.skill)} canUpgrade={player.silver >= getStatCost(player.stats.skill)} onUpgrade={() => onUpgradeStat('skill')} icon={Activity} />
                       <StatRow label="Şans" value={player.stats.luck} cost={getStatCost(player.stats.luck)} canUpgrade={player.silver >= getStatCost(player.stats.luck)} onUpgrade={() => onUpgradeStat('luck')} icon={Clover} />
                       <StatRow label="Savunma Sanatı" value={player.stats.defenseArt} cost={getStatCost(player.stats.defenseArt)} canUpgrade={player.silver >= getStatCost(player.stats.defenseArt)} onUpgrade={() => onUpgradeStat('defenseArt')} icon={Shield} />
                  </div>
              </div>

              {/* Combat Summary Bars */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-stone-950/50 rounded px-3 py-2 border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <IconSword size={14} className="text-red-500" />
                          <span className="text-[10px] uppercase font-bold text-stone-500">Hasar</span>
                      </div>
                      <span className="font-mono text-lg font-bold text-stone-200">{avgDamage}</span>
                  </div>
                  <div className="bg-stone-950/50 rounded px-3 py-2 border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <IconShield size={14} className="text-blue-500" />
                          <span className="text-[10px] uppercase font-bold text-stone-500">Zırh</span>
                      </div>
                      <span className="font-mono text-lg font-bold text-stone-200">{armorRating}</span>
                  </div>
              </div>

              {/* Elemental Stats Section */}
              <div className="mt-4 border-t border-stone-800 pt-3">
                  <div className="text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest flex items-center gap-1">
                      <Zap size={10} /> Element Uyumu
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                      <ElementalStat icon={IconFire} label="Ateş" value={elemDmg.fire} res={elemRes.fire} color="text-red-500" />
                      <ElementalStat icon={IconIce} label="Buz" value={elemDmg.ice} res={elemRes.ice} color="text-blue-400" />
                      <ElementalStat icon={IconShock} label="Şok" value={elemDmg.shock} res={elemRes.shock} color="text-yellow-400" />
                      <ElementalStat icon={IconPoison} label="Zehir" value={elemDmg.poison} res={elemRes.poison} color="text-emerald-500" />
                  </div>
              </div>
          </div>

          {/* INVENTORY PANEL */}
          <div className="bg-[#151210] border border-stone-800 rounded-xl p-4 md:p-5 shadow-xl flex flex-col">
               <div className="flex justify-between items-center mb-4 border-b border-stone-800 pb-2">
                    <div className="flex items-center gap-2">
                        <span className="rpg-font text-lg text-stone-200">Sırt Çantası</span>
                        <span className="text-[10px] text-stone-600 font-bold bg-stone-900 px-2 py-0.5 rounded">{player.inventory.length}/{player.inventorySlots}</span>
                    </div>
                    <div className="flex gap-1">
                        {[0, 1].map(p => (
                            <button 
                                key={p} 
                                onClick={() => setInventoryPage(p)}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${inventoryPage === p ? 'bg-amber-700 text-white' : 'bg-stone-900 text-stone-600 hover:bg-stone-800'}`}
                            >
                                {p + 1}
                            </button>
                        ))}
                    </div>
               </div>

               <div className="overflow-y-auto custom-scrollbar max-h-[300px] md:max-h-none">
                   <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {Array(INVENTORY_PAGE_SIZE).fill(null).map((_, i) => {
                              const globalIndex = (inventoryPage * INVENTORY_PAGE_SIZE) + i;
                              const isLocked = globalIndex >= player.inventorySlots;
                              const isNextUnlock = globalIndex === player.inventorySlots;
                              const item = player.inventory[globalIndex];
                              let IconComp = IconGem;
                              if (item) IconComp = getItemIcon(item) as any;

                              if (isLocked) {
                                  if (isNextUnlock && onExpandInventory) {
                                      const cost = calculateSlotCost(globalIndex);
                                      return (
                                          <div key={globalIndex} onClick={() => onExpandInventory(cost)} className="aspect-square bg-stone-950 border border-stone-700 border-dashed hover:border-amber-500 rounded-md cursor-pointer group flex flex-col items-center justify-center gap-0.5 transition-colors relative overflow-hidden" title={`Bölme Aç: ${cost} Gümüş`}>
                                               <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
                                               <Lock size={10} className="text-stone-500 group-hover:text-amber-500 mb-0.5" />
                                               <div className="text-[8px] font-bold text-stone-500 group-hover:text-amber-400 flex items-center gap-0.5">
                                                  {cost} <span className="text-[6px]">g</span>
                                               </div>
                                          </div>
                                      );
                                  }
                                  return <div key={globalIndex} className="aspect-square bg-[#0a0807] border border-stone-800/30 rounded-md flex items-center justify-center opacity-30"><Lock size={10} /></div>;
                              }

                              return (
                                  <div key={globalIndex} 
                                       onClick={() => item && handleSelectItem({item, source: 'inventory'})} 
                                       className={`aspect-square rounded-md border relative cursor-pointer group hover:scale-105 transition-transform
                                       ${item 
                                           ? 'bg-stone-900 border-stone-700 hover:border-stone-500' 
                                           : 'bg-[#151210] border-stone-800 hover:bg-stone-900'}`}>
                                      {item && <IconComp size={20} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                                          item.rarity === 'Efsanevi' ? 'text-amber-500' : 
                                          item.rarity === 'Destansı' ? 'text-purple-400' : 
                                          item.rarity === 'Nadir' ? 'text-cyan-400' : 'text-stone-400'
                                      }`} />}
                                      
                                      {item?.upgradeLevel ? <span className="absolute bottom-0 right-0.5 text-[8px] font-bold text-amber-500">+{item.upgradeLevel}</span> : null}
                                  </div>
                              )
                          })}
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};
