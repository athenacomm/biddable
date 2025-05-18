// File: pages/index.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const logos = [
  "https://lh3.googleusercontent.com/d/1X2rT5MilCmFmQ9FD1fG7okN2JgOn48oM=s4000",
  "https://lh3.googleusercontent.com/d/1S3LUc2GLcINETZb_VvpfbwAqUxXGa_Sr=s4000",
  "https://lh3.googleusercontent.com/d/1dXecPFRLnMaM3z81TBFLPbjBeEAfu1KB=s4000",
  "https://lh3.googleusercontent.com/d/18Qja_55U_8xelatswMEfCMgTg52wvGvl=s4000",
  "https://lh3.googleusercontent.com/d/1aMQTvysrTk0Bvk4IvQQfDQ9aMttBZn1u=s4000",
]

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Email submitted:', email)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center" style={{ backgroundColor: '#273956' }}>
      <div className="absolute top-6 right-6">
        <img src="/athena-logo.png" alt="Athena Logo" className="h-12 object-contain" />
      </div>

      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-[#f3cb37] mb-4">Access 1,000+ Public Sector Frameworks Instantly</h1>
        <p className="text-white text-lg mb-6">
          Stop wasting time on fragmented portals. Discover the UK's most complete framework database — built for bid managers.
        </p>
      </div>

      {!submitted ? (
        <Card className="w-full max-w-md p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-[#0e897c] font-medium">Enter your email to get started</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <Button type="submit" className="w-full">
              Get Access
            </Button>
            <p className="text-sm text-center text-gray-500">Already a member? Log in</p>
          </form>
        </Card>
      ) : (
        <p className="text-white text-lg mt-4">Thank you. Check your inbox to continue.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-10">
        {logos.map((logo, i) => (
          <img key={i} src={logo} alt={`Client logo ${i + 1}`} className="h-12 object-contain mx-auto" />
        ))}
      </div>
    </div>
  )
}

