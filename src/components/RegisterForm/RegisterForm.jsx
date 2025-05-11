// RegisterForm.js
import React, { useState } from 'react';
import './RegisterForm.css'
const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault(); // предотвращаем перезагрузку страницы

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/register`, { // URL для регистрации
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email }), // Отправляем username, password и email
            });

            const data = await response.json();

            // Обработка ответа от сервера
            if (data.success) {
                setMessage('Регистрация успешна!');
                // Возможно, перенаправление на страницу авторизации или другую страницу
            } else {
                // Обработка ошибок регистрации (например, пользователь уже существует)
                setMessage(data.message || 'Ошибка при регистрации.');
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            setMessage('Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
    };

    return (
        <div className='reg-form'>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Имя пользователя:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                 <div>
                    <label>Email:</label> {/* Добавлено поле для Email */}
                    <input
                        type="email" // Тип email для базовой валидации браузером
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Зарегистрироваться</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RegisterForm;