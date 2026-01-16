'use client'

import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { formatEUR } from '../utils/formatters'

interface SummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  monthlySavings: number
}

export default function SummaryCards({ totalIncome, totalExpenses, monthlySavings }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase">Total Monthly Income</h3>
          <TrendingUp className="text-green-500" size={24} />
        </div>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatEUR(totalIncome)}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase">Total Monthly Expenses</h3>
          <TrendingDown className="text-red-500" size={24} />
        </div>
        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatEUR(totalExpenses)}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase">Monthly Savings</h3>
          <PiggyBank className="text-blue-500" size={24} />
        </div>
        <p className={`text-3xl font-bold ${monthlySavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
          {formatEUR(monthlySavings)}
        </p>
      </div>
    </div>
  )
}
