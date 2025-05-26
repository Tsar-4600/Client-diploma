import React, { useState, useReducer, useEffect } from 'react';
import './QuestionBuilder.css';

const initialQuestionState = {
  questionType: 'multichoice',
  name: '',
  theme: '',
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
      if (action.field === 'questionType') {
        const newState = { 
          ...state, 
          [action.field]: action.value,
          answers: action.value === 'truefalse' 
            ? [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: false }]
            : [{ text: '', isCorrect: false }],
          single: true,
          shuffleAnswers: action.value !== 'truefalse'
        };
        return newState;
      }
      return { ...state, [action.field]: action.value };

    case 'SET_ANSWER':
      const newAnswers = [...state.answers];
      newAnswers[action.index] = { ...newAnswers[action.index], [action.field]: action.value };
      return { ...state, answers: newAnswers };

    case 'ADD_ANSWER':
      if (state.questionType === 'truefalse') return state;
      return { ...state, answers: [...state.answers, { text: '', isCorrect: false }] };

    case 'REMOVE_ANSWER':
      if (state.questionType === 'truefalse' || state.answers.length <= 1) return state;
      return {
        ...state,
        answers: state.answers.filter((_, i) => i !== action.index),
      };

    case 'SET_CORRECT':
      return {
        ...state,
        answers: state.answers.map((answer, i) => ({
          ...answer,
          isCorrect: state.single || state.questionType === 'truefalse'
            ? i === action.index && action.checked
            : i === action.index ? action.checked : answer.isCorrect
        }))
      };

    case 'SET_MATCHING_PAIR':
      const pairs = [...state.matchingPairs];
      pairs[action.index] = { ...pairs[action.index], [action.field]: action.value };
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
  const [categories, setCategories] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error loading categories:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (question.name) {
      setLoading(true);
      fetch(`${process.env.REACT_APP_SERVER_URL}/api/themes?category=${encodeURIComponent(question.name)}`)
        .then(res => res.json())
        .then(data => {
          setThemes(data);
          dispatch({ type: 'SET_FIELD', field: 'theme', value: '' });
        })
        .catch(err => console.error('Error loading themes:', err))
        .finally(() => setLoading(false));
    } else {
      setThemes([]);
      dispatch({ type: 'SET_FIELD', field: 'theme', value: '' });
    }
  }, [question.name]);

  const validateForm = () => {
    const newErrors = [];

    if (!question.questionText.trim()) {
      newErrors.push('Текст вопроса обязателен');
    }

    if (!question.theme) {
      newErrors.push('Необходимо выбрать тему');
    }

    if (question.questionType === 'truefalse') {
      const correctAnswers = question.answers.filter(a => a.isCorrect).length;
      if (correctAnswers !== 1) {
        newErrors.push('Для вопроса True/False должен быть выбран один правильный ответ');
      }
    } else if (question.questionType === 'multichoice') {
      if (question.answers.some(a => !a.text.trim())) {
        newErrors.push('Все ответы должны содержать текст');
      }

      const correctAnswers = question.answers.filter(a => a.isCorrect).length;
      if (correctAnswers === 0) {
        newErrors.push('Должен быть хотя бы один правильный ответ');
      } else if (question.single && correctAnswers > 1) {
        newErrors.push('Для вопроса с одним правильным ответом выберите только один вариант');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

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
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-questions/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` 
        },
        body: JSON.stringify(question),
      });
      
      const result = await response.json();
      setServerResponse(JSON.stringify(result, null, 2));
      
      if (response.ok) {
        onQuestionAdded();
        dispatch({ type: 'SET_FIELD', field: 'questionText', value: '' });
        dispatch({ type: 'SET_FIELD', field: 'theme', value: '' });
      }
    } catch (error) {
      setServerResponse('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionFields = () => {
    switch (question.questionType) {
      case 'multichoice':
        return (
          <>
            <div className="section">
              <h3>Ответы:</h3>
              {question.answers.map((answer, index) => (
                <div key={index} className="answerItem">
                  <button
                    type="button"
                    onClick={() => handleRemoveAnswer(index)}
                    className="removeButton"
                    disabled={question.answers.length <= 1}
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

      case 'truefalse':
        return (
          <>
            <div className="section">
              <h3>Ответы:</h3>
              {question.answers.map((answer, index) => (
                <div key={index} className="answerItem">
                  <input
                    type="text"
                    value={answer.text}
                    className="input"
                    readOnly
                  />
                  <label>
                    <input
                      type="radio"
                      checked={answer.isCorrect}
                      onChange={(e) => handleCorrectChange(index, e.target.checked)}
                      name="correctAnswer"
                    />
                    Правильный
                  </label>
                </div>
              ))}
            </div>
            <div className="section">
              <label>
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                />
                Перемешивание ответов недоступно для True/False
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
      <form onSubmit={handleSubmit} className="form">
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

        <div className="section">
          <label className="label">Категория:</label>
          <select
            value={question.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input"
            required
            disabled={loading}
          >
            <option value="">Выберите категорию</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="section">
          <label className="label">Тема:</label>
          <select
            value={question.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="input"
            required
            disabled={!question.name || loading}
          >
            <option value="">Выберите тему</option>
            {themes.map((theme, index) => (
              <option key={index} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>

        <div className="section">
          <label className="label">Текст вопроса:</label>
          <textarea
            value={question.questionText}
            onChange={(e) => handleChange('questionText', e.target.value)}
            className="input"
            style={{ minHeight: '100px' }}
            required
          />
        </div>

        {renderQuestionFields()}

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
                min="0"
                step="0.1"
                required
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
                min="0"
                max="1"
                required
              />
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="error-messages">
            <h3>Ошибки:</h3>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <button 
          type="submit" 
          className="submitButton"
          disabled={loading}
        >
          {loading ? 'Создание...' : 'Создать вопрос'}
        </button>
      </form>

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