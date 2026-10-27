const BASE = 'https://dummyjson.com';

async function request(path, options = {}) {
  const res = await fetch(BASE+path, {
    ...options,
    headers: {'Content-Type': 'application/json', ...options.headers}
  });
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getPosts(limit, skip) {
  // {posts, total, ...}
  return request(`/posts?limit=${limit}&skip=${skip}`);
}

export function searchPosts(q) {
  const encoded = encodeURIComponent(q);
  // {posts, total}
  return request(`/posts/search?q=${encoded}`);
}

// one post
export function getPost(id) {
  return request(`/posts/${id}`);
}

export function getComments(id) {
  // {comments:[{body, user:{username}}]}
  return request(`/posts/${id}/comments`);
}

export function createPost(data) {
  // new post
  // {id, title, body, userId}
  return request(`/posts/add`, {method: 'POST', body: JSON.stringify(data)});
}

export function deletePost(id) {
  // post with isDeleted: true
  return request(`/posts/${id}`, {method: 'DELETE'});
}