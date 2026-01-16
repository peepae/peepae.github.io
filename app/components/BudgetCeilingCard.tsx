'use client'

import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Target, Zap } from 'lucide-react'
import { formatEUR } from '../utils/formatters'

interface BudgetCeilingCardProps {
  currentMonthSalary: number
  totalBudgetAllocated: number
  leftoverBudget: number
  overBudgeted: boolean
  categories: Array<{ name: string; monthlyBudget: number; color: string; isArchived?: boolean }>
}

export default function BudgetCeilingCard({
  currentMonthSalary,
  totalBudgetAllocated,
  leftoverBudget,
  overBudgeted,
  categories
}: BudgetCeilingCardProps) {
  const allocationPercentage = currentMonthSalary > 0 
    ? Math.min((totalBudgetAllocated / currentMonthSalary) * 100, 100) 
    : 0

  const activeCategories = categories.filter(c => !c.isArchived)
  const topCategories = [...activeCategories]
    .sort((a, b) => b.monthlyBudget - a.monthlyBudget)
    .slice(0, 5)

  const getStatusIcon = () => {
    if (overBudgeted) return <AlertCircle className="text-red-500" size={28} />
    if (leftoverBudget === 0) return <CheckCircle className="text-green-500" size={28} />
    if (allocationPercentage >= 90) return <Target className="text-orange-500" size={28} />
    return <Zap className="text-blue-500" size={28} />
  }

  const getStatusMessage = () => {
    if (overBudgeted) return 'Over-budgeted! Reduce category allocations.'
    if (leftoverBudget === 0) return 'Perfect! 100% of salary allocated.'
    if (allocationPercentage >= 90) return 'Almost there! A little more to allocate.'
    if (allocationPercentage >= 50) return 'Good progress on budget allocation.'
    return 'You have significant unallocated budget.'
  }

  const getStatusColor = () => {
    if (overBudgeted) return 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10'
    if (leftoverBudget === 0) return 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
    if (allocationPercentage >= 90) return 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10'
    return 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10'
  }

  return (
    <div className={`mb-6 rounded-xl shadow-lg p-6 border-2 transition-all ${getStatusColor()}`}>
      {/* Header with Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            {getStatusIcon()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Budget Ceiling Overview</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{getStatusMessage()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Allocation</p>
          <p className={`text-2xl font-bold ${
            overBudgeted 
              ? 'text-red-600 dark:text-red-400' 
              : allocationPercentage === 100 
              ? 'text-green-600 dark:text-green-400'
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {allocationPercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
          <div 
            className={`h-full transition-all duration-500 ${
              overBudgeted 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : allocationPercentage === 100
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}
            style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
          >
            {allocationPercentage > 10 && (
              <span className="absolute left-2 top-0 bottom-0 flex items-center text-xs font-semibold text-white">
                {formatEUR(totalBudgetAllocated)}
              </span>
            )}
          </div>
          {overBudgeted && (
            <div 
              className="absolute top-0 h-full bg-red-600/30 border-l-2 border-red-600 dark:border-red-400"
              style={{ left: '100%', width: `${(allocationPercentage - 100)}%` }}
            />
          )}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-600 dark:text-slate-400">
          <span>€0</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Salary: {formatEUR(currentMonthSalary)}
          </span>
        </div>
      </div>

      {/* Three Column Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Salary (Ceiling)</p>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatEUR(currentMonthSalary)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your monthly limit</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={overBudgeted ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'} size={20} />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Allocated</p>
          </div>
          <p className={`text-2xl font-bold ${overBudgeted ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {formatEUR(totalBudgetAllocated)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            To {activeCategories.length} categor{activeCategories.length === 1 ? 'y' : 'ies'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className={leftoverBudget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} size={20} />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              {leftoverBudget >= 0 ? 'Remaining' : 'Over By'}
            </p>
          </div>
          <p className={`text-2xl font-bold ${leftoverBudget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatEUR(Math.abs(leftoverBudget))}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {leftoverBudget >= 0 ? 'Ready to allocate' : 'Need to reduce'}
          </p>
        </div>
      </div>

      {/* Top 5 Categories Breakdown */}
      {topCategories.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Top Budget Categories
          </h3>
          <div className="space-y-2">
            {topCategories.map((category) => {
              const categoryPercentage = currentMonthSalary > 0 
                ? (category.monthlyBudget / currentMonthSalary) * 100 
                : 0
              
              return (
                <div key={category.name} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {category.name}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 ml-2">
                        {formatEUR(category.monthlyBudget)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(categoryPercentage, 100)}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-right">
                        {categoryPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {activeCategories.length > 5 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
              +{activeCategories.length - 5} more categor{activeCategories.length - 5 === 1 ? 'y' : 'ies'}
            </p>
          )}
        </div>
      )}

      {/* No Salary Warning */}
      {currentMonthSalary === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">No Salary Set</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Add your monthly salary in Settings → Manage Salary History to set your budget ceiling
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
