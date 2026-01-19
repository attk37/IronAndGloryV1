
import { Item, QuestDifficulty, Rarity, Job, JobType, Region, Rank, Property, QuestAlignment } from './types';

export const INITIAL_PLAYER_STATS = {
  strength: 5,
  skill: 5,
  constitution: 5,
  luck: 5,
  weaponArt: 1,
  defenseArt: 1
};

export const XP_SCALING_FACTOR = 1.3;
export const HP_PER_CONSTITUTION = 15;
// Updated base cost for the new quadratic formula (Cost = 57 + (Lvl^2 * 0.5))
export const STAT_UPGRADE_BASE_COST = 57;

// Inventory Constants
export const MAX_INVENTORY_SLOTS = 48;
export const INVENTORY_PAGE_SIZE = 24;
export const INITIAL_INVENTORY_SLOTS = 5;

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
    magic: "https://cdn.pixabay.com/audio/2022/03/22/audio_c361405e60.mp3" // Magic whoosh
};

// --- UPGRADE RATES (Anvil Logic) ---
// Key is the target level (e.g., going to +1 uses key 1)
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

// --- RANKS (20 Levels) ---
export const RANKS: Rank[] = [
    { id: 0, title: "Çaylak", minLevel: 1, rewardSilver: 0, rewardGems: 0, statBonus: 0, guardian: { id: 'g0', name: 'Antrenman Kuklası', level: 1, hp: 10, maxHp: 10, damage: 0, defense: 0, xpReward: 0, silverReward: 0, imgUrl: 'training_dummy' } }, 
    { id: 1, title: "Yaver", minLevel: 10, rewardSilver: 500, rewardGems: 2, statBonus: 1, guardian: { id: 'g1', name: 'Kıdemli Savaşçı', level: 10, hp: 300, maxHp: 300, damage: 25, defense: 10, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 2, title: "Muhafız", minLevel: 20, rewardSilver: 1000, rewardGems: 4, statBonus: 2, guardian: { id: 'g2', name: 'Kale Komutanı', level: 20, hp: 600, maxHp: 600, damage: 45, defense: 20, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 3, title: "Şövalye", minLevel: 30, rewardSilver: 2000, rewardGems: 5, statBonus: 2, guardian: { id: 'g3', name: 'Zırhlı Süvari', level: 30, hp: 1000, maxHp: 1000, damage: 70, defense: 40, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 4, title: "Elit Şövalye", minLevel: 40, rewardSilver: 3500, rewardGems: 8, statBonus: 3, guardian: { id: 'g4', name: 'Kraliyet Muhafızı', level: 40, hp: 1500, maxHp: 1500, damage: 100, defense: 60, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 5, title: "Baron", minLevel: 50, rewardSilver: 5000, rewardGems: 10, statBonus: 3, guardian: { id: 'g5', name: 'Baronun Şampiyonu', level: 50, hp: 2200, maxHp: 2200, damage: 140, defense: 80, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 6, title: "Vikont", minLevel: 60, rewardSilver: 7500, rewardGems: 12, statBonus: 4, guardian: { id: 'g6', name: 'Gölge Suikastçı', level: 60, hp: 3000, maxHp: 3000, damage: 200, defense: 90, xpReward: 0, silverReward: 0, imgUrl: 'bandit', elemental: { poison: 20 } } },
    { id: 7, title: "Kont", minLevel: 70, rewardSilver: 10000, rewardGems: 15, statBonus: 4, guardian: { id: 'g7', name: 'Kanlı Kont', level: 70, hp: 4000, maxHp: 4000, damage: 250, defense: 120, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 8, title: "Marki", minLevel: 80, rewardSilver: 15000, rewardGems: 20, statBonus: 5, guardian: { id: 'g8', name: 'Sınır Beyi', level: 80, hp: 5500, maxHp: 5500, damage: 320, defense: 150, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 9, title: "Dük", minLevel: 90, rewardSilver: 20000, rewardGems: 25, statBonus: 5, guardian: { id: 'g9', name: 'Savaş Lordu', level: 90, hp: 7000, maxHp: 7000, damage: 400, defense: 200, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 10, title: "Büyük Dük", minLevel: 100, rewardSilver: 30000, rewardGems: 30, statBonus: 6, guardian: { id: 'g10', name: 'Demir Dev', level: 100, hp: 9000, maxHp: 9000, damage: 500, defense: 250, xpReward: 0, silverReward: 0, imgUrl: 'troll' } },
    { id: 11, title: "Prens", minLevel: 110, rewardSilver: 45000, rewardGems: 35, statBonus: 6, guardian: { id: 'g11', name: 'Kızıl Prens', level: 110, hp: 11500, maxHp: 11500, damage: 600, defense: 300, xpReward: 0, silverReward: 0, imgUrl: 'knight', elemental: { fire: 50 } } },
    { id: 12, title: "Veliaht", minLevel: 120, rewardSilver: 60000, rewardGems: 40, statBonus: 7, guardian: { id: 'g12', name: 'Tahtın Varis', level: 120, hp: 14000, maxHp: 14000, damage: 750, defense: 350, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 13, title: "Kral", minLevel: 130, rewardSilver: 80000, rewardGems: 50, statBonus: 7, guardian: { id: 'g13', name: 'Deli Kral', level: 130, hp: 17000, maxHp: 17000, damage: 900, defense: 400, xpReward: 0, silverReward: 0, imgUrl: 'knight', elemental: { shock: 60 } } },
    { id: 14, title: "İmparator", minLevel: 140, rewardSilver: 100000, rewardGems: 60, statBonus: 8, guardian: { id: 'g14', name: 'Fetih İmparatoru', level: 140, hp: 21000, maxHp: 21000, damage: 1100, defense: 480, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 15, title: "Büyük Mareşal", minLevel: 150, rewardSilver: 150000, rewardGems: 75, statBonus: 8, guardian: { id: 'g15', name: 'Işık Getiren', level: 150, hp: 25000, maxHp: 25000, damage: 1300, defense: 550, xpReward: 0, silverReward: 0, imgUrl: 'knight' } },
    { id: 16, title: "Fatih", minLevel: 160, rewardSilver: 200000, rewardGems: 90, statBonus: 9, guardian: { id: 'g16', name: 'Titan', level: 160, hp: 30000, maxHp: 30000, damage: 1500, defense: 650, xpReward: 0, silverReward: 0, imgUrl: 'ice_giant', elemental: { ice: 100, fireRes: -20, iceRes: 100 } } },
    { id: 17, title: "Efsane", minLevel: 170, rewardSilver: 300000, rewardGems: 100, statBonus: 9, guardian: { id: 'g17', name: 'Kadim Ejderha Sureti', level: 170, hp: 36000, maxHp: 36000, damage: 1800, defense: 750, xpReward: 0, silverReward: 0, imgUrl: 'dragon', elemental: { fire: 200, fireRes: 200 } } },
    { id: 18, title: "Yenilmez", minLevel: 180, rewardSilver: 500000, rewardGems: 150, statBonus: 10, guardian: { id: 'g18', name: 'Kaosun Elçisi', level: 180, hp: 44000, maxHp: 44000, damage: 2200, defense: 900, xpReward: 0, silverReward: 0, imgUrl: 'fire_demon', elemental: { fire: 300, shock: 100 } } },
    { id: 19, title: "Ebedi Hükümdar", minLevel: 190, rewardSilver: 1000000, rewardGems: 250, statBonus: 20, guardian: { id: 'g19', name: 'Zamanın Efendisi', level: 200, hp: 60000, maxHp: 60000, damage: 3000, defense: 1200, xpReward: 0, silverReward: 0, imgUrl: 'shadow' } },
];


// Jobs Logic
export const JOBS: Job[] = [
  {
    id: 'j1',
    name: 'Ahır Temizliği',
    description: 'Namuslu ama pis bir iş.',
    type: JobType.HONEST,
    durationSeconds: 5,
    silverReward: 15,
    xpReward: 5,
    karmaReward: 2,
    risk: 0
  },
  {
    id: 'j2',
    name: 'Tarlada Çalış',
    description: 'Güneşin altında alın teri.',
    type: JobType.HONEST,
    durationSeconds: 10,
    silverReward: 35,
    xpReward: 12,
    karmaReward: 4,
    risk: 5
  },
  {
    id: 'j3',
    name: 'Nöbet Tut',
    description: 'Şehir muhafızlarına yardım et.',
    type: JobType.HONEST,
    durationSeconds: 20,
    silverReward: 80,
    xpReward: 30,
    karmaReward: 8,
    risk: 10
  },
  {
    id: 'j4',
    name: 'Yankesicilik',
    description: 'Kalabalık pazarda cüzdan aşır.',
    type: JobType.CRIMINAL,
    durationSeconds: 5,
    silverReward: 25,
    xpReward: 8,
    karmaReward: -3,
    risk: 20
  },
  {
    id: 'j5',
    name: 'Yol Kesme',
    description: 'Tüccar kervanlarını pusuya düşür.',
    type: JobType.CRIMINAL,
    durationSeconds: 15,
    silverReward: 100,
    xpReward: 25,
    karmaReward: -10,
    risk: 40
  },
  {
    id: 'j6',
    name: 'Köy Yağmalama',
    description: 'Savunmasız bir köyü ateşe ver ve her şeyi çal.',
    type: JobType.CRIMINAL,
    durationSeconds: 30,
    silverReward: 300,
    xpReward: 80,
    karmaReward: -25,
    risk: 60
  }
];

// Expanded Item Pool
export const ITEM_POOL: Item[] = [
  // Weapons
  { id: 'w1', name: 'Paslı Kılıç', type: 'weapon', bonus: 3, cost: 50, rarity: Rarity.COMMON, description: 'Çıplak elden iyidir.', minLevel: 1 },
  { id: 'w2', name: 'Demir Uzun Kılıç', type: 'weapon', bonus: 8, cost: 250, rarity: Rarity.RARE, description: 'Şövalyeler için standart.', minLevel: 2 },
  { id: 'w3', name: 'Savaş Baltası', type: 'weapon', bonus: 14, cost: 550, rarity: Rarity.RARE, description: 'Ağır hasar verir.', minLevel: 4 },
  
  // Elemental Weapons
  { id: 'we1', name: 'Alev Kılıcı', type: 'weapon', bonus: 18, cost: 1200, rarity: Rarity.EPIC, description: 'Düşmanları yakar.', minLevel: 6, element: 'fire', elementValue: 10 },
  { id: 'we2', name: 'Buz Hançeri', type: 'weapon', bonus: 15, cost: 1100, rarity: Rarity.EPIC, description: 'Dondurucu soğuk.', minLevel: 6, element: 'ice', elementValue: 8 },
  { id: 'we3', name: 'Yıldırım Asası', type: 'weapon', bonus: 25, cost: 2500, rarity: Rarity.LEGENDARY, description: 'Gökyüzünün öfkesi.', minLevel: 12, element: 'shock', elementValue: 20 },
  { id: 'we4', name: 'Zehirli Mızrak', type: 'weapon', bonus: 20, cost: 1800, rarity: Rarity.EPIC, description: 'Yavaş ve acılı ölüm.', minLevel: 10, element: 'poison', elementValue: 15 },

  { id: 'w4', name: 'Kral Katili', type: 'weapon', bonus: 28, cost: 1500, costGems: 10, rarity: Rarity.EPIC, description: 'Kraliyet kanına susamış.', minLevel: 8 },
  { id: 'w5', name: 'Ruh Biçen', type: 'weapon', bonus: 55, cost: 5000, costGems: 25, rarity: Rarity.LEGENDARY, description: 'Düşmanların ruhunu emer.', minLevel: 20 },
  
  // Armor
  { id: 'a1', name: 'Deri Tunik', type: 'armor', bonus: 3, cost: 50, rarity: Rarity.COMMON, description: 'Hafif koruma.', minLevel: 1 },
  { id: 'a2', name: 'Zincir Zırh', type: 'armor', bonus: 9, cost: 280, rarity: Rarity.RARE, description: 'Dengeli koruma.', minLevel: 3 },
  { id: 'a3', name: 'Plaka Zırh', type: 'armor', bonus: 18, cost: 800, rarity: Rarity.RARE, description: 'Ağır ama sağlam.', minLevel: 5 },
  
  // Elemental Armor
  { id: 'ae1', name: 'Ejder Pulu Zırh', type: 'armor', bonus: 25, cost: 2000, rarity: Rarity.EPIC, description: 'Ateşe karşı dayanıklı.', minLevel: 8, element: 'fire', elementValue: 15 },
  { id: 'ae2', name: 'Kutup Ayısı Kürkü', type: 'armor', bonus: 20, cost: 1500, rarity: Rarity.RARE, description: 'Soğuğa karşı korur.', minLevel: 7, element: 'ice', elementValue: 10 },

  { id: 'a4', name: 'Kutsal Şövalye Zırhı', type: 'armor', bonus: 35, cost: 2000, costGems: 15, rarity: Rarity.EPIC, description: 'Karanlığı uzak tutar.', minLevel: 9 },

  // Helmets
  { id: 'h1', name: 'Deri Başlık', type: 'helmet', bonus: 1, cost: 30, rarity: Rarity.COMMON, description: 'Basit koruma.', minLevel: 1 },
  { id: 'h2', name: 'Demir Miğfer', type: 'helmet', bonus: 4, cost: 160, rarity: Rarity.COMMON, description: 'Standart miğfer.', minLevel: 2 },
  { id: 'h3', name: 'Kanatlı Miğfer', type: 'helmet', bonus: 9, cost: 450, rarity: Rarity.RARE, description: 'İhtişamlı görünüm.', minLevel: 5 },
  
  // Shields
  { id: 's1', name: 'Tahta Kalkan', type: 'shield', bonus: 2, cost: 40, rarity: Rarity.COMMON, description: 'Çabuk kırılır.', minLevel: 1 },
  { id: 's2', name: 'Şövalye Kalkanı', type: 'shield', bonus: 6, cost: 220, rarity: Rarity.RARE, description: 'Armanı taşır.', minLevel: 3 },
  { id: 'se1', name: 'Antidot Kalkanı', type: 'shield', bonus: 10, cost: 800, rarity: Rarity.EPIC, description: 'Zehiri engeller.', minLevel: 6, element: 'poison', elementValue: 20 },

  // Leggings
  { id: 'l1', name: 'Deri Çizme', type: 'leggings', bonus: 1, cost: 40, rarity: Rarity.COMMON, description: 'Yol yürümek için.', minLevel: 1 },
  { id: 'l2', name: 'Demir Tozluk', type: 'leggings', bonus: 4, cost: 180, rarity: Rarity.RARE, description: 'Bacakları korur.', minLevel: 3 },
  { id: 'l3', name: 'Mithril Çizme', type: 'leggings', bonus: 8, cost: 500, rarity: Rarity.EPIC, description: 'Hafif ve dayanıklı.', minLevel: 7 },
  { id: 'le1', name: 'Lastik Çizme', type: 'leggings', bonus: 5, cost: 600, rarity: Rarity.RARE, description: 'Şoka karşı yalıtkan.', minLevel: 5, element: 'shock', elementValue: 15 },

  // Mounts (Bonus adds to Damage/Combat Power)
  { id: 'm1', name: 'Yük Eşeği', type: 'mount', bonus: 2, cost: 100, rarity: Rarity.COMMON, description: 'İnatçı ama sadık.', minLevel: 1 },
  { id: 'm2', name: 'Savaş Atı', type: 'mount', bonus: 10, cost: 1000, rarity: Rarity.RARE, description: 'Savaş meydanları için eğitilmiş.', minLevel: 5 },
  { id: 'm3', name: 'Kurt Bineği', type: 'mount', bonus: 20, cost: 2500, costGems: 5, rarity: Rarity.EPIC, description: 'Vahşi doğanın gücü.', minLevel: 10 },
  { id: 'm4', name: 'Zırhlı Ayı', type: 'mount', bonus: 35, cost: 5000, costGems: 15, rarity: Rarity.LEGENDARY, description: 'Yıkılmaz bir güç.', minLevel: 15 },
  
  // Artifacts
  { id: 'art1', name: 'Güç Yüzüğü', type: 'artifact', bonus: 5, cost: 1000, costGems: 5, rarity: Rarity.RARE, description: 'Kullanıcısına güç verir.', minLevel: 2 },
  { id: 'art2', name: 'Şans Tılsımı', type: 'artifact', bonus: 10, cost: 2000, costGems: 10, rarity: Rarity.EPIC, description: 'Talih yüzüne gülsün.', minLevel: 5 },
  { id: 'art3', name: 'Kan Taşı', type: 'artifact', bonus: 15, cost: 3500, rarity: Rarity.EPIC, description: 'Yaşam enerjisi verir.', minLevel: 10 },
  { id: 'art4', name: 'Anka Tüyü', type: 'artifact', bonus: 10, cost: 3000, rarity: Rarity.LEGENDARY, description: 'Ateşin özü.', minLevel: 10, element: 'fire', elementValue: 15 },
  { id: 'art5', name: 'Yılan Gözü', type: 'artifact', bonus: 8, cost: 2800, rarity: Rarity.EPIC, description: 'Zehirli bakış.', minLevel: 8, element: 'poison', elementValue: 12 },
];

export const POTIONS: Item[] = [
    { id: 'pot1', name: 'Küçük Can İksiri', type: 'potion', bonus: 50, cost: 50, rarity: Rarity.COMMON, description: '+50 Can Puanı yeniler.', minLevel: 1 },
    { id: 'pot2', name: 'Büyük Can İksiri', type: 'potion', bonus: 150, cost: 200, rarity: Rarity.RARE, description: '+150 Can Puanı yeniler.', minLevel: 5 },
    { id: 'pot3', name: 'Enerji Toniği', type: 'potion', bonus: 20, cost: 150, rarity: Rarity.RARE, description: '+20 Enerji yeniler.', minLevel: 1 },
    { id: 'pot4', name: 'Ejder Kanı', type: 'potion', bonus: 500, cost: 1000, rarity: Rarity.EPIC, description: '+500 Can Puanı yeniler.', minLevel: 15 },
];

export const RUNES: Item[] = [
    { id: 'rune1', name: 'Ayı Runesi', type: 'rune', bonus: 2, statType: 'strength', cost: 500, rarity: Rarity.RARE, description: 'Eşyaya +2 Güç ekler.', minLevel: 1 },
    { id: 'rune2', name: 'Yılan Runesi', type: 'rune', bonus: 2, statType: 'skill', cost: 500, rarity: Rarity.RARE, description: 'Eşyaya +2 Kabiliyet ekler.', minLevel: 1 },
    { id: 'rune3', name: 'Kaplumbağa Runesi', type: 'rune', bonus: 2, statType: 'constitution', cost: 500, rarity: Rarity.RARE, description: 'Eşyaya +2 Bünye ekler.', minLevel: 1 },
    { id: 'rune4', name: 'Karga Runesi', type: 'rune', bonus: 2, statType: 'luck', cost: 500, rarity: Rarity.RARE, description: 'Eşyaya +2 Şans ekler.', minLevel: 1 },
    { id: 'rune5', name: 'Alev Runesi', type: 'rune', bonus: 5, cost: 1000, rarity: Rarity.EPIC, description: 'Eşyaya +5 Ateş Hasarı ekler.', minLevel: 5, element: 'fire', elementValue: 5 },
    { id: 'rune6', name: 'Buz Runesi', type: 'rune', bonus: 5, cost: 1000, rarity: Rarity.EPIC, description: 'Eşyaya +5 Buz Direnci ekler.', minLevel: 5, element: 'ice', elementValue: 5 },
];

export const REGIONS: Region[] = [
  {
    id: 'r1',
    name: 'Sürgün Köyü',
    description: 'Maceranın başladığı yer. Çaylaklar ve haydutlar diyarı.',
    minLevel: 1,
    imageUrl: 'https://alitetik.com/IronAndGlory/Images/exile-village.png', // Updated background image
    mapCoordinates: { top: 80, left: 10 },
    quests: [
      {
        id: 'q1_1',
        name: 'Kurt Saldırısı',
        description: 'Köylüleri rahatsız eden kurtları temizle.',
        difficulty: QuestDifficulty.EASY,
        alignment: QuestAlignment.GOOD,
        energyCost: 2,
        karmaReward: 2,
        enemyTemplate: { id: 'e1_1', name: 'Vahşi Kurt', level: 1, hp: 35, maxHp: 35, damage: 5, defense: 1, xpReward: 20, silverReward: 15, imgUrl: 'https://alitetik.com/IronAndGlory/Images/wolf-attack.png' }
      },
      {
        id: 'q1_2',
        name: 'Kaçak Haydutlar',
        description: 'Ormanda saklanan haydut kampını bas.',
        difficulty: QuestDifficulty.NORMAL,
        alignment: QuestAlignment.GOOD,
        energyCost: 3,
        karmaReward: 5,
        enemyTemplate: { id: 'e1_2', name: 'Haydut Gözcü', level: 3, hp: 60, maxHp: 60, damage: 8, defense: 3, xpReward: 40, silverReward: 30, imgUrl: 'https://alitetik.com/IronAndGlory/Images/fugitive-bandit.png' }
      },
      {
        id: 'q1_3',
        name: 'Köyün Kabadayısı',
        description: 'Hana dadanan sarhoş paralı askeri döv.',
        difficulty: QuestDifficulty.HARD,
        alignment: QuestAlignment.EVIL,
        energyCost: 5,
        karmaReward: -5,
        enemyTemplate: { id: 'e1_3', name: 'Sarhoş Paralı Asker', level: 5, hp: 120, maxHp: 120, damage: 15, defense: 5, xpReward: 80, silverReward: 60, imgUrl: 'bandit' }
      },
      {
        id: 'q1_4',
        name: 'Tüccar Soygunu',
        description: 'Yoldan geçen bir tüccarın arabasını yağmala.',
        difficulty: QuestDifficulty.EASY, // Last one is usually boss, but for data consistency we use difficulties
        alignment: QuestAlignment.EVIL,
        energyCost: 2,
        karmaReward: -3,
        enemyTemplate: { id: 'e1_4', name: 'Tüccar Koruması', level: 2, hp: 45, maxHp: 45, damage: 6, defense: 2, xpReward: 25, silverReward: 40, imgUrl: 'knight' }
      }
    ]
  },
  {
    id: 'r2',
    name: 'Sisli Bataklık',
    description: 'Zehirli gazların ve sürüngenlerin ölümcül yuvası.',
    minLevel: 10,
    imageUrl: 'https://alitetik.com/IronAndGlory/Images/misty-swamp.png', 
    mapCoordinates: { top: 70, left: 25 },
    quests: [
      {
        id: 'q2_1',
        name: 'Dev Sülükler',
        description: 'Bataklık suyunu kirleten yaratıkları avla.',
        difficulty: QuestDifficulty.EASY,
        alignment: QuestAlignment.GOOD,
        energyCost: 4,
        karmaReward: 3,
        enemyTemplate: { id: 'e2_1', name: 'Dev Sülük', level: 11, hp: 200, maxHp: 200, damage: 20, defense: 8, xpReward: 120, silverReward: 80, imgUrl: 'scorpion', elemental: { poison: 10 } }
      },
      {
        id: 'q2_2',
        name: 'Kayıp Şifacı',
        description: 'Bataklıkta kaybolan şifacıyı kurtar.',
        difficulty: QuestDifficulty.NORMAL,
        alignment: QuestAlignment.GOOD,
        energyCost: 6,
        karmaReward: 8,
        enemyTemplate: { id: 'e2_2', name: 'Bataklık Yaratığı', level: 13, hp: 280, maxHp: 280, damage: 28, defense: 10, xpReward: 180, silverReward: 120, imgUrl: 'troll', elemental: { poison: 15 } }
      },
      {
        id: 'q2_3',
        name: 'Zehir Hasadı',
        description: 'Zehirli bitkileri topla ve karaborsada sat.',
        difficulty: QuestDifficulty.HARD,
        alignment: QuestAlignment.EVIL,
        energyCost: 8,
        karmaReward: -10,
        enemyTemplate: { id: 'e2_3', name: 'Zehirli Sarmaşık', level: 14, hp: 320, maxHp: 320, damage: 35, defense: 12, xpReward: 220, silverReward: 150, imgUrl: 'scorpion', elemental: { poison: 20 } }
      },
      {
        id: 'q2_4',
        name: 'Bataklık Cadısı',
        description: 'Cadıyla anlaşma yapıp ritüelini koru.',
        difficulty: QuestDifficulty.EPIC, // Story Boss
        alignment: QuestAlignment.EVIL,
        energyCost: 10,
        karmaReward: -15,
        enemyTemplate: { id: 'e2_4', name: 'Engizisyon Şövalyesi', level: 15, hp: 450, maxHp: 450, damage: 45, defense: 15, xpReward: 300, silverReward: 250, imgUrl: 'knight', elemental: { fire: 20 } }
      }
    ]
  },
  {
    id: 'r3',
    name: 'Yıkık Kale',
    description: 'Eski bir krallığın kalıntıları. Şimdi iskeletlerin evi.',
    minLevel: 20,
    imageUrl: 'region_ruins', 
    mapCoordinates: { top: 60, left: 10 },
    quests: [
      {
        id: 'q3_1',
        name: 'İskelet Muhafızlar',
        description: 'Kaleyi koruyan lanetli kemikleri kır.',
        difficulty: QuestDifficulty.EASY,
        alignment: QuestAlignment.GOOD,
        energyCost: 5,
        karmaReward: 5,
        enemyTemplate: { id: 'e3_1', name: 'İskelet Savaşçı', level: 21, hp: 500, maxHp: 500, damage: 50, defense: 30, xpReward: 400, silverReward: 300, imgUrl: 'skeleton' }
      },
      {
        id: 'q3_2',
        name: 'Kutsal Emanet',
        description: 'Kalede saklanan kutsal kadehi bul.',
        difficulty: QuestDifficulty.NORMAL,
        alignment: QuestAlignment.GOOD,
        energyCost: 7,
        karmaReward: 10,
        enemyTemplate: { id: 'e3_2', name: 'Lanetli Ruh', level: 23, hp: 700, maxHp: 700, damage: 70, defense: 40, xpReward: 600, silverReward: 500, imgUrl: 'shadow' }
      },
      {
        id: 'q3_3',
        name: 'Mezar Soygunu',
        description: 'Kraliyet mezarını aç ve hazineleri çal.',
        difficulty: QuestDifficulty.HARD,
        alignment: QuestAlignment.EVIL,
        energyCost: 9,
        karmaReward: -12,
        enemyTemplate: { id: 'e3_3', name: 'Mezar Bekçisi', level: 24, hp: 800, maxHp: 800, damage: 85, defense: 45, xpReward: 750, silverReward: 600, imgUrl: 'skeleton' }
      },
      {
        id: 'q3_4',
        name: 'Kara Şövalye Komutanı',
        description: 'Karanlık orduya katılmak için komutanla düello yap.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.EVIL,
        energyCost: 10,
        karmaReward: -15,
        enemyTemplate: { id: 'e3_4', name: 'Işık Paladini', level: 25, hp: 1000, maxHp: 1000, damage: 100, defense: 50, xpReward: 1000, silverReward: 800, imgUrl: 'knight', elemental: { shock: 20 } }
      }
    ]
  },
  {
    id: 'r4',
    name: 'Kristal Mağaralar',
    description: 'Derinlerde parlayan taşlar ve onları koruyan troller.',
    minLevel: 30,
    imageUrl: 'region_cave', 
    mapCoordinates: { top: 45, left: 30 },
    quests: [
      {
        id: 'q4_1',
        name: 'Kristal Toplayıcı',
        description: 'Trollerin dikkatini dağıt ve kristal topla.',
        difficulty: QuestDifficulty.EASY,
        alignment: QuestAlignment.GOOD,
        energyCost: 5,
        karmaReward: 3,
        enemyTemplate: { id: 'e4_1', name: 'Genç Trol', level: 31, hp: 1200, maxHp: 1200, damage: 90, defense: 60, xpReward: 1200, silverReward: 800, imgUrl: 'troll' }
      },
      {
        id: 'q4_2',
        name: 'Mağara Trolü',
        description: 'Yolu tıkayan devasa trolü temizle.',
        difficulty: QuestDifficulty.NORMAL,
        alignment: QuestAlignment.GOOD,
        energyCost: 6,
        karmaReward: 5,
        enemyTemplate: { id: 'e4_2', name: 'Kaya Trolü', level: 32, hp: 1500, maxHp: 1500, damage: 120, defense: 80, xpReward: 1500, silverReward: 1000, imgUrl: 'troll' }
      },
      {
        id: 'q4_3',
        name: 'Kristal Kaçakçıları',
        description: 'Madencileri haraca bağlayan çeteyi yok et.',
        difficulty: QuestDifficulty.HARD,
        alignment: QuestAlignment.GOOD,
        energyCost: 9,
        karmaReward: 12,
        enemyTemplate: { id: 'e4_3', name: 'Kaçakçı Başı', level: 35, hp: 1800, maxHp: 1800, damage: 140, defense: 90, xpReward: 1800, silverReward: 1200, imgUrl: 'bandit' }
      },
      {
        id: 'q4_4',
        name: 'Trol Kralı',
        description: 'Mağaranın en derinindeki kralı devir.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.EVIL,
        energyCost: 12,
        karmaReward: -10,
        enemyTemplate: { id: 'e4_4', name: 'Trol Kralı', level: 38, hp: 2200, maxHp: 2200, damage: 160, defense: 110, xpReward: 2500, silverReward: 1800, imgUrl: 'troll', elemental: { shock: 10 } }
      }
    ]
  },
  {
    id: 'r5',
    name: 'Kızıl Çöl',
    description: 'Güneşin kavurduğu, akreplerin gezdiği uçsuz bucaksız kumlar.',
    minLevel: 40,
    imageUrl: 'region_desert', 
    mapCoordinates: { top: 50, left: 55 },
    quests: [
      {
        id: 'q5_1',
        name: 'Çöl Akrebi',
        description: 'Kervan yolunu temizlemek için akrepleri avla.',
        difficulty: QuestDifficulty.EASY,
        alignment: QuestAlignment.GOOD,
        energyCost: 6,
        karmaReward: 4,
        enemyTemplate: { id: 'e5_1', name: 'Çöl Akrebi', level: 41, hp: 2000, maxHp: 2000, damage: 150, defense: 80, xpReward: 2000, silverReward: 1200, imgUrl: 'scorpion', elemental: { poison: 30 } }
      },
      {
        id: 'q5_2',
        name: 'Kum Fırtınası',
        description: 'Fırtınada saklanan haydutları bul.',
        difficulty: QuestDifficulty.NORMAL,
        alignment: QuestAlignment.GOOD,
        energyCost: 8,
        karmaReward: 6,
        enemyTemplate: { id: 'e5_2', name: 'Kum Haydutu', level: 43, hp: 2500, maxHp: 2500, damage: 180, defense: 100, xpReward: 2500, silverReward: 1500, imgUrl: 'bandit' }
      },
      {
        id: 'q5_3',
        name: 'Kayıp Vaha',
        description: 'Susuz kalmış köylülere vahayı geri kazandır.',
        difficulty: QuestDifficulty.HARD,
        alignment: QuestAlignment.GOOD,
        energyCost: 10,
        karmaReward: 15,
        enemyTemplate: { id: 'e5_3', name: 'Kum Golemi', level: 45, hp: 3000, maxHp: 3000, damage: 200, defense: 150, xpReward: 3000, silverReward: 2000, imgUrl: 'troll' }
      },
      {
        id: 'q5_4',
        name: 'Antik Kum Solucanı', // Extra Epic Quest
        description: 'Çölün altındaki efsanevi canavarı avla.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.EVIL,
        energyCost: 15,
        karmaReward: -5,
        enemyTemplate: { id: 'e5_4', name: 'Kum Solucanı', level: 48, hp: 4000, maxHp: 4000, damage: 250, defense: 180, xpReward: 5000, silverReward: 3000, imgUrl: 'dragon', elemental: { poison: 50 } }
      },
      {
        id: 'q5_boss',
        name: 'Vaha Koruyucusu',
        description: 'Vahadaki suyu tekeline al ve fahiş fiyattan sat.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.EVIL,
        energyCost: 12,
        karmaReward: -20,
        enemyTemplate: { id: 'e5_boss', name: 'Vaha Koruyucusu', level: 46, hp: 3500, maxHp: 3500, damage: 220, defense: 140, xpReward: 3500, silverReward: 2500, imgUrl: 'knight', elemental: { ice: 30 } }
      }
    ]
  },
  {
    id: 'r6',
    name: 'Buzul Vadisi',
    description: 'Soğuğun iliklere işlediği, donmuş ruhların mekanı.',
    minLevel: 50,
    imageUrl: 'region_ice', 
    mapCoordinates: { top: 30, left: 50 },
    quests: [
      {
        id: 'q6_1',
        name: 'Buz Kurdu Sürüsü',
        description: 'Soğukta avlanan kurt sürüsünü dağıt.',
        difficulty: QuestDifficulty.EASY,
        alignment: QuestAlignment.GOOD,
        energyCost: 6,
        karmaReward: 5,
        enemyTemplate: { id: 'e6_1', name: 'Alfa Buz Kurdu', level: 51, hp: 3000, maxHp: 3000, damage: 200, defense: 100, xpReward: 3000, silverReward: 2000, imgUrl: 'wolf', elemental: { ice: 20 } }
      },
      {
        id: 'q6_2',
        name: 'Yeti Katliamı',
        description: 'Kürkleri için yetileri avla.',
        difficulty: QuestDifficulty.NORMAL,
        alignment: QuestAlignment.EVIL,
        energyCost: 8,
        karmaReward: -12,
        enemyTemplate: { id: 'e6_2', name: 'Öfkeli Yeti', level: 53, hp: 3800, maxHp: 3800, damage: 240, defense: 130, xpReward: 3800, silverReward: 2800, imgUrl: 'ice_giant' }
      },
      {
        id: 'q6_3',
        name: 'Buz Devi',
        description: 'Kuzeyin kadim koruyucularıyla yüzleş.',
        difficulty: QuestDifficulty.HARD,
        alignment: QuestAlignment.GOOD,
        energyCost: 10,
        karmaReward: 10,
        enemyTemplate: { id: 'e6_3', name: 'Buz Devi', level: 55, hp: 4500, maxHp: 4500, damage: 280, defense: 160, xpReward: 4500, silverReward: 3200, imgUrl: 'ice_giant', elemental: { ice: 50, iceRes: 80 } }
      },
      {
        id: 'q6_4',
        name: 'Kışın Gazabı', // Epic Field Quest
        description: 'Donmuş gölün altındaki kadim varlığı uyandır.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.EVIL,
        energyCost: 15,
        karmaReward: -50,
        enemyTemplate: { id: 'e6_4', name: 'Leviathan', level: 58, hp: 6000, maxHp: 6000, damage: 350, defense: 200, xpReward: 8000, silverReward: 5000, imgUrl: 'dragon', elemental: { ice: 100, iceRes: 100 } }
      },
      {
        id: 'q6_boss',
        name: 'Buzulun Kalbi',
        description: 'Vadideki laneti kaldırmak için kalbi yok et.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.GOOD,
        energyCost: 15,
        karmaReward: 50,
        enemyTemplate: { id: 'e6_boss', name: 'Kış Cadısı', level: 60, hp: 6500, maxHp: 6500, damage: 400, defense: 220, xpReward: 8500, silverReward: 5500, imgUrl: 'shadow', elemental: { ice: 80, shock: 50 } }
      }
    ]
  },
  {
    id: 'r7',
    name: 'Yanardağ Krateri',
    description: 'Lavların aktığı, ateş iblislerinin doğduğu yer.',
    minLevel: 60,
    imageUrl: 'region_volcano', 
    mapCoordinates: { top: 25, left: 75 },
    quests: [
      {
        id: 'q7_1',
        name: 'Lav Böcekleri',
        description: 'Yanardağ eteklerindeki zararlıları temizle.',
        difficulty: QuestDifficulty.EASY,
        alignment: QuestAlignment.GOOD,
        energyCost: 8,
        karmaReward: 5,
        enemyTemplate: { id: 'e7_1', name: 'Lav Akrebi', level: 61, hp: 4500, maxHp: 4500, damage: 300, defense: 150, xpReward: 4500, silverReward: 3000, imgUrl: 'scorpion', elemental: { fire: 40 } }
      },
      {
        id: 'q7_2',
        name: 'Ateş İblisi',
        description: 'Cehennemden gelen alevleri söndür.',
        difficulty: QuestDifficulty.NORMAL,
        alignment: QuestAlignment.GOOD,
        energyCost: 10,
        karmaReward: 10,
        enemyTemplate: { id: 'e7_2', name: 'İfrit', level: 64, hp: 5500, maxHp: 5500, damage: 380, defense: 180, xpReward: 5500, silverReward: 3800, imgUrl: 'fire_demon', elemental: { fire: 80, fireRes: 90 } }
      },
      {
        id: 'q7_3',
        name: 'Ejderha Yumurtası',
        description: 'Ejderha yumurtasını çal ve büyücülere sat.',
        difficulty: QuestDifficulty.HARD,
        alignment: QuestAlignment.EVIL,
        energyCost: 12,
        karmaReward: -25,
        enemyTemplate: { id: 'e7_3', name: 'Ejderha Annesi', level: 67, hp: 7000, maxHp: 7000, damage: 450, defense: 220, xpReward: 7000, silverReward: 4500, imgUrl: 'dragon', elemental: { fire: 100 } }
      },
      {
        id: 'q7_4',
        name: 'Volkanik Lord', // Epic
        description: 'Dağın içindeki devasa lordu dizginle.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.EVIL,
        energyCost: 18,
        karmaReward: -60,
        enemyTemplate: { id: 'e7_4', name: 'Magma Lordu', level: 70, hp: 9000, maxHp: 9000, damage: 600, defense: 300, xpReward: 12000, silverReward: 8000, imgUrl: 'fire_demon', elemental: { fire: 200 } }
      },
      {
        id: 'q7_boss',
        name: 'Anka Kuşu',
        description: 'Küllerinden doğan efsanevi kuşu dize getir.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.GOOD,
        energyCost: 20,
        karmaReward: 100,
        enemyTemplate: { id: 'e7_boss', name: 'Kızıl Anka', level: 72, hp: 10000, maxHp: 10000, damage: 700, defense: 350, xpReward: 15000, silverReward: 10000, imgUrl: 'dragon', elemental: { fire: 300 } }
      }
    ]
  },
  {
    id: 'r8',
    name: 'Gölge Diyarı',
    description: 'Işığın giremediği, kabusların gerçeğe dönüştüğü boyut.',
    minLevel: 70,
    imageUrl: 'region_forest', 
    mapCoordinates: { top: 10, left: 60 },
    quests: [
      {
        id: 'q8_1',
        name: 'Karanlık Ruhlar',
        description: 'Ormanda dolaşan kayıp ruhları huzura erdir.',
        difficulty: QuestDifficulty.EASY,
        alignment: QuestAlignment.GOOD,
        energyCost: 10,
        karmaReward: 8,
        enemyTemplate: { id: 'e8_1', name: 'Kayıp Ruh', level: 71, hp: 6000, maxHp: 6000, damage: 400, defense: 200, xpReward: 6000, silverReward: 4000, imgUrl: 'shadow' }
      },
      {
        id: 'q8_2',
        name: 'Gölge Avcısı',
        description: 'Görünmez saldırılara karşı hayatta kal.',
        difficulty: QuestDifficulty.NORMAL,
        alignment: QuestAlignment.GOOD,
        energyCost: 12,
        karmaReward: 12,
        enemyTemplate: { id: 'e8_2', name: 'Gölge Suikastçısı', level: 74, hp: 7500, maxHp: 7500, damage: 500, defense: 250, xpReward: 7500, silverReward: 5000, imgUrl: 'shadow', elemental: { shock: 50, poison: 50 } }
      },
      {
        id: 'q8_3',
        name: 'Karanlık Pakt',
        description: 'Ruhunu güç karşılığında karanlığa sat.',
        difficulty: QuestDifficulty.HARD,
        alignment: QuestAlignment.EVIL,
        energyCost: 15,
        karmaReward: -40,
        enemyTemplate: { id: 'e8_3', name: 'Ruh Yiyen', level: 77, hp: 9500, maxHp: 9500, damage: 650, defense: 300, xpReward: 10000, silverReward: 7000, imgUrl: 'shadow', elemental: { poison: 100 } }
      },
      {
        id: 'q8_4',
        name: 'Kabus Lordu', // Epic
        description: 'Diyarın efendisini yok et ve ışığı getir.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.GOOD,
        energyCost: 20,
        karmaReward: 50,
        enemyTemplate: { id: 'e8_4', name: 'Nocturne', level: 80, hp: 12000, maxHp: 12000, damage: 800, defense: 400, xpReward: 20000, silverReward: 12000, imgUrl: 'shadow', elemental: { shock: 100, poison: 100 } }
      },
      {
        id: 'q8_boss',
        name: 'Hiçlik Lordu',
        description: 'Varoluşu tehdit eden hiçliği durdur.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.GOOD,
        energyCost: 25,
        karmaReward: 100,
        enemyTemplate: { id: 'e8_boss', name: 'Hiçlik Avatarı', level: 82, hp: 15000, maxHp: 15000, damage: 1000, defense: 500, xpReward: 30000, silverReward: 20000, imgUrl: 'shadow', elemental: { shock: 200, poison: 200 } }
      }
    ]
  },
  {
    id: 'r9',
    name: 'Cennetin Kapıları',
    description: 'Efsaneye göre tanrıların terk ettiği yüksek zirveler.',
    minLevel: 80,
    imageUrl: 'region_peak', 
    mapCoordinates: { top: 15, left: 90 },
    quests: [
      {
        id: 'q9_1',
        name: 'Gökyüzü Muhafızları',
        description: 'Bulutların üzerindeki tapınağı koruyanları aş.',
        difficulty: QuestDifficulty.EASY,
        alignment: QuestAlignment.GOOD,
        energyCost: 12,
        karmaReward: 10,
        enemyTemplate: { id: 'e9_1', name: 'Kanatlı Şövalye', level: 81, hp: 9000, maxHp: 9000, damage: 600, defense: 300, xpReward: 9000, silverReward: 6000, imgUrl: 'knight', elemental: { shock: 50 } }
      },
      {
        id: 'q9_2',
        name: 'Wyvern Sürüsü',
        description: 'Gökyüzünün hakimiyle son savaş öncesi hazırlık.',
        difficulty: QuestDifficulty.NORMAL,
        alignment: QuestAlignment.GOOD,
        energyCost: 15,
        karmaReward: 20,
        enemyTemplate: { id: 'e9_2', name: 'Kadim Wyvern', level: 84, hp: 11000, maxHp: 11000, damage: 800, defense: 400, xpReward: 12000, silverReward: 8000, imgUrl: 'dragon', elemental: { fire: 100 } }
      },
      {
        id: 'q9_3',
        name: 'Tanrı Katili',
        description: 'Yasaklı zirveye tırman ve tanrılara meydan oku.',
        difficulty: QuestDifficulty.HARD,
        alignment: QuestAlignment.EVIL,
        energyCost: 20,
        karmaReward: -100,
        enemyTemplate: { id: 'e9_3', name: 'Düşmüş Melek', level: 87, hp: 15000, maxHp: 15000, damage: 1000, defense: 500, xpReward: 20000, silverReward: 15000, imgUrl: 'knight', elemental: { fire: 200, shock: 200 } }
      },
      {
        id: 'q9_4',
        name: 'Kıyamet', // Epic
        description: 'Dünyanın sonunu getirecek ritüeli tamamla.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.EVIL,
        energyCost: 30,
        karmaReward: -500,
        enemyTemplate: { id: 'e9_4', name: 'Mahşer Atlısı', level: 90, hp: 20000, maxHp: 20000, damage: 1500, defense: 700, xpReward: 40000, silverReward: 30000, imgUrl: 'shadow', elemental: { fire: 500, shock: 500, poison: 500, ice: 500 } }
      },
      {
        id: 'q9_boss',
        name: 'Işık Tanrısı',
        description: 'Son savaşı kazan ve yeni tanrı ol.',
        difficulty: QuestDifficulty.EPIC,
        alignment: QuestAlignment.GOOD,
        energyCost: 50,
        karmaReward: 500,
        enemyTemplate: { id: 'e9_boss', name: 'Aydınlık Avatarı', level: 100, hp: 50000, maxHp: 50000, damage: 2500, defense: 1000, xpReward: 100000, silverReward: 100000, imgUrl: 'knight', elemental: { shock: 1000 } }
      }
    ]
  }
];
