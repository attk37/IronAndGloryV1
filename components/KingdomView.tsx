
import React, { useState } from 'react';
import { Player, Kingdom, MapNode, IncomingAttack } from '../types';
import { KINGDOM_MAP_NODES, UPGRADE_COSTS, SOLDIER_COST } from '../constants';
import { IconKingdom, IconCastle, IconWall, IconPropertyFarm, IconHammer, IconCoin, IconFlag, IconSkull, IconShield, IconCrossedSwords, IconPropertyHome, IconGem } from './Icons';
import { Lock, Crown, Users, Package, Utensils, Construction, Map, Swords, HeartPulse, CheckCircle2, Clock, UserPlus, Info, X, ShieldCheck, ShieldAlert, Zap, Skull } from 'lucide-react';

interface KingdomViewProps {
  player: Player;
  onUpgradeKingdom: (type: 'castle' | 'walls' | 'agriculture' | 'workshops' | 'army' | 'housing') => void;
  onMapAction: (node: MapNode, action: 'raid' | 'rescue' | 'conquer' | 'recruit') => void;
  onFoundKingdom: (name: string) => void;
  onTrainSoldiers: (amount: number) => void;
  playSfx?: (key: string) => void;
  incomingAttack?: IncomingAttack | null;
}

export const KingdomView: React.FC<KingdomViewProps> = ({ player, onUpgradeKingdom, onMapAction, onFoundKingdom, onTrainSoldiers, playSfx, incomingAttack }) => {
  const [kingdomName, setKingdomName] = useState("");
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MAP'>('OVERVIEW');
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [recruitAmount, setRecruitAmount] = useState(1);

  // --- LOCKED STATE ---
  if (player.level < 25) { 
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in zoom-in-95 text-center p-8 bg-stone-900/30 border-2 border-dashed border-stone-800 rounded-xl">
              <div className="w-24 h-24 bg-stone-950 rounded-full flex items-center justify-center border-4 border-stone-800 mb-6 shadow-2xl opacity-50">
                  <IconKingdom size={48} className="text-stone-600" />
              </div>
              <h3 className="text-3xl font-bold text-stone-300 mb-2 rpg-font">Krallık Henüz Kurulmadı</h3>
              <p className="text-stone-500 mb-8 max-w-md">
                  Kendi krallığını kurmak ve topraklara hükmetmek için yeterince güçlü değilsin.
              </p>
              <div className="px-8 py-3 bg-stone-900 border border-stone-700 rounded text-stone-400 font-bold font-mono flex items-center gap-2">
                  <Lock size={16} /> Gereken Seviye: 25
              </div>
          </div>
      );
  }

  // --- FOUNDATION STATE ---
  if (!player.kingdom) {
      const COST_SILVER = 5000;
      const COST_GEMS = 100;
      const canAfford = player.silver >= COST_SILVER && player.gems >= COST_GEMS;

      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-700 max-w-lg mx-auto">
              <Crown size={64} className="text-amber-500 mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce" />
              <h2 className="text-4xl rpg-font text-amber-100 mb-4 text-center">Taht Seni Bekliyor</h2>
              <p className="text-stone-400 mb-8 text-center">
                  Şan ve şöhretin tüm diyara yayıldı. Artık kendi sancağını dikme ve bir krallık kurma vakti geldi.
              </p>
              
              <div className="w-full bg-stone-900 border border-stone-700 p-6 rounded-xl shadow-xl">
                  <label className="text-xs text-stone-500 uppercase font-bold mb-2 block">Krallık İsmi</label>
                  <input 
                      type="text" 
                      value={kingdomName}
                      onChange={(e) => setKingdomName(e.target.value)}
                      placeholder="Örn: Kuzeyin Muhafızları"
                      className="w-full bg-stone-950 border border-stone-700 p-4 rounded text-stone-200 outline-none focus:border-amber-600 font-serif text-lg mb-6"
                  />

                  {/* Cost Display */}
                  <div className="flex justify-center gap-6 mb-6 text-sm font-bold border-t border-b border-stone-800 py-3">
                        <div className={`flex items-center gap-2 ${player.silver >= COST_SILVER ? 'text-slate-300' : 'text-red-500'}`}>
                            <IconCoin size={16} /> {COST_SILVER.toLocaleString('tr-TR')} Gümüş
                        </div>
                        <div className={`flex items-center gap-2 ${player.gems >= COST_GEMS ? 'text-purple-500' : 'text-red-500'}`}>
                            <IconGem size={16} /> {COST_GEMS} Zümrüt
                        </div>
                  </div>

                  <button 
                      onClick={() => onFoundKingdom(kingdomName)}
                      disabled={!kingdomName.trim() || !canAfford}
                      className={`w-full py-4 rounded font-bold text-lg uppercase tracking-widest transition-all
                          ${kingdomName.trim() && canAfford
                              ? 'bg-amber-800 text-white hover:bg-amber-700 shadow-lg border border-amber-600' 
                              : 'bg-stone-800 text-stone-600 border border-stone-700 cursor-not-allowed'}
                      `}
                  >
                      {canAfford ? 'Krallığı Kur' : 'Kaynak Yetersiz'}
                  </button>
              </div>
          </div>
      );
  }

  const k = player.kingdom;
  // Resource Generation Display Logic matching App.tsx
  const villageBonus = k.territory.length * 2; 
  const passiveProvisions = (k.agriculture * 0.5) + villageBonus;
  const passiveSupplies = (k.workshops * 0.5) + villageBonus;

  // Calculate Kingdom Power
  // Formula: (Level * 1000) + (Population * 10) + (Army * ArmyLevel * 5) + (Building Levels * 50)
  const kingdomPower = Math.floor(
      (k.level * 1000) +
      (k.population * 10) +
      (k.army * k.armyLevel * 5) +
      ((k.walls + k.agriculture + k.workshops + k.housing) * 50)
  );

  // --- DASHBOARD (MANAGEMENT) ---
  const renderDashboard = () => {
      const maxRecruit = Math.floor(Math.min(
          player.silver / SOLDIER_COST.silver,
          k.supplies / SOLDIER_COST.supplies,
          k.provisions / SOLDIER_COST.provisions
      ));

      // Calculate Dynamic Costs for Recruitment
      const totalSilverCost = recruitAmount * SOLDIER_COST.silver;
      const totalSuppliesCost = recruitAmount * SOLDIER_COST.supplies;
      const totalProvisionsCost = recruitAmount * SOLDIER_COST.provisions;

      return (
      <div className="animate-in slide-in-from-left-4 duration-500">
          
          {/* Status Monitor & Power */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Threat Monitor */}
              <div className={`col-span-2 p-4 rounded-xl border-2 flex items-center justify-between ${incomingAttack ? 'bg-red-950/30 border-red-900' : 'bg-stone-900/50 border-stone-800'}`}>
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full border-2 ${incomingAttack ? 'bg-red-900 border-red-600 animate-pulse' : 'bg-emerald-900/30 border-emerald-800'}`}>
                          {incomingAttack ? <ShieldAlert size={24} className="text-white" /> : <ShieldCheck size={24} className="text-emerald-500" />}
                      </div>
                      <div>
                          <h3 className={`text-sm font-bold uppercase tracking-wide ${incomingAttack ? 'text-red-400' : 'text-emerald-500'}`}>
                              {incomingAttack ? 'DÜŞMAN TESPİT EDİLDİ!' : 'SINIRLAR GÜVENLİ'}
                          </h3>
                          <p className="text-xs text-stone-400 mt-1">
                              {incomingAttack 
                                  ? `${incomingAttack.attackerName} orduları ${incomingAttack.targetNodeName} bölgesine doğru ilerliyor.` 
                                  : "Gözcü kuleleri ufukta herhangi bir tehdit rapor etmedi."}
                          </p>
                      </div>
                  </div>
              </div>

              {/* Kingdom Power Display */}
              <div className="bg-[#1c1917] p-4 rounded-xl border-2 border-amber-600/30 flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/gold-scale.png')] opacity-10" />
                  <div className="relative z-10 flex flex-col items-center">
                      <div className="text-[10px] text-amber-600 uppercase font-bold tracking-[0.2em] mb-1">Krallık Gücü</div>
                      <div className="text-3xl font-mono font-bold text-amber-400 flex items-center gap-2 drop-shadow-md">
                          <Crown size={24} /> {kingdomPower.toLocaleString()}
                      </div>
                  </div>
              </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex items-center gap-3 relative overflow-hidden">
                  <div className="p-2 bg-blue-950 rounded text-blue-400 z-10"><Users size={20} /></div>
                  <div className="z-10">
                      <div className="text-[10px] text-stone-500 uppercase font-bold">Nüfus</div>
                      <div className="text-xl font-mono font-bold text-stone-200">{Math.floor(k.population)}</div>
                  </div>
              </div>
              <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex items-center gap-3">
                  <div className="p-2 bg-red-950 rounded text-red-400"><Swords size={20} /></div>
                  <div>
                      <div className="text-[10px] text-stone-500 uppercase font-bold">Ordu (Kalite: {k.armyLevel})</div>
                      <div className="text-xl font-mono font-bold text-stone-200">{Math.floor(k.army)}</div>
                  </div>
              </div>
              <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex items-center gap-3 relative">
                  <div className="p-2 bg-amber-950 rounded text-amber-400"><Package size={20} /></div>
                  <div>
                      <div className="text-[10px] text-stone-500 uppercase font-bold">Malzeme</div>
                      <div className="text-xl font-mono font-bold text-stone-200">{Math.floor(k.supplies)}</div>
                      <div className="text-[9px] text-green-500 font-bold absolute bottom-2 right-4">+{passiveSupplies.toFixed(1)}/sn</div>
                  </div>
              </div>
              <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex items-center gap-3 relative">
                  <div className="p-2 bg-green-950 rounded text-green-400"><Utensils size={20} /></div>
                  <div>
                      <div className="text-[10px] text-stone-500 uppercase font-bold">Erzak</div>
                      <div className="text-xl font-mono font-bold text-stone-200">{Math.floor(k.provisions)}</div>
                      <div className="text-[9px] text-green-500 font-bold absolute bottom-2 right-4">+{passiveProvisions.toFixed(1)}/sn</div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Col: Army Recruitment */}
              <div className="lg:col-span-1">
                  <div className="bg-[#151210] border border-stone-800 rounded-xl p-5 shadow-lg h-full flex flex-col">
                      <h3 className="text-lg rpg-font text-stone-300 mb-4 border-b border-stone-800 pb-2 flex items-center gap-2">
                          <UserPlus size={18} className="text-amber-600" /> Orduya Alım
                      </h3>
                      
                      <div className="mb-4 space-y-2">
                          <div className="text-xs text-stone-500 uppercase font-bold mb-1">Birim Maliyeti:</div>
                          <div className="flex justify-between text-xs bg-stone-950 p-2 rounded border border-stone-800">
                              <span className="flex items-center gap-1 text-slate-400"><IconCoin size={10}/> {SOLDIER_COST.silver.toLocaleString('tr-TR')}</span>
                              <span className="flex items-center gap-1 text-amber-700"><IconHammer size={10}/> {SOLDIER_COST.supplies}</span>
                              <span className="flex items-center gap-1 text-green-600"><IconPropertyFarm size={10}/> {SOLDIER_COST.provisions}</span>
                          </div>
                      </div>

                      <div className="mb-4">
                          <div className="flex justify-between mb-2">
                              <span className="text-stone-400 text-xs font-bold uppercase">Miktar</span>
                              <span className="text-stone-200 font-mono font-bold">{recruitAmount}</span>
                          </div>
                          <input 
                              type="range" 
                              min="1" 
                              max={Math.max(1, maxRecruit)} 
                              value={recruitAmount} 
                              onChange={(e) => setRecruitAmount(parseInt(e.target.value))}
                              disabled={maxRecruit <= 0}
                              className="w-full accent-amber-600 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="text-right mt-1 text-[10px] text-stone-500">Maksimum: {maxRecruit}</div>
                      </div>

                      {/* Total Cost Preview */}
                      <div className="mb-6 bg-black/40 p-3 rounded border border-stone-800/60">
                          <div className="text-[10px] text-stone-500 uppercase font-bold mb-2 text-center border-b border-stone-800 pb-1">Toplam Maliyet</div>
                          <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                  <span className="text-stone-400">Gümüş</span>
                                  <span className={`font-mono font-bold ${player.silver >= totalSilverCost ? 'text-slate-300' : 'text-red-500'}`}>{totalSilverCost.toLocaleString('tr-TR')}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                  <span className="text-stone-400">Malzeme</span>
                                  <span className={`font-mono font-bold ${k.supplies >= totalSuppliesCost ? 'text-amber-700' : 'text-red-500'}`}>{totalSuppliesCost}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                  <span className="text-stone-400">Erzak</span>
                                  <span className={`font-mono font-bold ${k.provisions >= totalProvisionsCost ? 'text-green-600' : 'text-red-500'}`}>{totalProvisionsCost}</span>
                              </div>
                          </div>
                      </div>

                      <button 
                          onClick={() => { onTrainSoldiers(recruitAmount); setRecruitAmount(1); }}
                          disabled={maxRecruit <= 0}
                          className={`w-full py-3 rounded font-bold uppercase text-xs tracking-wider border transition-all flex items-center justify-center gap-2 mt-auto
                              ${maxRecruit > 0 
                                  ? 'bg-amber-900 border-amber-700 text-white hover:bg-amber-800 shadow-lg' 
                                  : 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed'}
                          `}
                      >
                          {maxRecruit > 0 ? 'Asker Topla' : 'Kaynak Yetersiz'}
                      </button>
                  </div>
              </div>

              {/* Right Col: Upgrades */}
              <div className="lg:col-span-2">
                  <h3 className="text-lg rpg-font text-stone-300 mb-4 border-b border-stone-800 pb-2">Geliştirmeler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                          { id: 'castle', name: 'Kale Merkezi', level: k.level, icon: IconCastle, desc: 'Krallık otoritesini artırır.' },
                          { id: 'housing', name: 'Haneler', level: k.housing || 1, icon: IconPropertyHome, desc: 'Nüfus kapasitesini ve büyümeyi artırır.' },
                          { id: 'walls', name: 'Surlar', level: k.walls, icon: IconWall, desc: 'Savaşlarda savunma bonusu sağlar.' },
                          { id: 'agriculture', name: 'Çiftlikler', level: k.agriculture, icon: IconPropertyFarm, desc: 'Erzak üretimini (+0.5/sn) artırır.' },
                          { id: 'workshops', name: 'Atölyeler', level: k.workshops, icon: IconHammer, desc: 'Malzeme üretimini (+0.5/sn) artırır.' },
                          { id: 'army', name: 'Ordu Eğitimi', level: k.armyLevel, icon: Swords, desc: 'Askerlerin kalitesini (gücünü) artırır.' },
                      ].map(upgrade => {
                          const cost = UPGRADE_COSTS[upgrade.id as keyof typeof UPGRADE_COSTS](upgrade.level + 1);
                          const canAfford = player.silver >= cost.silver && k.supplies >= cost.supplies;

                          return (
                              <div key={upgrade.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between hover:border-stone-600 transition-all">
                                  <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2.5 bg-stone-950 rounded border border-stone-800 text-stone-400">
                                              <upgrade.icon size={20} />
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-stone-200 text-sm">{upgrade.name}</h4>
                                              <div className="text-[10px] text-amber-500 font-bold">Seviye {upgrade.level}</div>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <p className="text-[10px] text-stone-500 mb-3 h-6 line-clamp-2">{upgrade.desc}</p>

                                  <button 
                                      onClick={() => onUpgradeKingdom(upgrade.id as any)}
                                      disabled={!canAfford}
                                      className={`w-full py-2 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center gap-3
                                          ${canAfford ? 'bg-amber-900/50 border-amber-800 text-white hover:bg-amber-900' : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'}
                                      `}
                                  >
                                      <span className="flex items-center gap-1"><IconCoin size={10} /> {cost.silver.toLocaleString('tr-TR')}</span>
                                      <span className="flex items-center gap-1"><Package size={10} /> {cost.supplies}</span>
                                      <span>Yükselt</span>
                                  </button>
                              </div>
                          )
                      })}
                  </div>
              </div>
          </div>
      </div>
      );
  }

  // --- MAP (WARFARE) ---
  const renderMap = () => (
      <div className="animate-in slide-in-from-right-4 duration-500 h-[500px] bg-[#0c0a09] rounded-xl border border-stone-800 relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-50" />
          
          {/* Kingdom Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-16 h-16 bg-amber-900 rounded-full flex items-center justify-center border-4 border-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                  <IconKingdom size={32} className="text-white" />
              </div>
              <span className="mt-2 text-xs font-bold text-amber-500 bg-black/60 px-2 py-1 rounded">{k.name}</span>
          </div>

          {/* Map Nodes */}
          {KINGDOM_MAP_NODES.map(node => {
              const isConquered = k.territory.includes(node.id);
              const isOnCooldown = (k.nodeCooldowns[node.id] || 0) > Date.now();
              const isCapital = node.type.includes('capital');

              return (
                  <div 
                      key={node.id}
                      onClick={() => { setSelectedNode(node); if(playSfx) playSfx('ui_click'); }}
                      className="absolute flex flex-col items-center cursor-pointer group transition-transform hover:scale-110 z-10"
                      style={{ top: `${node.y}%`, left: `${node.x}%` }}
                  >
                      <div className={`
                          rounded-full flex items-center justify-center border-2 shadow-lg transition-colors relative
                          ${isCapital ? 'w-14 h-14' : 'w-10 h-10'}
                          ${node.status === 'hostile' && !isConquered 
                              ? 'bg-red-950 border-red-600 text-red-400' 
                              : isConquered 
                                  ? 'bg-green-950 border-green-600 text-green-400' 
                                  : 'bg-stone-800 border-stone-600 text-stone-400'}
                          ${isOnCooldown ? 'opacity-50 grayscale' : ''}
                      `}>
                          {node.type.includes('capital') ? <Crown size={isCapital ? 24 : 18} /> : node.type === 'village' ? <IconPropertyFarm size={18} /> : <IconCastle size={18} />}
                          
                          {/* Cooldown Indicator */}
                          {isOnCooldown && (
                              <div className="absolute -top-1 -right-1 bg-stone-900 rounded-full p-0.5 border border-stone-600">
                                  <Clock size={10} className="text-stone-400" />
                              </div>
                          )}
                      </div>
                      <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm whitespace-nowrap
                          ${node.status === 'hostile' ? 'text-red-400' : isConquered ? 'text-green-400' : 'text-stone-400'}
                      `}>
                          {node.name}
                      </span>
                  </div>
              );
          })}

          {/* Connection Lines (Decorative) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              {KINGDOM_MAP_NODES.map((node, i) => (
                  <line 
                      key={i} 
                      x1="50%" y1="50%" 
                      x2={`${node.x}%`} y2={`${node.y}%`} 
                      stroke={k.territory.includes(node.id) ? "#22c55e" : "#78716c"} 
                      strokeWidth="2" 
                      strokeDasharray="5,5" 
                  />
              ))}
          </svg>
      </div>
  );

  const renderNodeModal = () => {
    if (!selectedNode) return null;
    
    const isConquered = k.territory.includes(selectedNode.id);
    const isOnCooldown = (k.nodeCooldowns[selectedNode.id] || 0) > Date.now();
    const cooldownMs = (k.nodeCooldowns[selectedNode.id] || 0) - Date.now();
    const cooldownHours = Math.floor(cooldownMs / (1000 * 60 * 60));
    const cooldownMinutes = Math.floor((cooldownMs % (1000 * 60 * 60)) / (1000 * 60));

    // Power Calculation for Comparison
    const enemyEstimatedPower = selectedNode.difficulty * 50; 
    const myArmyPower = k.army * k.armyLevel;
    const winChance = Math.min(100, Math.floor((myArmyPower / (myArmyPower + enemyEstimatedPower)) * 100));

    // Colors for chance
    const chanceColor = winChance > 70 ? 'text-green-500' : winChance > 40 ? 'text-amber-500' : 'text-red-500';

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setSelectedNode(null)}>
            <div className="w-full max-w-sm bg-[#151210] border-2 border-stone-600 rounded-xl p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-stone-500 hover:text-white"><X size={24}/></button>
                
                <div className="flex flex-col items-center mb-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 mb-4 shadow-xl ${
                        selectedNode.status === 'hostile' && !isConquered ? 'bg-red-950 border-red-600 text-red-500' : 
                        isConquered ? 'bg-green-950 border-green-600 text-green-500' :
                        'bg-stone-900 border-stone-600 text-stone-400'
                    }`}>
                        {selectedNode.type.includes('capital') ? <Crown size={40} /> : selectedNode.type === 'village' ? <IconPropertyFarm size={40} /> : <IconCastle size={40} />}
                    </div>
                    <h3 className="text-2xl rpg-font text-stone-200">{selectedNode.name}</h3>
                    <div className={`text-xs font-bold uppercase px-2 py-0.5 rounded mt-2 ${
                        selectedNode.status === 'hostile' && !isConquered ? 'bg-red-900/30 text-red-400 border border-red-900' : 
                        isConquered ? 'bg-green-900/30 text-green-400 border border-green-900' :
                        'bg-stone-900 text-stone-500 border border-stone-800'
                    }`}>
                        {isConquered ? 'Senin Toprağın' : selectedNode.status === 'hostile' ? 'Düşman Bölgesi' : 'Tarafsız Bölge'}
                    </div>
                </div>

                {/* Power Comparison (New Feature) */}
                <div className="bg-stone-950/80 p-3 rounded-lg border border-stone-800 mb-4 grid grid-cols-3 text-center gap-2 items-center">
                    <div>
                        <div className="text-[10px] text-stone-500 uppercase">Ordun</div>
                        <div className="text-blue-400 font-bold">{Math.floor(myArmyPower)}</div>
                    </div>
                    <div className="text-stone-600 font-bold text-xs">VS</div>
                    <div>
                        <div className="text-[10px] text-stone-500 uppercase">Düşman</div>
                        <div className="text-red-400 font-bold">~{enemyEstimatedPower}</div>
                    </div>
                    <div className="col-span-3 border-t border-stone-800 pt-2 mt-1">
                        <div className="text-[10px] text-stone-500 uppercase">Kazanma Şansı</div>
                        <div className={`font-bold ${chanceColor} text-lg`}>%{winChance}</div>
                    </div>
                </div>

                {isOnCooldown ? (
                    <div className="text-center py-6 bg-stone-900/50 rounded-xl border border-stone-800">
                         <Clock size={40} className="mx-auto text-stone-600 mb-2" />
                         <p className="text-stone-400 text-sm font-bold">Bölge Dinleniyor</p>
                         <p className="text-xs text-stone-500 mb-2">Askerlerin ve halkın yorgun.</p>
                         <div className="text-xl font-mono font-bold text-amber-500">{cooldownHours}sa {cooldownMinutes}dk</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                         {/* Rewards Info */}
                         <div className="bg-stone-900/50 p-3 rounded border border-stone-800 mb-4 text-sm text-stone-400 grid grid-cols-2 gap-2">
                             <div className="flex flex-col items-center p-2 bg-black/30 rounded">
                                 <span className="text-[10px] uppercase font-bold text-stone-500">Zorluk</span>
                                 <span className="text-red-400 font-bold">{selectedNode.difficulty}</span>
                             </div>
                             <div className="flex flex-col items-center p-2 bg-black/30 rounded">
                                 <span className="text-[10px] uppercase font-bold text-stone-500">Potansiyel</span>
                                 <span className="text-slate-300 font-bold">{selectedNode.rewards.silver.toLocaleString('tr-TR')} Gümüş</span>
                             </div>
                         </div>

                         {selectedNode.status === 'hostile' && !isConquered ? (
                             <>
                                <button onClick={() => { onMapAction(selectedNode, 'raid'); setSelectedNode(null); }} className="w-full py-3 bg-red-900/30 border border-red-800 hover:bg-red-900 text-red-200 font-bold rounded uppercase text-xs flex items-center justify-center gap-2 transition-colors">
                                    <IconSkull size={16} /> Yağmala (Simülasyon)
                                </button>
                                <button onClick={() => { onMapAction(selectedNode, 'conquer'); setSelectedNode(null); }} className="w-full py-3 bg-amber-900/30 border border-amber-800 hover:bg-amber-900 text-amber-200 font-bold rounded uppercase text-xs flex items-center justify-center gap-2 transition-colors">
                                    <IconFlag size={16} /> Fethet (Simülasyon)
                                </button>
                             </>
                         ) : isConquered ? (
                              <div className="text-center text-green-500 font-bold py-4 bg-green-900/10 rounded border border-green-900/30">
                                  <CheckCircle2 className="mx-auto mb-2" />
                                  Bu bölge zaten fethedildi.
                              </div>
                         ) : (
                             <>
                                <button onClick={() => { onMapAction(selectedNode, 'recruit'); setSelectedNode(null); }} className="w-full py-3 bg-stone-800 border border-stone-700 hover:bg-stone-700 text-stone-300 font-bold rounded uppercase text-xs flex items-center justify-center gap-2 transition-colors">
                                    <UserPlus size={16} /> Asker Topla
                                </button>
                                <button onClick={() => { onMapAction(selectedNode, 'rescue'); setSelectedNode(null); }} className="w-full py-3 bg-green-900/30 border border-green-800 hover:bg-green-900 text-green-200 font-bold rounded uppercase text-xs flex items-center justify-center gap-2 transition-colors">
                                    <HeartPulse size={16} /> Kurtar (+Nüfus)
                                </button>
                             </>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
          <div>
              <h2 className="text-3xl rpg-font text-amber-500">{k.name}</h2>
              <div className="text-stone-500 text-sm">Seviye {k.level} Krallık</div>
          </div>
          <div className="flex gap-2">
              <button 
                  onClick={() => { setActiveTab('OVERVIEW'); if(playSfx) playSfx('ui_click'); }}
                  className={`px-4 py-2 rounded font-bold uppercase text-xs flex items-center gap-2 border transition-all ${activeTab === 'OVERVIEW' ? 'bg-amber-900 border-amber-700 text-white' : 'bg-stone-900 border-stone-800 text-stone-500'}`}
              >
                  <Construction size={16} /> Yönetim
              </button>
              <button 
                  onClick={() => { setActiveTab('MAP'); if(playSfx) playSfx('ui_click'); }}
                  className={`px-4 py-2 rounded font-bold uppercase text-xs flex items-center gap-2 border transition-all ${activeTab === 'MAP' ? 'bg-amber-900 border-amber-700 text-white' : 'bg-stone-900 border-stone-800 text-stone-500'}`}
              >
                  <Map size={16} /> Harita
              </button>
          </div>
      </div>

      {activeTab === 'OVERVIEW' ? renderDashboard() : renderMap()}
      {renderNodeModal()}
    </div>
  );
};
