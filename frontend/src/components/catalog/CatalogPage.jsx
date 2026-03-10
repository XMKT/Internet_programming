// Каталог
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "./SearchBar";
import ProductList from "./ProductList";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

function CatalogPage() {
    // Получаем параметры поиска из URL
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const categoryId = searchParams.get("category") || "all";

    // Состояния компонента
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка категорий (один раз при загрузке)
    useEffect(() => {
        fetch("http://localhost:8000/api/categories")
            .then((res) => res.json())
            .then((data) => setCategories(data.categories))
            .catch((err) => console.error("Ошибка загрузки категорий:", err));
    }, []);

    // Загрузка товаров (при изменении поиска)
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Формируем запрос к API
                let url = "http://localhost:8000/api/products";
                const params = new URLSearchParams();
                if (query) params.append("q", query);
                if (categoryId && categoryId !== "all")
                    params.append("category", categoryId);

                if (params.toString()) {
                    url += "?" + params.toString();
                }

                const response = await fetch(url);
                const data = await response.json();
                setProducts(data.products);
                setError(null);
            } catch (err) {
                setError("Не удалось загрузить товары");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query, categoryId]); // Зависимости: перезагружаем при изменении поиска

    return (
        <>
            <Header />

            <main>
                <SearchBar
                    initialQuery={query}
                    initialCategory={categoryId}
                    categories={categories}
                />

                {loading && <p>Загрузка...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && <ProductList products={products} />}
            </main>

            <Footer />
        </>
    );
}

export default CatalogPage;
