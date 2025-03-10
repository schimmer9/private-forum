// src/components/Post/ListItem.js
import Link from 'next/link'

export default function PostListItem({ post }) {
  return (
    <Link 
      href={`/post/${post.id}`}
      className="block card bg-white hover:shadow-md transition-shadow duration-200"
    >
      <div className="card-body">
        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="badge badge-outline">
            {post.is_anonymous ? '匿名用户' : post.profiles.display_name}
          </span>
          <span className="text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          <span className="text-gray-500">
            {post.comments_count} 条回复
          </span>
        </div>
      </div>
    </Link>
  )
}