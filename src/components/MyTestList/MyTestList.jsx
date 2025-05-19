import React, { useState, useEffect } from 'react';
import './MyTestList.css';

const MyTestList = ({ onActionComplete }) => {
    const [tests, setTests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        theme: ''
    });

    // Единственный запрос для получения всех данных
    const fetchTests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('jwtToken');
            
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-tests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Не удалось загрузить тесты');
            }

            const { data } = await response.json();
            setTests(data || []);

            // Извлекаем категории и темы из полученных тестов
            const uniqueCategories = [...new Set(data.map(test => test.category))].filter(Boolean);
            const uniqueThemes = [...new Set(data.map(test => test.theme))].filter(Boolean);
            
            setCategories(uniqueCategories);
            setThemes(uniqueThemes);

        } catch (err) {
            setError(err.message);
            console.error('Ошибка загрузки тестов:', err);
        } finally {
            setLoading(false);
        }
    };

    // Удаление теста
    const deleteTest = async (testId) => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-tests/${testId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Не удалось удалить тест');
            }

            await fetchTests(); // Перезагружаем тесты после удаления
            if (onActionComplete) onActionComplete();
        } catch (err) {
            setError(err.message);
            console.error('Ошибка удаления теста:', err);
        }
    };

    // Переключение статуса теста
    const toggleTestStatus = async (testId, currentStatus) => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-tests/${testId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ public: !currentStatus })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Не удалось изменить статус теста');
            }

            await fetchTests(); // Перезагружаем тесты после изменения
            if (onActionComplete) onActionComplete();
        } catch (err) {
            setError(err.message);
            console.error('Ошибка изменения статуса теста:', err);
        }
    };

    // Фильтрация тестов
    const filteredTests = tests.filter(test => {
        const matchesCategory = !filters.category || test.category === filters.category;
        const matchesTheme = !filters.theme || test.theme === filters.theme;
        return matchesCategory && matchesTheme;
    });

    // Обработчик изменения фильтров
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'category' ? { theme: '' } : {}) // Сбрасываем тему при смене категории
        }));
    };

    // Сброс фильтров
    const resetFilters = () => {
        setFilters({ category: '', theme: '' });
    };

    // Загрузка данных при монтировании
    useEffect(() => {
        fetchTests();
    }, []);

    if (loading) return <div className="loading">Загрузка тестов...</div>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="test-list-container">
            <h2>Мои Тесты</h2>
            
            {/* Панель фильтров */}
            <div className="filters-panel">
                <div className="filter-group">
                    <label>Категория:</label>
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                    >
                        <option value="">Все категории</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Тема:</label>
                    <select
                        name="theme"
                        value={filters.theme}
                        onChange={handleFilterChange}
                        disabled={!filters.category}
                    >
                        <option value="">Все темы</option>
                        {themes
                            .filter(theme => 
                                !filters.category || 
                                tests.some(test => test.category === filters.category && test.theme === theme)
                            )
                            .map((theme, index) => (
                                <option key={index} value={theme}>{theme}</option>
                            ))
                        }
                    </select>
                </div>

                <button onClick={resetFilters} className="reset-filters-btn">
                    Сбросить фильтры
                </button>
            </div>

            {/* Список тестов */}
            {filteredTests.length === 0 ? (
                <p className="no-tests">
                    {tests.length === 0 ? 'У вас пока нет тестов' : 'Тесты не найдены по выбранным фильтрам'}
                </p>
            ) : (
                <div className="tests-grid">
                    {filteredTests.map(test => (
                        <div key={test.id} className="test-card">
                            <div className="test-content">
                                <h3 className="test-name">{test.name}</h3>
                                <div className="test-meta">
                                    <span className="test-category">{test.category}</span>
                                    {test.theme && <span className="test-theme">{test.theme}</span>}
                                    <span className={`test-status ${test.public ? 'public' : 'private'}`}>
                                        {test.public ? 'Публичный' : 'Приватный'}
                                    </span>
                                </div>
                            </div>
                            <div className="test-actions">
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteTest(test.id)}
                                    title="Удалить тест"
                                >
                                    ×
                                </button>
                                <button
                                    className={`status-toggle-btn ${test.public ? 'public' : 'private'}`}
                                    onClick={() => toggleTestStatus(test.id, test.public)}
                                    title={test.public ? 'Сделать приватным' : 'Сделать публичным'}
                                >
                                    {test.public ? '🌐' : '🔒'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTestList;