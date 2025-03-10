// src/app/login/page.js
'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthForm from '@/components/Auth/Form'
import Link from 'next/link'

// 将登录表单逻辑提取到子组件
function LoginContent() {
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const showSuccess = searchParams.get('registered') === 'true'

  const handleSubmit = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      {showSuccess && (
        <div className="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>注册成功！请登录</span>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">用户登录</h1>
      <AuthForm 
        type="login"
        onSubmit={handleSubmit}
        error={error}
      />
      
      <div className="mt-6 text-center">
        <span className="text-gray-600">还没有账号？</span>
        <Link 
          href="/register" 
          className="text-primary hover:underline"
        >
          立即注册
        </Link>
      </div>
    </div>
  )
}

// 主页面组件用 Suspense 包裹
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}