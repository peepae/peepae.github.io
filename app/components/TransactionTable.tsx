'use client'

import { useState } from 'react'
import { Trash2, RefreshCw, Search, Download } from 'lucide-react'
import { Category } from './CategoryManager'
import { formatEUR } from '../utils/formatters'

export interface Transaction {
  id: string
  name: string
  amount: number
  categoryId: string
  type: 'income' | 'expense'
  date: string
  isRecurring?: boolean
}

interface TransactionTableProps {
  transactions: Transaction[]
  categories: Category[]
  currentMonth: string
  onDeleteTransaction: (id: string) => void
}

export default function TransactionTable({ 
  transactions, 
  categories,
  currentMonth,
  onDeleteTransaction 
}: TransactionTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchQuery.toLowerCase()
    const categoryName = getCategoryName(t.categoryId).toLowerCase()
    return t.name.toLowerCase().includes(searchLower) || 
           categoryName.includes(searchLower)
  })

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      onDeleteTransaction(id)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized'
  }

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#9CA3AF'
  }

  const downloadCSV = () => {
    const headers = ['Date', 'Name', 'Category', 'Type', 'Amount', 'Recurring']
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('en-US'),
      t.name,
      getCategoryName(t.categoryId),
      t.type,
      t.amount.toFixed(2),
      t.isRecurring ? 'Yes' : 'No'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${currentMonth}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 w-full transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Transactions</h2>
        {filteredTransactions.length > 0 && (
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
          >
            <Download size={16} />
            Export CSV
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            placeholder="Search transactions..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            {searchQuery ? 'No transactions found.' : 'No transactions yet.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                <th className="text-right py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                <th className="text-center py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-slate-100 font-medium">
                        {transaction.name}
                      </span>
                      {transaction.isRecurring && (
                        <span title="Recurring">
                          <RefreshCw size={14} className="text-blue-600 dark:text-blue-400" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                      />
                      <span className="text-slate-700 dark:text-slate-300 text-xs">
                        {getCategoryName(transaction.categoryId)}
                      </span>
                    </div>
                  </td>
                  <td className={`py-3 px-2 text-right font-semibold ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatEUR(transaction.amount)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleDeleteClick(transaction.id)}
                      className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded transition-all ${
                        deleteConfirmId === transaction.id
                          ? 'bg-red-500 hover:bg-red-600 text-white text-xs font-semibold'
                          : 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                      }`}
                      title={deleteConfirmId === transaction.id ? 'Click again to confirm' : 'Delete'}
                    >
                      {deleteConfirmId === transaction.id ? (
                        'Confirm?'
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
