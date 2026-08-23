import React, { useState } from 'react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { Download, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import * as XLSX from 'xlsx'

interface DataTableProps {
  companies: Company[]
  currency: Currency
  onSelectCompany: (companyId: string) => void
}

type SortField =
  | 'name'
  | 'revenue'
  | 'operatingIncome'
  | 'operatingCashFlow'
  | 'capitalExpenditure'
  | 'freeCashFlow'
  | 'fcfMargin'
  | 'totalCash'
  | 'totalDebt'
  | 'netCash'
  | 'totalShareholderReturn'

export const DataTable: React.FC<DataTableProps> = ({
  companies,
  currency,
  onSelectCompany
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025)
  const [sortField, setSortField] = useState<SortField>('freeCashFlow')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterText, setFilterText] = useState('')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Filter companies
  const filtered = companies.filter((c) => {
    const q = filterText.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.nameKo.toLowerCase().includes(q) ||
      c.ticker.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
    )
  })

  // Sort companies based on selected field and year
  const sorted = [...filtered].sort((a, b) => {
    const finA = a.financials.find((f) => f.year === selectedYear) || a.financials[a.financials.length - 1]
    const finB = b.financials.find((f) => f.year === selectedYear) || b.financials[b.financials.length - 1]

    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.nameKo.localeCompare(b.nameKo)
        : b.nameKo.localeCompare(a.nameKo)
    }

    // Convert values to USD for consistent sorting comparison across countries
    const valA = convertValue(finA[sortField] as number, a, 'USD').value
    const valB = convertValue(finB[sortField] as number, b, 'USD').value

    return sortDirection === 'asc' ? valA - valB : valB - valA
  })

  // Export to Excel / CSV
  const exportToExcel = () => {
    const dataToExport = sorted.map((c) => {
      const fin = c.financials.find((f) => f.year === selectedYear) || c.financials[c.financials.length - 1]
      return {
        '기업명 (한글)': c.nameKo,
        '기업명 (영문)': c.name,
        '티커 (Ticker)': c.ticker,
        '카테고리': c.category,
        '섹터': c.sector,
        '국가': c.country,
        '기준연도': selectedYear,
        [`매출액 (${currency})`]: convertValue(fin.revenue, c, currency).value,
        [`영업이익 (${currency})`]: convertValue(fin.operatingIncome, c, currency).value,
        [`당기순이익 (${currency})`]: convertValue(fin.netIncome, c, currency).value,
        [`영업활동현금흐름 OCF (${currency})`]: convertValue(fin.operatingCashFlow, c, currency).value,
        [`설비투자 CapEx (${currency})`]: convertValue(fin.capitalExpenditure, c, currency).value,
        [`잉여현금흐름 FCF (${currency})`]: convertValue(fin.freeCashFlow, c, currency).value,
        'FCF 마진 (%)': fin.fcfMargin,
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

  const unitLabel = convertValue(1, companies[0], currency).unitLabel

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header controls: Search, Year Switcher, Export */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>전체 80개 기업 현금 지표 상세 수치표</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 font-mono">
              {sorted.length}개사 표시 중
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            모든 컬럼 정렬, 검색 및 엑셀(Excel) / CSV 다운로드가 가능합니다. (표시 단위: {unitLabel})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Year Buttons */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
            {[2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel 다운로드</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-800/80 text-gray-400 border-b border-gray-700 sticky top-0 z-10">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-3.5 font-semibold text-gray-200 cursor-pointer hover:text-white group"
              >
                <div className="flex items-center gap-1.5">
                  <span>기업명 (티커)</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th className="py-3 px-3 font-semibold">카테고리 / 섹터</th>
              <th
                onClick={() => handleSort('revenue')}
                className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>매출액</span>
                  {renderSortIcon('revenue')}
                </div>
              </th>
              <th
                onClick={() => handleSort('operatingCashFlow')}
                className="py-3 px-3 font-semibold text-right text-blue-400 cursor-pointer hover:text-blue-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>영업현금 (OCF)</span>
                  {renderSortIcon('operatingCashFlow')}
                </div>
              </th>
              <th
                onClick={() => handleSort('capitalExpenditure')}
                className="py-3 px-3 font-semibold text-right text-orange-400 cursor-pointer hover:text-orange-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>설비투자 (CapEx)</span>
                  {renderSortIcon('capitalExpenditure')}
                </div>
              </th>
              <th
                onClick={() => handleSort('freeCashFlow')}
                className="py-3 px-3 font-semibold text-right text-emerald-400 cursor-pointer hover:text-emerald-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>잉여현금 (FCF)</span>
                  {renderSortIcon('freeCashFlow')}
                </div>
              </th>
              <th
                onClick={() => handleSort('fcfMargin')}
                className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>FCF 마진</span>
                  {renderSortIcon('fcfMargin')}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalCash')}
                className="py-3 px-3 font-semibold text-right text-cyan-400 cursor-pointer hover:text-cyan-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>총 가용현금</span>
                  {renderSortIcon('totalCash')}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalDebt')}
                className="py-3 px-3 font-semibold text-right text-rose-400 cursor-pointer hover:text-rose-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>총차입금</span>
                  {renderSortIcon('totalDebt')}
                </div>
              </th>
              <th
                onClick={() => handleSort('netCash')}
                className="py-3 px-3 font-semibold text-right text-emerald-400 cursor-pointer hover:text-emerald-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>순현금 (Net Cash)</span>
                  {renderSortIcon('netCash')}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalShareholderReturn')}
                className="py-3 px-3 font-semibold text-right text-amber-400 cursor-pointer hover:text-amber-300 group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>주주환원 (배당+자사주)</span>
                  {renderSortIcon('totalShareholderReturn')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900/40">
            {sorted.map((c) => {
              const fin = c.financials.find((f) => f.year === selectedYear) || c.financials[c.financials.length - 1]
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectCompany(c.id)}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3.5 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white hover:text-blue-400 transition-colors">
                        {c.nameKo}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono bg-gray-800 px-1.5 py-0.5 rounded">
                        {c.ticker}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 text-[11px]">
                    <span className="text-gray-300">{c.sector}</span> · {c.country}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-gray-200">
                    {convertValue(fin.revenue, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-400 font-medium">
                    {convertValue(fin.operatingCashFlow, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-orange-400 font-medium">
                    {convertValue(fin.capitalExpenditure, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                    {convertValue(fin.freeCashFlow, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-gray-300 font-medium">
                    {fin.fcfMargin.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-cyan-400">
                    {convertValue(fin.totalCash, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                    {convertValue(fin.totalDebt, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                    {convertValue(fin.netCash, c, currency).formatted}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400 font-medium">
                    {convertValue(fin.totalShareholderReturn, c, currency).formatted}
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
