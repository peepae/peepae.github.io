'use client'

import { TrendingUp, TrendingDown, Calendar, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatEUR } from '../utils/formatters'

interface QuickStatsDashboardProps {
  netWorth: number
  spendableBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  totalBudget: number
  savingsRate: number
  daysInMonth: number
  dayOfMonth: number
}

export default function QuickStatsDashboard({
  netWorth,
  spendableBalance,
  monthlyIncome,
  monthlyExpenses,
  totalBudget,
  savingsRate,
  daysInMonth,
  dayOfMonth
}: QuickStatsDashboardProps) {
  const monthlySavings = monthlyIncome - monthlyExpenses
  const budgetUtilization = totalBudget > 0 ? (monthlyExpenses / totalBudget) * 100 : 0
  const timeProgress = (dayOfMonth / daysInMonth) * 100
  const spendingPace = budgetUtilization - timeProgress

  const getHealthScore = () => {
    let score = 100
    if (spendableBalance < 0) score -= 30
    if (savingsRate < 10) score -= 20
    if (spendingPace > 20) score -= 25
    if (budgetUtilization > 100) score -= 25
    return Math.max(0, score)
  }

  const healthScore = getHealthScore()
  const healthColor = healthScore >= 70 ? 'text-green-600 dark:text-green-400' : 
                      healthScore >= 40 ? 'text-orange-600 dark:text-orange-400' : 
                      'text-red-600 dark:text-red-400'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
      {/* Financial Health Score */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-4 text-white transition-all hover:shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          {healthScore >= 70 ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <h3 className="text-xs font-semibold uppercase opacity-90">Health</h3>
        </div>
        <p className="text-3xl font-bold">{healthScore}</p>
        <p className="text-xs opacity-80 mt-1">Financial Score</p>
      </div>

      {/* Savings Rate */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-4 text-white transition-all hover:shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} />
          <h3 className="text-xs font-semibold uppercase opacity-90">Savings</h3>
        </div>
        <p className="text-3xl font-bold">{savingsRate.toFixed(0)}%</p>
        <p className="text-xs opacity-80 mt-1">of income</p>
      </div>

      {/* Budget Utilization */}
      <div className={`bg-gradient-to-br ${budgetUtilization > 100 ? 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700' : 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700'} rounded-lg p-4 text-white transition-all hover:shadow-lg`}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown size={16} />
          <h3 className="text-xs font-semibold uppercase opacity-90">Budget</h3>
        </div>
        <p className="text-3xl font-bold">{budgetUtilization.toFixed(0)}%</p>
        <p className="text-xs opacity-80 mt-1">utilized</p>
      </div>

      {/* Spending Pace */}
      <div className={`bg-gradient-to-br ${Math.abs(spendingPace) > 20 ? 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700' : 'from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700'} rounded-lg p-4 text-white transition-all hover:shadow-lg`}>
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} />
          <h3 className="text-xs font-semibold uppercase opacity-90">Pace</h3>
        </div>
        <p className="text-3xl font-bold">{spendingPace > 0 ? '+' : ''}{spendingPace.toFixed(0)}%</p>
        <p className="text-xs opacity-80 mt-1">{spendingPace > 0 ? 'ahead' : 'on track'}</p>
      </div>

      {/* Monthly Savings */}
      <div className={`bg-gradient-to-br ${monthlySavings >= 0 ? 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700' : 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700'} rounded-lg p-4 text-white transition-all hover:shadow-lg`}>
        <div className="flex items-center gap-2 mb-2">
          {monthlySavings >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <h3 className="text-xs font-semibold uppercase opacity-90">Delta</h3>
        </div>
        <p className="text-2xl font-bold">{formatEUR(Math.abs(monthlySavings))}</p>
        <p className="text-xs opacity-80 mt-1">{monthlySavings >= 0 ? 'saved' : 'deficit'}</p>
      </div>

      {/* Run Rate */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-lg p-4 text-white transition-all hover:shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} />
          <h3 className="text-xs font-semibold uppercase opacity-90">Run Rate</h3>
        </div>
        <p className="text-2xl font-bold">{formatEUR(monthlyExpenses * 12)}</p>
        <p className="text-xs opacity-80 mt-1">yearly expenses</p>
      </div>
    </div>
  )
}
