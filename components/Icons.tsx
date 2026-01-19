
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const BaseIcon: React.FC<IconProps & { path: React.ReactNode, viewBox?: string }> = ({ className, size = 24, path, viewBox = "0 0 512 512" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox={viewBox} 
    className={className} 
    fill="currentColor"
  >
    {path}
  </svg>
);

// --- ELEMENTAL ICONS ---

export const IconFire: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M192 448c-12.2 0-23.3-7.2-28.1-18.4-15.8-37.1-12.7-55.8-9.9-72.3 2.1-12.7 4.2-25.1-4.2-39.2-2.1-3.6-4.6-7-7.4-10.2-11-12.6-26.6-18-42.3-23.4-16.1-5.5-32.6-11.2-46.7-27.1C32.1 233.1 32 195.9 53.4 153c3.6-7.3 12.8-10.3 20.1-6.6 7.3 3.6 10.3 12.8 6.6 20.1-15.8 31.6-14.7 56 .9 73.6 9.3 10.5 21.8 14.8 35.1 19.3 14.9 5.1 31.1 10.7 43.1 24.3 16.9 19.3 22.3 47.9 16.7 82-.5 3-1 5.9-1.4 8.7 13.9-10.5 27.2-22.3 39.5-35.3 4.2-4.4 11.2-4.4 15.6 0 24.6 24.6 37.8 55.8 37.8 89.9 0 10.6-8.6 19.2-19.2 19.2H192zm128-224c0-23.9-6.3-46.4-17.2-66.2-7.5-13.6-17.1-25.8-28.4-36.2C256.3 103.1 243.6 92.4 229.2 84c-19.3-11.3-41-18.2-63.9-19.6-8.2-.5-14.4-7.7-13.9-15.9.5-8.2 7.7-14.4 15.9-13.9 27.7 1.7 53.8 10 77.1 23.7 17.3 10.2 32.7 23.1 46 38.3 13.6 15.5 25 33.1 34 52.3 13.1 23.9 20.7 51 20.7 79.8 0 8.8-7.2 16-16 16s-16-7.2-16-16c-.1-2.9-.6-5.8-1.1-8.7z" />
  } />
);

export const IconShock: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V240c0 8.8-7.2 16-16 16s-16-7.2-16-16V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V336c0 1.5 0 3.1 .1 4.6L67.6 283c-16-16-41.9-16-57.9 0s-16 41.9 0 57.9l160 160c16 16 41.9 16 57.9 0s16-41.9 0-57.9l-5.6-5.6C222 437.4 222 437.2 222 437V160h48c8.8 0 16 7.2 16 16v64c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM416 272c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V304c0-17.7-14.3-32-32-32z"/>
  } />
);

export const IconIce: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
  } />
);

export const IconPoison: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M368.5 16.1c-13.6-7.5-30.7-2.6-38.3 11L288 102.5V80c0-26.5-21.5-48-48-48h-8V16c0-8.8-7.2-16-16-16H168c-8.8 0-16 7.2-16 16V32h-8c-26.5 0-48 21.5-48 48v22.5L53.8 27.1c-7.5-13.6-24.7-18.6-38.3-11s-18.6 24.7-11 38.3L96 236.8V320c0 88.4 71.6 160 160 160s160-71.6 160-160V236.8l91.5-182.4c7.5-13.6 2.6-30.7-11-38.3zM256 416c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64-64z"/>
  } />
);

// --- PROPERTY ICONS ---

export const IconPropertyHome: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M512 256L256 64 0 256v48h64v144h384V304h64v-48zM288 400h-64v-80h64v80z"/>
  } />
);

export const IconPropertyShop: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM160 128v64h64V128H160zM352 128v64h-64V128h64zM96 128v64h-32V128H96zM448 128v64h-32V128h32zM64 256v96H448V256H64z"/>
  } />
);

export const IconPropertyFarm: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M64 96H0c0 123.7 100.3 224 224 224v144c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V320C288 196.3 187.7 96 64 96zm384-64c-84.2 0-157.4 46.5-195.7 115.2 27.7 30.2 53.5 62.7 75.8 96.9C352.5 390.2 452.1 480 512 480V32c0-17.7-14.3-32-32-32z"/>
  } />
);

export const IconPropertyCastle: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M0 32v128h96V32H0zm128 32v96h64v64H96v64h96v32H64v64h64v96h128v-96h64v-64h-96v-32h96v-64H224v-64h64V64H128zm192 0v128h96V64h-96zm96 384v-96h96V32H384v64h-32v32h32v224h-64v96h128z"/>
  } />
);

export const IconPropertyWheat: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M64 480c-35.3 0-64-28.7-64-64V64C0 28.7 28.7 0 64 0S128 28.7 128 64V416c0 35.3-28.7 64-64 64zM256 480c-35.3 0-64-28.7-64-64V128c0-35.3 28.7-64 64-64s64 28.7 64 64V416c0 35.3-28.7 64-64 64zM448 480c-35.3 0-64-28.7-64-64V192c0-35.3 28.7-64 64-64s64 28.7 64 64V416c0 35.3-28.7 64-64 64z"/>
  } />
);

// --- RACE AVATARS ---

export const IconAvatarHuman: React.FC<IconProps> = ({ className, size = 128 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
    <circle cx="100" cy="100" r="90" fill="#292524" />
    <path d="M50 100 L50 60 Q100 20 150 60 L150 100 Z" fill="#57534e" /> {/* Helmet Top */}
    <rect x="95" y="60" width="10" height="80" fill="#1c1917" /> {/* Vert Visor */}
    <rect x="50" y="90" width="100" height="10" fill="#1c1917" /> {/* Horiz Visor */}
    <path d="M50 100 L150 100 L140 160 Q100 190 60 160 Z" fill="#78716c" /> {/* Helmet Bottom */}
    <path d="M60 180 Q100 200 140 180 L140 200 L60 200 Z" fill="#44403c" /> {/* Shoulders */}
  </svg>
);

export const IconAvatarOrc: React.FC<IconProps> = ({ className, size = 128 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
    <circle cx="100" cy="100" r="90" fill="#1c1917" />
    <path d="M60 60 Q100 30 140 60 L130 130 Q100 160 70 130 Z" fill="#3f6212" /> {/* Head */}
    <path d="M75 130 L75 110 L125 110 L125 130 Z" fill="#14532d" /> {/* Mouth area */}
    <path d="M80 130 L80 105" stroke="white" strokeWidth="4" /> {/* Tusk L */}
    <path d="M120 130 L120 105" stroke="white" strokeWidth="4" /> {/* Tusk R */}
    <circle cx="80" cy="90" r="3" fill="red" /> {/* Eye L */}
    <circle cx="120" cy="90" r="3" fill="red" /> {/* Eye R */}
    <path d="M50 160 Q100 190 150 160 L160 200 L40 200 Z" fill="#3f6212" /> {/* Shoulders */}
  </svg>
);

export const IconAvatarElf: React.FC<IconProps> = ({ className, size = 128 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
    <circle cx="100" cy="100" r="90" fill="#0c4a6e" />
    <path d="M70 70 Q100 50 130 70 L120 140 Q100 170 80 140 Z" fill="#fde047" fillOpacity="0.8" /> {/* Face */}
    <path d="M70 90 L50 60 L70 100" fill="#fde047" fillOpacity="0.8" /> {/* Ear L */}
    <path d="M130 90 L150 60 L130 100" fill="#fde047" fillOpacity="0.8" /> {/* Ear R */}
    <path d="M70 70 Q100 60 130 70 L140 140 L60 140 Z" fill="#fbbf24" /> {/* Hair */}
    <path d="M60 160 Q100 180 140 160 L140 200 L60 200 Z" fill="#0369a1" /> {/* Robe */}
  </svg>
);

export const IconAvatarVampire: React.FC<IconProps> = ({ className, size = 128 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
    <circle cx="100" cy="100" r="90" fill="#2a0a12" />
    <path d="M50 60 L150 60 L130 140 L70 140 Z" fill="#e5e5e5" /> {/* Face Pale */}
    <path d="M50 60 L150 60 L150 90 L100 110 L50 90 Z" fill="#171717" /> {/* Hair widow peak */}
    <path d="M85 145 L90 155 L95 145" fill="white" /> {/* Fang L */}
    <path d="M105 145 L110 155 L115 145" fill="white" /> {/* Fang R */}
    <circle cx="85" cy="100" r="3" fill="#ef4444" /> {/* Eye L */}
    <circle cx="115" cy="100" r="3" fill="#ef4444" /> {/* Eye R */}
    <path d="M40 140 L60 180 L140 180 L160 140 L160 200 L40 200 Z" fill="#7f1d1d" /> {/* Collar */}
  </svg>
);

// --- ENEMY AVATARS ---

export const IconEnemyWolf: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#44403c" />
        <path d="M60 60 L30 30 L80 80 Z" fill="#78716c" /> {/* Ear L */}
        <path d="M140 60 L170 30 L120 80 Z" fill="#78716c" /> {/* Ear R */}
        <path d="M70 80 L130 80 L110 160 L90 160 Z" fill="#a8a29e" /> {/* Snout */}
        <circle cx="80" cy="100" r="5" fill="#ef4444" /> {/* Eye L */}
        <circle cx="120" cy="100" r="5" fill="#ef4444" /> {/* Eye R */}
        <path d="M90 160 L100 170 L110 160" fill="black" /> {/* Nose */}
    </svg>
);

export const IconEnemyBandit: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#171717" />
        <path d="M50 50 Q100 20 150 50 L160 140 L40 140 Z" fill="#7f1d1d" /> {/* Hood */}
        <rect x="50" y="90" width="100" height="30" fill="#1c1917" /> {/* Mask */}
        <circle cx="80" cy="80" r="4" fill="white" /> 
        <circle cx="120" cy="80" r="4" fill="white" /> 
    </svg>
);

export const IconEnemySkeleton: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#262626" />
        <path d="M60 60 Q100 40 140 60 L140 120 Q100 150 60 120 Z" fill="#e5e5e5" /> {/* Skull */}
        <circle cx="85" cy="90" r="10" fill="#171717" />
        <circle cx="115" cy="90" r="10" fill="#171717" />
        <path d="M95 110 L105 110 L100 100 Z" fill="#171717" />
        <rect x="80" y="125" width="40" height="5" fill="#171717" />
    </svg>
);

export const IconEnemyTroll: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#064e3b" />
        <path d="M50 80 Q100 50 150 80 L140 150 Q100 180 60 150 Z" fill="#4d7c0f" />
        <path d="M90 120 L110 120 L100 100 Z" fill="#365314" /> {/* Nose */}
        <path d="M80 140 L80 110" stroke="#fefce8" strokeWidth="6" /> {/* Tusk L */}
        <path d="M120 140 L120 110" stroke="#fefce8" strokeWidth="6" /> {/* Tusk R */}
    </svg>
);

export const IconEnemyScorpion: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#451a03" />
        <ellipse cx="100" cy="100" rx="30" ry="50" fill="#92400e" />
        <path d="M70 60 L40 40" stroke="#92400e" strokeWidth="8" />
        <path d="M130 60 L160 40" stroke="#92400e" strokeWidth="8" />
        <path d="M100 150 Q120 180 150 130" stroke="#78350f" strokeWidth="8" fill="none" />
        <path d="M150 130 L160 120" stroke="red" strokeWidth="4" />
    </svg>
);

export const IconEnemyIce: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#1e3a8a" />
        <path d="M60 70 L100 40 L140 70 L130 150 L70 150 Z" fill="#93c5fd" />
        <path d="M80 90 L120 90" stroke="#1e3a8a" strokeWidth="2" />
        <circle cx="85" cy="80" r="4" fill="#1d4ed8" />
        <circle cx="115" cy="80" r="4" fill="#1d4ed8" />
        <path d="M60 40 L70 70" stroke="#60a5fa" strokeWidth="4" />
        <path d="M140 40 L130 70" stroke="#60a5fa" strokeWidth="4" />
    </svg>
);

export const IconEnemyDemon: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#450a0a" />
        <path d="M60 80 Q100 60 140 80 L130 160 Q100 180 70 160 Z" fill="#991b1b" />
        <path d="M60 80 L40 40" fill="none" stroke="#fca5a5" strokeWidth="8" />
        <path d="M140 80 L160 40" fill="none" stroke="#fca5a5" strokeWidth="8" />
        <path d="M80 110 Q100 130 120 110" stroke="yellow" strokeWidth="3" fill="none" />
        <circle cx="85" cy="100" r="4" fill="yellow" />
        <circle cx="115" cy="100" r="4" fill="yellow" />
    </svg>
);

export const IconEnemyDragon: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#1a2e05" />
        <path d="M50 70 Q100 40 150 70 L140 150 Q100 180 60 150 Z" fill="#365314" />
        <path d="M100 40 L100 70" fill="none" stroke="#a3e635" strokeWidth="4" />
        <path d="M50 70 L30 30" fill="none" stroke="white" strokeWidth="6" />
        <path d="M150 70 L170 30" fill="none" stroke="white" strokeWidth="6" />
        <circle cx="80" cy="90" r="5" fill="#facc15" />
        <circle cx="120" cy="90" r="5" fill="#facc15" />
    </svg>
);

export const IconEnemyKnight: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#0f172a" />
        <path d="M60 60 L140 60 L140 140 Q100 180 60 140 Z" fill="#475569" />
        <rect x="95" y="60" width="10" height="80" fill="#0f172a" />
        <rect x="60" y="90" width="80" height="10" fill="#0f172a" />
        <path d="M80 20 L120 20 L100 60 Z" fill="#dc2626" /> {/* Plume */}
    </svg>
);

export const IconEnemyShadow: React.FC<IconProps> = ({ className, size = 128 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx="100" cy="100" r="90" fill="#000000" />
        <path d="M70 70 Q100 50 130 70 L120 150 Q100 170 80 150 Z" fill="#262626" />
        <circle cx="85" cy="90" r="3" fill="#a855f7" />
        <circle cx="115" cy="90" r="3" fill="#a855f7" />
        <path d="M100 120 Q120 140 140 110" stroke="#a855f7" strokeWidth="2" fill="none" />
    </svg>
);

export const EnemyAvatar: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
    const props = { className: className || "w-full h-full", size: 128 };
    
    if (type && (type.startsWith('http') || type.startsWith('data:'))) {
        return <img src={type} alt="Enemy" className={`${className} object-cover`} />;
    }

    switch (type) {
        case 'wolf': return <IconEnemyWolf {...props} />;
        case 'bandit': return <IconEnemyBandit {...props} />;
        case 'skeleton': return <IconEnemySkeleton {...props} />;
        case 'troll': return <IconEnemyTroll {...props} />;
        case 'scorpion': return <IconEnemyScorpion {...props} />;
        case 'ice_giant': return <IconEnemyIce {...props} />;
        case 'fire_demon': return <IconEnemyDemon {...props} />;
        case 'shadow': return <IconEnemyShadow {...props} />;
        case 'dragon': return <IconEnemyDragon {...props} />;
        case 'knight': return <IconEnemyKnight {...props} />;
        case 'training_dummy': return <IconAvatarHuman {...props} />; // Placeholder
        default: return <IconSkull {...props} />;
    }
}

// --- REGION ICONS ---

export const IconRegionVillage: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M64 192h96v256H64V192zm288 0h96v256h-96V192zM112 64l128 64 128-64L240 0 112 64zM240 224h32v224h-32V224z" />
    } />
);

export const IconRegionSwamp: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M256 32c-60 0-112 36-136 88-14 30-16 64-6 96-20 8-34 26-34 48 0 24 16 44 38 52 4 48 44 86 94 86s90-38 94-86c22-8 38-28 38-52 0-22-14-40-34-48 10-32 8-66-6-96-24-52-76-88-136-88z" opacity="0.8" />
    } />
);

export const IconRegionRuins: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M128 32v64h32V64h64V32h-96zm-64 96v288h224V128H64zm256 0v96h-64v64h64v128h96V128h-96z" />
    } />
);

export const IconRegionCave: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M256 32C114.6 32 0 146.6 0 288v160h512V288c0-141.4-114.6-256-256-256zm0 96c88.4 0 160 71.6 160 160h-64c0-53-43-96-96-96s-96 43-96 96H96c0-88.4 71.6-160 160-160z" />
    } />
);

export const IconRegionDesert: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M64 352s48-64 128-64 128 64 128 64 64-96 160-32v96H32v-64s8 0 32 0zM256 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
    } />
);

export const IconRegionIce: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M256 0L160 160h192L256 0zM96 192L0 352h192L96 192zm320 0l-96 160h192l-96-160z" />
    } />
);

export const IconRegionVolcano: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M256 32l-96 160h192L256 32zM32 448h448L368 256H144L32 448z" />
    } />
);

export const IconRegionForest: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M256 32L128 224h256L256 32zM96 256L0 416h192L96 256zm320 0l-96 160h192l-96-160z" />
    } />
);

export const IconRegionPeak: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M256 0L0 448h512L256 0zm0 100l140 248H116L256 100z" />
    } />
);

export const RegionAvatar: React.FC<{ type: string; className?: string; size?: number }> = ({ type, className, size = 128 }) => {
    const props = { className: className || "text-stone-500", size };
    
    // Add support for external URLs for Region Avatars
    if (type && (type.startsWith('http') || type.startsWith('data:'))) {
        return <img src={type} alt="Region" className={`${className} object-cover`} />;
    }
    
    switch (type) {
        case 'region_village': return <IconRegionVillage {...props} />;
        case 'region_swamp': return <IconRegionSwamp {...props} />;
        case 'region_ruins': return <IconRegionRuins {...props} />;
        case 'region_cave': return <IconRegionCave {...props} />;
        case 'region_desert': return <IconRegionDesert {...props} />;
        case 'region_ice': return <IconRegionIce {...props} />;
        case 'region_volcano': return <IconRegionVolcano {...props} />;
        case 'region_forest': return <IconRegionForest {...props} />;
        case 'region_peak': return <IconRegionPeak {...props} />;
        default: return <IconMap {...props} />;
    }
}

// --- GAME ITEMS & UI ---

export const IconGameLogo: React.FC<IconProps> = ({ className, size = 128 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={size} height={size} className={className}>
    <defs>
        <linearGradient id="lg_gold" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#f1c40f"/><stop offset="100%" stopColor="#d35400"/></linearGradient>
    </defs>
    <path d="M 256 480 C 256 480, 440 380, 440 140 L 440 60 L 256 30 L 72 60 L 72 140 C 72 380, 256 480, 256 480 Z" fill="#1c1917" stroke="url(#lg_gold)" strokeWidth="8"/>
    <g transform="translate(256, 256) scale(0.7)">
        <path d="M -15 -180 L 15 -180 L 10 120 L 0 140 L -10 120 Z" fill="#9ca3af" transform="rotate(-45)"/>
        <path d="M -50 -180 L 50 -180 L 45 -160 L 0 -150 L -45 -160 Z" fill="#fbbf24" transform="rotate(-45)"/>
        <path d="M -15 -180 L 15 -180 L 10 120 L 0 140 L -10 120 Z" fill="#9ca3af" transform="rotate(45)"/>
        <path d="M -50 -180 L 50 -180 L 45 -160 L 0 -150 L -45 -160 Z" fill="#fbbf24" transform="rotate(45)"/>
    </g>
  </svg>
);

export const IconTournament: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M128 0h256v448l-128 64-128-64V0zm16 16v414l112 56 112-56V16H144zM256 128l80 128h-160l80-128z" />
  } />
);

export const IconSword: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M473.6 38.4c-24.8-24.8-65-24.8-89.8 0L208.6 213.6l-50.6-26.6c-4.4-2.4-9.8-1.6-13.4 1.8l-15.6 15.6c-3.6 3.6-4.6 9-2.2 13.6l26.2 49.4-94 94c-12.2 12.2-12.2 32 0 44.2l39 39c12.2 12.2 32 12.2 44.2 0l94-94 49.4 26.2c4.6 2.4 10 1.4 13.6-2.2l15.6-15.6c3.4-3.6 4.2-9 1.8-13.4l-26.6-50.6L473.6 128.2c24.8-24.8 24.8-65 0-89.8zM368 128l-32-32 80-80 32 32-80 80z"/>
  } />
);

export const IconShield: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M256 0C114.6 0 0 76.2 0 192c0 148.4 115.6 320 256 320s256-171.6 256-320C512 76.2 397.4 0 256 0zM144 192c0-17.6 14.4-32 32-32h160c17.6 0 32 14.4 32 32s-14.4 32-32 32H176c-17.6 0-32-14.4-32-32z"/>
  } />
);

export const IconHelmet: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M256 32C114.6 32 0 126.6 0 242.8c0 28.2 6.4 55 18 79.4l46 96c6.6 13.8 20.6 22.6 35.8 22.6h312.4c15.2 0 29.2-8.8 35.8-22.6l46-96c11.6-24.4 18-51.2 18-79.4C512 126.6 397.4 32 256 32zm0 80c26.6 0 48 21.4 48 48v80h-96v-80c0-26.6 21.4-48 48-48z"/>
  } />
);

export const IconArmor: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M112 48c-15.6 0-29.6 9.2-36.2 23L38 153.8C14.6 205.2 2.6 261 2.6 317.4c0 12.8 2.2 25.4 6.4 37.6 13.2 38.2 49.4 65 91 65h312c41.6 0 77.8-26.8 91-65 4.2-12.2 6.4-24.8 6.4-37.6 0-56.4-12-112.2-35.4-163.6L436.2 71c-6.6-13.8-20.6-23-36.2-23H320v96H192V48h-80z"/>
  } />
);

export const IconBoot: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M32 0C14.3 0 0 14.3 0 32v384c0 17.7 14.3 32 32 32h160c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H32zm64 256h64v64H96v-64zm0-96h64v64H96v-64zm0-96h64v64H96V64z"/>
  } />
);

export const IconPaw: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M256 224c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm-112 32c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm224 0c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zM128 448c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm256 0c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"/>
  } />
);

export const IconHeart: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/>
  } />
);

export const IconEnergy: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M256 0L96 256h128l-64 256 256-256H288L352 0H256z"/>
  } />
);

export const IconCoin: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M256 32C114.6 32 0 103.6 0 192c0 88.4 114.6 160 256 160s256-71.6 256-160c0-88.4-114.6-160-256-160zm0 64c53 0 96 28.6 96 64s-43 64-96 64-96-28.6-96-64 43-64 96-64zm0 384c-141.4 0-256-71.6-256-160 0-14.6 3.2-28.8 9.2-42.6C46.8 350.6 142.2 400 256 400s209.2-49.4 246.8-122.6c6 13.8 9.2 28 9.2 42.6 0 88.4-114.6 160-256 160z"/>
  } />
);

export const IconGem: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M228.6 15.8c15.6-18.4 43.2-18.4 58.8 0L386 132.8c10.8 12.6 14 30.2 8.4 45.8L270.8 493.4c-8.2 23-41.4 23-49.6 0L97.6 178.6c-5.6-15.6-2.4-33.2 8.4-45.8L228.6 15.8z"/>
  } />
);

export const IconSkull: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M256 0C142.8 0 48 83 48 192c0 47.6 17.8 86.8 44.8 116.8 6.4 6.8 6.8 17.6.8 24.8-11.2 13.4-19.6 29.8-19.6 48.4 0 35.4 28.6 64 64 64h236c35.4 0 64-28.6 64-64 0-18.6-8.4-35-19.6-48.4-6-7.2-5.6-18 .8-24.8C446.2 278.8 464 239.6 464 192 464 83 369.2 0 256 0zM176 192c0-17.6 14.4-32 32-32s32 14.4 32 32-14.4 32-32 32-32-14.4-32-32zm160 32c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z"/>
  } />
);

export const IconScroll: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M96 32C43 32 0 75 0 128s43 96 96 96V64h320v384H96c-53 0-96 43-96 96s43 96 96 96h352c35.4 0 64-28.6 64-64V96c0-35.4-28.6-64-64-64H96z"/>
  } />
);

export const IconMap: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M384 48c0-26.6-21.4-48-48-48H176c-26.6 0-48 21.4-48 48v288c0 26.6 21.4 48 48 48h160c26.6 0 48-21.4 48-48V48zm-16 288H144V48h224v288zM64 128H32v304c0 26.6 21.4 48 48 48h304v-32H80c-8.8 0-16-7.2-16-16V128z"/>
  } />
);

export const IconRelic: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M256 0c-44.2 0-80 35.8-80 80 0 24.8 11.4 46.8 29.2 61.4L176 256l-96 96 48 48 96-96 96 96 48-48-96-96-29.2-114.6c17.8-14.6 29.2-36.6 29.2-61.4 0-44.2-35.8-80-80-80z"/>
  } />
);

export const IconBag: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M144 64h224v64H144V64zm224 64v320H144V128H80v352c0 17.6 14.4 32 32 32h288c17.6 0 32-14.4 32-32V128h-64zM256 0c-35.4 0-64 28.6-64 64h128c0-35.4-28.6-64-64-64z"/>
  } />
);

export const IconHammer: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M470.8 123.6l-84.4-84.4c-12.2-12.2-32-12.2-44.2 0L242.6 139l-22-22-94 94c-12.2 12.2-12.2 32 0 44.2l39 39c12.2 12.2 32 12.2 44.2 0l94-94-22-22 99.8-99.8c12.2-12.2 12.2-32-.8-44.8zM192 384l-48 48-112-112 48-48 112 112z"/>
  } />
);

export const IconEye: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M256 112c-79.6 0-144 64.4-144 144s64.4 144 144 144 144-64.4 144-144-64.4-144-144-144zm0 240c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm0-160c-35.4 0-64 28.6-64 64s28.6 64 64 64 64-28.6 64-64-28.6-64-64-64zM256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm0 464c-114.8 0-208-93.2-208-208S141.2 48 256 48s208 93.2 208 208-93.2 208-208 208z"/>
  } />
);

export const IconFlag: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
      <path d="M32 32C14.3 32 0 46.3 0 64v384c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32zm64 0v288c0 17.7 14.3 32 32 32h352c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H128c-17.7 0-32 14.3-32 32z"/>
  } />
);

export const IconCastle: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
      <path d="M464 48c-8.8 0-16 7.2-16 16v48H352V64c0-8.8-7.2-16-16-16s-16 7.2-16 16v48H192V64c0-8.8-7.2-16-16-16s-16 7.2-16 16v48H64V64c0-8.8-7.2-16-16-16S32 55.2 32 64v416c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V64c0-8.8-7.2-16-16-16zM224 416H128V288h96v128zm160 0H288V288h96v128z"/>
  } />
);

export const IconCrossedSwords: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
      <path d="M439.4 86.6c-24.8-24.8-65-24.8-89.8 0L174.4 261.8 123.8 235.2c-4.4-2.4-9.8-1.6-13.4 1.8l-15.6 15.6c-3.6 3.6-4.6 9-2.2 13.6l26.2 49.4-70.8 70.8-21.6 21.6c-12.2 12.2-12.2 32 0 44.2l39 39c12.2 12.2 32 12.2 44.2 0l21.6-21.6 70.8-70.8 49.4 26.2c4.6 2.4 10 1.4 13.6-2.2l15.6-15.6c3.4-3.6 4.2-9 1.8-13.4l-26.6-50.6 175.2-175.2c24.8-24.8 24.8-65 0-89.8zM140.2 423l-32-32 37.6-37.6 32 32L140.2 423z"/>
  } />
);

export const IconRefresh: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M440.6 51.4C409.4 20.2 367.6 1.8 322.8 0 234.6 0 162.8 71.8 162.8 160h-64c-17.6 0-32 14.4-32 32s14.4 32 32 32h128c17.6 0 32-14.4 32-32V64c0-17.6-14.4-32-32-32s-32 14.4-32 32v24.6C218 57.2 267.4 32 322.8 32c79.4 0 144 64.6 144 144s-64.6 144-144 144c-35.4 0-68.2-12.8-93.8-34.2-13.6-11.4-33.8-9.4-45.2 4.2-11.4 13.6-9.4 33.8 4.2 45.2C226.4 366.6 272.8 384 322.8 384c97 0 176-79 176-176 0-63.6-32.8-120.4-83.2-156.6z"/>
    } />
);

export const IconStats: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} path={
    <path d="M396.795 396.8H120c-13.3 0-24-10.7-24-24V120c0-13.3-10.7-24-24-24S48 106.7 48 120v252.8c0 39.7 32.3 72 72 72h276.8c13.3 0 24-10.7 24-24s-10.7-24.005-24.005-24zM164 340.8h48c6.6 0 12-5.4 12-12v-88c0-6.6-5.4-12-12-12h-48c-6.6 0-12 5.4-12 12v88c0 6.6 5.4 12 12 12zM256 340.8h48c6.6 0 12-5.4 12-12v-160c0-6.6-5.4-12-12-12h-48c-6.6 0-12 5.4-12 12v160c0 6.6 5.4 12 12 12zM348 340.8h48c6.6 0 12-5.4 12-12v-112c0-6.6-5.4-12-12-12h-48c-6.6 0-12 5.4-12 12v112c0 6.6 5.4 12 12 12z"/>
  } />
);

export const IconExchange: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M372.4 200H159.6c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h191.1l-34.8 34.8c-3.1 3.1-3.1 8.2 0 11.3l11.3 11.3c3.1 3.1 8.2 3.1 11.3 0l75.4-75.4c3.1-3.1 3.1-8.2 0-11.3l-75.4-75.4c-3.1-3.1-8.2-3.1-11.3 0l-11.3 11.3c-3.1 3.1-3.1 8.2 0 11.3l34.8 34.8h-10.3zm-232.8 88H352.4c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8H161.3l34.8-34.8c3.1-3.1 3.1-8.2 0-11.3l-11.3-11.3c-3.1-3.1-8.2-3.1-11.3 0L98.1 274c-3.1 3.1-3.1 8.2 0 11.3l75.4 75.4c3.1 3.1 8.2 3.1 11.3 0l11.3-11.3c3.1-3.1 3.1-8.2 0-11.3L161.3 303.8h-21.7z"/>
    } />
);

export const IconBank: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} path={
        <path d="M439.9 128.8c-3.3-3.3-8.6-3.3-11.9 0L380 176.7V88c0-13.3-10.7-24-24-24h-40c-13.3 0-24 10.7-24 24v88.7l-48.1-47.9c-3.3-3.3-8.6-3.3-11.9 0L216 144.8c-3.3 3.3-3.3 8.6 0 11.9L256 196.7v96h-96v-40c0-13.3-10.7-24-24-24H96c-13.3 0-24 10.7-24 24v40H32c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32V324.7c0-17.7-14.3-32-32-32h-40v-40c0-13.3-10.7-24-24-24h-40c-13.3 0-24 10.7-24 24v40h-96v-96l40 40c3.3 3.3 8.6 3.3 11.9 0l15.9-15.9c3.3-3.3 3.3-8.6 0-11.9L288 160.8V176c0 13.3 10.7 24 24 24h40c13.3 0 24-10.7 24-24V88l-48-48.1 111.9 111.9c3.3 3.3 3.3 8.6 0 11.9L439.9 128.8z"/>
    } />
);
