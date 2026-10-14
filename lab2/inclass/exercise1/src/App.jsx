import { useState } from 'react'
import './App.css'
import ProductCard from './components/ProductCard'

const products = [
  { id: 1, name: 'Keyboard', price: 25, inStock: true },
  { id: 2, name: 'Mouse', price: 12, inStock: false },
  { id: 3, name: 'Monitor', price: 180, inStock: true },
];

function App() {
  return (
    <>
      <h1>Products</h1>
      <div className="product-gallery">
        {products.map(p => (
          <ProductCard key={p.id} name={p.name} price={p.price} inStock={p.inStock}/>
        ))}
      </div>
    </>
  )
}

export default App
