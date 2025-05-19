import React, { useState, useEffect } from 'react';
import './TestsBankList.css';

const TestsBankList = ({ refreshKey }) => {
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [themes, setThemes] = useState([]);
    
    // Фильтры
    const [filters, setFilters] = useState({
        rating: 0,
        category: '',
        theme: '',
        search: ''
    });

    const fetchTests = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/test-bank`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
            });

            if (!response.ok) throw new Error('Ошибка при загрузке тестов');

            const data = await response.json();
            setTests(data);
            setFilteredTests(data);
            
            // Извлекаем уникальные категории и темы
            const uniqueCategories = [...new Set(data.map(test => test.category_name))];
            const uniqueThemes = [...new Set(data.map(test => test.theme_name))];
            
            setCategories(uniqueCategories);
            setThemes(uniqueThemes);
        } catch (err) {
            setError('Не удалось загрузить тесты');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, [refreshKey]);

    // Применение фильтров
    useEffect(() => {
        let result = [...tests];
        
        // Фильтр по рейтингу
        if (filters.rating > 0) {
            result = result.filter(test => 
                Math.floor(parseFloat(test.avg_rating)) >= filters.rating
            );
        }
        
        // Фильтр по категории
        if (filters.category) {
            result = result.filter(test => 
                test.category_name === filters.category
            );
        }
        
        // Фильтр по теме
        if (filters.theme) {
            result = result.filter(test => 
                test.theme_name === filters.theme
            );
        }
        
        // Поиск по названию
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(test => 
                test.test_name.toLowerCase().includes(searchTerm)
            );
        }
        
        setFilteredTests(result);
    }, [filters, tests]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            rating: 0,
            category: '',
            theme: '',
            search: ''
        });
    };

    const rateTest = async (testId, rating) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/rate-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
                body: JSON.stringify({ id_test: testId, rating }),
            });
            if (!response.ok) throw new Error('Ошибка при отправке оценки');
            await fetchTests();
        } catch (err) {
            alert('Не удалось отправить оценку');
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="tests-bank-container">
            <h2>Все тесты</h2>
            
            {/* Панель фильтрации */}
            <div className="filter-panel">
                <div className="filter-group">
                    <label htmlFor="rating-filter">Рейтинг:</label>
                    <select
                        id="rating-filter"
                        name="rating"
                        value={filters.rating}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="0">Все тесты</option>
                        <option value="4">4 ★ и выше</option>
                        <option value="3">3 ★ и выше</option>
                        <option value="2">2 ★ и выше</option>
                        <option value="1">1 ★ и выше</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="category-filter">Категория:</label>
                    <select
                        id="category-filter"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">Все категории</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="theme-filter">Тема:</label>
                    <select
                        id="theme-filter"
                        name="theme"
                        value={filters.theme}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">Все темы</option>
                        {themes.map(theme => (
                            <option key={theme} value={theme}>{theme}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="search-filter">Поиск:</label>
                    <input
                        id="search-filter"
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Название теста"
                        className="search-input"
                    />
                </div>
                
                <button onClick={resetFilters} className="reset-filters-btn">
                    Сбросить фильтры
                </button>
                
                <div className="results-count">
                    Найдено тестов: {filteredTests.length}
                </div>
            </div>

            {/* Список тестов */}
            <div className="tests-grid">
                {filteredTests.length === 0 ? (
                    <p className="no-tests">Нет тестов, соответствующих выбранным фильтрам</p>
                ) : (
                    filteredTests.map(test => (
                        <div key={test.id_test} className="test-card">
                            <h3 className="test-title">{test.test_name}</h3>

                            <div className="test-info">
                                <p><strong>Автор:</strong> {test.username}</p>
                                <p><strong>Категория:</strong> {test.category_name}</p>
                                <p><strong>Тема:</strong> {test.theme_name}</p>
                                <p>
                                    <strong>Рейтинг:</strong>
                                    <span className={`rating-value ${getRatingColorClass(test.avg_rating)}`}>
                                        {parseFloat(test.avg_rating).toFixed(1)} ★
                                    </span>
                                </p>
                            </div>

                            <div className="rating-control">
                                <label htmlFor={`rating-${test.id_test}`}>Оценить:</label>
                                <select
                                    id={`rating-${test.id_test}`}
                                    value={test.avg_rating}
                                    onChange={(e) => rateTest(test.id_test, parseFloat(e.target.value))}
                                    className="rating-select"
                                >
                                    <option value="1">1 ★</option>
                                    <option value="2">2 ★★</option>
                                    <option value="3">3 ★★★</option>
                                    <option value="4">4 ★★★★</option>
                                    <option value="5">5 ★★★★★</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Вспомогательная функция для определения цвета рейтинга
function getRatingColorClass(rating) {
    const numRating = parseFloat(rating);
    if (numRating >= 4) return 'high-rating';
    if (numRating >= 3) return 'medium-rating';
    if (numRating >= 2) return 'low-rating';
    return 'poor-rating';
}

export default TestsBankList;