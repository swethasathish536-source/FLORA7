import React from 'react';
import { Instagram } from 'lucide-react';

interface InstagramScannerProps {
  className?: string;
}

export const InstagramScanner: React.FC<InstagramScannerProps> = ({ className = '' }) => {
  const handle = "@_.FLORA7._";
  const instaUrl = "https://www.instagram.com/_.flora7._/";

  return (
    <a
      href={instaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block bg-white border border-[#FCE7F0] p-4 rounded-3xl shadow-sm hover:shadow-md hover:border-[#B76E79] transition-all duration-300 max-w-[210px] text-center ${className}`}
      title="Scan or click to open Instagram @_.FLORA7._"
    >
      {/* Scanner Card Container */}
      <div className="bg-white rounded-2xl border-2 border-black p-3.5 relative overflow-hidden flex flex-col justify-between aspect-square group-hover:scale-[1.02] transition-transform">
        
        {/* Top row alignment blocks */}
        <div className="flex justify-between items-center w-full z-10">
          <div className="w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center bg-white">
            <div className="w-2.5 h-2.5 rounded-sm bg-black"></div>
          </div>
          <div className="w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center bg-white">
            <div className="w-2.5 h-2.5 rounded-sm bg-black"></div>
          </div>
        </div>

        {/* Center matrix with Instagram logo */}
        <div className="relative my-auto flex items-center justify-center py-1">
          {/* Detailed QR Matrix Representation */}
          <svg className="w-full h-full max-h-24 text-black" viewBox="0 0 100 100" fill="currentColor">
            {/* Dots Grid Pattern */}
            <circle cx="35" cy="15" r="2.5" />
            <circle cx="45" cy="15" r="2.5" />
            <circle cx="55" cy="15" r="2.5" />
            <circle cx="65" cy="15" r="2.5" />

            <circle cx="15" cy="35" r="2.5" />
            <circle cx="25" cy="35" r="2.5" />
            <circle cx="35" cy="35" r="2.5" />
            <circle cx="65" cy="35" r="2.5" />
            <circle cx="75" cy="35" r="2.5" />
            <circle cx="85" cy="35" r="2.5" />

            <circle cx="15" cy="45" r="2.5" />
            <circle cx="25" cy="45" r="2.5" />
            <circle cx="75" cy="45" r="2.5" />
            <circle cx="85" cy="45" r="2.5" />

            <circle cx="15" cy="55" r="2.5" />
            <circle cx="25" cy="55" r="2.5" />
            <circle cx="75" cy="55" r="2.5" />
            <circle cx="85" cy="55" r="2.5" />

            <circle cx="15" cy="65" r="2.5" />
            <circle cx="25" cy="65" r="2.5" />
            <circle cx="35" cy="65" r="2.5" />
            <circle cx="65" cy="65" r="2.5" />
            <circle cx="75" cy="65" r="2.5" />
            <circle cx="85" cy="65" r="2.5" />

            <circle cx="35" cy="85" r="2.5" />
            <circle cx="45" cy="85" r="2.5" />
            <circle cx="55" cy="85" r="2.5" />
            <circle cx="65" cy="85" r="2.5" />

            {/* Extra surrounding dots for realistic look */}
            <circle cx="35" cy="25" r="2" />
            <circle cx="65" cy="25" r="2" />
            <circle cx="25" cy="75" r="2" />
            <circle cx="75" cy="75" r="2" />
            <circle cx="45" cy="75" r="2" />
            <circle cx="55" cy="75" r="2" />
          </svg>

          {/* Center Instagram Camera Icon */}
          <div className="absolute inset-0 m-auto w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-xs">
            <Instagram className="w-5 h-5 text-black" />
          </div>
        </div>

        {/* Bottom row alignment block */}
        <div className="flex justify-between items-center w-full z-10">
          <div className="w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center bg-white">
            <div className="w-2.5 h-2.5 rounded-sm bg-black"></div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-black mr-1"></div>
        </div>
      </div>

      {/* ID Name below scanner */}
      <div className="mt-2.5">
        <p className="font-mono text-xs sm:text-sm font-black tracking-tight text-black group-hover:text-[#E1306C] transition-colors">
          {handle}
        </p>
        <p className="text-[10px] text-[#7A6B6E] font-medium flex items-center justify-center gap-1 mt-0.5">
          <Instagram className="w-3 h-3 text-[#E1306C]" />
          <span>Follow on Instagram</span>
        </p>
      </div>
    </a>
  );
};
