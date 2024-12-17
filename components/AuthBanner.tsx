import { useRouter } from 'next/router'
import Link from 'next/link'
import Cookies from 'js-cookie'

export default function AuthBanner() {
  const router = useRouter()
  const isLoggedIn = !!Cookies.get('token')

  const handleLogout = () => {
    Cookies.remove('token')
    router.push('/login')
  }

  return (
    <div className="bg-gray-100 p-4 flex justify-between items-center">
      <Link href="/dashboard" className="text-blue-500 hover:text-blue-600">
        Wishlist App
      </Link>
      <div>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600"
          >
            Sign Out
          </button>
        ) : (
          <div className="space-x-4">
            <Link href="/login" className="text-blue-500 hover:text-blue-600">
              Sign In
            </Link>
            <Link href="/signup" className="text-blue-500 hover:text-blue-600">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
