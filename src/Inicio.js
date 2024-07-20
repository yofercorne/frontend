import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { Element } from 'react-scroll';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Inicio.css';
import imageFile from './assets/persona5.jpg';
import características from './assets/características.png';
import perfil1 from './assets/persona1.jpg';
import perfil2 from './assets/persona2.jpg';
import perfil3 from './assets/persona3.jpg';
import api from './api';

const CustomPrevArrow = (props) => (
  <button {...props} className="slick-prev slick-arrow custom-arrow">
    ←
  </button>
);

const CustomNextArrow = (props) => (
  <button {...props} className="slick-next slick-arrow custom-arrow">
    →
  </button>
);

const Inicio = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [location, setLocation] = useState('');
  const locationInputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [userLocation, setUserLocation] = useState({ lat: 51.505, lng: -0.09 });
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    beforeChange: (oldIndex, newIndex) => setActiveSlide(newIndex),
    appendDots: dots => (
      <div>
        <ul style={{ margin: "0px" }}>{dots}</ul>
      </div>
    ),
    customPaging: i => (
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: i === activeSlide ? 'white' : 'black',
          border: `1px solid ${i === 0 ? 'white' : 'white'}`
        }}
      />
    ),
  };

  const handleVideoPlay = () => {
    setVideoPlaying(true);
  };

  const handleSearch = () => {
    navigate(`/find-work?location=${location}`);
  };

  useEffect(() => {
    const handleLocationSelect = (location) => {
      setLocation(location.address);
      setUserLocation({
        lat: location.lat,
        lng: location.lng
      });
      if (markerRef.current) {
        markerRef.current.setPosition(location);
        mapRef.current.setCenter(location);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }

    const initAutocomplete = () => {
      if (!locationInputRef.current) return;
      const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address
          };
          handleLocationSelect(location);
        }
      });
    };

    const initMap = () => {
      if (!mapRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 13
      });

      const marker = new window.google.maps.Marker({
        map,
        position: userLocation,
        draggable: true,
        title: 'Ubicación seleccionada'
      });
      markerRef.current = marker;

      map.addListener('click', (e) => {
        const latLng = e.latLng;
        handleLocationSelect({ lat: latLng.lat(), lng: latLng.lng(), address: '' });
        marker.setPosition(latLng);
      });

      marker.addListener('dragend', (e) => {
        const latLng = e.latLng;
        handleLocationSelect({ lat: latLng.lat(), lng: latLng.lng(), address: '' });
      });
    };

    if (window.google && window.google.maps) {
      initAutocomplete();
      initMap();
    } else {
      window.initMapCallback = () => {
        initAutocomplete();
        initMap();
      };
    }
  }, [userLocation]);

  return (
    <div className="home-container">
      <Slider {...settings}>
        <div className="slide">
          <div className="slide-content">
            <div className="text-content">
              <h1>Hay <span className="highlight">22,123</span> trabajos esperándote en Perú</h1>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Todo el país"
                  ref={locationInputRef}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSearch}>Buscar trabajo</button>
              </div>
            </div>
            <div className="image-content">
              <img src={imageFile} alt="Postúlate" className="main-image" />
            </div>
          </div>
        </div>
        <div className="slide">
          <div className="slide-content">
            <div className="video-content">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/l1Xekmd42YQ?si=-_6ezFZ16T1HlkXs"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                onPlay={handleVideoPlay}>
              </iframe>
            </div>
          </div>
        </div>
      </Slider>

      <Element name="features" className="features fullscreen-section" id="features">
        <h2>Nuestras Características</h2>
        <div className="features-container">
          <div className="features-list">
            <div className="feature-item">
              <h3>Fácil de Usar</h3>
              <p>Interfaz intuitiva y amigable para todos los usuarios.</p>
            </div>
            <div className="feature-item">
              <h3>Variedad de Servicios</h3>
              <p>Encuentra una amplia gama de servicios disponibles a tu disposición.</p>
            </div>
            <div className="feature-item">
              <h3>Oportunidades de Trabajo</h3>
              <p>Conéctate con empleadores y encuentra trabajos que se adapten a tus habilidades.</p>
            </div>
            <div className="feature-item">
              <h3>Soporte 24/7</h3>
              <p>Estamos aquí para ayudarte en cualquier momento, cualquier día.</p>
            </div>
          </div>
          <div className="features-image">
            <img src={características} alt="Características" />
          </div>
        </div>
      </Element>

      <Element name="testimonials" className="testimonials fullscreen-section" id="testimonials">
        <h2>Testimonios</h2>
        <div className="testimonial-list">
          <div className="testimonial-item">
            <img src={perfil1} alt="Juan Pérez" className="testimonial-icon" />
            <p>"Esta plataforma me ha ayudado a encontrar empleo rápidamente. Muy recomendable!"</p>
            <h4>- Juan Pérez</h4>
          </div>
          <div className="testimonial-item">
            <img src={perfil2} alt="María López" className="testimonial-icon" />
            <p>"He podido ofrecer mis servicios y encontrar nuevos clientes fácilmente. Excelente herramienta."</p>
            <h4>- María López</h4>
          </div>
          <div className="testimonial-item">
            <img src={perfil3} alt="Carlos Ruiz" className="testimonial-icon" />
            <p>"Gracias a esta plataforma, he podido conectar con clientes que buscan exactamente lo que ofrezco. ¡Una maravilla!"</p>
            <h4>- Carlos Ruiz</h4>
          </div>
        </div>
      </Element>

      <Element name="faq" className="faq fullscreen-section" id="faq">
        <h2>Preguntas Frecuentes</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h3>¿Cómo me registro?</h3>
            <p>Para registrarte, haz clic en el botón "Únete Ahora" y sigue las instrucciones.</p>
          </div>
          <div className="faq-item">
            <h3>¿Cómo publico un servicio?</h3>
            <p>Después de registrarte e iniciar sesión, puedes publicar un servicio desde tu perfil.</p>
          </div>
        </div>
      </Element>

      <button 
        className="scroll-to-top" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>
    </div>
  );
};

export default Inicio;
