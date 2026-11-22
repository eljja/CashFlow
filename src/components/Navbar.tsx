import React, { useState } from 'react'
import {
  Activity,
  BarChart3,
  Table,
  Layers,
  Search,
  Compass,
  Star,
  RotateCcw,
  Command,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { Category, Currency, DatasetMetadata } from '../types'
import { DataFreshnessBadge } from './DataFreshnessBadge'

interface NavbarProps {
  metadata: DatasetMetadata
  activeTab: 'overview' | 'matrix' | 'comparison' | 'table'
  setActiveTab: (tab: 'overview' | 'matrix' | 'comparison' | 'table') => void
  selectedCategory: Category
  setSelectedCategory: (cat: Category) => void
  selectedSector: string
  setSelectedSector: (sec: string) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  showFavoritesOnly: boolean
  setShowFavoritesOnly: (val: boolean) => void
  favoriteCount: number
  filteredCount: number
  onOpenCommandPalette: () => void
  onResetFilters: () => void
  comparisonCount: number
}

export const Navbar: React.FC<NavbarProps> = ({
  metadata,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  selectedSector,
  setSelectedSector,
  currency,
  setCurrency,
  searchQuery,
  setSearchQuery,
  showFavoritesOnly,
  setShowFavoritesOnly,
  favoriteCount,
  filteredCount,
  onOpenCommandPalette,
  onResetFilters,
  comparisonCount
}) => {
  const [mobileFilterExpanded, setMobileFilterExpanded] = useState<boolean>(false)

  const categories: { label: string; shortLabel: string; value: Category; count: number }[] = [
    { label: '전체 (80)', shortLabel: '전체 80', value: 'All', count: 80 },
    { label: '🇰🇷 국내 (20)', shortLabel: '🇰🇷 국내', value: 'Domestic', count: 20 },
    { label: '🇺🇸 미국 (20)', shortLabel: '🇺🇸 미국', value: 'US', count: 20 },
    { label: '🌍 글로벌 (20)', shortLabel: '🌍 글로벌', value: 'Global', count: 20 },
    { label: '🚀 추가 혁신 (20)', shortLabel: '🚀 혁신', value: 'Additional', count: 20 }
  ]

  const sectors = [
    { label: '전체 섹터', value: 'All' },
    { label: '🔥 반도체·AI', value: 'Semiconductors' },
    { label: '☁️ 빅테크·SW', value: 'Software' },
    { label: '🚗 완성차·배터리', value: 'Automotive' },
    { label: '🧬 바이오·헬스', value: 'Biopharma' },
    { label: '⚡ 에너지·소재', value: 'Energy' },
    { label: '🏦 금융·투자', value: 'Financials' },
    { label: '💎 럭셔리·소비재', value: 'Consumer' }
  ]

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSector !== 'All' ||
    searchQuery.trim() !== '' ||
    showFavoritesOnly

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-gray-800/90 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ROW 1: Primary Brand, Main View Switcher, Global Controls (Strictly Single-Line) */}
        <div className="flex items-center justify-between h-14 sm:h-15 gap-2">
          {/* Left: Logo & Brand (shrink-0, whitespace-nowrap) */}
          <button
            onClick={() => {
              onResetFilters()
              setActiveTab('overview')
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
            title="홈으로 이동 및 필터 초기화"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <h1 className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                CashFlow Analytics
              </h1>
              <span className="hidden xl:inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-950/90 text-blue-400 border border-blue-800/80 font-mono font-semibold whitespace-nowrap">
                '20~'25
              </span>
            </div>
          </button>

          {/* Center: Navigation View Modes (Desktop md+) */}
          <nav
            aria-label="주요 분석 뷰"
            className="hidden md:flex items-center bg-gray-900/90 p-1 rounded-xl border border-gray-800 shrink-0"
          >
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">기업별 심층 분석</span>
              <span className="inline xl:hidden">기업 분석</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'matrix'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">현금 매트릭스</span>
              <span className="inline xl:hidden">매트릭스</span>
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'comparison'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">경쟁사 비교</span>
              <span className="inline xl:hidden">비교</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'comparison'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-800 text-blue-400'
                }`}
              >
                {comparisonCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Table className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">데이터 테이블</span>
              <span className="inline xl:hidden">전체 표</span>
            </button>
          </nav>

          {/* Right: Quick Search (Ctrl+K), Freshness, Currency, GitHub (Strictly Single-Line) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/80 text-xs transition-all shadow-sm whitespace-nowrap shrink-0"
              title="80개 기업 빠른 검색 및 이동 (단축키: Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden sm:inline font-medium">빠른 검색</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-gray-800 text-gray-400 rounded border border-gray-700">
                Ctrl+K
              </kbd>
            </button>

            {/* Data Freshness Badge (Desktop lg+) */}
            <div className="hidden lg:block shrink-0">
              <DataFreshnessBadge metadata={metadata} />
            </div>

            {/* Currency Selector (Strictly whitespace-nowrap) */}
            <div className="flex items-center bg-gray-900 rounded-lg p-0.5 border border-gray-800 shrink-0">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  currency === 'USD'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="미국 달러 기준 환산 ($B)"
              >
                $ USD
              </button>
              <button
                onClick={() => setCurrency('KRW')}
                className={`px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  currency === 'KRW'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="원화 기준 환산 (조원)"
              >
                ₩ KRW
              </button>
              <button
                onClick={() => setCurrency('NATIVE')}
                className={`px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  currency === 'NATIVE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="기업 본국 통화 기준"
              >
                원천
              </button>
            </div>

            {/* Mobile Filter Drawer Toggle Button */}
            <button
              onClick={() => setMobileFilterExpanded(!mobileFilterExpanded)}
              className={`flex md:hidden items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                hasActiveFilters || mobileFilterExpanded
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
              title="필터 및 검색 열기/닫기"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              )}
              {mobileFilterExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {/* GitHub Repo Button */}
            <a
              href="https://github.com/eljja/CashFlow"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors shrink-0"
              title="GitHub 저장소 보기"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* ROW 2 (Mobile Only): 4 Main View Mode Tabs */}
        <div className="grid grid-cols-4 md:hidden py-1.5 gap-1 border-t border-gray-800/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 bg-gray-900/80'
            }`}
          >
            <BarChart3 className="w-3 h-3 shrink-0" />
            <span>기업분석</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 bg-gray-900/80'
            }`}
          >
            <Compass className="w-3 h-3 shrink-0" />
            <span>매트릭스</span>
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'comparison'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 bg-gray-900/80'
            }`}
          >
            <Layers className="w-3 h-3 shrink-0" />
            <span>비교({comparisonCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'table'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 bg-gray-900/80'
            }`}
          >
            <Table className="w-3 h-3 shrink-0" />
            <span>전체표</span>
          </button>
        </div>

        {/* ROW 3: Filter & Search Bar (Always visible on Desktop md+, collapsible on Mobile to save vertical viewport!) */}
        <div
          className={`${
            mobileFilterExpanded ? 'block' : 'hidden md:block'
          } border-t border-gray-800/60 py-2 space-y-1.5`}
        >
          {/* Category Pills + Favorites + Inline Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value)
                    if (cat.value === 'All' && showFavoritesOnly) {
                      setShowFavoritesOnly(false)
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                    selectedCategory === cat.value && !showFavoritesOnly
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  <span className="hidden lg:inline">{cat.label}</span>
                  <span className="inline lg:hidden">{cat.shortLabel}</span>
                </button>
              ))}

              {/* Favorites Filter Pill */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1 ${
                  showFavoritesOnly
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'bg-gray-900/60 text-gray-400 hover:text-amber-300 border border-gray-800'
                }`}
                title="북마크한 관심기업만 필터링"
              >
                <Star
                  className={`w-3 h-3 shrink-0 ${
                    showFavoritesOnly || favoriteCount > 0 ? 'text-amber-400 fill-amber-400' : ''
                  }`}
                />
                <span>관심 ({favoriteCount})</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 text-xs font-medium whitespace-nowrap shrink-0 transition-colors"
                  title="모든 필터 초기화"
                >
                  <RotateCcw className="w-3 h-3 shrink-0" />
                  <span>초기화</span>
                </button>
              )}
            </div>

            {/* Inline Filter Input */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full md:w-56 lg:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="기업명/티커 필터 (예: 삼성, NVDA)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1 bg-gray-900/90 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white px-1"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="md:hidden">
                <DataFreshnessBadge metadata={metadata} />
              </div>
            </div>
          </div>

          {/* Sector Theme Rail */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-800/40 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-gray-500 text-[11px] font-semibold whitespace-nowrap shrink-0 mr-0.5">
                테마:
              </span>
              {sectors.map((sec) => (
                <button
                  key={sec.value}
                  onClick={() => setSelectedSector(sec.value)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 transition-all ${
                    selectedSector === sec.value
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'bg-gray-900/40 text-gray-400 hover:text-gray-200 border border-gray-800/80'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-gray-400 whitespace-nowrap shrink-0 font-mono">
              <span>표시:</span>
              <span className="font-bold text-blue-400">{filteredCount}</span>
              <span className="text-gray-600">/ 80개사</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
