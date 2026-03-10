<!doctype html>
<html lang="ru">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/static/styles.css" />
        <title>Профиль - Незабудка</title>
    </head>
    <body>
        <header>
            <h1>Незабудка</h1>
            <nav>
                <ul>
                    <li><a href="/">Главная</a></li>
                    <li><a href="cart">Корзина</a></li>
                    <li><a href="profile">Профиль</a></li>
                </ul>
            </nav>
        </header>

        <main class="cart-page">
            <!-- Заголовок страницы -->
            <h2 class="page-title">Корзина</h2>

            <!-- Основная секция корзины -->
            <section class="cart-section">
                <!-- Форма корзины для отправки данных -->
                <form id="cart-form" method="post" action="/update-cart">
                    <table class="cart-table">
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
                            <!-- Товар 1 - данные из БД -->
                            <tr
                                class="cart-item"
                                data-product-id="123"
                                data-price="3500"
                            >
                                <td class="product-info">
                                    <div class="product-details">
                                        <span class="product-name"
                                            >Плашка DDR4 8GB</span
                                        >
                                    </div>
                                </td>
                                <td class="product-price">3 500 ₽</td>
                                <td class="product-quantity">
                                    <div class="quantity-control">
                                        <button
                                            type="button"
                                            class="quantity-btn minus"
                                            onclick="updateQuantity(123, -1)"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            name="quantity-123"
                                            value="2"
                                            min="1"
                                            max="99"
                                            class="quantity-input"
                                            data-product-id="123"
                                        />
                                        <button
                                            type="button"
                                            class="quantity-btn plus"
                                            onclick="updateQuantity(123, 1)"
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>
                                <td class="product-total" data-total="7000">
                                    7 000 ₽
                                </td>
                                <td class="product-action">
                                    <button
                                        type="button"
                                        class="remove-btn"
                                        onclick="removeFromCart(123)"
                                        title="Удалить товар"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>

                            <!-- Товар 2 - для примера -->
                            <tr
                                class="cart-item"
                                data-product-id="456"
                                data-price="5500"
                            >
                                <td class="product-info">
                                    <div class="product-details">
                                        <span class="product-name"
                                            >SSD 480GB</span
                                        >
                                    </div>
                                </td>
                                <td class="product-price">5 500 ₽</td>
                                <td class="product-quantity">
                                    <div class="quantity-control">
                                        <button
                                            type="button"
                                            class="quantity-btn minus"
                                            onclick="updateQuantity(456, -1)"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            name="quantity-456"
                                            value="1"
                                            min="1"
                                            max="99"
                                            class="quantity-input"
                                            data-product-id="456"
                                        />
                                        <button
                                            type="button"
                                            class="quantity-btn plus"
                                            onclick="updateQuantity(456, 1)"
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>
                                <td class="product-total" data-total="5500">
                                    5 500 ₽
                                </td>
                                <td class="product-action">
                                    <button
                                        type="button"
                                        class="remove-btn"
                                        onclick="removeFromCart(456)"
                                        title="Удалить товар"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>

                <!-- Блок с итогами -->
                <div class="cart-footer">
                    <div class="cart-summary">
                        <div class="summary-row">
                            <span class="summary-label">Товаров:</span>
                            <span class="summary-value" id="total-items"
                                >2</span
                            >
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Общая сумма:</span>
                            <span
                                class="summary-value summary-total"
                                id="cart-total"
                                >12 500 ₽</span
                            >
                        </div>
                    </div>

                    <div class="cart-actions">
                        <button
                            type="button"
                            class="continue-btn"
                            onclick="location.href = 'init.html'"
                        >
                            Продолжить покупки
                        </button>
                        <button
                            type="button"
                            class="checkout-btn"
                            id="checkout-btn"
                            onclick="checkout()"
                        >
                            Оформить заказ
                        </button>
                        <button
                            type="button"
                            class="clear-btn"
                            id="clear-cart-btn"
                            onclick="clearCart()"
                        >
                            Очистить корзину
                        </button>
                    </div>
                </div>
            </section>
        </main>

        <footer>
            <p>&copy; 2026 ННГУ им Лобачевского. Все права защищены.</p>
        </footer>

        <script>
            function updateQuantity(productId, change) {
                // Функция для обновления количества через БД
                console.log(
                    "Обновить количество товара",
                    productId,
                    "на",
                    change,
                );
            }

            function removeFromCart(productId) {
                // Функция для удаления товара
                console.log("Удалить товар", productId);
            }

            function clearCart() {
                // Функция для очистки корзины
                console.log("Очистить корзину");
            }

            function checkout() {
                // Функция для оформления заказа
                console.log("Оформить заказ");
            }
        </script>
    </body>
</html>
