'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'

export default function ComposePage() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const router = useRouter()
  const { currentUser, sendEmail } = useStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      alert('Please login first')
      return
    }

    const email = {
      from: currentUser,
      to,
      subject,
      content,
      timestamp: new Date().toISOString()
    }

    sendEmail(email)
    router.push('/sent')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Compose Email
            </h3>
            <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="to" className="block text-sm font-medium text-gray-700">
                  To
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="to"
                    id="to"
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="recipient@deeper.mail"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <div className="mt-1">
                  <textarea
                    id="content"
                    name="content"
                    rows={10}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Write your message here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 