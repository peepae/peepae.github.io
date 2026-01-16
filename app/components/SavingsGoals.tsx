'use client'

import { useState } from 'react'
import { Target, Plus, Edit2, Trash2, Check, X, PiggyBank, TrendingUp } from 'lucide-react'
import { formatEUR } from '../utils/formatters'
import { SavingsPot } from '../page'

interface SavingsGoalsProps {
  savingsPots: SavingsPot[]
  onUpdatePots: (pots: SavingsPot[]) => void
  spendableBalance: number
}

const DEFAULT_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#84cc16', // lime
]

export default function SavingsGoals({ savingsPots, onUpdatePots, spendableBalance }: SavingsGoalsProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fundingId, setFundingId] = useState<string | null>(null)
  
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0])
  
  const [editName, setEditName] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [editColor, setEditColor] = useState('')
  
  const [fundAmount, setFundAmount] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleAdd = () => {
    if (!newName.trim() || !newTarget) return

    const newPot: SavingsPot = {
      id: `pot-${Date.now()}`,
      name: newName.trim(),
      targetAmount: parseFloat(newTarget),
      currentAmount: 0,
      color: newColor,
      createdDate: new Date().toISOString()
    }

    onUpdatePots([...savingsPots, newPot])
    setNewName('')
    setNewTarget('')
    setNewColor(DEFAULT_COLORS[0])
    setIsAdding(false)
  }

  const handleEdit = (pot: SavingsPot) => {
    setEditingId(pot.id)
    setEditName(pot.name)
    setEditTarget(pot.targetAmount.toString())
    setEditColor(pot.color)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return

    const updated = savingsPots.map(pot =>
      pot.id === editingId
        ? { ...pot, name: editName.trim(), targetAmount: parseFloat(editTarget) || 0, color: editColor }
        : pot
    )

    onUpdatePots(updated)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      const updated = savingsPots.filter(pot => pot.id !== id)
      onUpdatePots(updated)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  const handleFund = (potId: string) => {
    const amount = parseFloat(fundAmount)
    if (!amount || amount <= 0) return

    if (amount > spendableBalance) {
      alert(`Insufficient funds! You only have ${formatEUR(spendableBalance)} available.`)
      return
    }

    const updated = savingsPots.map(pot =>
      pot.id === potId
        ? { ...pot, currentAmount: Math.min(pot.currentAmount + amount, pot.targetAmount) }
        : pot
    )

    onUpdatePots(updated)
    setFundAmount('')
    setFundingId(null)
  }

  const handleWithdraw = (potId: string) => {
    const amount = parseFloat(fundAmount)
    if (!amount || amount <= 0) return

    const pot = savingsPots.find(p => p.id === potId)
    if (!pot) return

    if (amount > pot.currentAmount) {
      alert(`Cannot withdraw more than ${formatEUR(pot.currentAmount)} from this pot.`)
      return
    }

    const updated = savingsPots.map(p =>
      p.id === potId
        ? { ...p, currentAmount: Math.max(p.currentAmount - amount, 0) }
        : p
    )

    onUpdatePots(updated)
    setFundAmount('')
    setFundingId(null)
  }

  const totalSaved = savingsPots.reduce((sum, pot) => sum + pot.currentAmount, 0)
  const totalTargets = savingsPots.reduce((sum, pot) => sum + pot.targetAmount, 0)
  const overallProgress = totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 w-full transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PiggyBank className="text-green-600 dark:text-green-400" size={20} />
            Savings Pots
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {formatEUR(totalSaved)} saved of {formatEUR(totalTargets)} total goals
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs font-medium"
          >
            <Plus size={14} />
            Add Pot
          </button>
        )}
      </div>

      {/* Overall Progress */}
      {savingsPots.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-800 dark:text-green-300">Overall Progress</span>
            <span className="text-xs font-bold text-green-600 dark:text-green-400">{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-green-200 dark:bg-green-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Add New Pot Form */}
      {isAdding && (
        <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">New Savings Pot</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="Pot name (e.g., Vacation Fund)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Target amount (€)"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex gap-1.5 items-center mb-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-8 h-7 rounded cursor-pointer"
            />
            <div className="flex-1 flex gap-1 flex-wrap">
              {DEFAULT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Check size={14} />
              Create
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewName('')
                setNewTarget('')
                setNewColor(DEFAULT_COLORS[0])
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100 rounded-lg text-xs font-medium transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Savings Pots List */}
      <div className="space-y-2">
        {savingsPots.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
            No savings pots yet. Create one to start saving!
          </p>
        ) : (
          savingsPots.map((pot) => {
            const progress = pot.targetAmount > 0 ? (pot.currentAmount / pot.targetAmount) * 100 : 0
            const isComplete = pot.currentAmount >= pot.targetAmount

            return (
              <div
                key={pot.id}
                className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                {editingId === pot.id ? (
                  // Edit Mode
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editTarget}
                      onChange={(e) => setEditTarget(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <div className="flex gap-1">
                      {DEFAULT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setEditColor(color)}
                          className={`w-5 h-5 rounded border ${editColor === color ? 'ring-2 ring-green-500 scale-110' : 'border-slate-300'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                      >
                        <Check size={14} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-slate-500 hover:bg-slate-600 text-white rounded text-xs font-medium"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : fundingId === pot.id ? (
                  // Funding Mode
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pot.color }} />
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{pot.name}</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="Amount (€)"
                      className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFund(pot.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                      >
                        <TrendingUp size={14} />
                        Add Money
                      </button>
                      <button
                        onClick={() => handleWithdraw(pot.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-medium"
                      >
                        <TrendingUp size={14} className="rotate-180" />
                        Withdraw
                      </button>
                      <button
                        onClick={() => {
                          setFundingId(null)
                          setFundAmount('')
                        }}
                        className="px-2 py-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100 rounded text-xs font-medium"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pot.color }} />
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{pot.name}</span>
                        {isComplete && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">✓ Goal Reached!</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setFundingId(pot.id)}
                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="Add/Withdraw money"
                        >
                          <PiggyBank size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(pot)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(pot.id)}
                          className={`p-1 rounded transition-colors ${
                            deleteConfirmId === pot.id
                              ? 'bg-red-600 text-white px-1.5'
                              : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                        >
                          {deleteConfirmId === pot.id ? (
                            <span className="text-xs font-semibold">OK?</span>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatEUR(pot.currentAmount)} / {formatEUR(pot.targetAmount)}
                        </span>
                        <span className="text-xs font-bold" style={{ color: pot.color }}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: pot.color
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {pot.targetAmount - pot.currentAmount > 0
                        ? `${formatEUR(pot.targetAmount - pot.currentAmount)} to go`
                        : 'Target reached! 🎉'}
                    </p>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
