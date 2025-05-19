import React, { useState, useEffect } from 'react';
import './MyQuestionList.css';

const MyQuestionList = ({ refreshTrigger }) => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    theme: '',
    type: ''
  });

  // Функция для загрузки вопросов
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-questions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить вопросы');
      }

      const data = await response.json();
      setQuestions(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Функция для загрузки категорий
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  // Функция для загрузки тем
  const fetchThemes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/themes`);
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки тем:', err);
    }
  };

  // Функция для удаления вопроса
  const deleteQuestion = async (questionId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить вопрос');
      }

      // Обновляем список после удаления
      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  // Применение фильтров при изменении вопросов или фильтров
  useEffect(() => {
    const filtered = questions.filter(question => {
      const matchesCategory = !filters.category || question.category === filters.category;
      const matchesTheme = !filters.theme || question.theme === filters.theme;
      const matchesType = !filters.type || question.type === filters.type;
      
      return matchesCategory && matchesTheme && matchesType;
    });
    
    setFilteredQuestions(filtered);
  }, [questions, filters]);

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      category: '',
      theme: '',
      type: ''
    });
  };

  // Получаем уникальные темы для выбранной категории
  const getFilteredThemes = () => {
    if (!filters.category) return themes;
    
    return Array.from(new Set(
      questions
        .filter(q => q.category === filters.category)
        .map(q => q.theme)
        .filter(Boolean) // Убираем возможные undefined
    ));
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchQuestions();
    fetchCategories();
    fetchThemes();
  }, [refreshTrigger]);

  if (loading) return <div className="loading">Загрузка вопросов...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="question-list-container">
      {/* Панель фильтрации */}
      <div className="filters-panel">
        <h3>Фильтр вопросов</h3>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Категория:</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({
                ...filters, 
                category: e.target.value,
                theme: '' // Сбрасываем тему при смене категории
              })}
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
              value={filters.theme}
              onChange={(e) => setFilters({...filters, theme: e.target.value})}
              disabled={!filters.category}
            >
              <option value="">Все темы</option>
              {getFilteredThemes().map((theme, index) => (
                <option key={index} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Тип вопроса:</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">Все типы</option>
              <option value="multichoice">Множественный выбор</option>
              <option value="truefalse">True/False</option>
              <option value="shortanswer">Короткий ответ</option>
              <option value="numerical">Числовой</option>
              <option value="matching">Соответствие</option>
              <option value="essay">Эссе</option>
            </select>
          </div>

          <button 
            onClick={resetFilters} 
            className="reset-filters-btn"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Список вопросов */}
      <div className="questions-section">
        <div className="questions-header">
          <h3>Найдено вопросов: {filteredQuestions.length}</h3>
        </div>

        {filteredQuestions.length === 0 ? (
          <p className="no-questions">
            {questions.length === 0 
              ? 'У вас пока нет вопросов' 
              : 'Вопросы не найдены по выбранным фильтрам'}
          </p>
        ) : (
          <ul className="questions-grid">
            {filteredQuestions.map(question => (
              <li key={question.id} className="question-card">
                <div className="question-content">
                  <h3 className="question-name">{question.name}</h3>
                  <p className="question-meta">
                    <span className="question-type">{question.type}</span>
                    <span className="question-category">{question.category}</span>
                    {question.theme && <span className="question-theme">{question.theme}</span>}
                  </p>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteQuestion(question.id)}
                  aria-label="Удалить вопрос"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyQuestionList;