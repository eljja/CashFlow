import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'

interface CashFlowWaterfallProps {
  company: Company
  currency: Currency
  selectedYear?: number
}

export const CashFlowWaterfall: React.FC<CashFlowWaterfallProps> = ({
  company,
  currency,
  selectedYear = 2025
}) => {
  const fin = company.financials.find((f) => f.year === selectedYear) || company.financials[company.financials.length - 1]

  const rev = convertValue(fin.revenue, company, currency).value
  const ocf = convertValue(fin.operatingCashFlow, company, currency).value
  const capex = convertValue(fin.capitalExpenditure, company, currency).value
  const fcf = convertValue(fin.freeCashFlow, company, currency).value
  const div = convertValue(fin.dividendsPaid, company, currency).value
  const buyb = convertValue(fin.shareRepurchase, company, currency).value
  const totCash = convertValue(fin.totalCash, company, currency).value
  const debt = convertValue(fin.totalDebt, company, currency).value
  const netCash = convertValue(fin.netCash, company, currency).value

  const unitLabel = convertValue(1, company, currency).unitLabel

  const categories = [
    '매출액\n(Revenue)',
    '영업현금\n(OCF)',
    '설비투자\n(-CapEx)',
    '잉여현금\n(=FCF)',
    '배당지급\n(-Dividends)',
    '자사주매입\n(-Buybacks)',
    '총가용현금\n(Total Cash)',
    '순현금\n(Net Cash)'
  ]

  const values = [
    rev,
    ocf,
    -capex,
    fcf,
    -div,
    -buyb,
    totCash,
    netCash
  ]

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 },
      formatter: (params: any) => {
        const item = params[0]
        const val = item.value
        const sign = val > 0 ? '+' : ''
        return `
          <div class="font-bold text-white mb-1">${item.name.replace('\n', ' ')}</div>
          <div class="font-mono text-sm font-semibold ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
            ${sign}${val.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unitLabel}
          </div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      top: '30px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#9CA3AF', fontSize: 10, interval: 0 }
    },
    yAxis: {
      type: 'value',
      name: `(${unitLabel})`,
      nameTextStyle: { color: '#6B7280', fontSize: 10, align: 'right' },
      splitLine: { lineStyle: { color: '#1F2937', type: 'dashed' } },
      axisLabel: { color: '#9CA3AF', fontSize: 11 }
    },
    series: [
      {
        name: '금액',
        type: 'bar',
        barMaxWidth: 36,
        data: values.map((v, i) => {
          let color = '#3B82F6'
          if (i === 1) color = '#3B82F6' // OCF
          if (i === 2) color = '#F97316' // CapEx
          if (i === 3) color = '#10B981' // FCF
          if (i === 4) color = '#F59E0B' // Div
          if (i === 5) color = '#EC4899' // Buybacks
          if (i === 6) color = '#06B6D4' // Cash
          if (i === 7) color = v >= 0 ? '#10B981' : '#EF4444' // Net Cash
          return {
            value: v,
            itemStyle: {
              color: color,
              borderRadius: v >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]
            }
          }
        })
      }
    ]
  }

  return (
    <div className="w-full h-80">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
    </div>
  )
}
