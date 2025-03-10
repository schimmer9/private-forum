'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReplyForm({ postId }) {
  const [user, setUser] = useState(null)
  const [reply, setReply] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  const handleReply = async (e) => {
    e.preventDefault()

    if (!user) {
      alert("请先登录后才能回复！")
      return
    }

    if (!reply.trim()) {
      alert("回复内容不能为空！")
      return
    }

    const { error } = await supabase.from('replies').insert([
      {
        post_id: postId,
        content: reply,
        user_id: isAnonymous ? null : user.id, // ✅ 匿名时 `user_id` 为空
        is_anonymous: isAnonymous, 
        created_at: new Date().toISOString()
      }
    ])

    if (error) {
      alert("回复失败，请稍后再试！")
    } else {
      alert("回复成功！")
      setReply("")
    }
  }

  return 

}
