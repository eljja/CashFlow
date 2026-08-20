import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Company } from '../types'
import { Users, PieChart as PieIcon, History } from 'lucide-react'

interface ShareholderChartProps {
  company: Company
}

export const ShareholderChart: React.FC<ShareholderChartProps> = ({ company }) => {
  const currentShareholders = company.shareholders.current || []
  const history = company.shareholders.history || []

  // Color palette for shareholders
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6B7280'  // Gray (others)
  ]

  const chartData = currentShareholders.map((s, idx) => ({
    name: s.nameKo || s.name,
    value: s.percentage,
    itemStyle: { color: colors[idx % colors.length] },
    description: s.description,
    type: s.type
  }))

  const donutOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 },
      formatter: (params: any) => {
        const desc = params.data.description ? `<div class="text-[11px] text-gray-400 mt-1">${params.data.description}</div>` : ''
        return `
          <div class="font-bold text-white mb-0.5">${params.name}</div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-blue-400 font-semibold">${params.value}%</span>
            <span class="text-gray-400">지분율</span>
          </div>
          ${desc}
        `
      }
    },
    series: [
      {
        name: '대주주 지분',
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#111827',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#FFFFFF',
            formatter: '{b}\n{c}%'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  }

  // Extract keys from history for the table
  const historyKeys = history.length > 0 ? Object.keys(history[0]).filter((k) => k !== 'year') : []

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">대주주 구성 및 5개년 지분 변동 시계열</h3>
            <p className="text-xs text-gray-400">사모펀드(PE), 글로벌 자산운용사, 창업자 및 연기금</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Donut Chart */}
        <div className="lg:col-span-5 h-64 relative flex items-center justify-center">
          <ReactECharts option={donutOption} style={{ height: '100%', width: '100%' }} notMerge={true} />
          <div className="absolute pointer-events-none text-center">
            <PieIcon className="w-6 h-6 text-gray-500 mx-auto mb-1 opacity-40" />
            <span className="text-[11px] text-gray-400 font-medium">지분율 구조</span>
          </div>
        </div>

        {/* Shareholder Breakdown List */}
        <div className="lg:col-span-7 space-y-2">
          {currentShareholders.map((s, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-800/80 hover:border-gray-700 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{s.nameKo || s.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 font-medium">
                      {s.type}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{s.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-blue-400">{s.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Year Ownership Time Series Table */}
      {history.length > 0 && historyKeys.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-semibold text-gray-200">최근 5개년 주요 주주 지분율 변동 추이 (2020 ~ 2024)</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-2 px-3 font-semibold">연도 (Year)</th>
                  {historyKeys.map((key) => (
                    <th key={key} className="py-2 px-3 font-semibold text-right">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {history.map((row) => (
                  <tr key={row.year} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-white font-mono">{row.year}년</td>
                    {historyKeys.map((key) => (
                      <td key={key} className="py-2 px-3 text-right font-mono text-gray-300">
                        {row[key] !== undefined ? `${row[key].toFixed(2)}%` : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
