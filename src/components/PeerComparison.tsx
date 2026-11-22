import React, { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { calculateCashQuality } from '../utils/analysis'
import { CashRadarChart } from './CashRadarChart'
import {
  Swords,
  Plus,
  X,
  Search,
  Crown,
  ArrowUpRight
} from 'lucide-react'

interface PeerComparisonProps {
  companies: Company[]
  currency: Currency
  selectedIds: string[]
  onChangeSelectedIds: (ids: string[]) => void
  onSelectCompany?: (id: string) => void
}

type ComparisonMetric =
  | 'freeCashFlow'
  | 'fcfMargin'
  | 'netCash'
  | 'capitalExpenditure'
  | 'operatingCashFlow'
  | 'totalShareholderReturn'

export const PeerComparison: React.FC<PeerComparisonProps> = ({
  companies,
  currency,
  selectedIds,
  onChangeSelectedIds,
  onSelectCompany
}) => {
  const presets = [
    {
      name: '🔥 메모리 반도체 4사 (삼성 vs SK하이닉스 vs 마이크론 vs 키옥시아)',
      ids: ['samsung-electronics', 'sk-hynix', 'micron', 'kioxia']
    },
    {
      name: '🤖 AI 빅테크 현금력 (엔비디아 vs MS vs 구글 vs 메타 vs 애플)',
      ids: ['nvidia', 'microsoft', 'alphabet', 'meta', 'apple']
    },
    {
      name: '⚡ 글로벌 파운드리/노광 (TSMC vs 인텔 vs 삼성전자 vs ASML)',
      ids: ['tsmc', 'intel', 'samsung-electronics', 'asml']
    },
    {
      name: '🚗 글로벌 완성차 대전 (현대차 vs 기아 vs 테슬라 vs 도요타 vs BYD)',
      ids: ['hyundai-motor', 'kia', 'tesla', 'toyota', 'byd']
    },
    {
      name: '💎 럭셔리 하이엔드 (LVMH vs 에르메스 vs 페라리)',
      ids: ['lvmh', 'hermes', 'ferrari']
    },
    {
      name: '☁️ 엔터프라이즈 AI/SW (팔란티어 vs 스노우플레이크 vs 세일즈포스 vs 어도비)',
      ids: ['palantir', 'snowflake', 'salesforce', 'adobe']
    }
  ]

  const [metric, setMetric] = useState<ComparisonMetric>('freeCashFlow')
  const [activeView, setActiveView] = useState<'barchart' | 'radar'>('barchart')
  const [tableYear, setTableYear] = useState<number>(2025)
  const [showPicker, setShowPicker] = useState<boolean>(false)
  const [pickerSearch, setPickerSearch] = useState<string>('')

  const selectedCompanies = selectedIds
    .map((id) => companies.find((c) => c.id === id))
    .filter((c): c is Company => Boolean(c))

  const years = [2020, 2021, 2022, 2023, 2024, 2025]
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4']

  const metricLabels: Record<ComparisonMetric, string> = {
    freeCashFlow: '잉여현금흐름 (Free Cash Flow)',
    fcfMargin: 'FCF 마진율 (FCF / Revenue %)',
    netCash: '순현금 보유고 (Net Cash = Total Cash - Total Debt)',
    capitalExpenditure: '설비투자 (CapEx)',
    operatingCashFlow: '영업활동현금흐름 (Operating Cash Flow)',
    totalShareholderReturn: '총 주주환원액 (배당금 + 자사주 매입)'
  }

  // If comparing companies from different countries in NATIVE mode, normalize chart to USD
  const hasMultipleCurrencies =
    new Set(selectedCompanies.map((c) => c.currency)).size > 1
  const chartCurrency: Currency =
    currency === 'NATIVE' && hasMultipleCurrencies ? 'USD' : currency

  const unitLabel =
    metric === 'fcfMargin'
      ? '%'
      : convertValue(1, selectedCompanies[0] || companies[0], chartCurrency).unitLabel

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 },
      formatter: (params: any) => {
        let res = `<div class="font-bold mb-1 border-b border-gray-700 pb-1 text-white">${params[0].name} ${metricLabels[metric]} (${unitLabel})</div>`
        params.forEach((item: any) => {
          const val = item.value
          const sign = val > 0 ? '+' : ''
          res += `
            <div class="flex items-center justify-between gap-4 py-0.5 text-xs">
              <div class="flex items-center gap-1.5">
                <span class="inline-block w-2.5 h-2.5 rounded-sm" style="background:${item.color}"></span>
                <span class="text-gray-300">${item.seriesName}</span>
              </div>
              <span class="font-mono font-semibold ${val >= 0 ? 'text-white' : 'text-rose-400'}">
                ${sign}${val.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}${metric === 'fcfMargin' ? '%' : ` ${unitLabel}`}
              </span>
            </div>
          `
        })
        return res
      }
    },
    legend: {
      data: selectedCompanies.map((c) => c.nameKo),
      textStyle: { color: '#9CA3AF', fontSize: 11 },
      top: 0,
      itemGap: 14
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      top: '40px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: years.map((y) => `${y}년`),
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#9CA3AF', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: `(${unitLabel})`,
      nameTextStyle: { color: '#6B7280', fontSize: 10, align: 'right' },
      splitLine: { lineStyle: { color: '#1F2937', type: 'dashed' } },
      axisLabel: {
        color: '#9CA3AF',
        fontSize: 11,
        formatter: metric === 'fcfMargin' ? '{value}%' : '{value}'
      }
    },
    series: selectedCompanies.map((c, idx) => {
      const data = c.financials.map((f) => {
        if (metric === 'fcfMargin') return Number(f.fcfMargin.toFixed(1))
        const val = f[metric] as number
        return convertValue(val, c, chartCurrency).value
      })
      return {
        name: c.nameKo,
        type: metric === 'fcfMargin' ? 'line' : 'bar',
        smooth: metric === 'fcfMargin',
        symbolSize: 7,
        barMaxWidth: 24,
        data: data,
        lineStyle: { width: 3, color: colors[idx % colors.length] },
        itemStyle: {
          color: colors[idx % colors.length],
          borderRadius: [4, 4, 0, 0]
        }
      }
    })
  }

  const toggleCompany = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        onChangeSelectedIds(selectedIds.filter((x) => x !== id))
      }
    } else {
      if (selectedIds.length < 6) {
        onChangeSelectedIds([...selectedIds, id])
      }
    }
  }

  const pickerCompanies = useMemo(() => {
    const q = pickerSearch.toLowerCase().trim()
    return companies.filter(
      (c) =>
        !q ||
        c.nameKo.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.ticker.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q)
    )
  }, [companies, pickerSearch])

  // Determine winners (#1 in USD value) for the selected tableYear
  const getWinnerId = (key: keyof Company['financials'][0]) => {
    if (selectedCompanies.length < 2) return null
    let bestId: string | null = null
    let bestVal = -Infinity
    selectedCompanies.forEach((c) => {
      const fin =
        c.financials.find((f) => f.year === tableYear) ||
        c.financials[c.financials.length - 1]
      const val =
        key === 'fcfMargin'
          ? fin.fcfMargin
          : convertValue(fin[key] as number, c, 'USD').value
      if (val > bestVal) {
        bestVal = val
        bestId = c.id
      }
    })
    return bestId
  }

  const bestFcfId = getWinnerId('freeCashFlow')
  const bestMarginId = getWinnerId('fcfMargin')
  const bestNetCashId = getWinnerId('netCash')
  const bestCapexId = getWinnerId('capitalExpenditure')
  const bestTsrId = getWinnerId('totalShareholderReturn')

  return (
    <div className="space-y-6">
      {/* Preset Battle Bar */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              추천 주요 섹터 경쟁사 배틀 프리셋 (원클릭 로드)
            </h3>
          </div>
          <span className="text-[11px] text-gray-400">
            최대 6개 기업까지 자유롭게 조합 가능
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => {
            const isCurrentPreset =
              p.ids.length === selectedIds.length &&
              p.ids.every((id) => selectedIds.includes(id))
            return (
              <button
                key={idx}
                onClick={() => onChangeSelectedIds(p.ids)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-sm ${
                  isCurrentPreset
                    ? 'bg-blue-600/25 border-blue-500 text-white'
                    : 'bg-gray-800/60 hover:bg-blue-600/15 hover:border-blue-500/40 border-gray-700/80 text-gray-300 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Comparison Card */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Selected Company Pills & Add Company Picker */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 relative">
            <span className="text-xs text-gray-400 font-semibold mr-1">
              비교 대상 ({selectedCompanies.length}/6):
            </span>
            {selectedCompanies.map((c, idx) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm"
                style={{
                  backgroundColor: `${colors[idx % colors.length]}18`,
                  borderColor: `${colors[idx % colors.length]}55`,
                  color: colors[idx % colors.length]
                }}
              >
                <span>{c.nameKo}</span>
                {selectedCompanies.length > 1 && (
                  <button
                    onClick={() => toggleCompany(c.id)}
                    className="hover:opacity-80 p-0.5"
                    title="비교에서 제외"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}

            {/* + Add Company Button */}
            {selectedCompanies.length < 6 && (
              <div className="relative">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>기업 추가</span>
                </button>

                {showPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowPicker(false)}
                    />
                    <div className="absolute left-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-3 z-40">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={pickerSearch}
                          onChange={(e) => setPickerSearch(e.target.value)}
                          placeholder="추가할 기업명/티커 검색..."
                          className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto divide-y divide-gray-800/60">
                        {pickerCompanies.map((c) => {
                          const isAdded = selectedIds.includes(c.id)
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                toggleCompany(c.id)
                                if (!isAdded && selectedIds.length >= 5) {
                                  setShowPicker(false)
                                }
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                                isAdded
                                  ? 'bg-blue-600/20 text-blue-300 font-semibold'
                                  : 'hover:bg-gray-800 text-gray-200'
                              }`}
                            >
                              <div className="truncate">
                                <span>{c.nameKo}</span>
                                <span className="text-[10px] text-gray-500 font-mono ml-1.5">
                                  ({c.ticker})
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {isAdded ? '선택됨 ✓' : '+ 추가'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* View Type Toggle (Bar vs Radar) & Metric Selector */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-800/80 p-1 rounded-xl border border-gray-700 shrink-0">
              <button
                onClick={() => setActiveView('barchart')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeView === 'barchart'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                6개년 시계열 비교
              </button>
              <button
                onClick={() => setActiveView('radar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeView === 'radar'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                5대 체력 레이더 배틀
              </button>
            </div>

            {/* Metric Selector Buttons */}
            {activeView === 'barchart' && (
              <div className="flex items-center bg-gray-800/80 p-1 rounded-xl border border-gray-700 overflow-x-auto scrollbar-none max-w-full">
                {(
                  [
                    { id: 'freeCashFlow', label: '잉여현금(FCF)' },
                    { id: 'fcfMargin', label: 'FCF 마진(%)' },
                    { id: 'netCash', label: '순현금' },
                    { id: 'capitalExpenditure', label: '설비투자(CapEx)' },
                    { id: 'operatingCashFlow', label: '영업현금(OCF)' },
                    { id: 'totalShareholderReturn', label: '주주환원' }
                  ] as { id: ComparisonMetric; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMetric(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      metric === m.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ECharts Visual Comparison (Bar or Radar) */}
        <div className="w-full">
          {activeView === 'barchart' ? (
            <div className="h-80 sm:h-96 w-full">
              <ReactECharts
                option={chartOption}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
              />
            </div>
          ) : (
            <div className="h-80 sm:h-96 w-full flex items-center justify-center">
              <CashRadarChart companies={selectedCompanies} />
            </div>
          )}
        </div>

        {/* Side-by-Side Comparison Table with Year Selector & Winner Badges */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <span>{tableYear}년 기준 핵심 지표 1:1 대조표</span>
              <span className="text-[11px] font-normal text-gray-400">
                (👑 항목별 1위 기업 하이라이트)
              </span>
            </h4>

            <div className="flex items-center bg-gray-800 rounded-lg p-0.5 border border-gray-700 overflow-x-auto scrollbar-none">
              {years.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setTableYear(yr)}
                  className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    tableYear === yr
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {yr}년
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-2.5 px-3 font-semibold">기업명 (클릭 시 상세)</th>
                  <th className="py-2.5 px-2 font-semibold text-center">품질등급</th>
                  <th className="py-2.5 px-3 font-semibold text-right">매출액</th>
                  <th className="py-2.5 px-3 font-semibold text-right">영업현금(OCF)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">설비투자(CapEx)</th>
                  <th className="py-2.5 px-3 font-semibold text-right text-emerald-400">
                    잉여현금(FCF)
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">FCF 마진</th>
                  <th className="py-2.5 px-3 font-semibold text-right">총가용현금</th>
                  <th className="py-2.5 px-3 font-semibold text-right text-blue-400">
                    순현금(Net Cash)
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right text-amber-400">
                    주주환원액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {selectedCompanies.map((c, idx) => {
                  const fin =
                    c.financials.find((f) => f.year === tableYear) ||
                    c.financials[c.financials.length - 1]
                  const quality = calculateCashQuality(c)
                  return (
                    <tr key={c.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">
                        <button
                          onClick={() => onSelectCompany && onSelectCompany(c.id)}
                          className="flex items-center gap-2 hover:text-blue-400 transition-colors group text-left"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colors[idx % colors.length] }}
                          />
                          <span>{c.nameKo}</span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            ({c.ticker})
                          </span>
                          <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100" />
                        </button>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-300">
                        {quality.grade} ({quality.score})
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-200">
                        {convertValue(fin.revenue, c, chartCurrency).formatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-400">
                        {convertValue(fin.operatingCashFlow, c, chartCurrency).formatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-orange-400">
                        <span className="inline-flex items-center justify-end gap-1">
                          {bestCapexId === c.id && (
                            <Crown className="w-3 h-3 text-amber-400 inline" />
                          )}
                          <span>
                            {convertValue(fin.capitalExpenditure, c, chartCurrency).formatted}
                          </span>
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          fin.freeCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {bestFcfId === c.id && (
                            <Crown className="w-3 h-3 text-amber-400 inline" />
                          )}
                          <span>
                            {convertValue(fin.freeCashFlow, c, chartCurrency).formatted}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-200">
                        <span className="inline-flex items-center justify-end gap-1">
                          {bestMarginId === c.id && (
                            <Crown className="w-3 h-3 text-amber-400 inline" />
                          )}
                          <span>{fin.fcfMargin.toFixed(1)}%</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-cyan-400">
                        {convertValue(fin.totalCash, c, chartCurrency).formatted}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          fin.netCash >= 0 ? 'text-blue-400' : 'text-rose-400'
                        }`}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {bestNetCashId === c.id && (
                            <Crown className="w-3 h-3 text-amber-400 inline" />
                          )}
                          <span>{convertValue(fin.netCash, c, chartCurrency).formatted}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                        <span className="inline-flex items-center justify-end gap-1">
                          {bestTsrId === c.id && (
                            <Crown className="w-3 h-3 text-amber-400 inline" />
                          )}
                          <span>
                            {convertValue(fin.totalShareholderReturn, c, chartCurrency).formatted}
                          </span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
