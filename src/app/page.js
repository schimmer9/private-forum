import { supabase } from '@/lib/supabase'
import PostListItem from '@/components/Post/ListItem'
import Link from 'next/link'

export default async function Home() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      created_at,
      is_anonymous,
      profiles!inner(username, display_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>

      {/* ✅ 让帖子列表和右侧热门内容左右排列 */}
      <div className="max-w-6xl mx-auto p-4 flex gap-6 mt-4">
        {/* 🔹 左侧帖子列表 */}
        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold border-b pb-2">最新帖子</h1>

          {error ? (
            <div className="alert alert-error text-center">
              <span>数据加载失败：{error.message}</span>
            </div>
          ) : posts?.length ? (
            <div className="space-y-4">
              {posts.map(post => (
                <PostListItem key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">暂时还没有帖子哦～</p>
              <Link href="/post/create" className="btn btn-primary mt-4">
                发布第一个帖子
              </Link>
            </div>
          )}
        </div>

        {/* 🔹 右侧 热门帖子 & 发帖按钮 */}
        <aside className="w-64 space-y-4">
          {/* 发帖按钮 */}
          <Link href="/post/create" className="btn btn-primary w-full text-center py-2">
            发帖
          </Link>

          {/* 热门帖子列表 */}
          <div className="border p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-2">🔥 热门帖子</h2>
            <ul className="space-y-2">
              {['内容1', '内容2', '内容3', '内容4', '内容5', '内容6'].map((item, index) => (
                <li key={index} className="text-gray-700 hover:text-primary cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
