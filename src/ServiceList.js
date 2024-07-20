import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './serviceList.css';
import profileimg from './assets/profile.jpg';
import Description from './Description';
import api from './api';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    company: '',
    priceRange: '',
    availability: '',
    location: null,
    serviceName: ''
  });
  const [userLocation, setUserLocation] = useState({ lat: 51.505, lng: -0.09 });
  const locationInputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    fetch(`${api.apiBaseUrl}/api/services`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setServices(data);
          setFilteredServices(data);
        } else {
          console.error('Expected data to be an array', data);
          setServices([]);
          setFilteredServices([]);
        }
      })
      .catch(console.error);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }

    const initMap = () => {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: userLocation,
        zoom: 13
      });
      mapRef.current = map;

      const marker = new window.google.maps.Marker({
        map,
        position: userLocation,
        draggable: true,
        title: 'Ubicación seleccionada'
      });
      markerRef.current = marker;

      map.addListener('click', (e) => {
        const latLng = e.latLng;
        handleLocationSelect({ lat: latLng.lat(), lng: latLng.lng() });
        marker.setPosition(latLng);
      });

      marker.addListener('dragend', (e) => {
        const latLng = e.latLng;
        handleLocationSelect({ lat: latLng.lat(), lng: latLng.lng() });
      });

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
          map.setCenter(location);
          marker.setPosition(location);
        }
      });
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      window.initMapCallback = initMap;
    }
  }, []);

  const handleServiceClick = (id) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/service-details/${id}`);
    }
  };

  const renderUserImage = (imgUrl) => {
    const defaultImg = profileimg;
    const imageUrl = imgUrl ? imgUrl : defaultImg;
    return (
      <img src={imageUrl} onError={(e) => e.target.src = defaultImg} className="service-img" alt="User" />
    );
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="service-stars">
        {Array.from({ length: fullStars }, (_, index) => (
          <i key={`full-${index}`} className="fa fa-star checked"></i>
        ))}
        {halfStar && <i key="half" className="fa fa-star-half-alt checked"></i>}
        {Array.from({ length: emptyStars }, (_, index) => (
          <i key={`empty-${index}`} className="fa fa-star"></i>
        ))}
      </div>
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleLocationSelect = (location) => {
    setFilters({
      ...filters,
      location
    });
    setUserLocation(location);
  };

  const applyFilters = () => {
    let filtered = services;
    if (filters.company) {
      filtered = filtered.filter(service => service.company.toLowerCase().includes(filters.company.toLowerCase()));
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(service => service.cost >= min && service.cost <= max);
    }
    if (filters.availability) {
      filtered = filtered.filter(service => service.status.toLowerCase() === filters.availability.toLowerCase());
    }
    if (filters.location) {
      filtered = filtered.filter(service => {
        if (!service.lat || !service.lng) return false;
        const distance = Math.sqrt(
          Math.pow(service.lat - filters.location.lat, 2) + Math.pow(service.lng - filters.location.lng, 2)
        );
        return distance < 0.1;
      });
    }
    if (filters.serviceName) {
      filtered = filtered.filter(service => service.service_type.toLowerCase().includes(filters.serviceName.toLowerCase()));
    }
    setFilteredServices(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      company: '',
      priceRange: '',
      availability: '',
      location: null,
      serviceName: ''
    });
    setFilteredServices(services);
  };

  return (
    <div className="service-container mt-4">
      <div className="row">
        <div className="col-md-3">
          <h5 className="service-filter-title">Filtros de Búsqueda</h5>
          <input
            type="text"
            className="form-control service-form-control"
            placeholder="Nombre del servicio"
            name="serviceName"
            value={filters.serviceName}
            onChange={handleFilterChange}
          />
          <select
            className="form-control service-form-control"
            name="priceRange"
            value={filters.priceRange}
            onChange={handleFilterChange}
          >
            <option value="">Rango de precio</option>
            <option value="0-50">$0 - $50</option>
            <option value="51-100">$51 - $100</option>
            <option value="101-200">$101 - $200</option>
            <option value="201-500">$201 - $500</option>
          </select>
          <select
            className="form-control service-form-control"
            name="availability"
            value={filters.availability}
            onChange={handleFilterChange}
          >
            <option value="">Disponibilidad</option>
            <option value="available">Disponible</option>
            <option value="unavailable">No Disponible</option>
          </select>
          <input
            type="text"
            className="form-control service-form-control"
            placeholder="Ubicación"
            ref={locationInputRef}
          />
          <div className="service-map-container mt-3">
            <div id="map" style={{ height: '300px', width: '100%' }}></div>
          </div>
          <button
            className="btn btn-primary w-100 mt-3"
            onClick={resetFilters}
          >
            Restablecer Filtros
          </button>
        </div>
        <div className="col-md-9">
          <h2 className="mb-4">Servicios Disponibles</h2>
          <div className="list-group">
            {Array.isArray(filteredServices) && filteredServices.map(service => (
              <div key={service.id} className="list-group-item list-group-item-action flex-column align-items-start mb-3 service-item" onClick={() => handleServiceClick(service.id)}>
                <div className="d-flex w-100 justify-content-between">
                  <div className="d-flex">
                    {renderUserImage(service.user_img)}
                    <div className="ml-3">
                      <h5 className="mb-1">{service.service_type}</h5>
                      <div className="service-list-rating">
                        {renderStars(service.rating)}
                      </div>
                      <Description text={service.description} limit={20} />
                      <small className="service-text-muted">Modalidades: {service.modalities}</small>
                    </div>
                  </div>
                  <div className="service-text-right">
                    <small className="service-text-muted"><i className="fa fa-industry mr-1"></i> {service.industry}</small><br />
                    <small className="service-text-muted"><i className="fa fa-map-marker-alt mr-1"></i> {service.address}</small><br />
                    <small className="service-text-muted"><i className="fa fa-dollar-sign mr-1"></i> ${service.cost}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>  
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
