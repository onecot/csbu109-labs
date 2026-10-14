const PLACEHOLDER = "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Example_image.svg/960px-Example_image.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"

export default function ProductCard({ name, price, image = PLACEHOLDER, selected = false, onSelect }) {
  return (
    <div className={selected ? 'card selected' : 'card'} onClick={onSelect}>
      {price < 20 && <span className="badge">Low price!</span>}
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>{price.toLocaleString()} USD</p>
    </div>
  )
}
