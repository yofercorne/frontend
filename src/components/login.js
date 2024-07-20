import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '../AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import appfirebase from '../credenciales';
import './login.css';
import loginImage from '../assets/inicio.png'; // Asegúrate de poner la ruta correcta de tu imagen
import api from '../api';
const Login = () => {
  const [userCredentials, setUserCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const auth = getAuth(appfirebase);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserCredentials({ ...userCredentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userCredentials.email || !userCredentials.password) {
      setError("Email and password are required");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, userCredentials.email, userCredentials.password);
      const user = userCredential.user;
      login(user);
      navigate('/'); // Redirigir al usuario a la página de inicio después de iniciar sesión
    } catch (error) {
      console.error('Error during sign in:', error);
      setError(error.message);
    }
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const response = await fetch(`${api.apiBaseUrl}/api/check-user?email=${user.email}`);
        const data = await response.json();

        if (data.exists) {
          // Si el usuario ya está registrado, inicia sesión
          login(user);
          navigate('/');
        } else {
          // Si el usuario no está registrado, regístralo automáticamente
          await fetch(`${api.apiBaseUrl}/api/user`, {
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
          login(user);
          navigate('/');
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
        setError(error.message);
      });
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-image">
          <img src={loginImage} alt="Login" />
        </div>
        <div className="login-card">
          <h3 className="login-title">Ingresa a tu cuenta</h3>
          <p className="login-subtitle">¡Hola! Accede y encuentra el trabajo que buscas</p>
          {error && <div className="login-error">{error}</div>}
          <div className="external-providers">
            <button type="button" className="btn btn-outline-primary google-btn" onClick={handleGoogleSignIn}>
              <i className="fab fa-google"></i> Iniciar sesión con Google
            </button>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control login-input"
                id="email"
                name="email"
                value={userCredentials.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control login-input"
                id="password"
                name="password"
                value={userCredentials.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary login-btn">Iniciar Sesión</button>
            <p className="forgot-password">Olvidé mi contraseña</p>
          </form>
          <p className="register-link">¿No tienes cuenta? <span onClick={() => navigate('/register')}>Regístrate como candidato</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
