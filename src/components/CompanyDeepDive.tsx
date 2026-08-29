import React, { useState } from 'react'
import { Company, Currency } from '../types'
import { CashFlowChart } from './CashFlowChart'
import { CashLiquidityChart } from './CashLiquidityChart'
import { ShareholderChart } from './ShareholderChart'
import { CashRadarChart } from './CashRadarChart'
import { CashQualityBadge } from './CashQualityBadge'
import { CashFlowWaterfall } from './CashFlowWaterfall'
import { convertValue } from '../utils/formatters'
import { Globe, TrendingUp, ShieldCheck, Gift, BarChart3, Compass, Sparkles } from 'lucide-react'
import ReactECharts from 'echarts-for-react'

interface CompanyDeepDiveProps {
  company: Company
  currency: Currency
}

export const CompanyDeepDive: React.FC<CompanyDeepDiveProps> = ({ company, currency }) => {
  const latestFin = company.financials[company.financials.length - 1]
  const years = company.financials.map((f) => f.year.toString())
  const [chartMode, setChartMode] = useState<'combo' | 'waterfall'>('combo')

  // Cumulative FCF across all available years
  const cumFcf = company.financials.reduce((sum, f) => sum + f.freeCashFlow, 0)
  const cumFcfConv = convertValue(cumFcf, company, currency)

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

  return (
    <div className="space-y-6">
      {/* 1. Header Profile Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-blue-950/40 border border-gray-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {company.category === 'Domestic' ? '국내 대표 20' : company.category === 'US' ? '미국 대표 20' : company.category === 'Global' ? '글로벌 대표 20' : '추가 유망 20'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                {company.sector}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700 flex items-center gap-1">
                <Globe className="w-3 h-3 text-gray-400" />
                {company.country}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {company.ticker}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <span>{company.nameKo}</span>
              <span className="text-lg font-normal text-gray-400">({company.name})</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-3xl leading-relaxed">
              {company.description}
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-3 text-center shadow-lg shadow-emerald-950/30">
              <span className="text-[11px] font-bold text-emerald-300 block mb-1">🌟 2025 잉여현금(FCF)</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                {convertValue(latestFin.freeCashFlow, company, currency).formatted}
              </span>
            </div>
            <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-3 text-center">
              <span className="text-[11px] text-gray-400 block mb-1">2025 순현금(Net Cash)</span>
              <span className="text-base font-extrabold font-mono text-blue-400">
                {convertValue(latestFin.netCash, company, currency).formatted}
              </span>
            </div>
            <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-3 text-center">
              <span className="text-[11px] text-gray-400 block mb-1">FCF 마진율</span>
              <span className="text-base font-extrabold font-mono text-cyan-400">
                {latestFin.fcfMargin.toFixed(1)}%
              </span>
            </div>
            <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-3 text-center">
              <span className="text-[11px] text-gray-400 block mb-1">6개년 누적 FCF</span>
              <span className="text-base font-extrabold font-mono text-amber-400">
                {cumFcfConv.formatted}
              </span>
            </div>
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
                  <h4 className="text-sm font-bold text-white">잉여현금흐름 (Free Cash Flow) 창출 공식 분석</h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                    핵심 1위 현금지표
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  본업으로 번 현금(OCF)에서 미래를 위한 설비투자(CapEx)를 차감한 후 <strong>기업에 실제로 남는 순수 잉여현금</strong>
                </p>
              </div>
            </div>

            {/* FCF Equation Box */}
            <div className="flex items-center gap-2 bg-gray-950/80 px-4 py-2 rounded-xl border border-gray-800 font-mono text-xs text-gray-200">
              <span className="text-blue-400 font-semibold">OCF {convertValue(latestFin.operatingCashFlow, company, currency).formatted}</span>
              <span className="text-gray-500">-</span>
              <span className="text-orange-400 font-semibold">CapEx {convertValue(latestFin.capitalExpenditure, company, currency).formatted}</span>
              <span className="text-gray-500">=</span>
              <span className="text-emerald-400 font-bold text-sm">FCF {convertValue(latestFin.freeCashFlow, company, currency).formatted}</span>
            </div>
          </div>

          {/* 6-Year FCF Progression Pills */}
          <div className="mt-3 pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-gray-400 font-medium">연도별 FCF 추이:</span>
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
              <h3 className="text-sm font-bold text-white">5대 현금 체력 방사형 분석 (Cash Health Radar)</h3>
              <p className="text-xs text-gray-400">FCF창출 · 순현금 · 현금전환율 · 주주환원 · 투자효율</p>
            </div>
          </div>
          <CashRadarChart companies={[company]} />
        </div>
      </div>

      {/* 3. Visual Charts Grid (Main Graphs with View Mode Switcher) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Cash Flow Waterfall & Combo Bar */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {chartMode === 'combo' ? '6개년 현금흐름 시계열 (2020~2025)' : '2025 현금 창출 워터폴 구조'}
                </h3>
                <p className="text-xs text-gray-400">
                  {chartMode === 'combo' ? '영업현금(OCF) · 설비투자(CapEx) · 잉여현금(FCF)' : '매출액 → 영업현금 → 설비투자 → FCF → 순현금 변동'}
                </p>
              </div>
            </div>

            {/* View Mode Switcher Buttons */}
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
                  chartMode === 'waterfall' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                워터폴 구조
              </button>
            </div>
          </div>

          {chartMode === 'combo' ? (
            <CashFlowChart company={company} currency={currency} />
          ) : (
            <CashFlowWaterfall company={company} currency={currency} selectedYear={2025} />
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
                <p className="text-xs text-gray-400">총가용현금(현금+단기투자) vs 총차입금 vs 순현금(Net Cash)</p>
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
                <h3 className="text-sm font-bold text-white">FCF 대비 주주환원 (배당 & 자사주 매입)</h3>
                <p className="text-xs text-gray-400">창출된 잉여현금의 주주 환원 비율</p>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ReactECharts option={shareholderReturnOption} style={{ height: '100%', width: '100%' }} notMerge={true} />
          </div>
        </div>

        {/* Major Shareholder Breakdown & Time Series */}
        <div className="lg:col-span-7">
          <ShareholderChart company={company} />
        </div>
      </div>

      {/* 5. Complete 6-Year Financial Statement Table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {company.nameKo} 6개년 전체 재무 & 현금 상세 데이터 ({unitLabel})
              </h3>
              <p className="text-xs text-gray-400">
                2020년부터 2025년까지의 모든 현금흐름 및 대차대조표 수치
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-2.5 px-3 font-semibold">재무 지표 항목</th>
                {company.financials.map((f) => (
                  <th key={f.year} className="py-2.5 px-3 font-semibold text-right font-mono text-gray-200">
                    {f.year}년
                  </th>
                ))}
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
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">영업이익 (Operating Income)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-gray-200">
                    {convertValue(f.operatingIncome, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">당기순이익 (Net Income)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-gray-200">
                    {convertValue(f.netIncome, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30 bg-blue-950/20">
                <td className="py-2 px-3 font-bold text-blue-400">영업활동 현금흐름 (OCF)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono font-bold text-blue-400">
                    {convertValue(f.operatingCashFlow, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-orange-400">자본적 지출 (CapEx 설비투자)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-orange-400">
                    {convertValue(f.capitalExpenditure, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30 bg-emerald-950/20">
                <td className="py-2 px-3 font-extrabold text-emerald-400">잉여현금흐름 (Free Cash Flow, FCF)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono font-extrabold text-emerald-400">
                    {convertValue(f.freeCashFlow, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">FCF 마진율 (FCF / Revenue)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-emerald-400">
                    {f.fcfMargin.toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">투자활동 현금흐름 (ICF)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-gray-300">
                    {convertValue(f.investingCashFlow, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-gray-300">재무활동 현금흐름 (Financing CF)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-purple-400">
                    {convertValue(f.financingCashFlow, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-amber-400">현금 배당금 지급액</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-amber-400">
                    {convertValue(f.dividendsPaid, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-pink-400">자사주 취득/소각액</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-pink-400">
                    {convertValue(f.shareRepurchase, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-bold text-amber-400">총 주주환원액 (배당+자사주)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono font-bold text-amber-400">
                    {convertValue(f.totalShareholderReturn, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-cyan-400">기말 현금 및 현금성자산</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-cyan-400">
                    {convertValue(f.cashAndEquivalents, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-cyan-400">단기금융상품 및 유동투자자산</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-cyan-400">
                    {convertValue(f.shortTermInvestments, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30 bg-cyan-950/20">
                <td className="py-2 px-3 font-bold text-cyan-400">총 가용현금 (Total Cash)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono font-bold text-cyan-400">
                    {convertValue(f.totalCash, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium text-rose-400">총차입금 (Total Debt)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono text-rose-400">
                    {convertValue(f.totalDebt, company, currency).formatted}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-800/30 bg-blue-950/20">
                <td className="py-2 px-3 font-extrabold text-blue-400">순현금 (Net Cash = Total Cash - Total Debt)</td>
                {company.financials.map((f) => (
                  <td key={f.year} className="py-2 px-3 text-right font-mono font-extrabold text-blue-400">
                    {convertValue(f.netCash, company, currency).formatted}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
