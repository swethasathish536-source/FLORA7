import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Truck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { customerUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');

  // Form States for Online Booking
  const [productName, setProductName] = useState('7 Rose Classic Satin Bouquet');
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [customerName, setCustomerName] = useState(customerUser?.name || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(customerUser?.email || '');

  useEffect(() => {
    if (customerUser) {
      if (!customerName) setCustomerName(customerUser.name);
      if (!email) setEmail(customerUser.email);
    }
  }, [customerUser]);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('560001');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD' | 'PAY_AT_PICKUP'>('UPI');

  // Offline Booking form states
  const [offlineProduct, setOfflineProduct] = useState('');
  const [offlineQuantity, setOfflineQuantity] = useState(1);
  const [offlineCustomDetails, setOfflineCustomDetails] = useState('');
  const [offlineDate, setOfflineDate] = useState('');
  const [offlineSubmitted, setOfflineSubmitted] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const handleOnlineBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !bookingDate) {
      alert('Please fill in your name, phone number, and preferred date.');
      return;
    }

    setLoading(true);

    const basePrice = 247;
    const subtotal = basePrice * quantity;
    const deliveryFee = deliveryType === 'PICKUP' ? 0 : 40;
    const totalAmount = subtotal + deliveryFee;

    const orderPayload = {
      customerName,
      customerPhone: phone,
      customerEmail: email || '',
      shippingAddress: deliveryType === 'DELIVERY' ? address : 'Studio Pickup Koramangala 4th Block',
      landmark,
      pincode: deliveryType === 'DELIVERY' ? pincode : '560034',
      isPickup: deliveryType === 'PICKUP',
      pickupLocation: 'Flora7 Studio, Koramangala 4th Block, Bangalore',
      deliveryDate: bookingDate,
      preferredSlot: timeSlot,
      items: [
        {
          id: `book-item-${Date.now()}`,
          productId: 'prod-7-rose-bouquet',
          title: productName,
          image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800',
          price: basePrice,
          quantity
        }
      ],
      subtotal,
      discountAmount: 0,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'UPI' ? 'PAID' : 'PENDING',
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
      const data = await res.json();

      if (res.ok) {
        navigate(`/order-confirmation/${data.id}`, { state: { order: data } });
      }
    } catch {
      alert('Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !offlineProduct) {
      alert('Please provide your name, phone, and requirements.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productOrConcept: offlineProduct,
          quantity: offlineQuantity,
          customDetails: offlineCustomDetails,
          preferredDate: offlineDate,
          deliveryOrPickup: deliveryType,
          customerName,
          customerPhone: phone,
          customerEmail: email,
          shippingAddress: address
        })
      });
      const data = await res.json();

      if (res.ok) {
        setOfflineSubmitted(data);
      }
    } catch {
      alert('Error submitting offline booking request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">Bookings & Reservations</span>
        <h1 className="text-3xl font-serif font-bold text-[#5C2533]">
          Reserve Your Flora7 Flowers
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6B6E] max-w-lg mx-auto">
          Schedule ahead for birthdays, anniversaries, weddings, or custom bespoke event arrangements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-[#FCE7F0] pb-2 gap-4">
        <button
          onClick={() => setActiveTab('ONLINE')}
          className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'ONLINE'
              ? 'bg-[#B76E79] text-white shadow-xs'
              : 'bg-[#FFF9FA] text-[#5C2533] hover:bg-[#FCE7F0]'
          }`}
        >
          Instant Online Booking
        </button>
        <button
          onClick={() => setActiveTab('OFFLINE')}
          className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'OFFLINE'
              ? 'bg-[#B76E79] text-white shadow-xs'
              : 'bg-[#FFF9FA] text-[#5C2533] hover:bg-[#FCE7F0]'
          }`}
        >
          Bespoke / Bulk Offline Quote
        </button>
      </div>

      {/* ONLINE BOOKING FORM */}
      {activeTab === 'ONLINE' ? (
        <form onSubmit={handleOnlineBookingSubmit} className="bg-white rounded-3xl border border-[#FCE7F0] p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5C2533]">Select Flower Arrangement</label>
              <select
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs text-[#5C2533] focus:outline-none"
              >
                <option value="Single Satin Rose">Single Satin Rose (₹57)</option>
                <option value="3 Rose Satin Bouquet">3 Rose Satin Bouquet (₹147)</option>
                <option value="5 Rose Delight Bouquet">5 Rose Delight Bouquet (₹197)</option>
                <option value="7 Rose Classic Satin Bouquet">7 Rose Classic Satin Bouquet (₹247)</option>
                <option value="Premium 7 Rose Royal Bouquet">Premium 7 Rose Royal Bouquet (₹297)</option>
                <option value="Premium 9 Rose Grand Bouquet">Premium 9 Rose Grand Bouquet (₹397)</option>
                <option value="Mini Bouquet Keychain">Mini Bouquet Keychain (₹57)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5C2533]">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5C2533]">Fulfillment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('DELIVERY')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border ${
                    deliveryType === 'DELIVERY' ? 'border-[#B76E79] bg-[#FFF9FA] text-[#5C2533]' : 'border-[#FCE7F0]'
                  }`}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('PICKUP')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border ${
                    deliveryType === 'PICKUP' ? 'border-[#B76E79] bg-[#FFF9FA] text-[#5C2533]' : 'border-[#FCE7F0]'
                  }`}
                >
                  Studio Pickup
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5C2533]">Preferred Date</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5C2533]">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-2.5 text-xs text-[#5C2533] focus:outline-none"
              >
                <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM</option>
                <option value="01:00 PM - 05:00 PM">01:00 PM - 05:00 PM</option>
                <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM</option>
              </select>
            </div>
          </div>

          <div className="border-t border-[#FCE7F0] pt-4 space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#5C2533]">Customer Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
              />
            </div>

            {deliveryType === 'DELIVERY' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Delivery Address *"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="sm:col-span-2 bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Pincode *"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#B76E79] text-white font-bold rounded-full hover:bg-[#9E5762] transition-colors uppercase tracking-wider text-xs shadow-md"
          >
            {loading ? 'Processing Reservation...' : 'CONFIRM ONLINE BOOKING'}
          </button>
        </form>
      ) : (
        /* OFFLINE BOOKING FORM */
        <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 sm:p-8 space-y-6 shadow-sm">
          {offlineSubmitted ? (
            <div className="bg-[#FDF2F5] border-2 border-[#F4B8C7] rounded-3xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#25D366] mx-auto" />
              <h3 className="font-serif font-bold text-xl text-[#5C2533]">
                Your Flora7 Booking Request Has Been Received!
              </h3>
              <p className="text-xs text-[#5E5254] max-w-md mx-auto">
                Booking ID: <strong className="font-mono text-sm text-[#B76E79]">{offlineSubmitted.bookingNumber}</strong>
              </p>
              <p className="text-xs text-[#7A6B6E]">
                Shwetha will review your requirements and reply with a custom quote on WhatsApp/Phone shortly!
              </p>
              <button
                onClick={() => setOfflineSubmitted(null)}
                className="px-6 py-2 bg-[#5C2533] text-white font-bold rounded-full text-xs"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleOfflineBookingSubmit} className="space-y-4">
              <h3 className="font-serif font-bold text-base text-[#5C2533]">
                Submit Offline Custom Requirement / Event Inquiry
              </h3>

              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Product Concept (e.g. 100 Rose Heart Bouquet for Proposal)"
                  value={offlineProduct}
                  onChange={(e) => setOfflineProduct(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
                />

                <textarea
                  rows={3}
                  placeholder="Describe your custom ribbon colors, theme, wrapping sheets or special requirements..."
                  value={offlineCustomDetails}
                  onChange={(e) => setOfflineCustomDetails(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#5C2533] text-white font-bold rounded-full hover:bg-[#3D1822] transition-colors uppercase tracking-wider text-xs shadow-md"
              >
                {loading ? 'Submitting...' : 'SUBMIT BESPOKE BOOKING REQUEST'}
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
};
