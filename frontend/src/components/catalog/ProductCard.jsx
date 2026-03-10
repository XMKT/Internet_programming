// Карточка товара (миниатюра)
import { useNavigate } from "react-router-dom";
import SpecificationsTable from "./SpecificationsTable";

function ProductCard({ product }) {
    const navigate = useNavigate();

    // Функция добавления в корзину
    const handleAddToCart = async (e) => {
        e.preventDefault(); // Останавливаем отправку формы (в React формы не отправляем)

        try {
            const response = await fetch("http://localhost:8000/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id }),
            });

            if (response.ok) {
                // Можно показать уведомление или обновить счетчик корзины
                alert("Товар добавлен в корзину!");
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    };

    // Заглушка для картинки, если нет фото
    const imageUrl =
        product.image_url ||
        "https://via.placeholder.com/320x250?text=Нет+фото";

    return (
        <article className="product-card">
            <img src={imageUrl} alt={product.name} />

            <h3>{product.name}</h3>

            <div className="price-form-container">
                <div className="price">{product.price} ₽</div>

                {/* Вместо формы POST - fetch запрос */}
                <button onClick={handleAddToCart} className="order-btn">
                    +
                </button>
            </div>

            <div className="additional-information">
                {product.description && <p>{product.description}</p>}

                {/* Компонент характеристик */}
                <SpecificationsTable
                    characteristics={product.characteristics}
                />
            </div>
        </article>
    );
}

export default ProductCard;
