import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Базовый URL API (если нужно, можно вынести в .env файл)
    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000";

    // Загрузка корзины при монтировании компонента
    useEffect(() => {
        fetchCart();
    }, []);

    // Получение корзины с сервера
    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(
                        "API endpoint не найден. Проверьте правильность URL",
                    );
                }
                throw new Error(`Ошибка загрузки корзины: ${response.status}`);
            }

            // Проверяем, что ответ - JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Получен не JSON ответ:", text.substring(0, 200));
                throw new Error("Сервер вернул неверный формат данных");
            }

            const data = await response.json();
            setCartItems(data.cart || []);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Ошибка:", err);
        } finally {
            setLoading(false);
        }
    };

    // Обновление количества товара
    const updateQuantity = async (productId, change) => {
        const item = cartItems.find((item) => item.product_id === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;
        if (newQuantity < 1 || newQuantity > 99) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: newQuantity,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Ошибка обновления количества: ${response.status}`,
                );
            }

            // Обновляем локальное состояние
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.product_id === productId
                        ? { ...item, quantity: newQuantity }
                        : item,
                ),
            );
        } catch (err) {
            console.error("Ошибка:", err);
            setError(err.message);
        }
    };

    // Удаление товара из корзины
    const removeFromCart = async (productId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/cart/item/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`Ошибка удаления товара: ${response.status}`);
            }

            // Обновляем локальное состояние
            setCartItems((prevItems) =>
                prevItems.filter((item) => item.product_id !== productId),
            );
        } catch (err) {
            console.error("Ошибка:", err);
            setError(err.message);
        }
    };

    // Очистка всей корзины
    const clearCart = async () => {
        if (!window.confirm("Вы уверены, что хотите очистить корзину?")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/clear`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка очистки корзины: ${response.status}`);
            }

            setCartItems([]);
        } catch (err) {
            console.error("Ошибка:", err);
            setError(err.message);
        }
    };

    // Оформление заказа
    const checkout = async () => {
        if (cartItems.length === 0) {
            alert("Корзина пуста");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                // Пробуем получить детали ошибки
                try {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.detail ||
                            `Ошибка оформления заказа: ${response.status}`,
                    );
                } catch (e) {
                    // Если не удалось распарсить JSON ошибки
                    throw new Error(
                        `Ошибка оформления заказа: ${response.status}`,
                    );
                }
            }

            const data = await response.json();
            alert(`Заказ №${data.order_id} успешно оформлен!`);

            // Очищаем корзину после успешного заказа
            setCartItems([]);
        } catch (err) {
            console.error("Ошибка:", err);
            setError(err.message);
        }
    };

    // Форматирование цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
    };

    // Подсчет итогов
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    if (loading) {
        return (
            <>
                <Header />
                <main className="cart-page">
                    <div className="loading">Загрузка корзины...</div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="cart-page">
                <h2 className="page-title">Корзина</h2>

                {error && (
                    <div className="error-message">
                        <p>Ошибка: {error}</p>
                        <p>
                            Проверьте, что сервер запущен по адресу:{" "}
                            {API_BASE_URL}
                        </p>
                        <button onClick={fetchCart}>Повторить</button>
                    </div>
                )}

                <section className="cart-section">
                    <form id="cart-form">
                        <table className="cart-table">
                            <thead>
                                <tr>
                                    <th>Товар</th>
                                    <th>Цена</th>
                                    <th>Количество</th>
                                    <th>Сумма</th>
                                    <th>Действие</th>
                                </tr>
                            </thead>
                            <tbody id="cart-items">
                                {cartItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-cart">
                                            Корзина пуста
                                        </td>
                                    </tr>
                                ) : (
                                    cartItems.map((item) => (
                                        <tr
                                            key={item.product_id}
                                            className="cart-item"
                                            data-product-id={item.product_id}
                                            data-price={item.price}
                                        >
                                            <td className="product-info">
                                                <div className="product-details">
                                                    <div className="product-info-text">
                                                        <span className="product-name">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="product-price">
                                                {formatPrice(item.price)}
                                            </td>
                                            <td className="product-quantity">
                                                <div className="quantity-control">
                                                    <button
                                                        type="button"
                                                        className="quantity-btn minus"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.product_id,
                                                                -1,
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity <= 1
                                                        }
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        name={`quantity-${item.product_id}`}
                                                        value={item.quantity}
                                                        min="1"
                                                        max="99"
                                                        className="quantity-input"
                                                        data-product-id={
                                                            item.product_id
                                                        }
                                                        readOnly
                                                    />
                                                    <button
                                                        type="button"
                                                        className="quantity-btn plus"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.product_id,
                                                                1,
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity >= 99
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td
                                                className="product-total"
                                                data-total={
                                                    item.price * item.quantity
                                                }
                                            >
                                                {formatPrice(
                                                    item.price * item.quantity,
                                                )}
                                            </td>
                                            <td className="product-action">
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.product_id,
                                                        )
                                                    }
                                                    title="Удалить товар"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </form>

                    <div className="cart-footer">
                        <div className="cart-summary">
                            <div className="summary-row">
                                <span className="summary-label">Товаров:</span>
                                <span
                                    className="summary-value"
                                    id="total-items"
                                >
                                    {totalItems}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">
                                    Общая сумма:
                                </span>
                                <span
                                    className="summary-value summary-total"
                                    id="cart-total"
                                >
                                    {formatPrice(cartTotal)}
                                </span>
                            </div>
                        </div>

                        <div className="cart-actions">
                            <button
                                type="button"
                                className="continue-btn"
                                onClick={() => (window.location.href = "/")}
                            >
                                Продолжить покупки
                            </button>
                            <button
                                type="button"
                                className="checkout-btn"
                                id="checkout-btn"
                                onClick={checkout}
                                disabled={cartItems.length === 0}
                            >
                                Оформить заказ
                            </button>
                            <button
                                type="button"
                                className="clear-btn"
                                id="clear-cart-btn"
                                onClick={clearCart}
                                disabled={cartItems.length === 0}
                            >
                                Очистить корзину
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default Cart;
