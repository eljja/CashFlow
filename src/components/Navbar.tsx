import React from 'react'
import { Activity, DollarSign, BarChart3, Table, Layers, Search } from 'lucide-react'
import { Category, Currency, DatasetMetadata } from '../types'
import { DataFreshnessBadge } from './DataFreshnessBadge'

interface NavbarProps {
  metadata: DatasetMetadata
  activeTab: 'overview' | 'comparison' | 'table'
  setActiveTab: (tab: 'overview' | 'comparison' | 'table') => void
  selectedCategory: Category
  setSelectedCategory: (cat: Category) => void
  selectedSector: string
  setSelectedSector: (sec: string) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
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
  setSearchQuery
}) => {
  const categories: { label: string; value: Category; count: number }[] = [
    { label: '전체 (All 80)', value: 'All', count: 80 },
    { label: '국내 (Domestic 20)', value: 'Domestic', count: 20 },
    { label: '미국 (US 20)', value: 'US', count: 20 },
    { label: '글로벌 (Global 20)', value: 'Global', count: 20 },
    { label: '추가 유망 (20)', value: 'Additional', count: 20 }
  ]

  const sectors = [
    { label: '전체 섹터', value: 'All' },
    { label: '🔥 반도체 & AI', value: 'Semiconductors' },
    { label: '☁️ 빅테크 & 클라우드', value: 'Software' },
    { label: '🚗 완성차 & 배터리', value: 'Automotive' },
    { label: '🧬 바이오 & 헬스케어', value: 'Biopharma' },
    { label: '⚡ 에너지 & 원자재', value: 'Energy' },
    { label: '🏦 금융 & 투자', value: 'Financials' },
    { label: '💎 럭셔리 & 소비재', value: 'Consumer' }
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-gray-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
                  CashFlow Analytics
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-medium">
                  5-Year Time Series
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                글로벌 80대 기업 현금흐름(FCF·순현금) & 대주주 지분 분석
              </p>
            </div>
          </div>

          {/* Navigation View Modes */}
          <div className="hidden md:flex items-center bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>기업별 심층 분석</span>
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'comparison'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>경쟁사 비교 배틀</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>전체 데이터 테이블</span>
            </button>
          </div>

          {/* Controls: Data Freshness, Currency & GitHub Link */}
          <div className="flex items-center gap-2.5">
            {/* Data Freshness Badge */}
            <div className="hidden sm:block">
              <DataFreshnessBadge metadata={metadata} />
            </div>

            {/* Currency Selector */}
            <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  currency === 'USD'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="미국 달러 기준 환산 (10억 달러 $B 단위)"
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('KRW')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  currency === 'KRW'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="원화 기준 환산 (조원 단위)"
              >
                KRW (₩)
              </button>
              <button
                onClick={() => setCurrency('NATIVE')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  currency === 'NATIVE'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="기업 본국 발표 통화 기준"
              >
                원천 통화
              </button>
            </div>

            {/* GitHub Repo Button */}
            <a
              href="https://github.com/eljja/CashFlow"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors"
              title="GitHub 저장소 보기"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile View Mode Switcher */}
        <div className="flex md:hidden py-2 gap-1 border-t border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-center whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 bg-gray-900'
            }`}
          >
            기업별 분석
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-center whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 bg-gray-900'
            }`}
          >
            비교 배틀
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-center whitespace-nowrap ${
              activeTab === 'table'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 bg-gray-900'
            }`}
          >
            데이터 표
          </button>
        </div>

        {/* Sub-bar: Category Tabs & Search Bar */}
        <div className="py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-800/60">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="기업명/티커 검색 (예: 삼성, NVDA, Kioxia)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Sector Quick Theme Bar */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto border-t border-gray-800/40 scrollbar-none text-xs">
          <span className="text-gray-500 text-[11px] font-semibold whitespace-nowrap mr-1">테마별 필터:</span>
          {sectors.map((sec) => (
            <button
              key={sec.value}
              onClick={() => setSelectedSector(sec.value)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedSector === sec.value
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                  : 'bg-gray-900/40 text-gray-400 hover:text-gray-200 border border-gray-800/80'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
