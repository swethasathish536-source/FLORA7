import React, { useState } from 'react';
import { Bell, Check, Trash2, Package, Sparkles, Volume2, VolumeX, AlertCircle, ExternalLink } from 'lucide-react';
import { OwnerNotificationAlert } from '../../types';

interface NotificationAlertsDropdownProps {
  alerts: OwnerNotificationAlert[];
  unreadCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onMarkAllRead: () => void;
  onClearAlerts: () => void;
  onSelectOrder: (orderIdOrNumber: string) => void;
}

export const NotificationAlertsDropdown: React.FC<NotificationAlertsDropdownProps> = ({
  alerts,
  unreadCount,
  soundEnabled,
  onToggleSound,
  onMarkAllRead,
  onClearAlerts,
  onSelectOrder
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAlertClick = (alert: OwnerNotificationAlert) => {
    if (alert.orderId || alert.orderNumber) {
      onSelectOrder(alert.orderNumber || alert.orderId || '');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center justify-center cursor-pointer"
        title="Owner Notifications & Order Alerts"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#5C2533] animate-pulse shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#FCE7F0] z-50 text-[#5C2533] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="bg-[#FFF9FA] border-b border-[#FCE7F0] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#FCE7F0] rounded-lg text-[#B76E79]">
                  <Bell className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#5C2533]">Store Alerts</h3>
                  <p className="text-[10px] text-[#8C5263]">Real-time customer order updates</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    soundEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}
                  title={soundEnabled ? 'Audio Chime Enabled on New Orders' : 'Audio Chime Muted'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="p-1.5 hover:bg-[#FCE7F0] rounded-lg text-xs text-[#B76E79] font-medium transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}

                {alerts.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAlerts}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg text-xs transition-colors"
                    title="Clear alert list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Alert Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#FCE7F0]/60">
              {alerts.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-[#8C5263]">
                  <Package className="w-8 h-8 mx-auto text-[#B76E79]/40" />
                  <p className="text-xs font-semibold">No New Alerts</p>
                  <p className="text-[11px] text-gray-400">Incoming online orders and bookings will ring and appear here instantly.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    className={`p-3.5 hover:bg-[#FFF9FA] transition-colors cursor-pointer flex items-start gap-3 ${
                      !alert.read ? 'bg-[#FFF5F7]' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      {alert.type === 'NEW_ORDER' ? (
                        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          🛍️
                        </span>
                      ) : alert.type === 'CUSTOM_BOOKING' ? (
                        <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                          🌸
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-rose-100 text-[#B76E79] flex items-center justify-center font-bold text-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${!alert.read ? 'text-[#5C2533]' : 'text-gray-700'}`}>
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A4654] leading-snug">
                        {alert.message}
                      </p>
                      {(alert.orderId || alert.orderNumber) && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#B76E79] font-bold mt-1">
                          <span>View Order</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-[#B76E79] mt-2 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#FFF9FA] border-t border-[#FCE7F0] p-3 text-center">
              <span className="text-[11px] text-[#8C5263] flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#B76E79]" />
                Auto-synced with Email & Owner Portal
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
