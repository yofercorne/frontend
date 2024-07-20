import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import './UserProfile.css';
import profileimg from './assets/profile.jpg';
import api from './api';

const UserProfile = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState({
    nombre: '', apellido: '', edad: '', foto: '', dni: '', phone: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [originalPhoto, setOriginalPhoto] = useState('');

  useEffect(() => {
    if (user && user.uid && !isLoaded) {
      fetch(`${api.apiBaseUrl}/api/user/${user.uid}`)
        .then(response => response.json())
        .then(data => {
          setProfile({
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            edad: data.edad ? data.edad.toString() : '',
            foto: data.foto || profileimg,
            dni: data.dni || '',
            phone: data.phone || ''
          });
          setOriginalPhoto(data.foto);
          setIsLoaded(true);
        })
        .catch(error => console.error('Error al obtener los datos del usuario:', error));
    }
  }, [user, isLoaded]);

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value || null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedFields = Object.keys(profile).reduce((acc, key) => {
      if (profile[key] !== '' && profile[key] !== null) {
        acc[key] = profile[key];
      }
      return acc;
    }, {});
  
    fetch(`${api.apiBaseUrl}/api/user/${user.uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    })
    .then(response => response.json())
    .then(() => {
      setEditMode(false);
      setIsUpdatingImage(false);
    })
    .catch(error => console.error('Error al actualizar el perfil:', error));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
      setIsUpdatingImage(true);
    }
  };

  const handleFileChange = () => {
    const file = fileInputRef.current.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('userId', user.uid);
  
    fetch(`${api.apiBaseUrl}/api/upload/profile`, {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta de la carga de la imagen');
      }
      return response.json();
    })
    .then(data => {
      if (data.imageUrl) {
        setProfile(prev => ({ ...prev, foto: data.imageUrl }));
        setOriginalPhoto(data.imageUrl);
  
        // Actualizar la base de datos después de cargar la imagen
        const updatedFields = { foto: data.imageUrl };
  
        fetch(`${api.apiBaseUrl}/api/user/${user.uid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields)
        });
  
        // Actualizar la imagen en la tabla de servicios
        fetch(`${api.apiBaseUrl}/api/services/${user.uid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_img: data.imageUrl })
        })
        .then(() => setIsUpdatingImage(false))
        .catch(error => console.error('Error al actualizar la imagen del servicio:', error));
      }
    })
    .catch(error => {
      console.error('Error al subir la imagen:', error);
      setIsUpdatingImage(false);
    });
  };

  const handleCancel = () => {
    setProfile(prev => ({ ...prev, foto: originalPhoto }));
    setIsUpdatingImage(false);
    setEditMode(false);
  };

  const imageUrl = profile.foto.startsWith('http') ? profile.foto : `${api.apiBaseUrl}${profile.foto}`;

  if (loading || !isLoaded) return <p>Cargando perfil...</p>;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg">
            <div className="profile-image-container">
              <img src={profile.foto} alt="Profile Image" className="card-img-top"
                   style={{ height: '300px', objectFit: 'cover' }} 
                   onError={(e) => { e.target.onerror = null; e.target.src = profileimg; }} />

              {isUpdatingImage ? (
                <>
                  <button className="btn btn-success save-image-btn" onClick={handleFileChange}>Guardar</button>
                  <button className="btn btn-danger cancel-image-btn" onClick={handleCancel}>Cancelar</button>
                </>
              ) : (
                <button className="btn btn-primary edit-image-btn" onClick={() => {
                  fileInputRef.current.click();
                  setOriginalPhoto(profile.foto);
                }}>Editar Imagen</button>
              )}

              <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileSelect} />
            </div>
            <div className="card-body">
              {!editMode ? (
                <div>
                  <h5 className="card-title">{profile.nombre} {profile.apellido}</h5>
                  <p className="card-text">Edad: {profile.edad}</p>
                  <p className="card-text">DNI: {profile.dni}</p>
                  <p className="card-text">Teléfono: {profile.phone}</p>
                  <button onClick={handleEdit} className="btn btn-primary">Editar Perfil</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <input type="text" name="nombre" value={profile.nombre || ''} onChange={handleChange} className="form-control mb-2" placeholder="Nombre" />
                  <input type="text" name="apellido" value={profile.apellido || ''} onChange={handleChange} className="form-control mb-2" placeholder="Apellido" />
                  <input type="number" name="edad" value={profile.edad || ''} onChange={handleChange} className="form-control mb-2" placeholder="Edad" />
                  <input type="text" name="dni" value={profile.dni || ''} onChange={handleChange} className="form-control mb-2" placeholder="DNI" />
                  <input type="text" name="phone" value={profile.phone || ''} onChange={handleChange} className="form-control mb-2" placeholder="Teléfono" />
                  <button type="submit" className="btn btn-success">Guardar Cambios</button>
                  <button onClick={handleCancel} className="btn btn-secondary">Cancelar</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
