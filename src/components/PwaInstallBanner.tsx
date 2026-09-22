import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  CheckCircle2, 
  ExternalLink, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  Share2 
} from 'lucide-react';

interface PwaInstallBannerProps {
  isOpenModal?: boolean;
  isOpen?: boolean;
  onCloseModal?: () => void;
  onClose?: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({
  isOpenModal,
  isOpen,
  onCloseModal,
  onClose
}) => {
  const isModalVisible = isOpenModal ?? isOpen ?? false;
  const handleClose = onCloseModal || onClose || (() => {});

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'apk' | 'qr'>('quick');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto-show banner if not running standalone
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setIsBannerVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsBannerVisible(false);
        }
      } catch (err) {
        console.warn('Installation error:', err);
      }
      setDeferredPrompt(null);
      setInstalling(false);
    } else {
      setActiveTab('quick');
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://flora7.com';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(currentUrl)}&bgcolor=FFFFFF&color=5C2533&margin=10`;
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  return (
    <>
      {/* Subtle Floating Top Notification Banner */}
      {isBannerVisible && !isInstalled && (
        <div className="bg-[#FFF9FA] border-b border-[#FCE7F0] p-3 text-xs text-[#5C2533] shadow-xs flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300 z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#FCE7F0] bg-[#5C2533] shrink-0 flex items-center justify-center shadow-xs">
              <img src="/pwa-192x192.png" alt="Flora7 Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#5C2533]">Install Flora7 Android App / APK 🌸</p>
              <p className="text-[11px] text-[#7A6B6E]">Enjoy faster checkout, bouquet tracking & home screen access</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={deferredPrompt ? handleInstallClick : () => {}}
              className="px-3.5 py-1.5 bg-[#B76E79] text-white font-semibold rounded-full hover:bg-[#9E5762] transition-all flex items-center gap-1.5 shadow-xs text-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{deferredPrompt ? 'INSTALL NOW' : 'GET APP'}</span>
            </button>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="p-1 text-[#8C5263] hover:text-[#5C2533]"
              aria-label="Close banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive Android App & APK Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#FCE7F0] shadow-2xl relative my-8 text-[#3D1822] animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 text-[#8C5263] hover:text-[#5C2533] rounded-full hover:bg-[#FCE7F0]/50 transition-colors"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

              {/* App Header & Icon */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-[#FCE7F0] bg-[#5C2533] flex-shrink-0">
                  <img src="/pwa-192x192.png" alt="Flora7 App Icon" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B76E79]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Android Application Package (.APK)</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#5C2533]">
                    Flora7 for Android
                  </h3>
                  <p className="text-xs text-[#8C5263]">
                    Handmade satin ribbon roses • Native mobile APK ready to download
                  </p>
                </div>
              </div>

              {/* Direct APK Download Highlight Box */}
              <div className="bg-linear-to-r from-[#FFF0F4] to-[#FDF2F5] border-2 border-[#B76E79]/40 rounded-2xl p-4 mb-5 shadow-xs">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#5C2533] text-white flex items-center justify-center shadow-xs">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5C2533]">Direct APK Installer</h4>
                      <p className="text-[11px] text-[#8C5263]">Flora7-LoveUnfolded.apk (v1.0.0 • Signed)</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    Ready
                  </span>
                </div>

                <p className="text-xs text-[#5C2533] mb-3 leading-relaxed">
                  Download the Android installer file directly to your phone. Tap to install and run Flora7 like any native app.
                </p>

                <a
                  href="/flora7-loveunfolded.apk"
                  download="Flora7-LoveUnfolded.apk"
                  className="w-full py-3.5 px-5 bg-[#5C2533] hover:bg-[#431822] active:scale-98 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                  id="direct-apk-download-btn"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Flora7 .APK (Instant)</span>
                </a>

                <div className="mt-3 pt-3 border-t border-[#F4B8C7]/50 flex items-center justify-between text-[11px] text-[#8C5263]">
                  <span>📦 Size: ~61 KB</span>
                  <span>🛡️ Android 5.0 to 14+</span>
                  <span>✨ Signed & Verified</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex bg-[#FDF2F5] p-1 rounded-2xl mb-5 border border-[#FCE7F0]">
                <button
                  onClick={() => setActiveTab('apk')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'apk'
                      ? 'bg-white text-[#5C2533] shadow-xs'
                      : 'text-[#8C5263] hover:text-[#5C2533]'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>APK Instructions</span>
                </button>
                <button
                  onClick={() => setActiveTab('quick')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'quick'
                      ? 'bg-white text-[#5C2533] shadow-xs'
                      : 'text-[#8C5263] hover:text-[#5C2533]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>1-Tap Install (WebAPK)</span>
                </button>
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'qr'
                      ? 'bg-white text-[#5C2533] shadow-xs'
                      : 'text-[#8C5263] hover:text-[#5C2533]'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan Mobile QR</span>
                </button>
              </div>

            {/* Tab 1: Direct Android Installation (WebAPK) */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                {isInstalled ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-emerald-800 text-sm">App Already Installed!</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Flora7 is installed and running in standalone app mode on this device.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#5C2533] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#5C2533]">Native Android WebAPK Minting</p>
                          <p className="text-[11px] text-[#8C5263] leading-relaxed">
                            Google Chrome & Android automatically generate a signed Android WebAPK with an app drawer icon, launch splash screen, and offline cache.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#B76E79] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#5C2533]">Full-Screen Standalone App</p>
                          <p className="text-[11px] text-[#8C5263] leading-relaxed">
                            Launches without browser address bars, identical to an installed Google Play Store application.
                          </p>
                        </div>
                      </div>
                    </div>

                    {deferredPrompt ? (
                      <button
                        onClick={handleInstallClick}
                        disabled={installing}
                        className="w-full py-3.5 px-6 bg-linear-to-r from-[#5C2533] to-[#8C3B52] hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#5C2533]/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                      >
                        <Download className="w-4 h-4" />
                        <span>{installing ? 'Preparing Android App...' : 'Install Flora7 on this Phone'}</span>
                      </button>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[12px] text-amber-900 leading-relaxed space-y-2">
                        <p className="font-bold flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-amber-700" />
                          <span>To install on Android right now:</span>
                        </p>
                        <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                          <li>Open this page in <strong>Chrome</strong> or <strong>Samsung Internet</strong> on your Android phone.</li>
                          <li>Tap the browser menu <strong>(three dots ⋮ in top right)</strong>.</li>
                          <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                          <li>Tap <strong>Install</strong>. Android will create the Flora7 APK on your home screen!</li>
                        </ol>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Tab 2: Standalone APK Direct Download & Steps */}
            {activeTab === 'apk' && (
              <div className="space-y-4">
                <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5C2533]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Installing Flora7-LoveUnfolded.apk</span>
                  </div>

                  <div className="space-y-2 text-xs text-[#5C2533]">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#5C2533] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <p><strong>Download the file:</strong> Tap the brown <strong>"Download .APK"</strong> button below to save <code>Flora7-LoveUnfolded.apk</code>.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#5C2533] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <p><strong>Open the file:</strong> When download finishes, pull down your notification tray or go to your <strong>Files / Downloads</strong> app and tap the file.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#5C2533] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      <p><strong>Install:</strong> Tap <strong>"Install"</strong>. If Android displays a prompt saying <em>"Install unknown apps"</em>, toggle <strong>Allow</strong> and tap Install. Flora7 will now be installed with its icon on your phone!</p>
                    </div>
                  </div>
                </div>

                <a
                  href="/flora7-loveunfolded.apk"
                  download="Flora7-LoveUnfolded.apk"
                  className="w-full py-3.5 px-6 bg-[#5C2533] hover:bg-[#431822] text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Flora7 .APK (~61 KB)</span>
                </a>
              </div>
            )}

            {/* Tab 3: Scan Mobile QR Code */}
            {activeTab === 'qr' && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-[#8C5263]">
                  Point your Android phone's camera at this QR code to open Flora7 and install:
                </p>

                <div className="inline-block p-4 bg-white rounded-3xl border-2 border-[#FCE7F0] shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="Scan QR code to install Flora7 on Android"
                    className="w-48 h-48 mx-auto rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-[#5C2533]">
                  <span className="text-[11px] text-[#8C5263] truncate max-w-[220px]">
                    {currentUrl}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 bg-[#FDF2F5] text-[#B76E79] hover:text-[#5C2533] rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[#FCE7F0] flex items-center justify-between text-[11px] text-[#8C5263]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WebAPK & Offline PWA Verified</span>
              </span>
              <button
                onClick={handleClose}
                className="font-bold text-[#5C2533] hover:underline"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
