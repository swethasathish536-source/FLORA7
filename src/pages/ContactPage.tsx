import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { InstagramScanner } from '../components/InstagramScanner';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">Get in Touch</span>
        <h1 className="text-3xl font-serif font-bold text-[#5C2533]">
          Contact Flora7 Studio
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6B6E]">
          Have a custom bouquet query or want to collaborate? Shwetha is always happy to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Contact info cards */}
        <div className="md:col-span-5 space-y-4">
          
          <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-3xl p-6 space-y-4 text-xs text-[#5C2533]">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#B76E79] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold font-serif text-sm">Flora7 Online Studio</p>
                <p className="text-[#7A6B6E] mt-0.5">Handcrafted in Bangalore • Delivered Pan-India</p>
                <p className="text-[11px] text-[#25D366] font-medium mt-1">Online Support Hours: 10:00 AM - 07:00 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-[#FCE7F0]">
              <Phone className="w-5 h-5 text-[#B76E79] shrink-0" />
              <div>
                <p className="font-bold">Phone / WhatsApp</p>
                <p className="text-[#7A6B6E]">+91 6360084897</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-[#FCE7F0]">
              <Mail className="w-5 h-5 text-[#B76E79] shrink-0" />
              <div>
                <p className="font-bold">Email</p>
                <p className="text-[#7A6B6E]">flora7loveunfolded@gmail.com</p>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/916360084897?text=Hi%20Flora7!%20I'd%20like%20to%20ask%20a%20question."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#25D366] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-sm hover:bg-[#20ba5a] transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>INSTANT WHATSAPP CHAT</span>
          </a>

          {/* Instagram Scanner Box */}
          <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">Follow Us On Instagram</h4>
            <InstagramScanner />
          </div>

        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white border border-[#FCE7F0] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="font-serif font-bold text-lg text-[#5C2533]">
            Send Shwetha a Message
          </h3>

          {sent ? (
            <div className="bg-[#FDF2F5] border border-[#F4B8C7] rounded-2xl p-6 text-center text-xs text-[#5C2533] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#25D366] mx-auto" />
              <p className="font-bold text-sm">Message Sent Successfully!</p>
              <p className="text-[#8C5263]">Thank you for reaching out to Flora7. We will respond within a few hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs text-[#5C2533]">
              <div>
                <label className="block font-bold mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya R."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 6360084897"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Message / Query *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your flower request, delivery date, or inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#B76E79] text-white font-bold rounded-full hover:bg-[#9E5762] transition-colors uppercase tracking-wider text-xs shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>SEND MESSAGE</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
