import useSWR from 'swr'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import Layout from '../components/Layout'

const fetcher = (url: string) => fetch(url, {
    headers: {
        Authorization: 'Bearer ' + (typeof window !== 'undefined' ? Cookies.get('token') : '')
    }
}).then(res => res.json())

export default function Dashboard() {
    const { data: wishlists, mutate } = useSWR('/api/wishlists', fetcher)
    const [title, setTitle] = useState('')
    const router = useRouter()

    async function createWishlist(e: React.FormEvent) {
        e.preventDefault()
        const token = Cookies.get('token')
        const res = await fetch('/api/wishlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ title })
        })
        if (res.ok) {
            await mutate()
            setTitle('')
        }
    }

    return (
        <Layout>
            <div className="p-4">
                <h1 className="text-xl font-bold">My Wishlists</h1>
                <form onSubmit={createWishlist} className="my-4 space-x-2">
                    <input value={title} onChange={e => setTitle(e.target.value)} className="border p-1" placeholder="New Wishlist Title" />
                    <button type="submit" className="bg-blue-500 text-white px-3 py-1">Create</button>
                </form>
                <ul>
                    {wishlists && wishlists.map((wl: any) => (
                        <li key={wl.id} onClick={() => router.push(`/wishlist/${wl.id}`)} className="cursor-pointer underline">{wl.title}</li>
                    ))}
                </ul>
            </div>
        </Layout>
    )
}
