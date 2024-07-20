import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import appfirebase from '../credenciales';
import './Register.css';
import registerImage from '../assets/registro.png';
import api from '../api';
import Login from './login';

const Register = () => {
  const [newUser, setNewUser] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleRegistration = async (email, password) => {
    try {
      setLoading(true); // Mostrar modal de carga
      const response = await fetch(`${api.apiBaseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Failed to register user in local DB');
      }

      const data = await response.json();
      console.log('User registered and verification email sent:', data);

      navigate('/verify-email', { state: { email, password } });
    } catch (error) {
      console.error('Error during registration:', error);
      setError(error.message);
    } finally {
      setLoading(false); // Ocultar modal de carga
    }
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const response = await fetch(`${api.apiBaseUrl}/check-user?email=${user.email}`);
        const data = await response.json();

        if (data.exists) {
          Login(user);
          navigate('/');
        } else {
          await fetch(`${api.apiBaseUrl}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.uid,
              correo: user.email,
              nombre: user.displayName || '',
              apellido: '',
              edad: 0,
              phone: '',
              foto: user.photoURL || ''
            })
          });
          Login(user);
          navigate('/');
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
        setError(error.message);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) {
      setError("Email and password are required");
      return;
    }
    handleRegistration(newUser.email, newUser.password);
  };

  return (
    <div className="register-container">
      {loading && (
        <div className="loading-modal">
          <div className="loading-spinner"></div>
          <p>Registrando...</p>
        </div>
      )}
      <div className={`register-content ${loading ? 'blurred' : ''}`}>
        <div className="register-card">
          <h3 className="register-title">Crea tu cuenta y encuentra tu empleo ideal</h3>
          {error && <div className="register-error">{error}</div>}
          <div className="external-providers">
            <button type="button" className="btn btn-outline-primary google-btn" onClick={handleGoogleSignIn}>
              <i className="fab fa-google"></i> Inicia sesión con Google
            </button>
          </div>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control register-input"
                id="email"
                name="email"
                value={newUser.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control register-input"
                id="password"
                name="password"
                value={newUser.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary register-btn">Registrar</button>
          </form>
        </div>
        <div className="register-image">
          <img src={registerImage} alt="Register" />
        </div>
      </div>
    </div>
  );
};

export default Register;
