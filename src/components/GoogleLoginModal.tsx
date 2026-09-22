import React, { useState } from 'react';
import { X, Check, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const GoogleLoginModal: React.FC = () => {
  const { isGoogleModalOpen, closeGoogleModal, loginWithGoogle, customerUser, logoutCustomer } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isGoogleModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const targetEmail = email.trim() || 'user@gmail.com';
    if (!targetEmail.includes('@') || !targetEmail.toLowerCase().endsWith('gmail.com')) {
      if (!targetEmail.includes('@')) {
        setError('Please enter a valid Gmail address (e.g. example@gmail.com)');
        return;
      }
    }

    loginWithGoogle(targetEmail, name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#FCE7F0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden space-y-5">
        
        {/* Close button */}
        <button
          onClick={closeGoogleModal}
          className="absolute top-4 right-4 p-2 text-[#7A6B6E] hover:text-[#5C2533] rounded-full hover:bg-[#FFF9FA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          {/* Google G Logo SVG */}
          <div className="w-12 h-12 rounded-2xl border border-gray-100 bg-white shadow-xs flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-serif font-bold text-[#5C2533]">
            Sign in with Google
          </h3>
          <p className="text-xs text-[#7A6B6E]">
            Connect your Gmail account to manage orders & express checkout
          </p>
        </div>

        {customerUser ? (
          <div className="bg-[#FFF9FA] border border-[#FCE7F0] p-4 rounded-2xl text-center space-y-3">
            <div className="flex items-center gap-3 justify-center">
              <img
                src={customerUser.picture}
                alt={customerUser.name}
                className="w-10 h-10 rounded-full border border-[#B76E79]"
              />
              <div className="text-left">
                <p className="font-bold text-xs text-[#5C2533]">{customerUser.name}</p>
                <p className="text-[11px] text-[#7A6B6E]">{customerUser.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={closeGoogleModal}
                className="flex-1 py-2 bg-[#B76E79] text-white text-xs font-semibold rounded-full hover:bg-[#9E5762] transition-colors"
              >
                Continue
              </button>
              <button
                onClick={logoutCustomer}
                className="px-4 py-2 border border-[#FCE7F0] text-xs font-semibold text-[#5C2533] rounded-full hover:bg-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Customer Gmail Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C2533] mb-1">
                  Your Gmail Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#B76E79] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl text-xs focus:outline-none focus:border-[#B76E79] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C2533] mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl text-xs focus:outline-none focus:border-[#B76E79] focus:bg-white transition-all"
                />
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Gmail Account</span>
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-center gap-1 text-[11px] text-[#7A6B6E] pt-1 border-t border-[#FCE7F0]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
          <span>Secure Google OAuth Authentication</span>
        </div>

      </div>
    </div>
  );
};
