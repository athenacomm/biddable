'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

let debounceTimeout: NodeJS.Timeout

export default function SearchesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [dpsFilter, setDpsFilter] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      const { data, error } = await supabase
        .from('frameworks')
        .select('"New Category"')
        .not('New Category', 'is', null)

      if (error) {
        console.error('Category fetch error:', error)
        return
      }

      const uniqueCategories = Array.from(
        new Set(data.map(d => d['New Category']))
      ).sort()

      setCategoryOptions(uniqueCategories)
    }

    fetchCategoryOptions()
  }, [])

  const loadData = async (term: string) => {
    let query = supabase.from('frameworks').select('*')

    if (selectedCategories.length > 0) {
      query = query.in('New Category', selectedCategories)
    }

    if (dpsFilter === 'Yes' || dpsFilter === 'No') {
      query = query.eq('DPS', dpsFilter)
    }

    if (term) {
      query = query.or(`Framework.ilike.%${term}%,\"New Category\".ilike.%${term}%,Description.ilike.%${term}%`)
    }

    query = query.limit(20)

    const { data, error } = await query

    if (error) {
      setError(error.message)
      setRows([])
    } else {
      setRows(data || [])
      setError(null)
    }
  }

  useEffect(() => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      loadData(searchTerm)
    }, 300)
  }, [selectedCategories, dpsFilter, searchTerm])

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#273956' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#f3cb37]">Frameworks Search</h1>
        <img src="/athena-logo.png" alt="Athena Logo" className="h-12 object-contain" />
      </div>

      <div className="bg-white p-6 rounded shadow mb-6 space-y-6">
        <div>
          <label className="block text-[#0e897c] font-medium mb-2">Search by keyword</label>
          <input
            type="text"
            placeholder="Search framework, category, or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-[#0e897c] font-medium mb-2">Filter by Category</label>
          <select
            multiple
            value={selectedCategories}
            onChange={(e) =>
              setSelectedCategories(Array.from(e.target.selectedOptions, option => option.value))
            }
            className="w-full border p-2 rounded text-sm h-40"
          >
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Cmd on Mac) to select multiple</p>
        </div>

        <div>
          <label className="block text-[#0e897c] font-medium mb-2">Filter by DPS</label>
          <select
            value={dpsFilter}
            onChange={(e) => setDpsFilter(e.target.value)}
            className="w-full border p-2 rounded text-sm"
          >
            <option value="All">All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {error && <p className="text-[#ff916f] mb-4">Error: {error}</p>}

      {rows.length === 0 && !error ? (
        <p className="text-white">No data found.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded overflow-hidden">
          <thead>
            <tr style={{ backgroundColor: '#f3cb37' }}>
              <th className="text-left px-4 py-2 text-[#273956]">Framework</th>
              <th className="text-left px-4 py-2 text-[#273956]">New Category</th>
              <th className="text-left px-4 py-2 text-[#273956]">DPS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-t hover:bg-gray-100 cursor-pointer"
                onClick={() => window.location.href = `/framework/${row.ID}`}
              >
                <td className="px-4 py-2">{row.Framework}</td>
                <td className="px-4 py-2">{row['New Category']}</td>
                <td className="px-4 py-2">{row.DPS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
