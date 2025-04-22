'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { useState } from 'react'
import { format } from 'date-fns'

export default function ComposePage() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)
  const addToSent = useStore((state) => state.addToSent)
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      alert('Please login first')
      return
    }

    const email = {
      from: currentUser,
      to: formData.to,
      subject: formData.subject,
      content: formData.content,
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(email),
      })

      if (response.ok) {
        addToSent(email)
        router.push('/sent')
      } else {
        alert('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email')
    }
  }

  if (!currentUser) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Compose Email</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700">
                To
              </label>
              <input
                type="email"
                id="to"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="recipient@deeper.mail"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                required
                rows={10}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 