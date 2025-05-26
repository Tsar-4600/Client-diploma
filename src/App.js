
import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import TestConstructor from './pages/TestConstructor';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import Register from './pages/Register';
import QuestionBank from './pages/QuestionBank';
import TestBank from './pages/TestBank';
import AdminPanel from './pages/AdminPanel';




function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Для индикации загрузки/проверки токена

    // Эффект для проверки токена при загрузке приложения
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('jwtToken');

            if (token) {
                try {
                    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/validate-token`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Ответ сервера:', data);
                        setIsAuthenticated(true);
                        setUserRole(data.role); //
                        console.log('Роль пользователя:', data.role);
                    } else {
                        console.log('Ответ не OK, статус:', response.status);
                        localStorage.removeItem('jwtToken');
                        setIsAuthenticated(false);
                        setUserRole(null);
                    }
                } catch (error) {
                    console.error('Ошибка при проверке токена:', error);
                    localStorage.removeItem('jwtToken');
                    setIsAuthenticated(false);
                    setUserRole(null);
                }
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
            }
            setIsLoadingAuth(false);
        };

        checkAuthStatus();
    }, []);

    // Функция для выхода (уже есть, но добавим console.log для наглядности)
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setIsAuthenticated(false);
        setUserRole(null);
        console.log('Пользователь вышел. Состояние isAuthenticated обновлено.');
        // Если нужно перенаправить после выхода, используйте useNavigate здесь
        // navigate('/');
    };

    // Если идет проверка токена, можно показать загрузку
    if (isLoadingAuth) {
        return <div>Загрузка аутентификации...</div>;
    }

    return (
        <div className="App">
            <div className="app-container">
                <nav className="sidebar">
                    <ul className="menu-list">
                        <li className="menu-item">
                            <Link to="/" className="menu-link">Главная</Link>
                        </li>
                        <li className="menu-item">
                            {/* Ссылка на конструктор видна только авторизованным */}
                            {isAuthenticated && (
                                <Link to="/test-constructor" className="menu-link">Конструктор теста</Link>
                            )}
                        </li>
                        <li className="menu-item">
                            {/* Ссылка на конструктор видна только авторизованным */}
                            {isAuthenticated && (
                                <Link to="/test-bank" className="menu-link">Банк тестов</Link>
                            )}
                        </li>
                        <li className="menu-item">
                            {/* Ссылка навидна только авторизованным */}
                            {isAuthenticated && (
                                <Link to="/question-bank" className="menu-link">Банк вопросов</Link>
                            )}
                        </li>
                        <li className="menu-item">
                            {/* Ссылка навидна только авторизованным  админам */}
                            {isAuthenticated && userRole === 2 && (
                                <Link to="/admin-panel" className="menu-link">Админ Панель</Link>
                            )}
                        </li>
                        {/* Ссылки на авторизацию и регистрацию видны только НЕ авторизованным */}
                        {!isAuthenticated && (
                            <>
                                <li className="menu-item">
                                    <Link to="/auth" className="menu-link">Авторизация</Link>
                                </li>
                                <li className="menu-item">
                                    <Link to="/register" className="menu-link">Регистрация</Link>
                                </li>
                            </>
                        )}
                        {/* Ссылка на выход видна только авторизованным */}
                        {isAuthenticated && (
                            <li className="menu-item">
                                {/* Можно использовать кнопку или Link с обработчиком */}
                                <Link onClick={handleLogout} className="menu-link">Выход</Link>
                            </li>
                        )}
                    </ul>
                </nav>

                <div className="page-background">
                    <Routes>
                        <Route path="/" element={<Home />} />

                        {/* Защищенный маршрут */}
                        <Route
                            path="/test-constructor"
                            element={isAuthenticated ? <TestConstructor /> : <Navigate to="/auth" replace />}
                        />
                        {/* Защищенный маршрут */}
                        <Route
                            path="/test-bank"
                            element={isAuthenticated ? <TestBank /> : <Navigate to="/auth" replace />}
                        />
                        {/* Защищенный маршрут */}
                        <Route
                            path="/question-bank"
                            element={isAuthenticated ? <QuestionBank /> : <Navigate to="/auth" replace />}
                        />
                        {/* Защищенный маршрут Админ */}
                        <Route
                            path="/admin-panel"
                            element={isAuthenticated && userRole === 2 ? <AdminPanel /> : <Navigate to="/auth" replace />}
                        />

                        {/* Маршруты авторизации и регистрации - перенаправляем, если уже авторизован */}
                        <Route
                            path="/auth"

                            element={isAuthenticated ? <Navigate to="/" replace /> : <Auth setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}
                        />
                        <Route
                            path="/register"
                            element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default App;
