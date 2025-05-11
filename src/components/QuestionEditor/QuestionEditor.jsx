import React, { useState, useEffect } from 'react';
import './QuestionBuilder.css'; // Используем те же стили

const QuestionEditor = ({ questionData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(questionData);

  // Заполняем форму данными вопроса при открытии
  useEffect(() => {
    setFormData(questionData);
  }, [questionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Передаем обновленные данные наружу
  };

  return (
    <div className="editor-modal">
      <div className="editor-content">
        <h2>Редактирование вопроса</h2>
        <form onSubmit={handleSubmit}>
          {/* Упрощенная форма - подставьте ваши поля */}
          <label>
            Название:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Текст вопроса:
            <textarea
              name="questionText"
              value={formData.questionText}
              onChange={handleChange}
            />
          </label>

          <div className="editor-buttons">
            <button type="button" onClick={onCancel}>Отмена</button>
            <button type="submit">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionEditor;