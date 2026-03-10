// Поисковая строка
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar({ initialQuery, initialCategory, categories }) {
    const [query, setQuery] = useState(initialQuery || "");
    const [category, setCategory] = useState(initialCategory || "all");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault(); // Не перезагружаем страницу

        // Формируем URL с параметрами поиска
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (category && category !== "all") params.append("category", category);

        // Обновляем URL без перезагрузки страницы
        navigate(`/?${params.toString()}`);

        // Здесь можно вызвать функцию поиска из родителя
        // или просто navigate обновит компонент с новыми параметрами
    };

    return (
        <section className="search-section">
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="search-query">Поиск:</label>
                    <input
                        type="search"
                        id="search-query"
                        placeholder="Например, DDR4..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="category">Категория:</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="all">Все категории</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit">Найти</button>
            </form>
        </section>
    );
}

export default SearchBar;
