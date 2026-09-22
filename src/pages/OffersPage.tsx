import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, Tag, Gift, Zap } from 'lucide-react';
import { Coupon, OfferBanner } from '../types';

export const OffersPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [offers, setOffers] = useState<OfferBanner[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/coupons').then(res => res.json()).then(data => setCoupons(data));
    fetch('/api/offers').then(res => res.json()).then(data => setOffers(data));
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">Exclusive Savings</span>
        <h1 className="text-3xl font-serif font-bold text-[#5C2533]">
          Flora7 Special Offers & Coupons
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6B6E]">
          Apply these special discount codes at checkout to enjoy handmade luxury satin flowers at exclusive prices.
        </p>
      </div>

      {/* Offer Banners */}
      {offers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((off) => (
            <div
              key={off.id}
              className="bg-gradient-to-r from-[#FDF2F5] via-[#FFF9FA] to-[#FCE7F0] border-2 border-[#F4B8C7] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-[#B76E79] px-3 py-1 rounded-full">
                  {off.badgeText}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#5C2533]">{off.title}</h3>
                <p className="text-xs text-[#5E5254]">{off.subtitle}</p>
              </div>

              <a
                href={off.ctaLink}
                className="inline-block self-start px-6 py-2.5 bg-[#5C2533] text-white text-xs font-bold rounded-full hover:bg-[#3D1822] transition-colors uppercase tracking-wider"
              >
                {off.ctaText}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Coupon Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-bold text-[#5C2533] flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#B76E79]" />
          <span>Active Promo Codes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coupons.filter(c => c.active).map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border-2 border-dashed border-[#F4B8C7] p-6 space-y-4 shadow-xs relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-mono text-[#5C2533] bg-[#FCE7F0] px-3 py-1 rounded-xl">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-[#25D366] font-bold uppercase bg-[#E8F8EE] px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>

                <p className="text-xs font-bold text-[#B76E79] pt-1">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                </p>

                <p className="text-xs text-[#5E5254] leading-snug">
                  {c.description}
                </p>
                <p className="text-[10px] text-[#8C5263]">
                  Min Order: ₹{c.minOrderValue} • Valid till Dec 2026
                </p>
              </div>

              <button
                onClick={() => handleCopyCode(c.code)}
                className="w-full py-2 bg-[#FFF9FA] hover:bg-[#FCE7F0] text-[#5C2533] border border-[#FCE7F0] font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-1.5"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#25D366]" />
                    <span className="text-[#25D366]">COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#B76E79]" />
                    <span>COPY CODE</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
