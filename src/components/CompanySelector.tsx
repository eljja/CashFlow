import React from 'react'
import { Company, Currency } from '../types'
import { convertValue } from '../utils/formatters'
import { calculateCashQuality } from '../utils/analysis'
import { Check } from 'lucide-react'

interface CompanySelectorProps {
  companies: Company[]
  selectedCompanyId: string
  onSelectCompany: (id: string) => void
  currency: Currency
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  currency
}) => {
  const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-500 text-black',
    'A': 'bg-emerald-600 text-white',
    'B': 'bg-blue-600 text-white',
    'C': 'bg-amber-600 text-white',
    'D': 'bg-rose-600 text-white'
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <span>기업 선택 ({companies.length}개사 중 선택)</span>
          <span className="text-[10px] text-gray-500 font-normal">품질 등급 및 최신 FCF 포함</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700">
        {companies.map((c) => {
          const isSelected = c.id === selectedCompanyId
          const latestFin = c.financials[c.financials.length - 1]
          const fcf = convertValue(latestFin.freeCashFlow, c, currency)
          const quality = calculateCashQuality(c)

          return (
            <button
              key={c.id}
              onClick={() => onSelectCompany(c.id)}
              className={`p-2.5 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-gray-800/40 hover:bg-gray-800/80 border-gray-700/60 hover:border-gray-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-400">{c.ticker}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${gradeColors[quality.grade]}`}>
                      {quality.grade}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
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
            </button>
          )
        })}
      </div>
    </div>
  )
}
