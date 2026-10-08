import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import {
  IndianRupee, TrendingUp, CheckCircle2, Clock, AlertCircle,
  ArrowUpRight, ShieldCheck, ChevronRight, Download
} from 'lucide-react'

const SETTLEMENTS = [
  {
    id: 'TXN-9021',
    caseId: 'CK-88201',
    product: 'Samsung Galaxy M34 5G',
    merchant: 'Samsung India',
    amount: '₹18,999',
    type: 'Full Bank Refund',
    status: 'completed',
    date: '08 Mar 2024',
    utr: 'UTR-HDFC000192841',
  },
  {
    id: 'TXN-8511',
    caseId: 'CK-85110',
    product: 'Prestige Induction Cooktop',
    merchant: 'Meesho / TTK Prestige',
    amount: '₹6,200',
    type: 'Escrow Settlement',
    status: 'completed',
    date: '04 Feb 2024',
    utr: 'UTR-ICIC881928491',
  },
  {
    id: 'TXN-8100',
    caseId: 'CK-81003',
    product: 'Puma Sports Shoes',
    merchant: 'Myntra Designs',
    amount: '₹4,500',
    type: 'Instant UPI Refund',
    status: 'completed',
    date: '20 Jan 2024',
    utr: 'UTR-AXIS772918231',
  },
  {
    id: 'TXN-9042',
    caseId: 'CK-90428',
    product: 'boAt Airdopes 141 ANC',
    merchant: 'boAt Lifestyle / Amazon',
    amount: '₹2,499',
    type: 'Statutory 15-day SLA Active',
    status: 'pending',
    date: 'SLA due in 14 days',
    utr: 'Pending Merchant Response',
  },
]

export default function RestitutionTracker() {
  const navigate = useNavigate()

  return (
    <DashboardLayout
      title="Restitution Tracker"
      subtitle="Direct merchant payouts, statutory refunds, and financial recovery ledger"
    >
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Recovered */}
          <div
            className="p-5 rounded-2xl relative overflow-hidden"
            style={{
              background: '#111318',
              border: '1px solid rgba(132,204,22,0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: '#9196B0' }}>
                Total Restitution Recovered
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(132,204,22,0.1)', color: '#84CC16' }}
              >
                <IndianRupee size={16} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="font-mono-ck font-bold text-3xl text-white">₹29,699</h3>
              <span
                className="font-mono-ck text-xs font-semibold flex items-center gap-0.5"
                style={{ color: '#84CC16' }}
              >
                <TrendingUp size={13} /> 100% Payout
              </span>
            </div>
            <p className="font-mono-ck text-[10px] mt-2" style={{ color: '#9196B0' }}>
              Credited directly to consumer bank accounts
            </p>
          </div>

          {/* Card 2: Pending in SLA */}
          <div
            className="p-5 rounded-2xl relative overflow-hidden"
            style={{
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: '#9196B0' }}>
                Active in Statutory Notice
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}
              >
                <Clock size={16} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="font-mono-ck font-bold text-3xl text-white">₹2,499</h3>
              <span className="font-mono-ck text-xs text-amber-400">1 Case Active</span>
            </div>
            <p className="font-mono-ck text-[10px] mt-2" style={{ color: '#9196B0' }}>
              SLA clock running • 14 days remaining
            </p>
          </div>

          {/* Card 3: Average Recovery Time */}
          <div
            className="p-5 rounded-2xl relative overflow-hidden"
            style={{
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: '#9196B0' }}>
                Avg Dispute Resolution Time
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}
              >
                <ShieldCheck size={16} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="font-mono-ck font-bold text-3xl text-white">8.4 Days</h3>
              <span className="font-mono-ck text-xs text-emerald-400">4.2x Faster</span>
            </div>
            <p className="font-mono-ck text-[10px] mt-2" style={{ color: '#9196B0' }}>
              Vs standard consumer forum litigation (14 months)
            </p>
          </div>
        </div>

        {/* Transactions Ledger Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#111318',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="p-5 flex items-center justify-between border-b border-white/5">
            <div>
              <h4 className="font-jakarta font-bold text-sm text-white">
                Restitution Settlement Ledger
              </h4>
              <p className="text-xs mt-0.5" style={{ color: '#9196B0' }}>
                Verified bank transfers and statutory merchant compensation
              </p>
            </div>

            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors"
              style={{ color: '#E8EAF6', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Download size={13} />
              <span>Export Ledger</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-mono-ck text-[10px] uppercase tracking-wider text-white/40">
                  <th className="px-5 py-3">Disputed Item & Merchant</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Settlement Channel</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Reference / UTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {SETTLEMENTS.map((row) => {
                  const isCompleted = row.status === 'completed'

                  return (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{row.product}</p>
                        <p className="font-mono-ck text-[10px]" style={{ color: '#9196B0' }}>
                          {row.merchant} • {row.caseId}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-mono-ck font-bold text-sm" style={{ color: '#84CC16' }}>
                        {row.amount}
                      </td>

                      <td className="px-5 py-4 text-white/80">{row.type}</td>

                      <td className="px-5 py-4">
                        <span
                          className="font-mono-ck text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          style={{
                            background: isCompleted ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                            color: isCompleted ? '#22C55E' : '#F59E0B',
                          }}
                        >
                          {isCompleted ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          {isCompleted ? 'Restitution Credited' : 'SLA Pending'}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono-ck text-[11px]" style={{ color: '#9196B0' }}>
                        {row.utr}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
