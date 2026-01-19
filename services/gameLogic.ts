
import { CombatLogEntry, Enemy, Player, Item, ElementType } from '../types';

// Helper: Get total bonus from all equipped runes for a specific stat
const getRuneStatBonus = (player: Player, stat: string) => {
    let total = 0;
    const items = Object.values(player.equipment).filter(Boolean) as Item[];
    
    items.forEach(item => {
        if (item.socketedRune && item.socketedRune.statType === stat) {
            total += item.socketedRune.bonus;
        }
    });
    return total;
};

// Helper to sum elemental stats from equipment AND socketed runes
export const calculatePlayerElementalDamage = (player: Player) => {
    const stats = { fire: 0, ice: 0, shock: 0, poison: 0 };
    const items = [
        player.equipment.weapon,
        player.equipment.artifact1,
        player.equipment.artifact2
    ];

    // Check direct item stats
    items.forEach(item => {
        if (item) {
            if (item.element && item.elementValue && item.type !== 'armor' && item.type !== 'shield' && item.type !== 'helmet' && item.type !== 'leggings') {
                stats[item.element] += item.elementValue;
            }
            // Check socketed rune
            if (item.socketedRune && item.socketedRune.element && item.socketedRune.elementValue) {
                stats[item.socketedRune.element] += item.socketedRune.elementValue;
            }
        }
    });
    return stats;
};

export const calculatePlayerElementalResistance = (player: Player) => {
    const stats = { fire: 0, ice: 0, shock: 0, poison: 0 };
    const items = [
        player.equipment.armor,
        player.equipment.helmet,
        player.equipment.shield,
        player.equipment.leggings,
        player.equipment.artifact1, 
        player.equipment.artifact2
    ];

    items.forEach(item => {
        if (item) {
             // Direct Item Res
             if (item.element && item.elementValue && ['armor', 'helmet', 'shield', 'leggings'].includes(item.type)) {
                 stats[item.element] += item.elementValue;
             }
             // Rune Res (Assume runes on armor give Res if they have element)
             if (item.socketedRune && item.socketedRune.element && item.socketedRune.elementValue) {
                 stats[item.socketedRune.element] += item.socketedRune.elementValue;
             }
        }
    });
    return stats;
}

export const calculatePlayerDamage = (player: Player): number => {
  const weaponDmg = player.equipment.weapon?.bonus || 1;
  const mountDmg = player.equipment.mount?.bonus || 0;
  
  // Stats from Runes
  const strFromRunes = getRuneStatBonus(player, 'strength');
  const skillFromRunes = getRuneStatBonus(player, 'skill'); // Maybe adds crit? sticking to raw dmg for STR
  const weaponArtFromRunes = getRuneStatBonus(player, 'weaponArt');

  const totalStr = player.stats.strength + strFromRunes;
  const totalWA = player.stats.weaponArt + weaponArtFromRunes;

  // Damage = Weapon + Mount + Strength + (WeaponArt / 2)
  return Math.floor(weaponDmg + mountDmg + totalStr + (totalWA * 0.5));
};

export const calculatePlayerDefense = (player: Player): number => {
  const armorDef = player.equipment.armor?.bonus || 0;
  const helmetDef = player.equipment.helmet?.bonus || 0;
  const shieldDef = player.equipment.shield?.bonus || 0;
  const leggingsDef = player.equipment.leggings?.bonus || 0;
  
  const totalEquipDef = armorDef + helmetDef + shieldDef + leggingsDef;
  
  // Stats from Runes
  const defArtFromRunes = getRuneStatBonus(player, 'defenseArt');
  const constFromRunes = getRuneStatBonus(player, 'constitution'); // Const adds HP usually, but let's assume it adds slight toughness here? Or ignore.
  // Actually Const handled in MaxHP. 

  const totalDefArt = player.stats.defenseArt + defArtFromRunes;

  // Defense = Equip + DefenseArt
  return Math.floor(totalEquipDef + totalDefArt);
};

export const simulateCombat = (player: Player, enemy: Enemy): { won: boolean; log: CombatLogEntry[]; remainingHp: number; playerTotalDamage: number; enemyTotalDamage: number } => {
  const log: CombatLogEntry[] = [];
  
  // Apply Constitution Bonus from Runes to Temp HP for battle (optional, or just use current HP)
  // For now, using current HP.
  let playerHp = player.hp;
  let enemyHp = enemy.hp;
  let playerTotalDamage = 0;
  let enemyTotalDamage = 0;
  let round = 1;

  // Base Stats
  const playerDmg = calculatePlayerDamage(player);
  const playerDef = calculatePlayerDefense(player);
  
  // Elemental Stats
  const playerElemDmg = calculatePlayerElementalDamage(player);
  const playerElemRes = calculatePlayerElementalResistance(player);

  // Rune Stat Bonuses for Chance Calculations
  const skillFromRunes = getRuneStatBonus(player, 'skill');
  const luckFromRunes = getRuneStatBonus(player, 'luck');
  const totalSkill = player.stats.skill + skillFromRunes;
  const totalLuck = player.stats.luck + luckFromRunes;
  const totalWA = player.stats.weaponArt + getRuneStatBonus(player, 'weaponArt');
  const totalDA = player.stats.defenseArt + getRuneStatBonus(player, 'defenseArt');

  // Enemy Elemental (Default to 0 if undefined)
  const enemyElemDmg = {
      fire: enemy.elemental?.fire || 0,
      ice: enemy.elemental?.ice || 0,
      shock: enemy.elemental?.shock || 0,
      poison: enemy.elemental?.poison || 0
  };
  const enemyElemRes = {
      fire: enemy.elemental?.fireRes || 0,
      ice: enemy.elemental?.iceRes || 0,
      shock: enemy.elemental?.shockRes || 0,
      poison: enemy.elemental?.poisonRes || 0
  };

  // Hit Chance = Base (50) + Skill * 2 + WeaponArt
  const playerHitChance = 50 + (totalSkill * 2) + totalWA;
  
  // Crit Chance = Luck * 1.5
  const playerCritChance = Math.min(50, totalLuck * 1.5);
  
  // Block/Dodge Chance = DefenseArt + (Skill / 2)
  const playerMitigationChance = Math.min(40, totalDA + (totalSkill * 0.5));

  log.push({ round: 0, text: `${enemy.name} ile düello başladı!`, type: 'info' });

  while (playerHp > 0 && enemyHp > 0 && round < 40) {
    // --- Player Turn ---
    const hitRoll = Math.random() * 100;
    const enemyDodgeChance = enemy.level * 3;

    if (hitRoll <= (playerHitChance - enemyDodgeChance)) {
      let physicalDamage = Math.max(1, playerDmg - (enemy.defense / 2));
      
      const critRoll = Math.random() * 100;
      let isCrit = false;
      
      if (critRoll <= playerCritChance) {
        physicalDamage = Math.floor(physicalDamage * 1.5);
        isCrit = true;
      }

      // Elemental Calculation
      let totalElementalDmg = 0;
      let elemLog = [];
      
      if (playerElemDmg.fire > 0) {
          const dmg = Math.max(0, playerElemDmg.fire - enemyElemRes.fire);
          if (dmg > 0) { totalElementalDmg += dmg; elemLog.push(`${dmg} Ateş`); }
      }
      if (playerElemDmg.ice > 0) {
          const dmg = Math.max(0, playerElemDmg.ice - enemyElemRes.ice);
          if (dmg > 0) { totalElementalDmg += dmg; elemLog.push(`${dmg} Buz`); }
      }
      if (playerElemDmg.shock > 0) {
          const dmg = Math.max(0, playerElemDmg.shock - enemyElemRes.shock);
          if (dmg > 0) { totalElementalDmg += dmg; elemLog.push(`${dmg} Şok`); }
      }
      if (playerElemDmg.poison > 0) {
          const dmg = Math.max(0, playerElemDmg.poison - enemyElemRes.poison);
          if (dmg > 0) { totalElementalDmg += dmg; elemLog.push(`${dmg} Zehir`); }
      }

      const totalRoundDamage = Math.floor(physicalDamage + totalElementalDmg);
      enemyHp -= totalRoundDamage;
      playerTotalDamage += totalRoundDamage;

      // Hit Zone
      const zones = ['Kafa', 'Gövde', 'Gövde', 'Kol', 'Bacak'];
      const hitZone = zones[Math.floor(Math.random() * zones.length)];
      
      let logText = `${enemy.name} hedefine (${hitZone}) ${isCrit ? 'KRİTİK ' : ''}vurdun: ${Math.floor(physicalDamage)} fiziksel`;
      if (elemLog.length > 0) logText += ` + ${elemLog.join(', ')} hasar.`;
      else logText += ` hasar.`;

      log.push({
        round,
        text: logText,
        type: isCrit ? 'crit' : 'player-hit'
      });
    } else {
      log.push({ round, text: `${enemy.name} saldırını savuşturdu!`, type: 'info' });
    }

    if (enemyHp <= 0) break;

    // --- Enemy Turn ---
    const enemyHitRoll = Math.random() * 100;
    const enemyHitChance = 65 + (enemy.level * 2); 
    
    const mitigationRoll = Math.random() * 100;
    let mitigated = false;

    if (mitigationRoll <= playerMitigationChance) {
        log.push({ round, text: `${enemy.name} saldırısını kalkanınla blokladın/kaçırdın!`, type: 'block' });
        mitigated = true;
    }

    if (!mitigated) {
        if (enemyHitRoll <= enemyHitChance) {
            let physicalDamage = Math.max(1, enemy.damage - (playerDef / 2));
            
            // Enemy Elemental Logic
            let totalEnemyElemDmg = 0;
            let enemyElemLog = [];

            if (enemyElemDmg.fire > 0) {
                const dmg = Math.max(0, enemyElemDmg.fire - playerElemRes.fire);
                if (dmg > 0) { totalEnemyElemDmg += dmg; enemyElemLog.push(`${dmg} Ateş`); }
            }
            if (enemyElemDmg.ice > 0) {
                const dmg = Math.max(0, enemyElemDmg.ice - playerElemRes.ice);
                if (dmg > 0) { totalEnemyElemDmg += dmg; enemyElemLog.push(`${dmg} Buz`); }
            }
            if (enemyElemDmg.shock > 0) {
                const dmg = Math.max(0, enemyElemDmg.shock - playerElemRes.shock);
                if (dmg > 0) { totalEnemyElemDmg += dmg; enemyElemLog.push(`${dmg} Şok`); }
            }
            if (enemyElemDmg.poison > 0) {
                const dmg = Math.max(0, enemyElemDmg.poison - playerElemRes.poison);
                if (dmg > 0) { totalEnemyElemDmg += dmg; enemyElemLog.push(`${dmg} Zehir`); }
            }

            const totalRoundDamage = Math.floor(physicalDamage + totalEnemyElemDmg);
            playerHp -= totalRoundDamage;
            enemyTotalDamage += totalRoundDamage;
            
            let logText = `${enemy.name} sana vurdu: ${Math.floor(physicalDamage)} fiziksel`;
            if (enemyElemLog.length > 0) logText += ` + ${enemyElemLog.join(', ')} hasar.`;
            else logText += ` hasar.`;

            log.push({
                round,
                text: logText,
                type: 'enemy-hit'
            });
        } else {
            log.push({ round, text: `${enemy.name} seni ıska geçti!`, type: 'info' });
        }
    }

    round++;
  }

  const won = playerHp > 0;
  log.push({
    round,
    text: won ? `Zafer! ${enemy.name} yere yığıldı.` : `Yenilgi! ${enemy.name} karşısında diz çöktün.`,
    type: won ? 'win' : 'loss'
  });

  return { won, log, remainingHp: Math.max(0, Math.floor(playerHp)), playerTotalDamage, enemyTotalDamage };
};
