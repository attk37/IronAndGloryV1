
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Item, Quest, CombatLogEntry, Job, ItemType, Race, Gender, Rank, QuestDifficulty, Property, Rarity } from './types';
import { INITIAL_PLAYER_STATS, HP_PER_CONSTITUTION, XP_SCALING_FACTOR, ITEM_POOL, RANKS, INITIAL_INVENTORY_SLOTS, MAX_INVENTORY_SLOTS, STAT_UPGRADE_BASE_COST, PROPERTIES, UPGRADE_RATES, POTIONS, RUNES, SFX_URLS } from './constants';
import { simulateCombat } from './services/gameLogic';
import { generateBattleReport } from './services/geminiService';
import { CharacterView } from './components/CharacterView';
import { QuestView } from './components/QuestView';
import { ShopView } from './components/ShopView';
import { OracleView } from './components/OracleView';
import { WorkView } from './components/WorkView';
import { DuelView } from './components/DuelView';
import { TournamentView } from './components/TournamentView';
import { PropertyView } from './components/PropertyView';
import { StatisticsView } from './components/StatisticsView';
import { ExchangeView } from './components/ExchangeView';
import { BankView } from './components/BankView';
import { CombatSimulationModal } from './components/CombatSimulationModal'; 
import { X, ChevronRight, Check, Activity, Sparkles, Crown, Zap, Shield, ArrowUp, Menu, MoreHorizontal, Hammer, Skull, Gem, CheckCircle2, XCircle, FlaskConical, Gift, Volume2, VolumeX, Music, Speaker, Save, Trash2, LogOut } from 'lucide-react';
import { IconHeart, IconEnergy, IconCoin, IconGem, IconHelmet, IconScroll, IconCrossedSwords, IconHammer, IconBag, IconEye, IconGameLogo, IconAvatarHuman, IconAvatarOrc, IconAvatarElf, IconAvatarVampire, IconTournament, IconPropertyHome, IconStats, IconExchange, IconBank, IconSword, IconArmor, IconShield, IconPaw, IconBoot, IconRelic, IconFire, IconIce, IconShock, IconPoison } from './components/Icons';

// --- GAME CONSTANTS ---
const INITIAL_PLAYER: Player = {
  name: "Maceracı", 
  race: 'İnsan',
  gender: 'Erkek',
  appearance: {
    height: 180,
    weight: 80,
    imgUrl: "human" 
  },
  rank: "Çaylak",
  rankIndex: 0,
  level: 1,
  xp: 0,
  maxXp: 100,
  silver: 100, 
  gems: 5, 
  karma: 0, 
  energy: 20,
  maxEnergy: 20,
  hp: 75, 
  maxHp: 75,
  stats: { ...INITIAL_PLAYER_STATS },
  equipment: { weapon: null, armor: null, helmet: null, shield: null, leggings: null, mount: null, artifact1: null, artifact2: null },
  inventory: [],
  inventorySlots: INITIAL_INVENTORY_SLOTS,
  properties: {}, 
  records: {
      totalBattles: 0,
      battlesWon: 0,
      battlesLost: 0,
      totalSilverEarned: 0,
      totalXpEarned: 0,
      duelsWon: 0,
      duelsLost: 0,
      questsCompleted: 0
  },
  claimedCodes: []
};

// Dark Fantasy Atmospheric Music URL
const BACKGROUND_MUSIC_URL = "https://alitetik.com/IronAndGlory/Music/Iron-and-Glory-v1.mp3"; 

enum View {
  WELCOME = 'welcome',
  CREATION = 'creation',
  CHARACTER = 'character',
  QUESTS = 'quests',
  WORK = 'work',
  SHOP = 'shop',
  ORACLE = 'oracle',
  DUEL = 'duel',
  TOURNAMENT = 'tournament',
  PROPERTIES = 'properties',
  STATISTICS = 'statistics',
  EXCHANGE = 'exchange',
  BANK = 'bank'
}

// --- RACE STATS ---
const RACE_BONUSES: Record<Race, { desc: string, mods: Partial<Player['stats']> }> = {
    'İnsan': { 
        desc: "Dengeli ve uyumlu. Her alanda yetenekli.",
        mods: { strength: 1, skill: 1, constitution: 1, luck: 1, weaponArt: 1, defenseArt: 1 } 
    },
    'Ork': { 
        desc: "Kaba kuvvetin efendileri. Yıkıcı ama hantal.",
        mods: { strength: 3, constitution: 2, skill: -1, defenseArt: -1 } 
    },
    'Elf': { 
        desc: "Zarif ve ölümcül. Üstün yetenek, kırılgan yapı.",
        mods: { skill: 3, weaponArt: 2, constitution: -2 } 
    },
    'Vampir': { 
        desc: "Gecenin çocukları. Şanslı ve savunması güçlü.",
        mods: { luck: 3, defenseArt: 2, strength: -2 } 
    }
};

// Helper for Item Icons in Modal
const ItemIconBig = ({ type, rarity, size = 64 }: { type: string, rarity: Rarity, size?: number }) => {
  const className = `${
      rarity === Rarity.LEGENDARY ? 'text-amber-500' : 
      rarity === Rarity.EPIC ? 'text-purple-500' : 
      rarity === Rarity.RARE ? 'text-cyan-400' : 'text-stone-400'
  } drop-shadow-lg`;
  
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

export default function App() {
  // Initialize State from LocalStorage if available
  const [player, setPlayer] = useState<Player>(() => {
      try {
          const savedData = localStorage.getItem('iron_glory_save_v1');
          if (savedData) {
              const parsed = JSON.parse(savedData);
              // Simple validation to ensure it's a valid player object (has name and level)
              if (parsed && parsed.name && typeof parsed.level === 'number') {
                  return parsed;
              }
          }
      } catch (e) {
          console.error("Save load failed", e);
      }
      return INITIAL_PLAYER;
  });

  const [currentView, setCurrentView] = useState<View>(() => {
      // If player is fresh (level 1, 0 xp), show welcome screen. Otherwise show character.
      return (player.xp === 0 && player.level === 1 && player.name === "Maceracı") ? View.WELCOME : View.CHARACTER;
  });

  const [shopInventory, setShopInventory] = useState<Item[]>([]);
  
  // Audio State
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Creation State
  const [creationName, setCreationName] = useState("");
  const [creationRace, setCreationRace] = useState<Race>('İnsan');
  const [creationGender, setCreationGender] = useState<Gender>('Erkek');

  // Job System
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [jobEndTime, setJobEndTime] = useState<number | null>(null);

  // Level Up Modal State
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);

  // Action Result Modal State (Upgrade/Rune)
  const [actionResult, setActionResult] = useState<{
      type: 'success' | 'failure' | 'socket';
      title: string;
      message: string;
      item: Item;
      subItem?: Item; // For runes
      oldLevel?: number;
      newLevel?: number;
  } | null>(null);

  // Simulation State
  const [simulatingQuest, setSimulatingQuest] = useState<Quest | null>(null);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeCombat, setActiveCombat] = useState<{
    title: string;
    logs: CombatLogEntry[];
    result: 'win' | 'loss' | null;
    flavorText?: string;
    onClose?: () => void;
    summary?: {
        playerDmg: number;
        enemyDmg: number;
        rewardSilver: number;
        rewardXp: number;
        droppedItem?: Item | null;
    }
  } | null>(null);
  const [generatingFlavor, setGeneratingFlavor] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // --- SAVE / LOAD LOGIC ---
  
  const handleSaveGame = () => {
      try {
          localStorage.setItem('iron_glory_save_v1', JSON.stringify(player));
          showNotification("Oyun Kaydedildi!");
          playSfx('ui_click');
      } catch (e) {
          showNotification("Kayıt Başarısız!");
      }
  };

  const handleResetGame = () => {
      if (confirm("DİKKAT: Tüm ilerlemen kalıcı olarak silinecek. Emin misin?")) {
          localStorage.removeItem('iron_glory_save_v1');
          setPlayer(INITIAL_PLAYER);
          setCurrentView(View.WELCOME);
          window.location.reload();
      }
  };

  // Auto-Save Interval (Every 30 seconds)
  useEffect(() => {
      const saveInterval = setInterval(() => {
          if (player.level > 1 || player.xp > 0) { // Only auto-save if player has started playing
             localStorage.setItem('iron_glory_save_v1', JSON.stringify(player));
          }
      }, 30000);
      return () => clearInterval(saveInterval);
  }, [player]);

  // --- AUDIO LOGIC ---
  const playSfx = useCallback((key: string) => {
    if (isSfxMuted) return;
    const url = SFX_URLS[key as keyof typeof SFX_URLS];
    if (url) {
      const audio = new Audio(url);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("SFX play failed", e));
    }
  }, [isSfxMuted]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.3; // Set background volume lower
        if (isMusicPlaying && !isMusicMuted) {
            audioRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [isMusicPlaying, isMusicMuted]);

  const toggleMusicMute = () => setIsMusicMuted(!isMusicMuted);
  const toggleSfxMute = () => setIsSfxMuted(!isSfxMuted);

  const refreshShop = useCallback((level: number) => {
    const availableItems = ITEM_POOL.filter(i => i.minLevel <= level + 2);
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
    setShopInventory(shuffled.slice(0, 10)); 
  }, []);

  useEffect(() => { refreshShop(player.level); }, [refreshShop, player.level]);

  // Stats Scaling & Regen
  useEffect(() => {
    setPlayer(prev => {
        const newMaxHp = prev.stats.constitution * HP_PER_CONSTITUTION;
        const newMaxEnergy = 20 + Math.floor(prev.stats.constitution * 0.5); // Base 20 + (Constitution * 0.5)
        
        return { 
            ...prev, 
            maxHp: newMaxHp,
            maxEnergy: newMaxEnergy
        };
    });
  }, [player.stats.constitution]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlayer(prev => {
        let newEnergy = prev.energy;
        let newHp = prev.hp;
        if (prev.energy < prev.maxEnergy) newEnergy = prev.energy + 1;
        if (prev.hp < prev.maxHp) {
          const hpRegenAmount = 2 + (prev.maxHp * 0.01);
          newHp = Math.min(prev.maxHp, prev.hp + hpRegenAmount);
        }
        return { ...prev, energy: newEnergy, hp: newHp };
      });
    }, 10000); 
    return () => clearInterval(timer);
  }, []);

  // Passive Income Interval (Every 1 second)
  useEffect(() => {
      const incomeInterval = setInterval(() => {
          setPlayer(prev => {
              if (!prev.properties) return prev;
              
              let income = 0;
              PROPERTIES.forEach(prop => {
                  const count = prev.properties[prop.id] || 0;
                  income += count * prop.incomePerSecond;
              });

              if (income > 0) {
                  return { ...prev, silver: prev.silver + income, records: { ...prev.records, totalSilverEarned: prev.records.totalSilverEarned + income } };
              }
              return prev;
          });
      }, 1000);

      return () => clearInterval(incomeInterval);
  }, []);

  // Notifications
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const showNotification = (msg: string) => {
      setNotification(msg);
      // Optional: Generic notification sound if needed, but specific actions have their own
  };

  // Job Logic
  useEffect(() => {
      if (!activeJob || !jobEndTime) return;
      const checkJobStatus = setInterval(() => {
          if (Date.now() >= jobEndTime) {
              completeJob(activeJob);
              clearInterval(checkJobStatus);
          }
      }, 1000);
      return () => clearInterval(checkJobStatus);
  }, [activeJob, jobEndTime]);

  const startJob = (job: Job) => {
      if (player.hp <= 5) { showNotification("Yaralısın!"); return; }
      setActiveJob(job);
      setJobEndTime(Date.now() + (job.durationSeconds * 1000));
      playSfx('ui_click');
  };

  const completeJob = (job: Job) => {
      const success = Math.random() * 100 > job.risk;
      if (success) {
          setPlayer(prev => ({
              ...prev,
              silver: prev.silver + job.silverReward,
              xp: prev.xp + job.xpReward,
              karma: Math.min(100, Math.max(-100, prev.karma + job.karmaReward)),
              records: {
                  ...prev.records,
                  totalSilverEarned: prev.records.totalSilverEarned + job.silverReward,
                  totalXpEarned: prev.records.totalXpEarned + job.xpReward
              }
          }));
          playSfx('coin');
          showNotification(`${job.name} Bitti: +${job.silverReward}g`);
      } else {
          const damage = Math.floor(player.maxHp * 0.1);
          setPlayer(prev => ({ ...prev, hp: Math.max(1, prev.hp - damage) }));
          playSfx('defeat');
          showNotification(`Kaza: -${damage} HP`);
      }
      setActiveJob(null);
      setJobEndTime(null);
  };

  // Level Logic
  useEffect(() => {
    if (player.xp >= player.maxXp) {
      const newLevel = player.level + 1;
      setPlayer(prev => ({
        ...prev,
        level: newLevel,
        xp: prev.xp - prev.maxXp,
        maxXp: Math.floor(prev.maxXp * XP_SCALING_FACTOR),
        energy: prev.maxEnergy, 
        hp: prev.maxHp 
      }));
      // Trigger Modal instead of just a toast
      setLevelUpLevel(newLevel);
      refreshShop(newLevel);
      playSfx('level_up');
    }
  }, [player.xp]);

  // Actions
  const handleUpgradeStat = (stat: keyof Player['stats']) => {
    const currentVal = player.stats[stat];
    const cost = Math.floor(STAT_UPGRADE_BASE_COST + (currentVal * currentVal * 0.5));

    if (player.silver >= cost) {
      setPlayer(prev => ({
        ...prev,
        silver: prev.silver - cost,
        stats: { ...prev.stats, [stat]: prev.stats[stat] + 1 }
      }));
      playSfx('coin');
    } else {
        showNotification("Yetersiz Gümüş!");
    }
  };

  const handleBuyItem = (item: Item) => {
    if (player.inventory.length >= player.inventorySlots) { showNotification("Çanta dolu!"); return; }
    const costSilver = item.cost;
    const costGems = item.costGems || 0;
    if (player.silver >= costSilver && player.gems >= costGems) {
      setPlayer(prev => ({
        ...prev,
        silver: prev.silver - costSilver,
        gems: prev.gems - costGems,
        inventory: [...prev.inventory, { ...item, id: item.id + Math.random() }] 
      }));
      playSfx('coin');
      showNotification("Satın alındı.");
    }
  };

  const handleBuyProperty = (property: Property, cost: number) => {
      if (player.silver >= cost) {
          setPlayer(prev => {
              const currentProps = prev.properties || {};
              return {
                  ...prev,
                  silver: prev.silver - cost,
                  properties: {
                      ...currentProps,
                      [property.id]: (currentProps[property.id] || 0) + 1
                  }
              }
          });
          playSfx('coin');
          showNotification(`${property.name} satın alındı!`);
      } else {
          showNotification("Yetersiz gümüş!");
      }
  }

  const handleUseItem = (item: Item) => {
      // Logic for using consumable items (potions, runes) from inventory
      if (item.type === 'potion') {
         if (item.name.includes("Can")) {
             setPlayer(prev => ({
                 ...prev,
                 hp: Math.min(prev.maxHp, prev.hp + item.bonus),
                 inventory: prev.inventory.filter(i => i.id !== item.id) // Consumed
             }));
             playSfx('potion');
             showNotification(`${item.bonus} Can yenilendi.`);
         } else if (item.name.includes("Enerji")) {
             setPlayer(prev => ({
                 ...prev,
                 energy: Math.min(prev.maxEnergy, prev.energy + item.bonus),
                 inventory: prev.inventory.filter(i => i.id !== item.id) // Consumed
             }));
             playSfx('potion');
             showNotification(`${item.bonus} Enerji yenilendi.`);
         }
      }
  };

  const handleUpgradeItem = (item: Item, cost: number) => {
      if (player.silver < cost) { showNotification("Yetersiz Gümüş!"); return; }
      
      const currentLevel = item.upgradeLevel || 0;
      if (currentLevel >= 9) { showNotification("Bu eşya maksimum seviyede!"); return; }

      const nextLevel = currentLevel + 1;
      const successRate = UPGRADE_RATES[nextLevel];
      const roll = Math.random() * 100;
      const isSuccess = roll <= successRate;

      playSfx('anvil'); // Sound of hitting the anvil

      setPlayer(prev => {
          let newEquipment = { ...prev.equipment };
          let newInventory = [...prev.inventory];
          
          let upgradedItem: Item | undefined;

          if (isSuccess) {
              // --- SUCCESS LOGIC ---
              
              const updateItem = (i: Item) => ({
                  ...i,
                  // GUARANTEE at least +1 stat gain. Math.max handles low level items.
                  bonus: Math.max(i.bonus + 1, Math.floor(i.bonus * 1.2)), 
                  upgradeLevel: nextLevel,
                  cost: Math.floor(i.cost * 1.5)
              });

              // Check if equipped
              let foundInEquip = false;
              const equipSlots: (keyof Player['equipment'])[] = ['weapon', 'armor', 'helmet', 'shield', 'leggings', 'mount', 'artifact1', 'artifact2'];
              for (const slot of equipSlots) {
                  const equippedItem = newEquipment[slot];
                  if (equippedItem && equippedItem.id === item.id) {
                      newEquipment[slot] = updateItem(equippedItem);
                      upgradedItem = newEquipment[slot] as Item;
                      foundInEquip = true;
                      break;
                  }
              }

              // If not in equip, check inventory
              if (!foundInEquip) {
                  const idx = newInventory.findIndex(i => i.id === item.id);
                  if (idx !== -1) {
                      newInventory[idx] = updateItem(newInventory[idx]);
                      upgradedItem = newInventory[idx];
                  }
              }

              if (upgradedItem) {
                  setTimeout(() => playSfx('magic'), 500); // Delayed magic sound on success
                  setActionResult({
                      type: 'success',
                      title: "GELİŞTİRME BAŞARILI!",
                      message: `${upgradedItem.name} seviye atladı!`,
                      item: upgradedItem,
                      oldLevel: currentLevel,
                      newLevel: nextLevel
                  });
              }

          } else {
              // --- FAILURE LOGIC (BURN) ---
              
              // Remove from equipment if exists
              const equipSlots: (keyof Player['equipment'])[] = ['weapon', 'armor', 'helmet', 'shield', 'leggings', 'mount', 'artifact1', 'artifact2'];
              for (const slot of equipSlots) {
                  const equippedItem = newEquipment[slot];
                  if (equippedItem && equippedItem.id === item.id) {
                      newEquipment[slot] = null; // Destroyed
                      break;
                  }
              }

              // Remove from inventory
              newInventory = newInventory.filter(i => i.id !== item.id);

              setTimeout(() => playSfx('defeat'), 500); // Failure sound
              setActionResult({
                  type: 'failure',
                  title: "GELİŞTİRME BAŞARISIZ!",
                  message: `${item.name} parçalara ayrıldı ve yok oldu.`,
                  item: item, // Show original item that was lost
                  oldLevel: currentLevel
              });
          }

          return {
              ...prev,
              silver: prev.silver - cost,
              equipment: newEquipment,
              inventory: newInventory
          };
      });
  };

  const handleSocketRune = (targetItem: Item, runeItem: Item) => {
      setPlayer(prev => {
          let newEquipment = { ...prev.equipment };
          let newInventory = [...prev.inventory];
          let updatedItem: Item | undefined;

          // 1. Remove rune from inventory
          // Note: using ID filter might remove duplicates if ID not unique enough, assume unique ID
          const runeIndex = newInventory.findIndex(i => i.id === runeItem.id);
          if (runeIndex !== -1) {
              newInventory.splice(runeIndex, 1); // Remove 1 rune
          } else {
              return prev; // Rune not found?
          }

          // 2. Find target Item (Equipped or Inventory) and update
          
          // Check Equipped
          let foundInEquip = false;
          const equipSlots: (keyof Player['equipment'])[] = ['weapon', 'armor', 'helmet', 'shield', 'leggings'];
          for (const slot of equipSlots) {
              const equippedItem = newEquipment[slot];
              if (equippedItem && equippedItem.id === targetItem.id) {
                  newEquipment[slot] = { ...equippedItem, socketedRune: runeItem };
                  updatedItem = newEquipment[slot] as Item;
                  foundInEquip = true;
                  break;
              }
          }

          // Check Inventory if not equipped
          if (!foundInEquip) {
              const itemIndex = newInventory.findIndex(i => i.id === targetItem.id);
              if (itemIndex !== -1) {
                  newInventory[itemIndex] = { ...newInventory[itemIndex], socketedRune: runeItem };
                  updatedItem = newInventory[itemIndex];
              }
          }

          if (updatedItem) {
              playSfx('magic');
              setActionResult({
                  type: 'socket',
                  title: "RUNE İŞLENDİ!",
                  message: `${runeItem.name} başarıyla ${targetItem.name} üzerine eklendi.`,
                  item: updatedItem,
                  subItem: runeItem
              });
          }

          return {
              ...prev,
              equipment: newEquipment,
              inventory: newInventory
          };
      });
  };

  const handleEquipItem = (item: Item) => {
      if (item.type === 'potion' || item.type === 'rune') return; // Cannot equip consumables directly
      
      setPlayer(prev => {
          const newInventory = prev.inventory.filter(i => i.id !== item.id);
          const currentEquipment = { ...prev.equipment };
          
          let slotToEquip: keyof typeof prev.equipment;

          if (item.type === 'artifact') {
              // Special logic for 2 artifact slots
              if (!currentEquipment.artifact1) slotToEquip = 'artifact1';
              else if (!currentEquipment.artifact2) slotToEquip = 'artifact2';
              else slotToEquip = 'artifact1'; // Default replace first if both full
          } else {
              slotToEquip = item.type as keyof typeof prev.equipment;
          }

          const currentEquipped = currentEquipment[slotToEquip];
          if (currentEquipped) newInventory.push(currentEquipped);
          
          currentEquipment[slotToEquip] = item;

          return {
              ...prev,
              inventory: newInventory,
              equipment: currentEquipment
          };
      });
      playSfx('equip');
  };

  const handleUnequipItem = (slot: keyof Player['equipment']) => {
      if (player.inventory.length >= player.inventorySlots) { showNotification("Çanta dolu!"); return; }
      setPlayer(prev => {
          const itemToUnequip = prev.equipment[slot];
          if (!itemToUnequip) return prev;
          return {
              ...prev,
              equipment: { ...prev.equipment, [slot]: null },
              inventory: [...prev.inventory, itemToUnequip]
          };
      });
      playSfx('equip');
  };

  const handleSellItem = (item: Item) => {
      const sellPrice = Math.floor(item.cost / 2);
      setPlayer(prev => ({
          ...prev,
          silver: prev.silver + sellPrice,
          inventory: prev.inventory.filter(i => i.id !== item.id),
          records: { ...prev.records, totalSilverEarned: prev.records.totalSilverEarned + sellPrice }
      }));
      playSfx('coin');
      showNotification(`Satıldı: +${sellPrice}g`);
  };

  const handleExpandInventory = (cost: number) => {
      if (player.silver >= cost && player.inventorySlots < MAX_INVENTORY_SLOTS) {
          setPlayer(prev => ({
              ...prev,
              silver: prev.silver - cost,
              inventorySlots: prev.inventorySlots + 1
          }));
          playSfx('coin');
          showNotification("Envanter genişletildi!");
      } else {
          showNotification("Yetersiz gümüş!");
      }
  };

  const handleRefreshShop = () => {
    if (player.gems >= 2) {
        setPlayer(prev => ({ ...prev, gems: prev.gems - 2 }));
        refreshShop(player.level);
        playSfx('ui_click');
    }
  };

  // Helper to calculate randomized rewards based on difficulty
  const calculateRewards = (baseSilver: number, baseXp: number, difficulty: QuestDifficulty | 'BOSS') => {
      let multiplier = 1;
      // Increased variance: +/- 20% random swing
      let variance = 0.8 + Math.random() * 0.4; 

      if (difficulty === QuestDifficulty.EASY) multiplier = 1.0;
      else if (difficulty === QuestDifficulty.NORMAL) multiplier = 1.3; // Increased gap
      else if (difficulty === QuestDifficulty.HARD) multiplier = 1.7; // Increased gap
      else if (difficulty === 'BOSS') multiplier = 2.5;

      return {
          silver: Math.floor(baseSilver * multiplier * variance),
          xp: Math.floor(baseXp * multiplier * variance)
      };
  };

  // 1. Trigger Simulation
  const handleStartQuest = (quest: Quest) => {
    if (player.hp <= 5 || activeJob || player.energy < quest.energyCost) return;
    
    // Deduct energy immediately
    setPlayer(p => ({ ...p, energy: p.energy - quest.energyCost }));
    playSfx('ui_click');
    
    // Start Simulation Modal
    setSimulatingQuest(quest);
  };

  // 2. Resolve Combat after simulation
  const resolveQuestCombat = async () => {
    if (!simulatingQuest) return;
    const quest = simulatingQuest;
    setSimulatingQuest(null);

    const { won, log, remainingHp, playerTotalDamage, enemyTotalDamage } = simulateCombat(player, quest.enemyTemplate);
    
    let rewardSilver = 0;
    let rewardXp = 0;
    let droppedItem: Item | null = null;

    if (won) {
        const rewards = calculateRewards(quest.enemyTemplate.silverReward, quest.enemyTemplate.xpReward, quest.difficulty);
        rewardSilver = rewards.silver;
        rewardXp = rewards.xp;

        // --- DROP LOGIC ---
        // Base Drop Chance: 25% + (Luck * 0.5%)
        const dropChance = 25 + (player.stats.luck * 0.5);
        
        if (Math.random() * 100 <= dropChance) {
            const rollType = Math.random();
            
            // 60% Chance for Potion (Consumable)
            if (rollType < 0.6) {
                const randomPotion = POTIONS[Math.floor(Math.random() * POTIONS.length)];
                droppedItem = { ...randomPotion, id: randomPotion.id + Date.now() };
            } 
            // 40% Chance for Equipment/Rune
            else {
                const rarityRoll = Math.random() * 100;
                let targetRarity = Rarity.COMMON;
                
                // Rarity Weights
                if (rarityRoll > 98) targetRarity = Rarity.LEGENDARY; // Top 2%
                else if (rarityRoll > 88) targetRarity = Rarity.EPIC;     // Next 10%
                else if (rarityRoll > 60) targetRarity = Rarity.RARE;     // Next 28%
                // else Common (60%)

                // Combine Pools (excluding potions as they are handled above)
                const pool = [...ITEM_POOL, ...RUNES].filter(i => i.rarity === targetRarity);
                
                if (pool.length > 0) {
                    const baseItem = pool[Math.floor(Math.random() * pool.length)];
                    droppedItem = { ...baseItem, id: baseItem.id + Date.now() };
                }
            }
        }
        
        // Add to inventory check
        let inventoryFull = false;
        if (droppedItem) {
            if (player.inventory.length >= player.inventorySlots) {
                inventoryFull = true;
                droppedItem = null; // Item lost
            }
        }

        setPlayer(prev => {
            let newInventory = [...prev.inventory];
            if (droppedItem && !inventoryFull) {
                newInventory.push(droppedItem);
            }

            return {
                ...prev,
                silver: prev.silver + rewardSilver,
                xp: prev.xp + rewardXp,
                karma: Math.min(100, Math.max(-100, prev.karma + quest.karmaReward)),
                hp: remainingHp,
                inventory: newInventory,
                records: {
                    ...prev.records,
                    totalBattles: prev.records.totalBattles + 1,
                    battlesWon: prev.records.battlesWon + 1,
                    totalSilverEarned: prev.records.totalSilverEarned + rewardSilver,
                    totalXpEarned: prev.records.totalXpEarned + rewardXp,
                    questsCompleted: prev.records.questsCompleted + 1
                }
            };
        });

        if (inventoryFull) {
            showNotification("Çanta dolu! Eşya düştü ama alamadın.");
        }
        playSfx('victory');
    } else {
        setPlayer(prev => ({ 
            ...prev, 
            hp: 1,
            records: {
                ...prev.records,
                totalBattles: prev.records.totalBattles + 1,
                battlesLost: prev.records.battlesLost + 1
            }
        }));
        playSfx('defeat');
    }

    setActiveCombat({ 
        title: quest.name, 
        logs: log, 
        result: won ? 'win' : 'loss',
        summary: {
            playerDmg: playerTotalDamage,
            enemyDmg: enemyTotalDamage,
            rewardSilver,
            rewardXp,
            droppedItem // Include dropped item in summary
        }
    });

    setGeneratingFlavor(true);
    const flavor = await generateBattleReport(player, quest.enemyTemplate.name, won);
    setGeneratingFlavor(false);
    setActiveCombat(prev => prev ? { ...prev, flavorText: flavor } : null);
  };

  // Tournament / Rank Challenge Logic - MODIFIED: Accepts results from view
  const handleRankBattleComplete = async (rank: Rank, won: boolean, remainingHp: number) => {
      
      let rewardSilver = 0;
      
      // Rank rewards use fixed + variance logic but based on rank values
      if (won) {
          const rewards = calculateRewards(rank.rewardSilver, 0, 'BOSS'); // Rank fights are Boss level
          rewardSilver = rewards.silver; // Slightly randomized silver
          playSfx('victory');
      } else {
          playSfx('defeat');
      }

      setPlayer(prev => ({
          ...prev,
          hp: won ? remainingHp : 1, // Update HP based on result
          records: {
              ...prev.records,
              totalBattles: prev.records.totalBattles + 1,
              battlesWon: won ? prev.records.battlesWon + 1 : prev.records.battlesWon,
              battlesLost: !won ? prev.records.battlesLost + 1 : prev.records.battlesLost,
              totalSilverEarned: prev.records.totalSilverEarned + rewardSilver
          }
      }));

      // Only upgrade if player won and hasn't already achieved this rank
      if (won && player.rankIndex < rank.id) {
          setPlayer(prev => ({
              ...prev,
              rank: rank.title,
              rankIndex: rank.id,
              silver: prev.silver + rewardSilver, 
              gems: prev.gems + rank.rewardGems,
              stats: {
                  ...prev.stats,
                  strength: prev.stats.strength + rank.statBonus,
                  skill: prev.stats.skill + rank.statBonus,
                  constitution: prev.stats.constitution + rank.statBonus,
                  luck: prev.stats.luck + rank.statBonus
              }
          }));
          playSfx('level_up');
          showNotification(`RÜTBE ATLADIN: ${rank.title}!`);
      }
  };

  const handleDuelComplete = (won: boolean, silverReward: number, gemsReward: number, lostSilver: number = 0) => {
      let droppedItem: Item | null = null;

      if (won) {
          playSfx('victory');
          // 2% base chance + Luck factor. Max 10%
          const luckFactor = player.stats.luck * 0.1;
          const dropChance = Math.min(10, 2 + luckFactor);
          const roll = Math.random() * 100;
          
          if (roll < dropChance && player.inventory.length < player.inventorySlots) {
             // Drop random item from pool
             const randomItem = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];
             droppedItem = { ...randomItem, id: randomItem.id + Date.now() }; // Unique ID
             showNotification(`DÜELLO GANİMETİ: ${droppedItem.name}!`);
          }

          setPlayer(prev => ({
              ...prev,
              silver: prev.silver + silverReward,
              gems: prev.gems + gemsReward,
              energy: Math.max(0, prev.energy - 10),
              inventory: droppedItem ? [...prev.inventory, droppedItem] : prev.inventory,
              records: {
                  ...prev.records,
                  duelsWon: prev.records.duelsWon + 1,
                  totalBattles: prev.records.totalBattles + 1,
                  battlesWon: prev.records.battlesWon + 1,
                  totalSilverEarned: prev.records.totalSilverEarned + silverReward
              }
          }));
      } else {
          playSfx('defeat');
          setPlayer(prev => ({ 
              ...prev, 
              hp: Math.max(1, prev.hp - 10), 
              energy: Math.max(0, prev.energy - 10),
              silver: Math.max(0, prev.silver - lostSilver), // Penalize silver
              records: {
                  ...prev.records,
                  duelsLost: prev.records.duelsLost + 1,
                  totalBattles: prev.records.totalBattles + 1,
                  battlesLost: prev.records.battlesLost + 1
              }
            }));
      }
  };

  // Exchange Logic
  const handleExchange = (gems: number) => {
      const silverAmount = gems * 250;
      setPlayer(prev => ({
          ...prev,
          gems: prev.gems - gems,
          silver: prev.silver + silverAmount
      }));
      playSfx('coin');
      showNotification(`${gems} Mücevher bozduruldu: +${silverAmount} Gümüş`);
  };

  // Promo Code Logic
  const handleRedeemCode = (code: string) => {
      if (player.claimedCodes.includes(code)) {
          showNotification("Bu kod zaten kullanıldı!");
          return;
      }

      if (code.toUpperCase() === "DEMO1") {
          setPlayer(prev => ({
              ...prev,
              silver: prev.silver + 200000,
              gems: prev.gems + 5000,
              claimedCodes: [...prev.claimedCodes, code]
          }));
          playSfx('level_up');
          showNotification("Kod Onaylandı: 200k Gümüş & 5k Mücevher!");
      } else {
          showNotification("Geçersiz Kod!");
      }
  };

  const renderActionResultModal = () => {
    if (!actionResult) return null;

    const isSuccess = actionResult.type === 'success' || actionResult.type === 'socket';
    const isSocket = actionResult.type === 'socket';

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setActionResult(null)}>
            <div className={`w-full max-w-sm bg-[#151210] border-2 rounded-xl p-6 relative shadow-2xl text-center overflow-hidden
                ${isSuccess ? 'border-green-800' : 'border-red-800'}
            `} onClick={e => e.stopPropagation()}>
                
                {/* Background Glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[80px] rounded-full opacity-20 pointer-events-none
                    ${isSuccess ? 'bg-green-500' : 'bg-red-500'}
                `}></div>

                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-4 mb-4 shadow-xl relative z-10
                    ${isSuccess ? 'bg-green-950 border-green-600 text-green-500' : 'bg-red-950 border-red-600 text-red-500'}
                `}>
                    {isSuccess 
                        ? (isSocket ? <Gem size={40} /> : <CheckCircle2 size={40} />)
                        : <XCircle size={40} />
                    }
                </div>

                <h2 className={`text-2xl rpg-font mb-2 relative z-10 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                    {actionResult.title}
                </h2>
                <p className="text-stone-300 mb-6 relative z-10">{actionResult.message}</p>

                {/* Item Display */}
                <div className="bg-stone-900/80 p-4 rounded border border-stone-800 mb-6 relative z-10 flex items-center gap-4">
                    <div className={`w-16 h-16 bg-stone-950 rounded border flex items-center justify-center
                         ${actionResult.item.rarity === 'Efsanevi' ? 'border-amber-500' : 
                           actionResult.item.rarity === 'Destansı' ? 'border-purple-500' : 'border-stone-600'}
                    `}>
                        <ItemIconBig type={actionResult.item.type} rarity={actionResult.item.rarity} size={32} />
                    </div>
                    <div className="text-left">
                        <div className={`font-bold text-sm ${
                           actionResult.item.rarity === 'Efsanevi' ? 'text-amber-500' : 
                           actionResult.item.rarity === 'Destansı' ? 'text-purple-400' : 
                           actionResult.item.rarity === 'Nadir' ? 'text-cyan-400' : 'text-stone-300'}
                        `}>
                            {actionResult.item.name}
                        </div>
                        
                        {/* Level Change */}
                        {actionResult.type === 'success' && actionResult.oldLevel !== undefined && actionResult.newLevel !== undefined && (
                            <div className="flex items-center gap-2 text-xs font-bold mt-1">
                                <span className="text-stone-500">+{actionResult.oldLevel}</span>
                                <ChevronRight size={10} className="text-stone-600" />
                                <span className="text-green-500">+{actionResult.newLevel}</span>
                            </div>
                        )}

                         {/* Rune Info */}
                         {actionResult.type === 'socket' && actionResult.subItem && (
                            <div className="flex items-center gap-1 text-xs font-bold mt-1 text-purple-400">
                                <Gem size={10} /> +{actionResult.subItem.name}
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => setActionResult(null)}
                    className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold border border-stone-600 rounded relative z-10"
                >
                    Tamam
                </button>
            </div>
        </div>
    );
  };

  // --- CHARACTER CREATION ---

  const finalizeCreation = () => {
      if (!creationName.trim()) return;
      
      const isAdmin = creationName.trim().toLowerCase() === 'admin';
      
      let finalStats = { ...INITIAL_PLAYER_STATS };
      let startLevel = 1;
      let startSilver = 100;
      let startGems = 5;
      let inventorySlots = INITIAL_INVENTORY_SLOTS;

      if (isAdmin) {
          // ADMIN GOD MODE
          startLevel = 200;
          startSilver = 10000000;
          startGems = 10000;
          inventorySlots = MAX_INVENTORY_SLOTS;
          finalStats = {
              strength: 999,
              skill: 999,
              constitution: 999,
              luck: 999,
              weaponArt: 999,
              defenseArt: 999
          };
      } else {
          // Normal Creation
          const mods = RACE_BONUSES[creationRace].mods;
          (Object.keys(mods) as Array<keyof typeof mods>).forEach(stat => {
              finalStats[stat] += (mods[stat] || 0);
          });
      }

      setPlayer(prev => ({
          ...prev,
          name: creationName,
          race: creationRace,
          gender: creationGender,
          level: startLevel,
          xp: 0,
          maxXp: 100 * Math.pow(XP_SCALING_FACTOR, startLevel - 1),
          silver: startSilver,
          gems: startGems,
          appearance: { height: 175, weight: 80, imgUrl: creationRace },
          stats: finalStats,
          inventorySlots: inventorySlots,
          properties: {},
          // Recalculate HP based on new stats immediately
          hp: finalStats.constitution * HP_PER_CONSTITUTION,
          maxHp: finalStats.constitution * HP_PER_CONSTITUTION,
          energy: isAdmin ? 100 : (20 + Math.floor(finalStats.constitution * 0.5)),
          maxEnergy: isAdmin ? 100 : (20 + Math.floor(finalStats.constitution * 0.5))
      }));
      setCurrentView(View.CHARACTER);
      playSfx('level_up');
  };

  // Welcome Screen
  if (currentView === View.WELCOME) {
    return (
      <div className="min-h-screen h-full bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="z-10 w-full max-w-lg bg-stone-900/90 border-y-4 border-amber-800 p-12 text-center shadow-[0_0_150px_rgba(245,158,11,0.15)] backdrop-blur-sm">
            <div className="mb-8 animate-in zoom-in duration-700">
                <IconGameLogo className="mx-auto drop-shadow-2xl" size={160} />
            </div>
            
            <h1 className="text-5xl rpg-font text-stone-100 mb-0 tracking-wide text-shadow">Iron & Glory</h1>
            <h2 className="text-2xl text-amber-600 font-serif italic tracking-widest mt-1 mb-6">Knight's Tale</h2>

            <div className="h-0.5 w-24 bg-amber-700 mx-auto mb-8"></div>
            <p className="text-stone-400 font-serif italic text-xl mb-10">"Kaderin çelikle yazıldığı çağ."</p>

            <button 
              onClick={() => {
                  setIsMusicPlaying(true); // Start Music
                  setCurrentView(View.CREATION);
                  playSfx('ui_click');
              }}
              className="w-full py-4 bg-gradient-to-r from-amber-900 to-amber-800 border border-amber-600 text-amber-100 font-bold text-lg uppercase tracking-[0.2em] hover:from-amber-800 hover:to-amber-700 transition-all hover:scale-[1.02] shadow-lg"
            >
              Kılıcını Kuşan
            </button>
        </div>
      </div>
    );
  }

  // Creation Screen
  if (currentView === View.CREATION) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
             <div className="w-full max-w-5xl bg-stone-900 border border-stone-800 shadow-2xl flex flex-col md:flex-row min-h-[600px] overflow-hidden rounded-lg">
                 {/* Visual Preview */}
                 <div className="w-full md:w-1/3 bg-[#0c0a09] relative flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-stone-800">
                     <div className="w-64 h-64 flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-amber-900/20 blur-3xl rounded-full"></div>
                        {creationRace === 'İnsan' && <IconAvatarHuman size={200} className="text-stone-300 drop-shadow-2xl" />}
                        {creationRace === 'Ork' && <IconAvatarOrc size={200} className="text-stone-300 drop-shadow-2xl" />}
                        {creationRace === 'Elf' && <IconAvatarElf size={200} className="text-stone-300 drop-shadow-2xl" />}
                        {creationRace === 'Vampir' && <IconAvatarVampire size={200} className="text-stone-300 drop-shadow-2xl" />}
                     </div>
                     <h2 className="text-4xl rpg-font text-amber-500 z-10 text-center">{creationName || "???"}</h2>
                     <p className="text-stone-500 z-10 mt-2 uppercase tracking-widest text-sm">{creationRace}</p>
                 </div>

                 {/* Controls */}
                 <div className="w-full md:w-2/3 p-6 md:p-10 bg-stone-900/95 flex flex-col justify-center">
                     <h2 className="text-3xl rpg-font text-stone-200 mb-8 border-b border-stone-800 pb-4">Kahramanını Yarat</h2>
                     
                     <div className="space-y-8">
                         <div>
                            <label className="text-xs text-stone-500 uppercase tracking-widest font-bold">İsim</label>
                            <input type="text" value={creationName} onChange={(e) => setCreationName(e.target.value)}
                                className="w-full bg-stone-950 border border-stone-700 p-4 text-stone-200 focus:border-amber-700 outline-none text-lg rounded" placeholder="Kahramanın adı..." />
                         </div>

                         <div>
                            <label className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-3 block">Irk Seçimi</label>
                            <div className="grid grid-cols-4 gap-2">
                                {(Object.keys(RACE_BONUSES) as Race[]).map(race => (
                                    <button 
                                        key={race} 
                                        onClick={() => setCreationRace(race)}
                                        className={`p-3 border rounded transition-all flex flex-col items-center gap-2 ${creationRace === race ? 'bg-amber-900/30 border-amber-600 text-amber-500' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600'}`}
                                    >
                                        {race === 'İnsan' && <IconAvatarHuman size={32} />}
                                        {race === 'Ork' && <IconAvatarOrc size={32} />}
                                        {race === 'Elf' && <IconAvatarElf size={32} />}
                                        {race === 'Vampir' && <IconAvatarVampire size={32} />}
                                        <span className="text-xs font-bold uppercase">{race}</span>
                                    </button>
                                ))}
                            </div>
                         </div>

                         <div className="bg-stone-950 p-4 rounded border border-stone-800">
                             <div className="flex justify-between items-start mb-3">
                                <h3 className="text-amber-500 font-bold text-lg">{creationRace} Özellikleri</h3>
                                <div className="text-xs text-stone-500 italic max-w-xs text-right">{RACE_BONUSES[creationRace].desc}</div>
                             </div>
                             <div className="grid grid-cols-2 gap-2 text-sm">
                                 {Object.entries(RACE_BONUSES[creationRace].mods).map(([stat, val]) => (
                                     <div key={stat} className="flex justify-between border-b border-stone-800/50 pb-1">
                                         <span className="capitalize text-stone-400">
                                            {stat === 'strength' ? 'Güç' : stat === 'skill' ? 'Kabiliyet' : stat === 'constitution' ? 'Bünye' : stat === 'luck' ? 'Şans' : stat === 'weaponArt' ? 'Silah S.' : 'Savunma S.'}
                                         </span>
                                         <span className={`font-mono font-bold ${(val as number) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                             {(val as number) > 0 ? '+' : ''}{val as number}
                                         </span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                        
                         <button onClick={finalizeCreation} disabled={!creationName.trim()}
                            className={`w-full py-4 font-bold text-xl uppercase tracking-widest border transition-all rounded shadow-lg ${creationName.trim() ? 'bg-amber-800 border-amber-600 text-white hover:bg-amber-700' : 'bg-stone-800 border-stone-700 text-stone-600'}`}>
                             Maceraya Başla
                         </button>
                     </div>
                 </div>
             </div>
        </div>
      );
  }

  // --- MENU ITEMS FOR NAVIGATION ---
  const NAVIGATION_ITEMS = [
      { id: View.CHARACTER, label: 'Karakter', icon: IconHelmet },
      { id: View.QUESTS, label: 'Seferler', icon: IconScroll },
      { id: View.TOURNAMENT, label: 'Turnuva', icon: IconTournament },
      { id: View.DUEL, label: 'Arena', icon: IconCrossedSwords },
      { id: View.WORK, label: 'Çalışma', icon: IconHammer, active: activeJob },
      { id: View.PROPERTIES, label: 'Mülkler', icon: IconPropertyHome },
      { id: View.SHOP, label: 'Pazar Meydanı', icon: IconBag },
      { id: View.STATISTICS, label: 'Savaş Kayıtları', icon: IconStats },
      { id: View.EXCHANGE, label: 'Takas', icon: IconExchange },
      { id: View.BANK, label: 'Krallık Hazinesi', icon: IconBank },
      { id: View.ORACLE, label: 'Kahin', icon: IconEye },
  ];

  // Primary mobile nav items (4 most important)
  const MOBILE_MAIN_NAV = [View.CHARACTER, View.QUESTS, View.WORK, View.SHOP];

  // MAIN GAME LAYOUT
  return (
    <div className="min-h-screen h-full bg-[#0c0a09]/90 text-stone-300 font-sans flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Background Audio */}
      <audio ref={audioRef} src={BACKGROUND_MUSIC_URL} loop />

      {/* Toast */}
      {notification && (
        <div className="fixed top-20 md:top-6 left-1/2 -translate-x-1/2 z-[200] bg-stone-900 border border-amber-600 text-amber-100 px-6 py-3 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-in fade-in slide-in-from-top rounded-full">
            <IconHelmet size={20} /> <span className="font-bold tracking-wide text-sm">{notification}</span>
        </div>
      )}

      {/* --- MOBILE TOP HEADER --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0807] border-b border-stone-800 z-40 flex items-center justify-between px-4 pt-safe shadow-lg">
          <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-600 overflow-hidden relative">
                  <IconAvatarHuman className="w-full h-full text-stone-400" />
              </div>
              <div className="flex flex-col">
                  <span className="text-sm font-bold text-stone-200 leading-none">{player.name}</span>
                  <span className="text-[10px] text-amber-500 font-bold uppercase">Sv. {player.level}</span>
              </div>
          </div>
          
          <div className="flex items-center gap-3">
              {/* Mobile Audio Toggles */}
              <div className="flex items-center bg-stone-900 rounded-full border border-stone-800 px-2 py-1 gap-2">
                  <button onClick={toggleMusicMute} className={`${isMusicMuted ? 'text-stone-600' : 'text-amber-500'} hover:text-white`}>
                      {isMusicMuted ? <VolumeX size={14} /> : <Music size={14} />}
                  </button>
                  <div className="w-px h-3 bg-stone-700"></div>
                  <button onClick={toggleSfxMute} className={`${isSfxMuted ? 'text-stone-600' : 'text-emerald-500'} hover:text-white`}>
                      {isSfxMuted ? <VolumeX size={14} /> : <Speaker size={14} />}
                  </button>
              </div>

              <div className="w-px h-8 bg-stone-800"></div>
              <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                      <IconHeart size={10} /> {Math.floor(player.hp)}
                  </div>
                  <div className="flex items-center gap-1 text-cyan-500 text-xs font-bold">
                      <IconEnergy size={10} /> {player.energy}
                  </div>
              </div>
              <div className="w-px h-8 bg-stone-800"></div>
              <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      {player.silver} <IconCoin size={10} />
                  </div>
                  <div className="flex items-center gap-1 text-purple-500 text-xs font-bold">
                      {player.gems} <IconGem size={10} />
                  </div>
              </div>
          </div>
      </div>

      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex w-64 bg-[#0a0807] border-r border-stone-800 flex-col shrink-0 z-20 shadow-2xl relative h-screen">
          {/* Header Logo Area */}
          <div className="p-6 flex flex-col items-center border-b border-stone-800 bg-stone-900/50">
             <IconGameLogo size={56} className="mb-3 text-amber-600 drop-shadow-lg" />
             <div className="text-center">
                 <h1 className="rpg-font text-2xl text-amber-500 tracking-wider leading-none">Iron & Glory</h1>
                 <span className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold block mt-1">Knight's Tale</span>
             </div>
          </div>

          {/* Player Quick Stats */}
          <div className="bg-[#0c0a09] border-b border-stone-800">
             <div className="px-6 pt-5 pb-2">
                <div className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Karakter</div>
                <h2 className="text-stone-200 font-bold text-xl rpg-font leading-none truncate">{player.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="text-amber-600 text-xs font-bold uppercase tracking-widest">{player.rank}</div>
                    <div className="w-1 h-1 bg-stone-600 rounded-full"></div>
                    <div className="text-stone-400 text-xs">Sv. <span className="text-stone-200 font-bold text-sm">{player.level}</span></div>
                </div>
             </div>

             <div className="px-6 pb-2 grid grid-cols-2 gap-3 text-xs font-medium mt-2">
                 <div className="flex items-center gap-2 text-stone-400 bg-stone-900/50 p-1.5 rounded border border-stone-800" title="Can Puanı">
                     <IconHeart size={14} className="text-red-600" /> <span>{Math.floor(player.hp)}/{player.maxHp}</span>
                 </div>
                 <div className="flex items-center gap-2 text-stone-400 bg-stone-900/50 p-1.5 rounded border border-stone-800" title="Enerji">
                     <IconEnergy size={14} className="text-cyan-600" /> <span>{player.energy}/{player.maxEnergy}</span>
                 </div>
                 <div className="flex items-center gap-2 text-stone-400 bg-stone-900/50 p-1.5 rounded border border-stone-800" title="Gümüş">
                     <IconCoin size={14} className="text-amber-500" /> <span>{player.silver}</span>
                 </div>
                 <div className="flex items-center gap-2 text-stone-400 bg-stone-900/50 p-1.5 rounded border border-stone-800" title="Mücevher">
                     <IconGem size={14} className="text-purple-500" /> <span>{player.gems}</span>
                 </div>
             </div>

             {/* XP Bar */}
             <div className="px-6 pb-5">
                 <div className="flex justify-between text-[10px] text-stone-500 mb-1 uppercase font-bold tracking-wider">
                     <span>Tecrübe</span>
                     <span className="text-cyan-600">{player.xp}/{player.maxXp}</span>
                 </div>
                 <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                     <div className="h-full bg-cyan-700" style={{ width: `${(player.xp / player.maxXp) * 100}%` }} />
                 </div>
             </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
             {NAVIGATION_ITEMS.map(item => (
                 <button 
                    key={item.id}
                    onClick={() => { setCurrentView(item.id); playSfx('ui_click'); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border transition-all group relative overflow-hidden text-sm ${
                        currentView === item.id 
                        ? 'bg-amber-950/30 border-amber-900/50 text-amber-500' 
                        : 'bg-transparent border-transparent text-stone-500 hover:bg-stone-900 hover:text-stone-300'
                    }`}
                 >
                    <item.icon size={18} className={currentView === item.id ? 'text-amber-500' : 'text-stone-600 group-hover:text-stone-400'} />
                    <span className="font-bold tracking-wide uppercase">{item.label}</span>
                    {item.active && <span className="absolute right-3 w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>}
                 </button>
             ))}
          </nav>

          {/* Save / Settings & Audio Toggle */}
          <div className="p-4 border-t border-stone-800 bg-[#0c0a09] space-y-3">
              {/* Save & Reset */}
              <div className="flex gap-2">
                  <button onClick={handleSaveGame} className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-stone-900 border border-stone-700 text-emerald-500 hover:bg-emerald-900/20 hover:border-emerald-600 hover:text-emerald-400 transition-colors">
                      <Save size={16} /> <span className="text-[10px] font-bold uppercase">Kaydet</span>
                  </button>
                  <button onClick={handleResetGame} className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-stone-900 border border-stone-700 text-red-500 hover:bg-red-900/20 hover:border-red-600 hover:text-red-400 transition-colors">
                      <Trash2 size={16} /> <span className="text-[10px] font-bold uppercase">Sıfırla</span>
                  </button>
              </div>

              <div className="flex gap-2">
                  <button 
                    onClick={toggleMusicMute}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded border border-stone-800 text-stone-500 hover:bg-stone-900 hover:text-amber-500 transition-colors"
                  >
                      {isMusicMuted ? <VolumeX size={16} /> : <Music size={16} />}
                      <span className="text-[10px] font-bold uppercase">{isMusicMuted ? "Müzik Kapalı" : "Müzik Açık"}</span>
                  </button>
                  <button 
                    onClick={toggleSfxMute}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded border border-stone-800 text-stone-500 hover:bg-stone-900 hover:text-emerald-500 transition-colors"
                  >
                      {isSfxMuted ? <VolumeX size={16} /> : <Speaker size={16} />}
                      <span className="text-[10px] font-bold uppercase">{isSfxMuted ? "SFX Kapalı" : "SFX Açık"}</span>
                  </button>
              </div>
          </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0c0a09] border-t border-stone-800 z-40 flex items-center justify-around h-16 pb-safe safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          {MOBILE_MAIN_NAV.map(viewId => {
              const item = NAVIGATION_ITEMS.find(i => i.id === viewId);
              if (!item) return null;
              const isActive = currentView === viewId;
              return (
                  <button 
                    key={viewId}
                    onClick={() => { setCurrentView(viewId); setIsMobileMenuOpen(false); playSfx('ui_click'); }}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-amber-500' : 'text-stone-500'}`}
                  >
                      <item.icon size={20} className={isActive ? 'drop-shadow-md' : ''} />
                      <span className="text-[9px] font-bold uppercase">{item.label}</span>
                      {item.active && <div className="w-1 h-1 bg-amber-500 rounded-full absolute top-3 right-6 animate-ping" />}
                  </button>
              )
          })}
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); playSfx('ui_click'); }}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isMobileMenuOpen ? 'text-amber-500' : 'text-stone-500'}`}
          >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="text-[9px] font-bold uppercase">Menü</span>
          </button>
      </div>

      {/* --- MOBILE FULL MENU OVERLAY --- */}
      {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/95 backdrop-blur-sm pt-20 pb-24 px-6 animate-in fade-in slide-in-from-bottom-10 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 pb-4">
                  {NAVIGATION_ITEMS.map(item => {
                      // Skip items already in bottom nav if desired, or keep all
                      const isMain = MOBILE_MAIN_NAV.includes(item.id);
                      return (
                          <button
                            key={item.id}
                            onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); playSfx('ui_click'); }}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                                currentView === item.id 
                                ? 'bg-amber-900/20 border-amber-700 text-amber-500' 
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                            }`}
                          >
                              <item.icon size={32} />
                              <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>
                          </button>
                      )
                  })}
              </div>

              {/* Mobile Save/Reset Buttons */}
              <div className="border-t border-stone-800 pt-4 mt-2">
                  <h3 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-3">Oyun Ayarları</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => { handleSaveGame(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 p-3 rounded bg-stone-900 border border-emerald-900/50 text-emerald-500 font-bold uppercase text-xs">
                          <Save size={16} /> Kaydet
                      </button>
                      <button onClick={() => { handleResetGame(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 p-3 rounded bg-stone-900 border border-red-900/50 text-red-500 font-bold uppercase text-xs">
                          <Trash2 size={16} /> Sıfırla
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto h-screen w-full pt-16 md:pt-0 pb-16 md:pb-0 md:h-auto">
         <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-full pb-safe">
            {currentView === View.CHARACTER && (
                <CharacterView player={player} onUpgradeStat={handleUpgradeStat} onEquip={handleEquipItem} onUnequip={handleUnequipItem} onSell={handleSellItem} onUse={handleUseItem} onExpandInventory={handleExpandInventory} playSfx={playSfx} />
            )}
            {currentView === View.QUESTS && <QuestView player={player} onStartQuest={handleStartQuest} playSfx={playSfx} />}
            {currentView === View.WORK && <WorkView player={player} activeJob={activeJob} jobEndTime={jobEndTime} onStartJob={startJob} playSfx={playSfx} />}
            {currentView === View.DUEL && <DuelView player={player} onDuelComplete={handleDuelComplete} playSfx={playSfx} />}
            {currentView === View.TOURNAMENT && <TournamentView player={player} onChallengeRank={handleRankBattleComplete} playSfx={playSfx} />}
            {currentView === View.SHOP && <ShopView player={player} shopInventory={shopInventory} onBuyItem={handleBuyItem} onRefreshShop={handleRefreshShop} onUpgradeItem={handleUpgradeItem} onSocketRune={handleSocketRune} playSfx={playSfx} />}
            {currentView === View.PROPERTIES && <PropertyView player={player} onBuyProperty={handleBuyProperty} />}
            {currentView === View.STATISTICS && <StatisticsView player={player} />}
            {currentView === View.EXCHANGE && <ExchangeView player={player} onExchange={handleExchange} />}
            {currentView === View.BANK && <BankView player={player} onRedeemCode={handleRedeemCode} />}
            {currentView === View.ORACLE && <OracleView player={player} />}
         </div>
      </main>

      {/* COMBAT SIMULATION OVERLAY */}
      {simulatingQuest && (
          <CombatSimulationModal 
              player={player} 
              enemy={simulatingQuest.enemyTemplate} 
              onComplete={resolveQuestCombat}
              playSfx={playSfx}
          />
      )}

      {/* ACTION RESULT MODAL (Upgrade / Rune) */}
      {renderActionResultModal()}

      {/* LEVEL UP POPUP MODAL - REDESIGNED */}
      {levelUpLevel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
             {/* Dynamic Background Effect */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/10 blur-[100px] rounded-full animate-pulse"></div>
                 <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
             </div>
             
             {/* Modal Container */}
             <div className="relative z-10 w-full max-w-lg animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 p-4">
                
                {/* Decorative Elements around Card */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <Crown size={64} className="text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-bounce" />
                </div>

                <div className="bg-[#151210] border-2 border-amber-600/50 p-1 rounded-2xl shadow-[0_0_100px_rgba(217,119,6,0.25)] group">
                    <div className="bg-[#0c0a09] border border-stone-800 rounded-xl p-8 flex flex-col items-center relative overflow-hidden">
                        
                        {/* Shimmer Effects */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                        <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-5 animate-shine" />

                        {/* Title */}
                        <div className="mb-2">
                           <span className="text-amber-500 font-bold tracking-[0.5em] text-xs uppercase opacity-80">Iron & Glory</span>
                        </div>
                        <h2 className="text-5xl rpg-font text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 drop-shadow-sm mb-8 animate-in slide-in-from-top-5 duration-700 text-center">
                            SEVİYE ATLADIN
                        </h2>

                        {/* Level Number Badge */}
                        <div className="relative mb-10 group-hover:scale-105 transition-transform duration-500">
                            {/* Rotating Rings */}
                            <div className="absolute inset-0 border-4 border-dashed border-amber-900/40 rounded-full animate-[spin_12s_linear_infinite]"></div>
                            <div className="absolute -inset-4 border border-amber-800/30 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
                            
                            {/* Inner Circle Glow */}
                            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>

                            <div className="w-40 h-40 bg-gradient-to-br from-stone-800 to-black rounded-full border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center relative z-10">
                                <span className="text-8xl rpg-font text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">{levelUpLevel}</span>
                            </div>
                            
                            {/* Stars */}
                            <Sparkles className="absolute -top-2 -right-4 text-yellow-300 w-8 h-8 animate-pulse" />
                            <Sparkles className="absolute bottom-2 -left-6 text-yellow-300 w-6 h-6 animate-pulse delay-300" />
                        </div>

                        {/* Rewards Grid Cards */}
                        <div className="grid grid-cols-3 gap-3 w-full mb-8">
                             <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg flex flex-col items-center gap-2 text-center hover:bg-stone-900 hover:border-amber-900/50 transition-colors">
                                 <div className="p-2 rounded-full bg-red-900/20 text-red-500"><IconHeart size={20} /></div>
                                 <div>
                                     <div className="text-[10px] text-stone-500 uppercase font-bold">Can Puanı</div>
                                     <div className="text-stone-300 font-bold text-xs">Yenilendi</div>
                                 </div>
                             </div>
                             <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg flex flex-col items-center gap-2 text-center hover:bg-stone-900 hover:border-amber-900/50 transition-colors">
                                 <div className="p-2 rounded-full bg-cyan-900/20 text-cyan-500"><IconEnergy size={20} /></div>
                                 <div>
                                     <div className="text-[10px] text-stone-500 uppercase font-bold">Enerji</div>
                                     <div className="text-stone-300 font-bold text-xs">Yenilendi</div>
                                 </div>
                             </div>
                             <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg flex flex-col items-center gap-2 text-center hover:bg-stone-900 hover:border-amber-900/50 transition-colors">
                                 <div className="p-2 rounded-full bg-amber-900/20 text-amber-500"><ArrowUp size={20} /></div>
                                 <div>
                                     <div className="text-[10px] text-stone-500 uppercase font-bold">Pazar</div>
                                     <div className="text-stone-300 font-bold text-xs">Güncellendi</div>
                                 </div>
                             </div>
                        </div>

                        {/* Button */}
                        <button 
                            onClick={() => { setLevelUpLevel(null); playSfx('ui_click'); }}
                            className="relative w-full py-4 bg-gradient-to-r from-stone-800 to-stone-900 text-stone-300 font-bold text-lg rounded-lg border border-stone-700 uppercase tracking-[0.2em] transition-all hover:text-white hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] overflow-hidden group/btn"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Zafere Devam Et <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform"/>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-900/0 via-amber-600/20 to-amber-900/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                        </button>

                    </div>
                </div>
             </div>
        </div>
      )}

      {/* COMBAT OVERLAY MODAL */}
      {activeCombat && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-stone-900 border border-stone-700 rounded shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                <h3 className="rpg-font text-xl text-amber-500">{activeCombat.title}</h3>
                <button onClick={() => {
                    if (activeCombat.onClose) activeCombat.onClose();
                    else setActiveCombat(null);
                    playSfx('ui_click');
                }}><X className="text-stone-500 hover:text-white" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-[#0c0a09] relative custom-scrollbar">
                
                {/* BATTLE RESULT PARCHMENT (Dark Theme) */}
                {activeCombat.result && activeCombat.summary && (
                    <div className="p-6">
                        <div className="bg-[#1c1917] text-stone-300 p-8 rounded shadow-2xl max-w-md mx-auto text-center border-2 border-amber-900/30 relative font-serif overflow-hidden">
                             {/* Background Texture Overlay */}
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50 pointer-events-none" />
                             <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                             
                             <div className="relative z-10">
                                 <h2 className={`text-3xl font-bold mb-4 drop-shadow-md rpg-font tracking-wide ${activeCombat.result === 'win' ? 'text-amber-500' : 'text-red-600'}`}>
                                     {activeCombat.result === 'win' ? `${player.name} kazandı` : `${player.name} kaybetti`}
                                 </h2>
                                 
                                 {activeCombat.result === 'win' ? (
                                     <div className="space-y-3 mb-6">
                                         <p className="text-xl text-stone-300 font-serif">
                                             <span className="font-bold text-amber-400 text-2xl">{activeCombat.summary.rewardSilver} Gümüş</span> değerinde bol kazanç.
                                         </p>
                                         <p className="text-lg text-stone-400 font-serif">
                                             {player.name}, <span className="font-bold text-cyan-500">{activeCombat.summary.rewardXp} TP</span> kazandı.
                                         </p>
                                     </div>
                                 ) : (
                                     <div className="space-y-3 mb-6">
                                         <p className="text-xl text-red-400 font-bold">Ağır bir yenilgi.</p>
                                         <p className="text-lg text-stone-500">Savaş alanından yaralı ayrıldın.</p>
                                     </div>
                                 )}
                                 
                                 {/* --- ITEM DROP VISUAL --- */}
                                 {activeCombat.result === 'win' && activeCombat.summary.droppedItem && (
                                     <div className="my-6 p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg relative animate-in zoom-in-95 duration-700">
                                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-900 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500 uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                             <Gift size={10} /> Savaş Ganimeti
                                         </div>
                                         <div className="flex flex-col items-center gap-2">
                                             <div className="w-16 h-16 bg-stone-900 rounded-lg border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                                 <ItemIconBig type={activeCombat.summary.droppedItem.type} rarity={activeCombat.summary.droppedItem.rarity} size={40} />
                                             </div>
                                             <div>
                                                 <div className={`font-bold text-sm ${
                                                     activeCombat.summary.droppedItem.rarity === Rarity.LEGENDARY ? 'text-amber-500' :
                                                     activeCombat.summary.droppedItem.rarity === Rarity.EPIC ? 'text-purple-400' :
                                                     activeCombat.summary.droppedItem.rarity === Rarity.RARE ? 'text-cyan-400' : 'text-stone-300'
                                                 }`}>
                                                     {activeCombat.summary.droppedItem.name}
                                                 </div>
                                                 <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                                                     {activeCombat.summary.droppedItem.rarity}
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 )}

                                 <div className="h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent w-full my-6" />
                                 
                                 <div className="space-y-2 text-sm text-stone-400 font-medium">
                                     <div className="flex justify-between px-4 py-1 hover:bg-white/5 rounded transition-colors">
                                         <span>Taarruzcu Hasarı:</span>
                                         <span className="font-bold text-amber-600 font-mono text-base">{activeCombat.summary.playerDmg}</span>
                                     </div>
                                     <div className="flex justify-between px-4 py-1 hover:bg-white/5 rounded transition-colors">
                                         <span>Savunmacı Hasarı:</span>
                                         <span className="font-bold text-red-500 font-mono text-base">{activeCombat.summary.enemyDmg}</span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* LOGS */}
                <div className="p-6 font-mono text-sm space-y-2 pt-0 pb-20">
                    <h4 className="text-stone-500 text-xs uppercase tracking-widest mb-2 border-b border-stone-800 pb-1">Savaş Kayıtları</h4>
                    {activeCombat.logs.map((log, i) => (
                        <div key={i} className={`p-2 border-l-2 ${
                            log.type === 'win' ? 'text-amber-400 border-amber-500 bg-amber-900/10 py-4 text-center text-lg' :
                            log.type === 'loss' ? 'text-red-500 border-red-500 bg-red-900/10 py-4 text-center text-lg' :
                            log.type === 'crit' ? 'text-orange-300 border-orange-500' :
                            log.type === 'player-hit' ? 'text-green-400 border-green-800' :
                            log.type === 'enemy-hit' ? 'text-red-400 border-red-800' :
                            'text-stone-500 border-stone-800'
                        }`}>
                            {log.text}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 border-t border-stone-800 bg-stone-900 pb-safe">
                {generatingFlavor ? <div className="text-center text-stone-500 italic">Savaş kaydediliyor...</div> : 
                 activeCombat.flavorText && <div className="text-center italic text-stone-400 mb-4">"{activeCombat.flavorText}"</div>}
                <button onClick={() => {
                    if (activeCombat.onClose) activeCombat.onClose();
                    else setActiveCombat(null);
                    playSfx('ui_click');
                }} className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold border border-stone-600 mb-4 md:mb-0">
                    KAPAT
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
