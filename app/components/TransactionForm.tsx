import { useState } from 'react'
import { Plus, DollarSign, RefreshCw } from 'lucide-react'

export type TransactionType = 'income' | 'expense'

interface Category {
  id: string
  name: string
  monthlyBudget: number
  color: string
}

interface TransactionFormProps {
  categories: Category[]
  onAddTransaction: (transaction: {
    name: string
    amount: number
    categoryId: string
    type: TransactionType
    isRecurring: boolean
  }) => void
}

export default function TransactionForm({ categories, onAddTransaction }: TransactionFormProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [isRecurring, setIsRecurring] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !categoryId) return

    onAddTransaction({
      name,
      amount: parseFloat(amount),
      categoryId,
      type,
      isRecurring
    })

    setName('')
    setAmount('')
    setIsRecurring(false)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 w-full transition-all">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Plus className="text-blue-600 dark:text-blue-400" size={28} />
        Add Transaction
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            placeholder="e.g., Monthly Salary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount (EUR)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500">€</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="income"
                checked={type === 'income'}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="mr-2 w-4 h-4 text-blue-600"
              />
              <span className="text-slate-700 dark:text-slate-300">Income</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="expense"
                checked={type === 'expense'}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="mr-2 w-4 h-4 text-blue-600"
              />
              <span className="text-slate-700 dark:text-slate-300">Expense</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 rounded"
            />
            <RefreshCw size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Recurring Transaction</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">
            Will automatically appear in future months
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Transaction
        </button>
      </form>
    </div>
  )
}
