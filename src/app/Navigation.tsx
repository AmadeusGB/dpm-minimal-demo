'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useStore } from "@/store/useStore"
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const currentUser = useStore((state) => state.currentUser)

  // 等待客户端渲染完成后再显示用户状态
  useEffect(() => {
    setMounted(true)
  }, [])

  const getLinkClassName = (path: string) => {
    const isActive = pathname === path
    return `${
      isActive
        ? "border-indigo-500 text-gray-900"
        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Deeper Mail
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/inbox"
                className={getLinkClassName("/inbox")}
              >
                Inbox
              </Link>
              <Link
                href="/sent"
                className={getLinkClassName("/sent")}
              >
                Sent
              </Link>
              <Link
                href="/compose"
                className={getLinkClassName("/compose")}
              >
                Compose
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              {mounted ? (
                currentUser ? (
                  <>
                    <span className="text-gray-700">{currentUser}</span>
                    <Link
                      href="/login"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Logout
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                )
              ) : (
                // Empty placeholder to maintain structure during server render
                <div className="w-[100px]" />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 