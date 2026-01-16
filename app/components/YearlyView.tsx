import { useState } from 'react'
import { Calendar, Target, DollarSign } from 'lucide-react'
import { formatEUR, formatEURCompact } from '../utils/formatters'

interface YearlyViewProps {
  monthlySavings: number
  savingsGoal: number
  onSavingsGoalChange: (goal: number) => void
}

export default function YearlyView({ monthlySavings, savingsGoal, onSavingsGoalChange }: YearlyViewProps) {
  const [showDetails, setShowDetails] = useState(false)

  const yearlySavings = monthlySavings * 12
  
  // Calculate months to reach savings goal
  const monthsToGoal = monthlySavings > 0 
    ? Math.ceil(savingsGoal / monthlySavings)
    : Infinity

  const monthlyProjections = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2026, i).toLocaleString('en-US', { month: 'short' }),
    savings: monthlySavings
  }))

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg shadow-lg p-4 text-white w-full transition-all">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Calendar size={20} />
          Yearly Projection
        </h2>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="mb-6">
        <p className="text-blue-100 text-sm mb-1">Total Yearly Savings</p>
        <p className="text-5xl font-bold">
          {formatEUR(yearlySavings)}
        </p>
        <p className="text-blue-100 text-sm mt-2">
          Based on {formatEUR(monthlySavings)} monthly savings × 12 months
        </p>
      </div>

      {/* Savings Goal Tracker */}
      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm mb-3">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Target size={16} />
          Savings Goal Tracker
        </h3>
        <div className="mb-2">
          <label className="block text-xs text-blue-100 mb-1">Your Savings Goal (EUR)</label>
          <div className="relative">
            <span className="absolute left-2 top-1.5 text-blue-200 text-sm">€</span>
            <input
              type="number"
              step="100"
              value={savingsGoal}
              onChange={(e) => onSavingsGoalChange(parseFloat(e.target.value) || 0)}
              className="w-full pl-6 pr-3 py-1.5 text-sm bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
              placeholder="5000"
            />
          </div>
        </div>
        {monthlySavings > 0 ? (
          <div className="bg-white/10 rounded-lg p-2">
            <p className="text-xs text-blue-100 mb-0.5">At your current rate:</p>
            <p className="text-xl font-bold">
              {monthsToGoal === Infinity 
                ? 'N/A' 
                : `${monthsToGoal} month${monthsToGoal !== 1 ? 's' : ''}`}
            </p>
            <p className="text-xs text-blue-100 mt-0.5">to reach your goal of {formatEUR(savingsGoal)}</p>
            {monthsToGoal !== Infinity && (
              <p className="text-xs text-blue-200 mt-1">
                Expected: {new Date(new Date().setMonth(new Date().getMonth() + monthsToGoal)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-blue-100 bg-white/10 rounded-lg p-2">
            Start saving to see your projection!
          </p>
        )}
      </div>

      {/* Month-by-Month Breakdown */}
      {showDetails && (
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <h3 className="text-sm font-semibold mb-2">Month-by-Month Breakdown</h3>
          <div className="grid grid-cols-3 gap-2">
            {monthlyProjections.map((month, idx) => (
              <div key={idx} className="bg-white/10 rounded-lg p-2 text-center">
                <p className="text-xs text-blue-100 mb-0.5">{month.month}</p>
                <p className="text-sm font-bold">{formatEURCompact(month.savings)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
