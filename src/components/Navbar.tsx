import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Heart, Sparkles, User, Package, Gift, Compass, LogOut, Lock, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { GoogleLoginModal } from './GoogleLoginModal';

interface NavbarProps {
  onOpenPwaModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPwaModal }) => {
  const { cart } = useCart();
  const { isAuthenticated, adminUser, customerUser, logoutCustomer, openGoogleModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Customise', path: '/customise' },
    { name: 'Occasions', path: '/occasions' },
    { name: 'Offers', path: '/offers' },
    { name: 'Book', path: '/book' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About Flora7', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'My Orders', path: '/my-orders' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9FA]/90 backdrop-blur-md border-b border-[#FCE7F0] shadow-xs transition-all">
      {/* Top Banner Message */}
      <div className="bg-[#FCE7F0] text-[#5C2533] text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#B76E79] animate-pulse" />
        <span>Handmade Satin Ribbon Roses • Local Bangalore Delivery & Studio Pickup</span>
        <span className="hidden sm:inline-block text-[#B76E79]">| Use Code: <strong>FLORA10</strong> for 5% OFF</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Signature */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-[#5C2533] hover:bg-[#FCE7F0]/60 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="group flex flex-col">
              <span className="text-2xl sm:text-3xl font-serif font-bold tracking-widest text-[#5C2533] group-hover:text-[#B76E79] transition-colors">
                FLORA7
              </span>
              <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-[#8C5263] uppercase font-light">
                <span>LOVE UNFOLDED</span>
                <span className="text-[#C5A059]">•</span>
                <span className="italic text-[#7A3245] font-serif">Crafted by Shwetha</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#5E5254]">
            {navLinks.slice(0, 7).map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors duration-200 relative py-1 ${
                    isActive
                      ? 'text-[#5C2533] font-semibold'
                      : 'hover:text-[#B76E79]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#B76E79] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search roses, bouquets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 sm:w-56 bg-white border border-[#F4B8C7] rounded-full py-1.5 pl-4 pr-9 text-xs text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2.5 text-[#8C5263] hover:text-[#5C2533]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full text-[#5C2533] hover:bg-[#FCE7F0]/60 transition-colors"
                  title="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Gmail / Google Login Option */}
            {customerUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 bg-[#FFF9FA] border border-[#FCE7F0] hover:border-[#B76E79] rounded-full transition-all text-xs"
                  title={`Logged in as ${customerUser.email}`}
                >
                  <img
                    src={customerUser.picture}
                    alt={customerUser.name}
                    className="w-6 h-6 rounded-full border border-[#B76E79]"
                  />
                  <span className="hidden md:inline font-medium text-[#5C2533] max-w-[90px] truncate pr-1">
                    {customerUser.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#FCE7F0] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-[#FCE7F0]">
                      <p className="text-xs font-bold text-[#5C2533]">{customerUser.name}</p>
                      <p className="text-[10px] text-[#7A6B6E] truncate">{customerUser.email}</p>
                    </div>
                    <Link
                      to="/my-orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#5C2533] hover:bg-[#FFF9FA] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#B76E79]" />
                      <span>My Orders</span>
                    </Link>
                    {isAuthenticated && adminUser?.role === 'OWNER' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#5C2533] bg-[#FDF2F5] hover:bg-[#FCE7F0] transition-colors border-t border-[#FCE7F0]"
                      >
                        <Sparkles className="w-4 h-4 text-[#B76E79]" />
                        <span>👑 Owner Portal</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logoutCustomer();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openGoogleModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#FCE7F0] hover:border-[#B76E79] text-[#5C2533] text-xs font-semibold rounded-full shadow-2xs hover:shadow-xs transition-all"
                title="Login with Google account"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}

            {/* Ask Gemini AI Concierge */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-flora-ai', { detail: { mode: 'chat' } }))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#FFF0F4] to-[#FCE7F0] border border-[#F4B8C7] hover:border-[#B76E79] text-[#5C2533] text-xs font-semibold rounded-full shadow-2xs hover:shadow-xs transition-all"
              title="Chat with Gemini AI Floral Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B76E79] animate-pulse" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Install Android APK / PWA Button */}
            {onOpenPwaModal && (
              <button
                onClick={onOpenPwaModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0F4] border border-[#F4B8C7] hover:border-[#B76E79] text-[#5C2533] text-xs font-semibold rounded-full shadow-2xs hover:shadow-xs transition-all"
                title="Install Android App / Download APK"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#B76E79]" />
                <span className="hidden xl:inline">Android APK</span>
              </button>
            )}

            {/* Shop Now Button */}
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#B76E79] text-white text-xs font-semibold rounded-full hover:bg-[#9E5762] shadow-xs hover:shadow-md transition-all uppercase tracking-wider"
            >
              <span>SHOP NOW</span>
            </Link>

            {/* My Orders */}
            <Link
              to="/my-orders"
              className="p-2 rounded-full text-[#5C2533] hover:bg-[#FCE7F0]/60 transition-colors hidden sm:block"
              title="Track My Orders"
            >
              <Package className="w-5 h-5" />
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2 rounded-full text-[#5C2533] hover:bg-[#FCE7F0]/60 transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#B76E79] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Owner Portal Link - ONLY visible when logged in as Owner */}
            {isAuthenticated && adminUser?.role === 'OWNER' && (
              <div className="flex items-center gap-1 bg-[#5C2533] text-white pl-3 pr-1.5 py-1 rounded-full shadow-xs text-[11px] font-semibold">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 hover:text-[#F4B8C7] transition-colors"
                  title="Open Flora7 Owner Dashboard"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F4B8C7]" />
                  <span>Owner Portal</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-1 text-[#F4B8C7] hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1 cursor-pointer"
                  title="Logout from Owner Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FFF9FA] border-b border-[#FCE7F0] px-4 pt-3 pb-6 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-[#FCE7F0] text-[#5C2533] font-semibold'
                    : 'text-[#5E5254] hover:bg-[#FFF2F5]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-[#FCE7F0] flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-flora-ai', { detail: { mode: 'chat' } }));
                }}
                className="w-full text-center py-2.5 bg-gradient-to-r from-[#5C2533] to-[#8C5263] text-white font-semibold rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFDFB9]" />
                <span>Ask Gemini AI Assistant</span>
              </button>
              <Link
                to="/customise"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-[#F4B8C7] text-[#5C2533] font-semibold rounded-full text-xs uppercase tracking-wider"
              >
                🌸 Create Your Own Bouquet
              </Link>
              {onOpenPwaModal && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPwaModal();
                  }}
                  className="w-full text-center py-2.5 bg-[#FFF0F4] border border-[#F4B8C7] text-[#5C2533] font-semibold rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-[#B76E79]" />
                  <span>Install Android App / APK</span>
                </button>
              )}
              {isAuthenticated && adminUser?.role === 'OWNER' && (
                <div className="flex items-center gap-2">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center text-xs text-white bg-[#5C2533] hover:bg-[#3D1822] py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F4B8C7]" />
                    <span>Owner Portal</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="p-2.5 text-[#5C2533] bg-[#FCE7F0] hover:bg-[#F4B8C7] rounded-xl transition-colors cursor-pointer"
                    title="Logout Owner"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <GoogleLoginModal />
    </header>
  );
};
