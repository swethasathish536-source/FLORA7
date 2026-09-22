import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, Tag, ShoppingBag, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SafeImage } from '../components/SafeImage';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    discountAmount,
    subtotal,
    deliveryFee,
    grandTotal,
    couponCodeInput,
    setCouponCodeInput,
    couponError,
    couponSuccess,
    applyCoupon,
    removeCoupon,
    pincodeInput,
    setPincodeInput,
    isServicable,
    checkPincode
  } = useCart();

  const [checkingPincode, setCheckingPincode] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-[#FFF9FA] rounded-full border border-[#FCE7F0] flex items-center justify-center mx-auto text-3xl">
          🌸
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#5C2533]">Your Cart is Empty</h2>
        <p className="text-xs text-[#8C5263]">
          Explore our handmade satin rose bouquets, single stems, and custom arrangements to fill your bag!
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-[#B76E79] text-white font-bold text-xs rounded-full hover:bg-[#9E5762] uppercase tracking-wider"
        >
          EXPLORE FLOWERS
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="border-b border-[#FCE7F0] pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-[#5C2533] flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#B76E79]" />
          <span>Your Shopping Bag ({cart.length} items)</span>
        </h1>
        <Link to="/shop" className="text-xs text-[#B76E79] font-bold hover:underline">
          + Add More Flowers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#FCE7F0] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
            >
              <div className="flex items-center gap-4">
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-[#FCE7F0] shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-sm text-[#5C2533]">{item.title}</h3>
                  
                  {/* Customisation Details */}
                  {item.customisationDetails && (
                    <div className="text-[11px] text-[#8C5263] bg-[#FFF9FA] p-2 rounded-xl border border-[#FCE7F0] space-y-0.5">
                      {item.customisationDetails.colour && <p>Colour: <strong>{item.customisationDetails.colour}</strong></p>}
                      {item.customisationDetails.wrapping && <p>Wrap: {item.customisationDetails.wrapping}</p>}
                      {item.customisationDetails.ribbon && <p>Ribbon: {item.customisationDetails.ribbon}</p>}
                      {item.customisationDetails.cardMessage && <p className="italic">"{item.customisationDetails.cardMessage}"</p>}
                    </div>
                  )}

                  <p className="text-xs font-bold text-[#5C2533]">₹{item.price} each</p>
                </div>
              </div>

              {/* Quantity & Delete */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-0 border-[#FCE7F0]">
                <div className="flex items-center border border-[#FCE7F0] rounded-full bg-[#FFF9FA]">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 text-xs font-bold text-[#5C2533] hover:bg-[#FCE7F0] rounded-l-full"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-[#5C2533]">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 text-xs font-bold text-[#5C2533] hover:bg-[#FCE7F0] rounded-r-full"
                  >
                    +
                  </button>
                </div>

                <span className="font-bold text-sm text-[#5C2533]">
                  ₹{item.price * item.quantity}
                </span>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-[#8C5263] hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Order Summary & Coupon Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FFF9FA] border-2 border-[#FCE7F0] rounded-3xl p-6 space-y-5 shadow-xs">
            
            <h3 className="font-serif font-bold text-base text-[#5C2533] border-b border-[#FCE7F0] pb-3">
              Order Summary
            </h3>

            {/* Pincode Servicability Checker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5C2533]">Check Delivery Pincode:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560001"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  className="w-full bg-white border border-[#FCE7F0] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
                <button
                  onClick={() => checkPincode(pincodeInput)}
                  className="px-4 py-2 bg-[#5C2533] text-white text-xs font-bold rounded-xl hover:bg-[#3D1822] shrink-0"
                >
                  Check
                </button>
              </div>
              {isServicable !== null && (
                <p className={`text-[11px] font-semibold mt-1 ${isServicable ? 'text-[#25D366]' : 'text-red-500'}`}>
                  {isServicable ? '✓ Great news! Standard & Same-day delivery available for this pincode.' : 'x Delivery currently unavailable for this pincode. Try pickup!'}
                </p>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1.5 pt-2 border-t border-[#FCE7F0]">
              <label className="block text-xs font-bold text-[#5C2533] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#B76E79]" />
                <span>Have a Promo Code?</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#E8F8EE] border border-[#25D366]/30 p-2.5 rounded-xl text-xs text-[#1E7238]">
                  <span className="font-bold">{appliedCoupon.code} Applied ({appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`} OFF)</span>
                  <button onClick={removeCoupon} className="text-red-500 font-bold hover:underline text-[11px]">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter FLORA10 / WELCOME10"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="w-full bg-white border border-[#FCE7F0] rounded-xl px-3 py-2 text-xs uppercase focus:outline-none"
                  />
                  <button
                    onClick={() => applyCoupon(couponCodeInput)}
                    className="px-4 py-2 bg-[#B76E79] text-white text-xs font-bold rounded-xl hover:bg-[#9E5762] shrink-0"
                  >
                    Apply
                  </button>
                </div>
              )}

              {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-[#25D366] font-semibold">{couponSuccess}</p>}
            </div>

            {/* Financial Totals */}
            <div className="space-y-2 text-xs text-[#5E5254] border-t border-[#FCE7F0] pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-[#5C2533]">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#25D366]">
                  <span>Coupon Discount:</span>
                  <span className="font-semibold">-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping:</span>
                <span className="font-semibold text-[#5C2533]">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="border-t border-[#FCE7F0] pt-3 flex justify-between text-base font-bold text-[#5C2533] font-serif">
                <span>Grand Total:</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-[#B76E79] text-white font-bold rounded-full hover:bg-[#9E5762] transition-colors uppercase tracking-wider text-xs shadow-md flex items-center justify-center gap-2"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
