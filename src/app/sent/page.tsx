'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { format } from 'date-fns'
import { useEffect } from 'react'

export default function SentPage() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)
  const sent = useStore((state) => state.sent)
  const loadSent = useStore((state) => state.loadSent)

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    const fetchSent = async () => {
      try {
        const response = await fetch(`/api/sent?user=${currentUser}`)
        if (response.ok) {
          const data = await response.json()
          loadSent(data)
        }
      } catch (error) {
        console.error('Error fetching sent emails:', error)
      }
    }

    fetchSent()
  }, [currentUser, loadSent, router])

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Sent</h1>
              <button
                onClick={() => router.push('/compose')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Compose
              </button>
            </div>

            <div className="space-y-4">
              {sent.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sent emails</p>
              ) : (
                sent.map((email, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/sent/${index}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">To: {email.to}</p>
                        <p className="text-gray-600">{email.subject}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(email.timestamp), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <p className="mt-2 text-gray-600 line-clamp-2">{email.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 