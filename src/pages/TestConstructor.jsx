import MoodleQuizBuilder from '../components/MoodleQuizBuilder/MoodleQuizBuilder.jsx';
import React from 'react';

// Определение функционального компонента
const TestConstructor = () => {

  // Разметка, возвращаемая компонентом
  return (
    <div className="TestConstructor">
        <h1>Тест конструктора</h1>
        <MoodleQuizBuilder/>
    </div>

  );
};

// Экспорт компонента для использования в других местах
export default TestConstructor;