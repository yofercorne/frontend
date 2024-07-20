import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Ensure your styles are set up for the footer
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const socialLinks = [
  { icon: faFacebookF, href: 'hhttps://facebook.com', label: 'Facebook' },
  { icon: faTwitter, href: 'hhttps://twitter.com', label: 'Twitter' },
  { icon: faInstagram, href: 'hhttps://instagram.com', label: 'Instagram' },
  { icon: faLinkedinIn, href: 'hhttps://linkedin.com', label: 'LinkedIn' },
];

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6">
            <h3>Información de Contacto</h3>
            <p><i className="fas fa-map-marker-alt"></i> Dirección: 123 Calle Principal, Ciudad</p>
            <p><i className="fas fa-envelope"></i> Email: info@plataformaempleo.com</p>
            <p><i className="fas fa-phone"></i> Teléfono: +123 456 789</p>
          </div>
          <div className="col-lg-4 col-md-6">
            <h3>Enlaces Rápidos</h3>
            <ul className="list-unstyled">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/find-work">Buscar Trabajos</Link></li>
              <li><Link to="/post-job">Publicar Empleo</Link></li>
              <li><Link to="/post-service">Publicar Servicio</Link></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h3>Síguenos en Redes Sociales</h3>
            <div className="social-icons">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.href} aria-label={link.label} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={link.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <hr className="bg-white" />
        <p className="text-center">© {new Date().getFullYear()} Nuestra Plataforma. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
