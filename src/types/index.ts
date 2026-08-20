export type Currency = 'USD' | 'KRW' | 'NATIVE'

export type Category = 'All' | 'Domestic' | 'US' | 'Global' | 'Additional'

export interface FinancialYear {
  year: number
  revenue: number
  operatingIncome: number
  netIncome: number
  operatingCashFlow: number
  capitalExpenditure: number
  freeCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  dividendsPaid: number
  shareRepurchase: number
  totalShareholderReturn: number
  netChangeInCash: number
  cashAndEquivalents: number
  shortTermInvestments: number
  totalCash: number
  totalDebt: number
  netCash: number
  fcfMargin: number
  fcfConversion: number
  ocfToCapex: number
}

export interface ShareholderCurrent {
  name: string
  nameKo?: string
  type: 'PE/VC' | 'Institutional' | 'Pension/Sovereign' | 'Insider/Founder' | 'Corporate/Strategic' | 'Public/Other'
  percentage: number
  description?: string
}

export interface ShareholderHistory {
  year: number
  [key: string]: number
}

export interface Company {
  id: string
  name: string
  nameKo: string
  ticker: string
  category: 'Domestic' | 'US' | 'Global' | 'Additional'
  sector: string
  country: string
  currency: string
  unit: string
  unitMultiplier: number
  description: string
  financials: FinancialYear[]
  shareholders: {
    current: ShareholderCurrent[]
    history: ShareholderHistory[]
  }
}

export interface DatasetMetadata {
  title: string
  lastUpdated: string
  years: number[]
  totalCompanies: number
  exchangeRates: Record<string, number>
}

export interface Dataset {
  metadata: DatasetMetadata
  companies: Company[]
}
