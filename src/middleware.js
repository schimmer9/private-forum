// src/middleware.js
import { createBrowserClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const response = NextResponse.next()

  // 创建 Supabase 客户端
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      }
    }
  )

  // 维持会话有效性
  await supabase.auth.getUser()
  
  const { data: { user } } = await supabase.auth.getUser()

  // **拦截未登录用户访问 `/post/create`**
  if (!user && request.nextUrl.pathname.startsWith('/post/create')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 继续请求
  return response
}

// 配置中间件作用范围
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}