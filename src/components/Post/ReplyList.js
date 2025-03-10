'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReplyList({ postId }) {
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState('asc') // 默认从旧到新
  const [currentUser, setCurrentUser] = useState(null)
  const [newReply, setNewReply] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  // 获取所有回复
  async function fetchReplies() {
    setLoading(true)
    const { data, error } = await supabase
      .from('replies')
      .select(`
        id, post_id, floor_number, content, is_anonymous, created_at,
        profiles(username, display_name)
      `)
      .eq('post_id', postId)
      .order('floor_number', { ascending: true }) // ✅ 按楼层号排序
  
    if (error) {
      console.error("获取回复失败：", error)
    } else if (data) {
      console.log("获取的回复数据：", data) // ✅ 调试用，看看 floor_number 是否存在
      setReplies(data)
    }
    setLoading(false)
  }
  


  // 获取当前登录用户
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    fetchReplies()

    // 订阅 replies 表的实时更新
    const subscription = supabase
      .channel('public:replies')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'replies' }, payload => {
        console.log("收到实时更新：", payload)
        fetchReplies()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [postId])

  // 切换排序方式
  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  // 发送新回复
  async function handleAddReply() {
    if (!newReply.trim()) {
      alert("回复内容不能为空！")
      return
    }
  
    // ✅ 获取下一个楼层号
    const { data: nextFloor, error: floorError } = await supabase.rpc('get_next_floor', { post_id_input: postId })
  
    if (floorError) {
      console.error("获取楼层号失败", floorError)
      alert("楼层号生成失败，请稍后重试")
      return
    }
  
    console.log("获取到的楼层号:", nextFloor) // ✅ 确保 floor_number 正确
  
    // ✅ 插入新回复
    const { error } = await supabase
      .from('replies')
      .insert([
        {
          post_id: postId,
          user_id: currentUser?.id,
          content: newReply,
          is_anonymous: isAnonymous,
          created_at: new Date().toISOString(),
          floor_number: nextFloor || 1, // ✅ 确保楼层号正确赋值
        }
      ])
  
    if (error) {
      console.error("插入回复失败", error)
      alert("回复失败，请稍后重试")
    } else {
      setNewReply('')
      alert("回复成功！")
      fetchReplies() // 立即更新列表
    }
  }
  

  // 删除回复
  async function handleDeleteReply(replyId) {
    if (!confirm("确认删除这条回复？")) return

    const { error } = await supabase
      .from('replies')
      .delete()
      .eq('id', replyId)
    if (error) {
      alert("删除回复失败，请稍后再试！")
    } else {
      alert("删除成功！")
      fetchReplies()
    }
  }

  return (
    <div>
      {/* 排序切换按钮 */}
      <div className="flex items-center justify-between mb-4">

        <button onClick={toggleSortOrder} className="btn btn-sm">
          {sortOrder === 'asc' ? '从新到旧' : '从旧到新'}
        </button>
      </div>
      
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="space-y-4">
          {replies
            .slice() // 复制数组，避免影响原始顺序
            .sort((a, b) => (sortOrder === 'asc' ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at)))
            .map(reply => (
              <div key={reply.id} className="card bg-base-200 p-4">
                <div className="flex justify-between">
                  <p>{reply.content}</p>
                  <div className="text-sm opacity-75">{reply.floor_number}楼</div>
                </div>
                <div className="flex items-center justify-between text-sm opacity-75 mt-2">
                  <div>
                    - {reply.is_anonymous ? '匿名用户' : (reply.profiles?.display_name || '未知用户')}
                    （{new Date(reply.created_at).toLocaleString()}）
                  </div>
                  {/* 仅允许作者删除 */}
                  {currentUser && reply.user_id === currentUser.id && (
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDeleteReply(reply.id)}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 新增回复 */}
      <div className="mb-4 space-y-2">
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="输入你的回复..."
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
        />
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} />
          <span>匿名回复</span>
        </label>
        <button onClick={handleAddReply} className="btn btn-primary w-full">
          发送回复
        </button>
      </div>

    </div>
  )
}
