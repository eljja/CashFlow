import React, { useState, useMemo } from 'react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { calculateCashQuality } from '../utils/analysis'
import { Check, Star, LayoutGrid, List, ArrowUpDown, RotateCcw } from 'lucide-react'

interface CompanySelectorProps {
  companies: Company[]
  selectedCompanyId: string
  onSelectCompany: (id: string) => void
  currency: Currency
  favoriteIds: string[]
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void
  onResetFilters?: () => void
}

type SelectorSort = 'default' | 'fcf' | 'netCash' | 'score' | 'margin'

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  currency,
  favoriteIds,
  onToggleFavorite,
  onResetFilters
}) => {
  const [sortBy, setSortBy] = useState<SelectorSort>('default')
  const [compactMode, setCompactMode] = useState<boolean>(false)

  const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-500 text-black',
    'A': 'bg-emerald-600 text-white',
    'B': 'bg-blue-600 text-white',
    'C': 'bg-amber-600 text-white',
    'D': 'bg-rose-600 text-white'
  }

  const sortedCompanies = useMemo(() => {
    const list = [...companies]
    if (sortBy === 'default') return list
    return list.sort((a, b) => {
      const finA = a.financials[a.financials.length - 1]
      const finB = b.financials[b.financials.length - 1]
      if (sortBy === 'fcf') {
        return (
          convertValue(finB.freeCashFlow, b, 'USD').value -
          convertValue(finA.freeCashFlow, a, 'USD').value
        )
      }
      if (sortBy === 'netCash') {
        return (
          convertValue(finB.netCash, b, 'USD').value -
          convertValue(finA.netCash, a, 'USD').value
        )
      }
      if (sortBy === 'score') {
        return calculateCashQuality(b).score - calculateCashQuality(a).score
      }
      if (sortBy === 'margin') {
        return finB.fcfMargin - finA.fcfMargin
      }
      return 0
    })
  }, [companies, sortBy])

  if (companies.length === 0) {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8 shadow-xl mb-6 text-center space-y-3">
        <p className="text-sm font-bold text-gray-200">
          현재 선택된 필터 조건에 해당하는 기업이 없습니다.
        </p>
        <p className="text-xs text-gray-400">
          검색어, 카테고리, 섹터 또는 관심기업 필터를 초기화하여 전체 80개 기업을 확인하세요.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>모든 필터 초기화</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <span>분석 대상 기업 선택 ({companies.length}개사)</span>
          </h3>
          <span className="text-[11px] text-gray-500 hidden md:inline">
            · 키보드 <kbd className="px-1 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 font-mono">[</kbd>{' '}
            <kbd className="px-1 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 font-mono">]</kbd> 키로 이전/다음 기업 빠른 전환
          </span>
        </div>

        {/* Sort & Density Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-gray-800/80 p-0.5 rounded-xl border border-gray-700/80 text-[11px] overflow-x-auto scrollbar-none">
            <span className="px-2 text-gray-400 flex items-center gap-1 whitespace-nowrap shrink-0">
              <ArrowUpDown className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">정렬:</span>
            </span>
            {[
              { id: 'default', label: '기본순' },
              { id: 'fcf', label: 'FCF순' },
              { id: 'netCash', label: '순현금순' },
              { id: 'score', label: '품질순' },
              { id: 'margin', label: '마진순' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id as SelectorSort)}
                className={`px-2 py-1 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                  sortBy === opt.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-gray-800/80 p-0.5 rounded-xl border border-gray-700/80 shrink-0">
            <button
              onClick={() => setCompactMode(false)}
              className={`p-1.5 rounded-lg transition-colors ${
                !compactMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="상세 카드 보기"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCompactMode(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                compactMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="컴팩트 한눈에 보기"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {compactMode ? (
        <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
          {sortedCompanies.map((c) => {
            const isSelected = c.id === selectedCompanyId
            const isFav = favoriteIds.includes(c.id)
            const quality = calculateCashQuality(c)
            return (
              <button
                key={c.id}
                onClick={() => onSelectCompany(c.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600/25 border-blue-500 text-white shadow-sm'
                    : 'bg-gray-800/50 hover:bg-gray-800 border-gray-700/60 text-gray-300 hover:text-white'
                }`}
              >
                {isFav && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                <span className="font-semibold">{c.nameKo}</span>
                <span className={`text-[9px] font-extrabold px-1 py-0.1 rounded ${gradeColors[quality.grade]}`}>
                  {quality.grade}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700">
          {sortedCompanies.map((c) => {
            const isSelected = c.id === selectedCompanyId
            const isFav = favoriteIds.includes(c.id)
            const latestFin = c.financials[c.financials.length - 1]
            const fcf = convertValue(latestFin.freeCashFlow, c, currency)
            const quality = calculateCashQuality(c)

            return (
              <div
                key={c.id}
                onClick={() => onSelectCompany(c.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectCompany(c.id)
                  }
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all relative group flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500/40'
                    : 'bg-gray-800/40 hover:bg-gray-800/80 border-gray-700/60 hover:border-gray-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gray-400">{c.ticker}</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${gradeColors[quality.grade]}`}
                      >
                        {quality.grade}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(c.id, e)
                        }}
                        className={`p-0.5 rounded transition-colors ${
                          isFav
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-gray-600 hover:text-gray-300 opacity-0 group-hover:opacity-100'
                        }`}
                        title={isFav ? '관심기업 해제' : '관심기업 등록'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                  <h4
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-blue-400' : 'text-gray-100 group-hover:text-white'
                    }`}
                  >
                    {c.nameKo}
                  </h4>
                  <p className="text-[10px] text-gray-400 truncate">{c.sector}</p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-gray-700/40 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">'{latestFin.year % 100} FCF</span>
                  <span
                    className={`font-mono font-semibold ${
                      latestFin.freeCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {fcf.formatted}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
