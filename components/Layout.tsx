import AuthBanner from './AuthBanner'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AuthBanner />
      <main>{children}</main>
    </div>
  )
}
