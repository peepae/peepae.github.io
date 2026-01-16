'use client'

import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { formatEUR } from '../utils/formatters'

interface BalanceCardProps {
  netWorth: number
  spendableBalance: number
  initialBalance: number
  totalIncome: number
  totalExpenses: number
  totalInSavingsPots: number
  onInitialBalanceChange: (balance: number) => void
}

export default function BalanceCard({ 
  netWorth,
  spendableBalance,
  initialBalance,
  totalIncome,
  totalExpenses,
  totalInSavingsPots,
  onInitialBalanceChange 
}: BalanceCardProps) {
  const isNetWorthPositive = netWorth >= 0
  const isSpendablePositive = spendableBalance >= 0

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 rounded-lg shadow-lg p-6 text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Net Worth */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Wallet size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-indigo-100 uppercase tracking-wide">Net Worth</h2>
              <p className={`text-3xl font-bold ${isNetWorthPositive ? 'text-white' : 'text-red-200'}`}>
                {formatEUR(netWorth)}
              </p>
            </div>
          </div>

          {/* Spendable Cash */}
          <div className="flex items-center gap-3 border-l border-white/30 pl-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <PiggyBank size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-indigo-100 uppercase tracking-wide">Spendable Cash</h2>
              <p className={`text-3xl font-bold ${isSpendablePositive ? 'text-white' : 'text-red-200'}`}>
                {formatEUR(spendableBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Initial Balance Input */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <label className="block text-xs text-indigo-100 mb-1.5 font-semibold">Initial Balance</label>
          <div className="relative">
            <span className="absolute left-2 top-1.5 text-indigo-200 text-sm">€</span>
            <input
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => onInitialBalanceChange(parseFloat(e.target.value) || 0)}
              className="w-40 pl-6 pr-3 py-1.5 text-sm bg-white/20 border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Balance Breakdown */}
      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/20">
        <div>
          <p className="text-xs text-indigo-100 mb-1">Starting</p>
          <p className="text-lg font-semibold">{formatEUR(initialBalance)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={12} className="text-green-300" />
            <p className="text-xs text-indigo-100">Income</p>
          </div>
          <p className="text-lg font-semibold text-green-300">+{formatEUR(totalIncome)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown size={12} className="text-red-300" />
            <p className="text-xs text-indigo-100">Expenses</p>
          </div>
          <p className="text-lg font-semibold text-red-300">-{formatEUR(totalExpenses)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <PiggyBank size={12} className="text-yellow-300" />
            <p className="text-xs text-indigo-100">In Pots</p>
          </div>
          <p className="text-lg font-semibold text-yellow-300">{formatEUR(totalInSavingsPots)}</p>
        </div>
      </div>

      {/* Balance Status */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs text-indigo-100">
          {isSpendablePositive 
            ? `You have ${formatEUR(spendableBalance)} available to spend. ${totalInSavingsPots > 0 ? `Plus ${formatEUR(totalInSavingsPots)} saved in pots! 🎯` : 'Consider starting a savings pot! 💰'}` 
            : `You're ${formatEUR(Math.abs(spendableBalance))} in the red. Time to budget! ⚠️`
          }
        </p>
      </div>
    </div>
  )
}
