
import { Item, QuestDifficulty, Rarity, Job, JobType, Region, Rank, Property, QuestAlignment, MapNode, ItemType, Quest } from './types';

export const INITIAL_PLAYER_STATS = {
  strength: 5,
  skill: 5,
  constitution: 5,
  luck: 5,
  weaponArt: 1,
  defenseArt: 1
};

export const XP_SCALING_FACTOR = 0; // Not used in new logic
export const HP_PER_CONSTITUTION = 15;
export const STAT_UPGRADE_BASE_COST = 57;

// Inventory Constants
export const MAX_INVENTORY_SLOTS = 48;
export const INVENTORY_PAGE_SIZE = 24;
export const INITIAL_INVENTORY_SLOTS = 5;

// --- KINGDOM CONSTANTS ---
export const KINGDOM_MAP_NODES: MapNode[] = [
    // Villages
    { id: 'v1', name: 'Hasat Köyü', type: 'village', status: 'neutral', difficulty: 1, x: 20, y: 30, rewards: { silver: 200, supplies: 10, population: 5 } },
    { id: 'v2', name: 'Oduncu Kampı', type: 'village', status: 'neutral', difficulty: 2, x: 40, y: 15, rewards: { silver: 250, supplies: 25, population: 3 } },
    { id: 'v3', name: 'Balıkçı Koyu', type: 'village', status: 'neutral', difficulty: 3, x: 70, y: 25, rewards: { silver: 300, supplies: 15, population: 8 } },
    { id: 'v4', name: 'Madenci Yerleşkesi', type: 'village', status: 'neutral', difficulty: 4, x: 15, y: 60, rewards: { silver: 400, supplies: 40, population: 6 } },
    
    // 5 Rival Kingdoms
    { id: 'k1', name: 'Demir Miğfer Krallığı', type: 'kingdom_capital', status: 'hostile', difficulty: 10, x: 10, y: 10, rewards: { silver: 5000, supplies: 500, population: 50 } },
    { id: 'k2', name: 'Gümüş Vadi Krallığı', type: 'kingdom_capital', status: 'hostile', difficulty: 12, x: 85, y: 15, rewards: { silver: 6000, supplies: 600, population: 60 } },
    { id: 'k3', name: 'Kızıl Şafak Krallığı', type: 'kingdom_capital', status: 'hostile', difficulty: 15, x: 80, y: 80, rewards: { silver: 8000, supplies: 800, population: 80 } },
    { id: 'k4', name: 'Buzul Tepe Krallığı', type: 'kingdom_capital', status: 'hostile', difficulty: 18, x: 20, y: 85, rewards: { silver: 10000, supplies: 1000, population: 100 } },
    { id: 'k5', name: 'Kara Güneş İmparatorluğu', type: 'kingdom_capital', status: 'hostile', difficulty: 25, x: 50, y: 50, rewards: { silver: 20000, supplies: 2000, population: 200 } },
    
    // Fortresses (Minor Objectives)
    { id: 'f1', name: 'Haydut Kalesi', type: 'fortress', status: 'hostile', difficulty: 5, x: 30, y: 60, rewards: { silver: 800, supplies: 50, population: 0 } },
    { id: 'f2', name: 'Karanlık Gözetleme Kulesi', type: 'fortress', status: 'hostile', difficulty: 8, x: 80, y: 50, rewards: { silver: 1200, supplies: 80, population: 0 } },
];

export const UPGRADE_COSTS = {
    castle: (level: number) => ({ silver: 5000 * level, supplies: 100 * level }),
    walls: (level: number) => ({ silver: 2000 * level, supplies: 200 * level }),
    agriculture: (level: number) => ({ silver: 1000 * level, supplies: 50 * level }),
    workshops: (level: number) => ({ silver: 1500 * level, supplies: 20 * level }),
    housing: (level: number) => ({ silver: 1200 * level, supplies: 80 * level }), // New
    army: (level: number) => ({ silver: 3000 * level, supplies: 150 * level })
};

export const SOLDIER_COST = {
    silver: 50,
    supplies: 5,
    provisions: 10
};

// --- AUDIO ASSETS ---
export const SFX_URLS = {
    ui_click: "https://cdn.pixabay.com/audio/2023/04/26/audio_94625b03d6.mp3", // Light click
    coin: "https://cdn.pixabay.com/audio/2024/09/13/audio_214216834d.mp3", // Coins handling
    equip: "https://cdn.pixabay.com/audio/2022/03/24/audio_7314781447.mp3", // Leather/Armor sound
    sword_hit: "https://cdn.pixabay.com/audio/2022/03/15/audio_24e0307223.mp3", // Sword slash/hit
    sword_clash: "https://cdn.pixabay.com/audio/2022/03/10/audio_c97699317c.mp3", // Metal clash
    block: "https://cdn.pixabay.com/audio/2023/03/05/audio_51f0874533.mp3", // Heavy impact/block
    level_up: "https://cdn.pixabay.com/audio/2022/10/24/audio_92425b03d6.mp3", // Fanfare
    victory: "https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3", // Short success
    defeat: "https://cdn.pixabay.com/audio/2021/08/04/audio_88447e769f.mp3", // Dark drone/fail
    anvil: "https://cdn.pixabay.com/audio/2024/01/16/audio_e26188465b.mp3", // Hammer on anvil
    potion: "https://cdn.pixabay.com/audio/2022/10/16/audio_8938166948.mp3", // Drinking/Liquid
    magic: "https://cdn.pixabay.com/audio/2022/03/22/audio_c361405e60.mp3", // Magic whoosh
    horn: "https://cdn.pixabay.com/audio/2021/08/04/audio_6c9b3c5a3d.mp3" // War horn
};

// --- UPGRADE RATES (Anvil Logic) ---
export const UPGRADE_RATES: Record<number, number> = {
    1: 100, // +0 -> +1: %100
    2: 100, // +1 -> +2: %100
    3: 90,  // +2 -> +3: %90
    4: 75,  // +3 -> +4: %75
    5: 60,  // +4 -> +5: %60
    6: 40,  // +5 -> +6: %40
    7: 25,  // +6 -> +7: %25
    8: 10,  // +7 -> +8: %10
    9: 5    // +8 -> +9: %5
};

// --- NEW UPGRADE MULTIPLIERS (Balanced) ---
// This defines how much the stats increase at each step relative to current stat
// Example: at +1, newStat = oldStat * (1 + 0.10)
// Significantly reduced to prevent exponential OP power creep.
export const UPGRADE_MULTIPLIERS: Record<number, number> = {
    1: 0.10, // +10%
    2: 0.12, // +12%
    3: 0.15, // +15%
    4: 0.18, // +18%
    5: 0.22, // +22%
    6: 0.26, // +26%
    7: 0.30, // +30%
    8: 0.45, // +45%
    9: 0.60  // +60% (Grand Finale)
};

// --- PROPERTIES (Passive Income) ---
export const PROPERTIES: Property[] = [
    {
        id: 'prop_stall',
        name: 'Tezgâh',
        description: 'Pazarda küçük bir sebze ve kumaş tezgâhı.',
        baseCost: 1000,
        incomePerSecond: 1,
        category: 'Ticaret',
        imgUrl: 'prop_stall'
    },
    {
        id: 'prop_hovel',
        name: 'Kulübe',
        description: 'Köylüler için basit bir barınak.',
        baseCost: 2500,
        incomePerSecond: 3,
        category: 'Konut',
        imgUrl: 'prop_home'
    },
    {
        id: 'prop_field',
        name: 'Buğday Tarlası',
        description: 'Bereketli topraklarda ekili buğdaylar.',
        baseCost: 6000,
        incomePerSecond: 8,
        category: 'Tarım',
        imgUrl: 'prop_wheat'
    },
    {
        id: 'prop_shop',
        name: 'Dükkan',
        description: 'Demirci ve dericilerin işlettiği sağlam bir dükkan.',
        baseCost: 15000,
        incomePerSecond: 20,
        category: 'Ticaret',
        imgUrl: 'prop_shop'
    },
    {
        id: 'prop_house',
        name: 'Şehir Evi',
        description: 'Şehir merkezinde, kiraya verilebilir konforlu bir ev.',
        baseCost: 40000,
        incomePerSecond: 55,
        category: 'Konut',
        imgUrl: 'prop_home'
    },
    {
        id: 'prop_farm',
        name: 'Büyük Çiftlik',
        description: 'Hayvancılık yapılan geniş araziler.',
        baseCost: 100000,
        incomePerSecond: 140,
        category: 'Tarım',
        imgUrl: 'prop_farm'
    },
    {
        id: 'prop_inn',
        name: 'Han',
        description: 'Yolcuların uğrak noktası, her zaman işlek.',
        baseCost: 250000,
        incomePerSecond: 350,
        category: 'Ticaret',
        imgUrl: 'prop_shop'
    },
    {
        id: 'prop_mansion',
        name: 'Malikâne',
        description: 'Soylu ailelerin yaşadığı ihtişamlı bir yapı.',
        baseCost: 750000,
        incomePerSecond: 1000,
        category: 'Konut',
        imgUrl: 'prop_castle'
    },
    {
        id: 'prop_market',
        name: 'Pazar Yeri',
        description: 'Şehrin ticaret kalbi. Devasa gelir kaynağı.',
        baseCost: 2500000,
        incomePerSecond: 3500,
        category: 'Ticaret',
        imgUrl: 'prop_castle'
    }
];

// --- RANKS (20 Levels) - REBALANCED FOR NEW LINEAR WEAPON SCALING ---
// Old values were too high (e.g. 42000 HP). New weapon max damage is around ~100-300.
// Balanced so fights last ~15-20 rounds.
export const RANKS: Rank[] = [
    { id: 0, title: "Çaylak", minLevel: 1, rewardSilver: 0, rewardGems: 0, statBonus: 0, guardian: { id: 'g0', name: 'Antrenman Kuklası', level: 1, hp: 50, maxHp: 50, damage: 2, defense: 0, xpReward: 0, silverReward: 0, imgUrl: 'training_dummy' } }, 
    { id: 1, title: "Yaver", minLevel: 10, rewardSilver: 1000, rewardGems: 2, statBonus: 1, guardian: { id: 'g1', name: 'Kıdemli Savaşçı', level: 10, hp: 300, maxHp: 300, damage: 15, defense: 3, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 2, title: "Muhafız", minLevel: 20, rewardSilver: 2500, rewardGems: 4, statBonus: 2, guardian: { id: 'g2', name: 'Kale Komutanı', level: 20, hp: 650, maxHp: 650, damage: 28, defense: 8, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 3, title: "Şövalye", minLevel: 30, rewardSilver: 5000, rewardGems: 5, statBonus: 2, guardian: { id: 'g3', name: 'Zırhlı Süvari', level: 30, hp: 1000, maxHp: 1000, damage: 42, defense: 15, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 4, title: "Elit Şövalye", minLevel: 40, rewardSilver: 8000, rewardGems: 8, statBonus: 3, guardian: { id: 'g4', name: 'Kraliyet Muhafızı', level: 40, hp: 1400, maxHp: 1400, damage: 56, defense: 25, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 5, title: "Baron", minLevel: 50, rewardSilver: 12000, rewardGems: 10, statBonus: 3, guardian: { id: 'g5', name: 'Baronun Şampiyonu', level: 50, hp: 1850, maxHp: 1850, damage: 70, defense: 35, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 6, title: "Vikont", minLevel: 60, rewardSilver: 18000, rewardGems: 12, statBonus: 4, guardian: { id: 'g6', name: 'Gölge Suikastçı', level: 60, hp: 2300, maxHp: 2300, damage: 85, defense: 45, xpReward: 0, silverReward: 0, imgUrl: 'bandit', elemental: { poison: 20 } } },
    { id: 7, title: "Kont", minLevel: 70, rewardSilver: 25000, rewardGems: 15, statBonus: 4, guardian: { id: 'g7', name: 'Kanlı Kont', level: 70, hp: 2800, maxHp: 2800, damage: 100, defense: 55, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 8, title: "Marki", minLevel: 80, rewardSilver: 35000, rewardGems: 20, statBonus: 5, guardian: { id: 'g8', name: 'Sınır Beyi', level: 80, hp: 3300, maxHp: 3300, damage: 115, defense: 65, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 9, title: "Dük", minLevel: 90, rewardSilver: 50000, rewardGems: 25, statBonus: 5, guardian: { id: 'g9', name: 'Savaş Lordu', level: 90, hp: 3900, maxHp: 3900, damage: 130, defense: 75, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 10, title: "Büyük Dük", minLevel: 100, rewardSilver: 75000, rewardGems: 30, statBonus: 6, guardian: { id: 'g10', name: 'Demir Dev', level: 100, hp: 4500, maxHp: 4500, damage: 145, defense: 90, xpReward: 0, silverReward: 0, imgUrl: 'troll' } },
    { id: 11, title: "Prens", minLevel: 110, rewardSilver: 100000, rewardGems: 35, statBonus: 6, guardian: { id: 'g11', name: 'Kızıl Prens', level: 110, hp: 5100, maxHp: 5100, damage: 160, defense: 100, xpReward: 0, silverReward: 0, imgUrl: 'knight', elemental: { fire: 50 } } },
    { id: 12, title: "Veliaht", minLevel: 120, rewardSilver: 150000, rewardGems: 40, statBonus: 7, guardian: { id: 'g12', name: 'Tahtın Varis', level: 120, hp: 5800, maxHp: 5800, damage: 175, defense: 110, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 13, title: "Kral", minLevel: 130, rewardSilver: 220000, rewardGems: 50, statBonus: 7, guardian: { id: 'g13', name: 'Deli Kral', level: 130, hp: 6500, maxHp: 6500, damage: 190, defense: 120, xpReward: 0, silverReward: 0, imgUrl: 'knight', elemental: { shock: 60 } } },
    { id: 14, title: "İmparator", minLevel: 140, rewardSilver: 300000, rewardGems: 60, statBonus: 8, guardian: { id: 'g14', name: 'Fetih İmparatoru', level: 140, hp: 7200, maxHp: 7200, damage: 205, defense: 130, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 15, title: "Büyük Mareşal", minLevel: 150, rewardSilver: 400000, rewardGems: 75, statBonus: 8, guardian: { id: 'g15', name: 'Işık Getiren', level: 150, hp: 8000, maxHp: 8000, damage: 220, defense: 140, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 16, title: "Fatih", minLevel: 160, rewardSilver: 550000, rewardGems: 90, statBonus: 9, guardian: { id: 'g16', name: 'Titan', level: 160, hp: 8800, maxHp: 8800, damage: 235, defense: 150, xpReward: 0, silverReward: 0, imgUrl: 'ice_giant', elemental: { ice: 100, fireRes: -20, iceRes: 100 } } },
    { id: 17, title: "Efsane", minLevel: 170, rewardSilver: 750000, rewardGems: 100, statBonus: 9, guardian: { id: 'g17', name: 'Kadim Ejderha Sureti', level: 170, hp: 9600, maxHp: 9600, damage: 250, defense: 160, xpReward: 0, silverReward: 0, imgUrl: 'dragon', elemental: { fire: 200, fireRes: 200 } } },
    { id: 18, title: "Yenilmez", minLevel: 180, rewardSilver: 1000000, rewardGems: 150, statBonus: 10, guardian: { id: 'g18', name: 'Kaosun Elçisi', level: 180, hp: 10500, maxHp: 10500, damage: 265, defense: 170, xpReward: 0, silverReward: 0, imgUrl: 'fire_demon', elemental: { fire: 300, shock: 100 } } },
    { id: 19, title: "Ebedi Hükümdar", minLevel: 190, rewardSilver: 2000000, rewardGems: 250, statBonus: 20, guardian: { id: 'g19', name: 'Zamanın Efendisi', level: 200, hp: 12000, maxHp: 12000, damage: 285, defense: 180, xpReward: 0, silverReward: 0, imgUrl: 'shadow' } },
];

export const POTIONS: Item[] = [
    { id: 'potion_hp_small', name: 'Küçük Can İksiri', type: 'potion', bonus: 50, cost: 50, rarity: Rarity.COMMON, description: '50 Can Puanı yeniler.', minLevel: 1 },
    { id: 'potion_hp_medium', name: 'Orta Can İksiri', type: 'potion', bonus: 150, cost: 200, rarity: Rarity.RARE, description: '150 Can Puanı yeniler.', minLevel: 10 },
    { id: 'potion_hp_large', name: 'Büyük Can İksiri', type: 'potion', bonus: 400, cost: 600, rarity: Rarity.EPIC, description: '400 Can Puanı yeniler.', minLevel: 30 },
    { id: 'potion_energy_small', name: 'Küçük Enerji İksiri', type: 'potion', bonus: 20, cost: 100, rarity: Rarity.COMMON, description: '20 Enerji yeniler.', minLevel: 1 },
    { id: 'potion_energy_medium', name: 'Orta Enerji İksiri', type: 'potion', bonus: 50, cost: 300, rarity: Rarity.RARE, description: '50 Enerji yeniler.', minLevel: 10 },
];

export const RUNES: Item[] = [
    { id: 'rune_str_1', name: 'Kuvvet Runesi (Küçük)', type: 'rune', bonus: 2, cost: 500, rarity: Rarity.COMMON, description: 'Eşyaya +2 Güç ekler.', minLevel: 5, statType: 'strength' },
    { id: 'rune_str_2', name: 'Kuvvet Runesi (Orta)', type: 'rune', bonus: 5, cost: 2000, rarity: Rarity.RARE, description: 'Eşyaya +5 Güç ekler.', minLevel: 25, statType: 'strength' },
    { id: 'rune_def_1', name: 'Kaya Runesi (Küçük)', type: 'rune', bonus: 2, cost: 500, rarity: Rarity.COMMON, description: 'Eşyaya +2 Savunma Sanatı ekler.', minLevel: 5, statType: 'defenseArt' },
    { id: 'rune_fire_1', name: 'Köz Runesi', type: 'rune', bonus: 5, cost: 1000, rarity: Rarity.RARE, description: 'Eşyaya +5 Ateş Hasarı/Direnci ekler.', minLevel: 15, element: 'fire', elementValue: 5 },
    { id: 'rune_ice_1', name: 'Kırağı Runesi', type: 'rune', bonus: 5, cost: 1000, rarity: Rarity.RARE, description: 'Eşyaya +5 Buz Hasarı/Direnci ekler.', minLevel: 15, element: 'ice', elementValue: 5 },
    { id: 'rune_shock_1', name: 'Yıldırım Runesi', type: 'rune', bonus: 5, cost: 1000, rarity: Rarity.RARE, description: 'Eşyaya +5 Şok Hasarı/Direnci ekler.', minLevel: 15, element: 'shock', elementValue: 5 },
    { id: 'rune_poison_1', name: 'Zehir Runesi', type: 'rune', bonus: 5, cost: 1000, rarity: Rarity.RARE, description: 'Eşyaya +5 Zehir Hasarı/Direnci ekler.', minLevel: 15, element: 'poison', elementValue: 5 },
];

export const ITEM_POOL: Item[] = [
    // Weapons
    { id: 'w_rusty_sword', name: 'Paslı Kılıç', type: 'weapon', bonus: 3, cost: 50, rarity: Rarity.COMMON, description: 'Eski ama keskin.', minLevel: 1 },
    { id: 'w_iron_sword', name: 'Demir Kılıç', type: 'weapon', bonus: 8, cost: 250, rarity: Rarity.COMMON, description: 'Güvenilir bir asker kılıcı.', minLevel: 5 },
    { id: 'w_steel_sword', name: 'Çelik Kılıç', type: 'weapon', bonus: 15, cost: 800, rarity: Rarity.RARE, description: 'Kaliteli çelikten dövülmüş.', minLevel: 15 },
    { id: 'w_flame_blade', name: 'Alev Kılıcı', type: 'weapon', bonus: 25, cost: 2500, rarity: Rarity.EPIC, description: 'Alevler saçan büyülü bir kılıç.', minLevel: 30, element: 'fire', elementValue: 10 },
    
    // Armor
    { id: 'a_leather', name: 'Deri Zırh', type: 'armor', bonus: 3, cost: 50, rarity: Rarity.COMMON, description: 'Hafif koruma sağlar.', minLevel: 1 },
    { id: 'a_chainmail', name: 'Zincir Zırh', type: 'armor', bonus: 8, cost: 300, rarity: Rarity.COMMON, description: 'Standart piyade zırhı.', minLevel: 5 },
    { id: 'a_plate', name: 'Plaka Zırh', type: 'armor', bonus: 18, cost: 1000, rarity: Rarity.RARE, description: 'Ağır ama sağlam.', minLevel: 15 },
    
    // Helmets
    { id: 'h_leather_cap', name: 'Deri Başlık', type: 'helmet', bonus: 1, cost: 30, rarity: Rarity.COMMON, description: 'Basit bir başlık.', minLevel: 1 },
    { id: 'h_iron_helm', name: 'Demir Miğfer', type: 'helmet', bonus: 4, cost: 200, rarity: Rarity.COMMON, description: 'Kafanı korur.', minLevel: 5 },
    
    // Shields
    { id: 's_wood', name: 'Tahta Kalkan', type: 'shield', bonus: 2, cost: 40, rarity: Rarity.COMMON, description: 'Okları durdurabilir.', minLevel: 1 },
    { id: 's_iron', name: 'Demir Kalkan', type: 'shield', bonus: 6, cost: 250, rarity: Rarity.COMMON, description: 'Sağlam bir kalkan.', minLevel: 5 },

    // Leggings
    { id: 'l_leather_boots', name: 'Deri Çizme', type: 'leggings', bonus: 1, cost: 30, rarity: Rarity.COMMON, description: 'Rahat yürüyüş için.', minLevel: 1 },
    { id: 'l_iron_greaves', name: 'Demir Tozluk', type: 'leggings', bonus: 4, cost: 200, rarity: Rarity.COMMON, description: 'Bacaklarını korur.', minLevel: 5 },
    
    // Mounts
    { id: 'm_old_horse', name: 'Yaşlı At', type: 'mount', bonus: 2, cost: 500, rarity: Rarity.COMMON, description: 'Biraz yavaş ama iş görür.', minLevel: 5 },
    { id: 'm_warhorse', name: 'Savaş Atı', type: 'mount', bonus: 10, cost: 5000, rarity: Rarity.RARE, description: 'Savaş için eğitilmiş.', minLevel: 20 },
    
    // Artifacts
    { id: 'art_ring_str', name: 'Güç Yüzüğü', type: 'artifact', bonus: 2, cost: 1000, rarity: Rarity.RARE, description: 'Küçük bir güç artışı sağlar.', minLevel: 10 },
];

export const JOBS: Job[] = [
    { id: 'job_farm', name: 'Tarla İşçisi', description: 'Buğday hasadına yardım et.', type: JobType.HONEST, durationSeconds: 10, silverReward: 10, xpReward: 2, karmaReward: 1, risk: 1 },
    { id: 'job_delivery', name: 'Ulak', description: 'Önemli paketleri teslim et.', type: JobType.HONEST, durationSeconds: 30, silverReward: 35, xpReward: 3, karmaReward: 2, risk: 2 },
    { id: 'job_guard', name: 'Kervan Muhafızı', description: 'Tüccarları haydutlardan koru.', type: JobType.HONEST, durationSeconds: 60, silverReward: 80, xpReward: 5, karmaReward: 5, risk: 10 },
    
    { id: 'job_pickpocket', name: 'Yankesicilik', description: 'Kalabalıkta cüzdan ara.', type: JobType.CRIMINAL, durationSeconds: 5, silverReward: 15, xpReward: 2, karmaReward: -2, risk: 15 },
    { id: 'job_smuggle', name: 'Kaçakçılık', description: 'Yasaklı malları şehre sok.', type: JobType.CRIMINAL, durationSeconds: 20, silverReward: 60, xpReward: 4, karmaReward: -5, risk: 30 },
    { id: 'job_assassin', name: 'Suikast', description: 'Karanlık bir kontratı tamamla.', type: JobType.CRIMINAL, durationSeconds: 45, silverReward: 200, xpReward: 12, karmaReward: -20, risk: 50 },
];

// Simplified internal creator for the loop below
const createQuestInternal = (id: string, name: string, desc: string, diff: QuestDifficulty, align: QuestAlignment, energy: number, karma: number, enemyName: string, level: number, img: string, baseRegionXp: number): Quest => {
    
    let xp = baseRegionXp;
    // Difficulty variations for XP
    if (diff === QuestDifficulty.EASY) xp = Math.floor(baseRegionXp * 0.6);
    else if (diff === QuestDifficulty.HARD) xp = Math.floor(baseRegionXp * 1.2);
    else if (diff === QuestDifficulty.EPIC) xp = Math.floor(baseRegionXp * 1.4);
    
    // Hard cap at 242 as per requirement
    if (xp > 242) xp = 242;
    if (xp < 2) xp = 2; // Min floor

    const silver = Math.floor((level * 3) + 15);
    
    // New Low Scaling for Quests to match player power curve
    const hp = Math.floor(40 + (level * 35));
    const dmg = Math.floor(3 + (level * 1.1));
    const def = Math.floor(level * 0.5);
    
    return {
        id, name, description: desc, difficulty: diff, alignment: align, energyCost: energy, karmaReward: karma,
        enemyTemplate: {
            id: `enemy_${id}`, name: enemyName, level, 
            hp: hp, 
            maxHp: hp,
            damage: dmg, 
            defense: def, 
            xpReward: Math.floor(xp), 
            silverReward: silver, 
            imgUrl: img
        }
    };
};

// --- PROCEDURAL REGION GENERATION FOR 40 REGIONS ---

const REGION_THEMES = [
    { type: 'village', name: 'Vadisi', enemy: 'wolf', desc: 'Sakin ve yeşil vadiler, ancak tehlike pusuda.' },
    { type: 'forest', name: 'Ormanı', enemy: 'bandit', desc: 'Sık ağaçların arasında haydutlar kol geziyor.' },
    { type: 'desert', name: 'Çölü', enemy: 'scorpion', desc: 'Kızgın kumlar ve zehirli yaratıklar.' },
    { type: 'ruins', name: 'Harabeleri', enemy: 'skeleton', desc: 'Eski medeniyetlerin lanetli kalıntıları.' },
    { type: 'cave', name: 'Mağaraları', enemy: 'troll', desc: 'Yerin derinliklerinde yankılanan kükremeler.' },
    { type: 'ice', name: 'Buzulları', enemy: 'ice_giant', desc: 'Dondurucu soğuk ve acımasız buz devleri.' },
    { type: 'swamp', name: 'Bataklığı', enemy: 'skeleton', desc: 'Zehirli sular ve çürümüş topraklar.' }, 
    { type: 'volcano', name: 'Yanardağı', enemy: 'fire_demon', desc: 'Lav nehirleri ve cehennem sıcağı.' },
    { type: 'peak', name: 'Zirvesi', enemy: 'dragon', desc: 'Bulutların üzerinde, ejderhaların yuvası.' },
    { type: 'castle', name: 'Kalesi', enemy: 'knight', desc: 'Düşmüş kralların terk edilmiş kaleleri.' }
];

const PREFIXES = [
    "Sessiz", "Karanlık", "Kanlı", "Unutulmuş", "Ebedi", 
    "Fırtınalı", "Lanetli", "Kutsal", "Yasak", "Ölümcül", 
    "Gizli", "Antik", "Vahşi", "Issız", "Gölge",
    "Alevli", "Buzlu", "Zehirli", "Kayıp", "Korkunç"
];

// Generate 40 Regions (covering levels 1-200, endgame stays in region 40)
export const REGIONS: Region[] = Array.from({ length: 40 }, (_, i) => {
    const themeIndex = i % REGION_THEMES.length;
    const theme = REGION_THEMES[themeIndex];
    const prefixIndex = Math.floor((i / REGION_THEMES.length) * 5) % PREFIXES.length + (i % 3);
    const prefix = PREFIXES[prefixIndex % PREFIXES.length];
    
    const regionName = `${prefix} ${theme.name}`;
    const minLevel = i === 0 ? 1 : i * 5; 
    const baseEnemyLevel = minLevel;

    // --- XP LOGIC FOR REGIONS ---
    // Region 1 (i=0) -> Base 5 XP
    // Region 40 (i=39) -> Base ~230 XP (interpolated)
    // Linear growth: 5 + (i * 5.8)
    const baseRegionXp = 5 + (i * 5.8);

    const quests: Quest[] = [];

    // 1. Easy Quest
    quests.push(createQuestInternal(
        `r${i}_easy`, 
        `${prefix} Devriyesi`, 
        `Bölgedeki ${theme.type === 'village' ? 'vahşi hayvanları' : 'yaratıkları'} temizle.`, 
        QuestDifficulty.EASY, QuestAlignment.GOOD, 
        2 + Math.floor(i/5), 1, 
        `${prefix} ${theme.enemy === 'wolf' ? 'Kurt' : 'Gözcü'}`, 
        baseEnemyLevel, theme.enemy, baseRegionXp
    ));

    // 2. Normal Quest
    quests.push(createQuestInternal(
        `r${i}_normal`, 
        `${prefix} Avı`, 
        `Tehlikeli bir grubu etkisiz hale getir.`, 
        QuestDifficulty.NORMAL, QuestAlignment.GOOD, 
        4 + Math.floor(i/5), 2, 
        `${prefix} Savaşçı`, 
        baseEnemyLevel + 2, theme.enemy, baseRegionXp
    ));

    // 3. Hard Quest
    quests.push(createQuestInternal(
        `r${i}_hard`, 
        `${prefix} Baskını`, 
        `Düşman kampına sız ve liderlerini bul.`, 
        QuestDifficulty.HARD, QuestAlignment.GOOD, 
        6 + Math.floor(i/5), 3, 
        `${prefix} Elit`, 
        baseEnemyLevel + 4, theme.enemy, baseRegionXp
    ));

    // 4. Epic Quest (Available from Region 5 / Level 20+)
    if (i >= 4) {
        quests.push(createQuestInternal(
            `r${i}_epic`, 
            `${prefix} Destanı`, 
            `Bu bölgenin en korkulan canavarını avla.`, 
            QuestDifficulty.EPIC, QuestAlignment.GOOD, 
            10 + Math.floor(i/3), 10, 
            `Kadim ${theme.enemy === 'dragon' ? 'Ejderha' : 'Canavar'}`, 
            baseEnemyLevel + 7, theme.type === 'peak' ? 'dragon' : theme.type === 'volcano' ? 'fire_demon' : 'shadow', baseRegionXp
        ));
    }

    // 5. Boss Quest (Main Story) - ALWAYS LAST
    quests.push(createQuestInternal(
        `r${i}_boss`, 
        `${regionName} Lordu`, 
        `${regionName}'nın hakimi olan karanlık lordu yok et.`, 
        QuestDifficulty.EPIC, QuestAlignment.GOOD, 
        15 + Math.floor(i/2), 20, 
        `${regionName} Hakimi`, 
        baseEnemyLevel + 5, 'knight', baseRegionXp
    ));

    return {
        id: `region_${i}`,
        name: regionName,
        description: theme.desc,
        minLevel: minLevel,
        imageUrl: `region_${theme.type}`,
        mapCoordinates: { top: 50, left: 50 },
        quests: quests
    };
});
