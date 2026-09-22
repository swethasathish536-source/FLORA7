import React, { useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Printer, ArrowRight, MessageCircle, Sparkles, MapPin } from 'lucide-react';
import { Order } from '../types';
import { InvoiceModal } from '../components/InvoiceModal';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const order: Order | null = location.state?.order || null;

  const [showInvoice, setShowInvoice] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Confirmation Banner */}
      <div className="bg-[#FFF9FA] border-2 border-[#F4B8C7] rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-[#E8F8EE] rounded-full border border-[#25D366]/30 flex items-center justify-center mx-auto text-[#25D366]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B76E79]">Thank You for Your Order!</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5C2533]">
            Your Flora7 Flowers Are Being Handfolded!
          </h1>
          <p className="text-xs text-[#7A6B6E]">
            Order Number: <strong className="font-mono text-sm text-[#5C2533]">{order?.orderNumber || id}</strong>
          </p>
        </div>

        <p className="text-xs text-[#5E5254] max-w-md mx-auto leading-relaxed">
          Shwetha has received your order and will carefully fold your satin roses. You will receive WhatsApp updates as your bouquet progresses.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setShowInvoice(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#FFF9FA] border border-[#FCE7F0] text-[#5C2533] text-xs font-bold rounded-full hover:bg-[#FCE7F0] transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#B76E79]" />
            <span>VIEW & PRINT INVOICE</span>
          </button>

          <a
            href={`https://wa.me/916360084897?text=Hi%20Flora7!%20I%20just%20placed%20order%20${order?.orderNumber || id}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#25D366] text-white text-xs font-bold rounded-full hover:bg-[#20ba5a] transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>TRACK ON WHATSAPP</span>
          </a>
        </div>
      </div>

      {/* Summary Box */}
      {order && (
        <div className="bg-white border border-[#FCE7F0] rounded-3xl p-6 space-y-4 shadow-2xs text-xs text-[#5C2533]">
          <h3 className="font-serif font-bold text-base border-b border-[#FCE7F0] pb-2">
            Order Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-[#8C5263]">Customer:</p>
              <p>{order.customerName}</p>
              <p>{order.customerPhone}</p>
            </div>
            <div>
              <p className="font-bold text-[#8C5263]">Fulfillment:</p>
              <p>{order.isPickup ? 'Studio Pickup' : 'Home Delivery'}</p>
              <p>Scheduled: {order.deliveryDate}</p>
            </div>
          </div>

          <div className="border-t border-[#FCE7F0] pt-3">
            <p className="font-bold text-[#8C5263] mb-2">Items:</p>
            <ul className="space-y-1.5">
              {order.items.map((it, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.title}</span>
                  <span className="font-bold">₹{it.price * it.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[#FCE7F0] pt-3 flex justify-between font-serif font-bold text-base">
            <span>Total Amount Paid:</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && order && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}

    </div>
  );
};
