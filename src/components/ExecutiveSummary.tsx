import React, { useState } from 'react'
import {
  ShieldCheck,
  Hammer,
  Gift,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  Trophy,
  Filter
} from 'lucide-react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'

interface ExecutiveSummaryProps {
  allCompanies: Company[]
  filteredCompanies: Company[]
  selectedCompanyId: string
  currency: Currency
  onSelectCompany: (companyId: string) => void
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  allCompanies,
  filteredCompanies,
  selectedCompanyId,
  currency,
  onSelectCompany
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025)
  const [useFilteredScope, setUseFilteredScope] = useState<boolean>(true)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  const targetPool =
    useFilteredScope && filteredCompanies.length > 0 ? filteredCompanies : allCompanies

  const getFinancialForYear = (c: Company, yr: number) =>
    c.financials.find((f) => f.year === yr) || c.financials[c.financials.length - 1]

  // 1. Top 5 Free Cash Flow (FCF)
  const topFcf = [...targetPool]
    .map((c) => {
      const fin = getFinancialForYear(c, selectedYear)
      const conv = convertValue(fin.freeCashFlow, c, currency)
      const convUSD = convertValue(fin.freeCashFlow, c, 'USD')
      return { company: c, value: conv.value, formatted: conv.formatted, sortVal: convUSD.value }
    })
    .sort((a, b) => b.sortVal - a.sortVal)
    .slice(0, 5)
  const maxFcf = Math.max(...topFcf.map((i) => Math.max(0.01, i.sortVal)), 1)

  // 2. Top 5 Net Cash
  const topNetCash = [...targetPool]
    .map((c) => {
      const fin = getFinancialForYear(c, selectedYear)
      const conv = convertValue(fin.netCash, c, currency)
      const convUSD = convertValue(fin.netCash, c, 'USD')
      return { company: c, value: conv.value, formatted: conv.formatted, sortVal: convUSD.value }
    })
    .sort((a, b) => b.sortVal - a.sortVal)
    .slice(0, 5)
  const maxNetCash = Math.max(...topNetCash.map((i) => Math.max(0.01, i.sortVal)), 1)

  // 3. Top 5 CapEx
  const topCapEx = [...targetPool]
    .map((c) => {
      const fin = getFinancialForYear(c, selectedYear)
      const conv = convertValue(fin.capitalExpenditure, c, currency)
      const convUSD = convertValue(fin.capitalExpenditure, c, 'USD')
      return { company: c, value: conv.value, formatted: conv.formatted, sortVal: convUSD.value }
    })
    .sort((a, b) => b.sortVal - a.sortVal)
    .slice(0, 5)
  const maxCapEx = Math.max(...topCapEx.map((i) => Math.max(0.01, i.sortVal)), 1)

  // 4. Top 5 Shareholder Return
  const topShareholderYield = [...targetPool]
    .map((c) => {
      const fin = getFinancialForYear(c, selectedYear)
      const conv = convertValue(fin.totalShareholderReturn, c, currency)
      const convUSD = convertValue(fin.totalShareholderReturn, c, 'USD')
      return { company: c, value: conv.value, formatted: conv.formatted, sortVal: convUSD.value }
    })
    .sort((a, b) => b.sortVal - a.sortVal)
    .slice(0, 5)
  const maxTsr = Math.max(...topShareholderYield.map((i) => Math.max(0.01, i.sortVal)), 1)

  const isFilteredActive = filteredCompanies.length < allCompanies.length && filteredCompanies.length > 0

  return (
    <div className="mb-6">
      {/* Control Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{selectedYear}년 글로벌 현금흐름 리더보드 (TOP 5)</span>
          </div>

          {isFilteredActive && (
            <div className="flex items-center bg-gray-900 rounded-lg p-0.5 border border-gray-800 text-[11px]">
              <button
                onClick={() => setUseFilteredScope(true)}
                className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                  useFilteredScope ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Filter className="w-2.5 h-2.5" />
                <span>현재 필터 ({filteredCompanies.length}개사)</span>
              </button>
              <button
                onClick={() => setUseFilteredScope(false)}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  !useFilteredScope ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                전체 80개사
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Year Pills */}
          <div className="flex items-center bg-gray-900/90 rounded-lg p-0.5 border border-gray-800">
            {[2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md transition-colors ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                '{yr % 100}
              </button>
            ))}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 text-[11px] font-medium transition-colors"
          >
            <span>{isCollapsed ? '리더보드 펼치기' : '접기'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsed Summary Strip */}
      {isCollapsed ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-900/60 border border-gray-800 rounded-2xl p-3 text-xs">
          {topFcf[0] && (
            <button
              onClick={() => onSelectCompany(topFcf[0].company.id)}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400 text-left"
            >
              <span className="text-gray-400">FCF 1위: <strong className="text-white">{topFcf[0].company.nameKo}</strong></span>
              <span className="font-mono font-bold text-emerald-400">{topFcf[0].formatted}</span>
            </button>
          )}
          {topNetCash[0] && (
            <button
              onClick={() => onSelectCompany(topNetCash[0].company.id)}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-950/30 border border-blue-500/30 hover:border-blue-400 text-left"
            >
              <span className="text-gray-400">순현금 1위: <strong className="text-white">{topNetCash[0].company.nameKo}</strong></span>
              <span className="font-mono font-bold text-blue-400">{topNetCash[0].formatted}</span>
            </button>
          )}
          {topCapEx[0] && (
            <button
              onClick={() => onSelectCompany(topCapEx[0].company.id)}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-950/30 border border-purple-500/30 hover:border-purple-400 text-left"
            >
              <span className="text-gray-400">CapEx 1위: <strong className="text-white">{topCapEx[0].company.nameKo}</strong></span>
              <span className="font-mono font-bold text-purple-400">{topCapEx[0].formatted}</span>
            </button>
          )}
          {topShareholderYield[0] && (
            <button
              onClick={() => onSelectCompany(topShareholderYield[0].company.id)}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-500/30 hover:border-amber-400 text-left"
            >
              <span className="text-gray-400">주주환원 1위: <strong className="text-white">{topShareholderYield[0].company.nameKo}</strong></span>
              <span className="font-mono font-bold text-amber-400">{topShareholderYield[0].formatted}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* 1. Top Free Cash Flow */}
          <div className="bg-gradient-to-br from-gray-900/95 via-emerald-950/20 to-blue-950/30 border border-emerald-500/40 rounded-2xl p-4 shadow-xl shadow-emerald-950/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-emerald-500/20 border-b border-l border-emerald-500/40 rounded-bl-lg text-[10px] font-bold text-emerald-300">
              핵심 1위 지표 (FCF)
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black text-xs">
                  FCF
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{selectedYear} 잉여현금흐름 TOP 5</h3>
                  <p className="text-[11px] text-emerald-400/80">OCF(영업현금) - CapEx(설비투자)</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              {topFcf.map((item, idx) => {
                const barWidth = Math.max(4, Math.min(100, (Math.max(0, item.sortVal) / maxFcf) * 100))
                const isSelected = item.company.id === selectedCompanyId
                return (
                  <button
                    key={item.company.id}
                    onClick={() => onSelectCompany(item.company.id)}
                    className={`w-full relative overflow-hidden flex items-center justify-between p-2 rounded-xl border transition-all group text-left ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400/60 shadow-sm'
                        : 'bg-gray-800/40 hover:bg-gray-800/80 border-transparent hover:border-emerald-500/30'
                    }`}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-500 pointer-events-none"
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="relative flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 text-center text-xs font-bold ${
                          idx === 0 ? 'text-emerald-400' : 'text-gray-400 group-hover:text-emerald-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-gray-100 group-hover:text-white truncate block">
                          {item.company.nameKo}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{item.company.ticker}</span>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs font-bold font-mono text-emerald-400">{item.formatted}</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Top Net Cash */}
          <div className="bg-gradient-to-br from-gray-900/95 to-blue-950/25 border border-blue-800/40 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{selectedYear} 순현금 (Net Cash) TOP 5</h3>
                  <p className="text-[11px] text-gray-400">총가용현금 - 총차입금 (무차입 완충력)</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              {topNetCash.map((item, idx) => {
                const barWidth = Math.max(4, Math.min(100, (Math.max(0, item.sortVal) / maxNetCash) * 100))
                const isSelected = item.company.id === selectedCompanyId
                return (
                  <button
                    key={item.company.id}
                    onClick={() => onSelectCompany(item.company.id)}
                    className={`w-full relative overflow-hidden flex items-center justify-between p-2 rounded-xl border transition-all group text-left ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-400/60 shadow-sm'
                        : 'bg-gray-800/40 hover:bg-gray-800/80 border-transparent hover:border-blue-500/30'
                    }`}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-blue-500/10 transition-all duration-500 pointer-events-none"
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="relative flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 text-center text-xs font-bold ${
                          idx === 0 ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-gray-100 group-hover:text-white truncate block">
                          {item.company.nameKo}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{item.company.ticker}</span>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs font-bold font-mono text-blue-400">{item.formatted}</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Top CapEx */}
          <div className="bg-gradient-to-br from-gray-900/95 to-purple-950/25 border border-purple-800/40 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Hammer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{selectedYear} 설비투자 (CapEx) TOP 5</h3>
                  <p className="text-[11px] text-gray-400">미래 성장을 위한 핵심 인프라 투자</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              {topCapEx.map((item, idx) => {
                const barWidth = Math.max(4, Math.min(100, (Math.max(0, item.sortVal) / maxCapEx) * 100))
                const isSelected = item.company.id === selectedCompanyId
                return (
                  <button
                    key={item.company.id}
                    onClick={() => onSelectCompany(item.company.id)}
                    className={`w-full relative overflow-hidden flex items-center justify-between p-2 rounded-xl border transition-all group text-left ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400/60 shadow-sm'
                        : 'bg-gray-800/40 hover:bg-gray-800/80 border-transparent hover:border-purple-500/30'
                    }`}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-purple-500/10 transition-all duration-500 pointer-events-none"
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="relative flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 text-center text-xs font-bold ${
                          idx === 0 ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-gray-100 group-hover:text-white truncate block">
                          {item.company.nameKo}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{item.company.ticker}</span>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs font-bold font-mono text-purple-400">{item.formatted}</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. Top Shareholder Return */}
          <div className="bg-gradient-to-br from-gray-900/95 to-amber-950/25 border border-amber-800/40 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{selectedYear} 총 주주환원 TOP 5</h3>
                  <p className="text-[11px] text-gray-400">현금배당금 + 자사주 매입/소각</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              {topShareholderYield.map((item, idx) => {
                const barWidth = Math.max(4, Math.min(100, (Math.max(0, item.sortVal) / maxTsr) * 100))
                const isSelected = item.company.id === selectedCompanyId
                return (
                  <button
                    key={item.company.id}
                    onClick={() => onSelectCompany(item.company.id)}
                    className={`w-full relative overflow-hidden flex items-center justify-between p-2 rounded-xl border transition-all group text-left ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400/60 shadow-sm'
                        : 'bg-gray-800/40 hover:bg-gray-800/80 border-transparent hover:border-amber-500/30'
                    }`}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-amber-500/10 transition-all duration-500 pointer-events-none"
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="relative flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 text-center text-xs font-bold ${
                          idx === 0 ? 'text-amber-400' : 'text-gray-400 group-hover:text-amber-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-gray-100 group-hover:text-white truncate block">
                          {item.company.nameKo}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{item.company.ticker}</span>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs font-bold font-mono text-amber-400">{item.formatted}</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
