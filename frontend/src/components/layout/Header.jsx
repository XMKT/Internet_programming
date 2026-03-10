// Шапка
import { Link } from "react-router-dom";

function Header() {
    return (
        <header>
            <h1>Незабудка</h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Главная</Link>
                    </li>
                    <li>
                        <Link to="/cart">Корзина</Link>
                    </li>
                    <li>
                        <Link to="/profile">Профиль</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
