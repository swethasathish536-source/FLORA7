// Curated, ultra-high quality photos of handmade satin ribbon roses & bouquets
export const SATIN_BOUQUET_PRESETS = [
  {
    id: 'preset-7rose-skyblue',
    name: '7-Rose Sky Blue & Cream (Flora7 Signature)',
    category: 'premium-bouquet',
    url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=1000',
    tags: ['7 roses', 'sky blue', 'signature', 'pearls']
  },
  {
    id: 'preset-blush-pink-bouquet',
    name: 'Blush Pink Satin Rose Bouquet with Bow',
    category: 'premium-bouquet',
    url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=1000',
    tags: ['pink', 'blush', 'bouquet', 'ribbon']
  },
  {
    id: 'preset-5rose-delight',
    name: '5-Rose Pastel Elegance Bouquet',
    category: 'mini-bouquet',
    url: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=1000',
    tags: ['5 roses', 'pastel', 'mini bouquet']
  },
  {
    id: 'preset-single-satin-rose',
    name: 'Single Satin Rose Stem in Tissue Wrap',
    category: 'single-rose',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000',
    tags: ['single rose', 'stem', 'pink', 'minimal']
  },
  {
    id: 'preset-pearl-single-rose',
    name: 'Luxe Single Rose with Pearl & Warm Fairy Light',
    category: 'single-rose',
    url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=1000',
    tags: ['single rose', 'pearl', 'fairy light']
  },
  {
    id: 'preset-9rose-grand',
    name: '9-Rose Grand Royal Bouquet with Tiara/Luxe Wrap',
    category: 'premium-bouquet',
    url: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&q=80&w=1000',
    tags: ['9 roses', 'royal', 'grand', 'luxury']
  },
  {
    id: 'preset-rose-keychain',
    name: 'Handmade Velvet Pipe Cleaner / Mini Satin Keychain',
    category: 'keychain',
    url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=1000',
    tags: ['keychain', 'charm', 'mini']
  },
  {
    id: 'preset-gift-hamper',
    name: 'Handcrafted Satin Rose Gift Hamper Box',
    category: 'gift-set',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000',
    tags: ['gift set', 'box', 'hamper']
  },
  {
    id: 'preset-crimson-red',
    name: 'Passion Red Satin Rose Arrangement',
    category: 'festive',
    url: 'https://images.unsplash.com/photo-1548094878-84ced0f68c08?auto=format&fit=crop&q=80&w=1000',
    tags: ['red', 'romance', 'valentine']
  }
];

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=1000';

export function getCategoryFallback(category?: string, name?: string): string {
  const cat = (category || '').toLowerCase();
  const title = (name || '').toLowerCase();

  if (cat.includes('keychain') || title.includes('keychain')) {
    return 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=1000';
  }
  if (cat.includes('single') || title.includes('single')) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000';
  }
  if (cat.includes('mini') || title.includes('3 rose') || title.includes('5 rose')) {
    return 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=1000';
  }
  if (title.includes('7 rose') || title.includes('sky blue')) {
    return 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=1000';
  }
  if (cat.includes('gift') || title.includes('hamper')) {
    return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000';
  }
  return DEFAULT_FALLBACK_IMAGE;
}

export function getSafeImageUrl(src?: string | null, category?: string, name?: string): string {
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return getCategoryFallback(category, name);
  }
  return src.trim();
}

/**
 * Compresses an image file client-side using an offscreen canvas.
 * Returns a clean, lightweight data URL (< 200KB) ready for instant upload or storage.
 */
export async function compressImageFile(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
