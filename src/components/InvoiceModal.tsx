import React, { useState } from 'react';
import { Printer, X, Sparkles, Mail, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleEmailToOwner = async () => {
    try {
      setSendingEmail(true);
      setEmailSentStatus(null);
      const res = await fetch(`/api/orders/${order.id}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'OWNER' })
      });
      if (res.ok) {
        setEmailSentStatus('Sent to flora7loveunfolded@gmail.com');
        setTimeout(() => setEmailSentStatus(null), 4000);
      } else {
        const data = await res.json();
        alert(`Failed to send email: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Error sending email: ${err.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#FCE7F0] shadow-2xl relative my-8 print:m-0 print:p-0 print:shadow-none print:border-none">
        
        {/* Close & Print Controls (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FCE7F0] pb-4 mb-6 print:hidden">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#5C2533]">
              Order Invoice & Packing Slip
            </h3>
            {emailSentStatus && (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{emailSentStatus}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEmailToOwner}
              disabled={sendingEmail}
              className="px-3.5 py-2 bg-[#FFF9FA] hover:bg-[#FCE7F0] border border-[#FCE7F0] text-[#5C2533] text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Send full order specifications to flora7loveunfolded@gmail.com"
            >
              <Mail className="w-3.5 h-3.5 text-[#B76E79]" />
              <span>{sendingEmail ? 'Sending...' : 'Email to Owner'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#B76E79] text-white text-xs font-semibold rounded-full hover:bg-[#9E5762] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT INVOICE</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#8C5263] hover:text-[#5C2533] rounded-full hover:bg-[#FCE7F0]/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Area */}
        <div className="space-y-6 text-[#2D2727] font-sans">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-widest text-[#5C2533]">
                FLORA7
              </h1>
              <p className="text-[10px] tracking-widest text-[#8C5263] uppercase">
                LOVE UNFOLDED • CRAFTED BY SHWETHA
              </p>
              <p className="text-xs text-[#5E5254] mt-1">
                Handmade Flower Studio • Local Bangalore Delivery & Studio Pickup
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B76E79] block">
                TAX INVOICE / ORDER SLIP
              </span>
              <p className="text-lg font-bold text-[#5C2533] mt-1">
                {order.orderNumber}
              </p>
              <p className="text-xs text-gray-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-[#FFF9FA] p-4 rounded-2xl border border-[#FCE7F0]">
            <div>
              <p className="font-bold text-[#5C2533] uppercase text-[10px] tracking-wider mb-1">Customer Info:</p>
              <p className="font-semibold text-sm">{order.customerName}</p>
              <p className="text-gray-600">Phone: {order.customerPhone}</p>
              <p className="text-gray-600">Email: {order.customerEmail}</p>
            </div>

            <div>
              <p className="font-bold text-[#5C2533] uppercase text-[10px] tracking-wider mb-1">
                {order.isPickup ? 'Pickup Details:' : 'Delivery Address:'}
              </p>
              {order.isPickup ? (
                <p className="text-gray-700 font-medium">Studio Order Pickup</p>
              ) : (
                <p className="text-gray-700">
                  {order.shippingAddress}, {order.landmark && `Landmark: ${order.landmark}, `}Pincode: {order.pincode}
                </p>
              )}
              <p className="text-gray-600 mt-1 font-medium">
                Scheduled Date: {order.deliveryDate} ({order.preferredSlot})
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-[#5C2533] uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-2">Item Description</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Price</th>
                  <th className="py-2.5 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-2 space-y-1">
                      <p className="font-semibold text-sm text-[#5C2533]">{item.title}</p>
                      {item.customisationDetails && (
                        <div className="text-[10px] text-gray-500 bg-gray-50 p-1.5 rounded-lg space-y-0.5">
                          {'flowerType' in item.customisationDetails ? (
                            <>
                              <p>Flower Type: {item.customisationDetails.flowerType}</p>
                              <p>Colours: {item.customisationDetails.flowerColours?.join(', ')}</p>
                              <p>Wrapping: {item.customisationDetails.wrappingColour} | Ribbon: {item.customisationDetails.ribbonColour}</p>
                            </>
                          ) : (
                            <p>
                              {item.customisationDetails.colour && `Colour: ${item.customisationDetails.colour} `}
                              {item.customisationDetails.wrapping && `| Wrap: ${item.customisationDetails.wrapping} `}
                              {item.customisationDetails.ribbon && `| Ribbon: ${item.customisationDetails.ribbon}`}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-medium">₹{item.price}</td>
                    <td className="py-3 px-2 text-right font-bold text-[#5C2533]">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="border-t border-gray-200 pt-4 flex justify-between items-start text-xs">
            <div className="max-w-xs space-y-1 text-gray-600">
              <p><strong className="text-[#5C2533]">Payment Method:</strong> {order.paymentMethod}</p>
              <p><strong className="text-[#5C2533]">Payment Status:</strong> <span className="uppercase text-[#25D366] font-bold">{order.paymentStatus}</span></p>
              {order.giftMessage && (
                <div className="p-2 bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl text-[11px] text-[#5C2533] italic mt-2">
                  🎁 Gift Message: "{order.giftMessage}"
                </div>
              )}
            </div>

            <div className="w-48 space-y-1.5 text-right font-sans">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#25D366]">
                  <span>Discount ({order.couponCode}):</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between text-base font-bold text-[#5C2533]">
                <span>Grand Total:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-6 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
            <p className="font-serif italic font-medium text-[#5C2533]">
              "Flowers that never fade, memories that last forever."
            </p>
            <p>Thank you for choosing FLORA7! Crafted with love by Shwetha.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
