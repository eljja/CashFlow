import React, { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Company } from '../types'
import { Users, PieChart as PieIcon, History, TrendingUp, Table } from 'lucide-react'

interface ShareholderChartProps {
  company: Company
}

export const ShareholderChart: React.FC<ShareholderChartProps> = ({ company }) => {
  const currentShareholders = company.shareholders.current || []
  const history = company.shareholders.history || []
  const [historyView, setHistoryView] = useState<'table' | 'chart'>('table')

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
        const desc = params.data.description
          ? `<div class="text-[11px] text-gray-400 mt-1">${params.data.description}</div>`
          : ''
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
            fontSize: 13,
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

  // Extract keys from history for the table & trend chart
  const historyKeys =
    history.length > 0
      ? Array.from(
          new Set(
            history.flatMap((row) => Object.keys(row).filter((k) => k !== 'year'))
          )
        )
      : []

  const historyYears = history.map((h) => `${h.year}년`)

  const historyTrendOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 }
    },
    legend: {
      data: historyKeys,
      textStyle: { color: '#9CA3AF', fontSize: 11 },
      top: 0,
      itemGap: 12
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '4%',
      top: '36px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: historyYears,
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#9CA3AF', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#9CA3AF', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#1F2937', type: 'dashed' } }
    },
    series: historyKeys.map((key, idx) => ({
      name: key,
      type: 'line',
      smooth: true,
      symbolSize: 6,
      lineStyle: { width: 2.5, color: colors[idx % colors.length] },
      itemStyle: { color: colors[idx % colors.length] },
      data: history.map((row) => (row[key] !== undefined ? Number(row[key]) : 0))
    }))
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                대주주 구성 및 6개년(2020~2025) 지분 변동 시계열
              </h3>
              <p className="text-xs text-gray-400">
                사모펀드(PE), 글로벌 자산운용사, 창업자, 국부펀드 및 연기금 지배구조
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Donut Chart */}
          <div className="lg:col-span-5 h-60 relative flex items-center justify-center">
            <ReactECharts option={donutOption} style={{ height: '100%', width: '100%' }} notMerge={true} />
            <div className="absolute pointer-events-none text-center">
              <PieIcon className="w-5 h-5 text-gray-500 mx-auto mb-0.5 opacity-40" />
              <span className="text-[11px] text-gray-400 font-medium">2025 지분 구조</span>
            </div>
          </div>

          {/* Shareholder Breakdown List */}
          <div className="lg:col-span-7 space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {currentShareholders.map((s, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-800/80 hover:border-gray-700 transition-all flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate">
                        {s.nameKo || s.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 font-medium">
                        {s.type}
                      </span>
                    </div>
                    {s.description && (
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{s.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold font-mono text-blue-400">{s.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6-Year Ownership Time Series Table / Trend Chart */}
      {history.length > 0 && historyKeys.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-semibold text-gray-200">
                최근 6개년 주요 주주 지분율 변동 추이 (2020 ~ 2025)
              </h4>
            </div>

            <div className="flex items-center bg-gray-800/80 p-0.5 rounded-lg border border-gray-700 text-[11px]">
              <button
                onClick={() => setHistoryView('table')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                  historyView === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Table className="w-3 h-3" />
                <span>수치표</span>
              </button>
              <button
                onClick={() => setHistoryView('chart')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                  historyView === 'chart' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>트렌드 차트</span>
              </button>
            </div>
          </div>

          {historyView === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-2 px-3 font-semibold">연도</th>
                    {historyKeys.map((key, idx) => (
                      <th key={key} className="py-2 px-3 font-semibold text-right">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colors[idx % colors.length] }}
                          />
                          <span>{key}</span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {history.map((row) => (
                    <tr key={row.year} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-1.5 px-3 font-bold text-white font-mono">{row.year}년</td>
                      {historyKeys.map((key) => (
                        <td key={key} className="py-1.5 px-3 text-right font-mono text-gray-300">
                          {row[key] !== undefined ? `${Number(row[key]).toFixed(2)}%` : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-48 w-full">
              <ReactECharts
                option={historyTrendOption}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
