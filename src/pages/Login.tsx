import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);

      // Check if user already completed the survey — if yes, skip it
      try {
        const surveyRes = await api.get('/survey/');
        const hasSurvey = surveyRes.data && Object.keys(surveyRes.data).length > 0;
        navigate(hasSurvey ? '/dashboard' : '/survey');
      } catch {
        navigate('/survey');
      }
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.detail || "Inténtalo de nuevo"));
    }
  };

  return (
    <div className="screen active" id="screen0">
      <div className="content-wrapper" style={{ maxWidth: '450px' }}>
        <div className="logo-container" style={{ marginBottom: '40px' }}>
          <img src="/Logo.png" className="logo" alt="🍏" style={{ width: '150px', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '48px', background: 'linear-gradient(90deg, #ffffff, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NutriFit AI</h1>
          <p className="subtitle">Bienvenido de nuevo</p>
        </div>

        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-input-group">
            <label>Correo Electrónico</label>
            <input type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="login-input-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <div className="forgot-password">¿Olvidaste tu contraseña?</div>

          <button type="submit" className="btn">Iniciar Sesión</button>

          <div className="divider">O continúa con</div>

          <button type="button" className="btn-outline"><span>🌐</span> Google</button>
        </form>

        <div className="register-link" onClick={() => navigate('/register')}>
          ¿No tienes una cuenta? <span>Regístrate aquí</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
