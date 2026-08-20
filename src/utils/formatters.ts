import { Company, Currency } from '../types'

// Exchange rates relative to USD (USD=1)
export const BASE_RATES: Record<string, number> = {
  USD: 1.0,
  KRW: 1440.0,
  JPY: 152.0,
  EUR: 0.95,
  TWD: 32.5,
  HKD: 7.80,
  GBP: 0.79,
  CHF: 0.90,
  SEK: 10.80
}

/**
 * Converts a raw numerical value from company's native base into target currency in normalized units.
 * Returns { value: number, unitLabel: string }
 * If target is USD: output in Billion USD ($B)
 * If target is KRW: output in Trillion KRW (조원)
 * If target is NATIVE: output in company's native unit
 */
export function convertValue(
  val: number,
  company: Company,
  targetCurrency: Currency
): { value: number; formatted: string; unitLabel: string } {
  if (val === undefined || val === null || isNaN(val)) {
    return { value: 0, formatted: '0', unitLabel: '' }
  }

  // 1. Calculate raw value in base units (e.g. actual single dollars / wons)
  const rawAbsoluteValue = val * company.unitMultiplier

  // 2. Convert raw value to USD absolute
  const compCurrency = company.currency
  const rateToUsd = BASE_RATES[compCurrency] || 1.0
  const absoluteUSD = rawAbsoluteValue / rateToUsd

  if (targetCurrency === 'USD') {
    const inBillionUSD = absoluteUSD / 1e9
    const formatted = inBillionUSD.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return {
      value: inBillionUSD,
      formatted: `$${formatted}B`,
      unitLabel: '$B'
    }
  }

  if (targetCurrency === 'KRW') {
    const inTrillionKRW = (absoluteUSD * BASE_RATES.KRW) / 1e12
    const formatted = inTrillionKRW.toLocaleString('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return {
      value: inTrillionKRW,
      formatted: `${formatted}조원`,
      unitLabel: '조원'
    }
  }

  // Native
  const formatted = val.toLocaleString('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return {
    value: val,
    formatted: `${formatted} ${company.unit.split(' ')[0]}`,
    unitLabel: company.unit.split(' ')[0]
  }
}

export function formatPercent(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0.0%'
  const prefix = val > 0 ? '+' : ''
  return `${prefix}${val.toFixed(1)}%`
}

export function formatNumber(val: number, digits: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '0'
  return val.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}
