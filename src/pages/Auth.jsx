
import React from 'react';
import AuthForm from '../components/AuthForm/AuthForm';

// Определение функционального компонента
const Auth = ({setIsAuthenticated}) => {

  // Разметка, возвращаемая компонентом
  return (
    <div className="Auth">
        <h1>Авторизация</h1>
        <AuthForm setIsAuthenticated={setIsAuthenticated} />
    </div>

  );
};

// Экспорт компонента для использования в других местах
export default Auth;