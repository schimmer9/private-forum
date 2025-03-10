'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    fetchUser()

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe()
      }
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="navbar bg-base-100 shadow-lg px-4 flex justify-between items-center">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">论坛</Link>
        </div>
        <div className="skeleton h-8 w-32"></div>
      </div>
    )
  }

  return (
    <div className="navbar bg-base-100 shadow-lg px-4 flex justify-between items-center">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">论坛</Link>
      </div>
      
      <div className="flex-none gap-2">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost flex items-center">
              <div className="avatar">
                <div className="w-8 rounded-full bg-neutral text-neutral-content">
                  {user.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <span className="ml-2">
                {user.user_metadata?.username || '用户'}
              </span>
            </div>
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
              <li>
                <Link href="/post/create" className="text-primary">
                  新建帖子
                </Link>
              </li>
              <li><button onClick={handleLogout}>退出登录</button></li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" className="btn btn-primary px-4 py-2">登录</Link>
            <Link href="/register" className="btn btn-outline px-4 py-2">注册</Link>
          </div>
        )}
      </div>
    </div>
  )
}
