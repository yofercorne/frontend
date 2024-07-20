import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './api';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [submittedRating, setSubmittedRating] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    fetch(`${api.apiBaseUrl}/api/jobs/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data) {
          setError('No se encontraron datos para este trabajo');
        } else {
          setJob(data);
          if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0]);
          }
          if (user && user.uid) {
            fetch(`${api.apiBaseUrl}/api/ratings/job/${id}/user/${user.uid}`)
              .then(response => {
                if (!response.ok) {
                  if (response.status === 404) {
                    return null;
                  }
                  throw new Error(`HTTP status ${response.status}`);
                }
                return response.json();
              })
              .then(ratingData => {
                if (ratingData && ratingData.rating) {
                  setUserRating(ratingData.rating);
                }
              })
              .catch(error => {
                if (error.message !== 'HTTP status 404') {
                  setError(error.toString());
                }
              });

            fetch(`${api.apiBaseUrl}/api/check-subscription`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: user.uid, publisherId: data.user_id })
            })
              .then(response => response.json())
              .then(subscriptionData => {
                setIsSubscribed(subscriptionData.subscribed);
              })
              .catch(error => {
                setError(error.toString());
              });
          } else {
            setError('Usuario no autenticado');
          }
        }
      })
      .catch(error => {
        setError(error.toString());
      });
  }, [id, user]);

  const handleRating = (rating) => {
    setUserRating(rating);
    if (user && user.uid) {
      fetch(`${api.apiBaseUrl}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: id,
          userId: user.uid,
          rating: rating,
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            throw new Error(data.error);
          }
          setSubmittedRating(true);
          fetch(`${api.apiBaseUrl}/api/jobs/${id}`)
            .then(response => response.json())
            .then(data => {
              setJob(data);
            });
        })
        .catch(error => {
          setError(error.message);
        });
    } else {
      setError('Usuario no autenticado');
    }
  };

  const handleSubscribe = async (publisherId) => {
    if (!user || !user.uid) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      const response = await fetch(`${api.apiBaseUrl}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publisherId, userId: user.uid })
      });

      if (response.ok) {
        toast.success('Te has suscrito a las notificaciones de este usuario.');
        setIsSubscribed(true);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al suscribirse a las notificaciones.');
    }
  };

  const handleUnsubscribe = async (publisherId) => {
    if (!user || !user.uid) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      const response = await fetch(`${api.apiBaseUrl}/api/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publisherId, userId: user.uid })
      });

      if (response.ok) {
        toast.success('Te has desuscrito de las notificaciones de este usuario.');
        setIsSubscribed(false);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al desuscribirse de las notificaciones.');
    }
  };

  if (error) {
    return <div style={styles.errorMessage}>Error: {error}</div>;
  }

  if (!job) {
    return <div style={styles.loadingMessage}>Cargando...</div>;
  }

  const renderStars = (rating, interactive = false) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div style={styles.rating}>
        {Array.from({ length: fullStars }, (_, index) => (
          <FaStar
            key={`full-${index}`}
            style={styles.fullStar}
            onClick={() => interactive && handleRating(index + 1)}
          />
        ))}
        {halfStar && (
          <FaStarHalfAlt
            key="half"
            style={styles.halfStar}
            onClick={() => interactive && handleRating(fullStars + 0.5)}
          />
        )}
        {Array.from({ length: emptyStars }, (_, index) => (
          <FaStar
            key={`empty-${index}`}
            style={styles.emptyStar}
            onClick={() => interactive && handleRating(fullStars + halfStar + index + 1)}
          />
        ))}
      </div>
    );
  };

  const averageRating = job.rating ? parseFloat(job.rating).toFixed(1) : '0.0';

  const statusStyles = job.status === 'Available' ? styles.statusAvailable : styles.statusUnavailable;

  const userImage = job.user_img || '/path/to/default-image.jpg'; // Ruta a la imagen predeterminada

  return (
    <div style={styles.container}>
      <ToastContainer />
      <div style={styles.card}>
        <div style={styles.imageGallery}>
          <div style={styles.thumbnails}>
            {job.images?.map((image, index) => (
              <div key={index} style={styles.thumbnail} onClick={() => setSelectedImage(image)}>
                <img src={`${api.apiBaseUrl}${image}`} alt={`Thumbnail ${index}`} style={styles.thumbnailImage} />
              </div>
            ))}
          </div>
          <div style={styles.selectedImage}>
            {selectedImage && <img src={`${api.apiBaseUrl}${selectedImage}`} alt="Selected" style={styles.image} />}
          </div>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.cardHeader}>
            <h1 style={styles.cardTitle}>{job.job_title}</h1>
            <h2 style={styles.cardSubtitle}>Ofrecido por: {job.company}</h2>
            <div style={{ ...styles.status, ...statusStyles }}>{job.status}</div>
            <div style={styles.ratingSection}>
              {renderStars(parseFloat(job.rating) || 0)}
              <p style={styles.ratingScore}>{averageRating} / 5.0 ({job.rating_count} opiniones)</p>
            </div>
          </div>
          
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Salario:</span>
            <span style={styles.detailValue}>${job.salary}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Ubicación:</span>
            <span style={styles.detailValue}>{job.location}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Tipo de Trabajo:</span>
            <span style={styles.detailValue}>{job.job_type}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Descripción:</span>
            <span style={styles.detailValue}>{job.description}</span>
          </div>
          <div style={styles.userRatingSection}>
            <h5 style={styles.sectionTitle}>Tu Calificación:</h5>
            {renderStars(userRating, true)}
            <p style={styles.ratingScore}>{userRating} / 5.0</p>
            {submittedRating && <p style={styles.successMessage}>¡Gracias por tu calificación!</p>}
          </div>
          {isSubscribed ? (
            <button
              style={styles.unsubscribedButton}
              onClick={() => handleUnsubscribe(job.user_id)}
            >
              Desuscribirse de las notificaciones de este usuario
            </button>
          ) : (
            <button
              style={styles.subscribeButton}
              onClick={() => handleSubscribe(job.user_id)}
            >
              Suscribirse a notificaciones de este usuario
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: 'auto',
    padding: '20px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    padding: '20px'
  },
  imageGallery: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20px',
    textAlign: 'center'  // Center text and images horizontally
  },
  thumbnails: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: '20px'
  },
  thumbnail: {
    marginBottom: '10px',
    cursor: 'pointer'
  },
  thumbnailImage: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  selectedImage: {
    flex: '1',
    maxWidth: '60%',  // Reduce the maximum width to fit better
    borderRadius: '8px'
  },
  image: {
    maxWidth: '100%',
    borderRadius: '8px'
  },
  cardBody: {
    padding: '20px'
  },
  cardHeader: {
    borderBottom: '1px solid #ddd',
    paddingBottom: '10px',
    marginBottom: '10px'
  },
  cardTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0'
  },
  cardSubtitle: {
    fontSize: '1.2rem',
    color: '#555',
    margin: '0 0 10px 0'
  },
  status: {
    fontWeight: 'bold',
    padding: '5px 10px',
    borderRadius: '4px',
    display: 'inline-block',
    marginBottom: '10px'
  },
  statusAvailable: {
    backgroundColor: 'green',
    color: 'white'
  },
  statusUnavailable: {
    backgroundColor: 'red',
    color: 'white'
  },
  ratingSection: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px'
  },
  fullStar: {
    color: 'gold',
    fontSize: '2rem',
    marginRight: '0.2rem',
    cursor: 'pointer'
  },
  halfStar: {
    color: 'gold',
    fontSize: '2rem',
    marginRight: '0.2rem',
    cursor: 'pointer'
  },
  emptyStar: {
    color: 'lightgray',
    fontSize: '2rem',
    marginRight: '0.2rem',
    cursor: 'pointer'
  },
  ratingScore: {
    marginLeft: '10px',
    fontSize: '1rem'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  detailLabel: {
    fontWeight: 'bold'
  },
  detailValue: {
    color: '#555'
  },
  userRatingSection: {
    marginTop: '20px'
  },
  sectionTitle: {
    fontWeight: 'bold'
  },
  errorMessage: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '20px 0'
  },
  loadingMessage: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    textAlign: 'center',
    marginTop: '2rem'
  },
  successMessage: {
    color: 'green',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  subscribeButton: {
    backgroundColor: 'blue',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px'
  },
  unsubscribedButton: {
    backgroundColor: 'red',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

export default JobDetails;
