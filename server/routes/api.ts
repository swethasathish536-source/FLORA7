import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { Coupon, Order, Product } from '../../src/types';
import {
  notifyNewOrder,
  notifyOrderStatusUpdate,
  notifyOfflineBooking,
  sendEmail,
  generateOwnerOrderEmailHtml,
  generateOwnerOrderEmailText,
  generateCustomerOrderEmailHtml
} from '../emailService';
import {
  chatWithFloraAssistant,
  generateCardMessages,
  isGeminiAvailable
} from '../geminiService';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'flora7_secret_jwt_key_2026_love_unfolded';

// Helper middleware to verify Admin / Owner Token
export const OWNER_EMAILS = [
  'flora7loveunfolded@gmail.com'
];

export const normalizeOwnerUsername = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim().toLowerCase();
  if (trimmed === 'flora7' || trimmed === 'flora7loveunfolded' || trimmed === 'admin') {
    return 'flora7loveunfolded@gmail.com';
  }
  return trimmed;
};

export const isOwnerEmail = (email?: string): boolean => {
  if (!email) return false;
  const clean = normalizeOwnerUsername(email);
  return OWNER_EMAILS.includes(clean);
};

export const requireAdmin = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Owner login required to access this portal.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'flora7_owner_default_verified_jwt_token') {
    return res.status(401).json({ error: 'Unauthorized: Please log in with owner credentials.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string; email: string; role: string; name?: string };
    if (!decoded.email || !isOwnerEmail(decoded.email) || decoded.role !== 'OWNER') {
      return res.status(403).json({ error: 'Access denied: Restricted to Flora7 Owner only.' });
    }
    (req as any).adminUser = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
};

// ==========================================
// 1. AUTHENTICATION & ADMIN
// ==========================================
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both login ID and password.' });
  }

  const cleanEmail = normalizeOwnerUsername(email);
  const trimmedPassword = (password || '').trim();

  // Validate owner identity: strictly OWNER_EMAILS only!
  if (!isOwnerEmail(cleanEmail)) {
    return res.status(401).json({
      error: 'Invalid login ID or password. Access is restricted to authorized store owner.'
    });
  }

  const ownerEmail = 'flora7loveunfolded@gmail.com';
  const admin = db.findAdminByEmail(ownerEmail);

  const isDirectPasswordMatch = 
    trimmedPassword === '010807@f' || 
    trimmedPassword === '010807@F' || 
    trimmedPassword.toLowerCase() === '010807@f' ||
    trimmedPassword === '010807f' || 
    trimmedPassword === '010807F';
  let isBcryptMatch = false;

  if (admin && admin.passwordHash) {
    try {
      isBcryptMatch = bcrypt.compareSync(trimmedPassword, admin.passwordHash);
    } catch {
      isBcryptMatch = false;
    }
  }

  if (!isDirectPasswordMatch && !isBcryptMatch) {
    return res.status(401).json({
      error: 'Invalid login ID or password. Access is restricted to authorized store owner.'
    });
  }

  const ownerName = 'Flora7 Owner';

  const token = jwt.sign(
    { adminId: admin?.id || 'admin-1', email: ownerEmail, name: ownerName, role: 'OWNER' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.json({
    message: 'Owner login successful',
    token,
    user: {
      id: admin?.id || 'admin-1',
      email: ownerEmail,
      name: ownerName,
      role: 'OWNER'
    }
  });
});

// Google OAuth verification for Customer login
router.post('/auth/google', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  // Customer session verified. Owner portal strictly requires login ID & password!
  return res.json({
    isOwner: false,
    message: 'Customer session verified'
  });
});

router.get('/auth/me', requireAdmin, (req: Request, res: Response) => {
  return res.json({ user: (req as any).adminUser });
});

router.post('/auth/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = (req as any).adminUser.adminId;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const admin = db.getAdmins().find(a => a.id === adminId) || db.getAdmins()[0];
  if (!admin) {
    return res.status(404).json({ error: 'Admin user not found.' });
  }

  const isDirectPasswordMatch = 
    currentPassword === '010807@f' || 
    currentPassword === '010807@F' || 
    currentPassword.toLowerCase() === '010807@f';
  let isMatch = isDirectPasswordMatch;
  if (!isMatch && admin.passwordHash) {
    try {
      isMatch = bcrypt.compareSync(currentPassword, admin.passwordHash);
    } catch {
      isMatch = false;
    }
  }

  if (!isMatch) {
    return res.status(400).json({ error: 'Current password incorrect.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);
  db.updateAdminPassword(admin.id, newHash);

  return res.json({ message: 'Password updated successfully.' });
});

// ==========================================
// 2. PRODUCTS & CATALOGUE
// ==========================================
router.get('/products', (req: Request, res: Response) => {
  const { category, search, occasion, sort, bestSeller, festive } = req.query;
  let products = [...db.getProducts()];

  if (category && typeof category === 'string' && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (occasion && typeof occasion === 'string' && occasion !== 'all') {
    products = products.filter(p => p.occasions.some(o => o.toLowerCase().includes(occasion.toLowerCase())));
  }

  if (bestSeller === 'true') {
    products = products.filter(p => p.isBestSeller);
  }

  if (festive === 'true') {
    products = products.filter(p => p.isFestive);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (sort === 'price-low-high') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high-low') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  }

  res.json(products);
});

router.get('/products/:id', (req: Request, res: Response) => {
  const product = db.getProducts().find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const newProduct = db.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

router.patch('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

router.delete('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted successfully' });
});

// ==========================================
// 3. CUSTOM BOUQUET OPTIONS
// ==========================================
router.get('/custom-options', (req: Request, res: Response) => {
  res.json(db.getCustomOptions());
});

router.put('/custom-options', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateCustomOptions(req.body);
  res.json(updated);
});

// ==========================================
// 4. COUPONS & PROMOTIONS
// ==========================================
router.get('/coupons', (req: Request, res: Response) => {
  res.json(db.getCoupons());
});

router.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, cartAmount, category } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code required' });

  const coupon = db.getCoupons().find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid coupon code.' });
  }

  if (!coupon.active) {
    return res.status(400).json({ error: 'This coupon is no longer active.' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (coupon.expiryDate < today) {
    return res.status(400).json({ error: 'This coupon code has expired.' });
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'Coupon usage limit reached.' });
  }

  if (cartAmount < coupon.minOrderValue) {
    return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minOrderValue} required for coupon ${coupon.code}.` });
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = Math.round((cartAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return res.json({
    valid: true,
    code: coupon.code,
    discountAmount: discount,
    description: coupon.description
  });
});

router.post('/coupons', requireAdmin, (req: Request, res: Response) => {
  const newCoupon = db.createCoupon(req.body);
  res.status(201).json(newCoupon);
});

router.put('/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coupon not found' });
  res.json(updated);
});

router.delete('/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteCoupon(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Coupon not found' });
  res.json({ message: 'Coupon deleted' });
});

// ==========================================
// 5. ONLINE ORDERS & BOOKING
// ==========================================
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const order = db.createOrder(req.body);
    
    // Automatically trigger Owner & Customer Email Notification and In-Portal Alert
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const appUrl = process.env.APP_URL || `${protocol}://${host}`;

    notifyNewOrder(order, appUrl).catch(err => {
      console.error('Error notifying new order:', err);
    });

    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/orders/track', (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Order ID or Phone number required' });
  }

  const q = query.trim().toUpperCase();
  const orders = db.getOrders().filter(o => 
    o.orderNumber.toUpperCase() === q || 
    o.customerPhone.includes(query.trim()) ||
    o.id === query.trim()
  );

  res.json(orders);
});

router.get('/orders', (req: Request, res: Response) => {
  const { phone, query, orderNumber } = req.query;
  const allOrders = db.getOrders();

  // If customer is querying by phone or order number
  if (phone || query || orderNumber) {
    const searchVal = String(phone || query || orderNumber).trim().toLowerCase();
    const filtered = allOrders.filter(o =>
      o.customerPhone.toLowerCase().includes(searchVal) ||
      o.orderNumber.toLowerCase().includes(searchVal) ||
      o.id.toLowerCase().includes(searchVal) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(searchVal))
    );
    return res.json(filtered);
  }

  // Otherwise, viewing the complete store order roster requires owner login
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Owner authorization required to view all orders.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    if (!decoded.email || !isOwnerEmail(decoded.email) || decoded.role !== 'OWNER') {
      return res.status(403).json({ error: 'Access denied: Restricted to Flora7 Owner.' });
    }
    return res.json(allOrders);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in as owner.' });
  }
});

router.put('/orders/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { orderStatus, paymentStatus, paymentMethod, status } = req.body;
  const updated = db.updateOrderStatus(req.params.id, orderStatus || status, paymentStatus, paymentMethod);
  if (!updated) return res.status(404).json({ error: 'Order not found' });

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const appUrl = `${protocol}://${host}`;
  if (orderStatus || status) {
    notifyOrderStatusUpdate(updated, appUrl).catch(err => console.error('Status update notify error:', err));
  }

  res.json(updated);
});

router.patch('/orders/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { orderStatus, paymentStatus, paymentMethod, status } = req.body;
  const updated = db.updateOrderStatus(req.params.id, orderStatus || status, paymentStatus, paymentMethod);
  if (!updated) return res.status(404).json({ error: 'Order not found' });

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const appUrl = `${protocol}://${host}`;
  if (orderStatus || status) {
    notifyOrderStatusUpdate(updated, appUrl).catch(err => console.error('Status update notify error:', err));
  }

  res.json(updated);
});

router.patch('/orders/:id/payment', requireAdmin, async (req: Request, res: Response) => {
  const { paymentMethod, paymentStatus } = req.body;
  const updated = db.updateOrder(req.params.id, { paymentMethod, paymentStatus });
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

router.patch('/orders/:id', requireAdmin, async (req: Request, res: Response) => {
  const updated = db.updateOrder(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

// Manual / Resend order email endpoint
router.post('/orders/:id/resend-email', requireAdmin, async (req: Request, res: Response) => {
  const { target = 'OWNER', customEmail } = req.body;
  const order = db.getOrders().find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const appUrl = `${protocol}://${host}`;

  try {
    if (target === 'CUSTOMER') {
      const recipient = customEmail || order.customerEmail;
      if (!recipient) return res.status(400).json({ error: 'No customer email address on this order' });

      const subject = `🌸 [Resent] Your Flora7 Order Confirmation - ${order.orderNumber}`;
      const html = generateCustomerOrderEmailHtml(order, appUrl);
      const text = `Order Confirmation for ${order.orderNumber}. Amount: ₹${order.totalAmount}`;
      const result = await sendEmail({
        to: recipient,
        subject,
        html,
        text,
        recipientType: 'CUSTOMER',
        orderId: order.id,
        orderNumber: order.orderNumber
      });
      return res.json({ message: 'Customer confirmation email sent', result });
    } else {
      const settings = db.getEmailSettings();
      const recipients = customEmail ? [customEmail] : Array.from(new Set([
        'flora7loveunfolded@gmail.com',
        ...(settings.ownerEmails || [])
      ])).filter(Boolean);
      const isDelivered = order.orderStatus === 'DELIVERED';
      const subject = isDelivered
        ? `🌸 [Delivered Order Details] ${order.orderNumber} - ${order.customerName} (₹${order.totalAmount})`
        : `🌸 [Order Details Alert] ${order.orderNumber} - ${order.customerName} (₹${order.totalAmount})`;
      const html = generateOwnerOrderEmailHtml(order, appUrl);
      const text = generateOwnerOrderEmailText(order, appUrl);
      const result = await sendEmail({
        to: recipients,
        subject,
        html,
        text,
        recipientType: 'OWNER',
        orderId: order.id,
        orderNumber: order.orderNumber
      });
      return res.json({ message: 'Owner alert email sent', result });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. OFFLINE BOOKING SYSTEM
// ==========================================
router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const booking = db.createOfflineBooking(req.body);

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const appUrl = `${protocol}://${host}`;
    notifyOfflineBooking(booking, appUrl).catch(err => console.error('Offline booking notify error:', err));

    res.status(201).json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/bookings', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getOfflineBookings());
});

router.put('/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateOfflineBooking(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Booking not found' });
  res.json(updated);
});

router.patch('/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateOfflineBooking(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Booking not found' });
  res.json(updated);
});

router.delete('/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteOfflineBooking(req.params.id);
  if (!success) return res.status(404).json({ error: 'Booking not found' });
  res.json({ success: true, message: 'Offline booking deleted successfully' });
});

// ==========================================
// 7. INVENTORY MANAGEMENT
// ==========================================
router.get('/inventory', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getInventory());
});

router.post('/inventory', requireAdmin, (req: Request, res: Response) => {
  const newItem = db.addInventoryItem(req.body);
  res.status(201).json(newItem);
});

router.put('/inventory/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateInventoryItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Inventory item not found' });
  res.json(updated);
});

router.patch('/inventory/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateInventoryItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Inventory item not found' });
  res.json(updated);
});

router.delete('/inventory/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteInventoryItem(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Inventory item not found' });
  res.json({ message: 'Deleted inventory item' });
});

// ==========================================
// 8. SALES, EXPENSES & OWNER ACCOUNTING
// ==========================================
router.get('/finance/summary', requireAdmin, (req: Request, res: Response) => {
  const orders = db.getOrders();
  const expenses = db.getExpenses();
  const ownerTxs = db.getOwnerTransactions();
  const inventory = db.getInventory();

  // Completed/paid orders
  const validOrders = orders.filter(o => o.orderStatus !== 'CANCELLED');
  const totalSales = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidSales = validOrders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingPayments = totalSales - paidSales;

  // Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Owner Capital & Drawings
  const totalCapital = ownerTxs.filter(t => t.type === 'CAPITAL_INVESTMENT').reduce((sum, t) => sum + t.amount, 0);
  const totalDrawings = ownerTxs.filter(t => t.type === 'DRAWINGS').reduce((sum, t) => sum + t.amount, 0);

  // Inventory value (Asset conversion)
  const totalInventoryValue = inventory.reduce((sum, i) => sum + (i.stockQuantity * i.costPerUnit), 0);

  // Gross profit = Total Sales - Direct Expenses
  const grossProfit = totalSales - totalExpenses;
  // Net profit
  const netProfit = grossProfit;

  res.json({
    totalSales,
    paidSales,
    pendingPayments,
    totalExpenses,
    grossProfit,
    netProfit,
    ownerCapital: totalCapital,
    ownerDrawings: totalDrawings,
    inventoryValue: totalInventoryValue,
    orderCount: validOrders.length
  });
});

router.get('/expenses', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getExpenses());
});

router.post('/expenses', requireAdmin, (req: Request, res: Response) => {
  const exp = db.addExpense(req.body);
  res.status(201).json(exp);
});

router.get('/owner-transactions', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getOwnerTransactions());
});

router.post('/owner-transactions', requireAdmin, (req: Request, res: Response) => {
  const tx = db.addOwnerTransaction(req.body);
  res.status(201).json(tx);
});

// CSV Report Export
router.get('/finance/export', requireAdmin, (req: Request, res: Response) => {
  const orders = db.getOrders();
  const expenses = db.getExpenses();

  let csv = 'TYPE,ID/NUMBER,DATE,NAME/DESCRIPTION,AMOUNT,STATUS\n';

  orders.forEach(o => {
    csv += `ORDER,${o.orderNumber},${o.createdAt.split('T')[0]},"${o.customerName}",${o.totalAmount},${o.orderStatus}\n`;
  });

  expenses.forEach(e => {
    csv += `EXPENSE,${e.id},${e.date},"${(e.description || '').replace(/"/g, '""')}",-${e.amount},${e.category}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="flora7_financial_report.csv"');
  return res.send(csv);
});

// ==========================================
// 9. REVIEWS & FEEDBACK
// ==========================================
router.get('/reviews', (req: Request, res: Response) => {
  const { productId } = req.query;
  let reviews = db.getReviews();
  if (productId && typeof productId === 'string') {
    reviews = reviews.filter(r => r.productId === productId);
  }
  res.json(reviews);
});

router.post('/reviews', (req: Request, res: Response) => {
  const review = db.addReview(req.body);
  res.status(201).json({ message: 'Review submitted for approval!', review });
});

router.put('/reviews/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateReview(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Review not found' });
  res.json(updated);
});

// ==========================================
// 10. DELIVERY AREAS & PINCODES
// ==========================================
router.get('/delivery-areas', (req: Request, res: Response) => {
  res.json(db.getDeliveryAreas());
});

router.post('/delivery-areas/check', (req: Request, res: Response) => {
  const { pincode } = req.body;
  if (!pincode) return res.status(400).json({ error: 'Pincode required' });

  const area = db.getDeliveryAreas().find(a => a.pincode === pincode.trim() && a.active);
  if (area) {
    return res.json({
      available: true,
      areaName: area.areaName,
      city: area.city,
      deliveryCharge: area.deliveryCharge,
      freeDeliveryThreshold: area.freeDeliveryThreshold
    });
  }

  // Fallback check for Bangalore pincodes (56xxxx)
  if (/^56\d{4}$/.test(pincode.trim())) {
    return res.json({
      available: true,
      areaName: 'Bangalore Delivery Zone',
      city: 'Bangalore',
      deliveryCharge: 40
    });
  }

  return res.json({
    available: false,
    message: 'Sorry, Flora7 delivery is currently only available across Bangalore. Studio pickup is also available!'
  });
});

// ==========================================
// 11. WEBSITE CONTENT & POLICIES
// ==========================================
router.get('/content', (req: Request, res: Response) => {
  res.json(db.getWebsiteContent());
});

router.put('/content', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateWebsiteContent(req.body);
  res.json(updated);
});

// ==========================================
// 12. IMAGE UPLOAD FOR OWNER
// ==========================================
router.post('/upload-image', requireAdmin, (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://') || imageBase64.startsWith('/images/')) {
      return res.json({ imageUrl: imageBase64 });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image format. Provide base64 data URL or web image URL.' });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('jpeg')) ext = 'jpeg';

    const imagesDir = path.join(process.cwd(), 'public', 'images');
    const dataUploadsDir = path.join(process.cwd(), 'data', 'uploads');
    const distImagesDir = path.join(process.cwd(), 'dist', 'images');

    [imagesDir, dataUploadsDir, distImagesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch {}
      }
    });

    const safeName = `flora7-prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    
    // Write to all active target directories
    try { fs.writeFileSync(path.join(imagesDir, safeName), buffer); } catch {}
    try { fs.writeFileSync(path.join(dataUploadsDir, safeName), buffer); } catch {}
    try {
      if (fs.existsSync(distImagesDir)) {
        fs.writeFileSync(path.join(distImagesDir, safeName), buffer);
      }
    } catch {}

    const imageUrl = `/images/${safeName}`;
    return res.json({ imageUrl, safeName, base64: imageBase64 });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

// ==========================================
// 13. OWNER NOTIFICATIONS & EMAIL CENTER
// ==========================================
router.get('/notifications/alerts', requireAdmin, (req: Request, res: Response) => {
  const alerts = db.getOwnerAlerts();
  const unreadCount = alerts.filter(a => !a.read).length;
  res.json({ alerts, unreadCount });
});

router.post('/notifications/alerts/mark-read', requireAdmin, (req: Request, res: Response) => {
  const { ids } = req.body;
  db.markAlertsAsRead(ids);
  res.json({ success: true, alerts: db.getOwnerAlerts() });
});

router.delete('/notifications/alerts', requireAdmin, (req: Request, res: Response) => {
  db.clearAlerts();
  res.json({ success: true, alerts: [] });
});

router.get('/notifications/email-settings', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getEmailSettings());
});

router.put('/notifications/email-settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateEmailSettings(req.body);
  res.json({ message: 'Email settings saved', settings: updated });
});

router.get('/notifications/email-logs', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getEmailLogs());
});

router.post('/notifications/test-email', requireAdmin, async (req: Request, res: Response) => {
  const { targetEmail } = req.body;
  const settings = db.getEmailSettings();
  const recipient = targetEmail || (settings.ownerEmails && settings.ownerEmails[0]) || 'flora7loveunfolded@gmail.com';

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const appUrl = `${protocol}://${host}`;

  const testSubject = `🌸 [Test Alert] Flora7 Order Email Notification Test (${new Date().toLocaleTimeString()})`;
  const testHtml = `
    <div style="font-family: sans-serif; background-color: #fdf6f7; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #fce7f0;">
      <h2 style="color: #5c2533; margin-top: 0;">🌸 Flora7 Studio Notification Test</h2>
      <p style="color: #3d1822; font-size: 14px;">This is a verification test to confirm your order notification alerts are active for <strong>${recipient}</strong>.</p>
      <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #f4b8c7; font-size: 13px; color: #5c2533;">
        ✅ <strong>Status:</strong> Active & Ready to receive customer orders<br />
        ⏰ <strong>Timestamp:</strong> ${new Date().toLocaleString()}<br />
        🌐 <strong>App URL:</strong> <a href="${appUrl}" style="color: #b76e79;">${appUrl}</a>
      </div>
      <p style="font-size: 12px; color: #8c5263; margin-top: 16px;">When customers place an order or booking, instant email alerts and in-portal notifications will trigger automatically.</p>
    </div>
  `;

  try {
    const result = await sendEmail({
      to: recipient,
      subject: testSubject,
      html: testHtml,
      text: `Flora7 Test Alert: Order notifications active for ${recipient} at ${new Date().toLocaleString()}`,
      recipientType: 'OWNER'
    });

    res.json({
      message: `Test email processed for ${recipient}`,
      status: result.status,
      result
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. GEMINI AI FLORAL CONCIERGE & CARD WRITER
// ==========================================
router.get('/gemini/status', (req: Request, res: Response) => {
  res.json({
    available: isGeminiAvailable(),
    model: 'gemini-3.8-flash',
    features: ['floral_concierge', 'card_message_generator', 'gift_recommendations']
  });
});

router.post('/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatWithFloraAssistant({
      messages,
      message
    });

    res.json(response);
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    res.status(500).json({
      error: err.message || 'Gemini AI assistant encountered an error',
      reply: "I'm having a little trouble connecting to my creative floral thoughts right now. Please feel free to browse our bouquets or reach out on WhatsApp!"
    });
  }
});

router.post('/gemini/card-message', async (req: Request, res: Response) => {
  try {
    const { recipient, occasion, tone, details } = req.body;
    const messages = await generateCardMessages({
      recipient,
      occasion,
      tone,
      details
    });

    res.json({ messages });
  } catch (err: any) {
    console.error('Gemini card message error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate card message',
      messages: [
        'A timeless bloom for a timeless bond. Happy celebration!',
        'Forever grateful for your love and warmth. With all my heart!',
        'May your day be filled with endless smiles and gentle blooms.'
      ]
    });
  }
});

export default router;
