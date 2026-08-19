import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '../../components/admin/AdminSidebar'

/** robots.txt impede o crawl, mas nao impede a indexacao por link externo. */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.papel !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar usuario={session.user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
