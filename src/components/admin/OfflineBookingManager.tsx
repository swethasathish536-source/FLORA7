import React, { useState } from 'react';
import {
  Plus, Search, Phone, Calendar, MapPin, Printer, Trash2, Edit,
  CheckCircle2, XCircle, Clock, AlertCircle, Sparkles, MessageSquare,
  DollarSign, Check, X, ChevronDown, ChevronUp, Package, RefreshCw
} from 'lucide-react';
import { OfflineBooking, PaymentMethod, PaymentStatus } from '../../types';

interface OfflineBookingManagerProps {
  bookings: OfflineBooking[];
  onRefresh: () => void;
  token: string | null;
  onShowNotification: (type: 'success' | 'error', message: string) => void;
}

export const OfflineBookingManager: React.FC<OfflineBookingManagerProps> = ({
  bookings,
  onRefresh,
  token,
  onShowNotification
}) => {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<OfflineBooking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<OfflineBooking | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryOrPickup, setDeliveryOrPickup] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [shippingAddress, setShippingAddress] = useState('');
  const [productOrConcept, setProductOrConcept] = useState('7 Classic Blue Colour Roses Bouquet');
  const [quantity, setQuantity] = useState<number>(1);
  const [customDetails, setCustomDetails] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [quotedPrice, setQuotedPrice] = useState<string>('247');
  const [advancePaid, setAdvancePaid] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [bookingStatus, setBookingStatus] = useState<OfflineBooking['status']>('CONFIRMED');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick Bouquet Concept presets
  const PRESET_CONCEPTS = [
    { name: '7 Classic Blue Colour Roses Bouquet', price: 247, details: '7 Blue satin roses, pearl center, Korean frosted black paper with silver ribbon' },
    { name: '7 Classic Passion Red Roses Bouquet', price: 247, details: '7 Passion Red satin roses, pearl center, black wrap with gold ribbon' },
    { name: 'Single Satin Rose in Sleeve', price: 57, details: 'Single satin rose with stem and satin ribbon bow' },
    { name: 'Premium Single Rose with Pearl & LED', price: 77, details: '1 Satin rose, center pearl, warm fairy lights' },
    { name: '12 Roses Luxury Round Bouquet', price: 699, details: '12 Satin ribbon roses in dual-tone with pearls and luxury ribbon' },
    { name: 'Custom Bespoke Keepsake Hamper', price: 1200, details: 'Custom color arrangement with handwritten message card and gift tag' },
  ];

  const applyPreset = (preset: typeof PRESET_CONCEPTS[0]) => {
    setProductOrConcept(preset.name);
    setQuotedPrice(String(preset.price));
    setCustomDetails(preset.details);
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setDeliveryOrPickup('DELIVERY');
    setShippingAddress('');
    setProductOrConcept('7 Classic Blue Colour Roses Bouquet');
    setQuantity(1);
    setCustomDetails('');
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setPreferredDate(d.toISOString().split('T')[0]);
    setQuotedPrice('247');
    setAdvancePaid('0');
    setPaymentMethod('UPI');
    setPaymentStatus('UNPAID');
    setBookingStatus('CONFIRMED');
    setAdminNotes('');
    setEditingBooking(null);
  };

  const handleOpenEdit = (b: OfflineBooking) => {
    setEditingBooking(b);
    setCustomerName(b.customerName);
    setCustomerPhone(b.customerPhone);
    setCustomerEmail(b.customerEmail || '');
    setDeliveryOrPickup(b.deliveryOrPickup || 'DELIVERY');
    setShippingAddress(b.shippingAddress || '');
    setProductOrConcept(b.productOrConcept);
    setQuantity(b.quantity || 1);
    setCustomDetails(b.customDetails || '');
    setPreferredDate(b.preferredDate || new Date().toISOString().split('T')[0]);
    setQuotedPrice(String(b.quotedPrice || 0));
    setAdvancePaid(String(b.advancePaid || 0));
    setPaymentMethod(b.paymentMethod || 'UPI');
    setPaymentStatus(b.paymentStatus || 'UNPAID');
    setBookingStatus(b.status || 'CONFIRMED');
    setAdminNotes(b.adminNotes || '');
    setShowEntryForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please provide Customer Name and Phone Number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryOrPickup,
        shippingAddress: shippingAddress.trim() || undefined,
        productOrConcept: productOrConcept.trim(),
        quantity: Number(quantity) || 1,
        customDetails: customDetails.trim(),
        preferredDate,
        quotedPrice: Number(quotedPrice) || 0,
        advancePaid: Number(advancePaid) || 0,
        paymentMethod,
        paymentStatus,
        status: bookingStatus,
        adminNotes: adminNotes.trim() || undefined
      };

      if (editingBooking) {
        // Update existing booking
        const res = await fetch(`/api/bookings/${editingBooking.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update booking');
        }

        onShowNotification('success', `Offline booking ${editingBooking.bookingNumber} updated successfully!`);
      } else {
        // Create new offline booking
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to save offline booking');
        }

        const created = await res.json();
        onShowNotification('success', `New Offline Booking ${created.bookingNumber} saved successfully!`);
      }

      resetForm();
      setShowEntryForm(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error saving offline booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick inline update for Payment Method & Status
  const handleInlinePaymentUpdate = async (
    bookingId: string,
    updates: { paymentMethod?: PaymentMethod; paymentStatus?: PaymentStatus; status?: OfflineBooking['status'] }
  ) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        onShowNotification('success', 'Booking updated successfully.');
        onRefresh();
      }
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        onShowNotification('success', 'Offline booking removed.');
        setDeleteConfirmId(null);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      b.bookingNumber.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.toLowerCase().includes(q) ||
      b.productOrConcept.toLowerCase().includes(q) ||
      (b.shippingAddress && b.shippingAddress.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const parsedQuoted = Number(quotedPrice) || 0;
  const parsedAdvance = Number(advancePaid) || 0;
  const calculatedBalance = Math.max(0, parsedQuoted - parsedAdvance);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF9FA] border border-[#FCE7F0] text-[#B76E79]">
              Studio & Walk-in Records
            </span>
            <span className="text-xs text-[#8C5263] font-semibold">
              {bookings.length} Total Bookings
            </span>
          </div>
          <h2 className="font-serif font-bold text-xl text-[#5C2533] mt-1">
            Offline Bookings & Bespoke Orders
          </h2>
          <p className="text-xs text-[#8C5263] mt-0.5 max-w-2xl">
            Enter offline walk-ins, phone or WhatsApp orders, edit payment methods (UPI, COD, Cash), and update paid or unpaid status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (showEntryForm && !editingBooking) {
                setShowEntryForm(false);
              } else {
                resetForm();
                setShowEntryForm(true);
              }
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
              showEntryForm
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-[#B76E79] hover:bg-[#9E5762] text-white'
            }`}
          >
            {showEntryForm ? (
              <>
                <X className="w-4 h-4" />
                <span>Close Entry Form</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>+ Enter Offline Booking</span>
              </>
            )}
          </button>

          <button
            onClick={onRefresh}
            className="p-2.5 bg-[#FFF9FA] hover:bg-[#FCE7F0] border border-[#FCE7F0] text-[#5C2533] rounded-full transition-colors cursor-pointer"
            title="Refresh bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OFFLINE BOOKING DATA ENTRY FORM */}
      {showEntryForm && (
        <div className="bg-[#FFF9FA] rounded-3xl border-2 border-[#B76E79]/30 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#FCE7F0] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B76E79]">
                {editingBooking ? `Editing Booking: ${editingBooking.bookingNumber}` : 'Direct Studio Order Entry'}
              </span>
              <h3 className="font-serif font-bold text-lg text-[#5C2533]">
                {editingBooking ? 'Update Offline Booking Details' : 'Enter New Offline Booking'}
              </h3>
            </div>
            <button
              onClick={() => { setShowEntryForm(false); resetForm(); }}
              className="text-[#8C5263] hover:text-[#5C2533] p-1.5 rounded-full hover:bg-white text-xs font-semibold flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-6 text-xs text-[#5C2533]">
            {/* Quick Concept Presets */}
            {!editingBooking && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#8C5263] block">
                  Quick Bouquet Concept Presets (Click to autofill):
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_CONCEPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        productOrConcept === p.name
                          ? 'bg-[#B76E79] text-white border-[#B76E79]'
                          : 'bg-white hover:bg-[#FCE7F0] text-[#5C2533] border-[#FCE7F0]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{p.name} (₹{p.price})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grid 1: Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-[#5C2533] block mb-1">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swetha Sathish / Priya Rao"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5C2533] block mb-1">
                  Phone Number (WhatsApp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs text-[#5C2533] font-mono focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5C2533] block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. customer@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>
            </div>

            {/* Grid 2: Fulfillment & Delivery Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-[#5C2533] block mb-1">
                  Fulfillment Mode
                </label>
                <select
                  value={deliveryOrPickup}
                  onChange={(e) => setDeliveryOrPickup(e.target.value as any)}
                  className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                >
                  <option value="DELIVERY">🚚 Home Delivery (Bangalore Address)</option>
                  <option value="PICKUP">🏬 Storefront Studio Pickup</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-[#5C2533] block mb-1">
                  {deliveryOrPickup === 'DELIVERY' ? 'Delivery Address & Landmark' : 'Pickup Details / Notes'}
                </label>
                <input
                  type="text"
                  placeholder={
                    deliveryOrPickup === 'DELIVERY'
                      ? 'e.g. Flat 302, Sunrise Apts, 5th Cross, Indiranagar, Bangalore - 560038'
                      : 'e.g. Customer will pick up from studio at 4:00 PM'
                  }
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>
            </div>

            {/* Grid 3: Bouquet Details & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="font-bold text-[#5C2533] block mb-1">
                  Product / Bouquet Concept <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7 Classic Blue Colour Roses Bouquet"
                  value={productOrConcept}
                  onChange={(e) => setProductOrConcept(e.target.value)}
                  className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs text-[#5C2533] font-semibold focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5C2533] block mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs text-[#5C2533] font-bold focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5C2533] block mb-1">
                  Target Delivery / Event Date
                </label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>
            </div>

            {/* Customization Details & Card Message */}
            <div>
              <label className="font-bold text-[#5C2533] block mb-1">
                Customization Specifications (Colors, Ribbons, Center Pearls, Message Card Text)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Sky Blue & Cream Ivory roses, pearl centers, black frosted wrapping with gold satin ribbon. Card: 'Happy Anniversary to my love!'"
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
              />
            </div>

            {/* Grid 4: Pricing, Payments & Status */}
            <div className="bg-white p-5 rounded-2xl border border-[#FCE7F0] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#5C2533]">
                  Payment & Financial Details
                </span>
                <span className="text-[11px] font-bold text-[#B76E79] bg-[#FFF9FA] px-3 py-1 rounded-full border border-[#FCE7F0]">
                  Balance Due: ₹{calculatedBalance}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                <div>
                  <label className="font-bold text-[#5C2533] block mb-1">
                    Quoted Total (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="247"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3 py-2 text-xs font-bold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#5C2533] block mb-1">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={advancePaid}
                    onChange={(e) => {
                      setAdvancePaid(e.target.value);
                      const adv = Number(e.target.value) || 0;
                      const tot = Number(quotedPrice) || 0;
                      if (adv >= tot && tot > 0) {
                        setPaymentStatus('PAID');
                      } else if (adv > 0) {
                        setPaymentStatus('PARTIAL');
                      }
                    }}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3 py-2 text-xs font-bold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#5C2533] block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                  >
                    <option value="UPI">📱 UPI (GPay / PhonePe / Paytm)</option>
                    <option value="COD">💵 COD (Cash on Delivery)</option>
                    <option value="CASH">👛 CASH (In Hand)</option>
                    <option value="CARD">💳 CARD / NetBanking</option>
                    <option value="PAY_AT_PICKUP">🏬 Pay at Pickup</option>
                    <option value="ONLINE">🌐 Online Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#5C2533] block mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden ${
                      paymentStatus === 'PAID'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : paymentStatus === 'UNPAID'
                        ? 'bg-red-50 border-red-300 text-red-800'
                        : 'bg-amber-50 border-amber-300 text-amber-800'
                    }`}
                  >
                    <option value="PAID">✓ PAID (Full)</option>
                    <option value="UNPAID">✕ UNPAID</option>
                    <option value="PARTIAL">½ PARTIAL (Advance)</option>
                    <option value="PENDING">⏳ PENDING</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#5C2533] block mb-1">
                    Booking Status
                  </label>
                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value as any)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5C2533] block mb-1">
                  Owner / Workshop Internal Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested extra fairy lights; keep packaging ready by 2 PM."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3.5 py-2 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowEntryForm(false); resetForm(); }}
                className="px-5 py-2.5 rounded-full border border-gray-300 hover:bg-gray-100 font-bold text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-[#B76E79] hover:bg-[#9E5762] text-white font-bold rounded-full text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Booking...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editingBooking ? 'Update Offline Booking' : 'Save Offline Booking'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search offline bookings by Booking #, Customer, Phone, or Product..."
            className="w-full bg-white border border-[#FCE7F0] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
          >
            <option value="ALL">All Payments ({bookings.length})</option>
            <option value="PAID">Paid ({bookings.filter(b => b.paymentStatus === 'PAID').length})</option>
            <option value="UNPAID">Unpaid ({bookings.filter(b => b.paymentStatus === 'UNPAID').length})</option>
            <option value="PARTIAL">Partial ({bookings.filter(b => b.paymentStatus === 'PARTIAL').length})</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PENDING">Pending</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* OFFLINE BOOKINGS LIST */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-12 text-center space-y-4">
            <Package className="w-12 h-12 text-[#B76E79]/40 mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#5C2533]">
              {bookings.length === 0 ? 'No Offline Bookings Entered Yet' : 'No Matching Bookings Found'}
            </h3>
            <p className="text-xs text-[#8C5263] max-w-md mx-auto leading-relaxed">
              {bookings.length === 0
                ? 'Click "+ Enter Offline Booking" above to record walk-in customers, bespoke arrangements, WhatsApp inquiries, and manage cash or UPI payments.'
                : `No bookings match your current search "${searchQuery}".`}
            </p>
            {bookings.length === 0 ? (
              <button
                onClick={() => { resetForm(); setShowEntryForm(true); }}
                className="px-5 py-2.5 bg-[#B76E79] text-white font-bold rounded-full text-xs"
              >
                + Enter First Offline Booking
              </button>
            ) : (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setPaymentFilter('ALL'); }}
                className="px-4 py-2 bg-[#B76E79] text-white font-bold rounded-full text-xs"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredBookings.map((b) => {
            const cleanPhone = (b.customerPhone || '').replace(/[^0-9]/g, '');
            const balanceDue = Math.max(0, (b.quotedPrice || 0) - (b.advancePaid || 0));

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-[#FCE7F0] p-5 sm:p-6 shadow-xs hover:border-[#B76E79]/40 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FCE7F0] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#B76E79] bg-[#FFF9FA] px-3 py-1 rounded-xl border border-[#FCE7F0]">
                      {b.bookingNumber}
                    </span>
                    <span className="text-[10px] text-[#8C5263]">
                      Entered: {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF9FA] border border-[#FCE7F0] text-[#5C2533]">
                      {b.deliveryOrPickup === 'PICKUP' ? '🏬 Studio Pickup' : '🚚 Home Delivery'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Booking Status Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#8C5263] font-semibold">Status:</span>
                      <select
                        value={b.status}
                        onChange={(e) => handleInlinePaymentUpdate(b.id, { status: e.target.value as any })}
                        className="bg-[#FFF9FA] border border-[#FCE7F0] text-[#5C2533] font-bold text-xs rounded-xl px-2.5 py-1 focus:outline-hidden"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    {/* Print Slip */}
                    <button
                      onClick={() => setReceiptBooking(b)}
                      className="p-1.5 bg-[#FFF9FA] hover:bg-[#FCE7F0] text-[#5C2533] rounded-lg border border-[#FCE7F0] text-[11px] font-bold flex items-center gap-1"
                      title="Print Customer Slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Slip</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 bg-[#FFF9FA] hover:bg-[#FCE7F0] text-[#5C2533] rounded-lg border border-[#FCE7F0] text-[11px] font-bold flex items-center gap-1"
                      title="Edit all fields"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Delete button */}
                    {deleteConfirmId === b.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(b.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-[11px]"
                        title="Delete booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Grid: Customer / Order / Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5C2533]">
                  {/* Col 1: Customer Details */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C5263]">
                      Customer Information
                    </span>
                    <p className="font-bold text-sm text-[#5C2533]">{b.customerName}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#8C5263]">{b.customerPhone}</span>
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/91${cleanPhone.slice(-10)}?text=Hello%20${encodeURIComponent(b.customerName)},%20this%20is%20Shwetha%20from%20Flora7%20regarding%20your%20satin%20rose%20booking%20(${b.bookingNumber}).`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-bold text-[10px] flex items-center gap-1 border border-emerald-200"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                    {b.customerEmail && (
                      <p className="text-[#8C5263] truncate text-[11px]">{b.customerEmail}</p>
                    )}
                    <p className="text-[11px] text-[#5C2533]/80 mt-1">
                      📍 {b.shippingAddress || (b.deliveryOrPickup === 'PICKUP' ? 'Studio Pick-up' : 'Bangalore Address')}
                    </p>
                  </div>

                  {/* Col 2: Bouquet Concept & Date */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C5263]">
                      Bouquet & Delivery Date
                    </span>
                    <p className="font-bold text-[#5C2533]">
                      {b.quantity || 1}x {b.productOrConcept}
                    </p>
                    {b.customDetails && (
                      <div className="p-2 bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl text-[11px] text-[#8C5263] italic">
                        "{b.customDetails}"
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-[#5C2533] font-semibold mt-1">
                      <Calendar className="w-3.5 h-3.5 text-[#B76E79]" />
                      <span>Target Date: {b.preferredDate}</span>
                    </div>
                    {b.adminNotes && (
                      <p className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                        <strong>Note:</strong> {b.adminNotes}
                      </p>
                    )}
                  </div>

                  {/* Col 3: INTERACTIVE PAYMENTS & STATUS EDITING */}
                  <div className="space-y-2 bg-[#FFF9FA] p-3.5 rounded-2xl border border-[#FCE7F0]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C5263] flex items-center justify-between">
                      <span>Payment Controls</span>
                      <span className="font-bold text-[#5C2533]">
                        Total: ₹{b.quotedPrice || 0}
                      </span>
                    </span>

                    {/* Payment Method Selector (UPI, COD, CASH, etc.) */}
                    <div>
                      <label className="text-[9px] text-[#8C5263] font-semibold uppercase block mb-0.5">
                        Payment Method
                      </label>
                      <select
                        value={b.paymentMethod || 'UPI'}
                        onChange={(e) => handleInlinePaymentUpdate(b.id, { paymentMethod: e.target.value as any })}
                        className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-[#FCE7F0] bg-white text-[#5C2533] cursor-pointer focus:outline-hidden"
                      >
                        <option value="UPI">📱 UPI (GPay / PhonePe / Paytm)</option>
                        <option value="COD">💵 COD (Cash on Delivery)</option>
                        <option value="CASH">👛 CASH (In Hand)</option>
                        <option value="CARD">💳 CARD / NetBanking</option>
                        <option value="PAY_AT_PICKUP">🏬 Pay at Pickup</option>
                        <option value="ONLINE">🌐 Online Gateway</option>
                      </select>
                    </div>

                    {/* Payment Status Selector (PAID, UNPAID, PARTIAL) */}
                    <div>
                      <label className="text-[9px] text-[#8C5263] font-semibold uppercase block mb-0.5">
                        Payment Status
                      </label>
                      <select
                        value={b.paymentStatus || 'UNPAID'}
                        onChange={(e) => handleInlinePaymentUpdate(b.id, { paymentStatus: e.target.value as any })}
                        className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border cursor-pointer focus:outline-hidden ${
                          b.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : b.paymentStatus === 'UNPAID'
                            ? 'bg-red-50 border-red-300 text-red-800'
                            : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}
                      >
                        <option value="PAID">✓ PAID (Full Payment)</option>
                        <option value="UNPAID">✕ UNPAID</option>
                        <option value="PARTIAL">½ PARTIAL (Advance Received)</option>
                        <option value="PENDING">⏳ PENDING</option>
                      </select>
                    </div>

                    {/* Quick 1-Click Toggle for Paid/Unpaid */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#FCE7F0]">
                      <button
                        type="button"
                        onClick={() =>
                          handleInlinePaymentUpdate(b.id, {
                            paymentStatus: b.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID',
                          })
                        }
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 border ${
                          b.paymentStatus === 'PAID'
                            ? 'bg-white hover:bg-red-50 text-red-600 border-red-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                        }`}
                      >
                        {b.paymentStatus === 'PAID' ? 'Mark as UNPAID' : 'Mark as PAID ✓'}
                      </button>

                      {balanceDue > 0 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg shrink-0">
                          Due: ₹{balanceDue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PRINTABLE OFFLINE BOOKING RECEIPT SLIP MODAL */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#FCE7F0] shadow-2xl relative my-8 print:m-0 print:p-0 print:shadow-none print:border-none">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6 print:hidden">
              <h3 className="font-serif font-bold text-lg text-[#5C2533]">
                Offline Booking Receipt & Slip
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#B76E79] text-white text-xs font-semibold rounded-full hover:bg-[#9E5762] transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT SLIP</span>
                </button>
                <button
                  onClick={() => setReceiptBooking(null)}
                  className="p-2 text-[#8C5263] hover:text-[#5C2533] rounded-full hover:bg-[#FCE7F0]/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Printable Area */}
            <div className="space-y-6 text-[#2D2727] font-sans">
              <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                <div>
                  <h1 className="text-2xl font-serif font-bold tracking-widest text-[#5C2533]">
                    FLORA7
                  </h1>
                  <p className="text-[9px] tracking-widest text-[#8C5263] uppercase">
                    LOVE UNFOLDED • CRAFTED BY SHWETHA
                  </p>
                  <p className="text-xs text-[#5E5254] mt-1">
                    Handmade Satin Ribbon Flowers • Studio Booking Receipt
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-[#B76E79] block">
                    {receiptBooking.bookingNumber}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Date: {new Date(receiptBooking.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Customer & Delivery */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Billed To:</p>
                  <p className="font-bold text-sm text-[#5C2533]">{receiptBooking.customerName}</p>
                  <p className="font-mono text-gray-600">{receiptBooking.customerPhone}</p>
                  {receiptBooking.customerEmail && <p className="text-gray-500">{receiptBooking.customerEmail}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Fulfillment:</p>
                  <p className="font-bold text-[#5C2533]">
                    {receiptBooking.deliveryOrPickup === 'PICKUP' ? 'Studio Pick-up' : 'Bangalore Delivery'}
                  </p>
                  <p className="text-gray-600 text-[11px]">Date: {receiptBooking.preferredDate}</p>
                  {receiptBooking.shippingAddress && (
                    <p className="text-gray-500 text-[10px] max-w-xs ml-auto">{receiptBooking.shippingAddress}</p>
                  )}
                </div>
              </div>

              {/* Item Details */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-[#5C2533]">
                  <span>{receiptBooking.quantity || 1}x {receiptBooking.productOrConcept}</span>
                  <span>₹{receiptBooking.quotedPrice || 0}</span>
                </div>
                {receiptBooking.customDetails && (
                  <p className="text-[11px] text-gray-600 italic">
                    Specifications: {receiptBooking.customDetails}
                  </p>
                )}
              </div>

              {/* Summary Table */}
              <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-right">
                <div className="flex justify-between">
                  <span className="text-gray-500">Quoted Total:</span>
                  <span className="font-bold">₹{receiptBooking.quotedPrice || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Advance Received:</span>
                  <span className="font-semibold text-emerald-600">₹{receiptBooking.advancePaid || 0}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 text-[#5C2533]">
                  <span>Balance Due:</span>
                  <span>₹{Math.max(0, (receiptBooking.quotedPrice || 0) - (receiptBooking.advancePaid || 0))}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-bold text-[#B76E79]">{receiptBooking.paymentMethod || 'UPI'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Payment Status:</span>
                  <span className={`font-bold ${receiptBooking.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {receiptBooking.paymentStatus || 'UNPAID'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 text-center text-[10px] text-gray-500">
                <p className="font-serif italic text-gray-600">
                  "Handcrafted with patience, creativity, and love. Satin roses that never fade."
                </p>
                <p className="mt-1">Flora7 • Bangalore, Karnataka • flora7loveunfolded@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
