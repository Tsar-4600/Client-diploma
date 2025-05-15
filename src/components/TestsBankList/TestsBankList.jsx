import React, { useState, useEffect } from 'react';
import './TestsBankList.css';

const TestsBankList = ({ refreshKey }) => {
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ratingFilter, setRatingFilter] = useState(0); // 0 = все тесты

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
            setFilteredTests(data); // Инициализируем отфильтрованные тесты
        } catch (err) {
            setError('Не удалось загрузить тесты');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, [refreshKey]);

    // Фильтрация тестов по рейтингу
    useEffect(() => {
        if (ratingFilter === 0) {
            setFilteredTests(tests);
        } else {
            const filtered = tests.filter(test => 
                Math.floor(parseFloat(test.avg_rating)) >= ratingFilter
            );
            setFilteredTests(filtered);
        }
    }, [ratingFilter, tests]);

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
            {/* Панель фильтрации */}
            <div className="filter-panel">
                <label htmlFor="rating-filter">Фильтр по рейтингу:</label>
                <select
                    id="rating-filter"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(Number(e.target.value))}
                    className="filter-select"
                >
                    <option value="0">Все тесты</option>
                    <option value="4">4 ★ и выше</option>
                    <option value="3">3 ★ и выше</option>
                    <option value="2">2 ★ и выше</option>
                    <option value="1">1 ★ и выше</option>
                </select>
                
                <div className="results-count">
                    Найдено тестов: {filteredTests.length}
                </div>
            </div>

            {/* Список тестов */}
            <div className="tests-grid">
                {filteredTests.length === 0 ? (
                    <p className="no-tests">Нет тестов, соответствующих выбранному фильтру</p>
                ) : (
                    filteredTests.map(test => (
                        <div key={test.id_test} className="test-card">
                            <h3 className="test-title">{test.test_name}</h3>

                            <div className="test-info">
                                <p><strong>Автор:</strong> {test.username}</p>
                                <p><strong>Категория:</strong> {test.category_name}</p>
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