// European EUR formatting utilities
import { SalaryEntry } from '../components/SalaryManager'

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatEURCompact(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseEURInput(input: string): number {
  // Parse European format: 1.250,50 -> 1250.50
  const cleaned = input.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

/**
 * Get the active salary for a given month
 * @param salaryHistory - Array of salary entries sorted by date
 * @param monthKey - Month key in format 'YYYY-MM'
 * @returns The salary amount active during that month
 */
export function getActiveSalary(salaryHistory: SalaryEntry[], monthKey: string): number {
  if (salaryHistory.length === 0) return 0

  // Parse the month key
  const [year, month] = monthKey.split('-').map(Number)
  const targetDate = new Date(year, month - 1, 1) // First day of the month

  // Sort by date descending to find the most recent applicable salary
  const sorted = [...salaryHistory].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )

  // Find the first salary entry where startDate <= targetDate
  for (const entry of sorted) {
    const entryDate = new Date(entry.startDate)
    if (entryDate <= targetDate) {
      return entry.amount
    }
  }

  // If no salary found for that date, use the oldest one
  return sorted[sorted.length - 1]?.amount || 0
}

/**
 * Calculate total budget allocated across all categories
 */
export function getTotalBudgetAllocated(categories: Array<{ monthlyBudget: number, isArchived?: boolean }>): number {
  return categories
    .filter(cat => !cat.isArchived)
    .reduce((sum, cat) => sum + (cat.monthlyBudget || 0), 0)
}

/**
 * Calculate leftover budget (Salary - Allocated Budgets)
 */
export function getLeftoverBudget(salary: number, categories: Array<{ monthlyBudget: number, isArchived?: boolean }>): number {
  const allocated = getTotalBudgetAllocated(categories)
  return salary - allocated
}

/**
 * Check if budget is over-allocated
 */
export function isOverBudgeted(salary: number, categories: Array<{ monthlyBudget: number, isArchived?: boolean }>): boolean {
  return getLeftoverBudget(salary, categories) < 0
}
