import React, { useState, useEffect } from 'react';
import './MoodleQuizBuilder.css';

const MoodleQuizBuilder = () => {
  
  const [sampleQuestions, setSampleQuestions] = useState([]);
  useEffect(() => {
    // Запрос на получение вопросов
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/questions`)
      .then(response => response.json())
      .then(data => {
    
        setSampleQuestions(data);
      })
      .catch(error => console.error('Ошибка при получении вопросов:', error));
  }, []);



  const [moodleXml, setMoodleXml] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [draggedQuestion, setDraggedQuestion] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    name: ''
  });

  // Получаем уникальные типы и категории для фильтров
  const questionTypes = [...new Set(sampleQuestions.map(q => q.type))];
  const questionCategories = [...new Set(sampleQuestions.map(q => q.category))];

  // Фильтрация вопросов
  const filteredQuestions = sampleQuestions.filter(question => {
    const matchesType = !filters.type || question.type === filters.type;
    const matchesCategory = !filters.category || question.category === filters.category;
    const matchesName = !filters.name ||
      question.name.toLowerCase().includes(filters.name.toLowerCase());

    return matchesType && matchesCategory && matchesName;
  });

  // Обработчик изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик начала перетаскивания
  const handleDragStart = (question, index) => {
    setDraggedQuestion({ ...question, index });
  };

  // Обработчик завершения перетаскивания
  const handleDragEnd = () => {
    setDraggedQuestion(null);
    setDragOverIndex(null);
  };

  // Обработчик touch-старта
  const handleTouchStart = (e, question, index) => {
    e.preventDefault();
    setDraggedQuestion({ ...question, index });
  };

  // Обработчик touch-перемещения
  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  // Обработчик touch-окончания
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

  // Обработчик наведения на область выбранных вопросов
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Обработчик отпускания вопроса в области выбранных (извне)
  const handleDropFromOutside = (e) => {
    e.preventDefault();
    if (draggedQuestion && !selectedQuestions.some(q => q.id === draggedQuestion.id)) {
      setSelectedQuestions([...selectedQuestions, draggedQuestion]);
    }
    setDragOverIndex(null);
  };

  // Обработчик наведения на вопрос в выбранных
  const handleDragOverQuestion = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  // Обработчик touch-перемещения внутри выбранных
  const handleTouchMoveInside = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  // Обработчик отпускания вопроса внутри выбранных
  const handleDropInsideSelected = (e, dropIndex) => {
    e.preventDefault();
    if (draggedQuestion && draggedQuestion.index !== undefined) {
      // Перемещение внутри выбранных вопросов
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

  // Генерация Moodle Quiz XML
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

  // Скачивание XML-файла
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

  return (
    <div className="moodle-quiz-builder">
      
      <div className="actions-container">
        <button
          onClick={generateMoodleQuiz}
          className={`generate-btn ${
            selectedQuestions.length === 0 ? 'disabled' : ''
          }`}
          disabled={selectedQuestions.length === 0}
        >
          Сгенерировать Moodle XML
        </button>

        <button
          onClick={downloadXml}
          className={`download-btn ${
            !moodleXml ? 'disabled' : ''
          }`}
          disabled={!moodleXml}
        >
          Скачать XML
        </button>
      </div>
      {/* Фильтры */}
      <div className="filters-container">
        <h3>Фильтры</h3>
        <div className="filters-row">
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
                <option key={type} value={type}>{type}</option>
              ))}
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
              {questionCategories.map(category => (
                <option key={category} value={category}>{category}</option>
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
            onClick={() => setFilters({ type: '', category: '', name: '' })}
            className="reset-filters-btn"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      <div className="questions-container">
        {/* Доступные вопросы */}
        <div className="question-bank">
          <h3>Банк вопросов ({filteredQuestions.length})</h3>
          <div className="question-bank-drop-area">
            {filteredQuestions.map(question => (
              !selectedQuestions.some(q => q.id === question.id) && (
                <div
                  key={question.id}
                  draggable
                  onDragStart={() => handleDragStart(question)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, question)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="question-item"
                >
                  <div><strong>{question.name}</strong></div>
                  <div className="question-meta">
                    <span>Тип: {question.type}</span>
                    <span>Категория: {question.category}</span>
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
            onDragOver={handleDragOver}
            onDrop={handleDropFromOutside}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="selected-questions-drop-area"
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
                  className={`selected-question-item ${
                    dragOverIndex === index ? 'drag-over' : ''
                  } ${
                    draggedQuestion?.id === question.id ? 'dragging' : ''
                  }`}
                >
                  <div>
                    <div><strong>{question.name}</strong></div>
                    <div className="question-meta">
                      <span>Тип: {question.type}</span>
                      <span>Категория: {question.category}</span>
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


      {moodleXml && (
        <div className="result-container">
          <h2>Результат:</h2>
          <button
            onClick={copyToClipboard}
            className="copy-btn"
          >
            Копировать XML
          </button>
          <pre className="xml-preview">
            {moodleXml}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MoodleQuizBuilder;