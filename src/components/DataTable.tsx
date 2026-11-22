import React, { useState } from 'react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { calculateCashQuality } from '../utils/analysis'
import {
  Download,
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Star,
  Swords
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface DataTableProps {
  companies: Company[]
  currency: Currency
  onSelectCompany: (companyId: string) => void
  favoriteIds?: string[]
  onToggleFavorite?: (id: string, e?: React.MouseEvent) => void
  comparisonIds?: string[]
  onToggleComparison?: (id: string) => void
}

type SortField =
  | 'name'
  | 'score'
  | 'revenue'
  | 'operatingIncome'
  | 'operatingCashFlow'
  | 'capitalExpenditure'
  | 'freeCashFlow'
  | 'fcfMargin'
  | 'conversion'
  | 'totalCash'
  | 'totalDebt'
  | 'netCash'
  | 'totalShareholderReturn'

export const DataTable: React.FC<DataTableProps> = ({
  companies,
  currency,
  onSelectCompany,
  favoriteIds = [],
  onToggleFavorite,
  comparisonIds = [],
  onToggleComparison
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025)
  const [sortField, setSortField] = useState<SortField>('freeCashFlow')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterText, setFilterText] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string>('ALL')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Filter companies by text & quality grade
  const filtered = companies.filter((c) => {
    const q = filterText.toLowerCase().trim()
    const matchText =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.nameKo.toLowerCase().includes(q) ||
      c.ticker.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)

    if (!matchText) return false
    if (gradeFilter !== 'ALL') {
      const qual = calculateCashQuality(c)
      if (qual.grade !== gradeFilter) return false
    }
    return true
  })

  // Sort companies based on selected field and year
  const sorted = [...filtered].sort((a, b) => {
    const finA =
      a.financials.find((f) => f.year === selectedYear) ||
      a.financials[a.financials.length - 1]
    const finB =
      b.financials.find((f) => f.year === selectedYear) ||
      b.financials[b.financials.length - 1]

    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.nameKo.localeCompare(b.nameKo)
        : b.nameKo.localeCompare(a.nameKo)
    }

    if (sortField === 'score') {
      const qA = calculateCashQuality(a).score
      const qB = calculateCashQuality(b).score
      return sortDirection === 'asc' ? qA - qB : qB - qA
    }

    if (sortField === 'conversion') {
      const convA = calculateCashQuality(a).fcfConversionRate
      const convB = calculateCashQuality(b).fcfConversionRate
      return sortDirection === 'asc' ? convA - convB : convB - convA
    }

    const valA = convertValue(finA[sortField] as number, a, 'USD').value
    const valB = convertValue(finB[sortField] as number, b, 'USD').value

    return sortDirection === 'asc' ? valA - valB : valB - valA
  })

  // Export to Excel / CSV
  const exportToExcel = () => {
    const dataToExport = sorted.map((c, idx) => {
      const fin =
        c.financials.find((f) => f.year === selectedYear) ||
        c.financials[c.financials.length - 1]
      const quality = calculateCashQuality(c)
      return {
        순위: idx + 1,
        '기업명 (한글)': c.nameKo,
        '기업명 (영문)': c.name,
        '티커 (Ticker)': c.ticker,
        '품질 등급': quality.grade,
        '품질 종합점수': quality.score,
        '현금 패턴': quality.patternType.title,
        카테고리: c.category,
        섹터: c.sector,
        국가: c.country,
        기준연도: selectedYear,
        [`매출액 (${currency})`]: convertValue(fin.revenue, c, currency).value,
        [`영업이익 (${currency})`]: convertValue(fin.operatingIncome, c, currency).value,
        [`당기순이익 (${currency})`]: convertValue(fin.netIncome, c, currency).value,
        [`영업활동현금흐름 OCF (${currency})`]: convertValue(fin.operatingCashFlow, c, currency).value,
        [`설비투자 CapEx (${currency})`]: convertValue(fin.capitalExpenditure, c, currency).value,
        [`잉여현금흐름 FCF (${currency})`]: convertValue(fin.freeCashFlow, c, currency).value,
        'FCF 마진 (%)': fin.fcfMargin,
        'FCF 전환율 (%)': quality.fcfConversionRate,
        'CapEx 재투자율 (%)': quality.capexReinvestmentRate,
        [`총 가용현금 (${currency})`]: convertValue(fin.totalCash, c, currency).value,
        [`총차입금 (${currency})`]: convertValue(fin.totalDebt, c, currency).value,
        [`순현금 Net Cash (${currency})`]: convertValue(fin.netCash, c, currency).value,
        [`배당금 지급액 (${currency})`]: convertValue(fin.dividendsPaid, c, currency).value,
        [`자사주 매입액 (${currency})`]: convertValue(fin.shareRepurchase, c, currency).value,
        [`총 주주환원액 (${currency})`]: convertValue(fin.totalShareholderReturn, c, currency).value
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedYear}년 재무데이터`)
    XLSX.writeFile(workbook, `Global80_CashFlow_${selectedYear}_${currency}.xlsx`)
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-60 group-hover:opacity-100" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-blue-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-400" />
    )
  }

  const unitLabel = companies[0] ? convertValue(1, companies[0], currency).unitLabel : '$B'

  const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'A': 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
    'B': 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    'C': 'bg-amber-600/20 text-amber-300 border-amber-500/30',
    'D': 'bg-rose-600/20 text-rose-300 border-rose-500/30'
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
      {/* Header controls: Title, Year Switcher, Export */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>전체 80대 기업 현금 지표 & 품질 평가 종합 수치표</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-mono">
              {sorted.length}개사 표시 중
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            컬럼 헤더 클릭 시 다중 정렬되며, 기업 클릭 시 심층 분석으로 이동합니다. (표시 단위: {unitLabel})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Year Buttons */}
          <div className="flex items-center bg-gray-800 rounded-xl p-1 border border-gray-700 overflow-x-auto scrollbar-none">
            {[2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {yr}년
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Excel 다운로드</span>
          </button>
        </div>
      </div>

      {/* Table Sub-Filter Bar: Search & Grade Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-gray-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-xs text-gray-400 font-semibold mr-1 whitespace-nowrap shrink-0">품질 등급 필터:</span>
          {['ALL', 'A+', 'A', 'B', 'C', 'D'].map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                gradeFilter === g
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-800/80 text-gray-400 hover:text-white border border-gray-700/60'
              }`}
            >
              {g === 'ALL' ? '전체 등급' : `${g} 등급`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="테이블 내 기업/섹터 빠른 검색..."
            className="w-full pl-8 pr-7 py-1.5 bg-gray-800/90 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-gray-800">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-gray-800/90 text-gray-400 border-b border-gray-700 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-2.5 font-semibold text-center w-10">#</th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-3 font-semibold text-gray-200 cursor-pointer hover:text-white group"
              >
                <div className="flex items-center gap-1.5">
                  <span>기업명 (티커)</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th
                onClick={() => handleSort('score')}
                className="py-3 px-2 font-semibold text-center cursor-pointer hover:text-white group"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>품질 등급</span>
                  {renderSortIcon('score')}
                </div>
              </th>
              <th className="py-3 px-2.5 font-semibold">현금 패턴 진단</th>
              <th
                onClick={() => handleSort('revenue')}
                className="py-3 px-2.5 font-semibold text-right cursor-pointer hover:text-white group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>매출액</span>
                  {renderSortIcon('revenue')}
                </div>
              </th>
              <th
                onClick={() => handleSort('operatingCashFlow')}
                className="py-3 px-2.5 font-semibold text-right text-blue-400 cursor-pointer hover:text-blue-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>영업현금(OCF)</span>
                  {renderSortIcon('operatingCashFlow')}
                </div>
              </th>
              <th
                onClick={() => handleSort('capitalExpenditure')}
                className="py-3 px-2.5 font-semibold text-right text-orange-400 cursor-pointer hover:text-orange-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>설비투자(CapEx)</span>
                  {renderSortIcon('capitalExpenditure')}
                </div>
              </th>
              <th
                onClick={() => handleSort('freeCashFlow')}
                className="py-3 px-2.5 font-semibold text-right text-emerald-400 cursor-pointer hover:text-emerald-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>잉여현금(FCF)</span>
                  {renderSortIcon('freeCashFlow')}
                </div>
              </th>
              <th
                onClick={() => handleSort('fcfMargin')}
                className="py-3 px-2 font-semibold text-right cursor-pointer hover:text-white group"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>FCF 마진</span>
                  {renderSortIcon('fcfMargin')}
                </div>
              </th>
              <th
                onClick={() => handleSort('conversion')}
                className="py-3 px-2 font-semibold text-right cursor-pointer hover:text-white group"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>현금전환율</span>
                  {renderSortIcon('conversion')}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalCash')}
                className="py-3 px-2.5 font-semibold text-right text-cyan-400 cursor-pointer hover:text-cyan-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>총 가용현금</span>
                  {renderSortIcon('totalCash')}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalDebt')}
                className="py-3 px-2.5 font-semibold text-right text-rose-400 cursor-pointer hover:text-rose-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>총차입금</span>
                  {renderSortIcon('totalDebt')}
                </div>
              </th>
              <th
                onClick={() => handleSort('netCash')}
                className="py-3 px-2.5 font-semibold text-right text-blue-400 cursor-pointer hover:text-blue-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>순현금(Net Cash)</span>
                  {renderSortIcon('netCash')}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalShareholderReturn')}
                className="py-3 px-2.5 font-semibold text-right text-amber-400 cursor-pointer hover:text-amber-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>주주환원총액</span>
                  {renderSortIcon('totalShareholderReturn')}
                </div>
              </th>
              <th className="py-3 px-2.5 font-semibold text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900/40">
            {sorted.map((c, idx) => {
              const fin =
                c.financials.find((f) => f.year === selectedYear) ||
                c.financials[c.financials.length - 1]
              const quality = calculateCashQuality(c)
              const isFav = favoriteIds.includes(c.id)
              const isCompared = comparisonIds.includes(c.id)

              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectCompany(c.id)}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-2.5 text-center font-mono text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate max-w-[130px]">
                        {c.nameKo}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono bg-gray-800 px-1 py-0.5 rounded">
                        {c.ticker}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${gradeColors[quality.grade]}`}
                    >
                      {quality.grade}{' '}
                      <span className="text-[9px] font-normal ml-1">({quality.score})</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-medium border truncate max-w-[140px] ${quality.patternType.tagColor}`}
                    >
                      {quality.patternType.title.split(' ')[1] || quality.patternType.title}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-gray-200">
                    {convertValue(fin.revenue, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-blue-400 font-medium">
                    {convertValue(fin.operatingCashFlow, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-orange-400 font-medium">
                    {convertValue(fin.capitalExpenditure, c, currency).formatted}
                  </td>
                  <td
                    className={`py-2.5 px-2.5 text-right font-mono font-bold ${
                      fin.freeCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {convertValue(fin.freeCashFlow, c, currency).formatted}
                  </td>
                  <td
                    className={`py-2.5 px-2 text-right font-mono font-medium ${
                      fin.fcfMargin >= 0 ? 'text-gray-200' : 'text-rose-400'
                    }`}
                  >
                    {fin.fcfMargin.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-emerald-300 font-medium">
                    {quality.fcfConversionRate}%
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-cyan-400">
                    {convertValue(fin.totalCash, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-rose-400">
                    {convertValue(fin.totalDebt, c, currency).formatted}
                  </td>
                  <td
                    className={`py-2.5 px-2.5 text-right font-mono font-bold ${
                      fin.netCash >= 0 ? 'text-blue-400' : 'text-rose-400'
                    }`}
                  >
                    {convertValue(fin.netCash, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-amber-400 font-medium">
                    {convertValue(fin.totalShareholderReturn, c, currency).formatted}
                  </td>
                  <td
                    className="py-2.5 px-2.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {onToggleFavorite && (
                        <button
                          onClick={(e) => onToggleFavorite(c.id, e)}
                          className={`p-1 rounded hover:bg-gray-800 ${
                            isFav ? 'text-amber-400' : 'text-gray-600 hover:text-gray-300'
                          }`}
                          title="관심기업 즐겨찾기"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                      )}
                      {onToggleComparison && (
                        <button
                          onClick={() => onToggleComparison(c.id)}
                          className={`p-1 rounded hover:bg-gray-800 ${
                            isCompared
                              ? 'text-purple-400 bg-purple-950/50'
                              : 'text-gray-600 hover:text-gray-300'
                          }`}
                          title="비교 배틀에 추가/제외"
                        >
                          <Swords className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
