import React, { useState, useEffect } from 'react';
import {
  Mail, Settings, CheckCircle2, AlertCircle, RefreshCw, Send, Eye, X,
  ShieldCheck, Inbox, ArrowUpRight, Copy, Check, Filter, Search, Sparkles
} from 'lucide-react';
import { EmailNotificationSettings, EmailLog } from '../../types';

interface EmailLogsAndSettingsProps {
  token: string | null;
}

export const EmailLogsAndSettings: React.FC<EmailLogsAndSettingsProps> = ({ token }) => {
  const [settings, setSettings] = useState<EmailNotificationSettings>({
    ownerEmails: ['flora7loveunfolded@gmail.com'],
    notifyOnNewOrder: true,
    notifyOnStatusChange: true,
    notifyOnCustomBooking: true,
    notifyCustomerOnReceipt: true,
    notifyCustomerOnStatusChange: true,
    fromEmail: 'flora7loveunfolded@gmail.com',
    fromName: 'Flora7 Studio Bangalore',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: ''
  });

  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Email input for adding new owner email
  const [newEmailInput, setNewEmailInput] = useState('');

  // Test Email state
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Filter logs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SENT' | 'LOGGED' | 'FAILED'>('ALL');
  const [recipientTypeFilter, setRecipientTypeFilter] = useState<'ALL' | 'OWNER' | 'CUSTOMER'>('ALL');

  // Preview Modal
  const [previewLog, setPreviewLog] = useState<EmailLog | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Resending state
  const [resendingLogId, setResendingLogId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resSettings, resLogs] = await Promise.all([
        fetch('/api/notifications/email-settings', { headers }).then(r => r.json()),
        fetch('/api/notifications/email-logs', { headers }).then(r => r.json())
      ]);

      if (resSettings && !resSettings.error) {
        setSettings(resSettings);
        if (resSettings.ownerEmails && resSettings.ownerEmails.length > 0) {
          setTestEmailAddress(resSettings.ownerEmails[0]);
        }
      }
      if (Array.isArray(resLogs)) {
        setLogs(resLogs);
      }
    } catch (err) {
      console.error('Error loading email data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/notifications/email-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmail = () => {
    const clean = newEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;
    if (settings.ownerEmails.includes(clean)) {
      setNewEmailInput('');
      return;
    }
    setSettings(prev => ({
      ...prev,
      ownerEmails: [...prev.ownerEmails, clean]
    }));
    setNewEmailInput('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      ownerEmails: prev.ownerEmails.filter(e => e !== emailToRemove)
    }));
  };

  const handleSendTestEmail = async () => {
    const target = testEmailAddress.trim() || (settings.ownerEmails[0] || 'flora7loveunfolded@gmail.com');
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/notifications/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetEmail: target })
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult({
          success: true,
          message: `Test email dispatched for ${target}. Status: ${data.status || 'OK'}`
        });
        fetchData();
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to dispatch test notification'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error sending test email'
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleResendFromLog = async (log: EmailLog) => {
    if (!log.orderId && !log.orderNumber) {
      alert('This log entry does not have an associated order ID');
      return;
    }

    setResendingLogId(log.id);
    try {
      const targetId = log.orderId || log.orderNumber;
      const res = await fetch(`/api/orders/${targetId}/resend-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          target: log.recipientType,
          customEmail: log.recipient
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Email notification resent to ${log.recipient}!`);
        fetchData();
      } else {
        alert(data.error || 'Failed to resend email');
      }
    } catch (err: any) {
      alert(err.message || 'Error resending email');
    } finally {
      setResendingLogId(null);
    }
  };

  const handleCopyHtml = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const filteredLogs = logs.filter(log => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      log.recipient.toLowerCase().includes(q) ||
      log.subject.toLowerCase().includes(q) ||
      (log.orderNumber && log.orderNumber.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesType = recipientTypeFilter === 'ALL' || log.recipientType === recipientTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header Overview Card */}
      <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9FA] border border-[#FCE7F0] text-[#B76E79] flex items-center justify-center shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#5C2533]">
                Email Notification & Alert Center
              </h2>
              <p className="text-xs text-[#8C5263]">
                Automated email alerts when customers place orders or custom bouquet bookings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-[#FFF9FA] hover:bg-[#FCE7F0] text-[#5C2533] border border-[#FCE7F0] text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-5 py-2 bg-[#B76E79] hover:bg-[#9E5762] text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Email notification settings updated and verified successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Settings & Notification Triggers */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Email Recipients Card */}
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#5C2533] flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#B76E79]" />
                Owner Alert Email IDs
              </h3>
              <span className="text-[10px] bg-[#FFF9FA] text-[#8C5263] border border-[#FCE7F0] px-2.5 py-0.5 rounded-full font-bold">
                {settings.ownerEmails.length} active
              </span>
            </div>
            <p className="text-xs text-[#8C5263] leading-relaxed">
              When a customer places an order on Flora7, instant email notifications will be sent to these addresses:
            </p>

            {/* List of active emails */}
            <div className="space-y-2">
              {settings.ownerEmails.map((em, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-mono font-medium text-[#5C2533] truncate">{em}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(em)}
                    className="text-gray-400 hover:text-red-600 p-1 text-xs transition-colors ml-2"
                    title="Remove recipient"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new email */}
            <div className="flex gap-2 pt-1">
              <input
                type="email"
                placeholder="Add another notification email..."
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                className="flex-1 bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#B76E79]"
              />
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-4 py-2 bg-[#5C2533] hover:bg-[#3D1822] text-white text-xs font-bold rounded-2xl transition-colors shrink-0 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Trigger Toggles Card */}
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[#5C2533] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B76E79]" />
              Automated Notification Triggers
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-3 p-3 bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl cursor-pointer hover:bg-[#FCE7F0]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.notifyOnNewOrder}
                  onChange={(e) => setSettings({ ...settings, notifyOnNewOrder: e.target.checked })}
                  className="mt-0.5 rounded text-[#B76E79] focus:ring-[#B76E79]"
                />
                <div>
                  <p className="font-bold text-[#5C2533]">Instant Alert on New Order</p>
                  <p className="text-[11px] text-[#8C5263]">
                    Send full order breakdown (items, price, delivery address, customer phone) directly to owner email.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl cursor-pointer hover:bg-[#FCE7F0]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.notifyOnCustomBooking}
                  onChange={(e) => setSettings({ ...settings, notifyOnCustomBooking: e.target.checked })}
                  className="mt-0.5 rounded text-[#B76E79] focus:ring-[#B76E79]"
                />
                <div>
                  <p className="font-bold text-[#5C2533]">Bespoke & Offline Booking Inquiries</p>
                  <p className="text-[11px] text-[#8C5263]">
                    Send immediate alert when a customer requests a customized event bouquet.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl cursor-pointer hover:bg-[#FCE7F0]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.notifyCustomerOnReceipt}
                  onChange={(e) => setSettings({ ...settings, notifyCustomerOnReceipt: e.target.checked })}
                  className="mt-0.5 rounded text-[#B76E79] focus:ring-[#B76E79]"
                />
                <div>
                  <p className="font-bold text-[#5C2533]">Customer Order Confirmation Receipt</p>
                  <p className="text-[11px] text-[#8C5263]">
                    Email a digital invoice and order confirmation receipt to the customer's email address.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl cursor-pointer hover:bg-[#FCE7F0]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.notifyOnStatusChange}
                  onChange={(e) => setSettings({ ...settings, notifyOnStatusChange: e.target.checked })}
                  className="mt-0.5 rounded text-[#B76E79] focus:ring-[#B76E79]"
                />
                <div>
                  <p className="font-bold text-[#5C2533]">Delivery Status Updates</p>
                  <p className="text-[11px] text-[#8C5263]">
                    Notify customer when order transitions to "Preparing", "Out for Delivery", or "Delivered".
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Quick Test Email Dispatch */}
          <div className="bg-gradient-to-br from-[#FFF9FA] to-[#FCE7F0]/50 rounded-3xl border border-[#FCE7F0] p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[#5C2533] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#B76E79]" />
              Test Email Dispatch
            </h3>
            <p className="text-xs text-[#8C5263]">
              Send a simulated order alert to verify mailbox delivery and HTML layout rendering.
            </p>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Target test email (e.g. flora7loveunfolded@gmail.com)"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="w-full bg-white border border-[#FCE7F0] rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#B76E79]"
              />

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="w-full py-2.5 bg-[#B76E79] hover:bg-[#9E5762] text-white text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{sendingTest ? 'Dispatching Test Email...' : 'Send Test Notification Email'}</span>
              </button>

              {testResult && (
                <div
                  className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Email Logs & Dispatches */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#5C2533] flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-[#B76E79]" />
                  Dispatched Email History ({filteredLogs.length})
                </h3>
                <p className="text-xs text-[#8C5263]">
                  Audit log of every automated notification sent to owner and customers.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-2.5 py-1.5 text-xs text-[#5C2533] focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SENT">Sent via SMTP</option>
                  <option value="LOGGED">Logged</option>
                  <option value="FAILED">Failed</option>
                </select>

                <select
                  value={recipientTypeFilter}
                  onChange={(e) => setRecipientTypeFilter(e.target.value as any)}
                  className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-2.5 py-1.5 text-xs text-[#5C2533] focus:outline-none"
                >
                  <option value="ALL">All Recipients</option>
                  <option value="OWNER">Owner Alerts</option>
                  <option value="CUSTOMER">Customer Receipts</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C5263] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order #, email, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#B76E79]"
              />
            </div>

            {/* Log Table / List */}
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Mail className="w-10 h-10 text-[#B76E79]/30 mx-auto" />
                <p className="text-xs font-semibold text-[#5C2533]">No Email Logs Found</p>
                <p className="text-[11px] text-[#8C5263] max-w-sm mx-auto">
                  When orders are placed, the email service records each sent notification here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#FCE7F0] text-[#8C5263] uppercase text-[10px]">
                      <th className="py-2.5 px-2">Timestamp & Order</th>
                      <th className="py-2.5 px-2">Recipient</th>
                      <th className="py-2.5 px-2">Subject</th>
                      <th className="py-2.5 px-2">Status</th>
                      <th className="py-2.5 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FCE7F0]/60 text-[#5C2533]">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FFF9FA]/60 transition-colors">
                        <td className="py-3 px-2 align-top">
                          <span className="font-mono font-bold text-[#B76E79] block">
                            {log.orderNumber || 'SYSTEM'}
                          </span>
                          <span className="text-[10px] text-[#8C5263] block">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-2 align-top max-w-[160px]">
                          <span className="font-medium text-[#5C2533] block truncate" title={log.recipient}>
                            {log.recipient}
                          </span>
                          <span
                            className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-md mt-0.5 ${
                              log.recipientType === 'OWNER'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {log.recipientType}
                          </span>
                        </td>
                        <td className="py-3 px-2 align-top max-w-[200px]">
                          <p className="text-[11px] font-semibold text-[#5C2533] line-clamp-2" title={log.subject}>
                            {log.subject}
                          </p>
                        </td>
                        <td className="py-3 px-2 align-top">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              log.status === 'SENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'LOGGED'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.status === 'SENT' ? '✓ SENT' : log.status === 'LOGGED' ? 'LOGGED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right align-top space-x-1">
                          <button
                            type="button"
                            onClick={() => setPreviewLog(log)}
                            className="p-1.5 hover:bg-[#FCE7F0] text-[#5C2533] rounded-lg transition-colors inline-block"
                            title="Preview Email HTML"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {(log.orderId || log.orderNumber) && (
                            <button
                              type="button"
                              onClick={() => handleResendFromLog(log)}
                              disabled={resendingLogId === log.id}
                              className="p-1.5 hover:bg-[#B76E79] hover:text-white text-[#B76E79] rounded-lg transition-colors inline-block"
                              title="Resend Email"
                            >
                              <Send className={`w-3.5 h-3.5 ${resendingLogId === log.id ? 'animate-spin' : ''}`} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SMTP Configuration (Optional Setup Accordion) */}
          <div className="bg-white rounded-3xl border border-[#FCE7F0] p-6 shadow-sm space-y-4">
            <details className="group">
              <summary className="font-serif font-bold text-sm text-[#5C2533] flex items-center justify-between cursor-pointer list-none">
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#B76E79]" />
                  Custom SMTP Server Configuration (Optional)
                </span>
                <span className="text-xs text-[#B76E79] group-open:rotate-180 transition-transform">▼</span>
              </summary>

              <div className="pt-4 space-y-3 text-xs border-t border-[#FCE7F0] mt-3">
                <p className="text-[11px] text-[#8C5263]">
                  Flora7 is pre-configured with direct dispatch to <strong>flora7loveunfolded@gmail.com</strong>. You can optionally supply your own custom SMTP host (e.g. Gmail App Password or SendGrid) below:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C5263] mb-1">SMTP Host</label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      value={settings.smtpHost || ''}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                      className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C5263] mb-1">SMTP Port</label>
                    <input
                      type="number"
                      placeholder="587"
                      value={settings.smtpPort || 587}
                      onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                      className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C5263] mb-1">SMTP User / Email</label>
                    <input
                      type="text"
                      placeholder="flora7loveunfolded@gmail.com"
                      value={settings.smtpUser || ''}
                      onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                      className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C5263] mb-1">App Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={settings.smtpPass || ''}
                      onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                      className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-4 py-1.5 bg-[#B76E79] text-white text-xs font-bold rounded-full hover:bg-[#9E5762] transition-colors"
                  >
                    Save SMTP Settings
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {previewLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#FCE7F0] space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCE7F0]">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#B76E79]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#5C2533]">Email Notification Preview</h3>
                  <p className="text-[11px] text-[#8C5263]">
                    Sent to <strong>{previewLog.recipient}</strong> on {new Date(previewLog.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewLog(null)}
                className="p-2 hover:bg-[#FCE7F0] rounded-full text-gray-400 hover:text-[#5C2533] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FFF9FA] p-3 rounded-2xl border border-[#FCE7F0] text-xs space-y-1 text-[#5C2533]">
              <p><strong>Subject:</strong> {previewLog.subject}</p>
              <p><strong>Recipient:</strong> {previewLog.recipient} ({previewLog.recipientType})</p>
              <p><strong>Status:</strong> {previewLog.status}</p>
            </div>

            {/* Email Rendered Body */}
            <div className="flex-1 overflow-y-auto border border-[#FCE7F0] rounded-2xl p-4 bg-[#FDF6F7]">
              {previewLog.htmlBody ? (
                <div dangerouslySetInnerHTML={{ __html: previewLog.htmlBody }} />
              ) : (
                <pre className="text-xs text-[#5C2533] whitespace-pre-wrap font-sans">
                  {previewLog.textBody}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#FCE7F0]">
              <button
                type="button"
                onClick={() => handleCopyHtml(previewLog.htmlBody || previewLog.textBody)}
                className="px-4 py-2 bg-[#FFF9FA] hover:bg-[#FCE7F0] border border-[#FCE7F0] text-[#5C2533] text-xs font-bold rounded-full transition-colors flex items-center gap-1.5"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied Content!' : 'Copy Content'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewLog(null)}
                className="px-5 py-2 bg-[#5C2533] hover:bg-[#3D1822] text-white text-xs font-bold rounded-full transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
