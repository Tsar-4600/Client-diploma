import React, { useState, useEffect } from 'react';
import './AdminBoard.css';

const AdminBoard = ({ onActionComplete }) => {
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' или 'users'
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        email: '',
        role: '1'
    });

    const token = localStorage.getItem('jwtToken');

    // Загрузка данных
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Очищаем данные при переключении вкладок
            if (activeTab === 'categories') {
                setUsers([]);
            } else {
                setCategories([]);
            }

            if (!token) {
                throw new Error('Требуется авторизация');
            }

            let url = '';
            if (activeTab === 'categories') {
                url = `${process.env.REACT_APP_SERVER_URL}/api/admin/categories`;
            } else {
                url = `${process.env.REACT_APP_SERVER_URL}/api/admin/users`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Не удалось загрузить данные');
            }

            const data = await response.json().catch(() => {
                throw new Error('Неверный формат ответа сервера');
            });

            if (activeTab === 'categories') {
                setCategories(data);
            } else {
                setUsers(data);
            }
        } catch (err) {
            // Игнорируем ошибки, если компонент размонтирован или запрос был отменен
            if (err.name !== 'AbortError') {
                setError(err.message);
                console.error('Ошибка загрузки данных:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    // CRUD операции для категорий
    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/admin/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newCategory.trim() }),
            });
            if (!response.ok) throw new Error('Ошибка при добавлении категории');
            setNewCategory('');
            fetchData();
            if (onActionComplete) onActionComplete();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !editingCategory.name.trim()) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/admin/categories/${editingCategory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: editingCategory.name.trim() }),
            });
            if (!response.ok) throw new Error('Ошибка при обновлении категории');
            setEditingCategory(null);
            fetchData();
            if (onActionComplete) onActionComplete();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Ошибка при удалении категории');
            fetchData();
            if (onActionComplete) onActionComplete();
        } catch (err) {
            setError(err.message);
        }
    };

    // CRUD операции для пользователей
    const handleAddUser = async () => {
        if (!newUser.username.trim() || !newUser.password) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newUser),
            });
            if (!response.ok) throw new Error('Ошибка при добавлении пользователя');
            setNewUser({ username: '', password: '', email: '', role: '1' });
            fetchData();
            if (onActionComplete) onActionComplete();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser || !editingUser.username.trim()) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editingUser),
            });
            if (!response.ok) throw new Error('Ошибка при обновлении пользователя');
            setEditingUser(null);
            fetchData();
            if (onActionComplete) onActionComplete();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Ошибка при удалении пользователя');
            fetchData();
            if (onActionComplete) onActionComplete();
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const abortController = new AbortController();

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                if (activeTab === 'categories') {
                    setUsers([]);
                } else {
                    setCategories([]);
                }

                if (!token) {
                    throw new Error('Требуется авторизация');
                }

                let url = '';
                if (activeTab === 'categories') {
                    url = `${process.env.REACT_APP_SERVER_URL}/api/admin/categories`;
                } else {
                    url = `${process.env.REACT_APP_SERVER_URL}/api/admin/users`;
                }

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: abortController.signal
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Не удалось загрузить данные');
                }

                const data = await response.json();

                if (!abortController.signal.aborted) {
                    if (activeTab === 'categories') {
                        setCategories(data);
                    } else {
                        setUsers(data);
                    }
                }
            } catch (err) {
                if (!abortController.signal.aborted) {
                    setError(err.message);
                    console.error('Ошибка загрузки данных:', err);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            abortController.abort();
        };
    }, [activeTab, token]);

    if (loading) return <div>Загрузка данных...</div>;
    if (error) return <div style={{ color: 'red' }}>Ошибка: {error}</div>;

    return (
        <div className="admin-panel">
            <div className="admin-tabs">
                <button
                    className={activeTab === 'categories' ? 'active' : ''}
                    onClick={() => setActiveTab('categories')}
                >
                    Управление категориями
                </button>
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    Управление пользователями
                </button>
            </div>

            {activeTab === 'categories' ? (
                <div className="categories-section">
                    <h3>Категории</h3>

                    {/* Форма добавления/редактирования категории */}
                    <div className="category-form">
                        <input
                            type="text"
                            value={editingCategory ? editingCategory.name : newCategory}
                            onChange={(e) =>
                                editingCategory
                                    ? setEditingCategory({ ...editingCategory, name: e.target.value })
                                    : setNewCategory(e.target.value)
                            }
                            placeholder="Название категории"
                        />
                        {editingCategory ? (
                            <>
                                <button onClick={handleUpdateCategory}>Сохранить</button>
                                <button onClick={() => setEditingCategory(null)}>Отмена</button>
                            </>
                        ) : (
                            <button onClick={handleAddCategory}>Добавить</button>
                        )}
                    </div>

                    {/* Список категорий */}
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id_category}>
                                    <td>{category.id_category}</td>
                                    <td>{category.name}</td>
                                    <td>
                                        <button onClick={() => setEditingCategory({
                                            id: category.id_category,
                                            name: category.name
                                        })}>
                                            Редактировать
                                        </button>
                                        <button onClick={() => handleDeleteCategory(category.id_category)}>
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="users-section">
                    <h3>Пользователи</h3>

                    {/* Форма добавления/редактирования пользователя */}
                    <div className="user-form">
                        <input
                            type="text"
                            value={editingUser ? editingUser.username : newUser.username}
                            onChange={(e) =>
                                editingUser
                                    ? setEditingUser({ ...editingUser, username: e.target.value })
                                    : setNewUser({ ...newUser, username: e.target.value })
                            }
                            placeholder="Логин"
                        />
                        <input
                            type="password"
                            value={editingUser ? editingUser.password : newUser.password}
                            onChange={(e) =>
                                editingUser
                                    ? setEditingUser({ ...editingUser, password: e.target.value })
                                    : setNewUser({ ...newUser, password: e.target.value })
                            }
                            placeholder="Пароль"
                        />
                        <input
                            type="email"
                            value={editingUser ? editingUser.email : newUser.email}
                            onChange={(e) =>
                                editingUser
                                    ? setEditingUser({ ...editingUser, email: e.target.value })
                                    : setNewUser({ ...newUser, email: e.target.value })
                            }
                            placeholder="Email (необязательно)"
                        />
                        <select
                            value={editingUser ? editingUser.id_role : newUser.role}
                            onChange={(e) =>
                                editingUser
                                    ? setEditingUser({ ...editingUser, id_role: e.target.value })
                                    : setNewUser({ ...newUser, role: e.target.value })
                            }
                        >
                            <option value="1">Обычный пользователь</option>
                            <option value="2">Администратор</option>
                        </select>

                        {editingUser ? (
                            <>
                                <button onClick={handleUpdateUser}>Сохранить</button>
                                <button onClick={() => setEditingUser(null)}>Отмена</button>
                            </>
                        ) : (
                            <button onClick={handleAddUser}>Добавить</button>
                        )}
                    </div>

                    {/* Список пользователей */}
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Логин</th>
                                <th>Email</th>
                                <th>Роль</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id_user}>
                                    <td>{user.id_user}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email || '-'}</td>
                                    <td>{user.id_role === 2 ? 'Администратор' : 'Пользователь'}</td>
                                    <td>
                                        <button onClick={() => setEditingUser({
                                            id: user.id_user,
                                            username: user.username,
                                            password: '', // Пароль не показываем для безопасности
                                            email: user.email || '',
                                            id_role: user.id_role
                                        })}>
                                            Редактировать
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id_user)}>
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminBoard;