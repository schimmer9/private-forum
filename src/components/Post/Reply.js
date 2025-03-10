'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReplyForm({ postId , fetchReplies}) {
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

  const handleSubmitReply = async (e) => {
    e.preventDefault()

    if (!user) {
      alert("请先登录后才能回复！")
      return
    }

    if (!reply.trim()) {
      alert("回复内容不能为空！")
      return
    }

    // 获取下一个楼层号
    const { data: nextFloor, error: floorError } = await supabase.rpc('get_next_floor', { post_id_input: postId })

    if (floorError) {
      console.error("获取楼层号失败", floorError)
      alert("楼层号生成失败，请稍后重试")
      return
    }

    const { error } = await supabase.from('replies').insert([
      {
        post_id: postId,
        user_id: user.id, // ✅ 记录 user_id，即使是匿名回复
        content: reply,
        is_anonymous: isAnonymous,
        created_at: new Date().toISOString(),
        floor_number: nextFloor || 1, // ✅ 确保楼层号正确
      }
    ])

    if (error) {
      alert("回复失败，请稍后再试！")
    } else {
      setReply("") // 清空输入框
      setIsAnonymous(false) // 重置匿名状态
      alert("回复成功！")
      fetchReplies() 
    }
  }

  return (
    <form onSubmit={handleSubmitReply} className="mt-4 space-y-4">
      <div>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="输入您的回复..."
          className="w-full p-2 border rounded-md"
          rows="3"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="checkbox checkbox-primary"
          />
          <span className="text-sm">匿名回复</span>
        </label>
        
        <button type="submit" className="btn btn-primary px-6">
          提交回复
        </button>
      </div>
    </form>
  )
}
