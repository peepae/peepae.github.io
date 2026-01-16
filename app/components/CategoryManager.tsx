'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { formatEUR } from '../utils/formatters'

export interface Category {
  id: string
  name: string
  monthlyBudget: number
  color: string
  isArchived?: boolean
}

interface CategoryManagerProps {
  categories: Category[]
  onUpdateCategories: (categories: Category[]) => void
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export default function CategoryManager({ categories, onUpdateCategories }: CategoryManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newBudget, setNewBudget] = useState('')
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0])
  const [editName, setEditName] = useState('')
  const [editBudget, setEditBudget] = useState('')
  const [editColor, setEditColor] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleAdd = () => {
    if (!newName.trim() || !newBudget) return

    const category: Category = {
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      monthlyBudget: parseFloat(newBudget),
      color: newColor,
      isArchived: false
    }

    onUpdateCategories([...categories, category])
    setNewName('')
    setNewBudget('')
    setNewColor(DEFAULT_COLORS[0])
    setIsAdding(false)
  }

  const handleEdit = (id: string) => {
    const category = categories.find(c => c.id === id)
    if (category) {
      setEditingId(id)
      setEditName(category.name)
      setEditBudget(category.monthlyBudget.toString())
      setEditColor(category.color)
    }
  }

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return

    const updated = categories.map(c =>
      c.id === editingId
        ? { ...c, name: editName.trim(), monthlyBudget: parseFloat(editBudget) || 0, color: editColor }
        : c
    )

    onUpdateCategories(updated)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      // Soft-delete by setting isArchived to true
      const updated = categories.map(c => 
        c.id === id ? { ...c, isArchived: true } : c
      )
      onUpdateCategories(updated)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setNewName('')
    setNewBudget('')
    setNewColor(DEFAULT_COLORS[0])
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 w-full transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Category Management</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium">
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {/* Add New Category Form */}
      {isAdding && (
        <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Monthly budget"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <div className="flex gap-1.5 items-center">
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
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Check size={14} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100 rounded-lg text-xs font-medium transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-1.5">
        {categories.filter(c => !c.isArchived).length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
            No categories yet. Add your first category above.
          </p>
        ) : (
          categories.filter(c => !c.isArchived).map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
            >
              {editingId === category.id ? (
                // Edit Mode
                <>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: editColor }}
                  />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-24 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-7 h-6 rounded cursor-pointer"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100 rounded transition-colors"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                // View Mode
                <>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="flex-1 font-medium text-slate-900 dark:text-slate-100 text-xs truncate">
                    {category.name}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    {formatEUR(category.monthlyBudget)}
                  </span>
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className={`p-1 rounded transition-colors ${
                      deleteConfirmId === category.id
                        ? 'bg-red-600 text-white px-1.5'
                        : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    {deleteConfirmId === category.id ? (
                      <span className="text-xs font-semibold">OK?</span>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
