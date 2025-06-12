
import React, {useState} from 'react';
import QuestionBuilder from '../components/QuestionBuilder/QuestionBuilder';
import MyQuestionList from '../components/MyQuestionList/MyQuestionList';

// Определение функционального компонента
const QuestionBank = () => {

  const [refreshTrigger, setRefreshTrigger] = useState(false);



  const handleQuestionAdded = () => {
    setRefreshTrigger(prev => !prev); // Инвертируем триггер
  };
  // Разметка, возвращаемая компонентом
  return (
    <div className="QuestionBank">
      <h1>Банк вопросов</h1>
      <h2>Мои вопросы</h2>
      <MyQuestionList refreshTrigger={refreshTrigger}  />
      <h2>Создание моего вопроса</h2>
      <QuestionBuilder onQuestionAdded={handleQuestionAdded} />
        
       
    </div>

  );
};
export default QuestionBank;
