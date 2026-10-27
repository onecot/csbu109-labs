import { useEffect, useState } from 'react'
import { getComments, getPost } from '../services/postApi'

export function PostDetailPage({ postId, onBack }) {
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([getPost(postId), getComments(postId)])
      .then(([postData, commentsData]) => {
        setPost(postData)
        setComments(commentsData.comments)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [postId])

  if (loading) return <p className="status">Loading...</p>
  if (error) return <p className="status error">Error: {error}</p>

  return (
    <main className="posts-page">
      <button className="back" onClick={onBack}>← Back to posts</button>

      <article className="post-detail">
        <h1>{post.title}</h1>
        {post.tags?.length ? (
          <div className="tags">
            {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        ) : null}
        <p className="body">{post.body}</p>
        <p className="likes">
          {post.reactions?.likes ?? 0} likes · {post.views ?? 0} views
        </p>
      </article>

      <section className="comments">
        <h2>Comments ({comments.length})</h2>
        {comments.length === 0 ? (
          <p className="status">No comments.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="comment">
              <p className="comment-user">{c.user?.username ?? 'anonymous'}</p>
              <p>{c.body}</p>
            </div>
          ))
        )}
      </section>
    </main>
  )
}
