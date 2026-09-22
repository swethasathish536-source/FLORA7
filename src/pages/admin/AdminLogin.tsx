import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, KeyRound, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizeUsername = (val: string): string => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed === 'flora7' || trimmed === 'flora7loveunfolded' || trimmed === 'admin') {
      return 'flora7loveunfolded@gmail.com';
    }
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = normalizeUsername(email);
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Please enter both login ID and password.');
      return;
    }

    setLoading(true);
    const result = await login(cleanUser, cleanPass);
    if (result.success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Invalid login ID or password. Access is restricted to authorized store owner.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-[#F4B8C7] p-8 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#FDF2F5] border border-[#F4B8C7] rounded-full flex items-center justify-center mx-auto text-[#B76E79] shadow-2xs">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B76E79] bg-[#FFF0F4] px-3 py-1 rounded-full border border-[#FCE7F0]">
            Flora7 Portal
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#5C2533]">
            Owner Login
          </h1>
          <p className="text-xs text-[#8C5263] leading-relaxed max-w-xs mx-auto">
            Authorized management portal for store inventory, orders, analytics, and business operations.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#5C2533]">
          <div>
            <label className="block font-bold mb-1.5 text-[#5C2533]">Owner Login ID</label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                placeholder="Enter owner login ID"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3.5 pl-10 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 text-xs text-[#5C2533] placeholder:text-[#B0A4A6]"
              />
              <Mail className="w-4 h-4 text-[#8C5263] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-[#5C2533]">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#B76E79] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                autoComplete="current-password"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3.5 pl-10 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 text-xs text-[#5C2533] placeholder:text-[#B0A4A6]"
              />
              <KeyRound className="w-4 h-4 text-[#8C5263] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#5C2533] text-white font-bold rounded-full hover:bg-[#3D1822] transition-colors uppercase tracking-wider text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#F4B8C7]" />
                <span>Log In to Owner Portal</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[#FCE7F0]">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#8C5263] hover:text-[#5C2533] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Flora7 Store</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
