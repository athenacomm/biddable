'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    setMessage(error ? error.message : 'Check your email for the login link')
  }

  return (
    <div className="min-h-screen bg-[#273956] p-6 text-white flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md text-black">
        <h1 className="text-xl font-bold mb-4">Log In to Biddable</h1>
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full border p-2 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-[#0e897c] text-white py-2 rounded"
        >
          Send Magic Link
        </button>
        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  )
}
