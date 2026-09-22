import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Heart, ShieldCheck, Truck, RefreshCw, Award, Download, MessageCircle, Star } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { InstagramGallery } from '../components/InstagramGallery';
import { ReviewSection } from '../components/ReviewSection';
import { SafeImage } from '../components/SafeImage';
import { Product } from '../types';

interface HomeProps {
  onOpenPwaModal: () => void;
}

export function Home({ onOpenPwaModal }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const bestSellers = products.filter(p => p.isBestSeller);
  const newArrivals = products.filter(p => p.isNewArrival || p.category === 'keychain');
  const singleRoses = products.filter(p => p.category === 'single-rose');
  const miniBouquets = products.filter(p => p.category === 'mini-bouquet');
  const premiumBouquets = products.filter(p => p.category === 'premium-bouquet');
  const bouquet247 = products.find(p => p.id === 'prod-7-rose-bouquet' || p.price === 247);
  const heroBouquetImage = (bouquet247?.images && bouquet247.images[0]) || '/images/flora7-prod-1786682202966-kwoiv.jpeg';

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF9FA] via-[#FDF2F5] to-[#FFF9FA] py-16 sm:py-24 border-b border-[#FCE7F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#F4B8C7] text-[#5C2533] text-xs font-semibold shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#B76E79]" />
                <span>100% Handcrafted Satin Ribbon Roses</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#5C2533] tracking-wider uppercase">
                  FLORA7
                </h1>
                <p className="text-sm sm:text-base tracking-[0.25em] text-[#8C5263] uppercase font-light">
                  LOVE UNFOLDED
                </p>
                <p className="text-lg sm:text-xl text-[#7A3245] font-serif italic pt-1">
                  "Handmade flowers, crafted with love and made to last."
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#5E5254] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Welcome to Flora7 by Shwetha. We specialize in delicate handmade satin ribbon roses, everlasting bouquets, and bespoke floral gifts that never fade.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#B76E79] text-white text-xs font-bold rounded-full hover:bg-[#9E5762] transition-all shadow-md uppercase tracking-wider text-center flex items-center justify-center gap-2"
                >
                  <span>SHOP FLOWERS</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/customise"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#FFF9FA] border-2 border-[#F4B8C7] text-[#5C2533] text-xs font-bold rounded-full hover:bg-[#FCE7F0] transition-all text-center flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#B76E79]" />
                  <span>CUSTOMISE YOURS</span>
                </Link>
              </div>

              {/* Signature Subtext */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-2 text-xs text-[#8C5263]">
                <Heart className="w-4 h-4 text-[#B76E79] fill-current" />
                <span>Bespoke Handmade Artistry • <strong className="font-serif italic text-[#5C2533]">Crafted by Shwetha</strong></span>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white p-4 rounded-3xl border-2 border-[#FCE7F0] shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-gray-50">
                  <SafeImage
                    src={heroBouquetImage}
                    alt="Flora7 7-Rose Classic Satin Bouquet (₹247)"
                    category="premium-bouquet"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#B76E79] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Signature ₹247 Bouquet
                  </span>
                </div>
                <div className="mt-4 p-3 bg-[#FFF9FA] rounded-2xl border border-[#FCE7F0] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold font-serif text-[#5C2533] block">
                      {bouquet247?.name || '7 Rose Classic Satin Bouquet'}
                    </span>
                    <span className="text-[11px] text-[#8C5263]">
                      ₹{bouquet247?.price || 247} • Handmade to Order
                    </span>
                  </div>
                  <Link
                    to={`/product/${bouquet247?.id || 'prod-7-rose-bouquet'}`}
                    className="px-4 py-1.5 bg-[#B76E79] text-white font-bold rounded-full hover:bg-[#9E5762] transition-colors text-xs"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* GEMINI AI FLORAL CONCIERGE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#5C2533] via-[#7A3245] to-[#B76E79] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-[#FFDFB9] border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#FFDFB9]" />
              <span>Powered by Google Gemini AI</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Meet Flora, Your AI Floral & Gift Concierge
            </h3>
            <p className="text-xs sm:text-sm text-pink-100/90 leading-relaxed">
              Unsure which rose colors to choose, need gift ideas for a budget under ₹300, or want a poetic message for your gift card? Let Flora guide you in seconds.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-flora-ai', { detail: { mode: 'chat', prompt: 'Help me choose a flower gift for my loved one' } }))}
              className="px-5 py-2.5 bg-white text-[#5C2533] hover:bg-[#FFF0F4] text-xs font-bold rounded-full shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
              <span>Ask Gift Advice</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-flora-ai', { detail: { mode: 'card_writer' } }))}
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/40 text-white text-xs font-semibold rounded-full backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <span>💌 Write Card Note</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">Customer Favorites</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#5C2533] mt-0.5">
              Best Sellers
            </h2>
          </div>
          <Link to="/shop?sort=bestseller" className="text-xs font-bold text-[#B76E79] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 3. INTERACTIVE CUSTOM BOUQUET TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#FDF2F5] via-[#FFF9FA] to-[#FCE7F0] border-2 border-[#F4B8C7] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B76E79] bg-white px-3 py-1 rounded-full border border-[#FCE7F0]">
              Interactive Bouquet Studio
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#5C2533]">
              Design Your Custom Satin Bouquet
            </h2>
            <p className="text-xs sm:text-sm text-[#5E5254] leading-relaxed">
              Choose your ribbon colors, number of roses, center pearls, wrapping papers, bow style, and gift cards with instant price calculation!
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/customise"
              className="px-8 py-4 bg-[#B76E79] text-white font-bold rounded-full hover:bg-[#9E5762] transition-all shadow-md uppercase tracking-wider text-xs text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>BUILD YOUR BOUQUET</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SINGLE ROSES & MINI BOUQUETS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-[#FCE7F0] pb-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#5C2533]">
            Single Roses & Mini Bouquets
          </h2>
          <Link to="/shop?category=single-rose" className="text-xs text-[#B76E79] font-bold hover:underline">
            Explore All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...singleRoses, ...miniBouquets].slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE FLORA7 */}
      <section className="bg-[#FFF9FA] border-y border-[#FCE7F0] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">The Flora7 Difference</span>
            <h2 className="text-2xl font-serif font-bold text-[#5C2533]">
              Why Choose Flora7?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#FCE7F0] text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 bg-[#FDF2F5] text-[#B76E79] rounded-2xl flex items-center justify-center mx-auto text-xl">
                🌸
              </div>
              <h3 className="font-serif font-bold text-sm text-[#5C2533]">100% Handmade</h3>
              <p className="text-xs text-[#7A6B6E]">Every satin ribbon petal is carefully folded and assembled by hand with delicate detail.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#FCE7F0] text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 bg-[#FDF2F5] text-[#B76E79] rounded-2xl flex items-center justify-center mx-auto text-xl">
                ⏳
              </div>
              <h3 className="font-serif font-bold text-sm text-[#5C2533]">Never Fades</h3>
              <p className="text-xs text-[#7A6B6E]">Unlike real flowers that wilt in days, Flora7 satin roses remain everlasting keepsakes.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#FCE7F0] text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 bg-[#FDF2F5] text-[#B76E79] rounded-2xl flex items-center justify-center mx-auto text-xl">
                🎁
              </div>
              <h3 className="font-serif font-bold text-sm text-[#5C2533]">Custom Gift Cards</h3>
              <p className="text-xs text-[#7A6B6E]">Include custom initial tags, message cards, and LED fairy lights for extra magic.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#FCE7F0] text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 bg-[#FDF2F5] text-[#B76E79] rounded-2xl flex items-center justify-center mx-auto text-xl">
                🚚
              </div>
              <h3 className="font-serif font-bold text-sm text-[#5C2533]">Safe Packaging</h3>
              <p className="text-xs text-[#7A6B6E]">Packaged securely in sturdy floral boxes so your bouquet arrives in pristine shape.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REVIEWS & INSTAGRAM GALLERY */}
      <ReviewSection />
      <InstagramGallery />

      {/* 7. APP DOWNLOAD BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#5C2533] to-[#7A3245] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-lg text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#F4B8C7]">Mobile App</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold">
              TAKE FLORA7 WITH YOU 💗
            </h2>
            <p className="text-xs sm:text-sm text-[#FCE7F0]/90 leading-relaxed">
              Install the Flora7 App for faster ordering, easy booking, instant order tracking, and exclusive discount codes!
            </p>
          </div>

          <button
            onClick={onOpenPwaModal}
            className="px-8 py-4 bg-[#F4B8C7] text-[#5C2533] font-bold rounded-full hover:bg-white transition-all shadow-md uppercase tracking-wider text-xs shrink-0 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>INSTALL FLORA7 APP</span>
          </button>
        </div>
      </section>

    </div>
  );
};
