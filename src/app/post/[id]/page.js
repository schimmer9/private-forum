import { supabase } from '@/lib/supabase'
import ReplyForm from '@/components/Post/Reply'
import ReplyList from '@/components/Post/ReplyList' // ✅ 新增 Client 组件

export default async function PostPage({ params }) {
  if (!params?.id) {
    return <p className="text-red-500">帖子 ID 无效！</p>
  }

  // 获取帖子信息
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!inner(username, display_name)
    `)
    .eq('id', params.id)
    .single()

  if (error || !post) {
    return <p className="text-red-500">帖子加载失败：{error?.message || '帖子不存在'}</p>
  }

  return (
    <div className="space-y-6">
      <article className="card bg-base-100 p-6">
        <h2 className="text-2xl font-bold">{post.title}</h2>
        <div className="badge badge-outline mt-2">
          {post.is_anonymous ? '匿名用户' : post.profiles.display_name}
        </div>
        <p className="mt-4">{post.content}</p>
      </article>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">回复列表</h3>

        {/* ✅ 这里的 ReplyList 是 Client 组件，会自动刷新 */}
        <ReplyList postId={params.id} />

      </section>
    </div>
  )
}
