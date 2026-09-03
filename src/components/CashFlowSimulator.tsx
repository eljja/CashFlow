import React, { useState } from 'react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { Sliders, RefreshCw, Calculator, ArrowRight, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react'

interface CashFlowSimulatorProps {
  company: Company
  currency: Currency
}

export const CashFlowSimulator: React.FC<CashFlowSimulatorProps> = ({ company, currency }) => {
  const latestFin = company.financials[company.financials.length - 1]

  // Simulation Sliders State
  const [revenueGrowth, setRevenueGrowth] = useState<number>(8) // +8%
  const [ocfMarginDelta, setOcfMarginDelta] = useState<number>(0) // 0% delta
  const [capexGrowth, setCapexGrowth] = useState<number>(5) // +5%
  const [payoutRatio, setPayoutRatio] = useState<number>(40) // 40% of FCF

  // Reset to default
  const handleReset = () => {
    setRevenueGrowth(8)
    setOcfMarginDelta(0)
    setCapexGrowth(5)
    setPayoutRatio(40)
  }

  // Base values (2025)
  const baseRev = latestFin.revenue
  const baseOcf = latestFin.operatingCashFlow
  const baseCapex = latestFin.capitalExpenditure
  const baseNetCash = latestFin.netCash
  const baseOcfMargin = baseRev > 0 ? (baseOcf / baseRev) * 100 : 20

  // Projected 2026 Calculations
  const projRev = baseRev * (1 + revenueGrowth / 100)
  const projOcfMargin = Math.max(1, baseOcfMargin + ocfMarginDelta)
  const projOcf = projRev * (projOcfMargin / 100)
  const projCapex = baseCapex * (1 + capexGrowth / 100)
  const projFcf = projOcf - projCapex
  const projShareholderReturn = projFcf > 0 ? projFcf * (payoutRatio / 100) : 0
  const projNetCashDelta = projFcf - projShareholderReturn
  const projNetCash = baseNetCash + projNetCashDelta

  const unitLabel = convertValue(1, company, currency).unitLabel

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-gray-900/60 to-blue-950/30 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">현금흐름 & 순현금 What-If 시나리오 시뮬레이터</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-mono font-semibold">
                Interactive Model
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              매출 성장, 설비투자(CapEx) 변동, 주주환원율을 조정하여 예상 잉여현금(FCF)과 순현금 잔액을 실시간 모델링합니다.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/60 text-xs font-semibold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>초기화</span>
        </button>
      </div>

      {/* Sliders and Projection Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sliders Panel */}
        <div className="lg:col-span-6 space-y-4 bg-gray-950/50 p-4 rounded-2xl border border-gray-800/80">
          {/* Slider 1: Revenue Growth */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 font-medium">예상 매출 성장률 (Revenue Growth)</span>
              <span className="font-mono font-bold text-blue-400">
                {revenueGrowth > 0 ? `+${revenueGrowth}` : revenueGrowth}%
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="40"
              step="1"
              value={revenueGrowth}
              onChange={(e) => setRevenueGrowth(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
              <span>-20%</span>
              <span>0%</span>
              <span>+20%</span>
              <span>+40%</span>
            </div>
          </div>

          {/* Slider 2: OCF Margin Delta */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 font-medium">영업현금 마진율 변동 (OCF Margin Delta)</span>
              <span className="font-mono font-bold text-cyan-400">
                {ocfMarginDelta > 0 ? `+${ocfMarginDelta}` : ocfMarginDelta}%p
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={ocfMarginDelta}
              onChange={(e) => setOcfMarginDelta(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
              <span>-10%p (수익성 악화)</span>
              <span>0%p</span>
              <span>+10%p (마진 개선)</span>
            </div>
          </div>

          {/* Slider 3: CapEx Growth */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 font-medium">설비투자(CapEx) 증감률</span>
              <span className="font-mono font-bold text-orange-400">
                {capexGrowth > 0 ? `+${capexGrowth}` : capexGrowth}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="50"
              step="1"
              value={capexGrowth}
              onChange={(e) => setCapexGrowth(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
              <span>-30% (투자 축소)</span>
              <span>0%</span>
              <span>+50% (공격 투자)</span>
            </div>
          </div>

          {/* Slider 4: Shareholder Payout Ratio */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 font-medium">FCF 대비 주주환원율 (배당 + 자사주)</span>
              <span className="font-mono font-bold text-pink-400">{payoutRatio}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={payoutRatio}
              onChange={(e) => setPayoutRatio(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
              <span>0% (내부 유보)</span>
              <span>50%</span>
              <span>100% (전액 환원)</span>
            </div>
          </div>
        </div>

        {/* Projection Outputs Panel */}
        <div className="lg:col-span-6 space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-300 block mb-0.5">
                🔮 시나리오 예상 FCF (잉여현금흐름)
              </span>
              <span className="text-xs text-gray-400">
                예상 OCF {convertValue(projOcf, company, currency).formatted} - CapEx {convertValue(projCapex, company, currency).formatted}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xl font-black font-mono ${projFcf >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {convertValue(projFcf, company, currency).formatted}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                기존 대비 {(projFcf - latestFin.freeCashFlow >= 0 ? '+' : '') + convertValue(projFcf - latestFin.freeCashFlow, company, currency).formatted}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-800/40 border border-gray-700/60">
              <span className="text-[11px] text-gray-400 block mb-1">예상 주주환원 총액</span>
              <span className="text-base font-bold font-mono text-pink-400">
                {convertValue(projShareholderReturn, company, currency).formatted}
              </span>
              <p className="text-[10px] text-gray-500 mt-0.5">배당금 및 자사주 매입 집행액</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-800/40 border border-gray-700/60">
              <span className="text-[11px] text-gray-400 block mb-1">시나리오 순현금(Net Cash)</span>
              <span className={`text-base font-bold font-mono ${projNetCash >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                {convertValue(projNetCash, company, currency).formatted}
              </span>
              <p className="text-[10px] text-gray-500 mt-0.5">기말 예상 순현금 보유고</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 text-xs text-gray-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              현재 시나리오 적용 시 1년간 순현금은 <strong className={projNetCashDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {(projNetCashDelta >= 0 ? '+' : '') + convertValue(projNetCashDelta, company, currency).formatted}
              </strong> 변동합니다.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
