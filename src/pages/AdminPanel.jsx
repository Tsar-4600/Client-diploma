
import React from 'react';
import AdminBoard from '../components/AdminBoard/AdminBoard';

// Определение функционального компонента
const AdminPanel = () => {

  // Разметка, возвращаемая компонентом
  return (
    <div className="AdminPanel">
        <h1>Админская панель</h1>
        <AdminBoard/>
    </div>

  );
};

// Экспорт компонента для использования в других местах
export default AdminPanel;