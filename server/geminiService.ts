import { GoogleGenAI } from '@google/genai';
import { db } from './db';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export function isGeminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// Generate system prompt with live product and studio information
function buildStudioSystemInstruction(): string {
  const products = db.getProducts() || [];
  const productList = products.map(p => 
    `- ${p.name} (ID: ${p.id}): ₹${p.price}${p.originalPrice ? ` (Discounted from ₹${p.originalPrice})` : ''} - Category: ${p.category}. Colors: ${(p.availableColours || []).join(', ')}. Details: ${p.shortDescription || p.description}`
  ).join('\n');

  return `You are "Flora", the warm, charming, and artistic AI Floral Concierge for "Flora7 - Love Unfolded".
Flora7 is a boutique floral studio based in Bangalore, India, founded and curated by artisan Shwetha.

🌸 BRAND & CRAFT ESSENCE & ORIGIN:
- A dream that began in childhood, now unfolding into something real: Flora7 was started by Shwetha with a simple childhood dream — to build something of her own and one day become an entrepreneur. ✨
- What began as an idea slowly turned into little handmade flowers, thoughtful creations, and finally, Flora7.
- Every satin rose, bouquet, and customised creation is handmade with patience, creativity, and love. For Shwetha, Flora7 isn't just about flowers — it is about creating something from nothing, learning along the way, and watching a dream bloom. 🌸
- Motto & Mantra: "FLORA7 • Love Unfolded 🤍 — Started with a dream. Made by hand. Growing with love 🎀"
- Studio specialty: 100% handcrafted luxury satin ribbon roses, eternal bouquets, and floral keychains that never wilt or die.
- Embellishments: gleaming faux pearl centers in every blossom, double-layer Korean floral frosted wrapping with gold borders, fairy lights (LED), and luxury satin ribbon bows.
- Pickup & Delivery: Local Bangalore delivery & studio pickup available in 1 to 5 business days.

🛍️ CURRENT LIVE FLORA7 CATALOG & PRICING:
${productList}

Special Discount Code: "FLORA10" for 5% off!
Custom Bouquet Builder is available at the "/customise" page where customers can choose rose count, colors, wrapping paper, ribbon style, and fairy lights.

🎨 ROSE COLOR SYMBOLISM & MEANINGS:
- Red: Passion, romance, enduring commitment, deep affection.
- Sky Blue / Royal Blue: Unconditional loyalty, rare love, peace, wonder, and miracles.
- Blush Pink: Gratitude, gentleness, grace, unconditional sweetness, maternal love.
- Cream / Ivory: Purity, elegance, innocence, grace, and harmonious new beginnings.
- Lavender / Purple: Enchantment, love at first sight, royal charm, and creative spirit.
- Champagne / Gold: Celebration, prosperity, milestones, anniversaries, and warmth.

💡 YOUR GOALS AS FLORA:
1. Provide warm, polite, and enthusiastic guidance to customers seeking gifts for loved ones (girlfriends, boyfriends, wives, husbands, parents, friends, teachers, colleagues).
2. Recommend the best Flora7 product or custom bouquet based on the occasion, recipient, and budget in Indian Rupees (₹).
3. If asked to write greeting card messages or poems, generate touching, heartfelt, and memorable lines that can be hand-written on our complimentary gift cards.
4. If a customer wants to customize flowers, guide them to our Customizer (/customise) or suggest custom color palettes like "Sky Blue & Cream Ivory" or "Blush Pink & Gold".
5. Keep answers concise, delightful, elegant, and easy to read with tasteful emojis (🌸, ✨, 🌹, 🎀, 💖). Do not write overly long essays unless requested.`;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export async function chatWithFloraAssistant(params: {
  messages: ChatMessage[];
  message: string;
}): Promise<{ reply: string; suggestedActions?: Array<{ label: string; action: string; path?: string }> }> {
  const ai = getGeminiClient();

  // Convert history into contents format
  const contents = params.messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }]
  }));

  // Append user's latest query
  contents.push({
    role: 'user',
    parts: [{ text: params.message }]
  });

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: buildStudioSystemInstruction(),
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });
  } catch (primaryErr) {
    console.warn('Primary model failed, trying fallback:', primaryErr);
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: buildStudioSystemInstruction(),
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      });
    } catch (secondaryErr) {
      console.warn('Both primary and secondary models failed:', secondaryErr);
      const lower = params.message.toLowerCase();
      let fallbackText = "Hello! 🌸 Flora7 is a boutique floral studio based in Bangalore, founded by Shwetha. We specialize in 100% handmade luxury satin ribbon roses that never fade, complete with pearl centers and Korean frosted wrap!";
      if (lower.includes('story') || lower.includes('about') || lower.includes('shwetha') || lower.includes('start')) {
        fallbackText = "A dream that began in childhood, now unfolding into something real. ✨\n\nFlora7 was started by Shwetha with a simple childhood dream — to build something of her own and one day become an entrepreneur.\n\nWhat began as an idea slowly turned into little handmade flowers, thoughtful creations, and finally, Flora7.\n\nEvery satin rose, bouquet, and customised creation is handmade with patience, creativity, and love. For Shwetha, Flora7 isn't just about flowers — it is about creating something from nothing, learning along the way, and watching a dream bloom! 🌸\n\nFLORA7 • Love Unfolded 🤍\nStarted with a dream. Made by hand. Growing with love 🎀";
      } else if (lower.includes('price') || lower.includes('blue') || lower.includes('cost')) {
        fallbackText = "Our signature 7 Classic Blue Colour Roses Bouquet is currently available for just ₹247! We also offer Single Satin Roses from ₹57, and custom bespoke bouquets. You can use code FLORA10 for an extra 5% off! 💙";
      }
      return {
        reply: fallbackText,
        suggestedActions: [
          { label: '🌷 Read About Flora7', action: 'navigate', path: '/about' },
          { label: '🛍️ Browse Bouquets', action: 'navigate', path: '/shop' }
        ]
      };
    }
  }

  const reply = response.text || "I'm here to help you select the most beautiful handcrafted satin roses! Could you tell me about the occasion or recipient?";

  // Generate contextual action suggestions
  const suggestedActions: Array<{ label: string; action: string; path?: string }> = [];
  const lowerMsg = (params.message + ' ' + reply).toLowerCase();

  if (lowerMsg.includes('custom') || lowerMsg.includes('customise') || lowerMsg.includes('builder')) {
    suggestedActions.push({ label: '🎨 Open Bouquet Customizer', action: 'navigate', path: '/customise' });
  }
  if (lowerMsg.includes('shop') || lowerMsg.includes('price') || lowerMsg.includes('catalog') || lowerMsg.includes('under ₹')) {
    suggestedActions.push({ label: '🛍️ Browse All Bouquets', action: 'navigate', path: '/shop' });
  }
  if (lowerMsg.includes('blue') || lowerMsg.includes('7 rose') || lowerMsg.includes('247')) {
    suggestedActions.push({ label: '💙 View 7 Blue Roses (₹247)', action: 'navigate', path: '/product/prod-1789662520611' });
  }
  if (lowerMsg.includes('single rose') || lowerMsg.includes('57') || lowerMsg.includes('77')) {
    suggestedActions.push({ label: '🌹 Single Satin Rose (₹57)', action: 'navigate', path: '/product/prod-single-rose' });
  }

  return { reply, suggestedActions };
}

export async function generateCardMessages(params: {
  recipient?: string;
  occasion?: string;
  tone?: string;
  details?: string;
}): Promise<string[]> {
  const ai = getGeminiClient();

  const prompt = `Write 3 distinct, beautiful greeting card messages for a handwritten gift card accompanied by handcrafted satin ribbon roses from Flora7.
  
Recipient: ${params.recipient || 'A beloved person'}
Occasion: ${params.occasion || 'Special Day'}
Tone: ${params.tone || 'Heartfelt and Romantic'}
Extra Notes: ${params.details || 'None'}

Rules:
1. Each message must be between 15 and 45 words (compact enough to fit on an elegant gift card).
2. Satin roses never wilt or fade, so you can subtly tie in the metaphor of eternal love/friendship.
3. Return ONLY a valid JSON array of 3 strings. Example:
["Message 1 text here", "Message 2 text here", "Message 3 text here"]
No markdown wrapping, no explanation, only the JSON array.`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: 'application/json'
      }
    });
  } catch (primaryErr) {
    console.warn('Primary model failed for card messages, trying fallback:', primaryErr);
    response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: 'application/json'
      }
    });
  }

  try {
    const raw = response.text || '[]';
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3);
    }
  } catch (err) {
    console.error('Failed to parse card messages json:', err);
  }

  // Fallbacks
  return [
    `Like these handcrafted satin roses that never fade, my love and appreciation for you will always remain vibrant and true. Happy ${params.occasion || 'Special Day'}!`,
    `To someone truly irreplaceable: may your day be as graceful and beautiful as every folded petal of this rose. With all my love!`,
    `A timeless bloom for a timeless bond. Thank you for filling every moment with joy and grace. Forever grateful for you!`
  ];
}
