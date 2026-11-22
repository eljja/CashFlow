import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { Compass, Sparkles, Play, Pause, Eye, EyeOff } from 'lucide-react'

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
  const [selectedYear, setSelectedYear] = useState<number>(2025)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [showLabels, setShowLabels] = useState<boolean>(true)

  const years = [2020, 2021, 2022, 2023, 2024, 2025]

  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setSelectedYear((prev) => {
        const idx = years.indexOf(prev)
        if (idx >= years.length - 1) {
          setIsPlaying(false)
          return 2025
        }
        return years[idx + 1]
      })
    }, 1300)
    return () => clearInterval(timer)
  }, [isPlaying])

  const handleTogglePlay = () => {
    if (!isPlaying && selectedYear === 2025) {
      setSelectedYear(2020)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const displayCurrency: 'USD' | 'KRW' = currency === 'KRW' ? 'KRW' : 'USD'
  const unitSymbol = displayCurrency === 'KRW' ? '조원' : '$B'

  const categoryColors: Record<string, string> = {
    Domestic: '#3B82F6', // Blue
    US: '#10B981', // Emerald
    Global: '#8B5CF6', // Purple
    Additional: '#F59E0B' // Amber
  }

  const categoryNames: Record<string, string> = {
    Domestic: '🇰🇷 국내 대표 20',
    US: '🇺🇸 미국 대표 20',
    Global: '🌍 글로벌 대표 20',
    Additional: '🚀 추가 혁신 20'
  }

  const categories = ['Domestic', 'US', 'Global', 'Additional']

  // Count quadrants for selectedYear
  let q1Count = 0 // FCF >= 0, NetCash >= 0
  let q2Count = 0 // FCF < 0, NetCash >= 0
  let q3Count = 0 // FCF < 0, NetCash < 0
  let q4Count = 0 // FCF >= 0, NetCash < 0

  companies.forEach((c) => {
    const fin =
      c.financials.find((f) => f.year === selectedYear) ||
      c.financials[c.financials.length - 1]
    if (fin.fcfMargin >= 0 && fin.netCash >= 0) q1Count++
    else if (fin.fcfMargin < 0 && fin.netCash >= 0) q2Count++
    else if (fin.fcfMargin < 0 && fin.netCash < 0) q3Count++
    else q4Count++
  })

  const series = categories.map((cat, seriesIdx) => {
    const catCompanies = companies.filter((c) => c.category === cat)
    const data = catCompanies.map((c) => {
      const fin =
        c.financials.find((f) => f.year === selectedYear) ||
        c.financials[c.financials.length - 1]
      const netCashVal = convertValue(fin.netCash, c, displayCurrency).value
      const capexUSD = convertValue(fin.capitalExpenditure, c, 'USD').value
      const fcfFormatted = convertValue(fin.freeCashFlow, c, displayCurrency).formatted
      const capexFormatted = convertValue(fin.capitalExpenditure, c, displayCurrency).formatted
      const netCashFormatted = convertValue(fin.netCash, c, displayCurrency).formatted
      const fcfMargin = fin.fcfMargin

      return {
        name: c.nameKo,
        value: [
          fcfMargin,
          netCashVal,
          Math.max(12, Math.min(58, Math.sqrt(Math.max(0.1, capexUSD)) * 5.2 + 8)),
          c.id,
          fcfFormatted,
          capexFormatted,
          c.ticker,
          c.sector,
          netCashFormatted
        ],
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
      symbolSize: (dataItem: any) => dataItem[2],
      label: {
        show: showLabels,
        position: 'top',
        formatter: (param: any) => param.name,
        color: '#E5E7EB',
        fontSize: 10,
        fontWeight: 500
      },
      labelLayout: {
        hideOverlap: true
      },
      markLine:
        seriesIdx === 0
          ? {
              silent: true,
              symbol: 'none',
              lineStyle: {
                color: '#4B5563',
                type: 'dashed',
                width: 1.5
              },
              label: {
                color: '#9CA3AF',
                fontSize: 10
              },
              data: [
                { xAxis: 0, name: 'FCF 손익분기 (0%)' },
                { yAxis: 0, name: '순현금 분기점 (0)' }
              ]
            }
          : undefined
    }
  })

  const option = {
    backgroundColor: 'transparent',
    animationDurationUpdate: 900,
    animationEasingUpdate: 'cubicInOut',
    tooltip: {
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 },
      formatter: (params: any) => {
        if (!params.value || !Array.isArray(params.value)) return ''
        const val = params.value
        const companyName = params.name
        const fcfMargin = val[0]
        const netCashNum = val[1]
        const fcfStr = val[4]
        const capexStr = val[5]
        const ticker = val[6]
        const sector = val[7]
        const netCashStr = val[8]

        return `
          <div class="font-bold text-white mb-1 border-b border-gray-700 pb-1 flex items-center justify-between gap-4">
            <span>${companyName} (${ticker}) · ${selectedYear}년</span>
            <span class="text-[10px] text-gray-400 font-normal">${sector}</span>
          </div>
          <div class="space-y-1 text-xs font-mono">
            <div class="flex justify-between gap-4">
              <span class="text-gray-400">FCF 마진율:</span>
              <span class="font-bold ${fcfMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${fcfMargin.toFixed(1)}%</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-400">순현금 (Net Cash):</span>
              <span class="font-bold ${netCashNum >= 0 ? 'text-blue-400' : 'text-rose-400'}">${netCashStr}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-400">${selectedYear} 잉여현금(FCF):</span>
              <span class="text-white">${fcfStr}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-400">설비투자 (CapEx):</span>
              <span class="text-orange-400">${capexStr}</span>
            </div>
          </div>
          <div class="mt-2 pt-1.5 border-t border-gray-800 text-[10px] text-blue-400 text-center">
            👉 버블 클릭 시 해당 기업 심층 분석으로 이동
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
      bottom: '8%',
      top: '45px',
      containLabel: true
    },
    xAxis: {
      name: `${selectedYear}년 FCF 마진율 (FCF / Revenue %)`,
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold' },
      type: 'value',
      splitLine: { lineStyle: { color: '#1F2937', type: 'dashed' } },
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#9CA3AF', formatter: '{value}%' }
    },
    yAxis: {
      name: `순현금 Net Cash (${unitSymbol})`,
      nameTextStyle: { color: '#9CA3AF', fontSize: 11, align: 'right', fontWeight: 'bold' },
      type: 'value',
      splitLine: { lineStyle: { color: '#1F2937', type: 'dashed' } },
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: {
        color: '#9CA3AF',
        formatter: (v: number) => (displayCurrency === 'KRW' ? `${v}조` : `$${v}B`)
      }
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
    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
      {/* Header & Time-Lapse Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex flex-wrap items-center gap-2">
              <span>글로벌 {companies.length}개사 현금 창출력 & 완충력 4사분면 매트릭스</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-mono">
                {selectedYear}년 기준
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              X축: FCF 마진율(현금수익성) · Y축: 순현금(무차입 안전성) · 버블 크기: 설비투자(CapEx)
            </p>
          </div>
        </div>

        {/* Year Time-Lapse & Label Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play 6-Year Time-Lapse Button */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? '타임랩스 일시정지' : '6개년 타임랩스 재생'}</span>
          </button>

          {/* Year Buttons */}
          <div className="flex items-center bg-gray-800/90 p-1 rounded-xl border border-gray-700">
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => {
                  setIsPlaying(false)
                  setSelectedYear(yr)
                }}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              showLabels
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
            title="버블 위 기업명 라벨 표시 전환"
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>라벨</span>
          </button>
        </div>
      </div>

      {/* 4-Quadrant Summary Pill Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 block">
              1사분면 (FCF+ / 순현금+)
            </span>
            <span className="text-[11px] text-gray-400">🏆 초우량 캐시카우 요새</span>
          </div>
          <span className="text-lg font-black font-mono text-emerald-400">{q1Count}개사</span>
        </div>

        <div className="p-3 rounded-2xl bg-blue-950/25 border border-blue-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-400 block">
              4사분면 (FCF+ / 순차입-)
            </span>
            <span className="text-[11px] text-gray-400">🚀 고수익 레버리지 성장</span>
          </div>
          <span className="text-lg font-black font-mono text-blue-400">{q4Count}개사</span>
        </div>

        <div className="p-3 rounded-2xl bg-cyan-950/25 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 block">
              2사분면 (FCF- / 순현금+)
            </span>
            <span className="text-[11px] text-gray-400">🛡️ 현금보유 공격투자</span>
          </div>
          <span className="text-lg font-black font-mono text-cyan-400">{q2Count}개사</span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-950/25 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-400 block">
              3사분면 (FCF- / 순차입-)
            </span>
            <span className="text-[11px] text-gray-400">⚡ 대규모 CapEx / 턴어라운드</span>
          </div>
          <span className="text-lg font-black font-mono text-amber-400">{q3Count}개사</span>
        </div>
      </div>

      {/* Scatter Plot */}
      <div className="h-[500px] w-full">
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
