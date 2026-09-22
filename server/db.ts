import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Product,
  Order,
  OfflineBooking,
  InventoryItem,
  Expense,
  OwnerTransaction,
  Coupon,
  OfferBanner,
  Review,
  DeliveryArea,
  WebsiteContent,
  CustomBouquetMaterialOptions,
  AdminUser,
  EmailNotificationSettings,
  EmailLog,
  OwnerNotificationAlert
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'flora7_db.json');

export interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  offlineBookings: OfflineBooking[];
  inventory: InventoryItem[];
  expenses: Expense[];
  ownerTransactions: OwnerTransaction[];
  coupons: Coupon[];
  offers: OfferBanner[];
  reviews: Review[];
  deliveryAreas: DeliveryArea[];
  websiteContent: WebsiteContent;
  customOptions: CustomBouquetMaterialOptions;
  admins: { id: string; email: string; passwordHash: string; name: string; role: 'OWNER' | 'ADMIN'; lastLogin?: string }[];
  emailSettings?: EmailNotificationSettings;
  emailLogs?: EmailLog[];
  ownerAlerts?: OwnerNotificationAlert[];
  orderCounter: number;
  bookingCounter: number;
}

const defaultEmailSettings: EmailNotificationSettings = {
  ownerEmails: ['flora7loveunfolded@gmail.com'],
  notifyOnNewOrder: true,
  notifyOnStatusChange: true,
  notifyOnCustomBooking: true,
  notifyCustomerOnReceipt: true,
  notifyCustomerOnStatusChange: true,
  fromName: 'Flora7 Handmade Studio',
  fromEmail: 'Flora7 Studio <flora7loveunfolded@gmail.com>'
};

const defaultCustomOptions: CustomBouquetMaterialOptions = {
  flowerTypes: [
    { id: 'satin-rose', name: 'Handmade Satin Ribbon Rose', pricePerFlower: 25, isAvailable: true },
    { id: 'satin-tulip', name: 'Satin Ribbon Tulip', pricePerFlower: 30, isAvailable: true },
    { id: 'hybrid-mix', name: 'Satin Rose & Tulip Hybrid', pricePerFlower: 28, isAvailable: true },
    { id: 'jumbo-rose', name: 'Jumbo Layered Satin Rose', pricePerFlower: 45, isAvailable: true },
    { id: 'mini-bud', name: 'Mini Satin Rose Bud', pricePerFlower: 18, isAvailable: true },
  ],
  flowerColours: [
    { id: 'blush-pink', name: 'Blush Pink', hex: '#F4B8C7', isAvailable: true },
    { id: 'cream-ivory', name: 'Cream Ivory', hex: '#FFFDD0', isAvailable: true },
    { id: 'passion-red', name: 'Passion Red', hex: '#C41E3A', isAvailable: true },
    { id: 'soft-lavender', name: 'Soft Lavender', hex: '#E6E6FA', isAvailable: true },
    { id: 'champagne-gold', name: 'Champagne Gold', hex: '#F7E7CE', isAvailable: true },
    { id: 'sky-blue', name: 'Sky Blue', hex: '#87CEEB', isAvailable: true },
    { id: 'rose-gold', name: 'Rose Gold', hex: '#B76E79', isAvailable: true },
    { id: 'deep-maroon', name: 'Deep Maroon', hex: '#800020', isAvailable: true },
  ],
  wrappingColours: [
    { id: 'dusty-pink', name: 'Dusty Pink Matte Sheet', hex: '#DCAEAE', isAvailable: true },
    { id: 'cream-white', name: 'Cream Ivory Pearl Border', hex: '#FDFBF7', isAvailable: true },
    { id: 'kraft-gold', name: 'Vintage Gold Border Wrap', hex: '#D4AF37', isAvailable: true },
    { id: 'soft-purple', name: 'Soft Lavender Matte', hex: '#D8C4E8', isAvailable: true },
    { id: 'midnight-black', name: 'Midnight Black Pearl Lace', hex: '#2B2B2B', isAvailable: true },
  ],
  ribbonColours: [
    { id: 'rose-gold-satin', name: 'Rose Gold Satin Ribbon', hex: '#B76E79', isAvailable: true },
    { id: 'ivory-silk', name: 'Ivory Silk Ribbon', hex: '#FFFFF0', isAvailable: true },
    { id: 'blush-organza', name: 'Blush Pink Sheer Organza', hex: '#F4B8C7', isAvailable: true },
    { id: 'burgundy-velvet', name: 'Burgundy Velvet Edge', hex: '#800020', isAvailable: true },
  ],
  bouquetSizes: [
    { id: 'mini', name: 'Mini Petite (3 Flowers)', flowerCountMin: 3, basePrice: 120 },
    { id: 'classic', name: 'Classic Elegance (7 Flowers)', flowerCountMin: 7, basePrice: 220 },
    { id: 'grand', name: 'Grand Deluxe (12 Flowers)', flowerCountMin: 12, basePrice: 380 },
    { id: 'luxury', name: 'Luxury Royal (21+ Flowers)', flowerCountMin: 21, basePrice: 650 },
  ],
  bowStyles: [
    { id: 'classic-double', name: 'Classic Double Loop Satin Bow', price: 0 },
    { id: 'pearl-studded', name: 'Pearl-Studded Luxe Bow', price: 25 },
    { id: 'minimalist-knot', name: 'Minimalist Silk Knot', price: 10 },
  ],
  addOns: [
    { id: 'centre-pearls', name: 'Pearl Core in Each Flower', price: 20, icon: 'Sparkles' },
    { id: 'led-fairy-lights', name: 'Warm LED Fairy Lights', price: 50, icon: 'Lightbulb' },
    { id: 'greeting-card', name: 'Custom Printed Handwritten Card', price: 25, icon: 'FileText' },
    { id: 'butterflies', name: 'Golden Metallic Butterflies (Set of 2)', price: 30, icon: 'Heart' },
    { id: 'gift-tag-initial', name: 'Custom Wooden/Acrylic Initial Tag', price: 35, icon: 'Tag' },
  ]
};

const defaultSeedProducts: Product[] = [
  {
    "name": "7 CLASSIC BLUE COLOUR ROSES",
    "slug": "7",
    "category": "premium-bouquet",
    "price": 247,
    "discountPercent": 0,
    "stockStatus": "IN_STOCK",
    "stockQuantity": 50,
    "flowerType": "Handmade Satin Ribbon Rose",
    "numberOfFlowers": 7,
    "preparationTime": "1-2 days",
    "description": "Handmade satin ribbon roses crafted with love by Shwetha. Features premium ribbon folds and luxury finish.",
    "shortDescription": "Handcrafted satin ribbon rose bouquet.",
    "images": [
      "/images/flora7-prod-1789662249696-24sx7.jpeg",
      "/images/flora7-prod-1789662270353-0jns8.jpeg",
      "/images/flora7-prod-1789662278606-tr124.jpeg",
      "/images/flora7-prod-prod-1789662520611-img4.jpeg",
      "/images/flora7-prod-prod-1789662520611-img5.jpeg",
      "/images/flora7-prod-prod-1789662520611-img6.jpeg"
    ],
    "availableColours": [
      "Sky Blue & Cream Ivory",
      "Blush Pink & Ivory",
      "Rose Gold & Champagne"
    ],
    "wrappingOptions": [
      "Frosted Korean White with Gold Trim",
      "Dusty Pink Matte",
      "Vintage Gold Border Wrap"
    ],
    "ribbonColours": [
      "Luxe Gold Satin Bow",
      "Rose Gold Satin",
      "Ivory Silk"
    ],
    "tags": [
      "satin roses",
      "handmade",
      "gift"
    ],
    "isBestSeller": false,
    "isNewArrival": true,
    "isFestive": false,
    "isLimitedEdition": false,
    "isCustomisable": true,
    "hasPearlOption": true,
    "messageCardOption": true,
    "giftTagOption": true,
    "id": "prod-1789662520611",
    "createdAt": "2026-09-17T16:28:40.611Z",
    "sizeOptions": [
      "Standard Size (30cm)"
    ],
    "rating": 5,
    "reviewCount": 12,
    "occasions": [
      "Birthday",
      "Anniversary",
      "Special Occasion"
    ]
  },
  {
    "id": "prod-single-rose",
    "name": "Single Satin Rose",
    "slug": "single-satin-rose",
    "category": "single-rose",
    "price": 57,
    "originalPrice": 70,
    "discountPercent": 19,
    "description": "A single, perfectly hand-crafted satin ribbon rose made to last forever. Wrapped in delicate blush tissue with a satin ribbon bow.",
    "shortDescription": "Handmade single ribbon rose that never fades.",
    "images": [
      "/images/flora7-prod-1789659377714-yeeum.jpeg",
      "/images/flora7-prod-1789659401153-k6gqi.jpeg",
      "/images/flora7-prod-1789659425123-p7apd.jpeg"
    ],
    "availableColours": [
      "Blush Pink",
      "Cream Ivory",
      "Passion Red",
      "Lavender"
    ],
    "flowerType": "Satin Ribbon Rose",
    "numberOfFlowers": 1,
    "sizeOptions": [
      "Standard Single Rose (28cm stem)"
    ],
    "wrappingOptions": [
      "Plain black",
      "Plain white",
      "Shimmer white"
    ],
    "ribbonColours": [
      "Rose Gold Satin",
      "Ivory Silk"
    ],
    "hasPearlOption": true,
    "messageCardOption": true,
    "giftTagOption": true,
    "stockStatus": "IN_STOCK",
    "stockQuantity": 150,
    "rating": 4.9,
    "reviewCount": 38,
    "isCustomisable": true,
    "isBestSeller": true,
    "isNewArrival": false,
    "isFestive": false,
    "isLimitedEdition": false,
    "occasions": [
      "Friendship",
      "Birthday",
      "Just Because",
      "Teacher's Day"
    ],
    "tags": [
      "single rose",
      "satin flower",
      "handmade",
      "budget gift"
    ],
    "preparationTime": "Same day dispatch / 1 day",
    "createdAt": "2026-08-14T04:11:25.028Z"
  },
  {
    "id": "prod-premium-single-rose",
    "name": "Premium Single Rose with Pearl & LED",
    "slug": "premium-single-rose",
    "category": "single-rose",
    "price": 77,
    "originalPrice": 99,
    "discountPercent": 22,
    "description": "Signature single satin rose studded with a core faux pearl, wrapped in luxury matte paper with warm fairy lights attached.",
    "shortDescription": "Satin rose with pearl centerpiece and subtle LED glow.",
    "images": [
      "/images/flora7-prod-1789659728705-adhqm.jpeg",
      "/images/flora7-prod-1789659742973-hehyv.jpeg",
      "/images/flora7-prod-1789659752414-2pq0g.jpeg",
      "/images/flora7-prod-1789659762693-ev9ke.jpeg"
    ],
    "availableColours": [
      "Blush Pink",
      "Rose Gold",
      "Champagne Gold"
    ],
    "flowerType": "Jumbo Layered Satin Rose",
    "numberOfFlowers": 1,
    "sizeOptions": [
      "Luxe Single Stem"
    ],
    "wrappingOptions": [
      "Kraft Gold Border",
      "Dusty Pink Matte"
    ],
    "ribbonColours": [
      "Rose Gold Satin",
      "Blush Organza"
    ],
    "hasPearlOption": true,
    "messageCardOption": true,
    "giftTagOption": true,
    "stockStatus": "IN_STOCK",
    "stockQuantity": 90,
    "rating": 5,
    "reviewCount": 42,
    "isCustomisable": true,
    "isBestSeller": true,
    "isNewArrival": false,
    "isFestive": true,
    "isLimitedEdition": false,
    "occasions": [
      "Birthday",
      "Anniversary",
      "Valentine's Day"
    ],
    "tags": [
      "premium rose",
      "pearl rose",
      "satin ribbon"
    ],
    "preparationTime": "1 day",
    "createdAt": "2026-08-14T04:11:25.029Z"
  },
  {
    "id": "prod-5-rose-bouquet",
    "name": "5 Rose Delight Bouquet",
    "slug": "5-rose-bouquet",
    "category": "mini-bouquet",
    "price": 197,
    "originalPrice": 240,
    "discountPercent": 18,
    "description": "Charming 5-rose arrangement crafted by Shwetha with satin ribbon layers and custom ribbon wrapping.",
    "shortDescription": "5 elegant satin roses wrapped to perfection.",
    "images": [
      "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800"
    ],
    "availableColours": [
      "Blush Pink Mix",
      "Pastel Harmony",
      "Classic Red"
    ],
    "flowerType": "Handmade Satin Ribbon Rose",
    "numberOfFlowers": 5,
    "sizeOptions": [
      "Standard Bouquet (28cm)"
    ],
    "wrappingOptions": [
      "Soft Lavender Matte",
      "Dusty Pink Matte"
    ],
    "ribbonColours": [
      "Rose Gold Satin",
      "Ivory Silk"
    ],
    "hasPearlOption": true,
    "messageCardOption": true,
    "giftTagOption": true,
    "stockStatus": "IN_STOCK",
    "stockQuantity": 50,
    "rating": 4.9,
    "reviewCount": 51,
    "isCustomisable": true,
    "isBestSeller": true,
    "isNewArrival": false,
    "isFestive": false,
    "isLimitedEdition": false,
    "occasions": [
      "Anniversary",
      "Birthday",
      "Mother's Day"
    ],
    "tags": [
      "5 roses",
      "blush pink",
      "craft bouquet"
    ],
    "preparationTime": "1 day",
    "createdAt": "2026-08-14T04:11:25.029Z"
  },
  {
    "id": "prod-7-rose-bouquet",
    "name": "7 Rose Classic Satin Bouquet",
    "slug": "7-rose-bouquet",
    "category": "premium-bouquet",
    "price": 267,
    "originalPrice": 299,
    "discountPercent": 11,
    "description": "The signature Flora7 7-Rose Bouquet representing eternal love. Handcrafted by Shwetha with sky blue & cream ivory satin ribbon roses, gleaming faux pearl centers in every bloom, frosted Korean white paper with gold borders, and a deluxe gold satin ribbon bow with a pearl pin.",
    "shortDescription": "Signature 7-rose bouquet with pearl cores & gold ribbon bow.",
    "images": [
      "/images/flora7-prod-1789661949230-5d448.jpeg",
      "/images/flora7-prod-1789661963542-iqewh.jpeg"
    ],
    "availableColours": [
      "Sky Blue & Cream Ivory (Featured)",
      "Blush Pink & Ivory",
      "Rose Gold & Champagne",
      "Deep Maroon & Cream"
    ],
    "flowerType": "Handmade Satin Ribbon Rose",
    "numberOfFlowers": 7,
    "sizeOptions": [
      "Classic Deluxe Bouquet (32cm)"
    ],
    "wrappingOptions": [
      "Plain white",
      "Plain black",
      "White shimmer"
    ],
    "ribbonColours": [
      "Luxe Gold Satin Bow (As Pictured)",
      "Rose Gold Satin",
      "Ivory Silk"
    ],
    "hasPearlOption": true,
    "messageCardOption": true,
    "giftTagOption": true,
    "stockStatus": "IN_STOCK",
    "stockQuantity": 40,
    "rating": 5,
    "reviewCount": 76,
    "isCustomisable": true,
    "isBestSeller": true,
    "isNewArrival": false,
    "isFestive": true,
    "isLimitedEdition": false,
    "occasions": [
      "Anniversary",
      "Valentine's Day",
      "Engagement",
      "Wedding"
    ],
    "tags": [
      "7 roses",
      "best seller",
      "signature bouquet"
    ],
    "preparationTime": "5 DAYS",
    "createdAt": "2026-08-14T04:11:25.029Z"
  },
  {
    "id": "prod-premium-7-rose-bouquet",
    "name": "Premium 7 Rose Royal Bouquet",
    "slug": "premium-7-rose-bouquet",
    "category": "premium-bouquet",
    "price": 297,
    "originalPrice": 350,
    "discountPercent": 15,
    "description": "Luxurious 7-Rose Satin Bouquet enhanced with fairy lights, pearl centers, double-layer Korean floral mesh wrap, and custom initial gift tag.",
    "shortDescription": "Luxe 7 roses with fairy lights, mesh wrap & initial tag.",
    "images": [
      "/images/flora7-prod-1789661795688-b1bde.jpeg",
      "/images/flora7-prod-1789661818478-7t8yi.jpeg",
      "/images/flora7-prod-1789661830547-5lde8.jpeg",
      "/images/flora7-prod-1789661839007-tko70.jpeg"
    ],
    "availableColours": [
      "Blush Pink",
      "Champagne Gold",
      "Royal Red"
    ],
    "flowerType": "Jumbo Layered Satin Rose",
    "numberOfFlowers": 7,
    "sizeOptions": [
      "Royal Grand Size"
    ],
    "wrappingOptions": [
      "Cream Ivory Pearl Border",
      "Midnight Black Pearl Lace"
    ],
    "ribbonColours": [
      "Rose Gold Satin",
      "Blush Organza"
    ],
    "hasPearlOption": true,
    "messageCardOption": true,
    "giftTagOption": true,
    "stockStatus": "IN_STOCK",
    "stockQuantity": 30,
    "rating": 5,
    "reviewCount": 64,
    "isCustomisable": true,
    "isBestSeller": true,
    "isNewArrival": true,
    "isFestive": true,
    "isLimitedEdition": false,
    "occasions": [
      "Anniversary",
      "Wedding",
      "Valentine's Day",
      "Proposal"
    ],
    "tags": [
      "premium 7 roses",
      "royal bouquet",
      "fairy lights"
    ],
    "preparationTime": "1-2 days",
    "createdAt": "2026-08-14T04:11:25.029Z"
  },
  {
    "id": "prod-premium-9-rose-bouquet",
    "name": "Premium 9 Rose Grand Bouquet",
    "slug": "premium-9-rose-bouquet",
    "category": "premium-bouquet",
    "price": 397,
    "originalPrice": 480,
    "discountPercent": 17,
    "description": "A grand 9-rose satin masterwork by Shwetha symbolizing complete devotion. Complete with LED fairy lights, pearl accents, crown topper, and message card.",
    "shortDescription": "Grand 9-rose masterpiece with LED lights and mini crown.",
    "images": [
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=800"
    ],
    "availableColours": [
      "Blush Pink & Ivory",
      "Red & Gold",
      "Lavender Symphony"
    ],
    "flowerType": "Handmade Satin Ribbon Rose",
    "numberOfFlowers": 9,
    "sizeOptions": [
      "Grand Masterpiece (38cm)"
    ],
    "wrappingOptions": [
      "Vintage Gold Border Wrap",
      "Dusty Pink Matte"
    ],
    "ribbonColours": [
      "Rose Gold Satin",
      "Ivory Silk"
    ],
    "hasPearlOption": true,
    "messageCardOption": true,
    "giftTagOption": true,
    "stockStatus": "IN_STOCK",
    "stockQuantity": 25,
    "rating": 5,
    "reviewCount": 31,
    "isCustomisable": true,
    "isBestSeller": false,
    "isNewArrival": true,
    "isFestive": true,
    "isLimitedEdition": true,
    "occasions": [
      "Anniversary",
      "Proposal",
      "Birthday",
      "Diwali"
    ],
    "tags": [
      "9 roses",
      "grand bouquet",
      "luxury flowers"
    ],
    "preparationTime": "2 days",
    "createdAt": "2026-08-14T04:11:25.029Z"
  },
  {
    "id": "prod-mini-bouquet-keychain",
    "name": "Velvet pipe cleaner Keychain",
    "slug": "mini-bouquet-keychain",
    "category": "keychain",
    "price": 47,
    "originalPrice": 75,
    "discountPercent": 37,
    "description": "Adorable miniature satin ribbon bouquet attached to a sturdy gold-toned keychain clip. Carry Flora7 love everywhere on bags or keys!",
    "shortDescription": "Handmade mini satin rose bouquet on a golden keychain clip.",
    "images": [
      "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=1000"
    ],
    "availableColours": [
      "Blush Pink",
      "Lavender",
      "Sky Blue",
      "Ivory"
    ],
    "flowerType": "Mini Satin Rose Bud",
    "numberOfFlowers": 3,
    "sizeOptions": [
      "Keychain Size (8cm)"
    ],
    "wrappingOptions": [
      "Mini Kraft Wrap",
      "Mini Pink Paper"
    ],
    "ribbonColours": [
      "Rose Gold Satin",
      "Ivory Silk"
    ],
    "hasPearlOption": true,
    "messageCardOption": false,
    "giftTagOption": true,
    "stockStatus": "IN_STOCK",
    "stockQuantity": 120,
    "rating": 4.9,
    "reviewCount": 88,
    "isCustomisable": true,
    "isBestSeller": true,
    "isNewArrival": true,
    "isFestive": false,
    "isLimitedEdition": false,
    "occasions": [
      "Friendship",
      "Return Gift",
      "Raksha Bandhan",
      "Birthday"
    ],
    "tags": [
      "keychain",
      "mini bouquet",
      "bag charm",
      "handmade keychain"
    ],
    "preparationTime": "Same day dispatch",
    "createdAt": "2026-08-14T04:11:25.029Z"
  }
];

const defaultInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Satin Ribbon - Blush Pink (38mm)', category: 'ribbon', colour: 'Blush Pink', stockQuantity: 45, unit: 'rolls', minAlertThreshold: 10, costPerUnit: 85, isAvailable: true, updatedAt: new Date().toISOString() },
  { id: 'inv-2', name: 'Satin Ribbon - Cream Ivory (38mm)', category: 'ribbon', colour: 'Cream Ivory', stockQuantity: 32, unit: 'rolls', minAlertThreshold: 8, costPerUnit: 85, isAvailable: true, updatedAt: new Date().toISOString() },
  { id: 'inv-3', name: 'Satin Ribbon - Passion Red (38mm)', category: 'ribbon', colour: 'Passion Red', stockQuantity: 28, unit: 'rolls', minAlertThreshold: 8, costPerUnit: 85, isAvailable: true, updatedAt: new Date().toISOString() },
  { id: 'inv-4', name: 'Korean Matte Wrapping Sheet - Dusty Pink', category: 'wrapping', colour: 'Dusty Pink', stockQuantity: 120, unit: 'sheets', minAlertThreshold: 25, costPerUnit: 12, isAvailable: true, updatedAt: new Date().toISOString() },
  { id: 'inv-5', name: 'Faux Pearl Cores (6mm)', category: 'pearl', stockQuantity: 850, unit: 'pcs', minAlertThreshold: 100, costPerUnit: 0.5, isAvailable: true, updatedAt: new Date().toISOString() },
  { id: 'inv-6', name: 'Hot Glue Sticks (11mm)', category: 'glue', stockQuantity: 60, unit: 'pcs', minAlertThreshold: 15, costPerUnit: 6, isAvailable: true, updatedAt: new Date().toISOString() },
  { id: 'inv-7', name: 'Gold Keychain Rings & Clips', category: 'keychain', stockQuantity: 150, unit: 'pcs', minAlertThreshold: 30, costPerUnit: 8, isAvailable: true, updatedAt: new Date().toISOString() },
  { id: 'inv-8', name: 'Floral Bouquet Packaging Boxes', category: 'packaging', stockQuantity: 40, unit: 'pcs', minAlertThreshold: 10, costPerUnit: 25, isAvailable: true, updatedAt: new Date().toISOString() },
];

const defaultCoupons: Coupon[] = [
  {
    id: 'c-flora10',
    code: 'FLORA10',
    discountType: 'PERCENTAGE',
    discountValue: 5,
    minOrderValue: 1,
    maxDiscountAmount: 100,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    usageCount: 42,
    perCustomerLimit: 5,
    active: true,
    description: 'Get 5% OFF on your order with code FLORA10'
  },
  {
    id: 'c-welcome10',
    code: 'WELCOME10',
    discountType: 'FIXED',
    discountValue: 30,
    minOrderValue: 147,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usageCount: 18,
    perCustomerLimit: 1,
    active: true,
    description: '₹30 FLAT OFF on your first Flora7 order!'
  },
  {
    id: 'c-bloom15',
    code: 'BLOOM15',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 297,
    maxDiscountAmount: 150,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 300,
    usageCount: 12,
    perCustomerLimit: 1,
    active: true,
    description: 'Special 15% OFF on premium bouquets'
  },
  {
    id: 'c-festive20',
    code: 'FESTIVE20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 397,
    maxDiscountAmount: 200,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usageCount: 5,
    perCustomerLimit: 1,
    active: true,
    description: 'Festive Season 20% OFF on grand bouquets'
  }
];

const defaultOffers: OfferBanner[] = [
  {
    id: 'off-1',
    title: 'Festive Bloom Offer',
    subtitle: 'Get a complimentary Handmade Keychain Bouquet on orders above ₹399!',
    badgeText: 'LIMITED TIME',
    ctaText: 'SHOP FESTIVE',
    ctaLink: '/shop?category=festive',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800',
    active: true
  },
  {
    id: 'off-2',
    title: 'Customise Your Dream Bouquet',
    subtitle: 'Pick your flower colours, ribbons & center pearls for special occasions.',
    badgeText: 'CRAFTED BY SHWETHA',
    ctaText: 'CUSTOMISE NOW',
    ctaLink: '/customise',
    imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800',
    active: true
  }
];

const defaultReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-7-rose-bouquet',
    productName: '7 Rose Classic Satin Bouquet',
    customerName: 'Ananya R.',
    rating: 5,
    title: 'Most beautiful flowers that never fade!',
    comment: 'Ordered the 7 Rose Satin Bouquet in Blush Pink for my anniversary. Shwetha crafted it so delicately! The satin petals look so rich and realistic, plus my wife can keep it forever on her nightstand.',
    imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800',
    verifiedPurchase: true,
    approved: true,
    createdAt: '2026-07-28'
  },
  {
    id: 'rev-2',
    productId: 'prod-single-rose',
    productName: 'Single Satin Rose',
    customerName: 'Karthik V.',
    rating: 5,
    title: 'Super cute budget gift',
    comment: 'Got 3 single satin roses for my friends on graduation. Packaging was top notch with a lovely ribbon bow.',
    verifiedPurchase: true,
    approved: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'rev-3',
    productId: 'prod-mini-bouquet-keychain',
    productName: 'Mini Bouquet Keychain',
    customerName: 'Pooja M.',
    rating: 5,
    title: 'Cutest keychain ever!',
    comment: 'Attached it to my handbag and everyone keeps asking where I got it. Highly recommend Flora7!',
    verifiedPurchase: true,
    approved: true,
    createdAt: '2026-08-05'
  }
];

const defaultDeliveryAreas: DeliveryArea[] = [
  { id: 'del-1', pincode: '560001', areaName: 'Bangalore Central / MG Road', city: 'Bangalore', deliveryCharge: 40, active: true },
  { id: 'del-2', pincode: '560034', areaName: 'Koramangala', city: 'Bangalore', deliveryCharge: 40, active: true },
  { id: 'del-3', pincode: '560038', areaName: 'Indiranagar', city: 'Bangalore', deliveryCharge: 40, active: true },
  { id: 'del-4', pincode: '560068', areaName: 'BTM Layout / Silk Board', city: 'Bangalore', deliveryCharge: 40, active: true },
  { id: 'del-5', pincode: '560100', areaName: 'Electronic City', city: 'Bangalore', deliveryCharge: 40, active: true }
];

const defaultWebsiteContent: WebsiteContent = {
  heroTitle: 'FLORA7',
  heroTagline: 'LOVE UNFOLDED',
  heroSubtitle: 'Handmade flowers, crafted with love and made to last.',
  aboutStory: 'Flora7 was born out of a passion for eternal florals and handmade artistry. Each satin ribbon rose is individually shaped, folded, and assembled by hand to create everlasting gifts that never fade.',
  craftedByShwethaText: 'Every piece is personally hand-crafted by Shwetha with utmost attention to ribbon texture, color harmony, and delicate embellishments.',
  contactPhone: '+91 6360084897',
  contactWhatsapp: '+916360084897',
  contactEmail: 'flora7loveunfolded@gmail.com',
  storeAddress: 'Flora7 Online Studio, Bangalore, India',
  pickupTimings: 'Mon - Sat: 10:00 AM - 7:00 PM',
  privacyPolicy: 'At Flora7, we respect your privacy. Customer contact details and addresses are strictly used for fulfilling flower orders and delivery notifications.',
  termsConditions: 'All Flora7 creations are 100% handmade upon order. Minor handcrafted variations add to their unique bespoke beauty.',
  deliveryPolicy: 'Local Bangalore orders are delivered within 1-2 days via courier or direct studio pickup in Koramangala.',
  cancellationPolicy: 'Orders can be cancelled or modified within 4 hours of placement before hand-crafting commences.',
  returnPolicy: 'Due to the custom handmade nature of our products, returns are accepted in case of shipping damage or defective items.'
};

class DatabaseManager {
  private schema!: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(raw);
        // Ensure defaults exist for missing keys if schema evolved
        if (!this.schema.customOptions) this.schema.customOptions = defaultCustomOptions;
        if (!this.schema.orderCounter) this.schema.orderCounter = 1000;
        if (!this.schema.bookingCounter) this.schema.bookingCounter = 500;

        // Ensure owner login credentials are correctly configured for authorized owner
        const ownerSalt = bcrypt.genSaltSync(10);
        const ownerHash = bcrypt.hashSync('010807@f', ownerSalt);

        this.schema.admins = [
          {
            id: 'admin-1',
            email: 'flora7loveunfolded@gmail.com',
            passwordHash: ownerHash,
            name: 'Flora7 Owner',
            role: 'OWNER'
          }
        ];
        // Ensure orders exist with real customer order records (Manya)
        const hasManyaOrder = this.schema.orders?.some(o => o.customerName.toLowerCase().includes('manya'));
        if (!this.schema.orders || this.schema.orders.length === 0 || !hasManyaOrder) {
          const now = new Date().toISOString();
          const realOrders: Order[] = [
            {
              id: 'ord-1001',
              orderNumber: 'FLORA7-01001',
              customerName: 'Manya',
              customerPhone: '9845012345',
              customerEmail: 'manya@gmail.com',
              isPickup: false,
              shippingAddress: 'Indiranagar, Bangalore - 560038',
              deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              preferredSlot: 'Standard Delivery (10:00 AM - 6:00 PM)',
              items: [
                {
                  id: 'cart-item-manya-1',
                  productId: 'prod-7-rose-bouquet',
                  title: '7 Rose Classic Satin Bouquet (Sky Blue & Cream Ivory)',
                  price: 247,
                  quantity: 1,
                  image: '/images/flora7-prod-1786682202966-kwoiv.jpeg',
                  customisationDetails: {
                    colour: 'Sky Blue & Cream Ivory',
                    wrapping: 'Frosted Korean White with Gold Trim',
                    ribbon: 'Luxe Gold Satin Bow'
                  }
                }
              ],
              subtotal: 247,
              discountAmount: 0,
              deliveryFee: 0,
              totalAmount: 247,
              paymentMethod: 'UPI',
              paymentStatus: 'PAID',
              orderStatus: 'RECEIVED',
              giftMessage: 'Handmade with love!',
              specialInstructions: 'Handcrafted satin ribbon bouquet',
              createdAt: now,
              updatedAt: now,
              timeline: [
                {
                  status: 'RECEIVED',
                  label: 'Order Received',
                  description: 'Flora7 order for Manya has been received.',
                  timestamp: now,
                  completed: true
                },
                {
                  status: 'PREPARING',
                  label: 'Being Prepared',
                  description: 'Shwetha is hand-folding satin ribbon roses for Manya\'s bouquet.',
                  timestamp: '',
                  completed: false
                },
                {
                  status: 'READY',
                  label: 'Ready for Dispatch / Pickup',
                  description: 'Packed carefully with delicate ribbon bow.',
                  timestamp: '',
                  completed: false
                },
                {
                  status: 'OUT_FOR_DELIVERY',
                  label: 'Out for Delivery',
                  description: 'Handed to courier / delivery partner.',
                  timestamp: '',
                  completed: false
                },
                {
                  status: 'COMPLETED',
                  label: 'Order Completed',
                  description: 'Delivered safely with love!',
                  timestamp: '',
                  completed: false
                }
              ]
            }
          ];

          // Filter out hypothetical mock orders
          const existingRealOrders = (this.schema.orders || []).filter(
            o => o.customerName !== 'Ananya Sharma' && o.customerName !== 'Kavya Ramesh'
          );

          this.schema.orders = existingRealOrders.length > 0 ? existingRealOrders : realOrders;
        }

        // Ensure email settings and logs exist
        if (!this.schema.emailSettings) {
          this.schema.emailSettings = defaultEmailSettings;
        } else {
          // ensure default emails exist
          if (!this.schema.emailSettings.ownerEmails || this.schema.emailSettings.ownerEmails.length === 0) {
            this.schema.emailSettings.ownerEmails = ['flora7loveunfolded@gmail.com'];
          } else {
            this.schema.emailSettings.ownerEmails = this.schema.emailSettings.ownerEmails.filter(
              e => !e.toLowerCase().includes('swethasathish')
            );
            if (this.schema.emailSettings.ownerEmails.length === 0) {
              this.schema.emailSettings.ownerEmails = ['flora7loveunfolded@gmail.com'];
            }
          }
        }
        if (!this.schema.emailLogs) this.schema.emailLogs = [];
        if (!this.schema.ownerAlerts) this.schema.ownerAlerts = [];

        // Ensure products have valid images
        if (this.schema.products) {
          this.schema.products.forEach(p => {
            if (p.images) {
              p.images = p.images.filter(img => img && !img.includes('.svg'));
            }
          });
        }

        this.save();
      } catch (e) {
        console.error('Error reading DB file, reinitializing default schema:', e);
        this.initDefaultSchema();
      }
    } else {
      this.initDefaultSchema();
    }
  }

  private initDefaultSchema() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('010807@f', salt);

    this.schema = {
      products: defaultSeedProducts,
      orders: [],
      offlineBookings: [],
      inventory: defaultInventory,
      expenses: [
        {
          id: 'exp-1',
          date: new Date().toISOString().split('T')[0],
          category: 'materials',
          amount: 680,
          description: 'Satin ribbon rolls purchase from wholesale textile vendor',
          paymentMethod: 'UPI',
          createdAt: new Date().toISOString()
        }
      ],
      ownerTransactions: [
        {
          id: 'own-1',
          date: new Date().toISOString().split('T')[0],
          type: 'CAPITAL_INVESTMENT',
          amount: 5000,
          description: 'Initial Owner Capital injected for studio tools & raw material stock',
          createdAt: new Date().toISOString()
        }
      ],
      coupons: defaultCoupons,
      offers: defaultOffers,
      reviews: defaultReviews,
      deliveryAreas: defaultDeliveryAreas,
      websiteContent: defaultWebsiteContent,
      customOptions: defaultCustomOptions,
      emailSettings: defaultEmailSettings,
      emailLogs: [],
      ownerAlerts: [],
      admins: [
        {
          id: 'admin-1',
          email: 'flora7loveunfolded@gmail.com',
          passwordHash: defaultPasswordHash,
          name: 'Flora7 Owner',
          role: 'OWNER'
        }
      ],
      orderCounter: 1001,
      bookingCounter: 501
    };
    this.save();
  }

  public save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.schema, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error saving DB to disk:', err);
    }
  }

  // Getters
  public getProducts(): Product[] { return this.schema.products; }
  public getOrders(): Order[] { return this.schema.orders; }
  public getOfflineBookings(): OfflineBooking[] { return this.schema.offlineBookings; }
  public getInventory(): InventoryItem[] { return this.schema.inventory; }
  public getExpenses(): Expense[] { return this.schema.expenses; }
  public getOwnerTransactions(): OwnerTransaction[] { return this.schema.ownerTransactions; }
  public getCoupons(): Coupon[] { return this.schema.coupons; }
  public getOffers(): OfferBanner[] { return this.schema.offers; }
  public getReviews(): Review[] { return this.schema.reviews; }
  public getDeliveryAreas(): DeliveryArea[] { return this.schema.deliveryAreas; }
  public getWebsiteContent(): WebsiteContent { return this.schema.websiteContent; }
  public getCustomOptions(): CustomBouquetMaterialOptions { return this.schema.customOptions; }
  public getAdmins() { return this.schema.admins; }

  // Product Operations
  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const id = `prod-${Date.now()}`;
    const newProd: Product = {
      ...product,
      id,
      createdAt: new Date().toISOString()
    };
    this.schema.products.unshift(newProd);
    this.save();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.schema.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.schema.products[idx] = { ...this.schema.products[idx], ...updates };
    this.save();
    return this.schema.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const idx = this.schema.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.schema.products.splice(idx, 1);
    this.save();
    return true;
  }

  // Order Operations
  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'timeline'>): Order {
    this.schema.orderCounter += 1;
    const orderNumber = `FLORA7-${String(this.schema.orderCounter).padStart(5, '0')}`;
    const id = `ord-${Date.now()}`;
    const now = new Date().toISOString();

    const timeline = [
      {
        status: 'RECEIVED' as const,
        label: 'Order Received',
        description: 'Your Flora7 order has been received and queued.',
        timestamp: now,
        completed: true
      },
      {
        status: 'CONFIRMED' as const,
        label: 'Confirmed',
        description: 'Order confirmed by Flora7 studio.',
        timestamp: '',
        completed: false
      },
      {
        status: 'PREPARING' as const,
        label: 'Being Prepared',
        description: 'Shwetha is hand-folding satin ribbon roses for your order.',
        timestamp: '',
        completed: false
      },
      {
        status: 'READY' as const,
        label: 'Ready for Dispatch / Pickup',
        description: 'Packed carefully with delicate ribbon bow.',
        timestamp: '',
        completed: false
      },
      {
        status: 'OUT_FOR_DELIVERY' as const,
        label: 'Out for Delivery',
        description: 'Handed to courier / driver.',
        timestamp: '',
        completed: false
      },
      {
        status: 'COMPLETED' as const,
        label: 'Order Completed',
        description: 'Delivered safely with love!',
        timestamp: '',
        completed: false
      }
    ];

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now,
      timeline
    };

    this.schema.orders.unshift(newOrder);

    // Update coupon usage count if applied
    if (orderData.couponCode) {
      const coupon = this.schema.coupons.find(c => c.code.toUpperCase() === orderData.couponCode?.toUpperCase());
      if (coupon) {
        coupon.usageCount += 1;
      }
    }

    this.save();
    return newOrder;
  }

  public updateOrderStatus(
    id: string, 
    newStatus?: Order['orderStatus'], 
    paymentStatus?: Order['paymentStatus'],
    paymentMethod?: Order['paymentMethod']
  ): Order | null {
    const order = this.schema.orders.find(o => o.id === id);
    if (!order) return null;

    if (newStatus) {
      order.orderStatus = newStatus;
      // Mark timeline
      let hitCurrent = false;
      order.timeline = order.timeline.map(t => {
        if (t.status === newStatus) {
          hitCurrent = true;
          return { ...t, completed: true, timestamp: new Date().toISOString() };
        }
        if (!hitCurrent && !t.completed) {
          return { ...t, completed: true, timestamp: new Date().toISOString() };
        }
        return t;
      });
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    order.updatedAt = new Date().toISOString();

    this.save();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const order = this.schema.orders.find(o => o.id === id);
    if (!order) return null;

    if (updates.paymentMethod !== undefined) {
      order.paymentMethod = updates.paymentMethod;
    }
    if (updates.paymentStatus !== undefined) {
      order.paymentStatus = updates.paymentStatus;
    }
    if (updates.orderStatus !== undefined) {
      order.orderStatus = updates.orderStatus;
      let hitCurrent = false;
      order.timeline = order.timeline.map(t => {
        if (t.status === updates.orderStatus) {
          hitCurrent = true;
          return { ...t, completed: true, timestamp: new Date().toISOString() };
        }
        if (!hitCurrent && !t.completed) {
          return { ...t, completed: true, timestamp: new Date().toISOString() };
        }
        return t;
      });
    }
    if (updates.customerName !== undefined) order.customerName = updates.customerName;
    if (updates.customerPhone !== undefined) order.customerPhone = updates.customerPhone;
    if (updates.customerEmail !== undefined) order.customerEmail = updates.customerEmail;
    if (updates.shippingAddress !== undefined) order.shippingAddress = updates.shippingAddress;
    if (updates.specialInstructions !== undefined) order.specialInstructions = updates.specialInstructions;
    if (updates.totalAmount !== undefined) order.totalAmount = updates.totalAmount;

    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // Offline Bookings
  public createOfflineBooking(bookingData: Partial<OfflineBooking>): OfflineBooking {
    this.schema.bookingCounter += 1;
    const bookingNumber = `FLORA7-OFF-${String(this.schema.bookingCounter).padStart(4, '0')}`;
    const id = `off-${Date.now()}`;
    const newBooking: OfflineBooking = {
      productOrConcept: bookingData.productOrConcept || 'Custom Bouquet',
      quantity: Number(bookingData.quantity) || 1,
      customDetails: bookingData.customDetails || '',
      preferredDate: bookingData.preferredDate || new Date().toISOString().split('T')[0],
      deliveryOrPickup: bookingData.deliveryOrPickup || 'DELIVERY',
      customerName: bookingData.customerName || 'Offline Customer',
      customerPhone: bookingData.customerPhone || '',
      customerEmail: bookingData.customerEmail || '',
      shippingAddress: bookingData.shippingAddress || '',
      status: bookingData.status || 'PENDING',
      quotedPrice: bookingData.quotedPrice ? Number(bookingData.quotedPrice) : undefined,
      advancePaid: bookingData.advancePaid ? Number(bookingData.advancePaid) : 0,
      paymentMethod: bookingData.paymentMethod || 'UPI',
      paymentStatus: bookingData.paymentStatus || 'UNPAID',
      adminNotes: bookingData.adminNotes || '',
      id,
      bookingNumber,
      createdAt: new Date().toISOString()
    };
    this.schema.offlineBookings.unshift(newBooking);
    this.save();
    return newBooking;
  }

  public updateOfflineBooking(id: string, updates: Partial<OfflineBooking>): OfflineBooking | null {
    const booking = this.schema.offlineBookings.find(b => b.id === id);
    if (!booking) return null;
    Object.assign(booking, updates);
    this.save();
    return booking;
  }

  public deleteOfflineBooking(id: string): boolean {
    const idx = this.schema.offlineBookings.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.schema.offlineBookings.splice(idx, 1);
    this.save();
    return true;
  }

  // Inventory
  public addInventoryItem(item: Omit<InventoryItem, 'id' | 'updatedAt'>): InventoryItem {
    const id = `inv-${Date.now()}`;
    const newItem: InventoryItem = {
      ...item,
      id,
      updatedAt: new Date().toISOString()
    };
    this.schema.inventory.push(newItem);
    this.save();
    return newItem;
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const item = this.schema.inventory.find(i => i.id === id);
    if (!item) return null;
    Object.assign(item, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return item;
  }

  public deleteInventoryItem(id: string): boolean {
    const idx = this.schema.inventory.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.schema.inventory.splice(idx, 1);
    this.save();
    return true;
  }

  // Finance - Expenses & Owner Transactions
  public addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const id = `exp-${Date.now()}`;
    const newExpense: Expense = {
      ...expense,
      id,
      createdAt: new Date().toISOString()
    };
    this.schema.expenses.unshift(newExpense);
    this.save();
    return newExpense;
  }

  public addOwnerTransaction(tx: Omit<OwnerTransaction, 'id' | 'createdAt'>): OwnerTransaction {
    const id = `own-${Date.now()}`;
    const newTx: OwnerTransaction = {
      ...tx,
      id,
      createdAt: new Date().toISOString()
    };
    this.schema.ownerTransactions.unshift(newTx);
    this.save();
    return newTx;
  }

  // Coupons
  public createCoupon(coupon: Omit<Coupon, 'id' | 'usageCount'>): Coupon {
    const id = `c-${Date.now()}`;
    const newCoupon: Coupon = {
      ...coupon,
      id,
      code: coupon.code.toUpperCase(),
      usageCount: 0
    };
    this.schema.coupons.unshift(newCoupon);
    this.save();
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const c = this.schema.coupons.find(x => x.id === id);
    if (!c) return null;
    if (updates.code) updates.code = updates.code.toUpperCase();
    Object.assign(c, updates);
    this.save();
    return c;
  }

  public deleteCoupon(id: string): boolean {
    const idx = this.schema.coupons.findIndex(x => x.id === id);
    if (idx === -1) return false;
    this.schema.coupons.splice(idx, 1);
    this.save();
    return true;
  }

  // Reviews
  public addReview(review: Omit<Review, 'id' | 'approved' | 'createdAt'>): Review {
    const id = `rev-${Date.now()}`;
    const newReview: Review = {
      ...review,
      id,
      approved: false, // requires admin approval
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.schema.reviews.unshift(newReview);
    this.save();
    return newReview;
  }

  public updateReview(id: string, updates: Partial<Review>): Review | null {
    const rev = this.schema.reviews.find(r => r.id === id);
    if (!rev) return null;
    Object.assign(rev, updates);
    this.save();
    return rev;
  }

  // Custom Bouquet Options Management
  public updateCustomOptions(options: CustomBouquetMaterialOptions) {
    this.schema.customOptions = options;
    this.save();
    return this.schema.customOptions;
  }

  // Website Content
  public updateWebsiteContent(content: Partial<WebsiteContent>) {
    this.schema.websiteContent = { ...this.schema.websiteContent, ...content };
    this.save();
    return this.schema.websiteContent;
  }

  // Admin Verification
  public findAdminByEmail(email: string) {
    return this.schema.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  }

  public updateAdminPassword(adminId: string, newPasswordHash: string) {
    const admin = this.schema.admins.find(a => a.id === adminId);
    if (admin) {
      admin.passwordHash = newPasswordHash;
      this.save();
      return true;
    }
    return false;
  }

  // Email Notification Settings & Logs
  public getEmailSettings(): EmailNotificationSettings {
    if (!this.schema.emailSettings) {
      this.schema.emailSettings = { ...defaultEmailSettings };
    }
    return this.schema.emailSettings;
  }

  public updateEmailSettings(updates: Partial<EmailNotificationSettings>): EmailNotificationSettings {
    this.schema.emailSettings = {
      ...this.getEmailSettings(),
      ...updates
    };
    this.save();
    return this.schema.emailSettings;
  }

  public getEmailLogs(): EmailLog[] {
    return this.schema.emailLogs || [];
  }

  public addEmailLog(log: Omit<EmailLog, 'id' | 'timestamp'>): EmailLog {
    if (!this.schema.emailLogs) this.schema.emailLogs = [];
    const newLog: EmailLog = {
      ...log,
      id: `elog-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    // Keep latest 200 logs
    this.schema.emailLogs.unshift(newLog);
    if (this.schema.emailLogs.length > 200) {
      this.schema.emailLogs = this.schema.emailLogs.slice(0, 200);
    }
    this.save();
    return newLog;
  }

  public getOwnerAlerts(): OwnerNotificationAlert[] {
    return this.schema.ownerAlerts || [];
  }

  public addOwnerAlert(alert: Omit<OwnerNotificationAlert, 'id' | 'timestamp' | 'read'>): OwnerNotificationAlert {
    if (!this.schema.ownerAlerts) this.schema.ownerAlerts = [];
    const newAlert: OwnerNotificationAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      timestamp: new Date().toISOString()
    };
    this.schema.ownerAlerts.unshift(newAlert);
    if (this.schema.ownerAlerts.length > 100) {
      this.schema.ownerAlerts = this.schema.ownerAlerts.slice(0, 100);
    }
    this.save();
    return newAlert;
  }

  public markAlertsAsRead(ids?: string[]): void {
    if (!this.schema.ownerAlerts) return;
    if (!ids || ids.length === 0) {
      this.schema.ownerAlerts.forEach(a => { a.read = true; });
    } else {
      this.schema.ownerAlerts.forEach(a => {
        if (ids.includes(a.id)) a.read = true;
      });
    }
    this.save();
  }

  public clearAlerts(): void {
    this.schema.ownerAlerts = [];
    this.save();
  }
}

export const db = new DatabaseManager();
