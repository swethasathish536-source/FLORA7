import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Info, Upload, ShoppingBag, MessageCircle, Heart, Eye, AlertCircle } from 'lucide-react';
import { CustomBouquetMaterialOptions, CustomBouquetSelection } from '../types';
import { useCart } from '../context/CartContext';

export const CustomBouquetBuilder: React.FC = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [options, setOptions] = useState<CustomBouquetMaterialOptions | null>(null);
  const [loading, setLoading] = useState(true);

  // Form selections
  const [flowerType, setFlowerType] = useState('satin-rose');
  const [flowerCount, setFlowerCount] = useState<number>(7);
  const [selectedColours, setSelectedColours] = useState<string[]>(['Blush Pink', 'Cream Ivory']);
  const [centrePearl, setCentrePearl] = useState(true);
  const [wrappingColour, setWrappingColour] = useState('Dusty Pink Matte Sheet');
  const [ribbonColour, setRibbonColour] = useState('Rose Gold Satin Ribbon');
  const [bouquetSize, setBouquetSize] = useState('classic');
  const [bowStyle, setBowStyle] = useState('classic-double');
  const [messageCardText, setMessageCardText] = useState('');
  const [giftTagName, setGiftTagName] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(['centre-pearls', 'led-fairy-lights']);
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/custom-options')
      .then(res => res.json())
      .then(data => {
        setOptions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !options) {
    return (
      <div className="p-12 text-center text-[#5C2533]">
        <div className="w-10 h-10 border-4 border-[#B76E79] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-serif">Loading Flora7 Custom Bouquet Studio...</p>
      </div>
    );
  }

  // Calculate dynamic price
  const selectedTypeObj = options.flowerTypes.find(f => f.id === flowerType);
  const typePricePerFlower = selectedTypeObj ? selectedTypeObj.pricePerFlower : 25;

  const sizeObj = options.bouquetSizes.find(s => s.id === bouquetSize);
  const baseSizePrice = sizeObj ? sizeObj.basePrice : 200;

  const bowObj = options.bowStyles.find(b => b.id === bowStyle);
  const bowPrice = bowObj ? bowObj.price : 0;

  const addOnsTotal = selectedAddOns.reduce((sum, addOnId) => {
    const item = options.addOns.find(a => a.id === addOnId);
    return sum + (item ? item.price : 0);
  }, 0);

  const calculatedTotalPrice = baseSizePrice + (flowerCount * typePricePerFlower) + bowPrice + addOnsTotal;

  const toggleColour = (colourName: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    if (selectedColours.includes(colourName)) {
      if (selectedColours.length > 1) {
        setSelectedColours(selectedColours.filter(c => c !== colourName));
      }
    } else {
      if (selectedColours.length < 3) {
        setSelectedColours([...selectedColours, colourName]);
      } else {
        alert('You can select up to 3 flower colours for a multi-tone bouquet.');
      }
    }
  };

  const toggleAddOn = (addOnId: string) => {
    if (selectedAddOns.includes(addOnId)) {
      setSelectedAddOns(selectedAddOns.filter(a => a !== addOnId));
    } else {
      setSelectedAddOns([...selectedAddOns, addOnId]);
    }
  };

  const handleAddToCart = () => {
    const selection: CustomBouquetSelection = {
      flowerType: selectedTypeObj?.name || 'Handmade Satin Ribbon Rose',
      numberOfFlowers: flowerCount,
      flowerColours: selectedColours,
      centrePearl,
      wrappingColour,
      ribbonColour,
      bouquetSize: sizeObj?.name || 'Classic Elegance',
      bowStyle: bowObj?.name || 'Classic Double Loop',
      messageCardText,
      giftTagName,
      additionalDecorations: selectedAddOns.map(id => options.addOns.find(a => a.id === id)?.name || id),
      referenceImageUrl,
      specialInstructions
    };

    addToCart({
      productId: 'custom-bouquet-bespoke',
      title: `Custom ${flowerCount} Rose Satin Bouquet`,
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800',
      price: calculatedTotalPrice,
      quantity: 1,
      isCustomBouquet: true,
      customisationDetails: selection
    });

    navigate('/cart');
  };

  const handleWhatsAppQuote = () => {
    const text = `Hi Flora7! I created my custom bouquet on website:\n- Flower Type: ${selectedTypeObj?.name}\n- Flower Count: ${flowerCount}\n- Colours: ${selectedColours.join(', ')}\n- Wrapping: ${wrappingColour}\n- Ribbon: ${ribbonColour}\n- Total Price: ₹${calculatedTotalPrice}\n- Message: ${messageCardText || 'None'}\nCan you confirm availability?`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 sm:p-8 shadow-sm">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79] bg-[#FCE7F0] px-3 py-1 rounded-full">
          Bespoke Floral Studio
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#5C2533]">
          Create Your Own Bouquet
        </h2>
        <p className="text-xs sm:text-sm text-[#7A6B6E]">
          Handpick your ribbon colours, flower count, wrapping sheets & accessories. Crafted with love by Shwetha.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Step-by-Step Customisation Controls */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Step 1: Flower Type */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">
              1. Choose Flower Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.flowerTypes.map((ft) => (
                <button
                  key={ft.id}
                  type="button"
                  disabled={!ft.isAvailable}
                  onClick={() => setFlowerType(ft.id)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    flowerType === ft.id
                      ? 'border-[#B76E79] bg-[#FFF9FA] shadow-2xs ring-1 ring-[#B76E79]'
                      : 'border-[#FCE7F0] hover:border-[#F4B8C7] bg-white'
                  } ${!ft.isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#5C2533]">{ft.name}</span>
                    {flowerType === ft.id && <Check className="w-4 h-4 text-[#B76E79]" />}
                  </div>
                  <span className="text-[11px] text-[#8C5263] block mt-1">₹{ft.pricePerFlower} per stem</span>
                  {!ft.isAvailable && (
                    <span className="text-[10px] text-red-500 block mt-1 font-medium">Currently unavailable</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Number of Flowers & Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">
                2. Number of Flowers: <span className="text-[#B76E79] font-bold">{flowerCount} Roses</span>
              </label>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[3, 5, 7, 9, 12, 15, 21, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFlowerCount(num)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                    flowerCount === num
                      ? 'bg-[#B76E79] text-white shadow-xs scale-105'
                      : 'bg-[#FFF9FA] text-[#5C2533] border border-[#FCE7F0] hover:bg-[#FCE7F0]'
                  }`}
                >
                  {num} Roses
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Flower Colours */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">
              3. Flower Colours (Select up to 3 for mix)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {options.flowerColours.map((col) => {
                const isSelected = selectedColours.includes(col.name);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleColour(col.name, col.isAvailable)}
                    disabled={!col.isAvailable}
                    className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                      isSelected
                        ? 'border-[#B76E79] bg-[#FFF9FA] ring-1 ring-[#B76E79]'
                        : 'border-[#FCE7F0] bg-white hover:border-[#F4B8C7]'
                    } ${!col.isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs shrink-0 flex items-center justify-center text-white"
                      style={{ backgroundColor: col.hex }}
                    >
                      {isSelected && <Check className="w-3 h-3 drop-shadow-xs" />}
                    </span>
                    <div className="overflow-hidden">
                      <span className="text-xs font-medium text-[#5C2533] block truncate">{col.name}</span>
                      {!col.isAvailable && (
                        <span className="text-[9px] text-red-500 block">Unavailable</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Wrapping Sheet Colour */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">
              4. Wrapping Sheet
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.wrappingColours.map((wrap) => (
                <button
                  key={wrap.id}
                  type="button"
                  disabled={!wrap.isAvailable}
                  onClick={() => setWrappingColour(wrap.name)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    wrappingColour === wrap.name
                      ? 'border-[#B76E79] bg-[#FFF9FA] ring-1 ring-[#B76E79]'
                      : 'border-[#FCE7F0] bg-white hover:border-[#F4B8C7]'
                  } ${!wrap.isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                >
                  <span className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: wrap.hex }} />
                  <span className="text-xs font-medium text-[#5C2533]">{wrap.name}</span>
                  {!wrap.isAvailable && <span className="text-[10px] text-red-500 ml-auto">Unavailable</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5: Ribbon & Bow Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">
                5. Ribbon Colour
              </label>
              <select
                value={ribbonColour}
                onChange={(e) => setRibbonColour(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs text-[#5C2533] focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
              >
                {options.ribbonColours.map(r => (
                  <option key={r.id} value={r.name} disabled={!r.isAvailable}>
                    {r.name} {!r.isAvailable ? '(Unavailable)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">
                6. Bow Style
              </label>
              <select
                value={bowStyle}
                onChange={(e) => setBowStyle(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs text-[#5C2533] focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
              >
                {options.bowStyles.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} (+₹{b.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 6: Add-ons & Embellishments */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">
              7. Add-ons & Accessories
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.addOns.map((addon) => {
                const isSelected = selectedAddOns.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddOn(addon.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#B76E79] bg-[#FFF9FA] ring-1 ring-[#B76E79]'
                        : 'border-[#FCE7F0] bg-white hover:border-[#F4B8C7]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#5C2533] block">{addon.name}</span>
                      <span className="text-[11px] text-[#8C5263]">+₹{addon.price}</span>
                    </div>
                    {isSelected ? <Check className="w-4 h-4 text-[#B76E79]" /> : <span className="text-xs text-[#8C5263]">+ Add</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 7: Personal Message & Tag */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">
                8. Gift Card & Special Instructions
              </label>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-flora-ai', { detail: { mode: 'card_writer' } }))}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FFF0F4] to-[#FCE7F0] border border-[#F4B8C7] hover:border-[#B76E79] text-[#5C2533] text-[11px] font-semibold transition-all shadow-2xs hover:shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-[#B76E79]" />
                <span>✨ Write with Gemini AI</span>
              </button>
            </div>
            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Message Card Text (e.g. 'Happy Birthday Love!')"
                value={messageCardText}
                onChange={(e) => setMessageCardText(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Gift Tag Name / Initial (e.g., 'For Shwetha')"
                  value={giftTagName}
                  onChange={(e) => setGiftTagName(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                />
                <input
                  type="text"
                  placeholder="Reference Image URL (optional)"
                  value={referenceImageUrl}
                  onChange={(e) => setReferenceImageUrl(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Live Order Summary & Visual Canvas Box */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-[#FFF9FA] border-2 border-[#FCE7F0] rounded-3xl p-6 space-y-5 shadow-sm">
            
            <div className="flex items-center justify-between border-b border-[#FCE7F0] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#5C2533] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B76E79]" />
                Live Bouquet Summary
              </h3>
              <span className="text-xs bg-[#FCE7F0] text-[#5C2533] font-semibold px-2.5 py-1 rounded-full">
                Custom Build
              </span>
            </div>

            {/* Visual Preview Graphic */}
            <div className="bg-white border border-[#FCE7F0] rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#FDF2F5] border-2 border-[#F4B8C7] flex items-center justify-center text-4xl shadow-inner relative">
                🌸
                <span className="absolute -bottom-1 -right-1 bg-[#B76E79] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {flowerCount}
                </span>
              </div>
              <div>
                <p className="font-serif font-bold text-base text-[#5C2533]">
                  {flowerCount} Rose Satin Bouquet
                </p>
                <p className="text-xs text-[#8C5263] mt-0.5">
                  Colours: {selectedColours.join(' + ')}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs text-[#5E5254] border-t border-[#FCE7F0] pt-4">
              <div className="flex justify-between">
                <span>Base Arrangement ({flowerCount} stems):</span>
                <span className="font-medium">₹{baseSizePrice + (flowerCount * typePricePerFlower)}</span>
              </div>
              <div className="flex justify-between">
                <span>Wrapping & Ribbon:</span>
                <span className="font-medium">Included</span>
              </div>
              {bowPrice > 0 && (
                <div className="flex justify-between">
                  <span>Special Bow Style:</span>
                  <span className="font-medium">+₹{bowPrice}</span>
                </div>
              )}
              {addOnsTotal > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons ({selectedAddOns.length}):</span>
                  <span className="font-medium">+₹{addOnsTotal}</span>
                </div>
              )}

              <div className="border-t border-[#FCE7F0] pt-3 flex items-baseline justify-between text-base">
                <span className="font-bold text-[#5C2533] font-serif">Total Calculated Price:</span>
                <span className="text-2xl font-bold text-[#5C2533]">₹{calculatedTotalPrice}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-[#B76E79] text-white font-bold rounded-full hover:bg-[#9E5762] transition-all shadow-md uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD CUSTOM BOUQUET TO CART</span>
              </button>

              <button
                onClick={handleWhatsAppQuote}
                className="w-full py-2.5 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#20ba5a] transition-all text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>REQUEST CUSTOM QUOTE ON WHATSAPP</span>
              </button>
            </div>

            <p className="text-[11px] text-[#8C5263] text-center italic">
              ✨ Every bouquet is carefully hand-folded by Shwetha. Preparation takes 1-2 business days.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};
