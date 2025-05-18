'use client'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function FrameworkDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [record, setRecord] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const loadRecord = async () => {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .eq('ID', id)
        .single()

      if (error) {
        setError(error.message)
        setRecord(null)
      } else {
        setRecord(data)
        setError(null)
      }
    }

    loadRecord()
  }, [id])

  const labelStyle = "font-medium text-[#0e897c] w-40"
  const valueStyle = "text-gray-800"

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#273956' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#f3cb37]">Framework Detail</h1>
        <img src="/athena-logo.png" alt="Athena Logo" className="h-12 object-contain" />
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        {error && <p className="text-[#ff916f]">Error: {error}</p>}

        {record ? (
          <table className="table-auto w-full text-sm">
            <tbody>
              {Object.entries(record).map(([key, value]) => {
                if (
                  ["Batch", "ID", "SEO:Index", "SEO:Slug", "SEO:Title", "SEO:Description"].includes(key)
                ) return null

                return (
                  <tr key={key} className="border-t align-top">
                    <td className={labelStyle}>{key}</td>
                    <td className={valueStyle}>
                      {key === 'Link' && typeof value === 'string' ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#0e897c] underline">
                          View Notice
                        </a>
                      ) : key === 'Image Link' && typeof value === 'string' ? (
                        <img
                          src={value}
                          alt="Framework"
                          className="w-48 mt-2 rounded shadow border"
                        />
                      ) : (
                        String(value ?? '')
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          !error && <p className="text-white">Loading...</p>
        )}
      </div>
    </div>
  )
}
