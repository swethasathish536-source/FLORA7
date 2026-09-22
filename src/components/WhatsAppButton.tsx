import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/916360084897?text=Hi%20Flora7!%20I%20have%20an%20enquiry%20about%20your%20handmade%20satin%20roses."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-5 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
      title="Chat with Flora7 on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
        Chat with Shwetha
      </span>
    </a>
  );
};
