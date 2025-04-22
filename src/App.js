import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import TestConstructor from './pages/TestConstructor';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import QuestionBank from './pages/QuestionBank';




function App() {
  return (
    <div className="App">
      <Router>
        <div className="app-container">
          <nav className="sidebar">
            <ul className="menu-list">
              <li className="menu-item">
                <Link to="/" className="menu-link">Главная</Link>
              </li>
              <li className="menu-item">
                <Link to="/test-constructor" className="menu-link">Конструктор теста</Link>
              </li>
            </ul>
          </nav>

          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/test-constructor" element={<TestConstructor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
