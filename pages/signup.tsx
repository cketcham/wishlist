import { useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await res.json()
      
      if (res.ok) {
        Cookies.set('token', data.token)
        router.push('/dashboard')
      } else {
        setError(data.message || 'Signup failed')
      }
    } catch (err) {
      setError('An error occurred during signup')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Create Account</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          className="border w-full p-2 rounded"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          className="border w-full p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="border w-full p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
        >
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-500 hover:text-blue-600">
          Login here
        </Link>
      </p>
    </div>
  )
} 