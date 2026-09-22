import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'apk' | 'qr'>('quick');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://flora7.com';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&bgcolor=FFFFFF&color=5C2533&margin=10`;
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  const handleQuickInstall = async () => {
    setInstalling(true);
    if (isInstallable) {
      await install();
    } else {
      setActiveTab('quick');
    }
    setInstalling(false);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#FCE7F0] shadow-2xl relative my-8 text-[#3D1822]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#8C5263] hover:text-[#5C2533] rounded-full hover:bg-[#FCE7F0]/50 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-[#FCE7F0] bg-[#5C2533] flex-shrink-0 flex items-center justify-center">
            <img src="/pwa-192x192.png" alt="Flora7 App Icon" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B76E79]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Android App & APK</span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#5C2533]">
              Get Flora7 for Android
            </h3>
            <p className="text-xs text-[#8C5263]">
              Install directly on your phone with zero app store lag
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#FDF2F5] p-1 rounded-2xl mb-6 border border-[#FCE7F0]">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quick'
                ? 'bg-white text-[#5C2533] shadow-xs'
                : 'text-[#8C5263] hover:text-[#5C2533]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Direct Install</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-white text-[#5C2533] shadow-xs'
                : 'text-[#8C5263] hover:text-[#5C2533]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Package .APK</span>
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
            <span>Scan QR</span>
          </button>
        </div>

        {/* Tab 1: Quick Install (WebAPK) */}
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
                      <p className="text-xs font-bold text-[#5C2533]">One-Tap Android WebAPK Minting</p>
                      <p className="text-[11px] text-[#8C5263] leading-relaxed">
                        Chrome on Android creates a native signed Android WebAPK with an app drawer icon, splash screen, and offline support.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#B76E79] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#5C2533]">Instant Home Screen & Notifications</p>
                      <p className="text-[11px] text-[#8C5263] leading-relaxed">
                        Launches full-screen without any browser address bar, identical to an installed Google Play Store app.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Android Browser Install Button */}
                {isInstallable ? (
                  <button
                    onClick={handleQuickInstall}
                    disabled={installing}
                    className="w-full py-3.5 px-6 bg-linear-to-r from-[#5C2533] to-[#8C3B52] hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#5C2533]/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installing ? 'Preparing Android App...' : 'Install Flora7 on this Phone'}</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[12px] text-amber-900 leading-relaxed">
                      <strong>📱 To install on Android right now:</strong>
                      <ol className="list-decimal pl-4 mt-1.5 space-y-1">
                        <li>Tap the <strong>three dots (⋮)</strong> menu in the top right of Chrome.</li>
                        <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                        <li>Android will generate and place the Flora7 app on your home screen and app drawer!</li>
                      </ol>
                    </div>
                  </div>
                )}
              </>
            )}

            {isIOS && (
              <div className="p-3 bg-[#FDF2F5] border border-[#FCE7F0] rounded-xl text-xs text-[#5C2533] space-y-1">
                <strong>iPhone / iPad instructions:</strong>
                <p className="text-[11px] text-[#8C5263]">
                  Tap the Safari <strong>Share (⎋)</strong> icon at the bottom, then scroll down and tap <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Standalone APK Generator */}
        {activeTab === 'apk' && (
          <div className="space-y-4">
            <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#5C2533]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Standard Android APK Package</span>
              </div>
              <p className="text-xs text-[#8C5263] leading-relaxed">
                Because this application has a verified Web App Manifest and Service Worker, you can generate a signed standalone <strong>.apk</strong> or <strong>.aab</strong> file for Android using <strong>PWABuilder</strong> (maintained by Microsoft & Google):
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs bg-white border border-[#FCE7F0] rounded-xl p-2.5">
                  <span className="font-mono text-[11px] text-[#5C2533] truncate max-w-[240px]">
                    {currentUrl}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#B76E79] hover:text-[#5C2533] px-2 py-1 bg-[#FDF2F5] rounded-lg transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <ol className="list-decimal pl-4 text-[11px] text-[#5C2533] space-y-1 pt-1">
                  <li>Click <strong>"Generate .APK on PWABuilder"</strong> below.</li>
                  <li>Click <strong>"Package for Android"</strong> to download your signed <strong>.apk</strong> file.</li>
                  <li>Install the .apk on any Android phone or upload it to Google Play!</li>
                </ol>
              </div>
            </div>

            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 bg-[#5C2533] hover:bg-[#431822] text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Generate .APK on PWABuilder</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Tab 3: Scan QR Code */}
        {activeTab === 'qr' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-[#8C5263]">
              Point your Android phone's camera at this QR code to open and install the app instantly:
            </p>

            <div className="inline-block p-4 bg-white rounded-3xl border-2 border-[#FCE7F0] shadow-sm">
              <img
                src={qrCodeUrl}
                alt="Scan to open Flora7 on Android"
                className="w-48 h-48 mx-auto rounded-xl"
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-[#5C2533] font-semibold">
              <span>Link:</span>
              <span className="font-mono text-[11px] text-[#8C5263] truncate max-w-[200px]">
                {currentUrl}
              </span>
              <button
                onClick={handleCopyUrl}
                className="p-1 text-[#B76E79] hover:text-[#5C2533] transition-colors"
                title="Copy link"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-[#FCE7F0] flex items-center justify-between text-[11px] text-[#8C5263]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PWA & WebAPK Ready</span>
          </span>
          <button
            onClick={onClose}
            className="font-bold text-[#5C2533] hover:underline"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
