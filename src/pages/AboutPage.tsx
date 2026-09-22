import React from 'react';
import { Heart, Sparkles, ArrowRight, MessageCircle, Flower2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      
      {/* Brand Story Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#FFF0F4] border border-[#F4B8C7] px-4 py-1.5 rounded-full text-xs font-semibold text-[#8C5263] uppercase tracking-widest">
          <span>🌷 Our Origin Story</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#5C2533] tracking-wide">
          About Flora7
        </h1>
        <p className="text-base sm:text-lg text-[#7A3245] font-serif italic max-w-xl mx-auto">
          "A dream that began in childhood, now unfolding into something real."
        </p>
      </div>

      {/* Main Story Content Card */}
      <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-3xl p-6 sm:p-12 space-y-8 text-sm sm:text-base text-[#5E5254] leading-relaxed shadow-xs relative overflow-hidden">
        
        {/* Soft Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FCE7F0]/60 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <p className="text-base sm:text-lg text-[#2D2727] leading-relaxed font-light">
            <strong className="font-serif font-bold text-[#5C2533]">Flora7</strong> was started by{' '}
            <strong className="font-serif font-semibold text-[#7A3245]">Shwetha</strong> with a simple childhood dream — to build something of her own and one day become an entrepreneur. ✨
          </p>

          <p className="leading-relaxed">
            What began as an idea slowly turned into little handmade flowers, thoughtful creations, and finally, <span className="font-serif font-semibold text-[#5C2533]">Flora7</span>.
          </p>

          {/* Featured Highlight Block */}
          <div className="p-6 sm:p-8 bg-white border border-[#F4B8C7] rounded-2xl space-y-3 text-center my-6 shadow-2xs">
            <Sparkles className="w-6 h-6 text-[#B76E79] mx-auto animate-pulse" />
            <p className="font-serif font-medium text-base sm:text-lg text-[#5C2533] leading-relaxed italic">
              "Every satin rose, bouquet, and customised creation is handmade with patience, creativity, and love. For Shwetha, Flora7 isn't just about flowers — it is about creating something from nothing, learning along the way, and watching a dream bloom." 🌸
            </p>
          </div>

          <p className="text-base text-[#5C2533] font-serif italic text-center sm:text-left">
            From a childhood dream to a handmade beginning — this is only the first petal of the journey.
          </p>
        </div>

        {/* Signature Mantra Keepsake Card */}
        <div className="relative z-10 pt-6 border-t border-[#FCE7F0]">
          <div className="bg-gradient-to-br from-white via-[#FFF0F4] to-white border-2 border-[#F4B8C7] rounded-2xl p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-2xl tracking-widest text-[#5C2533] uppercase">
                FLORA7
              </h2>
              <p className="text-xs sm:text-sm tracking-[0.25em] text-[#8C5263] uppercase font-serif font-semibold flex items-center justify-center gap-1">
                <span>Love Unfolded</span>
                <span>🤍</span>
              </p>
            </div>

            <div className="w-16 h-px bg-[#F4B8C7] mx-auto" />

            <div className="space-y-1 text-xs sm:text-sm text-[#5C2533] font-serif font-medium leading-relaxed">
              <p>Started with a dream.</p>
              <p>Made by hand.</p>
              <p className="text-[#B76E79] font-semibold flex items-center justify-center gap-1">
                <span>Growing with love</span>
                <span>🎀</span>
              </p>
            </div>

            <p className="text-[11px] text-[#A09395] tracking-wide pt-1">
              Bangalore, India • 100% Handcrafted Eternal Keepsakes
            </p>
          </div>
        </div>

        {/* Interactive Action Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-7 py-3 bg-[#B76E79] hover:bg-[#9E5762] text-white text-xs font-bold rounded-full transition-all shadow-sm text-center flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <span>Explore Handcrafted Bouquets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/customise"
            className="w-full sm:w-auto px-7 py-3 bg-white border border-[#F4B8C7] hover:bg-[#FFF0F4] text-[#5C2533] text-xs font-bold rounded-full transition-all text-center flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#B76E79]" />
            <span>Design Custom Bouquet</span>
          </Link>

          <a
            href="https://wa.me/916360084897?text=Hi%20Shwetha!%20I%20just%20read%20the%20Flora7%20story%20and%20would%20love%20to%20order%20a%20bouquet."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-full transition-all text-center flex items-center justify-center gap-2 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with Shwetha</span>
          </a>
        </div>

      </div>

    </div>
  );
};
