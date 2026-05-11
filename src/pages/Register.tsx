import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastNamePaternal, setLastNamePaternal] = useState('');
  const [lastNameMaternal, setLastNameMaternal] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { 
        email, 
        password,
        first_name: firstName,
        last_name_paternal: lastNamePaternal,
        last_name_maternal: lastNameMaternal
      });
      localStorage.setItem('token', res.data.access_token);
      navigate('/survey');
    } catch (err: any) {
      console.error("Detalles del error:", err.response?.data);
      alert("Error: " + (err.response?.data?.detail || err.message || "Inténtalo de nuevo"));
    }
  };

  return (
    <div className="screen active" id="screen_register">
      <div className="content-wrapper" style={{ maxWidth: '450px' }}>
        <div className="logo-container" style={{ marginBottom: '20px' }}>
          <img src="/Logo.png" className="logo" alt="🍏" style={{ width: '120px', marginBottom: '15px' }} />
          <h1 style={{ fontSize: '36px', background: 'linear-gradient(90deg, #ffffff, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Crear Cuenta</h1>
          <p className="subtitle" style={{ marginBottom: '10px' }}>Únete a NutriFit AI</p>
        </div>

        <form className="login-card" onSubmit={handleRegister}>
          
          <div className="login-input-group">
            <label>Nombre(s)</label>
            <input type="text" placeholder="Ej. Juan" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </div>

          <div className="login-input-group">
            <label>Apellido Paterno</label>
            <input type="text" placeholder="Pérez" value={lastNamePaternal} onChange={e => setLastNamePaternal(e.target.value)} required />
          </div>

          <div className="login-input-group">
            <label>Apellido Materno</label>
            <input type="text" placeholder="Gómez" value={lastNameMaternal} onChange={e => setLastNameMaternal(e.target.value)} required />
          </div>

          <div className="login-input-group">
            <label>Correo Electrónico</label>
            <input type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="login-input-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn" style={{ marginTop: '10px' }}>Regístrate</button>
        </form>

        <div className="register-link" onClick={() => navigate('/login')}>
          ¿Ya tienes cuenta? <span>Inicia Sesión</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
