import { useState, useEffect } from 'react'
import './App.css'
import ProductCard from './components/ProductCard'
import { getProducts, getProduct } from './services/productApi'


function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const LIMIT = 12;
  const skip = (page - 1) * LIMIT;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProducts(LIMIT, skip, controller.signal)
      .then(data => {
        setProducts(data.products);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [page]);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    getProduct(selectedId)
      .then(data => {
        setDetail(data);
        setDetailLoading(false);
      })
      .catch(() => setDetailLoading(false));
  }, [selectedId]);

  return (
    <div className="shop-layout">
      <div className="shop-main">
        <h1>Products</h1>

        {loading ? <p>Loading...</p> :
          error ? <p className="error">Error: {error}</p> :
          <div>
            <div className="product-gallery">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  name={p.title}
                  price={p.price}
                  image={p.thumbnail}
                  selected={p.id === selectedId}
                  onSelect={() => setSelectedId(p.id)}
                />
              ))}
            </div>
            <div className="pagination">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</button>
              <span>Page {page} / {totalPages} ({total} items)</span>
              <button onClick={() => setPage(p => p + 1)} disabled={skip + LIMIT >= total}>Next</button>
            </div>
          </div>
        }
      </div>

      <aside className="detail">
        <h2>Detail</h2>
        {detailLoading ? <p>Loading...</p> :
          !detail ? <p>Click a product to see details.</p> :
          <div>
            <img src={detail.thumbnail} alt={detail.title} />
            <h3>{detail.title}</h3>
            <p>{detail.description}</p>
            <p>Price: ${detail.price.toLocaleString()}</p>
            <p>Rating: {detail.rating}</p>
            <p>Stock: {detail.stock}</p>
          </div>
        }
      </aside>
    </div>
  )
}

export default App
