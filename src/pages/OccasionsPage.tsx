import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Sparkles, Gift } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

export const OccasionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const activeOccasion = searchParams.get('occasion') || 'Birthday';

  const occasionList = [
    { name: 'Birthday', icon: '🎂', desc: 'Bright, joyous satin rose bouquets for birthday celebrations.' },
    { name: 'Anniversary', icon: '💖', desc: 'Romantic red & blush rose arrangements symbolizing eternal love.' },
    { name: 'Friendship', icon: '🌸', desc: 'Sweet mini bouquets & keychain charms for dear friends.' },
    { name: 'Valentine\'s Day', icon: '🌹', desc: 'Signature 7 & 9 rose luxury bouquets with fairy lights.' },
    { name: 'Graduation', icon: '🎓', desc: 'Celebratory satin flower stems for new beginnings.' },
    { name: 'Wedding & Engagement', icon: '💍', desc: 'Bespoke bridal bouquet keepsakes made to last forever.' },
    { name: 'Mother\'s Day', icon: '💐', desc: 'Delicate pastel satin bouquets crafted with warmth.' },
    { name: 'Raksha Bandhan & Diwali', icon: '🪔', desc: 'Festive satin flower collections & gift boxes.' },
    { name: 'Teacher\'s Day', icon: '⭐', desc: 'Thoughtful single rose gifts & mini bouquet keepsakes.' },
  ];

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => 
    p.occasions.some(o => o.toLowerCase().includes(activeOccasion.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">Curated Collections</span>
        <h1 className="text-3xl font-serif font-bold text-[#5C2533]">
          Shop by Occasion
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6B6E]">
          Find the perfect handmade satin ribbon bouquet designed specifically for your special moments.
        </p>
      </div>

      {/* Occasion Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {occasionList.map((occ) => {
          const isActive = activeOccasion.toLowerCase() === occ.name.toLowerCase();
          return (
            <button
              key={occ.name}
              onClick={() => setSearchParams({ occasion: occ.name })}
              className={`p-4 rounded-3xl border text-center transition-all ${
                isActive
                  ? 'bg-[#B76E79] text-white border-[#B76E79] shadow-md scale-105'
                  : 'bg-[#FFF9FA] text-[#5C2533] border-[#FCE7F0] hover:bg-[#FCE7F0]'
              }`}
            >
              <span className="text-2xl block mb-1">{occ.icon}</span>
              <span className="text-xs font-serif font-bold block">{occ.name}</span>
            </button>
          );
        })}
      </div>

      {/* Filtered Occasion Products */}
      <div className="space-y-6 pt-4 border-t border-[#FCE7F0]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-[#5C2533] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B76E79]" />
            <span>Flowers for {activeOccasion}</span>
          </h2>
          <span className="text-xs text-[#8C5263]">{filteredProducts.length} items</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-3xl" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#FFF9FA] rounded-3xl border border-[#FCE7F0] p-10 text-center space-y-3">
            <p className="text-2xl">🌸</p>
            <h3 className="font-serif font-bold text-base text-[#5C2533]">Showing all Flora7 creations</h3>
            <p className="text-xs text-[#8C5263]">Browse our complete collection for custom occasion orders.</p>
            <Link to="/customise" className="inline-block px-5 py-2 bg-[#B76E79] text-white text-xs font-bold rounded-full">
              Customise for {activeOccasion}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
