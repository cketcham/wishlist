import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'
import Cookies from 'js-cookie'
import { useState } from 'react'
import Layout from '../../components/Layout'

const fetcher = (url: string) => fetch(url, {
  headers: {
    Authorization: 'Bearer ' + (typeof window !== 'undefined' ? Cookies.get('token') : '')
  }
}).then(res => res.json())

export default function WishlistPage() {
  const router = useRouter()
  const { id } = router.query
  const { data: wishlist } = useSWR(id ? `/api/wishlists/${id}` : null, fetcher)
  const { data: items, mutate: mutateItems } = useSWR(id ? `/api/wishlists/${id}/items` : null, fetcher)

  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/wishlists/${id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token')
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) throw new Error('Failed to add item')

      setUrl('')
      mutateItems() // Refresh the items list
    } catch (error) {
      console.error('Error adding item:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="p-4">
        {wishlist && (
          <>
            <h1 className="text-xl font-bold">{wishlist.title}</h1>
            <p>Default event date: {wishlist.defaultDay && wishlist.defaultMonth ? `${wishlist.defaultDay}/${wishlist.defaultMonth}` : 'None'}</p>

            {/* Add URL form */}
            <form onSubmit={handleAddItem} className="my-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter item URL"
                  className="flex-1 p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>

            <hr className="my-4" />
            <h2 className="font-semibold">Items</h2>
            <ul>
              {items && items.map((item: any) => (
                <li key={item.id} onClick={() => router.push(`/item/${item.id}`)} className="cursor-pointer underline">
                  <p>{item.name}</p>
                  {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                  {item.image && <img src={item.image} alt={item.name} className="mt-2 max-w-xs" />}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Layout>
  )
}
