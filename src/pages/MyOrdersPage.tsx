import React, { useState } from 'react';
import { Search, ShoppingBag, Eye, Printer } from 'lucide-react';
import { Order } from '../types';
import { InvoiceModal } from '../components/InvoiceModal';

export const MyOrdersPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const handleFetchMyOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">Customer Portal</span>
        <h1 className="text-3xl font-serif font-bold text-[#5C2533]">
          My Orders & Order History
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6B6E]">
          Enter your registered phone number to view all your previous Flora7 orders and print invoices.
        </p>
      </div>

      {/* Phone lookup form */}
      <form onSubmit={handleFetchMyOrders} className="bg-white rounded-3xl border border-[#FCE7F0] p-6 space-y-3 shadow-sm max-w-md mx-auto">
        <label className="block text-xs font-bold text-[#5C2533]">Enter Registered Phone Number</label>
        <div className="flex gap-2">
          <input
            type="tel"
            required
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#B76E79] text-white font-bold rounded-2xl text-xs hover:bg-[#9E5762] shrink-0"
          >
            {loading ? 'Searching...' : 'VIEW ORDERS'}
          </button>
        </div>
      </form>

      {/* Orders List */}
      {searched && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-[#FFF9FA] rounded-3xl border border-[#FCE7F0] p-8 text-center space-y-2 text-xs text-[#8C5263]">
              <p className="text-2xl">🌸</p>
              <p className="font-bold text-[#5C2533]">No orders found for phone number {phone}</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-[#FCE7F0] p-6 space-y-4 shadow-2xs text-xs text-[#5C2533]"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#FCE7F0] pb-3 gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base">{ord.orderNumber}</h3>
                    <p className="text-[#8C5263] text-[11px]">
                      Placed on: {new Date(ord.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFF9FA] border border-[#FCE7F0] px-3 py-1 rounded-full font-bold uppercase text-[10px] text-[#5C2533]">
                      {(ord.orderStatus || (ord as any).status || 'RECEIVED').replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => setSelectedInvoiceOrder(ord)}
                      className="px-3 py-1 bg-[#B76E79] text-white rounded-full text-[11px] font-bold flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[#5E5254]">
                      <span>{it.quantity}x {it.title}</span>
                      <span className="font-semibold">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#FCE7F0] pt-2 flex justify-between font-serif font-bold text-sm">
                  <span>Total Amount:</span>
                  <span>₹{ord.totalAmount} ({ord.paymentStatus})</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}

    </div>
  );
};
