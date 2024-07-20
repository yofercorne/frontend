import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import './postService.css';
import infoIcon from './assets/logo2.png';
import { showConfirmDialog } from './confirmDialog';
import imagenRelleno from './assets/servicio.jpg';
import api from './api';

const PostService = () => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState({
    phone: '',
    address: '',
    lat: null,
    lng: null,
    description: '',
    service_type: '',
    modalities: 'Presencial',
    user_img: '',
    serviceImages: []
  });

  const [originalServiceData, setOriginalServiceData] = useState(null);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const addressInputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchServices();
      checkUserProfile();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window.google !== 'undefined' && window.google.maps) {
        initMap();
      } else {
        window.initMapCallback = initMap;
      }
    };

    const initMap = async () => {
      if (typeof window.google !== 'undefined' && window.google.maps && window.google.maps.places) {
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            const { lat, lng } = place.geometry.location;
            setServiceData((prevState) => ({
              ...prevState,
              address: place.formatted_address,
              lat: lat(),
              lng: lng(),
            }));
            if (mapRef.current && markerRef.current) {
              mapRef.current.setCenter({ lat: lat(), lng: lng() });
              markerRef.current.position = { lat: lat(), lng: lng() };
            }
          }
        });

        const map = new window.google.maps.Map(document.getElementById('map'), {
          center: { lat: -34.397, lng: 150.644 },
          zoom: 8,
          mapId: "DEMO_MAP_ID",
        });
        mapRef.current = map;

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: -34.397, lng: 150.644 },
          draggable: true,
          title: "Ubicación del servicio"
        });
        markerRef.current = marker;

        const geocoder = new window.google.maps.Geocoder();
        geocoderRef.current = geocoder;

        map.addListener('click', (e) => {
          const latLng = e.latLng;
          setServiceData((prevState) => ({
            ...prevState,
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));
          marker.position = latLng;
          geocodeLatLng(geocoder, latLng);
        });

        marker.addListener('dragend', (e) => {
          const latLng = e.latLng;
          setServiceData((prevState) => ({
            ...prevState,
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));
          geocodeLatLng(geocoder, latLng);
        });
      }
    };

    if (showForm) {
      loadGoogleMaps();
    }

    return () => {
      window.initMapCallback = null;
    };
  }, [showForm]);

  const geocodeLatLng = (geocoder, latLng) => {
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          setServiceData((prevState) => ({
            ...prevState,
            address: results[0].formatted_address,
          }));
        } else {
          console.error('No results found');
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${api.apiBaseUrl}/api/services/user/${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error fetching services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const checkUserProfile = async () => {
    try {
      const response = await fetch(`${api.apiBaseUrl}/api/user/${user.uid}`);
      if (!response.ok) throw new Error('Error fetching user profile');
      const data = await response.json();
      const isComplete = data.nombre && data.apellido && data.phone && data.foto;
      setIsProfileComplete(isComplete);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleDescriptionChange = (value) => {
    setServiceData((prevState) => ({ ...prevState, description: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setServiceData((prevState) => ({
      ...prevState,
      serviceImages: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Por favor, inicie sesión para publicar un servicio.');
      return;
    }

    if (!serviceData.service_type) {
      setError('El tipo de servicio es obligatorio.');
      return;
    }

    if (!validatePhone(serviceData.phone)) {
      setError('El número de teléfono debe tener 9 dígitos.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', user.uid);
    formData.append('dni', serviceData.dni);
    formData.append('phone', serviceData.phone);
    formData.append('address', serviceData.address);
    formData.append('description', serviceData.description);
    formData.append('service_type', serviceData.service_type);
    formData.append('modalities', serviceData.modalities);

    formData.append('status', 'Available');
    formData.append('lat', serviceData.lat);
    formData.append('lng', serviceData.lng);
    formData.append('user_img', serviceData.user_img);
    serviceData.serviceImages.forEach((image, index) => {
      formData.append(`serviceImages`, image);
    });

    setIsLoading(true);

    try {
      const response = isEditMode 
        ? await fetch(`${api.apiBaseUrl}/api/services/${currentServiceId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          })
        : await fetch(`${api.apiBaseUrl}/api/services`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          });

      setIsLoading(false);
      if (!response.ok) throw new Error(`Error al ${isEditMode ? 'editar' : 'crear'} el servicio`);
      const data = await response.json();
      toast.success(`Servicio ${isEditMode ? 'editado' : 'creado'} con éxito`);
      fetchServices();
      setShowForm(false);
      setServiceData({
        phone: '',
        address: '',
        lat: null,
        lng: null,
        description: '',
        service_type: '',
        modalities: 'Presencial',
        user_img: '',
        serviceImages: []
      });
      setIsEditMode(false);
      setCurrentServiceId(null);
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error);
      toast.error(`Error al ${isEditMode ? 'editar' : 'crear'} el servicio`);
    }
  };

  const handleEdit = (service) => {
    if (service.user_id !== user.uid) {
      toast.error('Solo puede editar sus propios servicios.');
      return;
    }
    setServiceData({
      phone: service.phone,
      address: service.address,
      lat: service.lat,
      lng: service.lng,
      description: service.description,
      service_type: service.service_type,
      modalities: service.modalities,
      user_img: service.user_img,
      serviceImages: service.serviceImages || []
    });
    setOriginalServiceData({
      phone: service.phone,
      address: service.address,
      lat: service.lat,
      lng: service.lng,
      description: service.description,
      service_type: service.service_type,
      modalities: service.modalities,
      user_img: service.user_img,
      serviceImages: service.serviceImages || []
    });
    setCurrentServiceId(service.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleStatusToggle = async (service) => {
    const updatedStatus = service.status === 'Available' ? 'Expired' : 'Available';

    try {
      const response = await fetch(`${api.apiBaseUrl}/api/services/${service.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: updatedStatus }),
      });
      if (!response.ok) throw new Error('Error al actualizar el estado del servicio');
      fetchServices();
      toast.success(`Estado del servicio actualizado a ${updatedStatus}`);
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      toast.error('Error al actualizar el estado del servicio');
    }
  };

  const handleDelete = async (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (!service || service.user_id !== user.uid) {
      toast.error('Solo puede eliminar sus propios servicios.');
      return;
    }
    
    showConfirmDialog(async () => {
      try {
        const response = await fetch(`${api.apiBaseUrl}/api/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Error al eliminar el servicio');
        toast.success('Servicio eliminado con éxito');
        fetchServices();
      } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        toast.error('Error al eliminar el servicio');
      }
    });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleShowForm = () => {
    if (!isProfileComplete) {
      toast.error('Por favor, completa tu perfil antes de publicar un servicio.');
      navigate('/UserProfile');
    } else {
      setShowForm(!showForm);
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="section">
        <h2 className="section-title">{isEditMode ? 'Editar Servicio' : 'Publicar Nuevo Servicio'}</h2>
        <button className="btn btn-primary mb-3" onClick={handleShowForm}>
          {showForm ? 'Ocultar Formulario' : isEditMode ? 'Editar Servicio' : 'Publicar Nuevo Servicio'}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit} className="service-form">
            <div className="form-group">
              <label>Tipo de Servicio <img src={infoIcon} alt="info" title="Ingrese el tipo de servicio que está ofreciendo" className="info-icon" /></label>
              <input
                type="text"
                className="form-control"
                name="service_type"
                value={serviceData.service_type}
                onChange={handleChange}
                placeholder="Tipo de Servicio"
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono <img src={infoIcon} alt="info" title="Ingrese un número de teléfono de 9 dígitos" className="info-icon" /></label>
              <input
                type="tel"
                className="form-control"
                name="phone"
                value={serviceData.phone}
                onChange={handleChange}
                placeholder="Ingrese número de teléfono"
                required
              />
            </div>
            <div className="form-group">
              <label>Dirección <img src={infoIcon} alt="info" title="Ingrese la dirección donde se proporcionará el servicio" className="info-icon" /></label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={serviceData.address}
                onChange={handleChange}
                ref={addressInputRef}
                placeholder="Ingrese dirección"
                required
              />
            </div>
            <div className="form-group">
              <label>Ubicación <img src={infoIcon} alt="info" title="Seleccione la ubicación en el mapa" className="info-icon" /></label>
              <div id="map" style={{ height: '300px', width: '100%' }}></div>
            </div>
            <div className="form-group">
              <label>Descripción <img src={infoIcon} alt="info" title="Proporcione una descripción detallada del servicio" className="info-icon" /></label>
              <ReactQuill
                theme="snow"
                value={serviceData.description}
                onChange={handleDescriptionChange}
                placeholder="Ingrese descripción del servicio"
              />
            </div>
            <div className="form-group">
              <label>Modalidades <img src={infoIcon} alt="info" title="Seleccione las modalidades del servicio (Presencial, Virtual, Ambos)" className="info-icon" /></label>
              <select
                className="form-control"
                name="modalities"
                value={serviceData.modalities}
                onChange={handleChange}
                required
              >
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Ambos">Ambos</option>
              </select>
            </div>
            <div className="form-group">
              <label>Imágenes del Servicio <img src={infoIcon} alt="info" title="Seleccione imágenes que representen el servicio" className="info-icon" /></label>
              <input
                type="file"
                className="form-control"
                name="serviceImages"
                multiple
                onChange={handleImageChange}
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-success mt-3" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        )}
      </div>

      <div className="section mt-4">
        <h2 className="section-title">Tus Servicios</h2>
        <div className="service-list">
          {services.length === 0 && (
            <div className="no-services">
              <img src={imagenRelleno} alt="No services available" />
              <p></p>
            </div>
          )}
          {services.map((service) => (
            <div key={service.id} className="card service-item mt-2">
              <div className="card-body">
                <h5 className="card-title">
                  {service.service_type} - {service.status}
                </h5>
                <p className="card-text" dangerouslySetInnerHTML={{ __html: service.description }}></p>
                <p className="card-text">Modalidades: {service.modalities}</p>
                <p className="card-text">Dirección: {service.address}</p>
                <p className="card-text">Teléfono: {service.phone}</p>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-warning" onClick={() => handleEdit(service)}>
                    Editar
                  </button>
                  <button
                    className={`btn ${service.status === 'Available' ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => handleStatusToggle(service)}
                  >
                    {service.status === 'Available' ? 'Disponible' : 'Expirado'}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(service.id)}>
                    Eliminar
                  </button>
                </div>
              </div>  
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostService;
