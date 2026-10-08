import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import {
  User, ShieldCheck, CreditCard, Bell, Save, Check,
  Key, Globe, Smartphone, Mail, Building
} from 'lucide-react'

export default function SettingsView() {
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Aryan Dhillon',
    email: 'aryan.dhillon@example.com',
    phone: '+91 98765 43210',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
    upiId: 'aryan@okaxis',
    bankAccount: '••••••••8912',
    ifsc: 'HDFC0001928',
    nchAutoEscalate: true,
    whatsappAlerts: true,
  })

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <DashboardLayout
      title="Settings & Litigant Profile"
      subtitle="Manage your statutory legal notice identity and restitution payout preferences"
    >
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Litigant Identity Card */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <User size={18} style={{ color: '#84CC16' }} />
                <h3 className="font-jakarta font-bold text-sm text-white">
                  Statutory Litigant Identity
                </h3>
              </div>
              <span
                className="font-mono-ck text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}
              >
                <ShieldCheck size={12} /> DigiLocker Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Full Legal Name (as per Aadhaar)
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
                  style={{ background: '#161921', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Mobile Number (for SMS & WhatsApp SLA alerts)
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
                  style={{ background: '#161921', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Notice Return Postal Address (Required for Formal CPA Section 35 Postings)
              </label>
              <textarea
                rows={2}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#84CC16] resize-none"
                style={{ background: '#161921', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>

          {/* Restitution Settlement Bank Card */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
              <CreditCard size={18} style={{ color: '#84CC16' }} />
              <h3 className="font-jakarta font-bold text-sm text-white">
                Restitution Settlement Account
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  UPI VPA for Instant Direct Refund
                </label>
                <input
                  type="text"
                  value={profile.upiId}
                  onChange={(e) => setProfile({ ...profile, upiId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-mono-ck text-white focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
                  style={{ background: '#161921', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  value={profile.ifsc}
                  onChange={(e) => setProfile({ ...profile, ifsc: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-mono-ck text-white focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
                  style={{ background: '#161921', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>
          </div>

          {/* Redressal Automations & Channels */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
              <Bell size={18} style={{ color: '#84CC16' }} />
              <h3 className="font-jakarta font-bold text-sm text-white">
                Redressal Automation Preferences
              </h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/[0.02]">
                <div>
                  <p className="text-xs font-semibold text-white">
                    Auto-Escalate to NCH Forum on Day 16
                  </p>
                  <p className="font-mono-ck text-[10px]" style={{ color: '#9196B0' }}>
                    If merchant SLA expires without settlement, automatically transmit dossier to National Consumer Helpline.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.nchAutoEscalate}
                  onChange={(e) =>
                    setProfile({ ...profile, nchAutoEscalate: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#84CC16] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/[0.02]">
                <div>
                  <p className="text-xs font-semibold text-white">
                    WhatsApp SLA & Restitution Alerts
                  </p>
                  <p className="font-mono-ck text-[10px]" style={{ color: '#9196B0' }}>
                    Receive real-time delivery receipts, legal counter-replies, and bank credit updates on WhatsApp.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.whatsappAlerts}
                  onChange={(e) =>
                    setProfile({ ...profile, whatsappAlerts: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#84CC16] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{
                background: saved ? '#22C55E' : 'linear-gradient(135deg, #84CC16, #65A300)',
                color: '#0B0D11',
                boxShadow: '0 4px 16px rgba(132,204,22,0.25)',
              }}
            >
              {saved ? <Check size={14} strokeWidth={3} /> : <Save size={14} />}
              <span>{saved ? 'Preferences Saved' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
