
export enum Rarity {
  COMMON = 'Sıradan',
  RARE = 'Nadir',
  EPIC = 'Destansı',
  LEGENDARY = 'Efsanevi'
}

export type ItemType = 'weapon' | 'armor' | 'helmet' | 'shield' | 'leggings' | 'mount' | 'artifact' | 'potion' | 'rune';

export type ElementType = 'fire' | 'ice' | 'shock' | 'poison';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  bonus: number; // Damage or Defense or Heal amount or Stat Boost
  cost: number;
  costGems?: number; // Premium cost
  rarity: Rarity;
  description: string;
  minLevel: number;
  upgradeLevel?: number; // +1, +2 etc.
  statType?: keyof PlayerStats; // For Runes (which stat they boost)
  element?: ElementType; // New: Element Type
  elementValue?: number; // New: Damage (for weapons) or Resistance (for armor)
  socketedRune?: Item | null; // The rune inserted into this item
}

export interface PlayerStats {
  strength: number;      // Güç: Hasar
  skill: number;         // Kabiliyet: İsabet Şansı
  constitution: number;  // Genel Yapı: Can Puanı
  luck: number;          // Şans: Kritik Vuruş
  weaponArt: number;     // Silah Sanatı: Silah Verimi
  defenseArt: number;    // Savunma Sanatı: Zırh Verimi
}

export type Race = 'İnsan' | 'Elf' | 'Ork' | 'Vampir';
export type Gender = 'Erkek' | 'Kadın';

export interface Property {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    incomePerSecond: number;
    category: 'Ticaret' | 'Konut' | 'Tarım';
    imgUrl: string;
}

export interface PlayerRecords {
    totalBattles: number;
    battlesWon: number;
    battlesLost: number;
    totalSilverEarned: number;
    totalXpEarned: number;
    duelsWon: number;
    duelsLost: number;
    questsCompleted: number;
}

// --- KINGDOM TYPES ---
export interface Kingdom {
    name: string;
    level: number; // Castle Level
    walls: number; // Defense Bonus
    agriculture: number; // Food Gen
    workshops: number; // Material Gen
    housing: number; // New: Population Capacity/Growth
    
    population: number;
    army: number;
    armyLevel: number; // New: Army Quality
    supplies: number; // Material for building
    provisions: number; // Food for army
    
    territory: string[]; // Captured Map Node IDs
    nodeCooldowns: Record<string, number>; // New: Node ID -> Timestamp when available
}

export interface MapNode {
    id: string;
    name: string;
    type: 'village' | 'fortress' | 'capital' | 'kingdom_capital';
    status: 'neutral' | 'hostile' | 'conquered';
    difficulty: number; // Required Army Strength approx
    x: number; // 0-100% position
    y: number; // 0-100% position
    rewards: {
        silver: number;
        supplies: number;
        population: number;
    };
}

export interface IncomingAttack {
    id: string;
    attackerName: string;
    targetNodeName: string; // "Başkent" or Village Name
    enemyStrength: number; // Army Size * Level
    enemyCount: number;
    arrivalTime: number; // Timestamp
}

export interface ActionReport {
    title: string;
    message: string;
    rewards: {
        silver?: number;
        supplies?: number;
        population?: number;
        karma?: number;
        army?: number;
    };
    type: 'success' | 'failure' | 'neutral';
}

export interface Player {
  name: string;
  race: Race;
  gender: Gender;
  appearance: {
    height: number;
    weight: number;
    imgUrl: string;
  };
  rank: string; // Current Rank Title
  rankIndex: number; // 0-19
  level: number;
  xp: number;
  maxXp: number;
  silver: number; // Changed from gold
  gems: number; 
  karma: number; // -100 to 100
  energy: number;
  maxEnergy: number;
  hp: number;
  maxHp: number;
  stats: PlayerStats;
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    helmet: Item | null;
    shield: Item | null;
    leggings: Item | null;
    mount: Item | null;
    artifact1: Item | null;
    artifact2: Item | null;
  };
  inventory: Item[];
  inventorySlots: number; // Total unlocked slots
  properties: Record<string, number>; // Property ID -> Count owned
  kingdom?: Kingdom; // New Kingdom Data
  records: PlayerRecords;
  claimedCodes: string[];
  tutorialStep: number; // 0: Done, 1: Equip, 2: Nav Quest, 3: Start Quest, 4: Nav Work, 5: Start Work
  exchangeRate: number; // Current silver per gem
  lastExchangeUpdate: number; // Timestamp
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  damage: number;
  defense: number;
  xpReward: number;
  silverReward: number; // Changed from goldReward
  imgUrl: string;
  elemental?: {
      fire?: number; // Damage
      ice?: number;
      shock?: number;
      poison?: number;
      fireRes?: number; // Resistance
      iceRes?: number;
      shockRes?: number;
      poisonRes?: number;
  }
}

export enum QuestDifficulty {
  EASY = 'Kolay',
  NORMAL = 'Normal',
  HARD = 'Zor',
  EPIC = 'Destansı'
}

export enum QuestAlignment {
  GOOD = 'İyi',
  EVIL = 'Kötü'
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  difficulty: QuestDifficulty;
  alignment: QuestAlignment;
  energyCost: number;
  karmaReward: number; // + for good, - for bad
  enemyTemplate: Enemy;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  imageUrl: string;
  quests: Quest[];
  mapCoordinates: { top: number; left: number }; // Percentage 0-100
}

export enum JobType {
  HONEST = 'Dürüst',
  CRIMINAL = 'Suç'
}

export interface Job {
  id: string;
  name: string;
  description: string;
  type: JobType;
  durationSeconds: number; // Simplified for gameplay flow
  silverReward: number; // Changed from goldReward
  xpReward: number;
  karmaReward: number;
  risk: number; // 0-100% chance of failure/injury
}

export interface Rank {
    id: number;
    title: string;
    minLevel: number; // Level requirement to challenge
    guardian: Enemy; // Boss to defeat
    rewardSilver: number;
    rewardGems: number;
    statBonus: number; // Permanent stat point reward
}

export interface CombatLogEntry {
  round: number;
  text: string;
  type: 'info' | 'player-hit' | 'enemy-hit' | 'crit' | 'win' | 'loss' | 'dodge' | 'block' | 'elemental';
}
