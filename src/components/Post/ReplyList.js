'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import ReplyForm from './Reply' // ✅ 导入 ReplyForm

export default function ReplyList({ postId }) {
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentUser, setCurrentUser] = useState(null)
  const [postOwnerId, setPostOwnerId] = useState(null)
  const [showOnlyOwner, setShowOnlyOwner] = useState(false)

  // ✅ 使用 useCallback 包裹 fetchReplies，避免 useEffect 依赖警告
  const fetchReplies = useCallback(async () => {
    setLoading(true)

    // 获取帖子的作者（楼主 ID）
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single()
    
    if (postError) {
      console.error("获取帖子信息失败：", postError)
      return
    }
    
    setPostOwnerId(postData.user_id) // 记录楼主 ID

    // 获取所有回复
    const { data: replyData, error } = await supabase
      .from('replies')
      .select(`
        id, post_id, floor_number, content, is_anonymous, created_at, user_id,
        profiles(username, display_name)
      `)
      .eq('post_id', postId)
      .order('floor_number', { ascending: true })

    if (error) {
      console.error("获取回复失败：", error)
    } else {
      setReplies(replyData || [])
    }
    setLoading(false)
  }, [postId])

  // 获取当前用户
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  // 监听 replies 实时更新
  useEffect(() => {
    fetchReplies()

    const subscription = supabase
      .channel('public:replies')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'replies' }, 
        () => fetchReplies()
      )
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [postId, fetchReplies])

  //删除回复
    const handleDeleteReply = async (replyId) => {
      if (!confirm("确认删除这条回复？")) return

      const { error } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId)

      if (error) {
        alert("删除回复失败，请稍后再试！")
      } else {
        alert("删除成功！")
        fetchReplies() // ✅ 删除后刷新列表
      }
    }


  return (
    <div>

      {/* ✅ 传递 fetchReplies 给 ReplyForm */}
      {/* 排序 & 只看楼主 按钮 */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="btn btn-sm"
        >
          {sortOrder === 'asc' ? '从新到旧' : '从旧到新'}
        </button>
        <button 
          onClick={() => setShowOnlyOwner(prev => !prev)} 
          className="btn btn-sm"
        >
          {showOnlyOwner ? '显示所有回复' : '只看楼主'}
        </button>
      </div>

      {/* 回复列表 */}
      {loading ? (
        <div className="text-center py-4">加载中...</div>
      ) : (
        <div className="space-y-4">
          {[...replies]
            .filter(reply => !showOnlyOwner || reply.user_id === postOwnerId)
            .sort((a, b) => sortOrder === 'asc' 
              ? a.floor_number - b.floor_number 
              : b.floor_number - a.floor_number
            )
            .map(reply => (
              <div key={reply.id} className="card bg-base-200 p-4">
                <div className="flex justify-between">
                  <p>{reply.content}</p>
                  <div className="text-sm opacity-75">{reply.floor_number}楼</div>
                </div>
                <div className="flex items-center justify-between text-sm opacity-75 mt-2">
                  <div>
                    - {reply.is_anonymous ? '匿名用户' : reply.profiles?.display_name}
                    {reply.user_id === postOwnerId && <span className="text-red-500 ml-2">[楼主]</span>}
                  </div>
                  {currentUser?.id === reply.user_id && (
                    <button className="btn btn-sm btn-error" onClick={() => handleDeleteReply(reply.id)}>
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
      <ReplyForm postId={postId} fetchReplies={fetchReplies} />

    </div>
  )
}
