import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'

interface CashLiquidityChartProps {
  company: Company
  currency: Currency
}

export const CashLiquidityChart: React.FC<CashLiquidityChartProps> = ({ company, currency }) => {
  const years = company.financials.map((f) => f.year.toString())

  const totalCashData = company.financials.map(
    (f) => convertValue(f.totalCash, company, currency).value
  )
  const debtData = company.financials.map(
    (f) => convertValue(f.totalDebt, company, currency).value
  )
  const netCashData = company.financials.map(
    (f) => convertValue(f.netCash, company, currency).value
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
        let res = `<div class="font-bold mb-1 border-b border-gray-700 pb-1 text-white">${params[0].name}년 유동성 및 부채 현황 (${unitLabel})</div>`
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
      data: ['총 가용현금 (Cash + ST Inv)', '총차입금 (Total Debt)', '순현금 (Net Cash Cushion)'],
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
        name: '총 가용현금 (Cash + ST Inv)',
        type: 'bar',
        barMaxWidth: 30,
        data: totalCashData,
        itemStyle: {
          color: '#06B6D4',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '총차입금 (Total Debt)',
        type: 'bar',
        barMaxWidth: 30,
        data: debtData,
        itemStyle: {
          color: '#EF4444',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '순현금 (Net Cash Cushion)',
        type: 'line',
        data: netCashData,
        smooth: true,
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#10B981',
          type: 'solid'
        },
        itemStyle: {
          color: '#10B981',
          borderColor: '#FFFFFF',
          borderWidth: 2
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
