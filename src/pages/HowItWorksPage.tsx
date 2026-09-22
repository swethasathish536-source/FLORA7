import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Gift, Truck, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Hand-Selection of Premium Satin Ribbons',
      desc: 'Shwetha personally inspects and sources high-density silk-touch satin ribbons in delicate blush, rose gold, cream, and crimson tones.'
    },
    {
      step: '02',
      title: 'Intricate Petal Folding & Assembly',
      desc: 'Each petal is cut, hand-curled, and heat-sealed to form realistic layered rose buds that never fray or lose shape.'
    },
    {
      step: '03',
      title: 'Pearl Center & Embellishments',
      desc: 'Optionally fitted with faux pearl cores, golden metallic butterflies, warm LED fairy lights, and custom initials.'
    },
    {
      step: '04',
      title: 'Luxury Korean Matte Wrapping',
      desc: 'Wrapped in waterproof matte sheets, finished with double-loop satin bows, and packaged in rigid protective floral gift boxes.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">The Handcraft Journey</span>
        <h1 className="text-3xl font-serif font-bold text-[#5C2533]">
          How Flora7 Roses Are Crafted
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6B6E]">
          Discover the care, time, and artistic folding technique behind every single satin rose creation.
        </p>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((st) => (
          <div key={st.step} className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-3xl p-6 space-y-3 shadow-2xs">
            <span className="text-2xl font-serif font-bold text-[#B76E79]">{st.step}</span>
            <h3 className="text-lg font-serif font-bold text-[#5C2533]">{st.title}</h3>
            <p className="text-xs text-[#5E5254] leading-relaxed">{st.desc}</p>
          </div>
        ))}
      </div>

      {/* Care & Maintenance */}
      <div className="bg-gradient-to-r from-[#FDF2F5] via-[#FFF9FA] to-[#FCE7F0] border-2 border-[#F4B8C7] rounded-3xl p-8 space-y-4">
        <h3 className="font-serif font-bold text-xl text-[#5C2533] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#B76E79]" />
          <span>How to Care for Your Flora7 Satin Bouquet</span>
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5C2533]">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>Keep away from direct prolonged harsh sunlight to maintain original ribbon sheen.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>Dust gently with a soft dry makeup brush or micro-feather duster.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>No water or moisture required! Flora7 satin roses last indefinitely.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>Keep on nightstands, vanity tables, or display cabinets as permanent decor.</span>
          </li>
        </ul>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/shop"
          className="inline-block px-8 py-3.5 bg-[#B76E79] text-white font-bold text-xs rounded-full hover:bg-[#9E5762] uppercase tracking-wider"
        >
          EXPLORE HANDMADE FLOWERS NOW
        </Link>
      </div>

    </div>
  );
};
