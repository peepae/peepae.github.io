'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, DollarSign, Calendar, Check, X } from 'lucide-react'
import { formatEUR } from '../utils/formatters'

export interface SalaryEntry {
  id: string
  amount: number
  startDate: string // YYYY-MM-DD format
  currency: 'EUR'
}

interface SalaryManagerProps {
  salaryHistory: SalaryEntry[]
  onUpdateSalaryHistory: (history: SalaryEntry[]) => void
}

export default function SalaryManager({ salaryHistory, onUpdateSalaryHistory }: SalaryManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newSalary, setNewSalary] = useState('')
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editStartDate, setEditStartDate] = useState('')

  // Sort by date descending (most recent first)
  const sortedHistory = [...salaryHistory].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )

  const handleAddSalary = () => {
    const amount = parseFloat(newSalary)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid salary amount')
      return
    }

    const newEntry: SalaryEntry = {
      id: Date.now().toString(),
      amount,
      startDate: newStartDate,
      currency: 'EUR'
    }

    onUpdateSalaryHistory([...salaryHistory, newEntry])
    setNewSalary('')
    setNewStartDate(new Date().toISOString().split('T')[0])
    setIsAdding(false)
  }

  const handleEditSalary = (entry: SalaryEntry) => {
    setEditingId(entry.id)
    setEditAmount(entry.amount.toString())
    setEditStartDate(entry.startDate)
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    
    const amount = parseFloat(editAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid salary amount')
      return
    }

    const updated = salaryHistory.map(entry =>
      entry.id === editingId
        ? { ...entry, amount, startDate: editStartDate }
        : entry
    )
    onUpdateSalaryHistory(updated)
    setEditingId(null)
  }

  const handleDeleteSalary = (id: string) => {
    if (salaryHistory.length === 1) {
      alert('You must have at least one salary entry')
      return
    }
    
    if (confirm('Are you sure you want to delete this salary entry?')) {
      onUpdateSalaryHistory(salaryHistory.filter(entry => entry.id !== id))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }

  // Get the current active salary
  const currentSalary = sortedHistory[0]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="text-green-600 dark:text-green-400" size={24} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Salary Management</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Add Salary
          </button>
        )}
      </div>

      {/* Current Active Salary */}
      {currentSalary && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-6 border-2 border-green-200 dark:border-green-700">
          <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">Current Salary (Budget Ceiling)</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">
            {formatEUR(currentSalary.amount)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            Effective since {formatDate(currentSalary.startDate)}
          </p>
        </div>
      )}

      {/* Add New Salary Form */}
      {isAdding && (
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-600">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">New Salary Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Monthly Salary (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                placeholder="3500.00"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddSalary}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Check size={16} />
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewSalary('')
              }}
              className="bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Salary History */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salary History</h3>
        {sortedHistory.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">
            No salary entries yet. Add your first salary to get started.
          </p>
        ) : (
          sortedHistory.map((entry, index) => (
            <div
              key={entry.id}
              className={`bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border ${
                index === 0 
                  ? 'border-green-300 dark:border-green-600' 
                  : 'border-slate-200 dark:border-slate-600'
              }`}
            >
              {editingId === entry.id ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-800 dark:text-slate-100 text-sm"
                    />
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-800 dark:text-slate-100 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Check size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatEUR(entry.amount)}
                      </p>
                      {index === 0 && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <Calendar size={12} className="inline mr-1" />
                      Effective from {formatDate(entry.startDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditSalary(entry)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSalary(entry.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Delete"
                      disabled={salaryHistory.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
