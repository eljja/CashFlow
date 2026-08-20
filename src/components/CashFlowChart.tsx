import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'

interface CashFlowChartProps {
  company: Company
  currency: Currency
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ company, currency }) => {
  const years = company.financials.map((f) => f.year.toString())

  const ocfData = company.financials.map(
    (f) => convertValue(f.operatingCashFlow, company, currency).value
  )
  const capexData = company.financials.map(
    (f) => convertValue(f.capitalExpenditure, company, currency).value
  )
  const fcfData = company.financials.map(
    (f) => convertValue(f.freeCashFlow, company, currency).value
  )
  const finCfData = company.financials.map(
    (f) => convertValue(f.financingCashFlow, company, currency).value
  )

  const unitLabel = convertValue(1, company, currency).unitLabel

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 },
      formatter: (params: any) => {
        let res = `<div class="font-bold mb-1 border-b border-gray-700 pb-1 text-white">${params[0].name}년 현금흐름 (${unitLabel})</div>`
        params.forEach((item: any) => {
          const val = item.value
          const color = item.color
          const sign = val > 0 ? '+' : ''
          res += `
            <div class="flex items-center justify-between gap-4 py-0.5 text-xs">
              <div class="flex items-center gap-1.5">
                <span class="inline-block w-2.5 h-2.5 rounded-sm" style="background:${color}"></span>
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
      data: [
        '영업활동현금흐름 (OCF)',
        '설비투자 (CapEx)',
        '잉여현금흐름 (FCF)',
        '재무활동현금흐름 (Financing)'
      ],
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
      data: years,
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
    series: [
      {
        name: '영업활동현금흐름 (OCF)',
        type: 'bar',
        barMaxWidth: 28,
        data: ocfData,
        itemStyle: {
          color: '#3B82F6',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '설비투자 (CapEx)',
        type: 'bar',
        barMaxWidth: 28,
        data: capexData,
        itemStyle: {
          color: '#F97316',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '재무활동현금흐름 (Financing)',
        type: 'bar',
        barMaxWidth: 28,
        data: finCfData,
        itemStyle: {
          color: '#A855F7',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '잉여현금흐름 (FCF)',
        type: 'line',
        data: fcfData,
        smooth: true,
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#10B981',
          shadowColor: 'rgba(16, 185, 129, 0.4)',
          shadowBlur: 8
        },
        itemStyle: {
          color: '#10B981',
          borderColor: '#FFFFFF',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }
            ]
          }
        }
      }
    ]
  }

  return (
    <div className="w-full h-80">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
    </div>
  )
}
