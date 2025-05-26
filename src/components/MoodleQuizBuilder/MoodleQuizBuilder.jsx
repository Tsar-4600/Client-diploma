import React, { useState, useEffect } from 'react';
import './MoodleQuizBuilder.css';

const MoodleQuizBuilder = () => {
  // Состояния для данных
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loadingThemes, setLoadingThemes] = useState(false);

  // Состояния для управления интерфейсом
  const [moodleXml, setMoodleXml] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [draggedQuestion, setDraggedQuestion] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [testName, setTestName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  // Фильтры
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    theme: '',
    name: ''
  });

  // Функция для декодирования HTML-сущностей
  const decodeHtmlEntities = (text) => {
    if (!text) return "";
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  // Функция для парсинга XML и извлечения правильных ответов
  const parseCorrectAnswers = (xml, questionType) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "text/xml");

      switch (questionType) {
        case 'multichoice':
        case 'truefalse':
          const answers = xmlDoc.getElementsByTagName("answer");
          return Array.from(answers)
            .filter(a => {
              const fractionStr = a.getAttribute("fraction");
              const fractionNum = parseFloat(fractionStr);
              return fractionStr && fractionNum > 0; // фильтр по fraction > 0
            })
            .map(a => {
              const text = a.getElementsByTagName("text")[0]?.textContent || "";
              return decodeHtmlEntities(text);
            });


        case 'shortanswer':
          const shortAnswer = xmlDoc.getElementsByTagName("answer")[0]?.textContent;
          return shortAnswer ? [decodeHtmlEntities(shortAnswer)] : ["Правильный ответ не найден"];

        case 'numerical':
          const numericalAnswer = xmlDoc.getElementsByTagName("text")[0]?.textContent;
          const tolerance = xmlDoc.getElementsByTagName("tolerance")[0]?.textContent;
          if (numericalAnswer) {
            return tolerance
              ? [`${numericalAnswer} (±${tolerance})`]
              : [numericalAnswer];
          }
          return ["Правильный ответ не найден"];

        case 'matching':
          const subquestions = xmlDoc.getElementsByTagName("subquestion");
          return Array.from(subquestions).map(sq => {
            const question = decodeHtmlEntities(
              sq.getElementsByTagName("text")[0]?.textContent || "Вопрос"
            );
            const answer = decodeHtmlEntities(
              sq.getElementsByTagName("answer")[0]?.textContent || "Ответ"
            );
            return `${question} → ${answer}`;
          });

        case 'essay':
          return ["Эссе не имеет однозначного правильного ответа"];

        default:
          return ["Неизвестный тип вопроса"];
      }
    } catch (error) {
      console.error("Ошибка парсинга XML:", error);
      return ["Не удалось проанализировать ответы"];
    }
  };

  // Функция для перевода типов вопросов
  const translateQuestionType = (type) => {
    const translations = {
      'multichoice': 'Множественный выбор',
      'truefalse': 'Верно/Неверно',
      'shortanswer': 'Короткий ответ',
      'numerical': 'Числовой ответ',
      'matching': 'Соответствие',
      'essay': 'Эссе'
    };
    return translations[type] || type;
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загрузка вопросов
        const questionsResponse = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/questions`);
        const questionsData = await questionsResponse.json();
        setSampleQuestions(questionsData);

        // Загрузка категорий
        const categoriesResponse = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/categories`);
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchData();
  }, []);

  // Загрузка тем при изменении категории
  const loadThemes = async (category) => {
    if (!category) {
      setThemes([]);
      setSelectedTheme('');
      return;
    }

    setLoadingThemes(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/themes?category=${encodeURIComponent(category)}`
      );
      const data = await response.json();
      setThemes(data);
    } catch (error) {
      console.error('Ошибка при загрузке тем:', error);
    } finally {
      setLoadingThemes(false);
    }
  };

  // Обработчики фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'category') {
      setFilters(prev => ({
        ...prev,
        category: value,
        theme: ''
      }));
      loadThemes(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Фильтрация вопросов
  const filteredQuestions = sampleQuestions.filter(question => {
    const matchesType = !filters.type || question.type === filters.type;
    const matchesCategory = !filters.category || question.category === filters.category;
    const matchesTheme = !filters.theme || (question.theme && question.theme === filters.theme);
    const matchesName = !filters.name ||
      question.name.toLowerCase().includes(filters.name.toLowerCase());

    return matchesType && matchesCategory && matchesTheme && matchesName;
  });

  // Получаем уникальные типы вопросов с переводами
  const questionTypes = [...new Set(sampleQuestions.map(q => q.type))].map(type => ({
    value: type,
    label: translateQuestionType(type)
  }));

  // Drag and Drop обработчики
  const handleDragStart = (question, index) => {
    setDraggedQuestion({ ...question, index });
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
    setDragOverIndex(null);
  };

  const handleTouchStart = (e, question, index) => {
    e.preventDefault();
    setDraggedQuestion({ ...question, index });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (draggedQuestion) {
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      if (element && element.closest('[data-drop-area]')) {
        if (!selectedQuestions.some(q => q.id === draggedQuestion.id)) {
          setSelectedQuestions([...selectedQuestions, draggedQuestion]);
        }
      }
    }
    setDraggedQuestion(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropFromOutside = (e) => {
    e.preventDefault();
    if (draggedQuestion && !selectedQuestions.some(q => q.id === draggedQuestion.id)) {
      setSelectedQuestions([...selectedQuestions, draggedQuestion]);
    }
    setDragOverIndex(null);
  };

  const handleDragOverQuestion = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleTouchMoveInside = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDropInsideSelected = (e, dropIndex) => {
    e.preventDefault();
    if (draggedQuestion && draggedQuestion.index !== undefined) {
      const newSelected = [...selectedQuestions];
      const [removed] = newSelected.splice(draggedQuestion.index, 1);
      newSelected.splice(dropIndex, 0, removed);
      setSelectedQuestions(newSelected);
    }
    setDragOverIndex(null);
  };

  // Удаление вопроса из выбранных
  const removeQuestion = (questionId) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== questionId));
  };

  // Генерация XML
  const generateMoodleQuiz = () => {
    let quizXml = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <!-- Категория вопросов -->
  <question type="category">
    <category>
      <text>$course$/top/По умолчанию для Тест</text>
    </category>
  </question>`;

    selectedQuestions.forEach(question => {
      quizXml += `\n${question.xml}`;
    });

    quizXml += `\n</quiz>`;
    setMoodleXml(quizXml);
    return quizXml;
  };

  // Скачивание XML
  const downloadXml = () => {
    const xmlContent = generateMoodleQuiz();
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moodle_quiz.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Копирование в буфер обмена
  const copyToClipboard = () => {
    navigator.clipboard.writeText(moodleXml)
      .then(() => alert('XML скопирован!'))
      .catch(err => alert(`Ошибка: ${err.message}`));
  };

  // Сохранение теста
  const saveTestToUser = async () => {
    if (!testName.trim()) {
      alert('Введите название теста');
      return;
    }

    if (!selectedTheme) {
      alert('Выберите тему для теста');
      return;
    }

    if (selectedQuestions.length === 0) {
      alert('Добавьте хотя бы один вопрос');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/save-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({
          name: testName,
          theme: selectedTheme,
          questions: selectedQuestions.map(q => q.id),
          xml: generateMoodleQuiz()
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении теста');
      }

      alert('Тест успешно сохранен!');
      setTestName('');
      setSelectedCategory('');
      setSelectedTheme('');
      setSelectedQuestions([]);
    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.message || 'Не удалось сохранить тест');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="moodle-quiz-builder">
      {/* Панель сохранения теста */}
      <div className="save-test-container">
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="Название теста"
          className="test-name-input"
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedTheme('');
            loadThemes(e.target.value);
          }}
          className="category-select"
        >
          <option value="">Выберите категорию</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="theme-select"
          disabled={!selectedCategory || loadingThemes}
        >
          <option value="">Выберите тему</option>
          {themes.map(theme => (
            <option key={theme} value={theme}>{theme}</option>
          ))}
          {loadingThemes && <option disabled>Загрузка тем...</option>}
        </select>

        <button
          onClick={saveTestToUser}
          disabled={isSaving || !testName.trim() || !selectedTheme || selectedQuestions.length === 0}
          className={`save-test-btn ${isSaving ? 'saving' : ''}`}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить тест'}
        </button>
      </div>

      {/* Панель действий */}
      <div className="actions-container">
        <button
          onClick={generateMoodleQuiz}
          disabled={selectedQuestions.length === 0}
          className={`generate-btn ${selectedQuestions.length === 0 ? 'disabled' : ''}`}
        >
          Сгенерировать Moodle XML
        </button>

        <button
          onClick={downloadXml}
          disabled={!moodleXml}
          className={`download-btn ${!moodleXml ? 'disabled' : ''}`}
        >
          Скачать XML
        </button>
      </div>

      {/* Фильтры */}
      <div className="filters-container">
        <h3>Фильтры</h3>
        <div className="filters-row">
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
              disabled={!filters.category || loadingThemes}
            >
              <option value="">Все темы</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
              {loadingThemes && <option disabled>Загрузка тем...</option>}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="type-filter">Тип вопроса:</label>
            <select
              id="type-filter"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Все типы</option>
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="name-filter">Поиск по названию:</label>
            <input
              id="name-filter"
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              className="filter-input"
              placeholder="Введите название"
            />
          </div>

          <button
            onClick={() => setFilters({ type: '', category: '', theme: '', name: '' })}
            className="reset-filters-btn"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Основной контейнер с вопросами */}
      <div className="questions-container">
        {/* Банк вопросов */}
        <div className="question-bank">
          <h3>Банк вопросов ({filteredQuestions.length})</h3>
          <div
            className="question-bank-drop-area"
            onDragOver={handleDragOver}
            onDrop={handleDropFromOutside}
          >
            {filteredQuestions.map((question, index) => (
              !selectedQuestions.some(q => q.id === question.id) && (
                <div
                  key={question.id}
                  draggable
                  onDragStart={() => handleDragStart(question, index)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, question, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="question-item"
                  data-type={question.type}
                >
                  <div><strong>{question.name}</strong></div>
                  <div className="question-meta">
                    <span>Тип: {translateQuestionType(question.type)}</span>
                    <span>Категория: {question.category}</span>
                    {question.theme && <span>Тема: {question.theme}</span>}
                  </div>
                  <div className="correct-answers">
                    <strong>Правильные ответы:</strong>
                    <ul>
                      {parseCorrectAnswers(question.xml, question.type).map((answer, i) => (
                        <li key={i}>{answer}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Выбранные вопросы */}
        <div className="selected-questions">
          <h3>Тело теста ({selectedQuestions.length})</h3>
          <div
            data-drop-area
            className="selected-questions-drop-area"
            onDragOver={handleDragOver}
            onDrop={handleDropFromOutside}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {selectedQuestions.length === 0 ? (
              <div className="empty-drop-area">
                Перетащите сюда вопросы из банка
              </div>
            ) : (
              selectedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  draggable
                  onDragStart={() => handleDragStart(question, index)}
                  onDragOver={(e) => handleDragOverQuestion(e, index)}
                  onDrop={(e) => handleDropInsideSelected(e, index)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, question, index)}
                  onTouchMove={(e) => handleTouchMoveInside(e, index)}
                  onTouchEnd={handleTouchEnd}
                  className={`selected-question-item ${dragOverIndex === index ? 'drag-over' : ''} ${draggedQuestion?.id === question.id ? 'dragging' : ''}`}
                >
                  <div>
                    <div><strong>{question.name}</strong></div>
                    <div className="question-meta">
                      <span>Тип: {translateQuestionType(question.type)}</span>
                      <span>Категория: {question.category}</span>
                      {question.theme && <span>Тема: {question.theme}</span>}
                    </div>
                    <div className="correct-answers">
                      <strong>Правильные ответы:</strong>
                      <ul>
                        {parseCorrectAnswers(question.xml, question.type).map((answer, i) => (
                          <li key={i}>{answer}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="question-controls">
                    <span className="question-index">{index + 1}</span>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="remove-question-btn"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Предпросмотр XML */}
      {moodleXml && (
        <div className="result-container">
          <div className="result-header">
            <h2>Результат:</h2>
            <button
              onClick={copyToClipboard}
              className="copy-btn"
            >
              Копировать XML
            </button>
          </div>
          <pre className="xml-preview">
            {moodleXml}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MoodleQuizBuilder;