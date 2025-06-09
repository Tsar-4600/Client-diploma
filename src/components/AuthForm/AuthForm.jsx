// AuthForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const AuthForm = ({ setIsAuthenticated, setUserRole }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({
        username: '',
        password: ''
    });

    const navigate = useNavigate();

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            username: '',
            password: ''
        };

        if (!username.trim()) {
            newErrors.username = 'Имя пользователя обязательно';
            valid = false;
        }

        if (!password.trim()) {
            newErrors.password = 'Пароль обязателен';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Валидация перед отправкой
        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
       
            if (data.success) {
                localStorage.setItem('jwtToken', data.token);
                setMessage('Авторизация успешна!');
                
                if (setIsAuthenticated) {
                    setIsAuthenticated(true);
                    setUserRole(data.role);
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
                        className={errors.username ? 'error' : ''}
                    />
                    {errors.username && <span className="error-message">{errors.username}</span>}
                </div>
                <div>
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
                <button type="submit">Войти</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default AuthForm;