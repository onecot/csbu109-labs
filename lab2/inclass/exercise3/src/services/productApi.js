const BASE = 'https://dummyjson.com';

async function request(path, signal) {
  const res = await fetch(BASE+path, {signal});
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getProducts(limit, skip, signal) {
  return request(`/products?limit=${limit}&skip=${skip}`, signal);
}

export function getProduct(id) {
  return request(`/products/${id}`);
}