
import React, { useState } from 'react';
import { Player, IncomingAttack } from '../types';
import { IconShield, IconSword, IconSkull } from './Icons';
import { ShieldAlert, Users } from 'lucide-react';

interface KingdomDefenseModalProps {
    attack: IncomingAttack;
    player: Player;
    onDefend: (soldiersDeployed: number) => void;
}

export const KingdomDefenseModal: React.FC<KingdomDefenseModalProps> = ({ attack, player, onDefend }) => {
    const [soldiers, setSoldiers] = useState(Math.min(player.kingdom?.army || 0, attack.enemyCount));
    
    const kingdom = player.kingdom;
    if (!kingdom) return null;

    const maxSoldiers = kingdom.army;
    const defenseBonus = kingdom.walls * 10; // Wall bonus
    const armyQuality = kingdom.armyLevel;
    
    // Estimate Power
    const enemyPower = attack.enemyStrength;
    const myPower = soldiers * armyQuality + defenseBonus;
    const winChance = Math.min(100, Math.max(0, (myPower / (enemyPower + myPower)) * 100));

    return (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-[#1c0a0a] border-2 border-red-800 rounded-xl p-6 relative shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-900 text-red-100 px-4 py-2 rounded-full border border-red-700 font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg animate-pulse">
                    <ShieldAlert size={20} /> Saldırı Altındasın!
                </div>

                <div className="mt-6 text-center mb-6">
                    <h2 className="text-2xl rpg-font text-red-500 mb-1">{attack.attackerName} Saldırıyor</h2>
                    <p className="text-stone-400 text-sm">Hedef: <span className="text-stone-200 font-bold">{attack.targetNodeName}</span></p>
                </div>

                <div className="flex justify-between items-center mb-8 bg-black/30 p-4 rounded border border-red-900/30">
                    <div className="text-center">
                        <div className="text-red-500 font-bold text-lg flex items-center justify-center gap-2">
                            <IconSkull size={24} /> {attack.enemyCount}
                        </div>
                        <div className="text-[10px] text-stone-500 uppercase">Düşman Askeri</div>
                    </div>
                    <div className="text-2xl font-bold text-stone-600">VS</div>
                    <div className="text-center">
                        <div className="text-blue-400 font-bold text-lg flex items-center justify-center gap-2">
                            <IconShield size={24} /> {soldiers}
                        </div>
                        <div className="text-[10px] text-stone-500 uppercase">Senin Askerin</div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="flex justify-between text-xs font-bold text-stone-400 mb-2 uppercase">
                        <span>Savunma Gücü</span>
                        <span className={winChance > 70 ? 'text-green-500' : winChance > 40 ? 'text-amber-500' : 'text-red-500'}>
                            Kazanma Şansı: %{Math.floor(winChance)}
                        </span>
                    </label>
                    <input 
                        type="range" 
                        min="0" 
                        max={maxSoldiers} 
                        value={soldiers} 
                        onChange={(e) => setSoldiers(parseInt(e.target.value))}
                        className="w-full accent-blue-600 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-1 text-[10px] text-stone-600 font-mono">
                        <span>0</span>
                        <span>Maks: {maxSoldiers}</span>
                    </div>
                </div>

                <div className="bg-stone-900/50 p-3 rounded mb-6 text-xs text-stone-400 border border-stone-800">
                    <ul className="space-y-1">
                        <li className="flex justify-between"><span>Duvar Bonusu:</span> <span className="text-green-500">+{defenseBonus} Güç</span></li>
                        <li className="flex justify-between"><span>Ordu Kalitesi:</span> <span className="text-amber-500">x{armyQuality}</span></li>
                    </ul>
                </div>

                <button 
                    onClick={() => onDefend(soldiers)}
                    className="w-full py-4 bg-red-900 hover:bg-red-800 text-white font-bold rounded border border-red-700 uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
                >
                    <IconSword size={20} /> Savunmaya Geç
                </button>
            </div>
        </div>
    );
};
