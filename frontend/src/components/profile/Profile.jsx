import React, { useState, useEffect } from "react";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Базовый URL API (если нужно, можно вынести в .env файл)
    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000";

    // Загрузка профиля при монтировании компонента
    useEffect(() => {
        fetchProfile();
    }, []);

    // Получение профиля с сервера
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
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
                throw new Error(`Ошибка загрузки профиля: ${response.status}`);
            }

            // Проверяем, что ответ - JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Получен не JSON ответ:", text.substring(0, 200));
                throw new Error("Сервер вернул неверный формат данных");
            }

            const data = await response.json();
            setProfile(data.profile);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Ошибка:", err);
        } finally {
            setLoading(false);
        }
    };

    // Выход из системы
    const handleLogout = () => {
        if (window.confirm("Вы уверены, что хотите выйти?")) {
            // Логика выхода (очистка localStorage/cookies, редирект)
            console.log("Выход из системы");
            // Например:
            // localStorage.removeItem('token');
            window.location.href = "/";
        }
    };

    if (loading) {
        return (
            <main>
                <div className="loading">Загрузка профиля...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className="error-message">
                    <p>Ошибка: {error}</p>
                    <p>
                        Проверьте, что сервер запущен по адресу: {API_BASE_URL}
                    </p>
                    <button onClick={fetchProfile}>Повторить</button>
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main>
                <div className="error-message">
                    <p>Профиль не найден</p>
                    <button onClick={fetchProfile}>Повторить</button>
                </div>
            </main>
        );
    }

    return (
        <main>
            <section className="profile-info">
                <h2 className="page-title">Ваш профиль</h2>

                {/* SVG Аватар */}
                <svg
                    className="profile-avatar"
                    width="240px"
                    height="236px"
                    viewBox="0 0 240 236"
                >
                    <path
                        fillRule="evenodd"
                        fill="rgb(224, 224, 224)"
                        d="M239.456,202.1000 C238.526,246.000 0.453,246.000 0.453,202.1000 C0.453,167.654 0.453,139.000 119.955,139.000 C238.526,139.000 240.220,167.663 239.456,202.1000 ZM120.500,129.636 C84.878,129.636 55.1000,100.759 55.1000,65.136 C55.1000,29.514 84.878,0.636 120.500,0.636 C156.122,0.636 184.1000,29.514 184.1000,65.136 C184.1000,100.759 156.122,129.636 120.500,129.636 Z"
                    />
                </svg>

                {/* Данные профиля */}
                <dl className="profile-details">
                    <div className="profile-row">
                        <dt>ФИО:</dt>
                        <dd>{profile.full_name}</dd>
                    </div>
                    <div className="profile-row">
                        <dt>Почта:</dt>
                        <dd>{profile.email}</dd>
                    </div>
                    <div className="profile-row">
                        <dt>Телефон:</dt>
                        <dd>{profile.phone || "Не указан"}</dd>
                    </div>
                    <div className="profile-row">
                        <dt>Пароль:</dt>
                        <dd>••••••</dd>
                    </div>
                </dl>

                <div className="profile-actions">
                    <button className="logout-btn" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </section>
        </main>
    );
};

export default Profile;
