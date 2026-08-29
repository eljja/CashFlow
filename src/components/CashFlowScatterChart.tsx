import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { Compass, Sparkles } from 'lucide-react'

interface CashFlowScatterChartProps {
  companies: Company[]
  currency: Currency
  onSelectCompany: (companyId: string) => void
}

export const CashFlowScatterChart: React.FC<CashFlowScatterChartProps> = ({
  companies,
  currency,
  onSelectCompany
}) => {
  const categoryColors: Record<string, string> = {
    Domestic: '#3B82F6', // Blue
    US: '#10B981',       // Emerald
    Global: '#8B5CF6',   // Purple
    Additional: '#F59E0B' // Amber
  }

  const categoryNames: Record<string, string> = {
    Domestic: '국내 대표 20',
    US: '미국 대표 20',
    Global: '글로벌 대표 20',
    Additional: '추가 유망 20'
  }

  const categories = ['Domestic', 'US', 'Global', 'Additional']

  const series = categories.map((cat) => {
    const catCompanies = companies.filter((c) => c.category === cat)
    const data = catCompanies.map((c) => {
      const latestFin = c.financials[c.financials.length - 1]
      const netCashUSD = convertValue(latestFin.netCash, c, 'USD').value
      const capexUSD = convertValue(latestFin.capitalExpenditure, c, 'USD').value
      const fcfUSD = convertValue(latestFin.freeCashFlow, c, 'USD').value
      const fcfMargin = latestFin.fcfMargin

      return {
        name: c.nameKo,
        value: [fcfMargin, netCashUSD, Math.max(10, Math.min(60, Math.sqrt(capexUSD) * 5 + 8)), c.id, fcfUSD, capexUSD, c.ticker, c.sector],
        itemStyle: {
          color: categoryColors[cat],
          opacity: 0.85,
          borderColor: '#FFFFFF',
          borderWidth: 1.5
        }
      }
    })

    return {
      name: categoryNames[cat],
      type: 'scatter',
      data: data,
      symbolSize: (dataItem: any) => dataItem[2]
    }
  })

  const unitLabel = '$B (십억 달러)'

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 },
      formatter: (params: any) => {
        const val = params.value
        const companyName = params.name
        const fcfMargin = val[0]
        const netCash = val[1]
        const fcfVal = val[4]
        const capexVal = val[5]
        const ticker = val[6]
        const sector = val[7]

        return `
          <div class="font-bold text-white mb-1 border-b border-gray-700 pb-1 flex items-center justify-between gap-4">
            <span>${companyName} (${ticker})</span>
            <span class="text-[10px] text-gray-400 font-normal">${sector}</span>
          </div>
          <div class="space-y-1 text-xs font-mono">
            <div class="flex justify-between gap-4">
              <span class="text-gray-400">FCF 마진율:</span>
              <span class="font-bold ${fcfMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${fcfMargin.toFixed(1)}%</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-400">순현금 보유고:</span>
              <span class="font-bold ${netCash >= 0 ? 'text-blue-400' : 'text-rose-400'}">${netCash >= 0 ? '+' : ''}$${netCash.toFixed(1)}B</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-400">2025 잉여현금(FCF):</span>
              <span class="text-white">$${fcfVal.toFixed(1)}B</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-400">설비투자 (CapEx):</span>
              <span class="text-orange-400">$${capexVal.toFixed(1)}B</span>
            </div>
          </div>
          <div class="mt-2 pt-1.5 border-t border-gray-800 text-[10px] text-blue-400 text-center">
            👉 클릭하여 기업 심층 분석 보기
          </div>
        `
      }
    },
    legend: {
      data: Object.values(categoryNames),
      textStyle: { color: '#9CA3AF', fontSize: 11 },
      top: 0,
      itemGap: 16
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '6%',
      top: '45px',
      containLabel: true
    },
    xAxis: {
      name: 'FCF 마진율 (%)',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: '#9CA3AF', fontSize: 11 },
      type: 'value',
      splitLine: { lineStyle: { color: '#1F2937', type: 'dashed' } },
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#9CA3AF', formatter: '{value}%' }
    },
    yAxis: {
      name: `순현금 Net Cash (${unitLabel})`,
      nameTextStyle: { color: '#9CA3AF', fontSize: 11, align: 'right' },
      type: 'value',
      splitLine: { lineStyle: { color: '#1F2937', type: 'dashed' } },
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#9CA3AF', formatter: '${value}B' }
    },
    series: series
  }

  const onChartClick = (params: any) => {
    if (params.data && params.data.value && params.data.value[3]) {
      const companyId = params.data.value[3]
      onSelectCompany(companyId)
    }
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>글로벌 80대 기업 현금 창출력 & 완충력 매트릭스 지형도</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                Cash Flow Matrix
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              X축: FCF 마진(수익성) · Y축: 순현금(재무안전성) · 버블 크기: 설비투자(CapEx 규모)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-700/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>우상향(1사분면)에 위치할수록 강력한 FCF 마진과 순현금 완충력을 보유한 기업</span>
        </div>
      </div>

      <div className="h-[460px] w-full">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          onEvents={{ click: onChartClick }}
        />
      </div>
    </div>
  )
}
