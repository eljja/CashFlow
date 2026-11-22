import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { calculateCashQuality } from '../utils/analysis'
import {
  Search,
  X,
  Star,
  BarChart3,
  Compass,
  Layers,
  Table,
  ArrowRight,
  CornerDownLeft,
  Command
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  companies: Company[]
  currency: Currency
  selectedCompanyId: string
  onSelectCompany: (id: string) => void
  onSelectTab: (tab: 'overview' | 'matrix' | 'comparison' | 'table') => void
  favoriteIds: string[]
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  companies,
  currency,
  selectedCompanyId,
  onSelectCompany,
  onSelectTab,
  favoriteIds,
  onToggleFavorite
}) => {
  const [query, setQuery] = useState('')
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'FAV' | 'SEMI' | 'KR' | 'US' | 'GLOBAL'>('ALL')
  const [highlightIndex, setHighlightIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setHighlightIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const filteredCompanies = useMemo(() => {
    const q = query.toLowerCase().trim()
    return companies.filter((c) => {
      if (quickFilter === 'FAV' && !favoriteIds.includes(c.id)) return false
      if (quickFilter === 'KR' && c.category !== 'Domestic') return false
      if (quickFilter === 'US' && c.category !== 'US') return false
      if (quickFilter === 'GLOBAL' && c.category !== 'Global') return false
      if (quickFilter === 'SEMI') {
        const s = c.sector.toLowerCase()
        if (!s.includes('semiconductor') && !s.includes('nand') && !s.includes('foundry') && !s.includes('equipment') && !s.includes('ai')) {
          return false
        }
      }

      if (!q) return true
      return (
        c.nameKo.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.ticker.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      )
    })
  }, [companies, query, quickFilter, favoriteIds])

  useEffect(() => {
    setHighlightIndex(0)
  }, [query, quickFilter])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex((prev) =>
          filteredCompanies.length > 0 ? (prev + 1) % filteredCompanies.length : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex((prev) =>
          filteredCompanies.length > 0
            ? (prev - 1 + filteredCompanies.length) % filteredCompanies.length
            : 0
        )
      } else if (e.key === 'Enter' && filteredCompanies[highlightIndex]) {
        e.preventDefault()
        onSelectCompany(filteredCompanies[highlightIndex].id)
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCompanies, highlightIndex, onSelectCompany, onClose])

  // Keep highlighted item in view
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector(`[data-idx="${highlightIndex}"]`)
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex])

  if (!isOpen) return null

  const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-500 text-black',
    'A': 'bg-emerald-600 text-white',
    'B': 'bg-blue-600 text-white',
    'C': 'bg-amber-600 text-white',
    'D': 'bg-rose-600 text-white'
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-14 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#111827] border border-gray-700/80 rounded-3xl shadow-2xl shadow-blue-950/40 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-800 bg-gray-900/90">
          <Search className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="80개 기업 빠른 검색 (기업명, 영문명, 티커, 섹터, 국가)..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded bg-gray-800 mr-2"
            >
              초기화
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="닫기 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Chips */}
        <div className="px-4 py-2 bg-gray-900/50 border-b border-gray-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: `전체 (${companies.length})` },
            { id: 'FAV', label: `⭐ 관심기업 (${favoriteIds.length})` },
            { id: 'SEMI', label: '🔥 반도체 & AI' },
            { id: 'KR', label: '🇰🇷 국내 20' },
            { id: 'US', label: '🇺🇸 미국 20' },
            { id: 'GLOBAL', label: '🌍 글로벌 20' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setQuickFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                quickFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-800/70 text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto divide-y divide-gray-800/50 p-2">
          {filteredCompanies.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs space-y-2">
              <p className="text-sm font-semibold text-gray-300">일치하는 기업이 없습니다.</p>
              <p>검색어나 필터 조건을 변경해 보세요.</p>
            </div>
          ) : (
            filteredCompanies.map((c, idx) => {
              const latestFin = c.financials[c.financials.length - 1]
              const fcf = convertValue(latestFin.freeCashFlow, c, currency)
              const netCash = convertValue(latestFin.netCash, c, currency)
              const quality = calculateCashQuality(c)
              const isHighlighted = idx === highlightIndex
              const isFav = favoriteIds.includes(c.id)
              const isCurrent = c.id === selectedCompanyId

              return (
                <div
                  key={c.id}
                  data-idx={idx}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onClick={() => {
                    onSelectCompany(c.id)
                    onClose()
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isHighlighted
                      ? 'bg-blue-600/20 border border-blue-500/40'
                      : 'hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite(c.id, e)
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        isFav ? 'text-amber-400 hover:text-amber-300' : 'text-gray-600 hover:text-gray-400'
                      }`}
                      title="관심기업 즐겨찾기"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{c.nameKo}</span>
                        <span className="text-[11px] text-gray-400 truncate hidden sm:inline">
                          ({c.name})
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-blue-300 border border-gray-700">
                          {c.ticker}
                        </span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${gradeColors[quality.grade]}`}>
                          {quality.grade}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            현재 선택됨
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{c.sector}</span>
                        <span>·</span>
                        <span>{c.country}</span>
                        <span>·</span>
                        <span className="text-gray-300">{quality.patternType.title.split(' ')[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-gray-400">2025 FCF</div>
                      <div className={`text-xs font-bold ${latestFin.freeCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {fcf.formatted}
                      </div>
                    </div>
                    <div className="text-right font-mono hidden sm:block">
                      <div className="text-[10px] text-gray-400">순현금</div>
                      <div className={`text-xs font-bold ${latestFin.netCash >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                        {netCash.formatted}
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isHighlighted ? 'text-blue-400' : 'text-gray-600'}`} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Quick View Switcher Bar */}
        <div className="px-4 py-2.5 bg-gray-900/90 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-semibold mr-1">뷰 바로가기:</span>
            <button
              onClick={() => {
                onSelectTab('overview')
                onClose()
              }}
              className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
            >
              <BarChart3 className="w-3 h-3 text-blue-400" />
              <span>기업 분석</span>
            </button>
            <button
              onClick={() => {
                onSelectTab('matrix')
                onClose()
              }}
              className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
            >
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>매트릭스</span>
            </button>
            <button
              onClick={() => {
                onSelectTab('comparison')
                onClose()
              }}
              className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
            >
              <Layers className="w-3 h-3 text-purple-400" />
              <span>비교 배틀</span>
            </button>
            <button
              onClick={() => {
                onSelectTab('table')
                onClose()
              }}
              className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
            >
              <Table className="w-3 h-3 text-amber-400" />
              <span>전체 표</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] text-gray-500 font-mono">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-300">↑↓</kbd> 이동
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-300">Enter</kbd> 선택
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-300">ESC</kbd> 닫기
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
