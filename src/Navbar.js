import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css'; // For Bootstrap icons
import logoImage from './assets/logo5.png'; // Asegúrate de poner la ruta correcta de tu imagen
import './Navbar.css';
import profileImage from './assets/profile.jpg'; // Asegúrate de poner la ruta correcta de tu imagen
import api from './api';

const NavigationBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && auth.currentUser) {
      console.log(`Fetching notifications for user: ${auth.currentUser.uid}`);
      fetch(`${api.apiBaseUrl}/notifications/${auth.currentUser.uid}`)
        .then(response => {
          console.log('Response status:', response.status);
          if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Notifications received:', data);
          setNotifications(data);
        })
        .catch(error => {
          console.error('Error fetching notifications:', error);
        });
    }
  }, [isAuthenticated, auth.currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    navigate('/');
  };

  const handleProtectedLinkClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const markNotificationsAsRead = () => {
    fetch(`${api.apiBaseUrl}/api/notifications/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: auth.currentUser.uid }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Notifications marked as read:', data);
        setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      })
      .catch(error => {
        console.error('Error marking notifications as read:', error);
      });
  };

  const handleClickOutside = (event) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    const postId = notification.post_id;
    if (postId) {
      navigate(`/job-details/${postId}`);
    } else {
      console.error('Post ID not found in notification');
    }
  };

  const userEmail = auth.currentUser ? auth.currentUser.email : '';
  const userName = auth.currentUser ? auth.currentUser.displayName || 'User' : 'User';

  const getLinkClass = (path) => (location.pathname === path ? 'protected-link active' : 'protected-link');

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={logoImage} alt="Your Logo" className="logo-image" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} exact to="/" activeClassName="active">Inicio</Nav.Link>
            <Nav.Link as={NavLink} to="/find-work" activeClassName="active">Buscar Trabajo</Nav.Link>
            <Nav.Link as={NavLink} to="/services" activeClassName="active">Buscar Servicios</Nav.Link>
            <Nav.Link className={getLinkClass('/post-job')} onClick={() => handleProtectedLinkClick('/post-job')}>Ofrecer Empleos</Nav.Link>
            <Nav.Link className={getLinkClass('/post-service')} onClick={() => handleProtectedLinkClick('/post-service')}>Anuncia tu Servicio</Nav.Link>
            <Nav.Link as={NavLink} to="/Courses" activeClassName="active">Cursos</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Dropdown onToggle={markNotificationsAsRead}>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    <i className="bi bi-bell"></i>
                    {notifications.filter(notification => !notification.is_read).length > 0 && (
                      <Badge bg="danger">
                        {notifications.filter(notification => !notification.is_read).length}
                      </Badge>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="right" className="dropdown-menu-custom">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <Dropdown.Item
                          key={index}
                          className="notification-item"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-avatar">
                            {notification.sender_avatar ? (
                              <img src={notification.sender_avatar} alt="Avatar" className="avatar-image" />
                            ) : (
                              <span className="avatar-placeholder">
                                {notification.sender_name ? notification.sender_name.charAt(0).toUpperCase() : '?'}
                              </span>
                            )}
                          </div>
                          <div className="notification-content">
                            <p>{notification.message}</p>
                            <small className="text-muted">{new Date(notification.created_at).toLocaleString()}</small>
                          </div>
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item>No hay notificaciones</Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
                <div className="user-dropdown" ref={userMenuRef}>
                  <img src={profileImage} alt="User Profile" className="user-image" onClick={toggleDropdown} />
                  {showDropdown && (
                    <div className="user-menu">
                      <div className="user-info">
                        <img src={profileImage} alt="User Profile" className="user-image-large" />
                        <div>
                          <p className="user-name">{userName}</p>
                          <p className="user-email">{userEmail}</p>
                        </div>
                      </div>
                      <hr />
                      <Link className="nav-dropdown-item" to="/UserProfile">
                        <i className="bi bi-person"></i> Mi Perfil
                      </Link>
                      <Link className="nav-dropdown-item" to="/favorites">
                        <i className="bi bi-heart"></i> Mis Favoritos
                      </Link>
                      <Link className="nav-dropdown-item" to="/messages">
                        <i className="bi bi-envelope"></i> Mensajes
                      </Link>
                      <Link className="nav-dropdown-item" to="/settings">
                        <i className="bi bi-gear"></i> Ajustes
                      </Link>
                      <Link className="nav-dropdown-item" to="/account">
                        <i className="bi bi-person-lines-fill"></i> Mi Cuenta
                      </Link>
                      <hr />
                      <div className="nav-dropdown-item" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" activeClassName="active">Iniciar Sesión</Nav.Link>
                <Nav.Link as={NavLink} to="/register" activeClassName="active">Registrarse</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
