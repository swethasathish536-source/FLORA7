import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Order } from '../types';

export const TrackOrderPage: React.FC = () => {
  const [orderQuery, setOrderQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [orderResult, setOrderResult] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery && !phoneQuery) {
      alert('Please enter an order number or phone number.');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      let url = '/api/orders?';
      if (orderQuery) url += `query=${encodeURIComponent(orderQuery)}`;
      else if (phoneQuery) url += `phone=${encodeURIComponent(phoneQuery)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        setOrderResult(data[0]);
      } else {
        setOrderResult(null);
      }
    } catch {
      setOrderResult(null);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['RECEIVED', 'PREPARING', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">Real-Time Status</span>
        <h1 className="text-3xl font-serif font-bold text-[#5C2533]">
          Track Your Flora7 Order
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6B6E]">
          Enter your Order ID (e.g. FLORA7-10001) or 10-digit Phone Number to view progress.
        </p>
      </div>

      {/* Track Form */}
      <form onSubmit={handleTrack} className="bg-white rounded-3xl border border-[#FCE7F0] p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-[#5C2533] mb-1">Order Number</label>
            <input
              type="text"
              placeholder="e.g. FLORA7-10001"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#5C2533] mb-1">Or Phone Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#B76E79] text-white font-bold rounded-full hover:bg-[#9E5762] transition-colors uppercase tracking-wider text-xs shadow-xs flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Searching...' : 'TRACK ORDER'}</span>
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div>
          {orderResult ? (
            <div className="bg-[#FFF9FA] border-2 border-[#FCE7F0] rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#FCE7F0] pb-3 gap-2">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#5C2533]">
                    {orderResult.orderNumber}
                  </h3>
                  <p className="text-xs text-[#8C5263]">Customer: {orderResult.customerName}</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-[#B76E79] text-white px-3 py-1 rounded-full">
                  {(orderResult.orderStatus || (orderResult as any).status || 'RECEIVED').replace(/_/g, ' ')}
                </span>
              </div>

              {/* Progress Stepper */}
              <div className="py-4">
                <div className="flex items-center justify-between relative">
                  {statusSteps.map((st, idx) => {
                    const currentIdx = statusSteps.indexOf(orderResult.orderStatus || (orderResult as any).status);
                    const isCompleted = idx <= currentIdx;
                    return (
                      <div key={st} className="flex flex-col items-center relative z-10 space-y-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted ? 'bg-[#25D366] text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className="text-[9px] font-bold text-[#5C2533] uppercase text-center max-w-[60px]">
                          {(st || '').replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-[#FCE7F0] rounded-2xl p-4 space-y-2 text-xs text-[#5C2533]">
                <p><strong>Scheduled Date:</strong> {orderResult.deliveryDate} ({orderResult.preferredSlot})</p>
                <p><strong>Fulfillment:</strong> {orderResult.isPickup ? 'Studio Pickup' : 'Home Delivery'}</p>
                <p><strong>Total Amount:</strong> ₹{orderResult.totalAmount} ({orderResult.paymentStatus})</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-3xl p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-[#B76E79] mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#5C2533]">No Order Found</h3>
              <p className="text-xs text-[#8C5263]">Please check your Order Number or Phone Number and try again.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
