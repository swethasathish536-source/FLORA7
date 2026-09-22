import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Sparkles, Heart, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      title: product.name,
      image: product.images[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
      price: product.price,
      quantity: 1,
      customisationDetails: {
        colour: product.availableColours[0] || 'Blush Pink',
        wrapping: product.wrappingOptions[0] || 'Dusty Pink Matte',
        ribbon: product.ribbonColours[0] || 'Rose Gold Satin',
        pearl: product.hasPearlOption,
      }
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    handleQuickAddToCart(e);
    navigate('/checkout');
  };

  const colorHexMap: Record<string, string> = {
    'Blush Pink': '#F4B8C7',
    'Cream Ivory': '#FFFDD0',
    'Passion Red': '#C41E3A',
    'Lavender': '#E6E6FA',
    'Rose Gold': '#B76E79',
    'Champagne Gold': '#F7E7CE',
    'Sky Blue': '#87CEEB',
    'Deep Maroon': '#800020'
  };

  return (
    <div className="group bg-white rounded-3xl border border-[#FCE7F0] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Image & Badges */}
      <div className="relative aspect-4/3 sm:aspect-square overflow-hidden bg-[#FFF9FA]">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            category={product.category}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Discount Badge */}
        {product.discountPercent && product.discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#B76E79] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs tracking-wider uppercase">
            {product.discountPercent}% OFF
          </span>
        )}

        {/* Customisable Tag */}
        {product.isCustomisable && (
          <span className="absolute top-3 right-3 bg-[#FFF9FA]/90 backdrop-blur-xs text-[#5C2533] border border-[#FCE7F0] text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#B76E79]" />
            <span>Customisable</span>
          </span>
        )}

        {/* Stock Status Pill if Low/Out */}
        {product.stockStatus === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-[#5C2533] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Rating & Occasion Tag */}
          <div className="flex items-center justify-between text-xs text-[#8C5263] mb-1">
            <div className="flex items-center gap-1 font-medium text-[#5C2533]">
              <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[#8C5263] text-[11px]">({product.reviewCount})</span>
            </div>
            <span className="text-[10px] uppercase font-light tracking-wider bg-[#FFF9FA] px-2 py-0.5 rounded-full border border-[#FCE7F0]">
              {product.flowerType}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.id}`} className="block group-hover:text-[#B76E79] transition-colors">
            <h3 className="font-serif font-bold text-base text-[#5C2533] line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Price Tag */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-lg font-bold text-[#5C2533]">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#8C5263] line-through font-normal">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Available Colours Swatches */}
          {product.availableColours.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="text-[10px] text-[#8C5263]">Colours:</span>
              <div className="flex items-center gap-1">
                {product.availableColours.slice(0, 4).map((col, idx) => (
                  <span
                    key={idx}
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs"
                    style={{ backgroundColor: colorHexMap[col] || '#F4B8C7' }}
                    title={col}
                  />
                ))}
                {product.availableColours.length > 4 && (
                  <span className="text-[10px] text-[#8C5263] font-medium">
                    +{product.availableColours.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-[#FCE7F0] flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickAddToCart}
              disabled={product.stockStatus === 'OUT_OF_STOCK'}
              className="w-full py-2 bg-[#FFF9FA] hover:bg-[#FCE7F0] text-[#5C2533] border border-[#FCE7F0] font-semibold rounded-full text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#B76E79]" />
              <span>Add Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stockStatus === 'OUT_OF_STOCK'}
              className="w-full py-2 bg-[#B76E79] hover:bg-[#9E5762] text-white font-semibold rounded-full text-xs transition-all shadow-2xs uppercase tracking-wider disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          <Link
            to={`/customise?productId=${product.id}`}
            className="w-full py-1.5 text-center text-[11px] font-medium text-[#7A3245] hover:text-[#5C2533] hover:underline flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#B76E79]" />
            <span>Customise Colors & Message</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
