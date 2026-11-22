import React, { useState, useMemo, useEffect, useCallback } from 'react'
import dataset from './data/companies.json'
import { Company, Category, Currency, Dataset } from './types'
import { Navbar } from './components/Navbar'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { CompanySelector } from './components/CompanySelector'
import { CompanyDeepDive } from './components/CompanyDeepDive'
import { PeerComparison } from './components/PeerComparison'
import { DataTable } from './components/DataTable'
import { CashFlowScatterChart } from './components/CashFlowScatterChart'
import { CommandPalette } from './components/CommandPalette'
import { ExternalLink, ArrowUp, Command } from 'lucide-react'

const DEFAULT_FAVORITES = [
  'samsung-electronics',
  'sk-hynix',
  'nvidia',
  'micron',
  'kioxia',
  'intel'
]

export const App: React.FC = () => {
  const data = dataset as Dataset
  const allCompanies: Company[] = data.companies

  const [activeTab, setActiveTab] = useState<'overview' | 'matrix' | 'comparison' | 'table'>(
    'overview'
  )
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')
  const [selectedSector, setSelectedSector] = useState<string>('All')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('samsung-electronics')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false)
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false)

  // Persistent Favorites (Watchlist)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cashflow_favorites_v1')
      return saved ? JSON.parse(saved) : DEFAULT_FAVORITES
    } catch {
      return DEFAULT_FAVORITES
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('cashflow_favorites_v1', JSON.stringify(favoriteIds))
    } catch {
      // Ignore storage error
    }
  }, [favoriteIds])

  const handleToggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }, [])

  // Shared Peer Comparison Basket
  const [comparisonIds, setComparisonIds] = useState<string[]>([
    'samsung-electronics',
    'sk-hynix',
    'micron',
    'kioxia'
  ])

  const handleToggleComparison = useCallback((id: string) => {
    setComparisonIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((item) => item !== id) : prev
      }
      if (prev.length >= 6) {
        return [...prev.slice(1), id]
      }
      return [...prev, id]
    })
  }, [])

  // Reset all active filters
  const handleResetFilters = useCallback(() => {
    setSelectedCategory('All')
    setSelectedSector('All')
    setSearchQuery('')
    setShowFavoritesOnly(false)
  }, [])

  // Synchronize state from URL parameters on initial load & popstate (Back/Forward)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const compParam = params.get('company')
    const tabParam = params.get('tab')
    const catParam = params.get('category')
    const secParam = params.get('sector')
    const currParam = params.get('currency')

    if (compParam && allCompanies.some((c) => c.id === compParam)) {
      setSelectedCompanyId(compParam)
    }
    if (tabParam && ['overview', 'matrix', 'comparison', 'table'].includes(tabParam)) {
      setActiveTab(tabParam as any)
    }
    if (
      catParam &&
      ['All', 'Domestic', 'US', 'Global', 'Additional'].includes(catParam)
    ) {
      setSelectedCategory(catParam as any)
    }
    if (secParam) {
      setSelectedSector(secParam)
    }
    if (currParam) {
      const upper = currParam.toUpperCase()
      if (['USD', 'KRW', 'NATIVE'].includes(upper)) {
        setCurrency(upper as Currency)
      }
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search)
      const c = p.get('company')
      const t = p.get('tab')
      if (c && allCompanies.some((comp) => comp.id === c)) {
        setSelectedCompanyId(c)
      }
      if (t && ['overview', 'matrix', 'comparison', 'table'].includes(t)) {
        setActiveTab(t as any)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [allCompanies])

  // Filter companies by category, sector, favorites, and search query
  const filteredCompanies = useMemo(() => {
    return allCompanies.filter((c) => {
      if (showFavoritesOnly && !favoriteIds.includes(c.id)) {
        return false
      }

      const matchCategory =
        selectedCategory === 'All' || c.category === selectedCategory

      let matchSector = true
      if (selectedSector !== 'All') {
        const sec = c.sector.toLowerCase()
        if (selectedSector === 'Semiconductors') {
          matchSector =
            sec.includes('semiconductor') ||
            sec.includes('ai') ||
            sec.includes('nand') ||
            sec.includes('foundry') ||
            sec.includes('equipment')
        } else if (selectedSector === 'Software') {
          matchSector =
            sec.includes('software') ||
            sec.includes('cloud') ||
            sec.includes('internet') ||
            sec.includes('data') ||
            sec.includes('cybersecurity')
        } else if (selectedSector === 'Automotive') {
          matchSector =
            sec.includes('automotive') ||
            sec.includes('batteries') ||
            sec.includes('mobility')
        } else if (selectedSector === 'Biopharma') {
          matchSector =
            sec.includes('biopharma') ||
            sec.includes('pharma') ||
            sec.includes('healthcare')
        } else if (selectedSector === 'Energy') {
          matchSector =
            sec.includes('energy') ||
            sec.includes('oil') ||
            sec.includes('power') ||
            sec.includes('steel') ||
            sec.includes('mining') ||
            sec.includes('chemicals')
        } else if (selectedSector === 'Financials') {
          matchSector =
            sec.includes('financial') ||
            sec.includes('investment') ||
            sec.includes('fintech') ||
            sec.includes('crypto')
        } else if (selectedSector === 'Consumer') {
          matchSector =
            sec.includes('consumer') ||
            sec.includes('luxury') ||
            sec.includes('retail') ||
            sec.includes('gaming') ||
            sec.includes('entertainment') ||
            sec.includes('food') ||
            sec.includes('travel')
        }
      }

      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        q === '' ||
        c.name.toLowerCase().includes(q) ||
        c.nameKo.toLowerCase().includes(q) ||
        c.ticker.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      return matchCategory && matchSector && matchSearch
    })
  }, [allCompanies, selectedCategory, selectedSector, searchQuery, showFavoritesOnly, favoriteIds])

  // Current selected company
  const currentCompany = useMemo(() => {
    const found = allCompanies.find((c) => c.id === selectedCompanyId)
    return found || filteredCompanies[0] || allCompanies[0]
  }, [allCompanies, selectedCompanyId, filteredCompanies])

  const currentCompanyIndex = useMemo(() => {
    const idx = filteredCompanies.findIndex((c) => c.id === currentCompany.id)
    return idx >= 0 ? idx : 0
  }, [filteredCompanies, currentCompany])

  const handlePrevCompany = useCallback(() => {
    if (filteredCompanies.length === 0) return
    const prevIdx =
      (currentCompanyIndex - 1 + filteredCompanies.length) % filteredCompanies.length
    setSelectedCompanyId(filteredCompanies[prevIdx].id)
  }, [filteredCompanies, currentCompanyIndex])

  const handleNextCompany = useCallback(() => {
    if (filteredCompanies.length === 0) return
    const nextIdx = (currentCompanyIndex + 1) % filteredCompanies.length
    setSelectedCompanyId(filteredCompanies[nextIdx].id)
  }, [filteredCompanies, currentCompanyIndex])

  const handleSelectCompany = useCallback((id: string) => {
    setSelectedCompanyId(id)
    setActiveTab('overview')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Global keyboard shortcuts (Ctrl+K / Cmd+K for Command Palette, [ and ] for Prev/Next company)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
        return
      }

      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      if (isInput || isCommandPaletteOpen) return

      if (e.key === '[') {
        e.preventDefault()
        handlePrevCompany()
      } else if (e.key === ']') {
        e.preventDefault()
        handleNextCompany()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isCommandPaletteOpen, handlePrevCompany, handleNextCompany])

  // Track scroll position for floating Back-to-Top button
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 450)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Synchronize URL query params and Dynamic Meta Title for SEO & Direct Sharing
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCompanyId) {
      params.set('company', selectedCompanyId)
    }
    if (activeTab !== 'overview') {
      params.set('tab', activeTab)
    }
    if (selectedCategory !== 'All') {
      params.set('category', selectedCategory)
    }
    if (selectedSector !== 'All') {
      params.set('sector', selectedSector)
    }
    if (currency !== 'USD') {
      params.set('currency', currency)
    }

    const queryStr = params.toString() ? `?${params.toString()}` : ''
    const newUrl = `${window.location.pathname}${queryStr}${window.location.hash}`
    window.history.replaceState(null, '', newUrl)

    if (currentCompany && activeTab === 'overview') {
      document.title = `${currentCompany.nameKo} (${currentCompany.name}) 6개년 현금흐름 & 대주주 지분 분석 (FCF·순현금) | CashFlow Analytics`
    } else if (activeTab === 'matrix') {
      document.title = `글로벌 80대 기업 현금흐름 매트릭스 산점도 분석 (FCF Margin vs Net Cash) | CashFlow Analytics`
    } else if (activeTab === 'comparison') {
      document.title = `반도체 4사 & 글로벌 동종업계 현금흐름 비교 분석 | CashFlow Analytics`
    } else if (activeTab === 'table') {
      document.title = `글로벌 80대 기업 6개년(2020-2025) 재무 데이터 전수 테이블 | CashFlow Analytics`
    }
  }, [selectedCompanyId, activeTab, selectedCategory, selectedSector, currency, currentCompany])

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Navigation */}
      <Navbar
        metadata={data.metadata}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        currency={currency}
        setCurrency={setCurrency}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        favoriteCount={favoriteIds.length}
        filteredCount={filteredCompanies.length}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onResetFilters={handleResetFilters}
        comparisonCount={comparisonIds.length}
      />

      {/* Global Ctrl+K Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        companies={allCompanies}
        currency={currency}
        selectedCompanyId={currentCompany.id}
        onSelectCompany={handleSelectCompany}
        onSelectTab={setActiveTab}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Executive KPI Ranking Cards */}
        <ExecutiveSummary
          allCompanies={allCompanies}
          filteredCompanies={filteredCompanies}
          selectedCompanyId={currentCompany.id}
          currency={currency}
          onSelectCompany={handleSelectCompany}
        />

        {/* Tab 1: Company Deep Dive */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <CompanySelector
              companies={filteredCompanies}
              selectedCompanyId={currentCompany.id}
              onSelectCompany={setSelectedCompanyId}
              currency={currency}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onResetFilters={handleResetFilters}
            />
            <CompanyDeepDive
              company={currentCompany}
              currency={currency}
              onPrevCompany={handlePrevCompany}
              onNextCompany={handleNextCompany}
              currentIndex={currentCompanyIndex}
              totalFiltered={filteredCompanies.length}
              isFavorite={favoriteIds.includes(currentCompany.id)}
              onToggleFavorite={handleToggleFavorite}
              isInComparison={comparisonIds.includes(currentCompany.id)}
              onToggleComparison={handleToggleComparison}
              onGoToComparison={() => setActiveTab('comparison')}
            />
          </div>
        )}

        {/* Tab 2: Global Cash Matrix Landscape */}
        {activeTab === 'matrix' && (
          <div>
            <CashFlowScatterChart
              companies={filteredCompanies}
              currency={currency}
              onSelectCompany={handleSelectCompany}
            />
          </div>
        )}

        {/* Tab 3: Peer Comparison Matrix */}
        {activeTab === 'comparison' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>경쟁사 및 섹터별 현금흐름 비교 배틀 매트릭스</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                  Interactive Battle
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                메모리 반도체 4사(삼성/하이닉스/마이크론/키옥시아), AI 빅테크, 글로벌 완성차 등 최대 6개 기업을 자유롭게 추가·비교합니다.
              </p>
            </div>
            <PeerComparison
              companies={allCompanies}
              currency={currency}
              selectedIds={comparisonIds}
              onChangeSelectedIds={setComparisonIds}
              onSelectCompany={handleSelectCompany}
            />
          </div>
        )}

        {/* Tab 4: All 80 Companies Data Table */}
        {activeTab === 'table' && (
          <div>
            <DataTable
              companies={filteredCompanies}
              currency={currency}
              onSelectCompany={handleSelectCompany}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              comparisonIds={comparisonIds}
              onToggleComparison={handleToggleComparison}
            />
          </div>
        )}
      </main>

      {/* Floating Quick Action Buttons (Scroll-to-Top & Ctrl+K Trigger) */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-3 rounded-2xl bg-gray-900/90 hover:bg-blue-600 text-blue-400 hover:text-white border border-gray-700 shadow-xl backdrop-blur-md transition-all"
            title="빠른 기업 검색 (Ctrl+K)"
          >
            <Command className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all"
            title="맨 위로 이동"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800/80 bg-gray-950/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            <p className="font-semibold text-gray-300">
              CashFlow Analytics · 글로벌 80대 기업 6개년(2020~2025) 현금흐름 & 대주주 지분 분석
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              백엔드 서버 없이 GitHub Pages(github.io) 상에서 100% 클라이언트 정적으로 구동됩니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>데이터 갱신일: {data.metadata.lastUpdated} (주기: 1개월)</span>
            </div>
            <span className="text-gray-700">|</span>
            <a
              href="https://github.com/eljja/CashFlow"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
