import React, { useState } from 'react';
import { Player } from '../types';
import { generateOracleWisdom } from '../services/geminiService';
import { IconEye } from './Icons';
import { Sparkles, Loader2 } from 'lucide-react';

interface OracleViewProps {
  player: Player;
}

export const OracleView: React.FC<OracleViewProps> = ({ player }) => {
  const [wisdom, setWisdom] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cost] = useState(50); // Gold cost to consult oracle

  const consultOracle = async () => {
    if (player.silver < cost) return;
    
    setLoading(true);
    setWisdom(null);
    
    try {
      const text = await generateOracleWisdom(player);
      setWisdom(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-700 text-center max-w-2xl mx-auto">
      <div className="mb-6 p-6 rounded-full bg-purple-950/30 border-2 border-purple-500/50 shadow-[0_0_60px_rgba(147,51,234,0.3)] backdrop-blur-sm">
        <IconEye size={64} className="text-purple-400 animate-pulse" />
      </div>
      
      <h2 className="text-4xl rpg-font text-purple-200 mb-4 drop-shadow-lg">Görü Kahini</h2>
      <p className="text-stone-400 mb-8 text-lg font-serif">
        Boşluğa bak, Şövalye. Ruhlar sana yol gösterebilir...
      </p>

      {wisdom && (
        <div className="bg-stone-900/90 border-y-2 border-purple-900/50 p-8 rounded-xl mb-10 relative shadow-2xl max-w-xl">
           <Sparkles className="absolute -top-3 -left-3 text-purple-400" size={24} />
           <p className="text-2xl font-serif text-purple-100 italic leading-relaxed tracking-wide">
             "{wisdom}"
           </p>
           <Sparkles className="absolute -bottom-3 -right-3 text-purple-400" size={24} />
        </div>
      )}

      <button
        onClick={consultOracle}
        disabled={loading}
        className="group relative px-10 py-4 bg-stone-900 overflow-hidden rounded-lg border border-purple-800 text-purple-300 font-bold hover:text-white transition-all hover:border-purple-500 shadow-lg hover:shadow-purple-900/40"
      >
        <div className="absolute inset-0 w-0 bg-purple-900 transition-all duration-[400ms] ease-out group-hover:w-full opacity-40" />
        <span className="relative flex items-center gap-3 text-lg font-serif tracking-widest">
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {loading ? 'Ruhlarla Konuşuluyor...' : 'Kahine Danış'}
        </span>
      </button>
    </div>
  );
};