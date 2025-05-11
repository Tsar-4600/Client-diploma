// AuthForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const AuthForm = ( { setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault(); // предотвращаем перезагрузку страницы
        
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
       
            // Обработка успешного ответа
            if (data.success) {
                localStorage.setItem('jwtToken', data.token);
                setMessage('Авторизация успешна!');

                if (setIsAuthenticated) {
                    setIsAuthenticated(true);
                }


                navigate('/');
            } else {
                setMessage('Неверное имя пользователя или пароль!');
            }
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            setMessage('Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
    };

    return (
        <div className='auth-form'>
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
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Войти</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AuthForm;