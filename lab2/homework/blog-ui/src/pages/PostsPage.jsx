import { useEffect, useState } from 'react'
import { PostCard } from '../components/PostCard'
import { PostForm } from '../components/PostForm'
import { useDebounce } from '../hooks/useDebounce'
import { createPost, deletePost, getPosts, searchPosts } from '../services/postApi'
import { PostDetailPage } from './PostDetailPage'

const LIMIT = 10

export function PostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const debouncedKeyword = useDebounce(keyword, 400)
  const query = debouncedKeyword.trim()
  const searching = query !== ''
  const skip = (page - 1) * LIMIT
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const request = searching ? searchPosts(query) : getPosts(LIMIT, skip)

    request
      .then(data => {
        setPosts(data.posts)
        setTotal(data.total)
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [query, page])

  function handleKeyword(e) {
    setKeyword(e.target.value)
    setPage(1)
  }

  async function handleCreate(data) {
    const created = await createPost(data)
    const withDefaults = {
      tags: [],
      reactions: { likes: 0, dislikes: 0 },
      views: 0,
      ...created,
    }
    setPosts(prev => [withDefaults, ...prev])
    setTotal(t => t + 1)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return

    try {
      const deleted = await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== deleted.id))
      setTotal(t => Math.max(0, t - 1))
    } catch (err) {
      setError(err.message)
    }
  }

  if (selectedId !== null) {
    return (
      <PostDetailPage postId={selectedId} onBack={() => setSelectedId(null)} />
    )
  }

  return (
    <main className="posts-page">
      <h1>Posts</h1>

      <input
        className="search"
        type="search"
        placeholder="Search posts..."
        value={keyword}
        onChange={handleKeyword}
      />

      <PostForm onSubmit={handleCreate} />

      {loading ? (
        <p className="status">Loading...</p>
      ) : error ? (
        <p className="status error">Error: {error}</p>
      ) : posts.length === 0 ? (
        <p className="status">No posts found for "{query}".</p>
      ) : (
        <>
          {searching && <p className="status">{total} result(s) for "{query}"</p>}

          <div className="post-list">
            {posts.map(p => (
              <PostCard
                key={p.id}
                post={p}
                onSelect={() => setSelectedId(p.id)}
                onDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>

          {!searching && (
            <div className="pagination">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                Previous
              </button>
              <span>
                Page {page} / {totalPages} ({total} posts)
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={skip + LIMIT >= total}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
