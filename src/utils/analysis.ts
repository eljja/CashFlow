import { Company, FinancialYear } from '../types'

export interface CashQualityScore {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D'
  score: number // 0 ~ 100
  fcfConversionRate: number // FCF / Net Income %
  capexReinvestmentRate: number // CapEx / OCF %
  netCashToRevenueRatio: number // Net Cash / Revenue %
  shareholderPayoutRatio: number // Total Shareholder Return / FCF %
  patternType: {
    code: string
    title: string
    description: string
    tagColor: string
  }
  radarMetrics: {
    fcfPower: number // 0-100
    netCashSafety: number // 0-100
    cashConversion: number // 0-100
    shareholderFriendly: number // 0-100
    capexEfficiency: number // 0-100
  }
}

/**
 * 8대 현금흐름 패턴 진단 (OCF, ICF, FCF/FinCF 부호 조합)
 */
export function getCashFlowPattern(fin: FinancialYear): {
  code: string
  title: string
  description: string
  tagColor: string
} {
  const ocfPos = fin.operatingCashFlow >= 0
  const icfPos = fin.investingCashFlow >= 0 // usually negative due to capex/investments
  const finPos = fin.financingCashFlow >= 0

  if (ocfPos && !icfPos && !finPos) {
    return {
      code: 'TYPE-1',
      title: '🏆 우량 초우량형 (Cash Cow / Value Creator)',
      description: '본업에서 풍부한 현금을 창출하여 미래 투자(CapEx)를 자체 충당하고, 차입금 상환 및 배당/자사주 매입으로 주주에게 환원하는 가장 이상적인 현금흐름 구조입니다.',
      tagColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40'
    }
  } else if (ocfPos && !icfPos && finPos) {
    return {
      code: 'TYPE-2',
      title: '🚀 고성장 투자확대형 (Growth Engine)',
      description: '본업 현금 창출과 더불어 외부 자금(증자/차입)까지 적극 조달하여 신사업 및 대규모 설비투자에 공격적으로 베팅하는 성장기 기업 패턴입니다.',
      tagColor: 'text-blue-400 bg-blue-950/40 border-blue-500/40'
    }
  } else if (ocfPos && icfPos && !finPos) {
    return {
      code: 'TYPE-3',
      title: '🔄 자산회수 & 주주환원형 (Cash Extraction)',
      description: '영업현금 유입과 기존 투자자산 회수를 통해 유동성을 확보하고 부채 상환 또는 대규모 주주환원에 집중하는 안정적 회수기 패턴입니다.',
      tagColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/40'
    }
  } else if (!ocfPos && !icfPos && finPos) {
    return {
      code: 'TYPE-4',
      title: '🌱 초기 유망 & 투자유치형 (Early-Stage Incubator)',
      description: '현재 본업은 투자 단계로 현금이 유출되지만, 외부 투자 유치 및 차입을 통해 미래 성장 동력을 확보해 나가는 기술/바이오/스타트업형 패턴입니다.',
      tagColor: 'text-purple-400 bg-purple-950/40 border-purple-500/40'
    }
  } else if (!ocfPos && icfPos && finPos) {
    return {
      code: 'TYPE-5',
      title: '⚠️ 자산매각 긴급방어형 (Restructuring Defense)',
      description: '영업 적자를 메우기 위해 보유 자산 매각 및 외부 차입에 의존하는 구조로, 본업 현금창출력의 조속한 턴어라운드가 요구되는 구조조정 패턴입니다.',
      tagColor: 'text-amber-400 bg-amber-950/40 border-amber-500/40'
    }
  } else {
    return {
      code: 'TYPE-6',
      title: '⚖️ 안정적 현금 순환형 (Balanced Flow)',
      description: '영업 및 투자, 재무활동 간 현금 유출입이 균형을 이루며 시장 상황에 맞추어 유동성을 조절하는 실용적 현금 운용 패턴입니다.',
      tagColor: 'text-slate-300 bg-slate-800/60 border-slate-700'
    }
  }
}

/**
 * 현금흐름 종합 품질 점수 및 5대 체력 메트릭 계산
 */
export function calculateCashQuality(company: Company): CashQualityScore {
  const fin = company.financials[company.financials.length - 1] // latest year (2025)
  const pattern = getCashFlowPattern(fin)

  let score = 50

  // 1. FCF Margin (0~40%)
  const fcfMargin = fin.fcfMargin
  if (fcfMargin >= 30) score += 20
  else if (fcfMargin >= 20) score += 15
  else if (fcfMargin >= 10) score += 10
  else if (fcfMargin > 0) score += 5
  else score -= 10

  // 2. Net Cash Status (순현금 상태)
  const isNetCashPositive = fin.netCash > 0
  if (isNetCashPositive) {
    const netCashRatio = fin.revenue > 0 ? (fin.netCash / fin.revenue) * 100 : 0
    if (netCashRatio >= 25) score += 15
    else score += 10
  } else {
    const netDebtRatio = fin.revenue > 0 ? (Math.abs(fin.netCash) / fin.revenue) * 100 : 0
    if (netDebtRatio > 50) score -= 15
    else score -= 5
  }

  // 3. FCF Conversion Rate (순이익 대비 실제 현금화 비율)
  let conversion = 0
  if (fin.netIncome > 0) {
    conversion = (fin.freeCashFlow / fin.netIncome) * 100
    if (conversion >= 100) score += 10
    else if (conversion >= 70) score += 5
    else if (conversion < 0) score -= 5
  }

  // 4. CapEx Reinvestment Rate (설비투자 지속성)
  let capexRate = 0
  if (fin.operatingCashFlow > 0) {
    capexRate = (fin.capitalExpenditure / fin.operatingCashFlow) * 100
    if (capexRate >= 20 && capexRate <= 70) score += 10 // healthy sweet spot
    else if (capexRate > 90) score -= 5 // over-leveraged capex
  }

  // 5. Shareholder Return to FCF Ratio
  let payoutRatio = 0
  if (fin.freeCashFlow > 0) {
    payoutRatio = (fin.totalShareholderReturn / fin.freeCashFlow) * 100
    if (payoutRatio >= 30 && payoutRatio <= 100) score += 5
    else if (payoutRatio > 120) score -= 5 // funding dividends with debt
  }

  // Bound score between 0 and 100
  const finalScore = Math.max(10, Math.min(100, score))

  // Determine Grade
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B'
  if (finalScore >= 90) grade = 'A+'
  else if (finalScore >= 80) grade = 'A'
  else if (finalScore >= 65) grade = 'B'
  else if (finalScore >= 50) grade = 'C'
  else grade = 'D'

  // Radar metrics (0~100 normalized)
  const fcfPower = Math.max(10, Math.min(100, fcfMargin * 2.5 + 20))
  const netCashSafety = fin.netCash >= 0 ? Math.min(100, 60 + (fin.netCash / (fin.revenue || 1)) * 40) : Math.max(10, 50 - (Math.abs(fin.netCash) / (fin.revenue || 1)) * 30)
  const cashConversion = Math.max(10, Math.min(100, conversion > 0 ? conversion * 0.8 : 20))
  const shareholderFriendly = Math.max(10, Math.min(100, payoutRatio * 1.0 + 10))
  const capexEfficiency = Math.max(10, Math.min(100, (fin.operatingCashFlow / (fin.capitalExpenditure || 1)) * 25))

  return {
    grade,
    score: finalScore,
    fcfConversionRate: roundNumber(conversion),
    capexReinvestmentRate: roundNumber(capexRate),
    netCashToRevenueRatio: roundNumber(fin.revenue > 0 ? (fin.netCash / fin.revenue) * 100 : 0),
    shareholderPayoutRatio: roundNumber(payoutRatio),
    patternType: pattern,
    radarMetrics: {
      fcfPower: roundNumber(fcfPower),
      netCashSafety: roundNumber(netCashSafety),
      cashConversion: roundNumber(cashConversion),
      shareholderFriendly: roundNumber(shareholderFriendly),
      capexEfficiency: roundNumber(capexEfficiency)
    }
  }
}

function roundNumber(num: number): number {
  return Math.round(num * 10) / 10
}
