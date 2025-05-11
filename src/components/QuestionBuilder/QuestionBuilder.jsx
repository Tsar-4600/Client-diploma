import React, { useState, useReducer } from 'react';
import './QuestionBuilder.css';

const initialQuestionState = {
  questionType: 'multichoice',
  name: '',
  questionText: '',
  defaultGrade: 1,
  penalty: 0.33,
  hidden: 0,
  answers: [{ text: '', isCorrect: false }],
  shuffleAnswers: true,
  single: true,
  shortAnswer: '',
  numericalAnswer: '',
  tolerance: 0,
  matchingPairs: [{ question: '', answer: '' }],
  essaySettings: {
    responseFormat: 'editor',
    responseRequired: 1,
    responseFieldLines: 15,
    attachments: 0,
    attachmentsRequired: 0,
  },
};

function questionReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ANSWER':
      const newAnswers = [...state.answers];
      newAnswers[action.index][action.field] = action.value;
      return { ...state, answers: newAnswers };
    case 'ADD_ANSWER':
      return { ...state, answers: [...state.answers, { text: '', isCorrect: false }] };
    case 'REMOVE_ANSWER':
      return {
        ...state,
        answers: state.answers.filter((_, i) => i !== action.index),
      };
    case 'SET_CORRECT':
      const answers = [...state.answers];
      if (state.single) {
        answers.forEach((ans, i) => {
          ans.isCorrect = i === action.index ? action.checked : false;
        });
      } else {
        answers[action.index].isCorrect = action.checked;
      }
      return { ...state, answers };
    case 'SET_MATCHING_PAIR':
      const pairs = [...state.matchingPairs];
      pairs[action.index][action.field] = action.value;
      return { ...state, matchingPairs: pairs };
    case 'ADD_MATCHING_PAIR':
      return { ...state, matchingPairs: [...state.matchingPairs, { question: '', answer: '' }] };
    case 'REMOVE_MATCHING_PAIR':
      return {
        ...state,
        matchingPairs: state.matchingPairs.filter((_, i) => i !== action.index),
      };
    case 'SET_ESSAY':
      return {
        ...state,
        essaySettings: { ...state.essaySettings, [action.field]: action.value },
      };
    default:
      return state;
  }
}

const QuestionBuilder = ({ onQuestionAdded }) => {
  const [question, dispatch] = useReducer(questionReducer, initialQuestionState);
  const [serverResponse, setServerResponse] = useState('');

  const handleChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const handleAnswerChange = (index, field, value) => {
    dispatch({ type: 'SET_ANSWER', index, field, value });
  };

  const handleAddAnswer = () => {
    dispatch({ type: 'ADD_ANSWER' });
  };

  const handleRemoveAnswer = (index) => {
    dispatch({ type: 'REMOVE_ANSWER', index });
  };

  const handleCorrectChange = (index, checked) => {
    dispatch({ type: 'SET_CORRECT', index, checked });
  };

  const handleMatchingPairChange = (index, field, value) => {
    dispatch({ type: 'SET_MATCHING_PAIR', index, field, value });
  };

  const handleAddMatchingPair = () => {
    dispatch({ type: 'ADD_MATCHING_PAIR' });
  };

  const handleRemoveMatchingPair = (index) => {
    dispatch({ type: 'REMOVE_MATCHING_PAIR', index });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const response = await fetch('http://localhost:5000/api/my-questions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` },
        body: JSON.stringify({ ...question }),
      });
      const result = await response.json();
      setServerResponse(JSON.stringify(result, null, 2));
      
      if (response.ok) {
        onQuestionAdded();
      }

    } catch (error) {
      setServerResponse('Ошибка: ' + error.message);
    }
  };

  const renderQuestionFields = () => {
    switch (question.questionType) {
      case 'multichoice':
      case 'truefalse':
        return (
          <>
            <div className="section">
              <h3>Ответы:</h3>
              {question.answers.map((answer, index) => (
                <div
                  key={index}
                  className="answerItem"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveAnswer(index)}
                    className="removeButton"
                  >
                    ×
                  </button>
                  <input
                    type="text"
                    placeholder="Текст ответа"
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                    className="input"
                  />
                  <label>
                    <input
                      type={question.single ? 'radio' : 'checkbox'}
                      checked={answer.isCorrect}
                      onChange={(e) => handleCorrectChange(index, e.target.checked)}
                      name="correctAnswer"
                    />
                    Правильный
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAnswer}
                className="submitButton"
              >
                + Добавить ответ
              </button>
            </div>
            <div className="section">
              <label>
                <input
                  type="checkbox"
                  checked={question.shuffleAnswers}
                  onChange={(e) => handleChange('shuffleAnswers', e.target.checked)}
                />
                Перемешивать ответы
              </label>
            </div>
            <div className="section">
              <label>
                <input
                  type="checkbox"
                  checked={question.single}
                  onChange={(e) => handleChange('single', e.target.checked)}
                />
                Только один правильный ответ
              </label>
            </div>
          </>
        );
      case 'shortanswer':
        return (
          <div className="section">
            <h3>Правильный ответ:</h3>
            <input
              type="text"
              value={question.shortAnswer}
              onChange={(e) => handleChange('shortAnswer', e.target.value)}
              className="input"
            />
          </div>
        );
      case 'numerical':
        return (
          <div className="section">
            <h3>Числовой ответ:</h3>
            <input
              type="number"
              value={question.numericalAnswer}
              onChange={(e) => handleChange('numericalAnswer', e.target.value)}
              className="input"
            />
            <label>
              Допустимая погрешность:
              <input
                type="number"
                value={question.tolerance}
                onChange={(e) => handleChange('tolerance', parseFloat(e.target.value))}
                className="input"
              />
            </label>
          </div>
        );
      case 'matching':
        return (
          <div className="section">
            <h3>Пары соответствия:</h3>
            {question.matchingPairs.map((pair, index) => (
              <div key={index} className="pairItem">
                <button
                  type="button"
                  onClick={() => handleRemoveMatchingPair(index)}
                  className="removeButton"
                >
                  ×
                </button>
                <input
                  type="text"
                  placeholder="Вопрос"
                  value={pair.question}
                  onChange={(e) => handleMatchingPairChange(index, 'question', e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Ответ"
                  value={pair.answer}
                  onChange={(e) => handleMatchingPairChange(index, 'answer', e.target.value)}
                  className="input"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddMatchingPair}
              className="submitButton"
            >
              + Добавить пару
            </button>
          </div>
        );
      case 'essay':
        return (
          <div className="section">
            <h3>Настройки эссе:</h3>
            <div className="section">
              <label>
                Формат ответа:
                <select
                  value={question.essaySettings.responseFormat}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_ESSAY',
                      field: 'responseFormat',
                      value: e.target.value,
                    })
                  }
                  className="input"
                >
                  <option value="editor">Редактор (HTML)</option>
                  <option value="plain">Обычный текст</option>
                </select>
              </label>
            </div>
            <div className="section">
              <label>
                <input
                  type="checkbox"
                  checked={question.essaySettings.responseRequired}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_ESSAY',
                      field: 'responseRequired',
                      value: e.target.checked ? 1 : 0,
                    })
                  }
                />
                Обязателен ответ
              </label>
            </div>
            <div className="section">
              <label>
                Количество строк:
                <input
                  type="number"
                  value={question.essaySettings.responseFieldLines}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_ESSAY',
                      field: 'responseFieldLines',
                      value: parseInt(e.target.value),
                    })
                  }
                  className="input"
                />
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <h2 className="header">Создание вопроса Moodle</h2>
      <form onSubmit={handleSubmit} className="form">
        {/* Тип вопроса */}
        <div className="section">
          <label className="label">Тип вопроса:</label>
          <select
            value={question.questionType}
            onChange={(e) => handleChange('questionType', e.target.value)}
            className="input"
          >
            <option value="multichoice">Множественный выбор</option>
            <option value="truefalse">True/False</option>
            <option value="shortanswer">Короткий ответ</option>
            <option value="numerical">Числовой вопрос</option>
            <option value="matching">Соответствие</option>
            <option value="essay">Эссе</option>
          </select>
        </div>

        {/* Название */}
        <div className="section">
          <label className="label">Категория вопроса</label>
          <input
            type="text"
            value={question.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input"
          />
        </div>

        {/* Текст вопроса */}
        <div className="section">
          <label className="label">Текст вопроса:</label>
          <textarea
            value={question.questionText}
            onChange={(e) => handleChange('questionText', e.target.value)}
            className="input"
            style={{ minHeight: '100px' }}
          />
        </div>

        {/* Поля для типа вопроса */}
        {renderQuestionFields()}

        {/* Общие настройки */}
        <div className="section">
          <h3 className="section">Общие настройки:</h3>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
            <div>
              <label className="label">Баллы:</label>
              <input
                type="number"
                value={question.defaultGrade}
                onChange={(e) => handleChange('defaultGrade', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Штраф:</label>
              <input
                type="number"
                step="0.01"
                value={question.penalty}
                onChange={(e) => handleChange('penalty', parseFloat(e.target.value))}
                className="input"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="submitButton"
        >
          Создать вопрос
        </button>
      </form>

      {/* Ответ сервера */}
      {serverResponse && (
        <div className="serverResponse">
          <h3>Ответ сервера:</h3>
          <pre className="serverResponsePre">{serverResponse}</pre>
        </div>
      )}
    </div>
  );
};

export default QuestionBuilder;