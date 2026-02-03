import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<div className="glass-panel" style={{ padding: '2rem' }}><h2>Library</h2><p>Coming soon...</p></div>} />
          <Route path="/practice" element={<Quiz />} />
          <Route path="/settings" element={<div className="glass-panel" style={{ padding: '2rem' }}><h2>Settings</h2><p>Coming soon...</p></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
