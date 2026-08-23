import React, { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { Swords, Check, Plus, X, BarChart2 } from 'lucide-react'

interface PeerComparisonProps {
  companies: Company[]
  currency: Currency
}

export const PeerComparison: React.FC<PeerComparisonProps> = ({ companies, currency }) => {
  // Preset comparison scenarios
  const presets = [
    {
      name: '🔥 메모리 4사 대전 (삼성 vs SK하이닉스 vs 마이크론 vs 키옥시아)',
      ids: ['samsung-electronics', 'sk-hynix', 'micron', 'kioxia']
    },
    {
      name: '🤖 AI 빅테크 현금력 (엔비디아 vs MS vs 구글 vs 메타 vs 애플)',
      ids: ['nvidia', 'microsoft', 'alphabet', 'meta', 'apple']
    },
    {
      name: '⚡ 글로벌 파운드리/반도체 (TSMC vs 인텔 vs 삼성전자 vs ASML)',
      ids: ['tsmc', 'intel', 'samsung-electronics', 'asml']
    },
    {
      name: '🚗 글로벌 완성차 (현대차 vs 기아 vs 테슬라 vs 도요타 vs BYD)',
      ids: ['hyundai-motor', 'kia', 'tesla', 'toyota', 'byd']
    },
    {
      name: '💎 럭셔리 하이엔드 (LVMH vs 에르메스 vs 페라리)',
      ids: ['lvmh', 'hermes', 'ferrari']
    },
    {
      name: '☁️ 차세대 클라우드/AI SW (팔란티어 vs 스노우플레이크 vs 세일즈포스 vs 어도비)',
      ids: ['palantir', 'snowflake', 'salesforce', 'adobe']
    }
  ]

  const [selectedIds, setSelectedIds] = useState<string[]>([
    'samsung-electronics',
    'sk-hynix',
    'micron',
    'kioxia'
  ])
  const [metric, setMetric] = useState<'freeCashFlow' | 'capitalExpenditure' | 'netCash' | 'operatingCashFlow'>('freeCashFlow')

  const selectedCompanies = selectedIds
    .map((id) => companies.find((c) => c.id === id))
    .filter((c): c is Company => Boolean(c))

  const years = [2020, 2021, 2022, 2023, 2024, 2025]
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4']

  const metricLabels = {
    freeCashFlow: '잉여현금흐름 (Free Cash Flow)',
    capitalExpenditure: '설비투자 (CapEx)',
    netCash: '순현금 보유고 (Net Cash = Total Cash - Total Debt)',
    operatingCashFlow: '영업활동현금흐름 (Operating Cash Flow)'
  }

  const unitLabel = convertValue(1, selectedCompanies[0] || companies[0], currency).unitLabel

  // ECharts Option for Multi-Company Comparison
  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 },
      formatter: (params: any) => {
        let res = `<div class="font-bold mb-1 border-b border-gray-700 pb-1 text-white">${params[0].name}년 ${metricLabels[metric]} (${unitLabel})</div>`
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
                ${sign}${val.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unitLabel}
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
      axisLabel: { color: '#9CA3AF', fontSize: 11 }
    },
    series: selectedCompanies.map((c, idx) => {
      const data = c.financials.map((f) => {
        const val = f[metric] as number
        return convertValue(val, c, currency).value
      })
      return {
        name: c.nameKo,
        type: 'bar',
        barMaxWidth: 24,
        data: data,
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
        setSelectedIds(selectedIds.filter((x) => x !== id))
      }
    } else {
      if (selectedIds.length < 6) {
        setSelectedIds([...selectedIds, id])
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Preset Battle Bar */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Swords className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            추천 주요 기업 경쟁사 배틀 시나리오
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIds(p.ids)}
              className="px-3 py-1.5 rounded-xl bg-gray-800/60 hover:bg-blue-600/20 hover:border-blue-500/40 border border-gray-700/80 text-xs font-medium text-gray-300 hover:text-white transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Comparison Card */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg">
        {/* Metric Selector & Active Tags */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          {/* Selected Company Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold mr-1">비교 대상 ({selectedCompanies.length}/6):</span>
            {selectedCompanies.map((c, idx) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm"
                style={{
                  backgroundColor: `${colors[idx % colors.length]}15`,
                  borderColor: `${colors[idx % colors.length]}50`,
                  color: colors[idx % colors.length]
                }}
              >
                <span>{c.nameKo}</span>
                {selectedCompanies.length > 1 && (
                  <button
                    onClick={() => toggleCompany(c.id)}
                    className="hover:opacity-80 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center bg-gray-800/80 p-1 rounded-xl border border-gray-700">
            <button
              onClick={() => setMetric('freeCashFlow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                metric === 'freeCashFlow'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              잉여현금흐름 (FCF)
            </button>
            <button
              onClick={() => setMetric('capitalExpenditure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                metric === 'capitalExpenditure'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              설비투자 (CapEx)
            </button>
            <button
              onClick={() => setMetric('netCash')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                metric === 'netCash'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              순현금 (Net Cash)
            </button>
            <button
              onClick={() => setMetric('operatingCashFlow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                metric === 'operatingCashFlow'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              영업현금 (OCF)
            </button>
          </div>
        </div>

        {/* ECharts Visual Comparison */}
        <div className="h-96 w-full">
          <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} notMerge={true} />
        </div>

        {/* Side-by-Side Comparison Table */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
            2025년 기준 핵심 지표 직접 비교표 ({unitLabel})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-2.5 px-3 font-semibold">기업명</th>
                  <th className="py-2.5 px-3 font-semibold">섹터 / 국가</th>
                  <th className="py-2.5 px-3 font-semibold text-right">매출액</th>
                  <th className="py-2.5 px-3 font-semibold text-right">영업현금(OCF)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">설비투자(CapEx)</th>
                  <th className="py-2.5 px-3 font-semibold text-right text-emerald-400">잉여현금(FCF)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">FCF 마진</th>
                  <th className="py-2.5 px-3 font-semibold text-right">총가용현금</th>
                  <th className="py-2.5 px-3 font-semibold text-right text-blue-400">순현금(Net Cash)</th>
                  <th className="py-2.5 px-3 font-semibold text-right text-amber-400">주주환원액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {selectedCompanies.map((c, idx) => {
                  const fin = c.financials[c.financials.length - 1]
                  return (
                    <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: colors[idx % colors.length] }}
                        />
                        <span>{c.nameKo}</span>
                        <span className="text-[10px] text-gray-500 font-mono">({c.ticker})</span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-400">{c.sector} · {c.country}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-200">
                        {convertValue(fin.revenue, c, currency).formatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-400">
                        {convertValue(fin.operatingCashFlow, c, currency).formatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-orange-400">
                        {convertValue(fin.capitalExpenditure, c, currency).formatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {convertValue(fin.freeCashFlow, c, currency).formatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                        {fin.fcfMargin.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-cyan-400">
                        {convertValue(fin.totalCash, c, currency).formatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-400">
                        {convertValue(fin.netCash, c, currency).formatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                        {convertValue(fin.totalShareholderReturn, c, currency).formatted}
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
