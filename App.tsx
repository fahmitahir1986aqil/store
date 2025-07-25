/**
 * Main App component with routing and authentication
 */

import { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MasterList from './pages/MasterList';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Reports from './pages/Reports';
import Options from './pages/Options';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (username: string, password: string) => {
    if (username === 'storepjvk' && password === '1234') {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/master" element={<MasterList />} />
          <Route path="/stock-in" element={<StockIn />} />
          <Route path="/stock-out" element={<StockOut />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/options" element={<Options />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
