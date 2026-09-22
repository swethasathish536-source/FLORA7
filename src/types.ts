export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'single-rose' | 'mini-bouquet' | 'premium-bouquet' | 'custom-bouquet' | 'gift-set' | 'keychain' | 'festive' | 'limited';
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  description: string;
  shortDescription?: string;
  images: string[];
  videoUrl?: string;
  availableColours: string[];
  flowerType: string;
  numberOfFlowers: number;
  sizeOptions: string[];
  wrappingOptions: string[];
  ribbonColours: string[];
  hasPearlOption: boolean;
  messageCardOption: boolean;
  giftTagOption: boolean;
  stockStatus: StockStatus;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  isCustomisable: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFestive: boolean;
  isLimitedEdition: boolean;
  occasions: string[];
  tags: string[];
  preparationTime: string;
  createdAt: string;
}

export interface CustomBouquetSelection {
  flowerType: string;
  numberOfFlowers: number;
  flowerColours: string[];
  centrePearl: boolean;
  pearlStyle?: string;
  wrappingColour: string;
  ribbonColour: string;
  bouquetSize: string;
  bowStyle: string;
  messageCardText?: string;
  giftTagName?: string;
  additionalDecorations: string[];
  referenceImageUrl?: string;
  specialInstructions?: string;
  // Aliases for general options
  colour?: string;
  wrapping?: string;
  ribbon?: string;
  pearl?: boolean;
  cardMessage?: string;
  giftTag?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  isCustomBouquet?: boolean;
  customisationDetails?: CustomBouquetSelection | {
    colour?: string;
    wrapping?: string;
    ribbon?: string;
    pearl?: boolean;
    cardMessage?: string;
    giftTag?: string;
    size?: string;
    deliveryType?: 'DELIVERY' | 'PICKUP';
    flowerType?: string;
    flowerColours?: string[];
    wrappingColour?: string;
    ribbonColour?: string;
  };
}

export type OrderStatus = 
  | 'RECEIVED' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'READY_FOR_DISPATCH'
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED'
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type PaymentMethod = 'UPI' | 'ONLINE' | 'COD' | 'CARD' | 'PAY_AT_PICKUP' | 'CASH';
export type PaymentStatus = 'PENDING' | 'PAID' | 'UNPAID' | 'FAILED' | 'REFUNDED' | 'PARTIAL';

export interface TimelineEvent {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. FLORA7-00001
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress?: string;
  landmark?: string;
  pincode?: string;
  isPickup: boolean;
  pickupLocation?: string;
  deliveryDate: string;
  preferredSlot: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  giftMessage?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface OfflineBooking {
  id: string;
  bookingNumber: string; // e.g. FLORA7-OFF-0001
  productOrConcept: string;
  quantity: number;
  customDetails: string;
  preferredDate: string;
  deliveryOrPickup: 'DELIVERY' | 'PICKUP';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  quotedPrice?: number;
  advancePaid?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  materialName?: string;
  category: 'ribbon' | 'wrapping' | 'pearl' | 'glue' | 'packaging' | 'keychain' | 'decorative' | 'finished_product';
  colour?: string;
  colorOrType?: string;
  stockQuantity: number;
  currentStock?: number;
  unit: string; // e.g. rolls, sheets, pieces, pcs
  minAlertThreshold: number;
  reorderLevel?: number;
  costPerUnit: number;
  supplier?: string;
  isAvailable: boolean;
  updatedAt: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'materials' | 'delivery' | 'packaging' | 'utilities' | 'marketing' | 'equipment' | 'other' | string;
  amount: number;
  description: string;
  paymentMethod: string;
  receiptNote?: string;
  createdAt?: string;
}

export interface OwnerTransaction {
  id: string;
  date: string;
  type: 'CAPITAL_INVESTMENT' | 'DRAWINGS';
  amount: number;
  description: string;
  createdAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number;
  usageCount?: number;
  perCustomerLimit?: number;
  active: boolean;
  applicableCategories?: string[];
  description: string;
}

export interface OfferBanner {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  active: boolean;
  validUntil?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  imageUrl?: string;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: string;
}

export interface DeliveryArea {
  id: string;
  pincode: string;
  areaName: string;
  city: string;
  deliveryCharge: number;
  freeDeliveryThreshold?: number;
  active: boolean;
}

export interface WebsiteContent {
  heroTitle: string;
  heroTagline: string;
  heroSubtitle: string;
  aboutStory: string;
  craftedByShwethaText: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  storeAddress: string;
  pickupTimings: string;
  privacyPolicy: string;
  termsConditions: string;
  deliveryPolicy: string;
  cancellationPolicy: string;
  returnPolicy: string;
}

export interface CustomBouquetMaterialOptions {
  flowerTypes: { id: string; name: string; pricePerFlower: number; isAvailable: boolean }[];
  flowerColours: { id: string; name: string; hex: string; isAvailable: boolean }[];
  wrappingColours: { id: string; name: string; hex: string; isAvailable: boolean }[];
  ribbonColours: { id: string; name: string; hex: string; isAvailable: boolean }[];
  bouquetSizes: { id: string; name: string; flowerCountMin: number; basePrice: number }[];
  bowStyles: { id: string; name: string; price: number }[];
  addOns: { id: string; name: string; price: number; icon: string }[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN';
  lastLogin?: string;
}

export interface EmailNotificationSettings {
  ownerEmails: string[];
  notifyOnNewOrder: boolean;
  notifyOnStatusChange: boolean;
  notifyOnCustomBooking: boolean;
  notifyCustomerOnReceipt: boolean;
  notifyCustomerOnStatusChange: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface EmailLog {
  id: string;
  orderId?: string;
  orderNumber?: string;
  recipient: string;
  recipientType: 'OWNER' | 'CUSTOMER';
  subject: string;
  htmlBody: string;
  textBody: string;
  status: 'SENT' | 'LOGGED' | 'FAILED';
  errorMessage?: string;
  timestamp: string;
}

export interface OwnerNotificationAlert {
  id: string;
  type: 'NEW_ORDER' | 'CUSTOM_BOOKING' | 'LOW_STOCK' | 'SYSTEM';
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  amount?: number;
  customerName?: string;
  read: boolean;
  timestamp: string;
}
