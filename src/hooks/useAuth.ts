/**
 * useAuth — Custom Hook
 * Responsabilidad: gestionar sesión del usuario (token, logout).
 * Sigue principio SRP y separa la lógica de autenticación de la UI.
 */
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isAuthenticated = () => Boolean(localStorage.getItem('token'));

  return { logout, isAuthenticated };
}
