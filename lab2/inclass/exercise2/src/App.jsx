import { useState, useEffect } from 'react'
import './App.css'
import ProductCard from './components/ProductCard'
import { fakeFetchProducts } from './data/products'

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fakeFetchProducts().then(data => {
      setProducts(data);
      setLoading(false);
    })
  }, []);

  function addToCart(product) {
    const found = cart.find(i => i.id === product.id);
    if (found) {
      setCart(cart.map(i => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }

  function removeFromCart(id) {
    setCart(cart.filter(i => i.id !== id));
  }

  function getCartCount(items) {
    let count = 0;
    for (const item of items) {
      count += item.quantity;
    }
    return count;
  }

  function getCartTotal(items) {
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }
    return total;
  }

  const cartCount = getCartCount(cart);
  const cartTotal = getCartTotal(cart);

  useEffect(() => {
    document.title = `Cart (${cartCount})`;
  }, [cartCount]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(keyword.toLowerCase()) &&
    (category === 'All' || p.category === category)
  );
  
  return (
    <div className="shop-layout">
      <div className="shop-main">
        <h1>Shop</h1>

        <div className="controls">
          <input id="search-bar" type="text" placeholder="Search by name..." value={keyword} onChange={e => setKeyword(e.target.value)} />
          <select name="categories" id="category" value={category} onChange={e => setCategory(e.target.value)}>
            {['All', ...new Set(products.map(p => p.category))].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? <p>Loading...</p> :
        <div>
          <div className="product-gallery">
            {filtered.map(p => (
              <ProductCard key={p.id} name={p.name} category={p.category} price={p.price} inStock={p.inStock} onAdd={() => addToCart(p)} />
            ))}
          </div>
          {filtered.length ? <p>{filtered.length} products(s)</p> : <div>No products found</div>}
        </div>
        }
      </div>

      <aside className="cart">
        <h2>Cart ({cartCount})</h2>
        {cart.length === 0 ? (
          <p>Empty</p>
        ) : (
          <>
            <ul>
              {cart.map(i => (
                <li key={i.id}>
                  {i.name} x {i.quantity} — ${(i.price * i.quantity).toLocaleString()}
                  <button onClick={() => removeFromCart(i.id)}>Remove</button>
                </li>
              ))}
            </ul>
            <p>Total: ${cartTotal.toLocaleString()}</p>
          </>
        )}
      </aside>
    </div>
  )
}

export default App
