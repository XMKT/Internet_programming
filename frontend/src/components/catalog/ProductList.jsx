// Перечень товаров
import ProductCard from "./ProductCard";

function ProductList({ products }) {
    if (!products || products.length === 0) {
        return <p>Товары не найдены.</p>;
    }

    return (
        <section className="products">
            <h2>Найденные товары</h2>
            <div className="products-container">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}

export default ProductList;
