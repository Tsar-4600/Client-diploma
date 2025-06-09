import React, { useState } from 'react';
import './RegisterForm.css';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [errors, setErrors] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [shouldShake, setShouldShake] = useState(false);

    const validateForm = () => {
        const newErrors = {
            username: '',
            password: '',
            email: ''
        };
        let isValid = true;

        if (!formData.username.trim()) {
            newErrors.username = 'Имя пользователя обязательно';
            isValid = false;
        } else if (formData.username.length < 3) {
            newErrors.username = 'Минимум 3 символа';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Введите корректный email';
            isValid = false;
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Пароль обязателен';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Минимум 6 символов';
            isValid = false;
        }

        setErrors(newErrors);
        
        if (!isValid) {
            setShouldShake(true);
            setTimeout(() => setShouldShake(false), 400);
        }

        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка при регистрации');
            }

            if (data.success) {
                setMessage({ 
                    text: data.message || 'Регистрация успешна!', 
                    type: 'success' 
                });
                setFormData({ username: '', password: '', email: '' });
            } else {
                setMessage({ 
                    text: data.message || 'Ошибка при регистрации', 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            setMessage({ 
                text: error.message || 'Произошла ошибка. Пожалуйста, попробуйте позже.', 
                type: 'error' 
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        if (message.text) {
            setMessage({ text: '', type: '' });
        }
    };

    return (
        <div className={`reg-form ${shouldShake ? 'shake-animation' : ''}`}>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Имя пользователя:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={errors.username ? 'error-field' : ''}
                    />
                    {errors.username && <div className="error-message">{errors.username}</div>}
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error-field' : ''}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div>
                    <label>Пароль:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'error-field' : ''}
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                <button type="submit">Зарегистрироваться</button>
            </form>
            
            {message.text && (
                <div className={`${message.type}-message`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default RegisterForm;