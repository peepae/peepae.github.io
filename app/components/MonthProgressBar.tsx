'use client'

import { Calendar, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatEUR } from '../utils/formatters'

interface MonthProgressBarProps {
  totalBudget: number
  totalSpent: number
  currentMonth: string
}

export default function MonthProgressBar({ totalBudget, totalSpent, currentMonth }: MonthProgressBarProps) {
  // Calculate day of month and total days in month
  const now = new Date()
  const [year, month] = currentMonth.split('-').map(Number)
  const currentDate = new Date(year, month - 1)
  
  // Check if we're viewing the current month
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month - 1
  
  // If viewing current month, use actual day; otherwise use full month
  const dayOfMonth = isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate()
  const daysInMonth = new Date(year, month, 0).getDate()
  
  const timeProgress = (dayOfMonth / daysInMonth) * 100
  const spendProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  
  // Determine status
  let status: 'good' | 'warning' | 'danger' = 'good'
  let statusMessage = ''
  
  if (spendProgress > timeProgress + 20) {
    status = 'danger'
    statusMessage = 'Spending too fast!'
  } else if (spendProgress > timeProgress + 10) {
    status = 'warning'
    statusMessage = 'Watch your spending'
  } else {
    status = 'good'
    statusMessage = 'On track'
  }
  
  const statusColors = {
    good: {
      bg: 'bg-green-500',
      text: 'text-green-700',
      border: 'border-green-300',
      icon: <TrendingUp size={16} />
    },
    warning: {
      bg: 'bg-orange-500',
      text: 'text-orange-700',
      border: 'border-orange-300',
      icon: <AlertTriangle size={16} />
    },
    danger: {
      bg: 'bg-red-500',
      text: 'text-red-700',
      border: 'border-red-300',
      icon: <AlertTriangle size={16} />
    }
  }
  
  const remaining = totalBudget - totalSpent
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-slate-600 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Month Progress</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusColors[status].border} bg-${status === 'good' ? 'green' : status === 'warning' ? 'orange' : 'red'}-50 dark:bg-slate-700`}>
          {statusColors[status].icon}
          <span className={`text-xs font-semibold ${statusColors[status].text} dark:text-slate-200`}>
            {statusMessage}
          </span>
        </div>
      </div>

      {/* Time Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-600 dark:text-slate-400">Time Elapsed</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {dayOfMonth} / {daysInMonth} days ({timeProgress.toFixed(0)}%)
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 dark:bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(timeProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Spend Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-600 dark:text-slate-400">Budget Spent</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {formatEUR(totalSpent)} / {formatEUR(totalBudget)} ({spendProgress.toFixed(0)}%)
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${statusColors[status].bg} transition-all duration-300 rounded-full`}
            style={{ width: `${Math.min(spendProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs text-slate-600 dark:text-slate-400">Remaining Budget</span>
        <span className={`text-sm font-bold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {formatEUR(remaining)}
        </span>
      </div>
    </div>
  )
}
