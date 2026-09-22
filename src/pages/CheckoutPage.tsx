import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, MapPin, Calendar, Clock, CreditCard, Lock, ArrowLeft, CheckCircle2, User, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from '../components/SafeImage';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, discountAmount, deliveryFee, grandTotal, appliedCoupon, clearCart } = useCart();
  const { customerUser, openGoogleModal } = useAuth();

  // Form states
  const [isPickup, setIsPickup] = useState(false);
  const [customerName, setCustomerName] = useState(customerUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(customerUser?.email || '');

  useEffect(() => {
    if (customerUser) {
      if (!customerName) setCustomerName(customerUser.name);
      if (!customerEmail) setCustomerEmail(customerUser.email);
    }
  }, [customerUser]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('560001');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('10:00 AM - 01:00 PM');
  const [giftMessage, setGiftMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD' | 'CARD' | 'PAY_AT_PICKUP'>('UPI');

  // AI Card Generator in Checkout
  const [isAiCardOpen, setIsAiCardOpen] = useState(false);
  const [aiOccasion, setAiOccasion] = useState('Anniversary');
  const [aiTone, setAiTone] = useState('Heartfelt & Romantic');
  const [isGeneratingAiCard, setIsGeneratingAiCard] = useState(false);
  const [aiCardOptions, setAiCardOptions] = useState<string[]>([]);

  const handleGenerateAiMessage = async () => {
    setIsGeneratingAiCard(true);
    try {
      const res = await fetch('/api/gemini/card-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: customerName || 'My Special One',
          occasion: aiOccasion,
          tone: aiTone
        })
      });
      const data = await res.json();
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setAiCardOptions(data.messages);
      }
    } catch (err) {
      console.error('Failed to generate AI card message:', err);
    } finally {
      setIsGeneratingAiCard(false);
    }
  };

  const [loading, setLoading] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-3xl">🌸</p>
        <h2 className="text-2xl font-serif font-bold text-[#5C2533]">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-[#B76E79] text-white font-bold text-xs rounded-full"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || (!isPickup && !shippingAddress)) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      alert('Please enter a valid email address so we can send your order confirmation with product details.');
      return;
    }

    setLoading(true);

    const orderPayload = {
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim(),
      shippingAddress: isPickup ? 'Studio Pickup Koramangala 4th Block' : shippingAddress,
      landmark,
      pincode: isPickup ? '560034' : pincode,
      isPickup,
      pickupLocation: 'Flora7 Studio, Koramangala 4th Block, Bangalore - 560034',
      deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
      preferredSlot,
      items: cart,
      subtotal,
      discountAmount,
      deliveryFee: isPickup ? 0 : deliveryFee,
      totalAmount: isPickup ? grandTotal - deliveryFee : grandTotal,
      couponCode: appliedCoupon?.code,
      paymentMethod,
      paymentStatus: paymentMethod === 'UPI' || paymentMethod === 'CARD' ? 'PAID' : 'PENDING',
      orderStatus: 'RECEIVED',
      giftMessage,
      specialInstructions
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const newOrder = await res.json();

      if (res.ok) {
        clearCart();
        navigate(`/order-confirmation/${newOrder.id}`, { state: { order: newOrder } });
      } else {
        alert('Failed to place order. Please check inputs.');
      }
    } catch {
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[#FCE7F0] pb-4">
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-1.5 text-xs text-[#8C5263] hover:text-[#5C2533] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>
        <span className="text-xs font-bold text-[#5C2533] flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-[#25D366]" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </span>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Pickup vs Delivery Toggle */}
          <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-3xl p-4 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C2533] font-serif">
              Fulfillment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPickup(false)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  !isPickup
                    ? 'border-[#B76E79] bg-white text-[#5C2533] shadow-xs'
                    : 'border-[#FCE7F0] bg-[#FFF9FA] text-[#7A6B6E]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#B76E79]" />
                <span>Home Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPickup(true)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isPickup
                    ? 'border-[#B76E79] bg-white text-[#5C2533] shadow-xs'
                    : 'border-[#FCE7F0] bg-[#FFF9FA] text-[#7A6B6E]'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#B76E79]" />
                <span>Studio Pickup (Free)</span>
              </button>
            </div>
            {isPickup && (
              <p className="text-[11px] text-[#25D366] font-medium pt-1">
                📍 Pickup Address: Flora7 Studio, Koramangala 4th Block, Bangalore - 560034
              </p>
            )}
          </div>

          {/* Customer Details */}
          <div className="bg-white border border-[#FCE7F0] rounded-3xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-serif font-bold text-base text-[#5C2533]">
                1. Customer Information
              </h3>

              {!customerUser ? (
                <button
                  type="button"
                  onClick={openGoogleModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#FCE7F0] hover:border-[#B76E79] text-[#5C2533] text-xs font-semibold rounded-full shadow-2xs transition-all"
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
                  <span>Auto-fill with Gmail</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#25D366] font-medium bg-[#FFF9FA] px-3 py-1 rounded-full border border-[#FCE7F0]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Signed in as {customerUser.email}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#5C2533] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swetha S."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C2533] mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 6360084897"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#5C2533] mb-1">
                  Email Address <span className="text-[#B76E79] font-normal">* (for Order Confirmation & Detailed Product Info)</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address (If Delivery) */}
          {!isPickup && (
            <div className="bg-white border border-[#FCE7F0] rounded-3xl p-6 space-y-4 shadow-2xs">
              <h3 className="font-serif font-bold text-base text-[#5C2533]">
                2. Delivery Address
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#5C2533] mb-1">Flat / House No., Building, Street *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Complete address details..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#5C2533] mb-1">Landmark (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Sony Signal"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#5C2533] mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 560034"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Date & Gift Message */}
          <div className="bg-white border border-[#FCE7F0] rounded-3xl p-6 space-y-4 shadow-2xs">
            <h3 className="font-serif font-bold text-base text-[#5C2533]">
              3. Delivery Date & Gift Customisation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#5C2533] mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none text-[#5C2533]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C2533] mb-1">Time Slot</label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none text-[#5C2533]"
                >
                  <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM</option>
                  <option value="01:00 PM - 05:00 PM">01:00 PM - 05:00 PM</option>
                  <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-[#5C2533]">
                    Gift Card Message <span className="text-[#B76E79] font-normal">(Included Free)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAiCardOpen(!isAiCardOpen)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FFF0F4] to-[#FCE7F0] border border-[#F4B8C7] hover:border-[#B76E79] text-[#5C2533] text-[11px] font-semibold transition-all shadow-2xs hover:shadow-xs"
                  >
                    <Sparkles className="w-3 h-3 text-[#B76E79]" />
                    <span>{isAiCardOpen ? 'Close AI Writer' : '✨ Write with Gemini AI'}</span>
                  </button>
                </div>

                {isAiCardOpen && (
                  <div className="bg-[#FFF9FA] border border-[#F4B8C7] rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#5C2533] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
                        Gemini AI Card Generator
                      </span>
                      <span className="text-[10px] text-[#8C5263]">Pick tone & tap generate</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#7A6B6E] mb-0.5">Occasion</label>
                        <select
                          value={aiOccasion}
                          onChange={(e) => setAiOccasion(e.target.value)}
                          className="w-full bg-white border border-[#FCE7F0] rounded-xl p-2 text-xs text-[#5C2533] focus:outline-none"
                        >
                          <option value="Anniversary">Anniversary</option>
                          <option value="Birthday">Birthday</option>
                          <option value="Valentine's Day">Valentine's Day</option>
                          <option value="Romantic Love">Romantic Love</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Friendship">Friendship</option>
                          <option value="Apology">Apology</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-[#7A6B6E] mb-0.5">Tone</label>
                        <select
                          value={aiTone}
                          onChange={(e) => setAiTone(e.target.value)}
                          className="w-full bg-white border border-[#FCE7F0] rounded-xl p-2 text-xs text-[#5C2533] focus:outline-none"
                        >
                          <option value="Heartfelt & Romantic">Romantic</option>
                          <option value="Poetic & Deep">Poetic</option>
                          <option value="Sweet & Simple">Sweet & Simple</option>
                          <option value="Playful & Cheerful">Playful</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAiMessage}
                      disabled={isGeneratingAiCard}
                      className="w-full py-2 bg-[#B76E79] hover:bg-[#9E5762] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                    >
                      {isGeneratingAiCard ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Heartfelt Notes...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#FFDFB9]" />
                          <span>Generate 3 Card Messages with Gemini</span>
                        </>
                      )}
                    </button>

                    {aiCardOptions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold text-[#5C2533]">Click to autofill into your card:</p>
                        {aiCardOptions.map((opt, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setGiftMessage(opt);
                              setIsAiCardOpen(false);
                            }}
                            className="bg-white border border-[#FCE7F0] hover:border-[#B76E79] rounded-xl p-2 text-[11px] italic text-[#5C2533] cursor-pointer hover:bg-[#FFF0F4] transition-all"
                          >
                            "{opt}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="e.g. 'Happy Birthday My Love! Eternal flowers for an eternal bond.'"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-[#FCE7F0] rounded-3xl p-6 space-y-4 shadow-2xs">
            <h3 className="font-serif font-bold text-base text-[#5C2533]">
              4. Payment Method
            </h3>

            <div className="space-y-2 text-xs">
              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'UPI' ? 'border-[#B76E79] bg-[#FFF9FA] ring-1 ring-[#B76E79]' : 'border-[#FCE7F0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="accent-[#B76E79]"
                  />
                  <div>
                    <span className="font-bold text-[#5C2533] block">Instant UPI / QR / Google Pay / PhonePe</span>
                    <span className="text-[11px] text-[#8C5263]">Pay securely with any UPI App</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#25D366]">Fastest</span>
              </label>

              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'COD' ? 'border-[#B76E79] bg-[#FFF9FA] ring-1 ring-[#B76E79]' : 'border-[#FCE7F0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-[#B76E79]"
                  />
                  <div>
                    <span className="font-bold text-[#5C2533] block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-[#8C5263]">Pay cash when your bouquet arrives</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Order Review Box */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-[#FFF9FA] border-2 border-[#FCE7F0] rounded-3xl p-6 space-y-4 shadow-sm">
            
            <h3 className="font-serif font-bold text-base text-[#5C2533] border-b border-[#FCE7F0] pb-3">
              Order Review
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs gap-3 border-b border-[#FCE7F0]/60 pb-2">
                  <div className="flex items-center gap-2.5">
                    <SafeImage src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded-xl shrink-0" />
                    <div>
                      <p className="font-bold text-[#5C2533] line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-[#8C5263]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#5C2533]">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 text-xs text-[#5E5254] border-t border-[#FCE7F0] pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#25D366]">
                  <span>Discount ({appliedCoupon?.code}):</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{isPickup ? 'FREE (Pickup)' : (deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`)}</span>
              </div>
              <div className="border-t border-[#FCE7F0] pt-2 flex justify-between text-lg font-bold text-[#5C2533] font-serif">
                <span>Total Payable:</span>
                <span>₹{isPickup ? grandTotal - deliveryFee : grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#B76E79] text-white font-bold rounded-full hover:bg-[#9E5762] transition-colors uppercase tracking-wider text-xs shadow-md"
            >
              {loading ? 'Processing Order...' : 'PLACE ORDER NOW'}
            </button>

            <p className="text-[10px] text-[#8C5263] text-center italic">
              ✨ Every flower is crafted by Shwetha and packed in high-density protective gift boxes.
            </p>

          </div>
        </div>

      </form>

    </div>
  );
};
