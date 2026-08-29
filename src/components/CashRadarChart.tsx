import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Company } from '../types'
import { calculateCashQuality } from '../utils/analysis'

interface CashRadarChartProps {
  companies: Company[]
}

export const CashRadarChart: React.FC<CashRadarChartProps> = ({ companies }) => {
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4']

  const seriesData = companies.map((c, idx) => {
    const quality = calculateCashQuality(c)
    const m = quality.radarMetrics
    return {
      name: c.nameKo,
      value: [m.fcfPower, m.netCashSafety, m.cashConversion, m.shareholderFriendly, m.capexEfficiency],
      itemStyle: { color: colors[idx % colors.length] },
      areaStyle: {
        color: `${colors[idx % colors.length]}33` // 20% opacity fill
      },
      lineStyle: {
        width: 2.5,
        color: colors[idx % colors.length]
      }
    }
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 }
    },
    legend: {
      data: companies.map((c) => c.nameKo),
      textStyle: { color: '#9CA3AF', fontSize: 11 },
      top: 0,
      itemGap: 12
    },
    radar: {
      center: ['50%', '55%'],
      radius: '68%',
      indicator: [
        { name: 'FCF 창출력\n(Margin & Scale)', max: 100 },
        { name: '순현금 안전성\n(Net Cash Cushion)', max: 100 },
        { name: '현금 전환 효율\n(FCF / Net Income)', max: 100 },
        { name: '주주환원 적극성\n(Payout / FCF)', max: 100 },
        { name: '설비투자 효율\n(OCF / CapEx)', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#9CA3AF',
        fontSize: 11,
        fontWeight: 500
      },
      splitLine: {
        lineStyle: { color: '#1F2937' }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#11182700', '#1F293733', '#11182700', '#37415122']
        }
      },
      axisLine: {
        lineStyle: { color: '#374151' }
      }
    },
    series: [
      {
        type: 'radar',
        data: seriesData,
        symbolSize: 6
      }
    ]
  }

  return (
    <div className="w-full h-80">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
    </div>
  )
}
