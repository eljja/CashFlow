import React from 'react'
import { TrendingUp, ShieldCheck, Hammer, Gift, ArrowUpRight } from 'lucide-react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'

interface ExecutiveSummaryProps {
  companies: Company[]
  currency: Currency
  onSelectCompany: (companyId: string) => void
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  companies,
  currency,
  onSelectCompany
}) => {
  // Compute Top 5 rankings for latest year (2024)
  const getLatestFinancial = (c: Company) => c.financials[c.financials.length - 1]

  // 1. Top 5 Free Cash Flow (FCF) in USD normalized
  const topFcf = [...companies]
    .map((c) => {
      const fin = getLatestFinancial(c)
      const conv = convertValue(fin.freeCashFlow, c, currency)
      const convUSD = convertValue(fin.freeCashFlow, c, 'USD')
      return { company: c, value: conv.value, formatted: conv.formatted, sortVal: convUSD.value }
    })
    .sort((a, b) => b.sortVal - a.sortVal)
    .slice(0, 5)

  // 2. Top 5 Net Cash (순현금 = Total Cash - Total Debt)
  const topNetCash = [...companies]
    .map((c) => {
      const fin = getLatestFinancial(c)
      const conv = convertValue(fin.netCash, c, currency)
      const convUSD = convertValue(fin.netCash, c, 'USD')
      return { company: c, value: conv.value, formatted: conv.formatted, sortVal: convUSD.value }
    })
    .sort((a, b) => b.sortVal - a.sortVal)
    .slice(0, 5)

  // 3. Top 5 CapEx (설비투자 챔피언)
  const topCapEx = [...companies]
    .map((c) => {
      const fin = getLatestFinancial(c)
      const conv = convertValue(fin.capitalExpenditure, c, currency)
      const convUSD = convertValue(fin.capitalExpenditure, c, 'USD')
      return { company: c, value: conv.value, formatted: conv.formatted, sortVal: convUSD.value }
    })
    .sort((a, b) => b.sortVal - a.sortVal)
    .slice(0, 5)

  // 4. Top 5 Shareholder Return (배당금 + 자사주 매입)
  const topShareholderYield = [...companies]
    .map((c) => {
      const fin = getLatestFinancial(c)
      const conv = convertValue(fin.totalShareholderReturn, c, currency)
      const convUSD = convertValue(fin.totalShareholderReturn, c, 'USD')
      return { company: c, value: conv.value, formatted: conv.formatted, sortVal: convUSD.value }
    })
    .sort((a, b) => b.sortVal - a.sortVal)
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* 1. Top Free Cash Flow */}
      <div className="bg-gradient-to-br from-gray-900/90 via-emerald-950/20 to-blue-950/30 border border-emerald-500/40 rounded-2xl p-4 shadow-xl shadow-emerald-950/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500/20 border-b border-l border-emerald-500/40 rounded-bl-lg text-[10px] font-bold text-emerald-400">
          핵심 1위 지표 (FCF)
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-xs">
              FCF
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">2024 잉여현금흐름 (FCF) TOP 5</h3>
              <p className="text-[11px] text-emerald-400/80">OCF(영업현금) - CapEx(설비투자)</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {topFcf.map((item, idx) => (
            <button
              key={item.company.id}
              onClick={() => onSelectCompany(item.company.id)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-gray-800/40 hover:bg-blue-600/10 hover:border-blue-500/30 border border-transparent transition-all group text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-bold text-gray-500 group-hover:text-blue-400">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-white block">
                    {item.company.nameKo}
                  </span>
                  <span className="text-[10px] text-gray-500">{item.company.ticker}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-emerald-400">{item.formatted}</span>
                <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Net Cash (순현금 부자) */}
      <div className="bg-gradient-to-br from-gray-900/90 to-emerald-950/20 border border-emerald-900/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">2024 순현금 (Net Cash) TOP 5</h3>
              <p className="text-[11px] text-gray-400">총가용현금 - 총부채 완충력</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {topNetCash.map((item, idx) => (
            <button
              key={item.company.id}
              onClick={() => onSelectCompany(item.company.id)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-gray-800/40 hover:bg-emerald-600/10 hover:border-emerald-500/30 border border-transparent transition-all group text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-bold text-gray-500 group-hover:text-emerald-400">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-white block">
                    {item.company.nameKo}
                  </span>
                  <span className="text-[10px] text-gray-500">{item.company.ticker}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-emerald-400">{item.formatted}</span>
                <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Top CapEx (설비투자) */}
      <div className="bg-gradient-to-br from-gray-900/90 to-purple-950/20 border border-purple-900/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Hammer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">2024 설비투자 (CapEx) TOP 5</h3>
              <p className="text-[11px] text-gray-400">미래 성장을 위한 인프라 투자</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {topCapEx.map((item, idx) => (
            <button
              key={item.company.id}
              onClick={() => onSelectCompany(item.company.id)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-gray-800/40 hover:bg-purple-600/10 hover:border-purple-500/30 border border-transparent transition-all group text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-bold text-gray-500 group-hover:text-purple-400">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-white block">
                    {item.company.nameKo}
                  </span>
                  <span className="text-[10px] text-gray-500">{item.company.ticker}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-purple-400">{item.formatted}</span>
                <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Top Shareholder Return (배당+자사주 매입) */}
      <div className="bg-gradient-to-br from-gray-900/90 to-amber-950/20 border border-amber-900/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">2024 총 주주환원 TOP 5</h3>
              <p className="text-[11px] text-gray-400">현금배당금 + 자사주 매입/소각</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {topShareholderYield.map((item, idx) => (
            <button
              key={item.company.id}
              onClick={() => onSelectCompany(item.company.id)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-gray-800/40 hover:bg-amber-600/10 hover:border-amber-500/30 border border-transparent transition-all group text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-bold text-gray-500 group-hover:text-amber-400">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-white block">
                    {item.company.nameKo}
                  </span>
                  <span className="text-[10px] text-gray-500">{item.company.ticker}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-amber-400">{item.formatted}</span>
                <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
