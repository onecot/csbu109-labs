const PLACEHOLDER = "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Example_image.svg/960px-Example_image.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"

export default function ProductCard({ name, price, category, inStock = true, image = PLACEHOLDER, onAdd }) {
  return (
    <div className="card">
      {price < 20 && <span className="badge">Low price!</span>}
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p className="category">{category}</p>
      <p>{price.toLocaleString()} USD</p>
      {inStock ?
        (<span className="stock in">In stock</span>):
        (<span className="stock out">Sold out</span>)}
      <button className="add-btn" onClick={onAdd}>Add to cart</button>
    </div>
  )
}