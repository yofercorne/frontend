import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './postJob.css';
import infoIcon from './assets/logo2.png';
import { showConfirmDialog } from './confirmDialog';
import imagenRelleno from './assets/empleo.jpg';
import api from './api';

const PostJob = () => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    job_title: '',
    description: '',
    company: '',
    location: '',
    lat: null,
    lng: null,
    job_type: 'Tiempo Completo',
    salary: '',
    salary_frequency: 'Mensual',
    num_employees: 1,
    user_img: user ? user.foto : 'default.png'
  });
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [originalJobData, setOriginalJobData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const locationInputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchJobs();
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
        const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            const { lat, lng } = place.geometry.location;
            setJobData((prevState) => ({
              ...prevState,
              location: place.formatted_address,
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
          title: "Ubicación del trabajo"
        });
        markerRef.current = marker;

        const geocoder = new window.google.maps.Geocoder();
        geocoderRef.current = geocoder;

        map.addListener('click', (e) => {
          const latLng = e.latLng;
          setJobData((prevState) => ({
            ...prevState,
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));
          marker.position = latLng;
          geocodeLatLng(geocoder, latLng);
        });

        marker.addListener('dragend', (e) => {
          const latLng = e.latLng;
          setJobData((prevState) => ({
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
          setJobData((prevState) => ({
            ...prevState,
            location: results[0].formatted_address,
          }));
        } else {
          console.error('No results found');
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${api.apiBaseUrl}/api/jobs/user/${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error fetching jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const checkUserProfile = async () => {
    try {
      const response = await fetch(`${api.apiBaseUrl}/api/user/${user.uid}`);
      if (!response.ok) throw new Error('Error fetching user profile');
      const data = await response.json();
      const isComplete = data.dni && data.nombre && data.apellido && data.foto;
      setIsProfileComplete(isComplete);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prevState) => ({ ...prevState, [name]: value }));
    if (name === 'num_employees' && parseInt(value, 10) > 50) {
      setAdditionalInfo('');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to publish a job.');
      return;
    }

    if (!jobData.job_title) {
      setError('Job title is required.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', user.uid);
    formData.append('job_title', jobData.job_title);
    formData.append('description', jobData.description || 'N/A');
    formData.append('company', jobData.company || 'N/A');
    formData.append('location', jobData.location || 'N/A');
    formData.append('lat', jobData.lat);
    formData.append('lng', jobData.lng);
    formData.append('job_type', jobData.job_type);
    formData.append('salary', jobData.salary || 0);
    formData.append('salary_frequency', jobData.salary_frequency);
    Array.from(selectedFiles).forEach(file => {
      formData.append('jobImages', file);
    });

    setIsLoading(true);

    try {
      const response = await fetch(`${api.apiBaseUrl}/api/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      setIsLoading(false);
      if (!response.ok) throw new Error('Failed to create job');
      toast.success('Job created successfully');
      fetchJobs(); // Refresh list after posting
      setShowForm(false); // Close the form after submission
      setJobData({
        job_title: '',
        description: '',
        company: '',
        location: '',
        lat: null,
        lng: null,
        job_type: 'Tiempo Completo',
        salary: '',
        salary_frequency: 'Mensual',
        num_employees: 1,
        user_img: user ? user.foto : 'default.png'
      }); // Reset form fields
      setSelectedFiles([]); // Reset selected files
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error);
      toast.error('Error creating job');
    }
  };

  const handleEdit = (job) => {
    if (job.user_id !== user.uid) {
      toast.error('You can only edit your own jobs.');
      return;
    }
    setJobData({
      job_title: job.job_title,
      description: job.description,
      company: job.company,
      location: job.location,
      lat: job.lat,
      lng: job.lng,
      job_type: job.job_type,
      salary: job.salary,
      salary_frequency: job.salary_frequency,
      num_employees: 1,
      user_img: job.user_img
    });
    setOriginalJobData({
      job_title: job.job_title,
      description: job.description,
      company: job.company,
      location: job.location,
      lat: job.lat,
      lng: job.lng,
      job_type: job.job_type,
      salary: job.salary,
      salary_frequency: job.salary_frequency,
      user_img: job.user_img
    });
    setCurrentJobId(job.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleStatusToggle = async (job) => {
    const updatedStatus = job.status === 'Available' ? 'Expired' : 'Available';

    try {
      const response = await fetch(`${api.apiBaseUrl}/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: updatedStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchJobs(); // Refresh list after updating status
      toast.success(`Job status updated to ${updatedStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.user_id !== user.uid) {
      toast.error('You can only delete your own jobs.');
      return;
    }
    
    showConfirmDialog(async () => {
      try {
        const response = await fetch(`${api.apiBaseUrl}/api/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to delete job');
        toast.success('Job deleted successfully');
        fetchJobs(); // Refresh list after deletion
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Error deleting job');
      }
    });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleShowForm = () => {
    if (!isProfileComplete) {
      toast.error('Por favor completa tu perfil antes de publicar un empleo.');
      navigate('/UserProfile');
    } else {
      setShowForm(!showForm);
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="section">
        <h2 className="section-title">{isEditMode ? 'Edit Job' : 'Post a New Job'}</h2>
        <button className="btn btn-primary mb-3" onClick={handleShowForm}>
          {showForm ? 'Hide Form' : isEditMode ? 'Edit Job' : 'Publish New Job'}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-group">
              <label>Job Title <img src={infoIcon} alt="info" title="Enter the title of the job" className="info-icon" /></label>
              <input
                type="text"
                className="form-control"
                name="job_title"
                value={jobData.job_title}
                onChange={handleChange}
                placeholder="Título del Trabajo"
                required
              />
            </div>
            <div className="form-group">
              <label>Company <img src={infoIcon} alt="info" title="Enter the name of the company" className="info-icon" /></label>
              <input
                type="text"
                className="form-control"
                name="company"
                value={jobData.company}
                onChange={handleChange}
                placeholder="Nombre de la Empresa"
              />
            </div>
            <div className="form-group">
              <label>Description <img src={infoIcon} alt="info" title="Provide a detailed description of the job" className="info-icon" /></label>
              <textarea
                className="form-control"
                name="description"
                value={jobData.description}
                onChange={handleChange}
                placeholder="Descripción del Trabajo"
                maxLength="500"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Location <img src={infoIcon} alt="info" title="Enter the location of the job" className="info-icon" /></label>
              <input
                type="text"
                className="form-control"
                name="location"
                value={jobData.location}
                onChange={handleChange}
                ref={locationInputRef}
                placeholder="Ubicación"
              />
              <small className="form-text text-muted">
                Recuerde que esta dirección es la dirección del lugar del empleo y no su dirección privada
              </small>
            </div>
            <div className="form-group">
              <label>Location on Map <img src={infoIcon} alt="info" title="Select the location on the map" className="info-icon" /></label>
              <div id="map" style={{ height: '300px', width: '100%' }}></div>
            </div>
            <div className="form-group">
              <label>Job Type <img src={infoIcon} alt="info" title="Select the type of job (Tiempo Completo, Medio Tiempo, Freelance)" className="info-icon" /></label>
              <select
                className="form-control"
                name="job_type"
                value={jobData.job_type}
                onChange={handleChange}
              >
                <option value="Tiempo Completo">Tiempo Completo</option>
                <option value="Medio Tiempo">Medio Tiempo</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Salary ($) <img src={infoIcon} alt="info" title="Enter the salary for the job" className="info-icon" /></label>
              <input
                type="number"
                className="form-control"
                name="salary"
                value={jobData.salary}
                onChange={handleChange}
                placeholder="Salario"
              />
            </div>
            {!isEditMode && (
              <div className="form-group">
                <label>Número de Empleados <img src={infoIcon} alt="info" title="Enter the number of employees required" className="info-icon" /></label>
                <input
                  type="number"
                  className="form-control"
                  name="num_employees"
                  value={jobData.num_employees}
                  onChange={handleChange}
                  min="1"
                  placeholder="Cantidad de Empleados"
                />
              </div>
            )}
            {!isEditMode && jobData.num_employees > 50 && (
              <div className="form-group">
                <label>Justificación para la alta cantidad de empleados <img src={infoIcon} alt="info" title="Provide justification for hiring a large number of employees" className="info-icon" /></label>
                <textarea
                  className="form-control"
                  name="additional_info"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Proporcione información adicional sobre la contratación masiva"
                ></textarea>
              </div>
            )}
            <div className="form-group">
              <label>Imágenes del Trabajo <img src={infoIcon} alt="info" title="Seleccione las imágenes del trabajo" className="info-icon" /></label>
              <input
                type="file"
                className="form-control"
                name="jobImages"
                onChange={handleFileChange}
                multiple
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-success mt-3" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>

      <div className="section mt-4">
        <h2 className="section-title">Your Jobs</h2>
        <div className="job-list">
          {jobs.length === 0 && (
            <div className="no-jobs">
              <img src={imagenRelleno} alt="No jobs available" />
              <p></p>
            </div>
          )}
          {jobs.map((job) => (
            <div key={job.id} className="card job-item mt-2">
              <div className="card-body">
                <h5 className="card-title">
                  {job.job_title} - {job.status}
                </h5>
                <p className="card-text">{job.description}</p>
                <p className="card-text">Company: {job.company}</p>
                <p className="card-text">Location: {job.location}</p>
                <p className="card-text">Salary: ${job.salary}</p>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-warning" onClick={() => handleEdit(job)}>
                    Edit
                  </button>
                  <button
                    className={`btn ${job.status === 'Available' ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => handleStatusToggle(job)}
                  >
                    {job.status === 'Available' ? 'Available' : 'Expired'}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(job.id)}>
                    Delete
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

export default PostJob;
