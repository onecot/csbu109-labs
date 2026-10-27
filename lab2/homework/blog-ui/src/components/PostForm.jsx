import { useState } from 'react'

export function PostForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onSubmit({ title: title.trim(), body: body.trim(), userId: 1 })
      setTitle('')
      setBody('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h2>New post</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Body"
        rows={3}
        value={body}
        onChange={e => setBody(e.target.value)}
        required
      />

      {error && <p className="status error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Posting...' : 'Add post'}
      </button>
    </form>
  )
}
