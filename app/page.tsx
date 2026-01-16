'use client'

import { useState, useEffect } from 'react'
import { 
  Wallet, 
  Settings,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Home,
  Moon,
  Sun,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Trash2
} from 'lucide-react'

// Import components
import BalanceCard from './components/BalanceCard'
import SummaryCards from './components/SummaryCards'
import TransactionForm from './components/TransactionForm'
import TransactionTable, { Transaction } from './components/TransactionTable'
import CategoryManager, { Category } from './components/CategoryManager'
import YearlyView from './components/YearlyView'
import BudgetChart from './components/BudgetChart'
import SavingsGoals from './components/SavingsGoals'
import MonthProgressBar from './components/MonthProgressBar'
import ToastNotification, { useToast } from './components/ToastNotification'
import QuickStatsDashboard from './components/QuickStatsDashboard'
import SalaryManager, { SalaryEntry } from './components/SalaryManager'
import BudgetCeilingCard from './components/BudgetCeilingCard'
import { formatEUR, getActiveSalary, getTotalBudgetAllocated, getLeftoverBudget, isOverBudgeted } from './utils/formatters'

// Types
export interface SavingsPot {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  color: string
  createdDate: string
}

interface MonthData {
  transactions: Transaction[]
  monthStartBalance?: number
}

interface BudgetData {
  monthlyData: Record<string, MonthData>
  categories: Category[]
  savingsGoal: number
  initialBalance: number
  savingsPots: SavingsPot[]
  salaryHistory: SalaryEntry[]
}

// Note: Uncategorized is no longer a default category.
// Users must categorize all transactions or create their own 'Uncategorized' if needed.

// Storage API with validation and auto-backup
const storageAPI = {
  getData: (): BudgetData => {
    if (typeof window === 'undefined') return { 
      monthlyData: {}, 
      categories: [],
      savingsGoal: 5000,
      initialBalance: 0,
      savingsPots: [],
      salaryHistory: []
    }
    try {
      const data = localStorage.getItem('budgetDataV2')
      if (!data) {
        return {
          monthlyData: {},
          categories: [],
          savingsGoal: 5000,
          initialBalance: 0,
          savingsPots: [],
          salaryHistory: []
        }
      }
      const parsed = JSON.parse(data)
      // Validate structure
      if (!parsed.categories || !Array.isArray(parsed.categories)) {
        parsed.categories = []
      }
      if (!parsed.monthlyData || typeof parsed.monthlyData !== 'object') {
        parsed.monthlyData = {}
      }
      if (!parsed.salaryHistory || !Array.isArray(parsed.salaryHistory)) {
        parsed.salaryHistory = []
      }
      return parsed
    } catch (error) {
      console.error('Error loading data:', error)
      return {
        monthlyData: {},
        categories: [],
        savingsGoal: 5000,
        initialBalance: 0,
        savingsPots: [],
        salaryHistory: []
      }
    }
  },
  
  saveData: (data: BudgetData) => {
    if (typeof window !== 'undefined') {
      try {
        // Main save
        localStorage.setItem('budgetDataV2', JSON.stringify(data))
        
        // Auto-backup (keep last 3 backups)
        const backups = JSON.parse(localStorage.getItem('budgetBackups') || '[]')
        const newBackup = {
          timestamp: new Date().toISOString(),
          data: data
        }
        backups.unshift(newBackup)
        // Keep only last 3 backups
        const trimmedBackups = backups.slice(0, 3)
        localStorage.setItem('budgetBackups', JSON.stringify(trimmedBackups))
        
        // Update last save time
        localStorage.setItem('lastSaveTime', new Date().toISOString())
      } catch (error) {
        console.error('Error saving data:', error)
      }
    }
  },
  
  getBackups: () => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('budgetBackups') || '[]')
    } catch {
      return []
    }
  },
  
  restoreBackup: (timestamp: string) => {
    if (typeof window === 'undefined') return null
    try {
      const backups = JSON.parse(localStorage.getItem('budgetBackups') || '[]')
      const backup = backups.find((b: any) => b.timestamp === timestamp)
      return backup?.data || null
    } catch {
      return null
    }
  },
  
  getLastSaveTime: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('lastSaveTime')
  }
}

// Helper functions
const getMonthKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const getMonthDisplay = (monthKey: string): string => {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function BudgetApp() {
  const [currentMonth, setCurrentMonth] = useState(getMonthKey(new Date()))
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [savingsGoal, setSavingsGoal] = useState(5000)
  const [initialBalance, setInitialBalance] = useState(0)
  const [savingsPots, setSavingsPots] = useState<SavingsPot[]>([])
  const [salaryHistory, setSalaryHistory] = useState<SalaryEntry[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showSalaryManager, setShowSalaryManager] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showQuickStats, setShowQuickStats] = useState(true)
  const { toasts, showToast, removeToast } = useToast()

  // Load data and dark mode preference
  useEffect(() => {
    const data = storageAPI.getData()
    setMonthlyData(data.monthlyData)
    setCategories(data.categories || [])
    setSavingsGoal(data.savingsGoal)
    setInitialBalance(data.initialBalance || 0)
    setSavingsPots(data.savingsPots || [])
    setSalaryHistory(data.salaryHistory || [])
    
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
    }

    const savedQuickStats = localStorage.getItem('showQuickStats')
    if (savedQuickStats !== null) {
      setShowQuickStats(savedQuickStats === 'true')
    }

    showToast('Data loaded successfully', 'success')
  }, [])

  // Save data with notification
  useEffect(() => {
    if (Object.keys(monthlyData).length > 0 || categories.length > 0 || salaryHistory.length > 0) {
      storageAPI.saveData({ monthlyData, categories, savingsGoal, initialBalance, savingsPots, salaryHistory })
      const lastSave = storageAPI.getLastSaveTime()
      if (lastSave) {
        console.log('Auto-saved at:', new Date(lastSave).toLocaleTimeString())
      }
    }
  }, [monthlyData, categories, savingsGoal, initialBalance, savingsPots, salaryHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Force save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        storageAPI.saveData({ monthlyData, categories, savingsGoal, initialBalance, savingsPots, salaryHistory })
        showToast('Data saved manually', 'success')
      }
      // Ctrl/Cmd + B: Toggle Quick Stats
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setShowQuickStats(prev => {
          const newValue = !prev
          localStorage.setItem('showQuickStats', String(newValue))
          return newValue
        })
      }
      // Ctrl/Cmd + ,: Toggle Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        setShowSettings(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [monthlyData, categories, savingsGoal, initialBalance, savingsPots, salaryHistory])

  // Note: Category sync removed - transactions with deleted categories will show as "Needs Category"
  // Users must manually re-categorize orphaned transactions

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('darkMode', (!darkMode).toString())
  }

  // Get current month's transactions
  const transactions = monthlyData[currentMonth]?.transactions || []

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlySavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0

  // Calculate total monthly budget from all non-archived categories
  const totalMonthlyBudget = categories
    .filter(c => !c.isArchived)
    .reduce((sum, c) => sum + c.monthlyBudget, 0)

  // Get previous month data for trend
  const getPreviousMonth = (monthKey: string): string => {
    const [year, month] = monthKey.split('-').map(Number)
    const date = new Date(year, month - 1)
    date.setMonth(date.getMonth() - 1)
    return getMonthKey(date)
  }

  const previousMonthKey = getPreviousMonth(currentMonth)
  const previousMonthTransactions = monthlyData[previousMonthKey]?.transactions || []
  const previousMonthExpenses = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenseTrend = previousMonthExpenses > 0 
    ? ((totalExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
    : 0

  // Calculate total balance across all time
  const calculateTotalBalance = (): { 
    totalIncome: number
    totalExpenses: number
    totalInSavingsPots: number
    netWorth: number
    spendableBalance: number
  } => {
    let allTimeIncome = 0
    let allTimeExpenses = 0

    Object.values(monthlyData).forEach(month => {
      month.transactions.forEach(t => {
        if (t.type === 'income') {
          allTimeIncome += t.amount
        } else {
          allTimeExpenses += t.amount
        }
      })
    })

    const totalInSavingsPots = savingsPots.reduce((sum, pot) => sum + pot.currentAmount, 0)
    const netWorth = initialBalance + allTimeIncome - allTimeExpenses
    const spendableBalance = netWorth - totalInSavingsPots

    return { 
      totalIncome: allTimeIncome, 
      totalExpenses: allTimeExpenses, 
      totalInSavingsPots,
      netWorth,
      spendableBalance
    }
  }

  const { 
    totalIncome: allTimeIncome, 
    totalExpenses: allTimeExpenses, 
    totalInSavingsPots,
    netWorth,
    spendableBalance
  } = calculateTotalBalance()

  // SALARY-BASED BUDGET CEILING LOGIC
  const currentMonthSalary = getActiveSalary(salaryHistory, currentMonth)
  const totalBudgetAllocated = getTotalBudgetAllocated(categories)
  const leftoverBudget = getLeftoverBudget(currentMonthSalary, categories)
  const overBudgeted = isOverBudgeted(currentMonthSalary, categories)
  const overBudgetAmount = overBudgeted ? Math.abs(leftoverBudget) : 0

  // Detect uncategorized transactions
  const categoryIds = new Set(categories.map(c => c.id))
  const uncategorizedTransactions = transactions.filter(t => !categoryIds.has(t.categoryId))
  const hasUncategorizedTransactions = uncategorizedTransactions.length > 0

  // Month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number)
    const currentDate = new Date(year, month - 1)
    
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1)
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    
    const newMonthKey = getMonthKey(currentDate)
    
    // Calculate current month's leftover (for rollover when going to next month)
    const currentMonthTransactions = monthlyData[currentMonth]?.transactions || []
    const currentMonthIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const currentMonthExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const currentMonthLeftover = currentMonthIncome - currentMonthExpenses
    
    // Auto-copy recurring transactions and set starting balance for new month
    if (!monthlyData[newMonthKey]) {
      const recurringTransactions = (monthlyData[currentMonth]?.transactions || [])
        .filter(t => t.isRecurring)
        .map(t => ({
          ...t,
          id: `${Date.now()}-${Math.random()}`,
          date: new Date().toISOString()
        }))
      
      // Calculate the starting balance for the new month
      // If going forward (next), add the current month's leftover to the starting balance
      let monthStartBalance = monthlyData[currentMonth]?.monthStartBalance || 0
      
      if (direction === 'next') {
        monthStartBalance = (monthlyData[currentMonth]?.monthStartBalance || 0) + currentMonthLeftover
      }
      
      setMonthlyData({
        ...monthlyData,
        [newMonthKey]: { 
          transactions: recurringTransactions,
          monthStartBalance: monthStartBalance
        }
      })
    }
    
    setCurrentMonth(newMonthKey)
  }

  // Go to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(getMonthKey(new Date()))
  }

  // Transaction handlers
  const addTransaction = (transaction: {
    name: string
    amount: number
    categoryId: string
    type: 'income' | 'expense'
    isRecurring: boolean
  }) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: transaction.name,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      type: transaction.type,
      isRecurring: transaction.isRecurring,
      date: new Date().toISOString()
    }

    const updatedMonthData = {
      ...monthlyData,
      [currentMonth]: {
        transactions: [newTransaction, ...(monthlyData[currentMonth]?.transactions || [])]
      }
    }

    setMonthlyData(updatedMonthData)
    showToast(`${transaction.type === 'income' ? 'Income' : 'Expense'} added: ${formatEUR(transaction.amount)}`, 'success')
  }

  const deleteTransaction = (id: string) => {
    const transaction = (monthlyData[currentMonth]?.transactions || []).find(t => t.id === id)
    const updatedMonthData = {
      ...monthlyData,
      [currentMonth]: {
        transactions: (monthlyData[currentMonth]?.transactions || []).filter(t => t.id !== id)
      }
    }
    setMonthlyData(updatedMonthData)
    if (transaction) {
      showToast(`Deleted: ${transaction.name}`, 'info')
    }
  }

  // Category handlers
  const updateCategories = (newCategories: Category[]) => {
    setCategories(newCategories)
  }

  // Data export
  const downloadData = (format: 'json') => {
    const dataStr = JSON.stringify({ monthlyData, categories, savingsGoal, initialBalance, savingsPots }, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `budget-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  // Data import
  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string)
          
          // Validate the structure
          if (!imported.monthlyData || !imported.categories) {
            alert('Invalid backup file format')
            return
          }

          // Confirm before overwriting
          if (confirm('This will replace all your current data. Continue?')) {
            setMonthlyData(imported.monthlyData || {})
            setCategories(imported.categories?.length > 0 ? imported.categories : [UNCATEGORIZED_CATEGORY])
            setSavingsGoal(imported.savingsGoal || 5000)
            setInitialBalance(imported.initialBalance || 0)
            setSavingsPots(imported.savingsPots || [])
            showToast('Data imported successfully!', 'success')
          }
        } catch (error) {
          showToast('Failed to import data. Invalid JSON file.', 'error')
          console.error(error)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const exportYearlyCSV = () => {
    const currentYear = new Date().getFullYear()
    const allTransactions: Transaction[] = []

    // Collect all transactions from the current year
    Object.entries(monthlyData).forEach(([monthKey, data]) => {
      const [year] = monthKey.split('-').map(Number)
      if (year === currentYear) {
        allTransactions.push(...data.transactions)
      }
    })

    if (allTransactions.length === 0) {
      alert('No transactions found for the current year.')
      return
    }

    // Sort by date
    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const getCategoryName = (categoryId: string) => {
      return categories.find(c => c.id === categoryId)?.name || 'Uncategorized'
    }

    const headers = ['Date', 'Name', 'Category', 'Type', 'Amount (EUR)', 'Recurring', 'Month']
    const rows = allTransactions.map(t => [
      new Date(t.date).toLocaleDateString('en-US'),
      t.name,
      getCategoryName(t.categoryId),
      t.type,
      t.amount.toFixed(2),
      t.isRecurring ? 'Yes' : 'No',
      new Date(t.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-transactions-${currentYear}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    const confirmFirst = confirm('⚠️ WARNING: This will delete ALL your budget data!\n\nAre you absolutely sure you want to continue?')
    if (!confirmFirst) return

    const confirmSecond = confirm('🚨 FINAL WARNING: This action CANNOT be undone!\n\nAll transactions, categories, and settings will be permanently deleted.\n\nClick OK to proceed with deletion.')
    if (!confirmSecond) return

    // Clear all data
    localStorage.removeItem('budgetDataV2')
    localStorage.removeItem('darkMode')
    
    // Reset state
    setMonthlyData({})
    setCategories([])
    setSalaryHistory([])
    setSavingsGoal(5000)
    setInitialBalance(0)
    setCurrentMonth(getMonthKey(new Date()))
    
    showToast('All data cleared. Starting fresh!', 'info')
  }

  return (
    <>
      <ToastNotification toasts={toasts} onRemove={removeToast} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-all">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          {/* Header - Warning if over-budgeted */}
          <div className="mb-6 md:mb-8">
            {overBudgeted && (
              <div className="bg-red-600 text-white px-6 py-4 rounded-lg mb-4 flex items-center gap-3 shadow-lg animate-pulse">
                <div className="text-3xl">🚨</div>
                <div>
                  <p className="font-bold text-lg">OVER-BUDGETED!</p>
                  <p className="text-sm">You have allocated {formatEUR(overBudgetAmount)} more than your salary of {formatEUR(currentMonthSalary)}</p>
                </div>
              </div>
            )}
            {hasUncategorizedTransactions && (
              <div className="bg-orange-500 text-white px-6 py-4 rounded-lg mb-4 flex items-center gap-3 shadow-lg">
                <div className="text-3xl">⚠️</div>
                <div>
                  <p className="font-bold text-lg">Uncategorized Transactions!</p>
                  <p className="text-sm">{uncategorizedTransactions.length} transaction(s) need to be categorized</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1 flex items-center gap-2 md:gap-3">
                <Wallet className="text-blue-600 dark:text-blue-400" size={28} />
                Budget Manager
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Salary-as-a-Ceiling Budget System</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                💡 Ctrl+S: Save | Ctrl+B: Toggle Stats | Ctrl+,: Settings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newValue = !showQuickStats
                  setShowQuickStats(newValue)
                  localStorage.setItem('showQuickStats', String(newValue))
                  showToast(newValue ? 'Quick Stats enabled' : 'Quick Stats hidden', 'info')
                }}
                className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-2"
                title="Toggle Quick Stats (Ctrl+B)"
              >
                <TrendingUp size={18} />
              </button>
              <button
                onClick={toggleDarkMode}
                className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-2"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-2"
                title="Settings (Ctrl+,)"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="text-center flex flex-col items-center gap-2">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold tracking-wide">Current Period</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
                {getMonthDisplay(currentMonth)}
              </p>
              {currentMonth !== getMonthKey(new Date()) && (
                <button
                  onClick={goToCurrentMonth}
                  className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-1 px-3 rounded-lg transition-all flex items-center gap-1"
                >
                  <Home size={14} />
                  Today
                </button>
              )}
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Settings className="text-blue-600 dark:text-blue-400" size={24} />
              Settings & Data Management
            </h2>
            
            {/* Salary Management Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowSalaryManager(!showSalaryManager)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                {showSalaryManager ? 'Hide' : 'Manage'} Salary History
              </button>
            </div>

            {/* Salary Manager - Collapsible */}
            {showSalaryManager && (
              <div className="mb-6">
                <SalaryManager 
                  salaryHistory={salaryHistory}
                  onUpdateSalaryHistory={setSalaryHistory}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => downloadData('json')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Download size={16} />
                Export JSON Backup
              </button>
              <button
                onClick={importData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Download size={16} className="rotate-180" />
                Import JSON Backup
              </button>
              <button
                onClick={exportYearlyCSV}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Download size={16} />
                Export {new Date().getFullYear()} CSV
              </button>
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Trash2 size={16} />
                Clear All Data
              </button>
            </div>
          </div>
        )}

        {/* Balance Card */}
        <BalanceCard 
          netWorth={netWorth}
          spendableBalance={spendableBalance}
          initialBalance={initialBalance}
          totalIncome={allTimeIncome}
          totalExpenses={allTimeExpenses}
          totalInSavingsPots={totalInSavingsPots}
          onInitialBalanceChange={setInitialBalance}
        />

        {/* Quick Stats Dashboard */}
        {showQuickStats && (
          <QuickStatsDashboard 
            netWorth={netWorth}
            spendableBalance={spendableBalance}
            monthlyIncome={totalIncome}
            monthlyExpenses={totalExpenses}
            totalBudget={totalMonthlyBudget}
            savingsRate={savingsRate}
            daysInMonth={new Date(
              parseInt(currentMonth.split('-')[0]),
              parseInt(currentMonth.split('-')[1]),
              0
            ).getDate()}
            dayOfMonth={
              currentMonth === getMonthKey(new Date())
                ? new Date().getDate()
                : new Date(
                    parseInt(currentMonth.split('-')[0]),
                    parseInt(currentMonth.split('-')[1]),
                    0
                  ).getDate()
            }
          />
        )}

        {/* Financial Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all hover:shadow-md w-full">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Income</h3>
              <TrendingUp className="text-green-500" size={18} />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatEUR(totalIncome)}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all hover:shadow-md w-full">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Expenses</h3>
              <TrendingDown className="text-red-500" size={18} />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatEUR(totalExpenses)}</p>
            {previousMonthExpenses > 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${expenseTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {expenseTrend > 0 ? '↑' : '↓'} {Math.abs(expenseTrend).toFixed(1)}% vs last month
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all hover:shadow-md w-full">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Savings</h3>
              <PiggyBank className="text-blue-500" size={18} />
            </div>
            <p className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatEUR(monthlySavings)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all hover:shadow-md w-full">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Savings Rate</h3>
              <div className="text-lg">💰</div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{savingsRate.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">of income saved</p>
          </div>
        </div>

        {/* Budget Ceiling Card - Enhanced */}
        <BudgetCeilingCard 
          currentMonthSalary={currentMonthSalary}
          totalBudgetAllocated={totalBudgetAllocated}
          leftoverBudget={leftoverBudget}
          overBudgeted={overBudgeted}
          categories={categories}
        />

        {/* Main Grid Layout - 12 Column System: Mobile-First Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-h-screen">
          {/* LEFT SIDEBAR - Budget Setup (4 columns on desktop) */}
          <div className="lg:col-span-4 space-y-6 w-full">
            {/* Category Budget Management */}
            <CategoryManager 
              categories={categories}
              onUpdateCategories={updateCategories}
            />

            {/* Savings Goals */}
            <SavingsGoals 
              savingsPots={savingsPots}
              onUpdatePots={setSavingsPots}
              spendableBalance={spendableBalance}
            />
          </div>

          {/* RIGHT MAIN AREA - Monthly Expenses & Charts (8 columns on desktop) */}
          <div className="lg:col-span-8 space-y-6 w-full">
            {/* Transaction Input Form */}
            <TransactionForm 
              categories={categories.filter(c => !c.isArchived)}
              onAddTransaction={addTransaction}
            />

            {/* Monthly Transaction List */}
            <TransactionTable 
              transactions={transactions}
              categories={categories}
              currentMonth={currentMonth}
              onDeleteTransaction={deleteTransaction}
            />

            {/* Budget Chart */}
            <BudgetChart 
              categories={categories.filter(c => !c.isArchived)}
              transactions={transactions}
            />

            {/* Yearly View */}
            <YearlyView 
              monthlySavings={monthlySavings}
              savingsGoal={savingsGoal}
              onSavingsGoalChange={setSavingsGoal}
            />
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
