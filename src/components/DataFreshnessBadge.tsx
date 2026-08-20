import React, { useState } from 'react'
import { Calendar, Clock, RefreshCw, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { DatasetMetadata } from '../types'

interface DataFreshnessBadgeProps {
  metadata: DatasetMetadata
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({ metadata }) => {
  const [isOpen, setIsOpen] = useState(false)

  const updatedDate = new Date(metadata.lastUpdatedISO || metadata.lastUpdated)
  const currentDate = new Date()

  // Calculate elapsed days
  const diffTime = Math.abs(currentDate.getTime() - updatedDate.getTime())
  const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const updateInterval = metadata.updateIntervalDays || 30
  const daysRemaining = Math.max(0, updateInterval - elapsedDays)
  const isUpdateNeeded = elapsedDays >= updateInterval

  // Next scheduled update date
  const nextUpdateDate = new Date(updatedDate)
  nextUpdateDate.setDate(nextUpdateDate.getDate() + updateInterval)

  return (
    <div className="relative inline-block text-left">
      {/* Badge Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-sm ${
          isUpdateNeeded
            ? 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-950/60 shadow-amber-950/20'
            : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/60 shadow-emerald-950/20'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isUpdateNeeded ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isUpdateNeeded ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          ></span>
        </span>
        <span>
          {isUpdateNeeded
            ? `업데이트 권장 (${elapsedDays}일 경과)`
            : `데이터 최신 (업데이트: ${metadata.lastUpdated})`}
        </span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl p-4 z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white text-sm">데이터 갱신 주기 관리</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isUpdateNeeded
                    ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                    : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                }`}
              >
                {isUpdateNeeded ? '갱신 주기 도래' : '정상 최신'}
              </span>
            </div>

            <div className="space-y-2.5 text-gray-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-800/50">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  최근 데이터 업데이트 일자
                </span>
                <span className="font-mono font-bold text-white">
                  {metadata.lastUpdated}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-800/50">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                  업데이트 기준 주기
                </span>
                <span className="font-mono font-semibold text-blue-400">
                  매 1개월 ({updateInterval}일)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-800/50">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  다음 권장 갱신일
                </span>
                <span className="font-mono font-semibold text-purple-300">
                  {nextUpdateDate.toISOString().split('T')[0]}
                </span>
              </div>

              {/* Status Notice */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isUpdateNeeded
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                {isUpdateNeeded ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-[11px]">
                    {isUpdateNeeded
                      ? `마지막 갱신 후 ${elapsedDays}일이 경과하여 1개월 갱신 시점이 도래했습니다.`
                      : `현재 최신 데이터가 반영되어 있습니다. (${daysRemaining}일 후 다음 1개월 주기 도래)`}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    GitHub Actions에서 매주 자동 갱신되거나, 수동으로 즉시 갱신할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <a
                href="https://github.com/eljja/CashFlow/actions"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-md shadow-blue-600/30 text-center"
              >
                <span>GitHub Actions에서 즉시 갱신하기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
