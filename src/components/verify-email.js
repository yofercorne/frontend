import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import appfirebase from '../credenciales';
import './VerifyEmail.css'; // Importa los estilos para el modal de carga
import api from '../api';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { email, password } = location.state || {}; // Maneja el caso en que state sea undefined

  // Agrega esto para depuración
  console.log('Received location state:', location.state);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('Email o contraseña faltante');
      return;
    }

    try {
      setLoading(true); // Mostrar modal de carga
      // Verifica el código de verificación del email en el backend
      const response = await fetch(`${api.apiBaseUrl}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (response.ok) {
        // Intenta iniciar sesión después de verificar el email en el backend
        const auth = getAuth(appfirebase);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await user.reload();
        if (user.emailVerified) {
          setMessage('Email successfully verified');
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/'); // Redirigir a la página de inicio
        } else {
          setMessage('Failed to verify email');
        }
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(`Error verifying email: ${error.message}`);
      console.error('Error verifying email:', error);
    } finally {
      setLoading(false); // Ocultar modal de carga
    }
  };

  return (
    <div className="container mt-5">
      {loading && (
        <div className="loading-modal">
          <div className="loading-spinner"></div>
          <p>Verificando...</p>
        </div>
      )}
      <div className={`row justify-content-center ${loading ? 'blurred' : ''}`}>
        <div className="col-lg-4 col-md-6 col-sm-8">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title text-center">Verificar Correo</h3>
              {message && <div className="alert alert-info">{message}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="code" className="form-label">Código de Verificación</label>
                  <input
                    type="text"
                    className="form-control"
                    id="code"
                    name="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">Verificar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
