import { useState } from 'react';
import API from './api';
import { Wallet, LogIn, Lock, Mail } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Style terpusat untuk input agar putih & rapi
  const inputStyle = {
    width: '100%',
    padding: '10px 12px 10px 36px', // Memberikan ruang untuk icon di sebelah kiri
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setMessage('Login berhasil!');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login gagal, periksa email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f8faf9', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      padding: '20px'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '380px', 
        background: '#ffffff', 
        padding: '32px', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        
        {/* HEADER LOGO & TITLE */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '48px', 
            height: '48px', 
            backgroundColor: '#dcfce7', 
            borderRadius: '50%', 
            marginBottom: '12px' 
          }}>
            <Wallet size={24} style={{ color: '#16a34a' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
            Finance Tracker
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Masuk ke akun Anda untuk mengelola keuangan
          </p>
        </div>

        {/* FORM LOGIN */}
        <form onSubmit={handleLogin}>
          
          {/* INPUT EMAIL */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="nama@email.com"
                required 
                style={inputStyle}
              />
            </div>
          </div>

          {/* INPUT PASSWORD */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
                style={inputStyle}
              />
            </div>
          </div>

          {/* BUTTON SUBMIT */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#16a34a', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '14px', 
              fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            <LogIn size={16} />
            {loading ? 'Proses Login...' : 'Masuk'}
          </button>
        </form>

        {/* PESAN ERROR / SUKSES */}
        {message && (
          <div style={{ 
            marginTop: '16px', 
            padding: '10px 12px', 
            borderRadius: '6px', 
            fontSize: '12px', 
            textAlign: 'center',
            backgroundColor: message.includes('berhasil') ? '#dcfce7' : '#fee2e2',
            color: message.includes('berhasil') ? '#15803d' : '#b91c1c',
            border: `1px solid ${message.includes('berhasil') ? '#bbf7d0' : '#fca5a5'}`
          }}>
            {message}
          </div>
        )}

      </div>
    </div>
  );
}