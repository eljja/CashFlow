import React, { useState, useMemo } from 'react'
import dataset from './data/companies.json'
import { Company, Category, Currency, Dataset } from './types'
import { Navbar } from './components/Navbar'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { CompanySelector } from './components/CompanySelector'
import { CompanyDeepDive } from './components/CompanyDeepDive'
import { PeerComparison } from './components/PeerComparison'
import { DataTable } from './components/DataTable'
import { CashFlowScatterChart } from './components/CashFlowScatterChart'
import { ExternalLink } from 'lucide-react'

export const App: React.FC = () => {
  const data = dataset as Dataset
  const allCompanies: Company[] = data.companies

  const [activeTab, setActiveTab] = useState<'overview' | 'matrix' | 'comparison' | 'table'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')
  const [selectedSector, setSelectedSector] = useState<string>('All')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('samsung-electronics')

  // Filter companies by category, sector, and search query
  const filteredCompanies = useMemo(() => {
    return allCompanies.filter((c) => {
      const matchCategory =
        selectedCategory === 'All' || c.category === selectedCategory
      
      let matchSector = true
      if (selectedSector !== 'All') {
        const sec = c.sector.toLowerCase()
        if (selectedSector === 'Semiconductors') {
          matchSector = sec.includes('semiconductor') || sec.includes('ai') || sec.includes('nand') || sec.includes('foundry') || sec.includes('equipment')
        } else if (selectedSector === 'Software') {
          matchSector = sec.includes('software') || sec.includes('cloud') || sec.includes('internet') || sec.includes('data') || sec.includes('cybersecurity')
        } else if (selectedSector === 'Automotive') {
          matchSector = sec.includes('automotive') || sec.includes('batteries') || sec.includes('mobility')
        } else if (selectedSector === 'Biopharma') {
          matchSector = sec.includes('biopharma') || sec.includes('pharma') || sec.includes('healthcare')
        } else if (selectedSector === 'Energy') {
          matchSector = sec.includes('energy') || sec.includes('oil') || sec.includes('power') || sec.includes('steel') || sec.includes('mining') || sec.includes('chemicals')
        } else if (selectedSector === 'Financials') {
          matchSector = sec.includes('financial') || sec.includes('investment') || sec.includes('fintech') || sec.includes('crypto')
        } else if (selectedSector === 'Consumer') {
          matchSector = sec.includes('consumer') || sec.includes('luxury') || sec.includes('retail') || sec.includes('gaming') || sec.includes('entertainment') || sec.includes('food') || sec.includes('travel')
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
  }, [allCompanies, selectedCategory, selectedSector, searchQuery])

  // Current selected company
  const currentCompany = useMemo(() => {
    const found = allCompanies.find((c) => c.id === selectedCompanyId)
    return found || filteredCompanies[0] || allCompanies[0]
  }, [allCompanies, selectedCompanyId, filteredCompanies])

  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id)
    setActiveTab('overview')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Executive KPI Ranking Cards */}
        <ExecutiveSummary
          companies={allCompanies}
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
            />
            <CompanyDeepDive company={currentCompany} currency={currency} />
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
                <span>경쟁사 및 섹터별 현금흐름 비교 매트릭스</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                  Interactive Matrix
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                메모리 반도체 4사(삼성/하이닉스/마이크론/키옥시아) 및 AI 빅테크, 글로벌 완성차 등 원하는 기업을 다중 선택하여 비교합니다.
              </p>
            </div>
            <PeerComparison companies={allCompanies} currency={currency} />
          </div>
        )}

        {/* Tab 4: All 80 Companies Data Table */}
        {activeTab === 'table' && (
          <div>
            <DataTable
              companies={filteredCompanies}
              currency={currency}
              onSelectCompany={handleSelectCompany}
            />
          </div>
        )}
      </main>

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
