import React, { useState, useEffect } from 'react';
import './MyQuestionList.css';

const MyQuestionList = ({ refreshTrigger }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для загрузки вопросов
  const fetchQuestions = async () => {
    try {
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

  // Функция для удаления вопроса
  const deleteQuestion = async (questionId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
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

  // Загружаем вопросы при монтировании компонента
  useEffect(() => {
    fetchQuestions();
  }, [refreshTrigger]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="question-list-container">

      {questions.length === 0 ? (
        <p className="no-questions">Вопросы не найдены</p>
      ) : (
        <ul className="questions-grid">
          {questions.map(question => (
            <li key={question.id} className="question-card">
              <div className="question-content">
                <h3 className="question-name">{question.name}</h3>
                <p className="question-meta">
                  <span className="question-type">{question.type}</span>
                  <span className="question-category">{question.category}</span>
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
  );
};

export default MyQuestionList;