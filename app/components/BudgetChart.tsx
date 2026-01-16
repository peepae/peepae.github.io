'use client'

import { Category } from './CategoryManager'
import { Transaction } from './TransactionTable'
import { formatEUR } from '../utils/formatters'

interface BudgetChartProps {
  categories: Category[]
  transactions: Transaction[]
}

export default function BudgetChart({ categories, transactions }: BudgetChartProps) {
  const getCategorySpending = (categoryId: string) => {
    return transactions
      .filter(t => t.categoryId === categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 w-full transition-all">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Budget vs. Actual</h2>
      
      <div className="space-y-6">
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            No categories to display. Add categories to see budget tracking.
          </p>
        ) : (
          categories.map((category) => {
            const actual = getCategorySpending(category.id)
            const budget = category.monthlyBudget
            const percentage = budget > 0 ? (actual / budget) * 100 : 0
            const isOverBudget = actual > budget
            const isNearLimit = percentage >= 80 && percentage <= 100

            // Traffic light logic
            let progressColor = 'bg-green-500 dark:bg-green-400'
            if (isOverBudget) {
              progressColor = 'bg-red-500 dark:bg-red-400'
            } else if (isNearLimit) {
              progressColor = 'bg-yellow-500 dark:bg-yellow-400'
            }

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold font-mono ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {formatEUR(actual)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400"> / {formatEUR(budget)}</span>
                  </div>
                </div>

                {/* Budget vs Actual Bar */}
                <div className="relative h-8 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                  {/* Budget line marker (gray background is the full budget) */}
                  <div 
                    className={`absolute inset-y-0 left-0 ${progressColor} transition-all duration-300 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-bold text-white drop-shadow">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  {percentage <= 15 && percentage > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 dark:text-slate-300">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Status message */}
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isOverBudget ? (
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        ⚠️ Over budget by {formatEUR(actual - budget)}
                      </span>
                    ) : isNearLimit ? (
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                        ⚡ Approaching limit ({(100 - percentage).toFixed(0)}% remaining)
                      </span>
                    ) : budget > 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ✓ {formatEUR(budget - actual)} remaining
                      </span>
                    ) : null}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
