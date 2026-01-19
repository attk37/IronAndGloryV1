import { GoogleGenAI } from "@google/genai";
import { Player } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateOracleWisdom = async (player: Player): Promise<string> => {
  try {
    const prompt = `
      Sen karanlık bir fantezi RPG oyununda "Eski Dünyanın Kahini"sin.
      Oyuncu, "${player.name}" adında bir şövalye (Seviye ${player.level}), sana yaklaşıyor.
      İstatistikleri: Güç ${player.stats.strength}, Kabiliyet ${player.stats.skill}.
      
      Ona TÜRKÇE, gizemli, atmosferik ve kısa (maksimum 2 cümle) bir kehanet veya tavsiye ver.
      Orta çağ falcısı gibi veya karanlık bir alamet gibi konuş.
      Selamlama yapma. Sadece kehaneti söyle.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Sisler bugün çok yoğun... Hiçbir şey göremiyorum.";
  } catch (error) {
    console.error("Kahin hatası:", error);
    return "Ruhlar sessiz kaldı. Eterle olan bağını kontrol et.";
  }
};

export const generateBattleReport = async (player: Player, enemyName: string, won: boolean): Promise<string> => {
   try {
    const prompt = `
      ${player.name} ile bir ${enemyName} arasındaki savaşın TÜRKÇE, çok kısa (1 cümle) ve dramatik bir özetini yaz.
      Sonuç: Oyuncu ${won ? "KAZANDI" : "KAYBETTİ"}.
      Stil: Karanlık fantezi, sert, epik.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || (won ? "Zafer kan ve çelikle kazanıldı." : "Yenilgi ağızda acı bir tat bıraktı.");
  } catch (error) {
    return won ? "Düşman kudretin karşısında düştü." : "Geri çekilmek zorunda kaldın.";
  }
}