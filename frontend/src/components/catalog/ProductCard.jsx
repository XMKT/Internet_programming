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
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="25"
                        viewBox="0 0 25 25"
                    >
                        <path
                            fill-rule="evenodd"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                            d="M19,19 L12,19 L8,19 L6,19 L4,11 L6,11 L10,4 L14,4 L18,11 L20,11 L19,19 Z"
                        />

                        <path
                            fill-rule="evenodd"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                            d="M9,11 L9,14"
                        />

                        <path
                            fill-rule="evenodd"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                            d="M15,11 L15,14"
                        />
                    </svg>
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
