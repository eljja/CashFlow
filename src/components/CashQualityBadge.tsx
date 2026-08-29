import React from 'react'
import { Company } from '../types'
import { calculateCashQuality } from '../utils/analysis'
import { ShieldCheck, Award, Zap, PieChart, Activity, CheckCircle2 } from 'lucide-react'

interface CashQualityBadgeProps {
  company: Company
}

export const CashQualityBadge: React.FC<CashQualityBadgeProps> = ({ company }) => {
  const quality = calculateCashQuality(company)
  const pattern = quality.patternType

  const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-500 text-black border-emerald-300 shadow-emerald-500/30',
    'A': 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30',
    'B': 'bg-blue-600 text-white border-blue-400 shadow-blue-600/30',
    'C': 'bg-amber-600 text-white border-amber-400 shadow-amber-600/30',
    'D': 'bg-rose-600 text-white border-rose-400 shadow-rose-600/30'
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header with Grade & Score */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border shadow-lg ${gradeColors[quality.grade]}`}>
            {quality.grade}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">현금흐름 건전성 & 품질 평가</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 font-mono">
                종합 {quality.score}점 / 100점
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              회계적 순이익의 실제 현금 전환력, 부채 완충력 및 주주환원 체력 분석
            </p>
          </div>
        </div>

        {/* Pattern Code Badge */}
        <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${pattern.tagColor}`}>
          {pattern.title}
        </div>
      </div>

      {/* Pattern Detailed Diagnosis Comment */}
      <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 text-xs text-gray-300 leading-relaxed flex items-start gap-2.5">
        <Activity className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white mr-1">현금 패턴 진단:</span>
          {pattern.description}
        </div>
      </div>

      {/* Advanced 4 Core Financial Health Ratios */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-gray-800/40 border border-gray-700/50">
          <div className="text-[11px] text-gray-400 mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>FCF 전환율 (Cash Conversion)</span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">
            {quality.fcfConversionRate}%
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">순이익 대비 실제 잉여현금 창출 비율</p>
        </div>

        <div className="p-3 rounded-2xl bg-gray-800/40 border border-gray-700/50">
          <div className="text-[11px] text-gray-400 mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-orange-400" />
            <span>CapEx 재투자율</span>
          </div>
          <div className="text-base font-bold font-mono text-orange-400">
            {quality.capexReinvestmentRate}%
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">영업현금 중 설비투자에 투입된 비중</p>
        </div>

        <div className="p-3 rounded-2xl bg-gray-800/40 border border-gray-700/50">
          <div className="text-[11px] text-gray-400 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            <span>순현금 완충비율</span>
          </div>
          <div className="text-base font-bold font-mono text-blue-400">
            {quality.netCashToRevenueRatio}%
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">연간 매출액 대비 순현금 비중</p>
        </div>

        <div className="p-3 rounded-2xl bg-gray-800/40 border border-gray-700/50">
          <div className="text-[11px] text-gray-400 mb-1 flex items-center gap-1">
            <PieChart className="w-3 h-3 text-pink-400" />
            <span>주주환원 배분율</span>
          </div>
          <div className="text-base font-bold font-mono text-pink-400">
            {quality.shareholderPayoutRatio}%
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">창출된 FCF 중 배당/자사주 환원 비율</p>
        </div>
      </div>
    </div>
  )
}
