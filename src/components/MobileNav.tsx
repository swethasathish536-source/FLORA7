import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Sparkles, Calendar, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { cart } = useCart();
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const items = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Shop', icon: ShoppingBag, path: '/shop' },
    { label: 'Customise', icon: Sparkles, path: '/customise' },
    { label: 'Book', icon: Calendar, path: '/book' },
    { label: 'Orders', icon: Package, path: '/my-orders' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9FA]/95 backdrop-blur-md border-t border-[#FCE7F0] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all relative ${
                isActive ? 'text-[#B76E79] font-semibold' : 'text-[#8C5263] hover:text-[#5C2533]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                {item.label === 'Shop' && totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#B76E79] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
