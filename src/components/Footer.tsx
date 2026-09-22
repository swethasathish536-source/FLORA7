import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Instagram, MessageCircle, ShieldCheck, Sparkles, Download, Lock } from 'lucide-react';
import { InstagramScanner } from './InstagramScanner';

interface FooterProps {
  onOpenPwaModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPwaModal }) => {
  return (
    <footer className="bg-[#FAF5EE] border-t border-[#FCE7F0] text-[#5E5254] pt-14 pb-20 md:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-serif font-bold tracking-widest text-[#5C2533]">
                FLORA7
              </span>
              <p className="text-xs tracking-widest text-[#8C5263] uppercase mt-0.5">
                LOVE UNFOLDED
              </p>
            </Link>

            <p className="text-sm text-[#7A6B6E] leading-relaxed max-w-sm">
              Handmade satin ribbon roses and bespoke floral gifts, crafted with love to make your precious memories last forever.
            </p>

            <div className="p-3 bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#B76E79] shrink-0" />
              <p className="text-xs text-[#5C2533] font-medium">
                Signature Handmade Creations • <span className="italic font-serif font-semibold text-[#7A3245]">Crafted by Shwetha</span>
              </p>
            </div>

            {/* Social & WhatsApp Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/916360084897?text=Hi%20Flora7!%20I%20would%20like%20to%20enquire%20about%20custom%20handmade%20bouquets."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#25D366] text-white text-xs font-semibold rounded-full hover:bg-[#20ba5a] transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Enquiry</span>
              </a>

              <a
                href="https://www.instagram.com/_.flora7._/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#FFF9FA] border border-[#FCE7F0] text-[#E1306C] rounded-full hover:bg-[#FCE7F0] transition-colors"
                title="Follow @_.FLORA7._ on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              {onOpenPwaModal && (
                <button
                  onClick={onOpenPwaModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F4B8C7] text-[#5C2533] text-xs font-semibold rounded-full hover:bg-[#e88aa1] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-[#B76E79] transition-colors">Shop Flowers</Link></li>
              <li><Link to="/customise" className="hover:text-[#B76E79] transition-colors">Customise Bouquet</Link></li>
              <li><Link to="/occasions" className="hover:text-[#B76E79] transition-colors">Occasion Gifts</Link></li>
              <li><Link to="/offers" className="hover:text-[#B76E79] transition-colors">Special Offers</Link></li>
              <li><Link to="/book" className="hover:text-[#B76E79] transition-colors">Online & Offline Booking</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#B76E79] transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/my-orders" className="hover:text-[#B76E79] transition-colors">Track My Orders</Link></li>
              <li><Link to="/about" className="hover:text-[#B76E79] transition-colors">About Flora7</Link></li>
              <li><Link to="/contact" className="hover:text-[#B76E79] transition-colors">Contact Support</Link></li>
              <li><Link to="/legal?page=delivery" className="hover:text-[#B76E79] transition-colors">Delivery Information</Link></li>
              <li><Link to="/legal?page=cancellation" className="hover:text-[#B76E79] transition-colors">Cancellation & Returns</Link></li>
              <li><Link to="/legal?page=privacy" className="hover:text-[#B76E79] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal?page=terms" className="hover:text-[#B76E79] transition-colors">Terms & Conditions</Link></li>
              <li>
                <Link to="/admin/login" className="text-[#A0888F] hover:text-[#5C2533] transition-colors text-xs flex items-center gap-1 mt-2">
                  <Lock className="w-3 h-3" /> Store Owner Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">GET IN TOUCH</h4>
            <div className="space-y-2.5 text-xs text-[#7A6B6E]">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#B76E79] shrink-0 mt-0.5" />
                <span>Flora7 Online Handmade Studio • Bangalore, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B76E79] shrink-0" />
                <span>+91 6360084897</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B76E79] shrink-0" />
                <span>flora7loveunfolded@gmail.com</span>
              </div>
            </div>

            {/* Instagram QR Scanner */}
            <div className="pt-2">
              <InstagramScanner />
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-[#8C5263]">
                Accepted Payments: UPI, Credit/Debit Cards, Cash on Delivery, Studio Pickup.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="border-t border-[#FCE7F0] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C5263] gap-3">
          <p>© {new Date().getFullYear()} FLORA7 • LOVE UNFOLDED. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[#5C2533]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#B76E79] fill-current" />
            <span>by Shwetha</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
