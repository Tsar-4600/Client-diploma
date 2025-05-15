import React, { useState, useEffect } from 'react';
import './MyTestList.css';

const MyTestList = ({ onActionComplete }) => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTests = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-tests`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
            });

            if (!response.ok) throw new Error('Не удалось загрузить тесты');
            const data = await response.json();
            setTests(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const performAction = async (action) => {
        try {
            await action();
            await fetchTests();
            if (onActionComplete) onActionComplete(); // Уведомляем родителя
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteTest = (testId) => performAction(
        () => fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-tests/${testId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        })
    );

    const toggleTestStatus = (testId, currentStatus) => performAction(
        () => fetch(`${process.env.REACT_APP_SERVER_URL}/api/my-tests/${testId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            },
            body: JSON.stringify({ public: !currentStatus })
        })
    );

    useEffect(() => {
        fetchTests();
    }, []);

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="test-list-container">
            {tests.length === 0 ? (
                <p className="no-tests">Тесты не найдены</p>
            ) : (
                <ul className="tests-grid">
                    {tests.map(test => (
                        <li key={test.id} className="test-card">
                            <div className="test-content">
                                <h3 className="test-name">{test.name}</h3>
                                <p className="test-meta">
                                    <span className="test-category">{test.category}</span>
                                    <span className={`test-status ${test.public ? 'public' : 'private'}`}>
                                        {test.public ? 'Публичный' : 'Приватный'}
                                    </span>
                                </p>
                            </div>
                            <div className="test-actions">
                                <button
                                    className={`status-toggle-btn ${test.public ? 'public' : 'private'}`}
                                    onClick={() => toggleTestStatus(test.id, test.public)}
                                >
                                    {test.public ? '🔒' : '🌐'}
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteTest(test.id)}
                                >
                                    ×
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyTestList;