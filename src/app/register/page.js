// src/app/register/page.js
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthForm from '@/components/Auth/Form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  // 修复点：正确定义 handleSubmit
  const handleSubmit = async (email, password, username) => {
    try {
      // 1. 创建认证用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username
          }
        }
      })

      if (authError) throw authError

      // 2. 创建用户资料
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          display_name: username
        })

      if (profileError) throw profileError

      // 3. 跳转登录页
      router.push('/login?registered=true')
    } catch (err) {
      setError(err.message)
      console.error('注册错误:', err)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">用户注册</h1>
      
      <AuthForm 
        type="register"
        onSubmit={handleSubmit}
        error={error}
      />

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">已有账号？</span>
        <Link
          href="/login"
          className="text-primary hover:underline ml-2"
        >
          立即登录
        </Link>
      </div>
    </div>
  )
}