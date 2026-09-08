import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard.jsx';

export default function App() {
  // Membaca localStorage secara langsung saat komponen pertama kali di-load
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div>
      {token ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}