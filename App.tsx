
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Item, Quest, CombatLogEntry, Job, ItemType, Race, Gender, Rank, QuestDifficulty, Property, Rarity, Kingdom, MapNode, IncomingAttack, ActionReport } from './types';
import { INITIAL_PLAYER_STATS, HP_PER_CONSTITUTION, XP_SCALING_FACTOR, ITEM_POOL, RANKS, INITIAL_INVENTORY_SLOTS, MAX_INVENTORY_SLOTS, STAT_UPGRADE_BASE_COST, PROPERTIES, UPGRADE_RATES, POTIONS, RUNES, SFX_URLS, UPGRADE_COSTS, SOLDIER_COST, KINGDOM_MAP_NODES, UPGRADE_MULTIPLIERS } from './constants';
import { simulateCombat } from './services/gameLogic';
import { generateBattleReport } from './services/geminiService';
import { CharacterView } from './components/CharacterView';
import { QuestView } from './components/QuestView';
import { ShopView } from './components/ShopView';
import { WorkView } from './components/WorkView';
import { DuelView } from './components/DuelView';
import { TournamentView } from './components/TournamentView';
import { PropertyView } from './components/PropertyView';
import { StatisticsView } from './components/StatisticsView';
import { ExchangeView } from './components/ExchangeView';
import { BankView } from './components/BankView';
import { KingdomView } from './components/KingdomView';
import { CombatSimulationModal } from './components/CombatSimulationModal'; 
import { ActionReportModal } from './components/ActionReportModal';
import { KingdomDefenseModal } from './components/KingdomDefenseModal';
import { MapSimulationModal } from './components/MapSimulationModal';
import { X, ChevronRight, Check, Activity, Sparkles, Crown, Zap, Shield, ArrowUp, Menu, MoreHorizontal, Hammer, Skull, Gem, CheckCircle2, XCircle, FlaskConical, Gift, Volume2, VolumeX, Music, Speaker, Save, Trash2, LogOut, Loader2, Info, BookOpen } from 'lucide-react';
import { IconHeart, IconEnergy, IconCoin, IconGem, IconHelmet, IconScroll, IconCrossedSwords, IconHammer, IconBag, IconEye, IconGameLogo, IconAvatarHuman, IconAvatarOrc, IconAvatarElf, IconAvatarVampire, IconTournament, IconPropertyHome, IconStats, IconExchange, IconBank, IconSword, IconArmor, IconShield, IconPaw, IconBoot, IconRelic, IconFire, IconIce, IconShock, IconPoison, IconKingdom } from './components/Icons';

// --- GAME CONSTANTS ---
const STARTING_KNIFE: Item = {
    id: 'starting_knife',
    name: 'Acemi Bıçağı',
    type: 'weapon',
    bonus: 1,
    cost: 0,
    rarity: Rarity.COMMON,
    description: "Her efsane küçük bir adımla başlar.",
    minLevel: 1
};

// Helper to generate random exchange rate between 74 and 397
const generateExchangeRate = () => Math.floor(Math.random() * (397 - 74 + 1)) + 74;

// Helper format number
const fmt = (num: number) => num.toLocaleString('tr-TR');

// Calculate XP Requirement for NEXT level
const calculateLevelRequirement = (level: number) => {
    if (level >= 300) return 999999999; // Cap

    // Determine current region index (0-39) based on level
    // Levels 1-5 -> Region 0
    // Levels 6-10 -> Region 1
    // Levels 200+ -> Region 39 (Capped)
    const regionIdx = Math.min(39, Math.floor((level - 1) / 5));

    // Calculate Average Quest XP for this region (Linear approx used in constants.ts)
    const avgQuestXp = 5 + (regionIdx * 5.8);

    // Calculate Tasks Needed for this level
    // Region 1 (idx 0): ~6 tasks
    // Region 40 (idx 39): ~15 tasks
    // Formula: 6 + (Index * 0.23)
    let tasksNeeded = 6 + (regionIdx * 0.23);

    // Endgame Scaling (Level 200+)
    if (level > 200) {
        // Linearly increase tasks from 15 to 20 between lvl 200 and 300
        const extraLevels = level - 200;
        tasksNeeded = 15 + (extraLevels * 0.05);
    }

    // Final XP = AvgXP * Tasks
    return Math.floor(avgQuestXp * tasksNeeded);
};

const getInitialPlayer = (): Player => ({
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
  maxXp: calculateLevelRequirement(1), // ~30 XP (6 tasks * 5 xp)
  silver: 100, 
  gems: 5, 
  karma: 0, 
  energy: 20,
  maxEnergy: 20,
  hp: 75, 
  maxHp: 75,
  stats: { ...INITIAL_PLAYER_STATS },
  equipment: { weapon: null, armor: null, helmet: null, shield: null, leggings: null, mount: null, artifact1: null, artifact2: null },
  inventory: [{ ...STARTING_KNIFE }], // New copy of starting item
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
  claimedCodes: [],
  tutorialStep: 1, // Start at step 1
  exchangeRate: generateExchangeRate(),
  lastExchangeUpdate: Date.now()
});

const BACKGROUND_MUSIC_URL = "https://alitetik.com/IronAndGlory/Music/Iron-and-Glory-v1.mp3"; 

enum View {
  WELCOME = 'welcome',
  CREATION = 'creation',
  LOADING = 'loading',
  CHARACTER = 'character',
  QUESTS = 'quests',
  WORK = 'work',
  SHOP = 'shop',
  KINGDOM = 'kingdom',
  DUEL = 'duel',
  TOURNAMENT = 'tournament',
  PROPERTIES = 'properties',
  STATISTICS = 'statistics',
  EXCHANGE = 'exchange',
  BANK = 'bank'
}

// Tutorial Messages
const TUTORIAL_MESSAGES: Record<number, string> = {
    1: "Hoş geldin! Önce çantanı aç ve 'Acemi Bıçağı'nı kuşan.",
    2: "Harika! Şimdi kendini kanıtlama vakti. 'Seferler' menüsüne git.",
    3: "İlk görevini al ve savaş meydanına çık!",
    4: "İyi iş çıkardın! Ama savaşmak yetmez, para da lazım. 'Çalışma' menüsüne git.",
    5: "Basit bir iş bularak biraz gümüş kazan.",
    6: "Tebrikler! Temel eğitimi tamamladın. Artık dünya senin!"
};

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

// Tutorial Overlay Component
const TutorialGuide = ({ step, onDismiss }: { step: number, onDismiss?: () => void }) => {
    if (step <= 0 || step > 6) return null;
    return (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-bottom-10 fade-in duration-700 pointer-events-none">
            <div className="bg-[#151210]/95 backdrop-blur-md border-2 border-amber-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-start gap-4 relative pointer-events-auto">
                <div className="absolute -top-3 -left-3 bg-amber-600 rounded-full p-2 border-2 border-black shadow-lg animate-bounce">
                    <Info size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-1">Rehber</h4>
                    <p className="text-stone-200 text-sm font-medium">{TUTORIAL_MESSAGES[step]}</p>
                </div>
                {step === 6 && (
                    <button onClick={onDismiss} className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs font-bold uppercase transition-colors">
                        Tamam
                    </button>
                )}
            </div>
        </div>
    );
};

export default function App() {
  const [player, setPlayer] = useState<Player>(() => {
      try {
          const savedData = localStorage.getItem('iron_glory_save_v1');
          if (savedData) {
              const parsed = JSON.parse(savedData);
              if (parsed && parsed.name && typeof parsed.level === 'number') {
                  if (typeof parsed.tutorialStep === 'undefined') parsed.tutorialStep = 0;
                  if (!parsed.exchangeRate) {
                      parsed.exchangeRate = generateExchangeRate();
                      parsed.lastExchangeUpdate = Date.now();
                  }
                  if (parsed.kingdom) {
                      if (typeof parsed.kingdom.armyLevel === 'undefined') parsed.kingdom.armyLevel = 1;
                      if (!parsed.kingdom.nodeCooldowns) parsed.kingdom.nodeCooldowns = {};
                      if (!parsed.kingdom.housing) parsed.kingdom.housing = 1;
                  }
                  
                  // Auto-correct XP scaling on load
                  const expectedMaxXp = calculateLevelRequirement(parsed.level);
                  if (parsed.maxXp !== expectedMaxXp) {
                      parsed.maxXp = expectedMaxXp;
                  }
                  return parsed;
              }
          }
      } catch (e) {
          console.error("Save load failed", e);
      }
      return getInitialPlayer();
  });

  const [currentView, setCurrentView] = useState<View>(() => {
      return View.WELCOME; // Always start at Welcome to verify save or start new
  });

  const [shopInventory, setShopInventory] = useState<Item[]>([]);
  // Music muted by default
  const [isMusicMuted, setIsMusicMuted] = useState(true);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [creationName, setCreationName] = useState("");
  const [creationRace, setCreationRace] = useState<Race>('İnsan');
  const [creationGender, setCreationGender] = useState<Gender>('Erkek');

  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [jobEndTime, setJobEndTime] = useState<number | null>(null);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);

  const [actionResult, setActionResult] = useState<{
      type: 'success' | 'failure' | 'socket';
      title: string;
      message: string;
      item: Item;
      subItem?: Item;
      oldLevel?: number;
      newLevel?: number;
  } | null>(null);

  const [simulatingQuest, setSimulatingQuest] = useState<Quest | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Dünya şekilleniyor...");

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
  
  // New States for Kingdom Features
  const [actionReport, setActionReport] = useState<ActionReport | null>(null);
  const [incomingAttack, setIncomingAttack] = useState<IncomingAttack | null>(null);
  
  // MAP SIMULATION STATE
  const [activeMapSimulation, setActiveMapSimulation] = useState<{
      node: MapNode;
      action: 'raid' | 'rescue' | 'conquer' | 'recruit';
  } | null>(null);

  // --- TUTORIAL LOGIC ---
  const advanceTutorial = (fromStep: number) => {
      if (player.tutorialStep === fromStep) {
          setPlayer(prev => ({ ...prev, tutorialStep: prev.tutorialStep + 1 }));
          playSfx('level_up');
      }
  };

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
          setPlayer(getInitialPlayer());
          setCreationName("");
          setCurrentView(View.WELCOME);
          showNotification("Oyun Sıfırlandı.");
      }
  };

  const handleLogout = () => {
      handleSaveGame();
      setCurrentView(View.WELCOME);
  }

  const handleNewGame = () => {
      const hasSave = player.level > 1 || player.xp > 0 || player.name !== "Maceracı";
      
      const startNewGame = () => {
          localStorage.removeItem('iron_glory_save_v1');
          setPlayer(getInitialPlayer());
          setCreationName("");
          setCreationRace('İnsan');
          setCreationGender('Erkek');
          setIsMusicPlaying(true);
          setCurrentView(View.CREATION);
          playSfx('ui_click');
      };

      if (hasSave) {
          if (window.confirm("Kayıtlı oyun silinecektir. Yeni oyun başlatmak istediğinize emin misiniz?")) {
              startNewGame();
          }
      } else {
          startNewGame();
      }
  };

  useEffect(() => {
      const saveInterval = setInterval(() => {
          if (player.level > 1 || player.xp > 0 || player.name !== "Maceracı") {
             localStorage.setItem('iron_glory_save_v1', JSON.stringify(player));
          }
      }, 30000);
      return () => clearInterval(saveInterval);
  }, [player]);

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
        audioRef.current.volume = 0.3; // Ensure music is at 30%
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
    // Select base items from pool that are roughly appropriate for the level (up to level + 5)
    // We shuffle first to get variety
    const availableItems = ITEM_POOL.filter(i => i.minLevel <= level + 5);
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random()).slice(0, 12);

    // Apply Scaling Logic based on Player Level
    // REVISED: Using linear addition instead of multiplicative to keep stats within reason (~70 max at high levels)
    const scaledItems = shuffled.map(item => {
        const levelFactor = Math.max(1, level);
        
        let newBonus = item.bonus;
        let nameSuffix = "";

        if (item.type === 'weapon') {
            // Weapon Scaling: Base + (Level * 0.25). 
            // Level 100: Base + 25 damage. 
            // Level 200: Base + 50 damage.
            // This ensures a controlled growth.
            const addedStat = Math.floor(levelFactor * 0.25);
            newBonus = item.bonus + addedStat;
            if (addedStat > 0) nameSuffix = ` +${Math.floor(levelFactor/5)}`; // Semantic: +1 for every 5 levels
        } 
        else if (['armor', 'helmet', 'shield', 'leggings'].includes(item.type)) {
            // Armor Scaling: Base + (Level * 0.15). Slower than weapons.
            const addedStat = Math.floor(levelFactor * 0.15);
            newBonus = item.bonus + addedStat;
            if (addedStat > 0) nameSuffix = ` +${Math.floor(levelFactor/5)}`;
        } 
        else if (item.type === 'mount') {
            newBonus = item.bonus + Math.floor(levelFactor * 0.2);
        }
        else if (item.type === 'artifact') {
             newBonus = item.bonus + Math.floor(levelFactor * 0.1);
        }

        // Cost Scaling: Linear increase. Base * (1 + Level * 0.05)
        const newCost = Math.floor(item.cost * (1 + (levelFactor * 0.05)));

        return {
            ...item,
            id: `${item.id}_shop_${Date.now()}_${Math.random()}`, // Unique ID for this instance
            bonus: newBonus,
            cost: newCost,
            name: nameSuffix ? `${item.name}${nameSuffix}` : item.name, 
            minLevel: level // Update requirement to current level
        };
    });

    setShopInventory(scaledItems);
  }, []);

  useEffect(() => { refreshShop(player.level); }, [refreshShop, player.level]);

  useEffect(() => {
    setPlayer(prev => {
        const newMaxHp = prev.stats.constitution * HP_PER_CONSTITUTION;
        const newMaxEnergy = 20 + Math.floor(prev.stats.constitution * 0.5);
        return { ...prev, maxHp: newMaxHp, maxEnergy: newMaxEnergy };
    });
  }, [player.stats.constitution]);

  // RESOURCE GENERATION LOOP
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
        
        let newKingdom = prev.kingdom;
        if (prev.kingdom) {
            // New Formula:
            // Provisions (Erzak) = (Farm Level * 0.5) + (Villages * 2)
            // Supplies (Malzeme) = (Workshop Level * 0.5) + (Villages * 2)
            const villageBonus = prev.kingdom.territory.length * 2; 
            const agricultureBonus = prev.kingdom.agriculture * 0.5;
            const workshopBonus = prev.kingdom.workshops * 0.5;

            newKingdom = {
                ...prev.kingdom,
                // Removed Math.floor to allow fractional accumulation (e.g., 0.5 + 0.5 = 1.0)
                provisions: prev.kingdom.provisions + agricultureBonus + villageBonus,
                supplies: prev.kingdom.supplies + workshopBonus + villageBonus
            };
        }

        let newExchangeRate = prev.exchangeRate;
        let newLastUpdate = prev.lastExchangeUpdate;
        const now = Date.now();
        const oneHour = 3600000;
        
        if (now - prev.lastExchangeUpdate > oneHour) {
            newExchangeRate = generateExchangeRate();
            newLastUpdate = now;
        }

        return { 
            ...prev, 
            energy: newEnergy, 
            hp: newHp,
            kingdom: newKingdom,
            exchangeRate: newExchangeRate,
            lastExchangeUpdate: newLastUpdate
        };
      });
    }, 1000); 
    return () => clearInterval(timer);
  }, []);

  // --- ATTACK SYSTEM ---
  useEffect(() => {
      if (!player.kingdom) return;
      const attackCheck = setInterval(() => {
          if (incomingAttack) return; // Already dealing with one
          if (Math.random() < 0.01) {
              const enemies = KINGDOM_MAP_NODES.filter(n => n.status === 'hostile');
              if (enemies.length === 0) return;
              
              const attacker = enemies[Math.floor(Math.random() * enemies.length)];
              const target = player.kingdom?.territory.length && player.kingdom.territory.length > 0
                  ? KINGDOM_MAP_NODES.find(n => n.id === player.kingdom?.territory[0])?.name || "Köy"
                  : "Başkent";

              const attackStrength = attacker.difficulty * 50; 
              const enemyCount = attacker.difficulty * 10;

              setIncomingAttack({
                  id: Date.now().toString(),
                  attackerName: attacker.name,
                  targetNodeName: target,
                  enemyStrength: attackStrength,
                  enemyCount: enemyCount,
                  arrivalTime: Date.now() 
              });
              playSfx('horn');
          }
      }, 10000);

      return () => clearInterval(attackCheck);
  }, [player.kingdom, incomingAttack, playSfx]);

  // --- INCOME & JOBS LOGIC ---
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

  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const showNotification = (msg: string) => {
      setNotification(msg);
  };

  const handleRefillStat = (type: 'hp' | 'energy') => {
      const cost = 10;
      const isHp = type === 'hp';
      const current = isHp ? player.hp : player.energy;
      const max = isHp ? player.maxHp : player.maxEnergy;
      const label = isHp ? "Can" : "Enerji";

      if (current >= max) {
          showNotification(`${label} zaten dolu!`);
          return;
      }

      if (player.gems < cost) {
          showNotification("Yetersiz Zümrüt!");
          return;
      }

      if (confirm(`${cost} Zümrüt karşılığında ${label} tamamen doldurulsun mu?`)) {
          setPlayer(prev => ({
              ...prev,
              gems: prev.gems - cost,
              [type]: max
          }));
          playSfx('potion');
          showNotification(`${label} yenilendi!`);
      }
  };

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
      if (player.tutorialStep === 5) advanceTutorial(5); 
  };

  const completeJob = (job: Job) => {
      const success = Math.random() * 100 > job.risk;
      if (success) {
          // --- REWARD SCALING LOGIC ---
          // Silver Scales Moderately: Base * (1 + Level * 0.25)
          // XP Scales Very Slowly: Base * (1 + Level * 0.05)
          // This ensures rewards feel better at higher levels without breaking the economy.
          const silverMultiplier = 1 + (player.level * 0.25);
          const xpMultiplier = 1 + (player.level * 0.05);

          const scaledSilver = Math.floor(job.silverReward * silverMultiplier);
          const scaledXp = Math.floor(job.xpReward * xpMultiplier);

          setPlayer(prev => ({
              ...prev,
              silver: prev.silver + scaledSilver,
              xp: prev.xp + scaledXp,
              karma: Math.min(100, Math.max(-100, prev.karma + job.karmaReward)),
              records: {
                  ...prev.records,
                  totalSilverEarned: prev.records.totalSilverEarned + scaledSilver,
                  totalXpEarned: prev.records.totalXpEarned + scaledXp
              }
          }));
          playSfx('coin');
          showNotification(`${job.name} Bitti: +${scaledSilver}g +${scaledXp}xp`);
      } else {
          const damage = Math.floor(player.maxHp * 0.1);
          setPlayer(prev => ({ ...prev, hp: Math.max(1, prev.hp - damage) }));
          playSfx('defeat');
          showNotification(`Kaza: -${damage} HP`);
      }
      setActiveJob(null);
      setJobEndTime(null);
  };

  useEffect(() => {
    if (player.xp >= player.maxXp) {
      const newLevel = player.level + 1;
      
      setPlayer(prev => ({
        ...prev,
        level: newLevel,
        xp: prev.xp - prev.maxXp,
        maxXp: calculateLevelRequirement(newLevel), // Uses the new strict formula
        energy: prev.maxEnergy, 
        hp: prev.maxHp 
      }));
      setLevelUpLevel(newLevel);
      refreshShop(newLevel);
      playSfx('level_up');
    }
  }, [player.xp]);

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
      if (item.type === 'potion') {
         if (item.name.includes("Can")) {
             setPlayer(prev => ({
                 ...prev,
                 hp: Math.min(prev.maxHp, prev.hp + item.bonus),
                 inventory: prev.inventory.filter(i => i.id !== item.id)
             }));
             playSfx('potion');
             showNotification(`${item.bonus} Can yenilendi.`);
         } else if (item.name.includes("Enerji")) {
             setPlayer(prev => ({
                 ...prev,
                 energy: Math.min(prev.maxEnergy, prev.energy + item.bonus),
                 inventory: prev.inventory.filter(i => i.id !== item.id)
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
      playSfx('anvil');
      setPlayer(prev => {
          let newEquipment = { ...prev.equipment };
          let newInventory = [...prev.inventory];
          let upgradedItem: Item | undefined;
          if (isSuccess) {
              // Apply specific multipliers logic
              const multiplier = UPGRADE_MULTIPLIERS[nextLevel] || 0.1; // Default fallback
              const newBonus = Math.floor(item.bonus * (1 + multiplier));

              const updateItem = (i: Item) => ({
                  ...i,
                  bonus: newBonus, 
                  upgradeLevel: nextLevel,
                  cost: Math.floor(i.cost * 1.5)
              });
              
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
              if (!foundInEquip) {
                  const idx = newInventory.findIndex(i => i.id === item.id);
                  if (idx !== -1) {
                      newInventory[idx] = updateItem(newInventory[idx]);
                      upgradedItem = newInventory[idx];
                  }
              }
              if (upgradedItem) {
                  setTimeout(() => playSfx('magic'), 500);
                  setActionResult({
                      type: 'success', title: "GELİŞTİRME BAŞARILI!", message: `${upgradedItem.name} seviye atladı!`,
                      item: upgradedItem, oldLevel: currentLevel, newLevel: nextLevel
                  });
              }
          } else {
              const equipSlots: (keyof Player['equipment'])[] = ['weapon', 'armor', 'helmet', 'shield', 'leggings', 'mount', 'artifact1', 'artifact2'];
              for (const slot of equipSlots) {
                  const equippedItem = newEquipment[slot];
                  if (equippedItem && equippedItem.id === item.id) {
                      newEquipment[slot] = null;
                      break;
                  }
              }
              newInventory = newInventory.filter(i => i.id !== item.id);
              setTimeout(() => playSfx('defeat'), 500);
              setActionResult({
                  type: 'failure', title: "GELİŞTİRME BAŞARISIZ!", message: `${item.name} parçalara ayrıldı ve yok oldu.`,
                  item: item, oldLevel: currentLevel
              });
          }
          return { ...prev, silver: prev.silver - cost, equipment: newEquipment, inventory: newInventory };
      });
  };

  const handleSocketRune = (targetItem: Item, runeItem: Item) => {
      setPlayer(prev => {
          let newEquipment = { ...prev.equipment };
          let newInventory = [...prev.inventory];
          let updatedItem: Item | undefined;
          const runeIndex = newInventory.findIndex(i => i.id === runeItem.id);
          if (runeIndex !== -1) { newInventory.splice(runeIndex, 1); } else { return prev; }
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
                  type: 'socket', title: "RUNE İŞLENDİ!", message: `${runeItem.name} başarıyla ${targetItem.name} üzerine eklendi.`,
                  item: updatedItem, subItem: runeItem
              });
          }
          return { ...prev, equipment: newEquipment, inventory: newInventory };
      });
  };

  const handleEquipItem = (item: Item) => {
      if (item.type === 'potion' || item.type === 'rune') return;
      setPlayer(prev => {
          const newInventory = prev.inventory.filter(i => i.id !== item.id);
          const currentEquipment = { ...prev.equipment };
          let slotToEquip: keyof typeof prev.equipment;
          if (item.type === 'artifact') {
              if (!currentEquipment.artifact1) slotToEquip = 'artifact1';
              else if (!currentEquipment.artifact2) slotToEquip = 'artifact2';
              else slotToEquip = 'artifact1';
          } else {
              slotToEquip = item.type as keyof typeof prev.equipment;
          }
          const currentEquipped = currentEquipment[slotToEquip];
          if (currentEquipped) newInventory.push(currentEquipped);
          currentEquipment[slotToEquip] = item;
          return { ...prev, inventory: newInventory, equipment: currentEquipment };
      });
      playSfx('equip');
      // Tutorial Advance Logic
      if (item.id === 'starting_knife' && player.tutorialStep === 1) {
          advanceTutorial(1);
      }
  };

  const handleUnequipItem = (slot: keyof Player['equipment']) => {
      if (player.inventory.length >= player.inventorySlots) { showNotification("Çanta dolu!"); return; }
      setPlayer(prev => {
          const itemToUnequip = prev.equipment[slot];
          if (!itemToUnequip) return prev;
          return { ...prev, equipment: { ...prev.equipment, [slot]: null }, inventory: [...prev.inventory, itemToUnequip] };
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
          setPlayer(prev => ({ ...prev, silver: prev.silver - cost, inventorySlots: prev.inventorySlots + 1 }));
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

  const calculateRewards = (baseSilver: number, baseXp: number, difficulty: QuestDifficulty | 'BOSS') => {
      let multiplier = 1;
      let variance = 0.8 + Math.random() * 0.4; 
      if (difficulty === QuestDifficulty.EASY) multiplier = 1.0;
      else if (difficulty === QuestDifficulty.NORMAL) multiplier = 1.3;
      else if (difficulty === QuestDifficulty.HARD) multiplier = 1.7;
      else if (difficulty === 'BOSS') multiplier = 2.5;
      return { silver: Math.floor(baseSilver * multiplier * variance), xp: Math.floor(baseXp * multiplier * variance) };
  };

  const handleStartQuest = (quest: Quest) => {
    if (player.hp <= 5 || activeJob || player.energy < quest.energyCost) return;
    setPlayer(p => ({ ...p, energy: p.energy - quest.energyCost }));
    playSfx('ui_click');
    setSimulatingQuest(quest);
    if (player.tutorialStep === 3) advanceTutorial(3); // Finish Tutorial Step 3
  };

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
        rewardSilver = rewards.silver; rewardXp = rewards.xp;
        const dropChance = 25 + (player.stats.luck * 0.5);
        if (Math.random() * 100 <= dropChance) {
            const rollType = Math.random();
            if (rollType < 0.6) {
                const randomPotion = POTIONS[Math.floor(Math.random() * POTIONS.length)];
                droppedItem = { ...randomPotion, id: randomPotion.id + Date.now() };
            } else {
                const rarityRoll = Math.random() * 100;
                let targetRarity = Rarity.COMMON;
                if (rarityRoll > 98) targetRarity = Rarity.LEGENDARY;
                else if (rarityRoll > 88) targetRarity = Rarity.EPIC;
                else if (rarityRoll > 60) targetRarity = Rarity.RARE;
                const pool = [...ITEM_POOL, ...RUNES].filter(i => i.rarity === targetRarity);
                if (pool.length > 0) {
                    const baseItem = pool[Math.floor(Math.random() * pool.length)];
                    droppedItem = { ...baseItem, id: baseItem.id + Date.now() };
                }
            }
        }
        let inventoryFull = false;
        if (droppedItem) {
            if (player.inventory.length >= player.inventorySlots) { inventoryFull = true; droppedItem = null; }
        }
        setPlayer(prev => {
            let newInventory = [...prev.inventory];
            if (droppedItem && !inventoryFull) { newInventory.push(droppedItem); }
            return {
                ...prev, silver: prev.silver + rewardSilver, xp: prev.xp + rewardXp,
                karma: Math.min(100, Math.max(-100, prev.karma + quest.karmaReward)),
                hp: remainingHp, inventory: newInventory,
                records: {
                    ...prev.records, totalBattles: prev.records.totalBattles + 1, battlesWon: prev.records.battlesWon + 1,
                    totalSilverEarned: prev.records.totalSilverEarned + rewardSilver, totalXpEarned: prev.records.totalXpEarned + rewardXp,
                    questsCompleted: prev.records.questsCompleted + 1
                }
            };
        });
        if (inventoryFull) { showNotification("Çanta dolu! Eşya düştü ama alamadın."); }
        playSfx('victory');
    } else {
        setPlayer(prev => ({ ...prev, hp: 1, records: { ...prev.records, totalBattles: prev.records.totalBattles + 1, battlesLost: prev.records.battlesLost + 1 } }));
        playSfx('defeat');
    }
    setActiveCombat({ 
        title: quest.name, logs: log, result: won ? 'win' : 'loss',
        summary: { playerDmg: playerTotalDamage, enemyDmg: enemyTotalDamage, rewardSilver, rewardXp, droppedItem }
    });
    setGeneratingFlavor(true);
    const flavor = await generateBattleReport(player, quest.enemyTemplate.name, won);
    setGeneratingFlavor(false);
    setActiveCombat(prev => prev ? { ...prev, flavorText: flavor } : null);
  };

  const handleRankBattleComplete = async (rank: Rank, won: boolean, remainingHp: number) => {
      let rewardSilver = 0;
      if (won) {
          const rewards = calculateRewards(rank.rewardSilver, 0, 'BOSS');
          rewardSilver = rewards.silver;
          playSfx('victory');
      } else { playSfx('defeat'); }
      setPlayer(prev => ({
          ...prev, hp: won ? remainingHp : 1,
          records: {
              ...prev.records, totalBattles: prev.records.totalBattles + 1, battlesWon: won ? prev.records.battlesWon + 1 : prev.records.battlesWon,
              battlesLost: !won ? prev.records.battlesLost + 1 : prev.records.battlesLost, totalSilverEarned: prev.records.totalSilverEarned + rewardSilver
          }
      }));
      if (won && player.rankIndex < rank.id) {
          setPlayer(prev => ({
              ...prev, rank: rank.title, rankIndex: rank.id, silver: prev.silver + rewardSilver, gems: prev.gems + rank.rewardGems,
              stats: { ...prev.stats, strength: prev.stats.strength + rank.statBonus, skill: prev.stats.skill + rank.statBonus, constitution: prev.stats.constitution + rank.statBonus, luck: prev.stats.luck + rank.statBonus }
          }));
          playSfx('level_up');
          showNotification(`RÜTBE ATLADIN: ${rank.title}!`);
      }
  };

  const handleDuelComplete = (won: boolean, silverReward: number, gemsReward: number, lostSilver: number = 0) => {
      let droppedItem: Item | null = null;
      if (won) {
          playSfx('victory');
          const luckFactor = player.stats.luck * 0.1;
          const dropChance = Math.min(10, 2 + luckFactor);
          const roll = Math.random() * 100;
          if (roll < dropChance && player.inventory.length < player.inventorySlots) {
             const randomItem = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];
             droppedItem = { ...randomItem, id: randomItem.id + Date.now() };
             showNotification(`DÜELLO GANİMETİ: ${droppedItem.name}!`);
          }
          setPlayer(prev => ({
              ...prev, silver: prev.silver + silverReward, gems: prev.gems + gemsReward, energy: Math.max(0, prev.energy - 10),
              inventory: droppedItem ? [...prev.inventory, droppedItem] : prev.inventory,
              records: {
                  ...prev.records, duelsWon: prev.records.duelsWon + 1, totalBattles: prev.records.totalBattles + 1, battlesWon: prev.records.battlesWon + 1, totalSilverEarned: prev.records.totalSilverEarned + silverReward
              }
          }));
      } else {
          playSfx('defeat');
          setPlayer(prev => ({ 
              ...prev, hp: Math.max(1, prev.hp - 10), energy: Math.max(0, prev.energy - 10), silver: Math.max(0, prev.silver - lostSilver),
              records: { ...prev.records, duelsLost: prev.records.duelsLost + 1, totalBattles: prev.records.totalBattles + 1, battlesLost: prev.records.battlesLost + 1 }
            }));
      }
  };

  const handleExchange = (gems: number) => {
      const silverAmount = gems * player.exchangeRate; // Use dynamic exchange rate
      setPlayer(prev => ({ ...prev, gems: prev.gems - gems, silver: prev.silver + silverAmount }));
      playSfx('coin');
      showNotification(`${gems} Mücevher bozduruldu: +${fmt(silverAmount)} Gümüş`);
  };

  const handleRedeemCode = (code: string) => {
      if (player.claimedCodes.includes(code)) { showNotification("Bu kod zaten kullanıldı!"); return; }
      if (code.toUpperCase() === "DEMO1") {
          setPlayer(prev => ({ ...prev, silver: prev.silver + 200000, gems: prev.gems + 5000, claimedCodes: [...prev.claimedCodes, code] }));
          playSfx('level_up');
          showNotification("Kod Onaylandı: 200k Gümüş & 5k Mücevher!");
      } else { showNotification("Geçersiz Kod!"); }
  };

  // --- KINGDOM ACTIONS ---
  const handleFoundKingdom = (name: string) => {
      if (player.level < 25) return;
      
      const COST_SILVER = 5000;
      const COST_GEMS = 100;

      if (player.silver < COST_SILVER || player.gems < COST_GEMS) {
          showNotification(`Yetersiz Kaynak! (${COST_SILVER}g, ${COST_GEMS} mücevher gerekli)`);
          return;
      }
      
      const newKingdom: Kingdom = {
          name: name,
          level: 1,
          walls: 1,
          agriculture: 1,
          workshops: 1,
          population: 10,
          army: 5,
          armyLevel: 1,
          housing: 1,
          supplies: 100,
          provisions: 200,
          territory: [],
          nodeCooldowns: {}
      };

      setPlayer(prev => ({ 
          ...prev, 
          silver: prev.silver - COST_SILVER,
          gems: prev.gems - COST_GEMS,
          kingdom: newKingdom 
      }));
      playSfx('level_up');
      showNotification("KRALLIK KURULDU!");
  };

  const handleUpgradeKingdom = (type: 'castle' | 'walls' | 'agriculture' | 'workshops' | 'army' | 'housing') => {
      if (!player.kingdom) return;
      const k = player.kingdom;
      let level = k.level;
      if (type === 'walls') level = k.walls;
      if (type === 'agriculture') level = k.agriculture;
      if (type === 'workshops') level = k.workshops;
      if (type === 'army') level = k.armyLevel;
      if (type === 'housing') level = k.housing;

      const costs = UPGRADE_COSTS[type](level + 1);
      
      if (player.silver >= costs.silver && k.supplies >= costs.supplies) {
          setPlayer(prev => {
              if (!prev.kingdom) return prev;
              const newK = { ...prev.kingdom };
              if (type === 'castle') newK.level++;
              if (type === 'walls') newK.walls++;
              if (type === 'agriculture') newK.agriculture++;
              if (type === 'workshops') newK.workshops++;
              if (type === 'army') newK.armyLevel++;
              if (type === 'housing') newK.housing++;
              
              newK.supplies -= costs.supplies;
              
              return { ...prev, silver: prev.silver - costs.silver, kingdom: newK };
          });
          playSfx('anvil');
          showNotification("Geliştirme Tamamlandı!");
      } else {
          showNotification("Yetersiz Kaynak!");
      }
  };

  const handleTrainSoldiers = (amount: number) => {
      if (!player.kingdom) return;
      const costSilver = amount * SOLDIER_COST.silver;
      const costSupplies = amount * SOLDIER_COST.supplies;
      const costProvisions = amount * SOLDIER_COST.provisions;

      if (player.silver >= costSilver && player.kingdom.supplies >= costSupplies && player.kingdom.provisions >= costProvisions) {
          setPlayer(prev => {
              if (!prev.kingdom) return prev;
              return {
                  ...prev,
                  silver: prev.silver - costSilver,
                  kingdom: {
                      ...prev.kingdom,
                      supplies: prev.kingdom.supplies - costSupplies,
                      provisions: prev.kingdom.provisions - costProvisions,
                      army: prev.kingdom.army + amount
                  }
              };
          });
          playSfx('sword_clash');
          showNotification(`${amount} Asker Eğitildi!`);
      } else {
          showNotification("Yetersiz Kaynak!");
      }
  };

  // Triggers the simulation modal
  const startMapAction = (node: MapNode, action: 'raid' | 'rescue' | 'conquer' | 'recruit') => {
      if (!player.kingdom) return;
      
      const cooldownTime = 2 * 60 * 60 * 1000; // 2 Hours
      const currentTime = Date.now();
      const nodeCooldown = player.kingdom.nodeCooldowns[node.id] || 0;

      if (currentTime < nodeCooldown) {
          showNotification("Burası henüz dinlenmedi! (2 saat)");
          return;
      }

      // INSTANT ACTION FOR RECRUIT
      if (action === 'recruit') {
          const recruits = Math.floor(node.rewards.population * 2); 
          
          setPlayer(prev => {
              if (!prev.kingdom) return prev;
              const newK = { ...prev.kingdom };
              // Apply Cooldown
              newK.nodeCooldowns = { ...prev.kingdom.nodeCooldowns, [node.id]: Date.now() + cooldownTime };
              // Add Soldiers
              newK.army += recruits;
              
              return { ...prev, kingdom: newK };
          });

          playSfx('horn');
          
          setActionReport({
              title: 'Gönüllüler Katıldı',
              message: `${node.name} halkından ${recruits} kişi sancağının altına katıldı.`,
              rewards: { army: recruits },
              type: 'success'
          });
          return; // Skip simulation
      }

      setActiveMapSimulation({ node, action });
  };

  // Applies result AFTER simulation
  const resolveMapSimulation = (won: boolean) => {
      if (!activeMapSimulation || !player.kingdom) {
          setActiveMapSimulation(null);
          return;
      }

      const { node, action } = activeMapSimulation;
      const cooldownTime = 2 * 60 * 60 * 1000; // 2 Hours
      
      setPlayer(prev => {
          if (!prev.kingdom) return prev;
          const newK = { ...prev.kingdom };
          newK.nodeCooldowns = { ...prev.kingdom.nodeCooldowns, [node.id]: Date.now() + cooldownTime };
          
          const report: ActionReport = {
              title: '',
              message: '',
              rewards: {},
              type: won ? 'success' : 'failure'
          };

          // Casualty Logic
          const armySize = prev.kingdom.army;
          // Win: Lose 5-15% of army. Loss: Lose 30-50% of army.
          const casualtyPercent = won ? (0.05 + Math.random() * 0.10) : (0.30 + Math.random() * 0.20);
          const casualties = Math.floor(armySize * casualtyPercent);
          newK.army = Math.max(0, armySize - casualties);

          if (won) {
              // --- SUCCESS OUTCOMES ---
              if (action === 'raid') {
                  prev.karma -= 10;
                  prev.silver += node.rewards.silver;
                  newK.supplies += node.rewards.supplies;
                  report.title = 'Baskın Başarılı';
                  report.message = `${node.name} yağmalandı. Düşman direnişi kırıldı.`;
                  report.rewards = { silver: node.rewards.silver, supplies: node.rewards.supplies, karma: -10, army: -casualties };
                  playSfx('coin');
              } else if (action === 'rescue') {
                  prev.karma += 5;
                  newK.population += node.rewards.population;
                  newK.territory = [...newK.territory, node.id]; 
                  report.title = 'Kahramanca Kurtarış';
                  report.message = 'Köylüleri esaretten kurtardın. Minnetle sana katıldılar.';
                  report.rewards = { population: node.rewards.population, karma: 5, army: -casualties };
                  playSfx('victory');
              } else if (action === 'conquer') {
                  newK.territory = [...newK.territory, node.id];
                  report.title = 'Fetih Tamamlandı';
                  report.message = `${node.name} sancağının altında.`;
                  report.rewards = { army: -casualties };
                  playSfx('level_up');
              } else if (action === 'recruit') {
                  const recruits = Math.floor(node.rewards.population * 2); 
                  newK.army += recruits; // Net gain usually
                  report.title = 'Zorunlu Askerlik';
                  report.message = `Bölgeden ${recruits} yeni asker toplandı, ancak çatışmada kayıplar verildi.`;
                  report.rewards = { army: recruits - casualties }; 
                  playSfx('sword_clash');
              }
          } else {
              // --- FAILURE OUTCOMES ---
              const lostProvisions = Math.floor(prev.kingdom.provisions * 0.1);
              const lostSupplies = Math.floor(prev.kingdom.supplies * 0.1);
              const lostPop = Math.floor(prev.kingdom.population * 0.05);

              newK.provisions = Math.max(0, newK.provisions - lostProvisions);
              newK.supplies = Math.max(0, newK.supplies - lostSupplies);
              newK.population = Math.max(0, newK.population - lostPop);

              report.title = 'Sefer Bozguna Uğradı!';
              report.message = 'Ordun ağır kayıplar vererek geri çekildi. Kaçış sırasında erzak ve malzemelerin bir kısmı düşmanın eline geçti.';
              report.rewards = { 
                  army: -casualties,
                  supplies: -lostSupplies,
                  population: -lostPop
              }; // Shows as negatives in report
              playSfx('defeat');
          }

          setActionReport(report);
          return { ...prev, kingdom: newK, karma: Math.max(-100, Math.min(100, prev.karma)) };
      });

      setActiveMapSimulation(null);
  };

  const resolveDefense = (soldiersDeployed: number) => {
      if (!incomingAttack || !player.kingdom) return;

      const defensePower = (soldiersDeployed * player.kingdom.armyLevel) + (player.kingdom.walls * 10);
      const enemyPower = incomingAttack.enemyStrength;
      const won = defensePower >= enemyPower;

      const lostSoldiers = Math.floor(soldiersDeployed * (won ? 0.1 : 0.5)); // 10% loss on win, 50% on loss
      
      setPlayer(prev => {
          if (!prev.kingdom) return prev;
          const newArmy = Math.max(0, prev.kingdom.army - lostSoldiers);
          let newSupplies = prev.kingdom.supplies;
          let newSilver = prev.silver;

          if (!won) {
              // Plunder penalty
              newSupplies = Math.floor(newSupplies * 0.8);
              newSilver = Math.floor(newSilver * 0.9);
          }

          return {
              ...prev,
              silver: newSilver,
              kingdom: {
                  ...prev.kingdom,
                  army: newArmy,
                  supplies: newSupplies
              }
          };
      });

      const report: ActionReport = {
          title: won ? 'Savunma Başarılı!' : 'Savunma Çöktü!',
          message: won 
              ? `Düşman püskürtüldü. ${lostSoldiers} asker kaybettin ama krallık güvende.` 
              : `Şehir yağmalandı! ${lostSoldiers} asker şehit oldu ve kaynaklarının bir kısmı çalındı.`,
          rewards: {},
          type: won ? 'success' : 'failure'
      };
      
      setIncomingAttack(null);
      setActionReport(report);
      playSfx(won ? 'victory' : 'defeat');
  };

  const renderActionResultModal = () => {
    if (!actionResult) return null;
    const isSuccess = actionResult.type === 'success' || actionResult.type === 'socket';
    const isSocket = actionResult.type === 'socket';
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setActionResult(null)}>
            <div className={`w-full max-w-sm bg-[#151210] border-2 rounded-xl p-6 relative shadow-2xl text-center overflow-hidden ${isSuccess ? 'border-green-800' : 'border-red-800'}`} onClick={e => e.stopPropagation()}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[80px] rounded-full opacity-20 pointer-events-none ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-4 mb-4 shadow-xl relative z-10 ${isSuccess ? 'bg-green-950 border-green-600 text-green-500' : 'bg-red-950 border-red-600 text-red-500'}`}>
                    {isSuccess ? (isSocket ? <Gem size={40} /> : <CheckCircle2 size={40} />) : <XCircle size={40} />}
                </div>
                <h2 className={`text-2xl rpg-font mb-2 relative z-10 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>{actionResult.title}</h2>
                <p className="text-stone-300 mb-6 relative z-10">{actionResult.message}</p>
                <div className="bg-stone-900/80 p-4 rounded border border-stone-800 mb-6 relative z-10 flex items-center gap-4">
                    <div className={`w-16 h-16 bg-stone-950 rounded border flex items-center justify-center ${actionResult.item.rarity === 'Efsanevi' ? 'border-amber-500' : actionResult.item.rarity === 'Destansı' ? 'border-purple-500' : 'border-stone-600'}`}>
                        <ItemIconBig type={actionResult.item.type} rarity={actionResult.item.rarity} size={32} />
                    </div>
                    <div className="text-left">
                        <div className={`font-bold text-sm ${actionResult.item.rarity === 'Efsanevi' ? 'text-amber-500' : actionResult.item.rarity === 'Destansı' ? 'text-purple-400' : actionResult.item.rarity === 'Nadir' ? 'text-cyan-400' : 'text-stone-300'}`}>{actionResult.item.name}</div>
                        {actionResult.type === 'success' && actionResult.oldLevel !== undefined && actionResult.newLevel !== undefined && (
                            <div className="flex items-center gap-2 text-xs font-bold mt-1">
                                <span className="text-stone-500">+{actionResult.oldLevel}</span>
                                <ChevronRight size={10} className="text-stone-600" />
                                <span className="text-green-500">+{actionResult.newLevel}</span>
                            </div>
                        )}
                        {actionResult.type === 'socket' && actionResult.subItem && (
                            <div className="flex items-center gap-1 text-xs font-bold mt-1 text-purple-400"><Gem size={10} /> +{actionResult.subItem.name}</div>
                        )}
                    </div>
                </div>
                <button onClick={() => setActionResult(null)} className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold border border-stone-600 rounded relative z-10">Tamam</button>
            </div>
        </div>
    );
  };

  // --- CHARACTER CREATION & LOADING ---

  const finalizeCreation = () => {
      if (!creationName.trim()) return;
      const isAdmin = creationName.trim().toLowerCase() === 'admin';
      
      let finalStats = { ...INITIAL_PLAYER_STATS };
      if (!isAdmin) {
          const mods = RACE_BONUSES[creationRace].mods;
          (Object.keys(mods) as Array<keyof typeof mods>).forEach(stat => { finalStats[stat] += (mods[stat] || 0); });
      } else {
          finalStats = { strength: 999, skill: 999, constitution: 999, luck: 999, weaponArt: 999, defenseArt: 999 };
      }

      const startLevel = isAdmin ? 200 : 1;
      const startSilver = isAdmin ? 10000000 : 100;
      const startGems = isAdmin ? 10000 : 5;
      const startInventory = isAdmin ? [] : [{...STARTING_KNIFE}];

      const newPlayer: Player = {
          name: creationName,
          race: creationRace,
          gender: creationGender,
          appearance: { height: 175, weight: 80, imgUrl: creationRace },
          rank: "Çaylak",
          rankIndex: 0,
          level: startLevel,
          xp: 0,
          maxXp: calculateLevelRequirement(startLevel), // Calculated XP req for next level
          silver: startSilver,
          gems: startGems,
          karma: 0,
          energy: isAdmin ? 100 : (20 + Math.floor(finalStats.constitution * 0.5)),
          maxEnergy: isAdmin ? 100 : (20 + Math.floor(finalStats.constitution * 0.5)),
          hp: finalStats.constitution * HP_PER_CONSTITUTION,
          maxHp: finalStats.constitution * HP_PER_CONSTITUTION,
          stats: finalStats,
          equipment: { weapon: null, armor: null, helmet: null, shield: null, leggings: null, mount: null, artifact1: null, artifact2: null },
          inventory: startInventory,
          inventorySlots: isAdmin ? MAX_INVENTORY_SLOTS : INITIAL_INVENTORY_SLOTS,
          properties: {},
          records: {
              totalBattles: 0, battlesWon: 0, battlesLost: 0,
              totalSilverEarned: 0, totalXpEarned: 0,
              duelsWon: 0, duelsLost: 0, questsCompleted: 0
          },
          claimedCodes: [],
          tutorialStep: isAdmin ? 0 : 1,
          exchangeRate: generateExchangeRate(),
          lastExchangeUpdate: Date.now(),
          kingdom: undefined // Explicitly clear kingdom for new game
      };

      setPlayer(newPlayer);
      setCurrentView(View.LOADING);
      playSfx('ui_click');
  };

  // Loading Screen Timer
  useEffect(() => {
    if (currentView !== View.LOADING) return;
    
    const messages = ["Kılıç bileniyor...", "Zırhın son kontrolleri yapılıyor...", "Kadim parşömenler okunuyor...", "Macera başlıyor..."];
    let msgIdx = 0;
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
            clearInterval(interval);
            setCurrentView(View.CHARACTER);
            playSfx('level_up');
            return 100;
        }
        if (prev % 25 === 0) {
           msgIdx++;
           setLoadingText(messages[Math.min(msgIdx, messages.length - 1)]);
        }
        return prev + 1;
      });
    }, 40); // 4 seconds total

    return () => clearInterval(interval);
  }, [currentView, playSfx]);

  // --- WELCOME & INTRO SCREENS ---
  
  if (currentView === View.WELCOME) {
    const hasSave = player.level > 1 || player.xp > 0 || player.name !== "Maceracı";

    return (
      <div className="min-h-screen h-full bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="z-10 w-full max-w-lg bg-stone-900/90 border-y-4 border-amber-800 p-12 text-center shadow-[0_0_150px_rgba(245,158,11,0.15)] backdrop-blur-sm animate-in fade-in duration-1000">
            <div className="mb-8"><IconGameLogo className="mx-auto drop-shadow-2xl" size={160} /></div>
            <h1 className="text-5xl rpg-font text-stone-100 mb-0 tracking-wide text-shadow">Iron & Glory</h1>
            <h2 className="text-2xl text-amber-600 font-serif italic tracking-widest mt-1 mb-6">Knight's Tale</h2>
            <div className="h-0.5 w-24 bg-amber-700 mx-auto mb-8"></div>
            
            <div className="space-y-4">
                {hasSave && (
                    <button onClick={() => { setIsMusicPlaying(true); setCurrentView(View.CHARACTER); playSfx('ui_click'); }} className="w-full py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 border border-emerald-600 text-emerald-100 font-bold text-lg uppercase tracking-[0.2em] hover:from-emerald-800 hover:to-emerald-700 transition-all hover:scale-[1.02] shadow-lg">
                        Maceraya Devam Et
                    </button>
                )}
                
                <button onClick={handleNewGame} className={`w-full py-4 bg-gradient-to-r from-amber-900 to-amber-800 border border-amber-600 text-amber-100 font-bold text-lg uppercase tracking-[0.2em] hover:from-amber-800 hover:to-amber-700 transition-all hover:scale-[1.02] shadow-lg ${hasSave ? 'opacity-80 scale-95' : ''}`}>
                    {hasSave ? "Yeni Oyun Başlat" : "Kılıcını Kuşan"}
                </button>

                {hasSave && (
                    <button onClick={handleResetGame} className="block mx-auto mt-4 text-xs text-stone-500 hover:text-red-500 transition-colors flex items-center gap-1">
                        <Trash2 size={12} /> Mevcut Kaydı Sil
                    </button>
                )}
            </div>
            
            <p className="text-stone-500 text-xs mt-8">v1.3 - Krallık Savaşları</p>
        </div>
      </div>
    );
  }

  if (currentView === View.CREATION) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
             <div className="w-full max-w-5xl bg-stone-900 border border-stone-800 shadow-2xl flex flex-col md:flex-row min-h-[600px] overflow-hidden rounded-lg">
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
                 <div className="w-full md:w-2/3 p-6 md:p-10 bg-stone-900/95 flex flex-col justify-center">
                     <h2 className="text-3xl rpg-font text-stone-200 mb-8 border-b border-stone-800 pb-4">Kahramanını Yarat</h2>
                     <div className="space-y-8">
                         <div><label className="text-xs text-stone-500 uppercase tracking-widest font-bold">İsim</label><input type="text" value={creationName} onChange={(e) => setCreationName(e.target.value)} className="w-full bg-stone-950 border border-stone-700 p-4 text-stone-200 focus:border-amber-700 outline-none text-lg rounded" placeholder="Kahramanın adı..." /></div>
                         <div><label className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-3 block">Irk Seçimi</label><div className="grid grid-cols-4 gap-2">{(Object.keys(RACE_BONUSES) as Race[]).map(race => (<button key={race} onClick={() => setCreationRace(race)} className={`p-3 border rounded transition-all flex flex-col items-center gap-2 ${creationRace === race ? 'bg-amber-900/30 border-amber-600 text-amber-500' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600'}`}>{race === 'İnsan' && <IconAvatarHuman size={32} />}{race === 'Ork' && <IconAvatarOrc size={32} />}{race === 'Elf' && <IconAvatarElf size={32} />}{race === 'Vampir' && <IconAvatarVampire size={32} />}<span className="text-xs font-bold uppercase">{race}</span></button>))}</div></div>
                         <div className="bg-stone-950 p-4 rounded border border-stone-800"><div className="flex justify-between items-start mb-3"><h3 className="text-amber-500 font-bold text-lg">{creationRace} Özellikleri</h3><div className="text-xs text-stone-500 italic max-w-xs text-right">{RACE_BONUSES[creationRace].desc}</div></div><div className="grid grid-cols-2 gap-2 text-sm">{Object.entries(RACE_BONUSES[creationRace].mods).map(([stat, val]) => (<div key={stat} className="flex justify-between border-b border-stone-800/50 pb-1"><span className="capitalize text-stone-400">{stat === 'strength' ? 'Güç' : stat === 'skill' ? 'Kabiliyet' : stat === 'constitution' ? 'Bünye' : stat === 'luck' ? 'Şans' : stat === 'weaponArt' ? 'Silah S.' : 'Savunma S.'}</span><span className={`font-mono font-bold ${(val as number) > 0 ? 'text-green-500' : 'text-red-500'}`}>{(val as number) > 0 ? '+' : ''}{val as number}</span></div>))}</div></div>
                         <button onClick={finalizeCreation} disabled={!creationName.trim()} className={`w-full py-4 font-bold text-xl uppercase tracking-widest border transition-all rounded shadow-lg ${creationName.trim() ? 'bg-amber-800 border-amber-600 text-white hover:bg-amber-700' : 'bg-stone-800 border-stone-700 text-stone-600'}`}>Maceraya Başla</button>
                     </div>
                 </div>
             </div>
        </div>
      );
  }

  if (currentView === View.LOADING) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
              <div className="max-w-md w-full">
                  <div className="mb-12 relative">
                      <div className="absolute inset-0 bg-amber-500/10 blur-3xl animate-pulse"></div>
                      <IconGameLogo className="mx-auto relative z-10 animate-bounce" size={120} />
                  </div>
                  <h2 className="text-2xl rpg-font text-amber-500 mb-8 animate-pulse">{loadingText}</h2>
                  <div className="w-full h-2 bg-stone-900 border border-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-900 via-amber-500 to-white transition-all duration-75 ease-linear" style={{ width: `${loadingProgress}%` }}></div>
                  </div>
                  <p className="mt-4 text-stone-600 text-xs font-mono uppercase tracking-widest">Kaderin Çağrısı Yanıtlanıyor...</p>
              </div>
          </div>
      );
  }

  // --- MAIN LAYOUT ---
  const NAVIGATION_ITEMS = [
      { id: View.CHARACTER, label: 'Karakter', icon: IconHelmet },
      { id: View.QUESTS, label: 'Seferler', icon: IconScroll },
      { id: View.KINGDOM, label: 'Krallık', icon: IconKingdom },
      { id: View.TOURNAMENT, label: 'Turnuva', icon: IconTournament },
      { id: View.DUEL, label: 'Arena', icon: IconCrossedSwords },
      { id: View.WORK, label: 'Çalışma', icon: IconHammer, active: activeJob },
      { id: View.PROPERTIES, label: 'Mülkler', icon: IconPropertyHome },
      { id: View.SHOP, label: 'Pazar Meydanı', icon: IconBag },
      { id: View.STATISTICS, label: 'Savaş Kayıtları', icon: IconStats },
      { id: View.EXCHANGE, label: 'Takas', icon: IconExchange },
      { id: View.BANK, label: 'Krallık Hazinesi', icon: IconBank },
  ];

  const MOBILE_MAIN_NAV = [View.CHARACTER, View.QUESTS, View.WORK, View.SHOP];

  const handleNavClick = (viewId: View) => {
      setCurrentView(viewId);
      playSfx('ui_click');
      // Tutorial Progression for Navigation
      if (viewId === View.QUESTS && player.tutorialStep === 2) advanceTutorial(2);
      if (viewId === View.WORK && player.tutorialStep === 4) advanceTutorial(4);
  };

  return (
    <div className="fixed inset-0 h-full w-full bg-[#0c0a09]/90 text-stone-300 font-sans flex flex-col md:flex-row overflow-hidden">
      <audio ref={audioRef} src={BACKGROUND_MUSIC_URL} loop />
      
      {/* Tutorial Overlay */}
      <TutorialGuide step={player.tutorialStep} onDismiss={() => advanceTutorial(6)} />

      {notification && (
        <div className="fixed top-20 md:top-6 left-1/2 -translate-x-1/2 z-[200] bg-stone-900 border border-amber-600 text-amber-100 px-6 py-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top rounded-full">
            <IconHelmet size={20} /> <span className="font-bold tracking-wide text-sm">{notification}</span>
        </div>
      )}

      {/* MOBILE TOP */}
      <div className="md:hidden h-16 bg-[#0a0807] border-b border-stone-800 z-40 flex items-center justify-between px-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-600 overflow-hidden"><IconAvatarHuman className="w-full h-full text-stone-400" /></div>
              <div className="flex flex-col"><span className="text-sm font-bold text-stone-200 leading-none truncate max-w-[100px]">{player.name}</span><span className="text-[10px] text-amber-500 font-bold uppercase">Sv. {player.level}</span></div>
          </div>
          <div className="flex items-center gap-3">
              <div className="flex items-center bg-stone-900 rounded-full border border-stone-800 px-2 py-1 gap-2">
                  <button onClick={toggleMusicMute} className={`${isMusicMuted ? 'text-stone-600' : 'text-amber-500'}`}>{isMusicMuted ? <VolumeX size={14} /> : <Music size={14} />}</button>
                  <div className="w-px h-3 bg-stone-700"></div>
                  <button onClick={toggleSfxMute} className={`${isSfxMuted ? 'text-stone-600' : 'text-emerald-500'}`}>{isSfxMuted ? <VolumeX size={14} /> : <Speaker size={14} />}</button>
              </div>
              <div className="flex flex-col items-end text-[10px] font-bold">
                  <div className="text-red-500 flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform active:scale-95" onClick={() => handleRefillStat('hp')} title="10 Zümrüt ile Can Yenile"><IconHeart size={10} /> {fmt(Math.floor(player.hp))}</div>
                  <div className="text-slate-300 flex items-center gap-1">{fmt(player.silver)} <IconCoin size={10} /></div>
              </div>
          </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-[#0a0807] border-r border-stone-800 flex-col shrink-0 z-20 shadow-2xl relative">
          <div className="p-6 flex flex-col items-center border-b border-stone-800 bg-stone-900/50">
             <IconGameLogo size={56} className="mb-3 text-amber-600" />
             <div className="text-center"><h1 className="rpg-font text-2xl text-amber-500 tracking-wider">Iron & Glory</h1><span className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold block mt-1">Knight's Tale</span></div>
          </div>
          <div className="bg-[#0c0a09] border-b border-stone-800">
             <div className="px-6 pt-5 pb-2">
                <div className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Karakter</div>
                <h2 className="text-stone-200 font-bold text-xl rpg-font leading-none truncate">{player.name}</h2>
                <div className="flex items-center gap-2 mt-1"><div className="text-amber-600 text-xs font-bold uppercase tracking-widest">{player.rank}</div><div className="w-1 h-1 bg-stone-600 rounded-full"></div><div className="text-stone-400 text-xs">Sv. <span className="text-stone-200 font-bold text-sm">{player.level}</span></div></div>
             </div>
             <div className="px-6 pb-2 space-y-2 text-xs font-medium mt-2">
                 <div onClick={() => handleRefillStat('hp')} className="flex items-center justify-between text-stone-300 bg-stone-900/80 p-2 rounded border border-stone-800/50 hover:border-red-900/50 transition-colors cursor-pointer group" title="10 Zümrüt ile Can Yenile">
                     <div className="flex items-center gap-2 text-red-500 font-bold group-hover:scale-105 transition-transform"><IconHeart size={14} /> Can</div>
                     <span className="font-mono text-stone-200">{fmt(Math.floor(player.hp))}/{fmt(player.maxHp)}</span>
                 </div>
                 <div onClick={() => handleRefillStat('energy')} className="flex items-center justify-between text-stone-300 bg-stone-900/80 p-2 rounded border border-stone-800/50 hover:border-cyan-900/50 transition-colors cursor-pointer group" title="10 Zümrüt ile Enerji Yenile">
                     <div className="flex items-center gap-2 text-cyan-500 font-bold group-hover:scale-105 transition-transform"><IconEnergy size={14} /> Enerji</div>
                     <span className="font-mono text-stone-200">{fmt(player.energy)}/{fmt(player.maxEnergy)}</span>
                 </div>
                 <div className="flex items-center justify-between text-stone-300 bg-stone-900/80 p-2 rounded border border-stone-800/50 hover:border-slate-500/50 transition-colors">
                     <div className="flex items-center gap-2 text-slate-400 font-bold"><IconCoin size={14} /> Gümüş</div>
                     <span className="font-mono text-slate-200">{fmt(player.silver)}</span>
                 </div>
                 <div className="flex items-center justify-between text-stone-300 bg-stone-900/80 p-2 rounded border border-stone-800/50 hover:border-purple-900/50 transition-colors">
                     <div className="flex items-center gap-2 text-purple-500 font-bold"><IconGem size={14} /> Zümrüt</div>
                     <span className="font-mono text-purple-400">{fmt(player.gems)}</span>
                 </div>
             </div>
             <div className="px-6 pb-5 mt-2">
                 <div className="flex justify-between text-[10px] text-stone-500 mb-1 uppercase font-bold tracking-wider"><span>Tecrübe</span><span className="text-cyan-600 font-mono">{fmt(player.xp)}/{fmt(player.maxXp)}</span></div>
                 <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800"><div className="h-full bg-cyan-700" style={{ width: `${(player.xp / player.maxXp) * 100}%` }} /></div>
             </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
             {NAVIGATION_ITEMS.map(item => {
                 // Tutorial Highlight for Sidebar
                 const isTutorialTarget = 
                    (item.id === View.QUESTS && player.tutorialStep === 2) ||
                    (item.id === View.WORK && player.tutorialStep === 4);

                 return (
                     <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border transition-all text-sm relative ${currentView === item.id ? 'bg-amber-950/30 border-amber-900/50 text-amber-500' : 'bg-transparent border-transparent text-stone-500 hover:bg-stone-900 hover:text-stone-300'} ${isTutorialTarget ? 'ring-2 ring-amber-500 animate-pulse bg-amber-900/20' : ''}`}>
                        <item.icon size={18} />
                        <span className="font-bold tracking-wide uppercase">{item.label}</span>
                        {item.active && <span className="absolute right-3 w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>}
                     </button>
                 )
             })}
          </nav>
          <div className="p-4 border-t border-stone-800 bg-[#0c0a09] space-y-3">
              <div className="flex gap-2">
                  <button onClick={toggleMusicMute} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded bg-stone-900 border ${isMusicMuted ? 'border-stone-700 text-stone-600' : 'border-amber-900/50 text-amber-500'} hover:bg-stone-800 transition-colors text-[10px] font-bold uppercase`}>{isMusicMuted ? <VolumeX size={16} /> : <Music size={16} />} Müzik</button>
                  <button onClick={toggleSfxMute} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded bg-stone-900 border ${isSfxMuted ? 'border-stone-700 text-stone-600' : 'border-emerald-900/50 text-emerald-500'} hover:bg-stone-800 transition-colors text-[10px] font-bold uppercase`}>{isSfxMuted ? <VolumeX size={16} /> : <Speaker size={16} />} Ses</button>
              </div>
              <div className="flex gap-2">
                  <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-stone-900 border border-stone-700 text-stone-400 hover:bg-stone-800 transition-colors text-[10px] font-bold uppercase"><LogOut size={16} /> Çıkış</button>
                  <button onClick={handleResetGame} className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-stone-900 border border-red-900/50 text-red-500 hover:bg-stone-800 transition-colors text-[10px] font-bold uppercase"><Trash2 size={16} /> Sıfırla</button>
              </div>
          </div>
      </aside>

      {/* MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full touch-pan-y">
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="max-w-5xl mx-auto pb-24 md:pb-8">
                {currentView === View.CHARACTER && <CharacterView player={player} onUpgradeStat={handleUpgradeStat} onEquip={handleEquipItem} onUnequip={handleUnequipItem} onSell={handleSellItem} onUse={handleUseItem} onExpandInventory={handleExpandInventory} playSfx={playSfx} />}
                {currentView === View.QUESTS && <QuestView player={player} onStartQuest={handleStartQuest} playSfx={playSfx} />}
                {currentView === View.WORK && <WorkView player={player} activeJob={activeJob} jobEndTime={jobEndTime} onStartJob={startJob} playSfx={playSfx} />}
                {currentView === View.DUEL && <DuelView player={player} onDuelComplete={handleDuelComplete} playSfx={playSfx} />}
                {currentView === View.TOURNAMENT && <TournamentView player={player} onChallengeRank={handleRankBattleComplete} playSfx={playSfx} />}
                {currentView === View.SHOP && <ShopView player={player} shopInventory={shopInventory} onBuyItem={handleBuyItem} onRefreshShop={handleRefreshShop} onUpgradeItem={handleUpgradeItem} onSocketRune={handleSocketRune} playSfx={playSfx} />}
                {currentView === View.PROPERTIES && <PropertyView player={player} onBuyProperty={handleBuyProperty} />}
                {currentView === View.STATISTICS && <StatisticsView player={player} />}
                {currentView === View.EXCHANGE && <ExchangeView player={player} onExchange={handleExchange} currentRate={player.exchangeRate} />}
                {currentView === View.BANK && <BankView player={player} onRedeemCode={handleRedeemCode} />}
                {currentView === View.KINGDOM && <KingdomView player={player} onUpgradeKingdom={handleUpgradeKingdom} onMapAction={startMapAction} onFoundKingdom={handleFoundKingdom} onTrainSoldiers={handleTrainSoldiers} playSfx={playSfx} incomingAttack={incomingAttack} />}
            </div>
         </div>

         {/* MOBILE FOOTER NAV */}
         <div className="md:hidden h-16 bg-[#0c0a09] border-t border-stone-800 flex items-center justify-around shrink-0 z-40">
             {MOBILE_MAIN_NAV.map(viewId => {
                 const item = NAVIGATION_ITEMS.find(i => i.id === viewId);
                 if (!item) return null;
                 
                 const isTutorialTarget = 
                    (item.id === View.QUESTS && player.tutorialStep === 2) ||
                    (item.id === View.WORK && player.tutorialStep === 4);

                 return (
                     <button key={viewId} onClick={() => { handleNavClick(viewId); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 ${currentView === viewId ? 'text-amber-500' : 'text-stone-500'} ${isTutorialTarget ? 'animate-bounce text-amber-400' : ''}`}><item.icon size={20} /><span className="text-[9px] font-bold uppercase">{item.label}</span></button>
                 )
             })}
             <button onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); playSfx('ui_click'); }} className={`flex flex-col items-center gap-1 ${isMobileMenuOpen ? 'text-amber-500' : 'text-stone-500'}`}>{isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}<span className="text-[9px] font-bold uppercase">Menü</span></button>
         </div>
      </main>

      {/* MOBILE FULL MENU OVERLAY */}
      {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/95 backdrop-blur-sm pt-20 pb-24 px-6 animate-in fade-in slide-in-from-bottom-10 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 pb-8">
                  {NAVIGATION_ITEMS.map(item => (<button key={item.id} onClick={() => { handleNavClick(item.id); setIsMobileMenuOpen(false); }} className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${currentView === item.id ? 'bg-amber-900/20 border-amber-700 text-amber-500' : 'bg-stone-900 border-stone-800 text-stone-400'}`}><item.icon size={32} /><span className="font-bold text-sm uppercase tracking-wide">{item.label}</span></button>))}
              </div>
              <div className="border-t border-stone-800 pt-6"><h3 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-4">Oyun Ayarları</h3><div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 p-4 rounded bg-stone-900 border border-stone-700 text-stone-400 font-bold uppercase text-xs"><LogOut size={16} /> Ana Menü</button>
                  <button onClick={() => { handleResetGame(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 p-4 rounded bg-stone-900 border border-red-900/50 text-red-500 font-bold uppercase text-xs"><Trash2 size={16} /> Sıfırla</button></div></div>
          </div>
      )}

      {simulatingQuest && <CombatSimulationModal player={player} enemy={simulatingQuest.enemyTemplate} onComplete={resolveQuestCombat} playSfx={playSfx} />}
      {renderActionResultModal()}
      {actionReport && <ActionReportModal report={actionReport} onClose={() => setActionReport(null)} />}
      {incomingAttack && <KingdomDefenseModal attack={incomingAttack} player={player} onDefend={resolveDefense} />}
      {activeMapSimulation && <MapSimulationModal player={player} node={activeMapSimulation.node} action={activeMapSimulation.action} onComplete={resolveMapSimulation} playSfx={playSfx} />}
      
      {levelUpLevel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in"><div className="w-full max-w-lg bg-[#151210] border-2 border-amber-600/50 p-1 rounded-2xl"><div className="bg-[#0c0a09] border border-stone-800 rounded-xl p-8 flex flex-col items-center text-center"><h2 className="text-4xl rpg-font text-amber-500 mb-8">SEVİYE ATLADIN</h2><div className="w-32 h-32 bg-stone-800 rounded-full border-4 border-amber-500 flex items-center justify-center mb-8"><span className="text-6xl rpg-font text-white">{levelUpLevel}</span></div><button onClick={() => { setLevelUpLevel(null); playSfx('ui_click'); }} className="w-full py-4 bg-amber-700 text-white font-bold rounded-lg border border-amber-600 uppercase tracking-widest">Zafere Devam Et</button></div></div></div>
      )}
      {activeCombat && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-stone-900 border border-stone-700 rounded shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950"><h3 className="rpg-font text-xl text-amber-500">{activeCombat.title}</h3><button onClick={() => { if (activeCombat.onClose) activeCombat.onClose(); else setActiveCombat(null); playSfx('ui_click'); }}><X className="text-stone-500 hover:text-white" /></button></div>
            <div className="flex-1 overflow-y-auto bg-[#0c0a09] p-6 custom-scrollbar">
                {activeCombat.result && activeCombat.summary && (
                    <div className="bg-[#1c1917] p-8 rounded-xl border-2 border-amber-900/30 text-center mb-8">
                        <h2 className={`text-3xl rpg-font mb-4 ${activeCombat.result === 'win' ? 'text-amber-500' : 'text-red-600'}`}>
                            {activeCombat.result === 'win' ? `${player.name} kazandı` : `${player.name} kaybetti`}
                        </h2>
                        {activeCombat.result === 'win' ? (
                            <div className="space-y-3">
                                <p className="text-xl text-stone-300"><span className="font-bold text-slate-300">{activeCombat.summary.rewardSilver} Gümüş</span> kazandın.</p>
                                <p className="text-lg text-cyan-500">+{activeCombat.summary.rewardXp} TP</p>
                            </div>
                        ) : (
                            <p className="text-xl text-red-400">Savaş alanından yaralı ayrıldın.</p>
                        )}
                        {activeCombat.result === 'win' && activeCombat.summary.droppedItem && (
                            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg">
                                <div className="text-[10px] text-purple-400 uppercase font-bold mb-2">Ganimet</div>
                                <div className="flex items-center justify-center gap-3">
                                    <ItemIconBig type={activeCombat.summary.droppedItem.type} rarity={activeCombat.summary.droppedItem.rarity} size={32} />
                                    <div>
                                        <div className="font-bold text-stone-200">{activeCombat.summary.droppedItem.name}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-6 pt-6 border-t border-stone-800 flex justify-around font-mono text-sm">
                            <div>
                                <div className="text-stone-500">Sen</div>
                                <div className="text-amber-500 font-bold">{activeCombat.summary.playerDmg}</div>
                            </div>
                            <div>
                                <div className="text-stone-500">Rakip</div>
                                <div className="text-red-500 font-bold">{activeCombat.summary.enemyDmg}</div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="space-y-2 font-mono text-xs">{activeCombat.logs.map((log, i) => (<div key={i} className={`p-2 border-l-2 ${log.type === 'win' ? 'text-amber-400 border-amber-500 bg-amber-900/10' : log.type === 'loss' ? 'text-red-500 border-red-500 bg-red-900/10' : 'text-stone-500 border-stone-800'}`}>{log.text}</div>))}</div>
            </div>
            <div className="p-6 border-t border-stone-800 bg-stone-900">{generatingFlavor ? <div className="text-center text-stone-500 italic">Savaş kaydediliyor...</div> : activeCombat.flavorText && <div className="text-center italic text-stone-400 mb-4">"{activeCombat.flavorText}"</div>}<button onClick={() => { if (activeCombat.onClose) activeCombat.onClose(); else setActiveCombat(null); playSfx('ui_click'); }} className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold border border-stone-600">KAPAT</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
