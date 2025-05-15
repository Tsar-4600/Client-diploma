import React from 'react';
import { useNavigate } from 'react-router-dom';
import './pages.css';

const Home = () => {
  const navigate = useNavigate();
  
  const handleCreateTest = () => {
    navigate('/test-constructor');
  };

  return (
    <div className="Home">
      <div className="container">
        {/* Герой-секция */}
        <section className="hero-section">
          <h1 className="title">Создавайте интерактивные тесты легко и быстро!</h1>
          <p className="subtitle">Профессиональный инструмент для преподавателей и учебных заведений</p>
        </section>

        {/* Банк тестов */}
        <section className="feature-section">
          <div className="section-header">
            <h2>Банк тестов</h2>
            <div className="divider"></div>
          </div>
          <div className="feature-content">
            <div className="feature-image">
              <img src="/preview-bank-test.png" alt="Банк тестов" />
            </div>
            <div className="feature-description">
              <ul>
                <li>Доступ к готовым тестам по различным предметам</li>
                <li>Возможность копирования и адаптации тестов под свои нужды</li>
                <li>Рейтинговая система и отзывы пользователей</li>
                <li>Фильтрация по категориям</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Банк вопросов */}
        <section className="feature-section">
          <div className="section-header">
            <h2>Банк вопросов</h2>
            <div className="divider"></div>
          </div>
          <div className="feature-content reversed">
            <div className="feature-image">
              <img src="/question-bank-preview.png" alt="Банк вопросов" />
            </div>
            <div className="feature-description">
              <ul>
                <li>Вопросы различных типов</li>
                <li>Удобный поиск по категориям и ключевым словам</li>
                <li>Возможность создания собственных вопросов</li>
                <li>Экспорт в XML Moodle</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Главные преимущества */}
        <section className="benefits-section">
          <h2>Наши преимущества</h2>
          <ul className="benefits-list">
            <li className="benefit-item">
              <div className="icon">🛠️</div>
              <h3 className="benefit-title">Простота использования</h3>
              <p className="benefit-description">Интуитивный интерфейс для быстрого создания тестов и импорта в системы Moodle.</p>
            </li>
            <li className="benefit-item">
              <div className="icon">⚙️</div>
              <h3 className="benefit-title">Богатый функционал</h3>
              <p className="benefit-description">Поддержка различных типов вопросов</p>
            </li>
            <li className="benefit-item">
              <div className="icon">🤝</div>
              <h3 className="benefit-title">Совместная работа</h3>
              <p className="benefit-description">Общий доступ к тестам и вопросам для преподавателей</p>
            </li>
          </ul>
        </section>

        {/* Демонстрационный блок */}
        <section className="demo-section">
          <h2>Как это работает</h2>
          <div className="demo-container">
            <img src="/preview-constructor.png" alt="Демонстрация интерфейса" />
            <p>Посмотрите, как просто создавать тесты!</p>
          </div>
        </section>

        {/* Призыв к действию */}
        <section className="cta-section">
          <h2>Готовы начать?</h2>
          <div className="buttons-container">
            <button className="primary-button" onClick={handleCreateTest}>Создать первый тест</button>
          </div>
        </section>

        {/* Отзывы */}
        <section className="testimonials-section">
          <h2>Отзывы наших пользователей</h2>
          <div className="testimonials-grid">
            <blockquote className="testimonial-card">
              "Это лучший конструктор тестов, который я использовал!"
              <cite>— Иван П., преподаватель математики</cite>
            </blockquote>
            <blockquote className="testimonial-card">
              "Очень удобный и быстрый инструмент для преподавателей."
              <cite>— Мария К., методист</cite>
            </blockquote>
            <blockquote className="testimonial-card">
              "Сэкономил мне десятки часов работы при подготовке к семестру."
              <cite>— Алексей В., доцент</cite>
            </blockquote>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;