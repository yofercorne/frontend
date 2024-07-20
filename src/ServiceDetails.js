import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaThumbsUp, FaThumbsDown, FaReply } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import parse from 'html-react-parser';
import api from './api';

const ServiceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [submittedRating, setSubmittedRating] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    fetch(`${api.apiBaseUrl}/api/services/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setService(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
        if (user && user.uid) {
          fetch(`${api.apiBaseUrl}/api/ratings/service/${id}/user/${user.uid}`)
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
        } else {
          setError('Usuario no autenticado');
        }
      })
      .catch(error => {
        setError(error.toString());
      });

    fetch(`${api.apiBaseUrl}/api/services/${id}/comments`)
      .then(response => response.json())
      .then(data => {
        setComments(data);
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
          serviceId: id,
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
          fetch(`${api.apiBaseUrl}/api/services/${id}`)
            .then(response => response.json())
            .then(data => {
              setService(data);
            });
        })
        .catch(error => {
          setError(error.message);
        });
    } else {
      setError('Usuario no autenticado');
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim() === '') return;
    fetch(`${api.apiBaseUrl}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceId: id,
        userId: user.uid,
        userName: user.displayName || 'Anónimo',
        comment: newComment,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setNewComment('');
        fetch(`${api.apiBaseUrl}/api/services/${id}/comments`)
          .then(response => response.json())
          .then(data => {
            setComments(data);
          });
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const handleReplySubmit = (commentId) => {
    if (newReply.trim() === '') return;
    fetch(`${api.apiBaseUrl}/api/comments/${commentId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.uid,
        userName: user.displayName || 'Anónimo',
        comment: newReply,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setNewReply('');
        setReplyCommentId(null);
        fetch(`${api.apiBaseUrl}/api/services/${id}/comments`)
          .then(response => response.json())
          .then(data => {
            setComments(data);
          });
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const handleLike = (commentId) => {
    fetch(`${api.apiBaseUrl}/api/comments/${commentId}/like`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.uid }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        fetch(`${api.apiBaseUrl}/api/services/${id}/comments`)
          .then(response => response.json())
          .then(data => {
            setComments(data);
          });
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const handleDislike = (commentId) => {
    fetch(`${api.apiBaseUrl}/api/comments/${commentId}/dislike`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.uid }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        fetch(`${api.apiBaseUrl}/api/services/${id}/comments`)
          .then(response => response.json())
          .then(data => {
            setComments(data);
          });
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const renderReplies = (replies) => {
    return replies.map((reply) => (
      <div key={reply.id} style={styles.replyCard}>
        <div style={styles.commentHeader}>
          <img src={reply.user_img} alt={reply.user_name} style={styles.commentUserImage} />
          <div>
            <span style={styles.commentUserName}>{reply.user_name}</span>
            <span style={styles.commentDate}>{new Date(reply.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div style={styles.commentBody}>{reply.comment}</div>
        <div style={styles.commentActions}>
          <FaThumbsUp
            style={{ ...styles.commentAction, ...styles.like }}
            onClick={() => handleLike(reply.id)}
          />
          <span>{reply.likes}</span>
          <FaThumbsDown
            style={{ ...styles.commentAction, ...styles.dislike }}
            onClick={() => handleDislike(reply.id)}
          />
          <span>{reply.dislikes}</span>
        </div>
      </div>
    ));
  };

  const renderComments = () => {
    return comments.map((comment) => (
      <div key={comment.id} style={styles.commentCard}>
        <div style={styles.commentHeader}>
          <img src={comment.user_img} alt={comment.user_name} style={styles.commentUserImage} />
          <div>
            <span style={styles.commentUserName}>{comment.user_name}</span>
            <span style={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div style={styles.commentBody}>{comment.comment}</div>
        <div style={styles.commentActions}>
          <FaThumbsUp
            style={{ ...styles.commentAction, ...styles.like }}
            onClick={() => handleLike(comment.id)}
          />
          <span>{comment.likes}</span>
          <FaThumbsDown
            style={{ ...styles.commentAction, ...styles.dislike }}
            onClick={() => handleDislike(comment.id)}
          />
          <span>{comment.dislikes}</span>
          <FaReply
            style={styles.commentAction}
            onClick={() => setReplyCommentId(comment.id)}
          />
        </div>
        {comment.replies && (
          <div style={styles.repliesContainer}>
            {renderReplies(comment.replies)}
          </div>
        )}
        {replyCommentId === comment.id && (
          <div style={styles.commentForm}>
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Escribe una respuesta..."
              style={styles.commentInput}
            />
            <button onClick={() => handleReplySubmit(comment.id)} style={styles.commentSubmit}>Enviar</button>
          </div>
        )}
      </div>
    ));
  };

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

  const averageRating = service?.rating ? parseFloat(service.rating).toFixed(1) : '0.0';

  const statusStyles = service?.status === 'Disponible' ? styles.statusAvailable : styles.statusUnavailable;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.imageGallery}>
          <div style={styles.thumbnails}>
            {service?.images?.map((image, index) => (
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
            <h1 style={styles.cardTitle}>{service?.service_type}</h1>
            <h2 style={styles.cardSubtitle}>Ofrecido por: {service?.first_name} {service?.last_name}</h2>
            <div style={{ ...styles.status, ...statusStyles }}>{service?.status}</div>
            <div style={styles.ratingSection}>
              {renderStars(parseFloat(service?.rating) || 0)}
              <p style={styles.ratingScore}>{averageRating} / 5.0 ({service?.rating_count} opiniones)</p>
            </div>
          </div>
          <div style={styles.detailsContainer}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Costo:</span>
              <span style={styles.detailValue}>${service?.cost}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Dirección:</span>
              <span style={styles.detailValue}>{service?.address}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Teléfono:</span>
              <span style={styles.detailValue}>{service?.phone}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>DNI:</span>
              <span style={styles.detailValue}>{service?.dni}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Modalidades:</span>
              <span style={styles.detailValue}>{service?.modalities}</span>
            </div>
            <div style={styles.detailRowDescription}>
              <span style={styles.detailLabel}>Descripción:</span>
              <div style={styles.detailDescription}>
                {parse(service?.description || '')}
              </div>
            </div>
            <div style={styles.userRatingSection}>
              <h5 style={styles.sectionTitle}>Tu Calificación:</h5>
              {renderStars(userRating, true)}
              <p style={styles.ratingScore}>{userRating} / 5.0</p>
              {submittedRating && <p style={styles.successMessage}>¡Gracias por tu calificación!</p>}
            </div>
          </div>
          
          <div style={styles.commentsSection}>
            <h5 style={styles.sectionTitle}>Comentarios:</h5>
            {renderComments()}
            <div style={styles.commentForm}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                style={styles.commentInput}
              />
              <button onClick={handleCommentSubmit} style={styles.commentSubmit}>Enviar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: 'auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
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
  cardImage: {
    display: 'flex',
    justifyContent: 'center',
    padding: '10px',
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
    paddingBottom: '20px',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  cardSubtitle: {
    fontSize: '1.5rem',
    color: '#666',
    marginBottom: '10px'
  },
  status: {
    fontWeight: 'bold',
    padding: '5px 10px',
    borderRadius: '4px',
    display: 'inline-block',
    marginBottom: '10px'
  },
  statusAvailable: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  statusUnavailable: {
    backgroundColor: '#dc3545',
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
    fontSize: '1.2rem',
    color: '#333'
  },
  detailsContainer: {
    marginTop: '20px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    alignItems: 'center'
  },
  detailRowDescription: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px',
    alignItems: 'flex-start'
  },
  detailDescription: {
    padding: '15px',
    borderRadius: '8px',
    marginTop: '10px',
    whiteSpace: 'pre-wrap',
    textAlign: 'left',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    width: '100%',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555',
    flex: '1'
  },
  detailValue: {
    color: '#777',
    flex: '2',
    textAlign: 'right'
  },
  commentsSection: {
    borderTop: '1px solid #ddd',
    paddingTop: '20px',
    marginTop: '20px'
  },
  commentCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
  },
  replyCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    margin: '10px 0 0 40px',
    backgroundColor: '#f1f1f1'
  },
  commentHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px'
  },
  commentUserImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '10px'
  },
  commentUserName: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: '10px'
  },
  commentDate: {
    color: '#777'
  },
  commentBody: {
    marginBottom: '10px',
    color: '#555'
  },
  commentActions: {
    display: 'flex',
    alignItems: 'center'
  },
  commentAction: {
    marginRight: '5px',
    cursor: 'pointer'
  },
  like: {
    color: '#007bff'
  },
  dislike: {
    color: '#dc3545'
  },
  commentForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: '10px'
  },
  commentInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginBottom: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  commentSubmit: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  repliesContainer: {
    marginTop: '10px',
    marginLeft: '20px'
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
  userRatingSection: {
    marginTop: '20px'
  },
  sectionTitle: {
    fontWeight: 'bold'
  },
  successMessage: {
    color: 'green',
    fontWeight: 'bold',
    marginTop: '10px'
  }
};

export default ServiceDetails;
