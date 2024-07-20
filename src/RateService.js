import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import api from '../api';

const RateService = ({ onRatingSubmitted }) => {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [error, setError] = useState(null);

  const handleRatingSubmit = () => {
    fetch(`${api.apiBaseUrl}/api/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceId: id,
        userId: 1, // Reemplaza con el ID del usuario autenticado
        rating: rating,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        onRatingSubmitted();
      })
      .catch(error => {
        setError(error.message);
      });
  };

  return (
    <div className="rate-service">
      <h4>Rate this service</h4>
      {error && <p className="text-danger">{error}</p>}
      <div className="rating">
        {Array.from({ length: 5 }, (_, index) => (
          <FaStar
            key={index}
            size={24}
            onMouseEnter={() => setHover(index + 1)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setRating(index + 1)}
            className={index + 1 <= (hover || rating) ? 'star-checked' : ''}
          />
        ))}
      </div>
      <button className="btn btn-primary mt-2" onClick={handleRatingSubmit}>
        Submit Rating
      </button>
    </div>
  );
};

export default RateService;
