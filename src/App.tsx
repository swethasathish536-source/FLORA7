import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Flora7AiAssistant } from './components/Flora7AiAssistant';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { CustomBouquetPage } from './pages/CustomBouquetPage';
import { OccasionsPage } from './pages/OccasionsPage';
import { OffersPage } from './pages/OffersPage';
import { BookingPage } from './pages/BookingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { PrivacyPolicy, ShippingPolicy, RefundPolicy, TermsConditions } from './pages/LegalPages';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { useAuth } from './context/AuthContext';

const ALLOWED_OWNER_EMAILS = [
  'flora7loveunfolded@gmail.com'
];

const OwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, adminUser } = useAuth();
  const isAuthorizedOwner = 
    isAuthenticated && 
    adminUser && 
    adminUser.role === 'OWNER' && 
    ALLOWED_OWNER_EMAILS.includes((adminUser.email || '').toLowerCase());

  if (!isAuthorizedOwner) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export function App() {
  const [pwaModalOpen, setPwaModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-[#FFF9FA] text-[#2D2727] font-sans flex flex-col justify-between selection:bg-[#FCE7F0] selection:text-[#5C2533]">
            
            {/* Navigation Header */}
            <Navbar onOpenPwaModal={() => setPwaModalOpen(true)} />

            {/* Main Page Body */}
            <main className="flex-1 pb-16 md:pb-0">
              <Routes>
                <Route path="/" element={<Home onOpenPwaModal={() => setPwaModalOpen(true)} />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/customise" element={<CustomBouquetPage />} />
                <Route path="/occasions" element={<OccasionsPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                
                {/* Legal Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />

                {/* Admin / Owner Portal (Protected - Owner only) */}
                <Route path="/admin" element={<OwnerRoute><AdminDashboard /></OwnerRoute>} />
                <Route path="/owner" element={<OwnerRoute><AdminDashboard /></OwnerRoute>} />
                <Route path="/owner-portal" element={<OwnerRoute><AdminDashboard /></OwnerRoute>} />
                <Route path="/admin/dashboard" element={<OwnerRoute><AdminDashboard /></OwnerRoute>} />
                <Route path="/admin/login" element={<AdminLogin />} />
              </Routes>
            </main>

            {/* Floating Gemini AI Floral Concierge Assistant */}
            <Flora7AiAssistant />

            {/* Floating WhatsApp Action Button */}
            <WhatsAppButton />

            {/* Footer */}
            <Footer onOpenPwaModal={() => setPwaModalOpen(true)} />

            {/* Mobile Navigation Bar */}
            <MobileNav />

            {/* PWA Installation Modal */}
            <PwaInstallBanner isOpen={pwaModalOpen} onClose={() => setPwaModalOpen(false)} />

          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
