import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  couponCodeInput: string;
  setCouponCodeInput: (code: string) => void;
  couponError: string;
  couponSuccess: string;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  pincodeInput: string;
  setPincodeInput: (pin: string) => void;
  isServicable: boolean | null;
  checkPincode: (pin: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('flora7_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('flora7_applied_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [pincodeInput, setPincodeInput] = useState('560001');
  const [isServicable, setIsServicable] = useState<boolean | null>(true);

  useEffect(() => {
    localStorage.setItem('flora7_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('flora7_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('flora7_applied_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === newItem.productId && JSON.stringify(i.customisationDetails) === JSON.stringify(newItem.customisationDetails)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }

      return [...prev, { ...newItem, id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('flora7_cart');
    localStorage.removeItem('flora7_applied_coupon');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery fee logic: Standard local delivery is ₹40
  const deliveryFee = subtotal === 0 ? 0 : 40;

  let discountAmount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscountAmount && discountAmount > appliedCoupon.maxDiscountAmount) {
        discountAmount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError('');
    setCouponSuccess('');

    if (!code.trim()) {
      setCouponError('Please enter a coupon code.');
      return false;
    }

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      const coupons: Coupon[] = await res.json();

      if (coupons && coupons.length > 0) {
        const found = coupons[0];
        if (!found.active) {
          setCouponError('This coupon is currently inactive.');
          return false;
        }

        if (subtotal < found.minOrderValue) {
          setCouponError(`Minimum order value of ₹${found.minOrderValue} required for this coupon.`);
          return false;
        }

        setAppliedCoupon(found);
        setCouponSuccess(`Coupon '${found.code}' applied successfully!`);
        return true;
      } else {
        setCouponError('Invalid coupon code.');
        return false;
      }
    } catch {
      setCouponError('Error verifying coupon.');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('Coupon removed.');
  };

  const checkPincode = async (pin: string) => {
    if (!pin || pin.length < 6) {
      setIsServicable(false);
      return;
    }

    try {
      const res = await fetch(`/api/delivery-areas?pincode=${pin}`);
      const areas = await res.json();
      if (areas && areas.length > 0) {
        setIsServicable(true);
      } else {
        // Standard Bangalore fallback pincodes starting with 56
        setIsServicable(pin.startsWith('56'));
      }
    } catch {
      setIsServicable(pin.startsWith('56'));
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFee,
        discountAmount,
        grandTotal,
        appliedCoupon,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
