export function PostCard({ post, onSelect, onDelete }) {
  return (
    <article className="post-card" onClick={onSelect}>
      <h2>{post.title}</h2>
      <p>{post.body.length > 140 ? `${post.body.slice(0, 140)}...` : post.body}</p>
      {post.tags?.length ? (
        <div className="tags">
          {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      ) : null}
      <div className="card-footer">
        <p className="likes">{post.reactions?.likes ?? 0} likes</p>
        <button
          className="delete-btn"
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
