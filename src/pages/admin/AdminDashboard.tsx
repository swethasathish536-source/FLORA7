import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Package, Tag, DollarSign, AlertTriangle, Plus, Trash2, Edit,
  Printer, CheckCircle2, XCircle, Clock, Sparkles, LogOut, ArrowUpRight, TrendingUp, RefreshCw,
  Search, Image as ImageIcon, Check, Filter, Star, Mail, Send, Bell, Volume2, VolumeX, Eye, EyeOff,
  Lock, KeyRound, ShieldCheck, Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order, Product, InventoryItem, Coupon, Expense, OfflineBooking, OwnerNotificationAlert } from '../../types';
import { InvoiceModal } from '../../components/InvoiceModal';
import { ProductEditModal } from '../../components/admin/ProductEditModal';
import { NotificationAlertsDropdown } from '../../components/admin/NotificationAlertsDropdown';
import { EmailLogsAndSettings } from '../../components/admin/EmailLogsAndSettings';
import { OfflineBookingManager } from '../../components/admin/OfflineBookingManager';
import { SafeImage } from '../../components/SafeImage';

export const AdminDashboard: React.FC = () => {
  const { isAuthenticated, logout, token, adminUser, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'inventory' | 'coupons' | 'finance' | 'bookings' | 'email-alerts' | 'login-security'>('overview');

  // Login & Password Security States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordFeedback, setChangePasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bookings, setBookings] = useState<OfflineBooking[]>([]);
  const [alerts, setAlerts] = useState<OwnerNotificationAlert[]>([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [newOrderToast, setNewOrderToast] = useState<{ title: string; message: string; orderId?: string } | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);

  const prevOrdersCountRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected Order for Invoice
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Modals / Form states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [productNotification, setProductNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Orders Tab Filters
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Expense form
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Raw Materials');

  // Coupon form
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState('');
  const [couponType, setCouponType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');

  // Synthesized Web Audio Chime for incoming orders
  const playOrderChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch {
      // Audio context may be restricted before user gesture
    }
  };

  const ALLOWED_OWNER_EMAILS = [
    'flora7loveunfolded@gmail.com'
  ];

  useEffect(() => {
    const isOwner = adminUser && ALLOWED_OWNER_EMAILS.includes(adminUser.email.toLowerCase());
    if (!isAuthenticated || !token || !adminUser || adminUser.role !== 'OWNER' || !isOwner) {
      navigate('/admin/login', { replace: true });
      return;
    }

    fetchAllAdminData();
    fetchAlerts();

    // Real-time polling every 8 seconds for live alerts and orders
    const interval = setInterval(() => {
      fetchAlerts(true);
      fetchOrdersOnly();
    }, 8000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token, adminUser, navigate]);

  const fetchAlerts = async (isBackground = false) => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        const unread = data.unreadCount || 0;
        setUnreadAlertsCount(unread);

        if (isBackground && unread > 0) {
          const newest = data.alerts && data.alerts[0];
          if (newest && !newest.read) {
            playOrderChime();
          }
        }
      }
    } catch {
      // Silent error on poll
    }
  };

  const fetchOrdersOnly = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          if (prevOrdersCountRef.current !== null && data.length > prevOrdersCountRef.current) {
            playOrderChime();
            const latestOrder = data[0];
            setNewOrderToast({
              title: `🌸 New Order Received! (${latestOrder.orderNumber})`,
              message: `₹${latestOrder.totalAmount} from ${latestOrder.customerName}`,
              orderId: latestOrder.orderNumber
            });
            setTimeout(() => setNewOrderToast(null), 8000);
          }
          prevOrdersCountRef.current = data.length;
          setOrders(data);
        }
      }
    } catch {
      // Silent poll
    }
  };

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resOrders, resProds, resInv, resCoup, resExp, resBook] = await Promise.all([
        fetch('/api/orders', { headers }).then(async r => {
          if (!r.ok) return [];
          const data = await r.json();
          return Array.isArray(data) ? data : [];
        }).catch(() => []),
        fetch('/api/products').then(async r => {
          if (!r.ok) return [];
          const data = await r.json();
          return Array.isArray(data) ? data : [];
        }).catch(() => []),
        fetch('/api/inventory', { headers }).then(async r => {
          if (!r.ok) return [];
          const data = await r.json();
          return Array.isArray(data) ? data : [];
        }).catch(() => []),
        fetch('/api/coupons').then(async r => {
          if (!r.ok) return [];
          const data = await r.json();
          return Array.isArray(data) ? data : [];
        }).catch(() => []),
        fetch('/api/expenses', { headers }).then(async r => {
          if (!r.ok) return [];
          const data = await r.json();
          return Array.isArray(data) ? data : [];
        }).catch(() => []),
        fetch('/api/bookings', { headers }).then(async r => {
          if (!r.ok) return [];
          const data = await r.json();
          return Array.isArray(data) ? data : [];
        }).catch(() => [])
      ]);

      const ordersArr = Array.isArray(resOrders) ? resOrders : [];
      prevOrdersCountRef.current = ordersArr.length;
      setOrders(ordersArr);
      setProducts(Array.isArray(resProds) ? resProds : []);
      setInventory(Array.isArray(resInv) ? resInv : []);
      setCoupons(Array.isArray(resCoup) ? resCoup : []);
      setExpenses(Array.isArray(resExp) ? resExp : []);
      setBookings(Array.isArray(resBook) ? resBook : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAlertsRead = async () => {
    try {
      await fetch('/api/notifications/alerts/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAlerts = async () => {
    try {
      await fetch('/api/notifications/alerts', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts([]);
      setUnreadAlertsCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResendOrderEmail = async (order: Order, target: 'OWNER' | 'CUSTOMER') => {
    setResendingEmailId(`${order.id}-${target}`);
    try {
      const res = await fetch(`/api/orders/${order.id}/resend-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ target })
      });

      const data = await res.json();
      if (res.ok) {
        setProductNotification({
          type: 'success',
          message: target === 'OWNER'
            ? `Order alert email sent to Owner notification inbox!`
            : `Order confirmation receipt emailed to ${order.customerEmail || order.customerName}!`
        });
        setTimeout(() => setProductNotification(null), 4000);
      } else {
        alert(data.error || 'Failed to dispatch email');
      }
    } catch (err: any) {
      alert(err.message || 'Error dispatching email');
    } finally {
      setResendingEmailId(null);
    }
  };

  // Calculations
  const totalSales = orders
    .filter(o => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  const lowStockItems = inventory.filter(i => i.currentStock <= i.reorderLevel);

  // Status updates
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    fetchAllAdminData();
    fetchAlerts();
  };

  // Payment Method & Paid/Unpaid Status Updates
  const handleOrderPaymentUpdate = async (
    orderId: string,
    updates: { paymentMethod?: string; paymentStatus?: string }
  ) => {
    // Optimistic local update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...(updates as any) } : o))
    );

    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        setProductNotification({
          type: 'success',
          message: `Order payment updated: ${updates.paymentMethod ? `Method: ${updates.paymentMethod}` : ''} ${updates.paymentStatus ? `Status: ${updates.paymentStatus}` : ''}`
        });
        setTimeout(() => setProductNotification(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update payment');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating payment');
    }
    fetchAllAdminData();
  };

  // Inventory Stock Update
  const handleInventoryUpdate = async (itemId: string, newStock: number) => {
    await fetch(`/api/inventory/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentStock: newStock })
    });
    fetchAllAdminData();
  };

  // Product Management Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    const isEdit = Boolean(editingProduct?.id);
    const url = isEdit ? `/api/products/${editingProduct?.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to save product');
    }

    setProductNotification({
      type: 'success',
      message: isEdit
        ? `"${productData.name}" and its photos updated successfully!`
        : `New product "${productData.name}" created successfully!`
    });
    setTimeout(() => setProductNotification(null), 4000);

    await fetchAllAdminData();
  };

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProductId(productId);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete product');
      }

      setProductNotification({
        type: 'success',
        message: 'Product removed from catalog successfully.'
      });
      setTimeout(() => setProductNotification(null), 4000);

      setDeleteConfirmProduct(null);
      await fetchAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setDeletingProductId(null);
    }
  };

  // Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: expenseTitle,
        amount: Number(expenseAmount),
        category: expenseCategory,
        date: new Date().toISOString().split('T')[0]
      })
    });

    setExpenseTitle('');
    setExpenseAmount('');
    fetchAllAdminData();
  };

  // Add Coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponValue) return;

    await fetch('/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        code: couponCode.toUpperCase(),
        discountType: couponType,
        discountValue: Number(couponValue),
        minOrderValue: 200,
        active: true,
        description: `${couponType === 'PERCENTAGE' ? `${couponValue}%` : `₹${couponValue}`} discount on orders`
      })
    });

    setCouponCode('');
    setCouponValue('');
    fetchAllAdminData();
  };

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordFeedback(null);
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      setChangePasswordFeedback({ type: 'error', message: 'Please fill out all password fields.' });
      return;
    }
    if (newPasswordInput.length < 6) {
      setChangePasswordFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setChangePasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPasswordInput.trim(),
          newPassword: newPasswordInput.trim()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setChangePasswordFeedback({ type: 'success', message: 'Owner password updated successfully! Please use your new password next time.' });
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        setChangePasswordFeedback({ type: 'error', message: data.error || 'Failed to update password. Current password may be incorrect.' });
      }
    } catch {
      setChangePasswordFeedback({ type: 'error', message: 'Network error communicating with server.' });
    } finally {
      setChangePasswordLoading(false);
    }
  };

  if (!isAuthenticated || !token || !adminUser || adminUser.role !== 'OWNER' || !ALLOWED_OWNER_EMAILS.includes(adminUser.email.toLowerCase())) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Admin Header */}
      <div className="bg-[#5C2533] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F4B8C7] bg-white/10 px-3 py-1 rounded-full">
              Flora7 Owner Portal
            </span>
            <span className="text-[10px] font-mono text-white/90 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              👑 flora7loveunfolded@gmail.com
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mt-2">
            Flora7 Business Dashboard
          </h1>
          <p className="text-xs text-[#FCE7F0]/80 mt-1">
            Store Owner: flora7loveunfolded@gmail.com • Real-time tracking of sales, orders, email notifications, inventory & finances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Direct Login & Password Option button */}
          <button
            onClick={() => setActiveTab('login-security')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-xs ${
              activeTab === 'login-security'
                ? 'bg-[#F4B8C7] text-[#5C2533] ring-2 ring-white'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
            title="View & Manage Owner Login ID & Password"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#F4B8C7]" />
            <span>Login & Password Option</span>
          </button>

          {/* Notification Alerts Bell with Unread Badge */}
          <NotificationAlertsDropdown
            alerts={alerts}
            unreadCount={unreadAlertsCount}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onMarkAllRead={handleMarkAlertsRead}
            onClearAlerts={handleClearAlerts}
            onSelectOrder={(orderId) => {
              setActiveTab('orders');
              setOrderSearchQuery(orderId);
            }}
          />

          <button
            onClick={() => {
              fetchAllAdminData();
              fetchAlerts();
            }}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="Refresh Data & Alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={logout}
            className="px-5 py-2.5 bg-[#B76E79] hover:bg-[#9E5762] text-white text-xs font-bold rounded-full transition-colors flex items-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Real-time Order Alert Toast Banner */}
      {newOrderToast && (
        <div className="bg-gradient-to-r from-[#5C2533] via-[#B76E79] to-[#5C2533] text-white p-4 rounded-3xl shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 border border-white/20">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-base animate-bounce">
              🛍️
            </span>
            <div>
              <p className="font-serif font-bold text-sm">{newOrderToast.title}</p>
              <p className="text-xs text-[#FCE7F0]/90">{newOrderToast.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {newOrderToast.orderId && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  setOrderSearchQuery(newOrderToast.orderId || '');
                  setNewOrderToast(null);
                }}
                className="px-4 py-2 bg-white text-[#5C2533] font-bold text-xs rounded-full hover:bg-[#FCE7F0] transition-colors shadow-xs"
              >
                View Order
              </button>
            )}
            <button
              type="button"
              onClick={() => setNewOrderToast(null)}
              className="p-1.5 hover:bg-white/20 rounded-full text-white/80 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#FCE7F0]">
        {[
          { id: 'overview', label: 'Overview Analytics' },
          { id: 'orders', label: `Orders (${orders.length})` },
          { id: 'email-alerts', label: `Email & Alerts ${unreadAlertsCount > 0 ? `(${unreadAlertsCount})` : ''}` },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'inventory', label: `Inventory (${inventory.length})` },
          { id: 'finance', label: 'Finance & Profit' },
          { id: 'coupons', label: `Coupons (${coupons.length})` },
          { id: 'bookings', label: `Offline Bookings (${bookings.length})` },
          { id: 'login-security', label: '🔑 Login & Password' },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setActiveTab(tb.id as any)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              activeTab === tb.id
                ? 'bg-[#B76E79] text-white shadow-xs'
                : 'bg-[#FFF9FA] text-[#5C2533] border border-[#FCE7F0] hover:bg-[#FCE7F0]'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-3xl p-4 flex items-center justify-between text-xs gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Low Stock Material Alert ({lowStockItems.length} items): </span>
              <span>{lowStockItems.map(i => `${i.materialName} (${i.currentStock} ${i.unit})`).join(', ')}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3.5 py-1.5 bg-amber-600 text-white font-bold rounded-full text-[11px] shrink-0"
          >
            Manage Stock
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#FCE7F0] space-y-2 shadow-2xs">
              <span className="text-xs text-[#8C5263] font-semibold">Total Revenue Sales</span>
              <div className="text-3xl font-bold font-serif text-[#5C2533]">₹{totalSales}</div>
              <span className="text-[10px] text-[#25D366] font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{orders.length} Total Orders</span>
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#FCE7F0] space-y-2 shadow-2xs">
              <span className="text-xs text-[#8C5263] font-semibold">Business Expenses</span>
              <div className="text-3xl font-bold font-serif text-[#5C2533]">₹{totalExpenses}</div>
              <span className="text-[10px] text-[#8C5263]">{expenses.length} expense entries</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#FCE7F0] space-y-2 shadow-2xs">
              <span className="text-xs text-[#8C5263] font-semibold">Calculated Net Profit</span>
              <div className={`text-3xl font-bold font-serif ${netProfit >= 0 ? 'text-[#25D366]' : 'text-red-500'}`}>
                ₹{netProfit}
              </div>
              <span className="text-[10px] text-[#8C5263]">Revenue minus Expenses</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#FCE7F0] space-y-2 shadow-2xs">
              <span className="text-xs text-[#8C5263] font-semibold">Active Products</span>
              <div className="text-3xl font-bold font-serif text-[#5C2533]">{products.length}</div>
              <span className="text-[10px] text-[#B76E79] font-bold">{lowStockItems.length} Low Stock Materials</span>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-[#5C2533] border-b border-[#FCE7F0] pb-2">
              Recent Customer Orders
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#FCE7F0] text-[#8C5263] uppercase text-[10px]">
                    <th className="py-2.5">Order ID</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FCE7F0]/60 text-[#5C2533]">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id}>
                      <td className="py-3 font-mono font-bold text-[#B76E79]">{ord.orderNumber}</td>
                      <td className="py-3">{ord.customerName} ({ord.customerPhone})</td>
                      <td className="py-3 font-bold">₹{ord.totalAmount}</td>
                      <td className="py-3">{ord.deliveryDate}</td>
                      <td className="py-3">
                        <span className="bg-[#FFF9FA] border border-[#FCE7F0] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                          {(ord.orderStatus || (ord as any).status || 'RECEIVED').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedInvoiceOrder(ord)}
                          className="px-3 py-1 bg-[#FFF9FA] border border-[#FCE7F0] rounded-full text-[11px] font-bold text-[#5C2533]"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Header & Quick stats */}
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#5C2533]">
                Customer Orders ({orders.length} Total)
              </h2>
              <p className="text-xs text-[#8C5263] mt-0.5">
                Track, process, prepare, and update status for all online orders & offline bookings in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllAdminData}
                className="px-4 py-2 bg-[#FFF9FA] hover:bg-[#FCE7F0] border border-[#FCE7F0] text-[#5C2533] font-bold rounded-full text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Orders</span>
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search orders by Order #, Customer Name, Phone, or City..."
                className="w-full bg-white border border-[#FCE7F0] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
              />
              {orderSearchQuery && (
                <button
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-white border border-[#FCE7F0] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
              >
                <option value="ALL">All Statuses ({orders.length})</option>
                <option value="RECEIVED">Received ({orders.filter(o => o.orderStatus === 'RECEIVED').length})</option>
                <option value="PREPARING">Preparing ({orders.filter(o => o.orderStatus === 'PREPARING').length})</option>
                <option value="READY_FOR_DISPATCH">Ready for Dispatch ({orders.filter(o => o.orderStatus === 'READY_FOR_DISPATCH').length})</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery ({orders.filter(o => o.orderStatus === 'OUT_FOR_DELIVERY').length})</option>
                <option value="DELIVERED">Delivered ({orders.filter(o => o.orderStatus === 'DELIVERED').length})</option>
                <option value="CANCELLED">Cancelled ({orders.filter(o => o.orderStatus === 'CANCELLED').length})</option>
              </select>
            </div>
          </div>

          {/* Orders Table Container */}
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 shadow-sm space-y-4">
            {orders.filter(ord => {
              const q = orderSearchQuery.toLowerCase().trim();
              const matchesSearch =
                q === '' ||
                ord.orderNumber.toLowerCase().includes(q) ||
                ord.customerName.toLowerCase().includes(q) ||
                ord.customerPhone.toLowerCase().includes(q) ||
                (ord.shippingAddress && ord.shippingAddress.toLowerCase().includes(q)) ||
                (ord.customerEmail && ord.customerEmail.toLowerCase().includes(q));
              const matchesStatus = orderStatusFilter === 'ALL' || ord.orderStatus === orderStatusFilter;
              return matchesSearch && matchesStatus;
            }).length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <Package className="w-12 h-12 text-[#B76E79]/40 mx-auto" />
                <h3 className="font-serif font-bold text-base text-[#5C2533]">
                  {orders.length === 0 ? 'No Orders Placed Yet' : 'No Matching Orders'}
                </h3>
                <p className="text-xs text-[#8C5263] max-w-md mx-auto leading-relaxed">
                  {orders.length === 0
                    ? 'When customers purchase satin bouquets via the storefront, customized bouquets, or place orders via UPI/Card, they will immediately show up here.'
                    : `No orders match your search "${orderSearchQuery}" with status filter "${orderStatusFilter}".`}
                </p>
                {orderSearchQuery && (
                  <button
                    onClick={() => { setOrderSearchQuery(''); setOrderStatusFilter('ALL'); }}
                    className="px-4 py-2 bg-[#B76E79] text-white font-bold rounded-full text-xs"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#FCE7F0] text-[#8C5263] uppercase text-[10px]">
                      <th className="py-3 px-2">Order ID & Date</th>
                      <th className="py-3 px-2">Customer & Contact</th>
                      <th className="py-3 px-2">Bouquets & Items</th>
                      <th className="py-3 px-2">Total Amount</th>
                      <th className="py-3 px-2">Payment</th>
                      <th className="py-3 px-2">Order Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FCE7F0]/60 text-[#5C2533]">
                    {orders
                      .filter(ord => {
                        const q = orderSearchQuery.toLowerCase().trim();
                        const matchesSearch =
                          q === '' ||
                          ord.orderNumber.toLowerCase().includes(q) ||
                          ord.customerName.toLowerCase().includes(q) ||
                          ord.customerPhone.toLowerCase().includes(q) ||
                          (ord.shippingAddress && ord.shippingAddress.toLowerCase().includes(q)) ||
                          (ord.customerEmail && ord.customerEmail.toLowerCase().includes(q));
                        const matchesStatus = orderStatusFilter === 'ALL' || ord.orderStatus === orderStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FFF9FA]/50 transition-colors">
                          <td className="py-4 px-2 font-mono font-bold text-[#B76E79] align-top">
                            <span className="block">{ord.orderNumber}</span>
                            <span className="text-[10px] font-sans text-[#8C5263] font-normal block mt-0.5">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-2 align-top space-y-0.5 max-w-xs">
                            <p className="font-bold text-[#5C2533]">{ord.customerName}</p>
                            <p className="text-[#8C5263] text-[11px] font-mono">{ord.customerPhone}</p>
                            {ord.customerEmail && (
                              <p className="text-[10px] text-[#8C5263] truncate">{ord.customerEmail}</p>
                            )}
                            <p className="text-[11px] text-[#5C2533]/80 line-clamp-2 mt-1">
                              📍 {ord.shippingAddress || 'Storefront Pickup'}
                            </p>
                          </td>
                          <td className="py-4 px-2 align-top">
                            <ul className="space-y-1">
                              {ord.items.map((it, idx) => (
                                <li key={idx} className="text-[11px] bg-[#FFF9FA] border border-[#FCE7F0] px-2.5 py-1 rounded-lg">
                                  <span className="font-bold text-[#B76E79]">{it.quantity}x</span>{' '}
                                  <span className="font-medium text-[#5C2533]">{it.title}</span>{' '}
                                  <span className="text-[10px] text-[#8C5263]">(₹{it.price})</span>
                                </li>
                              ))}
                            </ul>
                            {ord.giftMessage && (
                              <div className="mt-1.5 p-1.5 bg-amber-50 border border-amber-200 rounded-md text-[10px] text-amber-900">
                                💌 <strong>Gift Message:</strong> {ord.giftMessage}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-2 font-bold align-top">
                            <span className="text-sm text-[#5C2533]">₹{ord.totalAmount}</span>
                            {ord.discountAmount && ord.discountAmount > 0 ? (
                              <span className="block text-[10px] text-emerald-600 font-semibold">
                                -₹{ord.discountAmount} ({ord.couponCode || 'Coupon'})
                              </span>
                            ) : null}
                          </td>
                          <td className="py-4 px-2 align-top space-y-1.5 min-w-[150px]">
                            {/* Payment Status Dropdown */}
                            <div>
                              <label className="text-[9px] uppercase tracking-wider text-[#8C5263] font-semibold block mb-0.5">
                                Status
                              </label>
                              <select
                                value={ord.paymentStatus || 'PENDING'}
                                onChange={(e) => handleOrderPaymentUpdate(ord.id, { paymentStatus: e.target.value })}
                                className={`w-full text-[11px] font-bold py-1 px-2 rounded-lg border cursor-pointer focus:outline-hidden transition-colors ${
                                  ord.paymentStatus === 'PAID'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                    : ord.paymentStatus === 'UNPAID'
                                    ? 'bg-red-50 border-red-300 text-red-800'
                                    : 'bg-amber-50 border-amber-300 text-amber-800'
                                }`}
                              >
                                <option value="PAID">✓ PAID</option>
                                <option value="UNPAID">✕ UNPAID</option>
                                <option value="PENDING">⏳ PENDING</option>
                                <option value="PARTIAL">½ PARTIAL</option>
                                <option value="REFUNDED">↩ REFUNDED</option>
                                <option value="FAILED">⚠ FAILED</option>
                              </select>
                            </div>

                            {/* Payment Method Dropdown */}
                            <div>
                              <label className="text-[9px] uppercase tracking-wider text-[#8C5263] font-semibold block mb-0.5">
                                Method
                              </label>
                              <select
                                value={ord.paymentMethod || 'UPI'}
                                onChange={(e) => handleOrderPaymentUpdate(ord.id, { paymentMethod: e.target.value })}
                                className="w-full text-[11px] font-semibold py-1 px-2 rounded-lg border border-[#FCE7F0] bg-[#FFF9FA] text-[#5C2533] cursor-pointer focus:outline-hidden focus:border-[#B76E79]"
                              >
                                <option value="UPI">📱 UPI (GPay/PhonePe)</option>
                                <option value="COD">💵 COD (Cash on Delivery)</option>
                                <option value="CASH">👛 CASH (In Hand)</option>
                                <option value="ONLINE">🌐 ONLINE (Gateway)</option>
                                <option value="CARD">💳 CARD (Credit/Debit)</option>
                                <option value="PAY_AT_PICKUP">🏬 PAY AT PICKUP</option>
                              </select>
                            </div>

                            {/* Quick 1-Click Toggle */}
                            <button
                              type="button"
                              onClick={() =>
                                handleOrderPaymentUpdate(ord.id, {
                                  paymentStatus: ord.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID',
                                })
                              }
                              className={`w-full py-0.5 px-1.5 rounded-md text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 ${
                                ord.paymentStatus === 'PAID'
                                  ? 'bg-white hover:bg-red-50 text-red-600 border-red-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                              }`}
                            >
                              {ord.paymentStatus === 'PAID' ? 'Mark as UNPAID' : 'Mark as PAID ✓'}
                            </button>
                          </td>
                          <td className="py-4 px-2 align-top">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value)}
                              className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl p-1.5 text-xs text-[#5C2533] font-semibold focus:outline-hidden focus:border-[#B76E79]"
                            >
                              <option value="RECEIVED">RECEIVED</option>
                              <option value="PREPARING">PREPARING</option>
                              <option value="READY_FOR_DISPATCH">READY FOR DISPATCH</option>
                              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="py-4 px-2 text-right align-top space-y-1.5 min-w-[140px]">
                            <button
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              className="w-full px-3 py-1.5 bg-[#B76E79] hover:bg-[#9E5762] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Invoice</span>
                            </button>

                            <div className="flex flex-col gap-1 pt-1 border-t border-[#FCE7F0]">
                              <button
                                type="button"
                                onClick={() => handleResendOrderEmail(ord, 'OWNER')}
                                disabled={resendingEmailId === `${ord.id}-OWNER`}
                                className="w-full text-left px-2 py-1 bg-[#FFF9FA] hover:bg-[#FCE7F0] border border-[#FCE7F0] text-[#5C2533] rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                title="Send/Resend instant order alert email to owner notification email address"
                              >
                                <Mail className="w-3 h-3 text-[#B76E79]" />
                                <span>{resendingEmailId === `${ord.id}-OWNER` ? 'Alerting...' : 'Alert Owner'}</span>
                              </button>

                              {ord.customerEmail && (
                                <button
                                  type="button"
                                  onClick={() => handleResendOrderEmail(ord, 'CUSTOMER')}
                                  disabled={resendingEmailId === `${ord.id}-CUSTOMER`}
                                  className="w-full text-left px-2 py-1 bg-[#FFF9FA] hover:bg-[#FCE7F0] border border-[#FCE7F0] text-[#5C2533] rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                  title={`Send order confirmation to ${ord.customerEmail}`}
                                >
                                  <Send className="w-3 h-3 text-emerald-600" />
                                  <span>{resendingEmailId === `${ord.id}-CUSTOMER` ? 'Sending...' : 'Email Customer'}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB: EMAIL & OWNER ALERTS */}
      {activeTab === 'email-alerts' && (
        <div className="space-y-6">
          <EmailLogsAndSettings token={token} />
        </div>
      )}

      {/* Notification Toast */}
      {productNotification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in ${
          productNotification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300' : 'bg-red-50 text-red-800 border-2 border-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{productNotification.message}</span>
          </div>
          <button onClick={() => setProductNotification(null)} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
      )}

      {/* TAB 3: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          
          {/* Header & Actions Bar */}
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#5C2533]">
                Handmade Bouquet Catalogue ({products.length} items)
              </h2>
              <p className="text-xs text-[#8C5263] mt-0.5">
                Add, edit products, update pricing, customize ribbon/wrapping styles, and manage product photos.
              </p>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-6 py-3 bg-[#B76E79] hover:bg-[#9E5762] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD NEW PRODUCT</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Search products by title, ribbon color, or tag..."
                className="w-full bg-white border border-[#FCE7F0] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
              />
              {productSearchQuery && (
                <button
                  onClick={() => setProductSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="bg-white border border-[#FCE7F0] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
              >
                <option value="ALL">All Categories ({products.length})</option>
                <option value="single-rose">Single Rose</option>
                <option value="mini-bouquet">Mini Bouquet</option>
                <option value="premium-bouquet">Premium Bouquet</option>
                <option value="custom-bouquet">Custom Bouquet</option>
                <option value="gift-set">Gift Sets & Hampers</option>
                <option value="keychain">Keychains & Accents</option>
                <option value="festive">Festive Edition</option>
                <option value="limited">Limited Edition</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {products.filter(p => {
            const matchesSearch =
              productSearchQuery === '' ||
              p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
              p.slug.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
              (p.tags && p.tags.some(t => t.toLowerCase().includes(productSearchQuery.toLowerCase())));
            const matchesCategory =
              productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
            return matchesSearch && matchesCategory;
          }).length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#FCE7F0] p-12 text-center space-y-4 shadow-xs">
              <Package className="w-12 h-12 text-[#B76E79]/40 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#5C2533]">No Products Found</h3>
              <p className="text-xs text-[#8C5263]">
                {productSearchQuery
                  ? `No products matching "${productSearchQuery}". Try adjusting your search query.`
                  : 'Start adding satin ribbon bouquet products to your shop catalog.'}
              </p>
              <button
                onClick={handleOpenAddProduct}
                className="px-5 py-2.5 bg-[#B76E79] text-white font-bold rounded-full text-xs inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Product</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter(p => {
                  const matchesSearch =
                    productSearchQuery === '' ||
                    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                    p.slug.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                    (p.tags && p.tags.some(t => t.toLowerCase().includes(productSearchQuery.toLowerCase())));
                  const matchesCategory =
                    productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
                  return matchesSearch && matchesCategory;
                })
                .map((p) => {
                  const primaryImg = p.images && p.images.length > 0 ? p.images[0] : '/images/flora7-prod-1786682202966-kwoiv.jpeg';
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl border border-[#FCE7F0] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Header with Badges */}
                        <div className="relative aspect-4/3 bg-gray-50 overflow-hidden group">
                          <SafeImage
                            src={primaryImg}
                            alt={p.name}
                            category={p.category}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Photos count tag */}
                          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>{p.images ? p.images.length : 1} {p.images && p.images.length === 1 ? 'photo' : 'photos'}</span>
                          </span>

                          {/* Discount tag if any */}
                          {p.discountPercent && p.discountPercent > 0 ? (
                            <span className="absolute top-3 left-3 bg-[#B76E79] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                              {p.discountPercent}% OFF
                            </span>
                          ) : null}

                          {/* Stock status overlay pill */}
                          <div className="absolute bottom-3 left-3">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-xs ${
                                p.stockStatus === 'IN_STOCK'
                                  ? 'bg-emerald-500 text-white'
                                  : p.stockStatus === 'LOW_STOCK'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-gray-700 text-white'
                              }`}
                            >
                              {p.stockStatus === 'IN_STOCK' ? '● In Stock' : p.stockStatus === 'LOW_STOCK' ? '⚡ Low Stock' : '✕ Out of Stock'}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B76E79]">
                                {(p.category || 'bouquet').replace(/-/g, ' ')}
                              </span>
                              <h3 className="font-serif font-bold text-base text-[#5C2533] line-clamp-1">
                                {p.name}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-serif font-bold text-base text-[#5C2533]">
                                ₹{p.price}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <p className="text-[10px] text-gray-400 line-through">₹{p.originalPrice}</p>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-[#8C5263] line-clamp-2 leading-relaxed">
                            {p.shortDescription || p.description}
                          </p>

                          {/* Flower Count & Ribbon info */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="bg-[#FFF9FA] border border-[#FCE7F0] text-[10px] font-semibold text-[#5C2533] px-2 py-0.5 rounded-md">
                              🌹 {p.numberOfFlowers || 7} Roses
                            </span>
                            {p.availableColours && p.availableColours[0] && (
                              <span className="bg-[#FFF9FA] border border-[#FCE7F0] text-[10px] font-semibold text-[#5C2533] px-2 py-0.5 rounded-md line-clamp-1 max-w-[140px]">
                                🎨 {p.availableColours[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 bg-[#FFF9FA] border-t border-[#FCE7F0] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="flex-1 py-2 px-3 bg-white hover:bg-[#FCE7F0] border border-[#B76E79] text-[#B76E79] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit & Photos</span>
                        </button>

                        <button
                          onClick={() => setDeleteConfirmProduct(p)}
                          className="p-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-xl transition-colors shrink-0 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

        </div>
      )}

      {/* TAB 4: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 space-y-4 shadow-sm">
          <h2 className="font-serif font-bold text-lg text-[#5C2533]">Ribbon & Material Inventory Tracker</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((inv) => (
              <div
                key={inv.id}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  inv.currentStock <= inv.reorderLevel ? 'bg-amber-50 border-amber-300' : 'bg-[#FFF9FA] border-[#FCE7F0]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#5C2533] font-serif">{inv.materialName}</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border">{inv.category}</span>
                </div>

                <p className="text-[#8C5263]">Color/Type: {inv.colorOrType}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold">Stock: {inv.currentStock} {inv.unit}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleInventoryUpdate(inv.id, Math.max(0, inv.currentStock - 5))}
                      className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleInventoryUpdate(inv.id, inv.currentStock + 10)}
                      className="px-2 py-1 bg-[#B76E79] text-white rounded-lg text-xs font-bold"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FINANCE & EXPENSES */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 text-center space-y-2">
              <span className="text-xs text-[#8C5263]">Total Orders Revenue</span>
              <p className="text-3xl font-bold font-serif text-[#5C2533]">₹{totalSales}</p>
            </div>
            <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 text-center space-y-2">
              <span className="text-xs text-[#8C5263]">Total Expenses Recorded</span>
              <p className="text-3xl font-bold font-serif text-[#5C2533]">₹{totalExpenses}</p>
            </div>
            <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 text-center space-y-2">
              <span className="text-xs text-[#8C5263]">Net Business Profit</span>
              <p className={`text-3xl font-bold font-serif ${netProfit >= 0 ? 'text-[#25D366]' : 'text-red-500'}`}>
                ₹{netProfit}
              </p>
            </div>
          </div>

          {/* Record Expense Form */}
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-[#5C2533]">Record Business Expense</h3>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Expense description (e.g. Ribbon Rolls Purchase)"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
              />
              <input
                type="number"
                required
                placeholder="Amount (₹)"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
              />
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
              >
                <option value="Raw Materials">Raw Materials (Ribbons/Pearls)</option>
                <option value="Packaging">Packaging Supplies</option>
                <option value="Delivery Fee">Delivery Partner Charges</option>
                <option value="Marketing">Marketing / Ads</option>
                <option value="Other">Other Expenses</option>
              </select>
              <button
                type="submit"
                className="py-3 bg-[#B76E79] text-white font-bold rounded-2xl hover:bg-[#9E5762] uppercase tracking-wider"
              >
                ADD EXPENSE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-[#5C2533]">Create New Promo Coupon</h3>
            <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Coupon Code (e.g. LOVE20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 uppercase focus:outline-none"
              />
              <select
                value={couponType}
                onChange={(e) => setCouponType(e.target.value as any)}
                className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
              <input
                type="number"
                required
                placeholder="Value (e.g. 15)"
                value={couponValue}
                onChange={(e) => setCouponValue(e.target.value)}
                className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none"
              />
              <button
                type="submit"
                className="py-3 bg-[#B76E79] text-white font-bold rounded-2xl hover:bg-[#9E5762] uppercase tracking-wider"
              >
                SAVE COUPON
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-[#FCE7F0] p-4 text-xs space-y-1">
                <span className="font-mono font-bold text-base text-[#5C2533]">{c.code}</span>
                <p className="text-[#B76E79] font-bold">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: OFFLINE BOOKINGS & BESPOKE ORDERS */}
      {activeTab === 'bookings' && (
        <OfflineBookingManager
          bookings={bookings}
          onRefresh={fetchAllAdminData}
          token={token}
          onShowNotification={(type, message) => {
            setProductNotification({ type, message });
            setTimeout(() => setProductNotification(null), 4000);
          }}
        />
      )}

      {/* TAB 8: OWNER LOGIN & PASSWORD SECURITY OPTION */}
      {activeTab === 'login-security' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-[#FFF9FA] border border-[#F4B8C7] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#5C2533] text-[#F4B8C7] flex items-center justify-center shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B76E79] bg-white px-2.5 py-0.5 rounded-full border border-[#FCE7F0]">
                      Confidential Owner Credentials
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Active & Protected
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#5C2533] mt-1">
                    Store Owner Login & Password Option
                  </h2>
                  <p className="text-xs text-[#8C5263] mt-0.5">
                    Authorized login credentials configured exclusively for Flora7 Store Owner.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/admin/login');
                  }}
                  className="px-4 py-2 bg-[#5C2533] hover:bg-[#3D1822] text-white text-xs font-bold rounded-full transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#F4B8C7]" />
                  <span>Log Out to Login Screen</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Credentials & Password Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1: Official Credentials Display */}
            <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-serif font-bold text-[#5C2533] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#B76E79]" />
                  <span>Authorized Login Credentials</span>
                </h3>
                <p className="text-xs text-[#8C5263] mt-1">
                  Use these exact credentials to log into your Flora7 Owner Portal at <code className="bg-[#FFF9FA] px-1.5 py-0.5 rounded text-[#5C2533] border border-[#FCE7F0]">/admin/login</code>.
                </p>
              </div>

              {/* Login ID Row */}
              <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8C5263]">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Owner Login ID (Email)</span>
                  <span className="text-[10px] bg-[#5C2533] text-white px-2 py-0.5 rounded-full font-bold">PRIMARY</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#5C2533] break-all select-all">
                    flora7loveunfolded@gmail.com
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard('flora7loveunfolded@gmail.com', 'login-id')}
                    className="p-2 bg-white hover:bg-[#FCE7F0] text-[#5C2533] border border-[#FCE7F0] rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Copy Login ID"
                  >
                    {copiedField === 'login-id' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#B76E79]" />
                    )}
                    <span className="text-[10px] font-bold">{copiedField === 'login-id' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Password Row */}
              <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8C5263]">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Owner Portal Password</span>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-[10px] text-[#B76E79] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showCurrentPassword ? 'Hide Password' : 'Show Password'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#5C2533] tracking-wider select-all">
                    {showCurrentPassword ? '010807@f' : '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard('010807@f', 'password')}
                    className="p-2 bg-white hover:bg-[#FCE7F0] text-[#5C2533] border border-[#FCE7F0] rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedField === 'password' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#B76E79]" />
                    )}
                    <span className="text-[10px] font-bold">{copiedField === 'password' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Privacy & Restriction Rules */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-[#5C2533] uppercase tracking-wider">
                  Privacy & Customer Isolation
                </h4>
                <ul className="text-xs text-[#8C5263] space-y-2">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Customer Concealment:</strong> Login ID and password fields are strictly hidden from store customers. Customers cannot view credentials in order checkouts, invoices, or customer sign-in.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Single Owner Access:</strong> Access is granted exclusively to <strong>flora7loveunfolded@gmail.com</strong>. All other email accounts are barred from administrative privileges.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Excluded Personal Accounts:</strong> <code className="bg-red-50 text-red-700 px-1 py-0.5 rounded text-[11px]">swethasathish536@gmail.com</code> is removed from the portal and has zero access or owner display.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Change / Update Owner Password */}
            <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-serif font-bold text-[#5C2533] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#B76E79]" />
                  <span>Update Owner Password</span>
                </h3>
                <p className="text-xs text-[#8C5263] mt-1">
                  Change the password for <strong className="text-[#5C2533]">flora7loveunfolded@gmail.com</strong>. Passwords are saved with bcrypt hashing.
                </p>
              </div>

              {changePasswordFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                    changePasswordFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {changePasswordFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{changePasswordFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#5C2533] mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password (010807@f)"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 text-[#5C2533]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C2533] mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 text-[#5C2533]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C2533] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Re-type new password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 text-[#5C2533]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="w-full py-3 bg-[#B76E79] hover:bg-[#9E5762] text-white font-bold rounded-2xl uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
                >
                  {changePasswordLoading ? (
                    <span>Saving New Password...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update Password Now</span>
                    </>
                  )}
                </button>
              </form>

              <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-4 text-xs text-[#8C5263] space-y-1">
                <p className="font-bold text-[#5C2533]">Need to test your login?</p>
                <p>
                  Click <strong>Log Out to Login Screen</strong> above, or navigate to <code className="text-[#5C2533]">/admin/login</code> anytime to sign in with your login ID and password.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}

      {/* Product Edit / Add Modal */}
      {productModalOpen && (
        <ProductEditModal
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          product={editingProduct}
          onSave={handleSaveProduct}
          token={token}
        />
      )}

      {/* Delete Product Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-red-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#5C2533]">Delete Product</h3>
              <p className="text-xs text-[#8C5263]">
                Are you sure you want to permanently remove <strong className="text-[#5C2533]">"{deleteConfirmProduct.name}"</strong> from your store?
              </p>
            </div>

            {deleteConfirmProduct.images && deleteConfirmProduct.images[0] && (
              <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border border-[#FCE7F0]">
                <img
                  src={deleteConfirmProduct.images[0]}
                  alt={deleteConfirmProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                disabled={Boolean(deletingProductId)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(deleteConfirmProduct.id)}
                disabled={Boolean(deletingProductId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {deletingProductId ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
