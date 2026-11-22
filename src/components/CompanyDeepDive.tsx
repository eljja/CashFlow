import React, { useState } from 'react'
import { Company, Currency } from '../types'
import { CashFlowChart } from './CashFlowChart'
import { CashLiquidityChart } from './CashLiquidityChart'
import { ShareholderChart } from './ShareholderChart'
import { CashRadarChart } from './CashRadarChart'
import { CashQualityBadge } from './CashQualityBadge'
import { CashFlowWaterfall } from './CashFlowWaterfall'
import { CashFlowSimulator } from './CashFlowSimulator'
import { convertValue } from '../utils/formatters'
import { calculateCashQuality } from '../utils/analysis'
import {
  Globe,
  TrendingUp,
  ShieldCheck,
  Gift,
  BarChart3,
  Compass,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Share2,
  Check,
  Swords,
  Download
} from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import * as XLSX from 'xlsx'

interface CompanyDeepDiveProps {
  company: Company
  currency: Currency
  onPrevCompany?: () => void
  onNextCompany?: () => void
  currentIndex?: number
  totalFiltered?: number
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  isInComparison?: boolean
  onToggleComparison?: (id: string) => void
  onGoToComparison?: () => void
}

export const CompanyDeepDive: React.FC<CompanyDeepDiveProps> = ({
  company,
  currency,
  onPrevCompany,
  onNextCompany,
  currentIndex = 0,
  totalFiltered = 80,
  isFavorite = false,
  onToggleFavorite,
  isInComparison = false,
  onToggleComparison,
  onGoToComparison
}) => {
  const latestFin = company.financials[company.financials.length - 1]
  const prevFin =
    company.financials.length >= 2
      ? company.financials[company.financials.length - 2]
      : latestFin
  const firstFin = company.financials[0]
  const years = company.financials.map((f) => f.year.toString())

  const [chartMode, setChartMode] = useState<'combo' | 'waterfall'>('combo')
  const [waterfallYear, setWaterfallYear] = useState<number>(2025)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  // Cumulative FCF & TSR across all 6 years
  const cumFcf = company.financials.reduce((sum, f) => sum + f.freeCashFlow, 0)
  const cumFcfConv = convertValue(cumFcf, company, currency)
  const cumTsr = company.financials.reduce((sum, f) => sum + f.totalShareholderReturn, 0)
  const cumTsrConv = convertValue(cumTsr, company, currency)
  const avgFcfMargin =
    company.financials.reduce((sum, f) => sum + f.fcfMargin, 0) / company.financials.length

  // YoY FCF change calculation
  const getYoYLabel = (curr: number, prev: number) => {
    if (prev < 0 && curr >= 0) return { text: '흑자전환', color: 'text-emerald-400' }
    if (prev >= 0 && curr < 0) return { text: '적자전환', color: 'text-rose-400' }
    if (prev === 0) return { text: '-', color: 'text-gray-400' }
    const pct = ((curr - prev) / Math.abs(prev)) * 100
    const sign = pct > 0 ? '+' : ''
    return {
      text: `전년비 ${sign}${pct.toFixed(1)}%`,
      color: pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
    }
  }

  const fcfYoY = getYoYLabel(latestFin.freeCashFlow, prevFin.freeCashFlow)
  const quality = calculateCashQuality(company)
  const topShareholder = company.shareholders.current?.[0]

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?company=${company.id}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Export single company 6-year statement to Excel
  const handleExportCompanyExcel = () => {
    const unitLbl = convertValue(1, company, currency).unitLabel
    const rows = [
      { metric: '매출액 (Revenue)', key: 'revenue' },
      { metric: '영업이익 (Operating Income)', key: 'operatingIncome' },
      { metric: '당기순이익 (Net Income)', key: 'netIncome' },
      { metric: '영업활동 현금흐름 (OCF)', key: 'operatingCashFlow' },
      { metric: '설비투자 (CapEx)', key: 'capitalExpenditure' },
      { metric: '잉여현금흐름 (FCF)', key: 'freeCashFlow' },
      { metric: 'FCF 마진율 (%)', key: 'fcfMargin' },
      { metric: '투자활동 현금흐름 (ICF)', key: 'investingCashFlow' },
      { metric: '재무활동 현금흐름 (Financing CF)', key: 'financingCashFlow' },
      { metric: '현금 배당금 지급액', key: 'dividendsPaid' },
      { metric: '자사주 취득/소각액', key: 'shareRepurchase' },
      { metric: '총 주주환원액 (TSR)', key: 'totalShareholderReturn' },
      { metric: '기말 현금 및 현금성자산', key: 'cashAndEquivalents' },
      { metric: '단기금융상품', key: 'shortTermInvestments' },
      { metric: '총 가용현금 (Total Cash)', key: 'totalCash' },
      { metric: '총차입금 (Total Debt)', key: 'totalDebt' },
      { metric: '순현금 (Net Cash)', key: 'netCash' }
    ].map((item) => {
      const rowObj: Record<string, any> = { '재무 항목': `${item.metric} (${unitLbl})` }
      company.financials.forEach((f) => {
        if (item.key === 'fcfMargin') {
          rowObj[`${f.year}년`] = Number(f.fcfMargin.toFixed(2))
        } else {
          rowObj[`${f.year}년`] = Number(
            convertValue((f as any)[item.key], company, currency).value.toFixed(2)
          )
        }
      })
      return rowObj
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `${company.nameKo}_6개년재무`)
    XLSX.writeFile(wb, `${company.nameKo}_${company.ticker}_2020_2025_${currency}.xlsx`)
  }

  // Shareholder Return ECharts Option
  const divData = company.financials.map((f) => convertValue(f.dividendsPaid, company, currency).value)
  const buybackData = company.financials.map((f) => convertValue(f.shareRepurchase, company, currency).value)
  const fcfLineData = company.financials.map((f) => convertValue(f.freeCashFlow, company, currency).value)
  const unitLabel = convertValue(1, company, currency).unitLabel

  const shareholderReturnOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: { color: '#F3F4F6', fontSize: 12 },
      formatter: (params: any) => {
        let res = `<div class="font-bold mb-1 border-b border-gray-700 pb-1 text-white">${params[0].name}년 FCF 대비 주주환원 (${unitLabel})</div>`
        params.forEach((item: any) => {
          const val = item.value
          const color = item.color
          res += `
            <div class="flex items-center justify-between gap-4 py-0.5 text-xs">
              <div class="flex items-center gap-1.5">
                <span class="inline-block w-2.5 h-2.5 rounded-sm" style="background:${color}"></span>
                <span class="text-gray-300">${item.seriesName}</span>
              </div>
              <span class="font-mono font-semibold text-white">
                ${val.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unitLabel}
              </span>
            </div>
          `
        })
        return res
      }
    },
    legend: {
      data: ['현금 배당금 지급 (Dividends)', '자사주 매입/소각 (Buybacks)', '잉여현금흐름 (FCF)'],
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
        name: '현금 배당금 지급 (Dividends)',
        type: 'bar',
        stack: 'return',
        barMaxWidth: 30,
        data: divData,
        itemStyle: { color: '#F59E0B' }
      },
      {
        name: '자사주 매입/소각 (Buybacks)',
        type: 'bar',
        stack: 'return',
        barMaxWidth: 30,
        data: buybackData,
        itemStyle: { color: '#EC4899', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '잉여현금흐름 (FCF)',
        type: 'line',
        data: fcfLineData,
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3, color: '#10B981', type: 'dashed' },
        itemStyle: { color: '#10B981' }
      }
    ]
  }

  // Mini inline sparkline helper for the 6-year financial table
  const renderMiniTrend = (vals: number[], colorHex: string) => {
    const first = vals[0]
    const last = vals[vals.length - 1]
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min || 1

    let deltaLabel = '-'
    let deltaColor = 'text-gray-400'
    if (first < 0 && last >= 0) {
      deltaLabel = '흑자전환'
      deltaColor = 'text-emerald-400'
    } else if (first >= 0 && last < 0) {
      deltaLabel = '적자전환'
      deltaColor = 'text-rose-400'
    } else if (first !== 0) {
      const pct = ((last - first) / Math.abs(first)) * 100
      deltaLabel = `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`
      deltaColor = pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
    }

    return (
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-end gap-0.5 h-4 w-12">
          {vals.map((v, i) => {
            const norm = Math.max(15, Math.round(((v - min) / range) * 100))
            return (
              <span
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${norm}%`,
                  backgroundColor: v >= 0 ? colorHex : '#F43F5E',
                  opacity: i === vals.length - 1 ? 1 : 0.55
                }}
              />
            )
          })}
        </div>
        <span className={`font-mono text-[10px] font-semibold w-12 text-right ${deltaColor}`}>
          {deltaLabel}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Profile Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900/95 to-blue-950/40 border border-gray-800 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        {/* Top Utility & Quick Switch Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-gray-800/80">
          <div className="flex items-center gap-1.5 shrink-0">
            {onPrevCompany && onNextCompany && (
              <div className="flex items-center bg-gray-800/80 rounded-xl p-0.5 border border-gray-700/80 shrink-0">
                <button
                  onClick={onPrevCompany}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-gray-700/60 transition-colors whitespace-nowrap"
                  title="이전 기업 (단축키: [ )"
                >
                  <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                  <span>이전</span>
                </button>
                <span className="px-2 text-[11px] font-mono text-gray-400 whitespace-nowrap">
                  {currentIndex + 1} / {totalFiltered}
                </span>
                <button
                  onClick={onNextCompany}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-gray-700/60 transition-colors whitespace-nowrap"
                  title="다음 기업 (단축키: ] )"
                >
                  <span>다음</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Favorite Toggle */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(company.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isFavorite
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-gray-800/70 hover:bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 shrink-0 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isFavorite ? '관심기업 등록됨' : '관심기업'}</span>
              </button>
            )}

            {/* Add to Peer Comparison Battle */}
            {onToggleComparison && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onToggleComparison(company.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isInComparison
                      ? 'bg-purple-600/25 border-purple-500/50 text-purple-300'
                      : 'bg-gray-800/70 hover:bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{isInComparison ? '비교함 담김 ✓' : '+ 비교 담기'}</span>
                </button>
                {isInComparison && onGoToComparison && (
                  <button
                    onClick={onGoToComparison}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shadow-sm whitespace-nowrap shrink-0"
                  >
                    비교 보기 →
                  </button>
                )}
              </div>
            )}

            {/* Share Direct Link */}
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gray-800/70 hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 hover:text-white transition-all whitespace-nowrap shrink-0"
              title="현재 기업 분석 직링크 복사"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400">복사됨!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>링크 공유</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Company Identity & Description */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
              {company.category === 'Domestic'
                ? '🇰🇷 국내 대표 20'
                : company.category === 'US'
                ? '🇺🇸 미국 대표 20'
                : company.category === 'Global'
                ? '🌍 글로벌 대표 20'
                : '🚀 추가 혁신 20'}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 whitespace-nowrap">
              {company.sector}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 flex items-center gap-1 whitespace-nowrap">
              <Globe className="w-3 h-3 text-gray-400 shrink-0" />
              {company.country}
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 whitespace-nowrap">
              {company.ticker}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-gray-800/80 text-gray-400 border border-gray-700 whitespace-nowrap">
              원천단위: {company.unit}
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span>{company.nameKo}</span>
            <span className="text-base sm:text-lg font-normal text-gray-400">({company.name})</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1.5 max-w-4xl leading-relaxed">
            {company.description}
          </p>
        </div>

        {/* 4 Hero KPI Badges (Full-Width 2x2 on Mobile, 4-Column on Desktop -> Zero Cramping!) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full mt-5">
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-3 sm:p-4 text-center shadow-lg shadow-emerald-950/30">
            <span className="text-[11px] font-bold text-emerald-300 block mb-1 whitespace-nowrap">
              🌟 2025 잉여현금(FCF)
            </span>
            <span
              className={`text-base sm:text-xl font-black font-mono block whitespace-nowrap ${
                latestFin.freeCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {convertValue(latestFin.freeCashFlow, company, currency).formatted}
            </span>
            <span className={`text-[10px] font-semibold mt-0.5 block whitespace-nowrap ${fcfYoY.color}`}>
              {fcfYoY.text}
            </span>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-3 sm:p-4 text-center">
            <span className="text-[11px] text-gray-400 block mb-1 whitespace-nowrap">
              2025 순현금(Net Cash)
            </span>
            <span
              className={`text-base sm:text-xl font-extrabold font-mono block whitespace-nowrap ${
                latestFin.netCash >= 0 ? 'text-blue-400' : 'text-rose-400'
              }`}
            >
              {convertValue(latestFin.netCash, company, currency).formatted}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block whitespace-nowrap">
              {latestFin.netCash >= 0 ? '🛡️ 무차입 순현금 상태' : '⚡ 순차입 레버리지'}
            </span>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-3 sm:p-4 text-center">
            <span className="text-[11px] text-gray-400 block mb-1 whitespace-nowrap">
              2025 FCF 마진율
            </span>
            <span
              className={`text-base sm:text-xl font-extrabold font-mono block whitespace-nowrap ${
                latestFin.fcfMargin >= 0 ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {latestFin.fcfMargin.toFixed(1)}%
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block font-mono whitespace-nowrap">
              6년 평균: {avgFcfMargin.toFixed(1)}%
            </span>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-3 sm:p-4 text-center">
            <span className="text-[11px] text-gray-400 block mb-1 whitespace-nowrap">
              6개년 누적 FCF 창출
            </span>
            <span
              className={`text-base sm:text-xl font-extrabold font-mono block whitespace-nowrap ${
                cumFcf >= 0 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {cumFcfConv.formatted}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block font-mono whitespace-nowrap truncate">
              누적 주주환원: {cumTsrConv.formatted}
            </span>
          </div>
        </div>

        {/* Dedicated FCF Core Metric Breakdown Banner */}
        <div className="bg-gradient-to-r from-emerald-950/50 via-gray-900 to-blue-950/40 border border-emerald-500/30 rounded-2xl p-4 shadow-lg mt-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
                FCF
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    잉여현금흐름 (Free Cash Flow) 창출 공식 분해
                  </h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                    핵심 1위 현금지표
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  본업으로 번 현금(OCF)에서 미래 성장을 위한 설비투자(CapEx)를 차감한 후{' '}
                  <strong>기업에 실제로 남는 순수 가용 현금</strong>
                </p>
              </div>
            </div>

            {/* FCF Equation Box */}
            <div className="flex flex-wrap items-center gap-2 bg-gray-950/80 px-4 py-2 rounded-xl border border-gray-800 font-mono text-xs text-gray-200">
              <span className="text-blue-400 font-semibold">
                OCF {convertValue(latestFin.operatingCashFlow, company, currency).formatted}
              </span>
              <span className="text-gray-500">-</span>
              <span className="text-orange-400 font-semibold">
                CapEx {convertValue(latestFin.capitalExpenditure, company, currency).formatted}
              </span>
              <span className="text-gray-500">=</span>
              <span
                className={`font-bold text-sm ${
                  latestFin.freeCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                FCF {convertValue(latestFin.freeCashFlow, company, currency).formatted}
              </span>
            </div>
          </div>

          {/* 6-Year FCF Progression Pills */}
          <div className="mt-3 pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-gray-400 font-medium">6개년 연도별 FCF 추이:</span>
            <div className="flex flex-wrap items-center gap-2">
              {company.financials.map((f) => {
                const conv = convertValue(f.freeCashFlow, company, currency)
                const isPos = f.freeCashFlow >= 0
                return (
                  <div
                    key={f.year}
                    className={`px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1.5 ${
                      isPos
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                    }`}
                  >
                    <span className="text-gray-400">{f.year}년</span>
                    <span className="font-bold">{conv.formatted}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Auto-Generated 3-Point Executive Financial Briefing */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/90 text-xs space-y-1">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. 6개년 현금 창출력 & 투자 사이클</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              2020년 매출 {convertValue(firstFin.revenue, company, currency).formatted}에서 2025년{' '}
              <strong className="text-white">
                {convertValue(latestFin.revenue, company, currency).formatted}
              </strong>
              로 성장했으며, 영업현금 중{' '}
              <strong className="text-orange-400">{quality.capexReinvestmentRate}%</strong>를 설비투자(CapEx)에
              재투입하고도 <strong className="text-emerald-400">{quality.fcfConversionRate}%</strong>의 순이익 대비
              FCF 현금전환율을 기록 중입니다.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/90 text-xs space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. 재무 안전성 & 유동성 방어력</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              2025년 기준 총 가용현금{' '}
              <strong className="text-cyan-400">
                {convertValue(latestFin.totalCash, company, currency).formatted}
              </strong>
              , 총차입금{' '}
              <strong className="text-rose-400">
                {convertValue(latestFin.totalDebt, company, currency).formatted}
              </strong>
              을 보유하여 순현금(Net Cash)은{' '}
              <strong className={latestFin.netCash >= 0 ? 'text-blue-400' : 'text-rose-400'}>
                {convertValue(latestFin.netCash, company, currency).formatted}
              </strong>{' '}
              (연매출 대비 {quality.netCashToRevenueRatio}%) 수준입니다.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/90 text-xs space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" />
              <span>3. 주주환원 & 핵심 지배구조</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              2025년 배당 및 자사주 매입으로 총{' '}
              <strong className="text-amber-300">
                {convertValue(latestFin.totalShareholderReturn, company, currency).formatted}
              </strong>{' '}
              (FCF 대비 {quality.shareholderPayoutRatio}%)를 주주에게 환원했으며, 현재 제1대 주주는{' '}
              <strong className="text-white">
                {topShareholder ? `${topShareholder.nameKo} (${topShareholder.percentage}%)` : '주요 기관'}
              </strong>
              입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Institutional Cash Quality & 5-Axis Health Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CashQualityBadge company={company} />
        </div>
        <div className="lg:col-span-5 bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                5대 현금 체력 방사형 분석 (Cash Health Radar)
              </h3>
              <p className="text-xs text-gray-400">
                FCF창출 · 순현금 · 현금전환율 · 주주환원 · 투자효율
              </p>
            </div>
          </div>
          <CashRadarChart companies={[company]} />
        </div>
      </div>

      {/* 3. Visual Charts Grid (Main Graphs with View Mode & Waterfall Year Switcher) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Cash Flow Waterfall & Combo Bar */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {chartMode === 'combo'
                    ? '6개년 현금흐름 시계열 (2020~2025)'
                    : `${waterfallYear}년 현금 창출 워터폴 구조`}
                </h3>
                <p className="text-xs text-gray-400">
                  {chartMode === 'combo'
                    ? '영업현금(OCF) · 설비투자(CapEx) · 잉여현금(FCF)'
                    : '매출액 → 영업현금 → 설비투자 → FCF → 순현금'}
                </p>
              </div>
            </div>

            {/* View Mode & Year Switcher Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {chartMode === 'waterfall' && (
                <div className="flex items-center bg-gray-800/80 p-0.5 rounded-xl border border-gray-700">
                  {[2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setWaterfallYear(yr)}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-colors ${
                        waterfallYear === yr
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      '{yr % 100}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center bg-gray-800/80 p-1 rounded-xl border border-gray-700">
                <button
                  onClick={() => setChartMode('combo')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    chartMode === 'combo' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  시계열 콤보
                </button>
                <button
                  onClick={() => setChartMode('waterfall')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    chartMode === 'waterfall'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  워터폴 구조
                </button>
              </div>
            </div>
          </div>

          {chartMode === 'combo' ? (
            <CashFlowChart company={company} currency={currency} />
          ) : (
            <CashFlowWaterfall
              company={company}
              currency={currency}
              selectedYear={waterfallYear}
            />
          )}
        </div>

        {/* Chart 2: Liquidity, Reserves & Net Cash */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">가용현금 보유고 및 순현금 완충력</h3>
                <p className="text-xs text-gray-400">
                  총가용현금(현금+단기투자) vs 총차입금 vs 순현금(Net Cash)
                </p>
              </div>
            </div>
          </div>
          <CashLiquidityChart company={company} currency={currency} />
        </div>
      </div>

      {/* 4. Shareholder Return & Major Shareholder Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shareholder Return Chart */}
        <div className="lg:col-span-5 bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  FCF 대비 주주환원 (배당 & 자사주 매입)
                </h3>
                <p className="text-xs text-gray-400">창출된 잉여현금의 주주 환원 비율 추이</p>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ReactECharts
              option={shareholderReturnOption}
              style={{ height: '100%', width: '100%' }}
              notMerge={true}
            />
          </div>
        </div>

        {/* Major Shareholder Breakdown & Time Series */}
        <div className="lg:col-span-7">
          <ShareholderChart company={company} />
        </div>
      </div>

      {/* 5. What-If Financial & Net Cash Scenario Simulator */}
      <CashFlowSimulator company={company} currency={currency} />

      {/* 6. Complete 6-Year Financial Statement Table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {company.nameKo} 6개년 전체 재무 & 현금흐름 명세서 ({unitLabel})
              </h3>
              <p className="text-xs text-gray-400">
                2020년~2025년 손익 · 현금흐름 · 유동성 · 차입금 · 주주환원 전수 데이터 및 6개년 트렌드
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCompanyExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold transition-all whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>{company.nameKo} 재무제표 Excel 저장</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-2.5 px-3 font-semibold">재무 지표 항목</th>
                {company.financials.map((f) => (
                  <th
                    key={f.year}
                    className="py-2.5 px-3 font-semibold text-right font-mono text-gray-200"
                  >
                    {f.year}년
                  </th>
                ))}
                <th className="py-2.5 px-3 font-semibold text-right text-gray-300">
                  6개년 추이 (20→25)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">매출액 (Revenue)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-gray-200">
                    {convertValue(f.revenue, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.revenue),
                    '#94A3B8'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">영업이익 (Operating Income)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-gray-200">
                    {convertValue(f.operatingIncome, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.operatingIncome),
                    '#94A3B8'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">당기순이익 (Net Income)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-gray-200">
                    {convertValue(f.netIncome, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.netIncome),
                    '#94A3B8'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 bg-blue-950/20">
                <td className="py-2 px-3 font-bold text-blue-400">영업활동 현금흐름 (OCF)</td>
                {company.financials.map((f) => (
                  <td
                    key={f.year}
                    className="py-2 px-3 text-right font-mono font-bold text-blue-400"
                  >
                    {convertValue(f.operatingCashFlow, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.operatingCashFlow),
                    '#3B82F6'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-orange-400">
                  자본적 지출 (CapEx 설비투자)
                </td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-orange-400">
                    {convertValue(f.capitalExpenditure, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.capitalExpenditure),
                    '#F97316'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 bg-emerald-950/20">
                <td className="py-2 px-3 font-extrabold text-emerald-400">
                  🌟 잉여현금흐름 (Free Cash Flow, FCF)
                </td>
                {company.financials.map((f) => (
                  <td
                    key={f.year}
                    className={`py-2 px-3 text-right font-mono font-extrabold ${
                      f.freeCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {convertValue(f.freeCashFlow, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.freeCashFlow),
                    '#10B981'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">FCF 마진율 (FCF / Revenue)</td>
                {company.financials.map((f) => (
                  <td
                    key={f.year}
                    className={`py-2 px-3 text-right font-mono ${
                      f.fcfMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {f.fcfMargin.toFixed(1)}%
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.fcfMargin),
                    '#10B981'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">투자활동 현금흐름 (ICF)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-gray-300">
                    {convertValue(f.investingCashFlow, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.investingCashFlow),
                    '#64748B'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">
                  재무활동 현금흐름 (Financing CF)
                </td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-purple-400">
                    {convertValue(f.financingCashFlow, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.financingCashFlow),
                    '#A855F7'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-amber-400">현금 배당금 지급액</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-amber-400">
                    {convertValue(f.dividendsPaid, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.dividendsPaid),
                    '#F59E0B'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-pink-400">자사주 취득/소각액</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-pink-400">
                    {convertValue(f.shareRepurchase, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.shareRepurchase),
                    '#EC4899'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-bold text-amber-400">총 주주환원액 (배당+자사주)</td>
                {company.financials.map((f) => (
                  <td
                    key={f.year}
                    className="py-2 px-3 text-right font-mono font-bold text-amber-400"
                  >
                    {convertValue(f.totalShareholderReturn, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.totalShareholderReturn),
                    '#F59E0B'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-cyan-400">기말 현금 및 현금성자산</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-cyan-400">
                    {convertValue(f.cashAndEquivalents, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.cashAndEquivalents),
                    '#06B6D4'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-cyan-400">
                  단기금융상품 및 유동투자자산
                </td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-cyan-400">
                    {convertValue(f.shortTermInvestments, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.shortTermInvestments),
                    '#06B6D4'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 bg-cyan-950/20">
                <td className="py-2 px-3 font-bold text-cyan-400">총 가용현금 (Total Cash)</td>
                {company.financials.map((f) => (
                  <td
                    key={f.year}
                    className="py-2 px-3 text-right font-mono font-bold text-cyan-400"
                  >
                    {convertValue(f.totalCash, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.totalCash),
                    '#06B6D4'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-rose-400">총차입금 (Total Debt)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-rose-400">
                    {convertValue(f.totalDebt, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.totalDebt),
                    '#F43F5E'
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 bg-blue-950/20">
                <td className="py-2 px-3 font-extrabold text-blue-400">
                  순현금 (Net Cash = Total Cash - Total Debt)
                </td>
                {company.financials.map((f) => (
                  <td
                    key={f.year}
                    className={`py-2 px-3 text-right font-mono font-extrabold ${
                      f.netCash >= 0 ? 'text-blue-400' : 'text-rose-400'
                    }`}
                  >
                    {convertValue(f.netCash, company, currency).formatted}
                  </td>
                ))}
                <td className="py-2 px-3">
                  {renderMiniTrend(
                    company.financials.map((f) => f.netCash),
                    '#3B82F6'
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
