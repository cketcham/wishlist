import { useRouter } from 'next/router'
import useSWR from 'swr'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { ItemWithOwnership } from '../../types/item'
import Layout from '../../components/Layout'

const fetcher = (url: string) => fetch(url, {
  headers: {
    Authorization: 'Bearer ' + (typeof window !== 'undefined' ? Cookies.get('token') : '')
  }
}).then(res => res.json())

export default function ItemPage() {
  const router = useRouter()
  const { id } = router.query
  const { data: item } = useSWR<ItemWithOwnership>(id ? `/api/items/${id}` : null, fetcher)
  const [newMessage, setNewMessage] = useState('')

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + Cookies.get('token')
        }
      })

      if (!response.ok) throw new Error('Failed to delete item')

      router.back()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/items/${id}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token')
        },
        body: JSON.stringify({ message: newMessage })
      })

      if (!response.ok) throw new Error('Failed to send message')
      setNewMessage('')

      // Refresh the item data
      router.reload()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleMarkPurchase = async () => {
    try {
      const response = await fetch(`/api/items/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token')
        }
      })

      if (!response.ok) throw new Error('Failed to mark as purchased')

      // Refresh the item data
      router.reload()
    } catch (error) {
      console.error('Error marking as purchased:', error)
      alert('Failed to mark item as purchased')
    }
  }

  if (!item) return <div className="p-4">Loading...</div>

  return (
    <Layout>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Item Header */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <div className="text-right">
              {item.price && (
                <p className="text-xl font-semibold text-green-600">
                  {item.price} {item.currency}
                </p>
              )}
              {item.isOwner && (
                <button
                  onClick={handleDelete}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete Item
                </button>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Image */}
            <div>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div>
              {item.description && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              )}

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4"
                >
                  View Original
                </a>
              )}

              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Event Date</h2>
                <p className="text-gray-600">
                  {new Date(item.eventDate).toLocaleDateString()}
                </p>
              </div>

              {/* Purchase Status - Only show if not owner */}
              {!item.isOwner && (
                <>
                  {item.purchase ? (
                    <div className="bg-green-100 p-4 rounded-lg">
                      <p className="text-green-700">This item has been purchased</p>
                    </div>
                  ) : (
                    <button
                      className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      onClick={handleMarkPurchase}
                    >
                      Mark as Purchased
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Section - Only show if not owner */}
          {!item.isOwner && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Discussion</h2>

              {/* Chat Messages */}
              <div className="space-y-4 mb-4">
                {item.chats?.map((chat: any) => (
                  <div key={chat.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">{chat.user.name}</p>
                      <span className="text-sm text-gray-500">
                        {new Date(chat.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2">{chat.message}</p>
                  </div>
                ))}
              </div>

              {/* New Message Form */}
              <form onSubmit={handleSendMessage} className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 