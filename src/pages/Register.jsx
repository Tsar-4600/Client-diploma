
import React from 'react';
import RegisterForm from '../components/RegisterForm/RegisterForm';

// Определение функционального компонента
const Register = () => {

  // Разметка, возвращаемая компонентом
  return (
    <div className="Register">
        <h1>Регистрация</h1>
        <RegisterForm/>
    </div>

  );
};

// Экспорт компонента для использования в других местах
export default Register;