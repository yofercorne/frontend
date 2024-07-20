import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './findWork.css';
import profileimg from './assets/profile.jpg';
import api from './api';

const FindWork = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    company: '',
    salaryRange: '',
    availability: '',
    location: null,
    jobTitle: ''
  });
  const [userLocation, setUserLocation] = useState({ lat: 51.505, lng: -0.09 });
  const locationInputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    
    fetch(`${api.apiBaseUrl}/api/jobs`)
      .then(response => response.json())
      .then(data => {
        setJobs(data);
        setFilteredJobs(data);
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

    if (window.google && window.google.maps) {
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
    } else {
      window.initMapCallback = () => {
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
    }
  }, []);

  const handleJobClick = (id) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/job-details/${id}`);
    }
  };

  const renderUserImage = (imgUrl) => {
    const defaultImg = profileimg;
    const imageUrl = imgUrl ? imgUrl : defaultImg;
    return (
      <img src={imageUrl} onError={(e) => e.target.src = defaultImg} className="job-img" alt="User" />
    );
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="job-stars">
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
    if (markerRef.current) {
      markerRef.current.setPosition(location);
      mapRef.current.setCenter(location);
    }
  };

  const applyFilters = () => {
    let filtered = jobs;
    if (filters.company) {
      filtered = filtered.filter(job => job.company.toLowerCase().includes(filters.company.toLowerCase()));
    }
    if (filters.salaryRange) {
      const [min, max] = filters.salaryRange.split('-').map(Number);
      filtered = filtered.filter(job => job.salary >= min && job.salary <= max);
    }
    if (filters.availability) {
      filtered = filtered.filter(job => job.status.toLowerCase() === filters.availability.toLowerCase());
    }
    if (filters.location) {
      filtered = filtered.filter(job => {
        if (!job.lat || !job.lng) return false;
        const distance = Math.sqrt(
          Math.pow(job.lat - filters.location.lat, 2) + Math.pow(job.lng - filters.location.lng, 2)
        );
        return distance < 0.1;
      });
    }
    if (filters.jobTitle) {
      filtered = filtered.filter(job => job.job_title.toLowerCase().includes(filters.jobTitle.toLowerCase()));
    }
    setFilteredJobs(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

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
  };

  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
    }
  }, []);

  const resetFilters = () => {
    setFilters({
      company: '',
      salaryRange: '',
      availability: '',
      location: null,
      jobTitle: ''
    });
    setFilteredJobs(jobs);
  };

  return (
    <div className="job-container mt-4">
      <div className="row">
        <div className="col-md-3">
          <h5 className="filter-title">Filtros de Búsqueda</h5>
          <input
            type="text"
            className="form-control job-form-control"
            placeholder="Nombre del trabajo"
            name="jobTitle"
            value={filters.jobTitle}
            onChange={handleFilterChange}
          />

          <input
            type="text"
            className="form-control job-form-control"
            placeholder="Nombre de la compañia"
            name="company"
            value={filters.company}
            onChange={handleFilterChange}
          />

          <select
            className="form-control service-form-control"
            name="priceRange"
            value={filters.salaryRange}
            onChange={handleFilterChange}
          >
            <option value="">Rango de Salarial</option>
            <option value="0-50">$0 - $50</option>
            <option value="51-100">$51 - $100</option>
            <option value="101-200">$101 - $200</option>
            <option value="201-500">$201 - $500</option>
          </select>

          
          <select
            className="form-control job-form-control"
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
            className="form-control job-form-control"
            placeholder="Dirección"
            ref={locationInputRef}
          />
          <div className="job-map-container mt-3">
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
          <h2 className="mb-4">Trabajos Disponibles</h2>
          <div className="list-group">
            {filteredJobs.map(job => (
              <div key={job.id} className="list-group-item list-group-item-action flex-column align-items-start mb-3 job-item" onClick={() => handleJobClick(job.id)}>
                <div className="d-flex w-100 justify-content-between">
                  <div className="d-flex">
                    {renderUserImage(job.user_img)}
                    <div className="ml-3">
                      <h5 className="mb-1">{job.job_title}</h5>
                      <div className="job-list-rating">
                        {renderStars(job.rating)}
                      </div>
                      <p className="mb-1">{job.description}</p>
                      <small className="job-text-muted">Modalidades: {job.modalities}</small>
                    </div>
                  </div>
                  <div className="job-text-right">
                    <small className="job-text-muted"><i className="fa fa-industry mr-1"></i> {job.company}</small><br />
                    <small className="job-text-muted"><i className="fa fa-map-marker-alt mr-1"></i> {job.location}</small><br />
                    <small className="job-text-muted"><i className="fa fa-dollar-sign mr-1"></i> ${job.salary}</small>
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

export default FindWork;
