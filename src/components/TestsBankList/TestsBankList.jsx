import React, { useState, useEffect } from 'react';
import './TestsBankList.css';

const TestsBankList = ({ refreshKey }) => {
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedTestId, setExpandedTestId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [themes, setThemes] = useState([]);
    const [filters, setFilters] = useState({
        rating: 0,
        category: '',
        theme: '',
        search: ''
    });

    // Загрузка тестов
    const fetchTests = async () => {
        try {
            setLoading(true);
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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Парсинг XML теста (упрощенная версия)
    const parseTestQuestions = (xmlString) => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            const questions = Array.from(xmlDoc.getElementsByTagName("question"));

            return questions.map(q => {
                const type = q.getAttribute("type") || 'unknown';

                // Правильное извлечение текста вопроса
                const questionTextNode = q.getElementsByTagName("questiontext")[0];
                let questionText = questionTextNode?.textContent || 'Без текста вопроса';

                // Очистка текста от лишних тегов (если они есть)
                questionText = questionText.replace(/<[^>]+>/g, '').trim();

                // Извлечение названия вопроса (не категории!)
                const nameNode = q.getElementsByTagName("name")[0];
                const questionName = nameNode?.textContent || `Вопрос ${type}`;

                return {
                    type,
                    name: questionName,
                    text: questionText // Добавляем текст вопроса
                };
            });
        } catch (e) {
            console.error('Ошибка парсинга XML:', e);
            return [];
        }
    };

    // Оценка теста
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
            console.error('Ошибка оценки теста:', err);
            alert('Не удалось отправить оценку');
        }
    };

    // Сохранение теста в файл
    const saveTestToFile = (testName, xmlContent) => {
        const safeFileName = testName
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/ /g, '_');

        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeFileName || 'test'}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Фильтрация тестов
    useEffect(() => {
        let result = [...tests];

        if (filters.rating > 0) {
            result = result.filter(test =>
                Math.floor(parseFloat(test.avg_rating)) >= filters.rating
            );
        }

        if (filters.category) {
            result = result.filter(test =>
                test.category_name === filters.category
            );
        }

        if (filters.theme) {
            result = result.filter(test =>
                test.theme_name === filters.theme
            );
        }

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

    const toggleTestExpansion = (testId) => {
        setExpandedTestId(expandedTestId === testId ? null : testId);
    };

    useEffect(() => {
        fetchTests();
    }, [refreshKey]);

    if (loading) return <div className="loading">Загрузка тестов...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="tests-bank-container">
            <h2>Банк тестов</h2>

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
                            <div
                                className="test-header"
                                onClick={() => toggleTestExpansion(test.id_test)}
                            >
                                <h3>{test.test_name}</h3>
                                <span className="toggle-icon">
                                    {expandedTestId === test.id_test ? '▼' : '▶'}
                                </span>
                            </div>

                            {expandedTestId === test.id_test && (
                                <div className="test-details">
                                    {test.xml ? (
                                        (() => {
                                            const questions = parseTestQuestions(test.xml);
                                            return questions.length > 0 ? (
                                                <div className="questions-list">
                                                    <h4>Вопросы ({questions.length}):</h4>
                                                    <ul>
                                                        {questions.map((question, idx) => (
                                                            <li key={idx} className="question-item">
                                                                <div className="question-header">
                                                                    <span className="question-type-badge">{question.type}</span>
                                                                </div>
                                                                <div className="question-text">{question.text}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <p>Не удалось распознать вопросы в тесте</p>
                                            );
                                        })()
                                    ) : (
                                        <p>Тест не содержит XML данных</p>
                                    )}
                                </div>
                            )}

                            <div className="test-footer">
                                <div className="rating-info">
                                    <span className={`rating-value ${getRatingColorClass(test.avg_rating)}`}>
                                        {parseFloat(test.avg_rating).toFixed(1)} ★
                                    </span>
                                    <span>({test.rating_count} оценок)</span>
                                </div>

                                <div className="test-actions">
                                    <select
                                        value={Math.round(test.avg_rating)}
                                        onChange={(e) => rateTest(test.id_test, parseInt(e.target.value))}
                                        className="rating-select"
                                    >
                                        <option value="1">1 ★</option>
                                        <option value="2">2 ★★</option>
                                        <option value="3">3 ★★★</option>
                                        <option value="4">4 ★★★★</option>
                                        <option value="5">5 ★★★★★</option>
                                    </select>

                                    <button
                                        onClick={() => saveTestToFile(test.test_name, test.xml)}
                                        className="save-test-btn"
                                    >
                                        Скачать
                                    </button>
                                </div>
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