import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const token = Cookies.get('token')
        if (token) {
            router.push('/dashboard')
        }
    }, [])

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()

            if (res.ok) {
                Cookies.set('token', data.token)
                router.push('/dashboard')
            } else {
                setError(data.message || 'Invalid email or password')
            }
        } catch (err) {
            setError('An error occurred during login')
        }
    }

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Login</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-4 rounded">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
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
                    Login
                </button>
            </form>
            <p className="mt-4 text-center">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-500 hover:text-blue-600">
                    Register here
                </Link>
            </p>
        </div>
    )
}
