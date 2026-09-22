import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingBag, Sparkles, Heart, Check, Truck, Clock, ShieldCheck, MessageCircle, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ReviewSection } from '../components/ReviewSection';
import { SafeImage } from '../components/SafeImage';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // Customisation selections
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [selectedWrapping, setSelectedWrapping] = useState<string>('');
  const [selectedRibbon, setSelectedRibbon] = useState<string>('');
  const [hasPearl, setHasPearl] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [cardMessage, setCardMessage] = useState<string>('');
  const [giftTag, setGiftTag] = useState<string>('');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.images && data.images.length > 0) setSelectedImage(data.images[0]);
        if (data.availableColours && data.availableColours.length > 0) setSelectedColour(data.availableColours[0]);
        if (data.wrappingOptions && data.wrappingOptions.length > 0) setSelectedWrapping(data.wrappingOptions[0]);
        if (data.ribbonColours && data.ribbonColours.length > 0) setSelectedRibbon(data.ribbonColours[0]);
        setHasPearl(data.hasPearlOption);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-[#5C2533]">
        <div className="w-8 h-8 border-4 border-[#B76E79] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="font-serif text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-3xl">🌸</p>
        <h2 className="text-xl font-serif font-bold text-[#5C2533]">Product Not Found</h2>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-[#B76E79] text-white font-bold text-xs rounded-full">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.name,
      image: selectedImage || product.images[0],
      price: product.price,
      quantity,
      customisationDetails: {
        colour: selectedColour,
        wrapping: selectedWrapping,
        ribbon: selectedRibbon,
        pearl: hasPearl,
        cardMessage,
        giftTag
      }
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const text = `Hi Flora7! I would like to order:
- Product: ${product.name}
- Price: ₹${product.price}
- Quantity: ${quantity}
- Colour: ${selectedColour}
- Wrapping: ${selectedWrapping}
- Ribbon: ${selectedRibbon}
- Pearl Accent: ${hasPearl ? 'Yes' : 'No'}
- Card Message: ${cardMessage || 'None'}
Please guide me with booking!`;

    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Back link */}
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs text-[#8C5263] hover:text-[#5C2533] font-medium">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Flowers</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Gallery Images */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-[#FFF9FA] rounded-3xl overflow-hidden border border-[#FCE7F0] shadow-sm relative">
            <SafeImage
              src={selectedImage || product.images[0]}
              alt={product.name}
              category={product.category}
              className="w-full h-full object-cover"
            />
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-[#B76E79] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img ? 'border-[#B76E79] scale-105' : 'border-[#FCE7F0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`${product.name} Thumbnail ${idx + 1}`}
                    category={product.category}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Options & Specs */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#8C5263]">
              <div className="flex items-center gap-1 text-[#5C2533] font-bold">
                <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span>{product.reviewCount} Reviews</span>
              <span>•</span>
              <span className="text-[#25D366] font-semibold">{product.preparationTime}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5C2533]">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#5C2533]">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-[#8C5263] line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-xs text-[#8C5263]">(Taxes included)</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#5E5254] leading-relaxed">
            {product.description}
          </p>

          {/* Customisation Options */}
          <div className="space-y-4 pt-2 border-t border-[#FCE7F0]">
            
            {/* Flower Colour */}
            {product.availableColours.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5C2533] uppercase tracking-wider font-serif">
                  Select Flower Colour: <span className="text-[#B76E79]">{selectedColour}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.availableColours.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColour(col)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedColour === col
                          ? 'border-[#B76E79] bg-[#FFF9FA] text-[#5C2533] font-semibold'
                          : 'border-[#FCE7F0] bg-white text-[#7A6B6E]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wrapping Sheet */}
            {product.wrappingOptions.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5C2533] uppercase tracking-wider font-serif">
                  Select Wrapping Paper:
                </label>
                <select
                  value={selectedWrapping}
                  onChange={(e) => setSelectedWrapping(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl p-2.5 text-xs text-[#5C2533] focus:outline-none"
                >
                  {product.wrappingOptions.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Ribbon Colour */}
            {product.ribbonColours.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5C2533] uppercase tracking-wider font-serif">
                  Ribbon Colour:
                </label>
                <select
                  value={selectedRibbon}
                  onChange={(e) => setSelectedRibbon(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl p-2.5 text-xs text-[#5C2533] focus:outline-none"
                >
                  {product.ribbonColours.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Pearl Core Toggle */}
            {product.hasPearlOption && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pearl-toggle"
                  checked={hasPearl}
                  onChange={(e) => setHasPearl(e.target.checked)}
                  className="w-4 h-4 accent-[#B76E79] rounded"
                />
                <label htmlFor="pearl-toggle" className="text-xs text-[#5C2533] font-medium cursor-pointer">
                  Include Faux Pearl Core in Rose Center ✨
                </label>
              </div>
            )}

            {/* Message Card */}
            <div className="space-y-2 pt-2">
              <input
                type="text"
                placeholder="Gift Message Card Text (optional)"
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl p-2.5 text-xs focus:outline-none"
              />
              <input
                type="text"
                placeholder="Gift Tag Name / Initial (e.g. 'For Mom')"
                value={giftTag}
                onChange={(e) => setGiftTag(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl p-2.5 text-xs focus:outline-none"
              />
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-[#5C2533] uppercase tracking-wider font-serif">Quantity:</span>
              <div className="flex items-center border border-[#FCE7F0] rounded-full bg-[#FFF9FA]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-xs font-bold text-[#5C2533] hover:bg-[#FCE7F0] rounded-l-full"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-[#5C2533]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-xs font-bold text-[#5C2533] hover:bg-[#FCE7F0] rounded-r-full"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-4 border-t border-[#FCE7F0]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-[#FFF9FA] hover:bg-[#FCE7F0] text-[#5C2533] border border-[#FCE7F0] font-bold rounded-full text-xs transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <ShoppingBag className="w-4 h-4 text-[#B76E79]" />
                <span>ADD TO CART</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-3 bg-[#B76E79] hover:bg-[#9E5762] text-white font-bold rounded-full text-xs transition-all shadow-md uppercase tracking-wider"
              >
                BUY NOW
              </button>
            </div>

            <button
              onClick={handleWhatsAppOrder}
              className="w-full py-2.5 bg-[#25D366] text-white font-semibold rounded-full text-xs transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>ORDER THROUGH WHATSAPP</span>
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#FCE7F0] text-[11px] text-[#7A6B6E]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B76E79]" />
              <span>Safe Delivery Packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B76E79]" />
              <span>Crafted by Shwetha</span>
            </div>
          </div>

        </div>

      </div>

      {/* Reviews */}
      <ReviewSection productId={product.id} />

    </div>
  );
};
