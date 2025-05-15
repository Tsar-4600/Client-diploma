import MoodleQuizBuilder from '../components/MoodleQuizBuilder/MoodleQuizBuilder.jsx';
import React from 'react';

// Определение функционального компонента
const TestConstructor = () => {

  // Разметка, возвращаемая компонентом
  return (
    <div className="TestConstructor">
        <h1>Конструктор теста</h1>
        <MoodleQuizBuilder/>
    </div>

  );
};

// Экспорт компонента для использования в других местах
export default TestConstructor;