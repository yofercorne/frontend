import React, { useState, useEffect } from 'react';
import './Courses.css';
import course1 from './assets/uñas.jpg';
import course2 from './assets/maquillaje.jpg';
import course3 from './assets/instalacion.jpg';
import course4 from './assets/barberia.jpg';
import course5 from './assets/Inteligencia.jpg';
import beeImage from './assets/registro.png'; // Asegúrate de poner la ruta correcta de tu imagen

const Courses = () => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Sistema de Uñas",
      description: "Comprehensive guide to Facebook Marketing and Ads.",
      instructor: "Alex Genadinik",
      price: 49.9,
      original_price: 69.9,
      rating: 4.6,
      rating_count: 948,
      category: "Marketing",
      thumbnail_url: course1,
      is_bestseller: true
    },
    {
      id: 2,
      title: "Maquillaje",
      description: "Master the art of planning and managing successful events.",
      instructor: "Alex Genadinik",
      price: 49.9,
      original_price: 64.9,
      rating: 4.4,
      rating_count: 2496,
      category: "Events",
      thumbnail_url: course2,
      is_bestseller: true
    },
    {
      id: 3,
      title: "Instalaciones electricas",
      description: "Learn how to handle media crises effectively.",
      instructor: "TJ Walker",
      price: 49.9,
      original_price: 74.9,
      rating: 4.6,
      rating_count: 2770,
      category: "Public Relations",
      thumbnail_url: course3,
      is_bestseller: true
    },
    {
      id: 4,
      title: "Barbería",
      description: "Fundamental marketing strategies for small businesses.",
      instructor: "Alexandra Krieger",
      price: 49.9,
      original_price: 74.9,
      rating: 4.5,
      rating_count: 5375,
      category: "Marketing",
      thumbnail_url: course4,
      is_bestseller: true
    },
    {
      id: 5,
      title: "Inteligencia Artificial",
      description: "Introduction to SEO and Social Media Marketing.",
      instructor: "John Doe",
      price: 39.9,
      original_price: 59.9,
      rating: 4.7,
      rating_count: 1290,
      category: "SEO",
      thumbnail_url: course5,
      is_bestseller: true
    }
  ]);

  const [selectedImage, setSelectedImage] = useState(null);

  const handleCardClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="courses-container">
      <h1 className="courses-title">Marketing Courses</h1>
      <p className="courses-subtitle">Courses to get you started</p>
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card" onClick={() => handleCardClick(course.thumbnail_url)}>
            <img src={course.thumbnail_url} alt={course.title} className="course-thumbnail" />
            <div className="course-info">
              <h3>{course.title}</h3>
              <p>{course.instructor}</p>
              <div className="course-rating">
                {Array.from({ length: Math.floor(course.rating) }, (_, index) => (
                  <i key={index} className="fa fa-star rating"></i>
                ))}
                {course.rating % 1 !== 0 && <i className="fa fa-star-half-alt rating"></i>}
                <span className="rating-count">{course.rating} ({course.rating_count})</span>
              </div>
              <div className="course-pricing">
                <span className="price">S/{course.price}</span>
                <span className="original-price">S/{course.original_price}</span>
              </div>
              {course.is_bestseller && <span className="bestseller">Bestseller</span>}
            </div>
          </div>
        ))}
      </div>
      {selectedImage && (
        <div className="image-modal" onClick={handleCloseImage}>
          <img src={selectedImage} alt="Selected Course" className="image-modal-content" />
        </div>
      )}
      <div className="contact-container">
        <img src={beeImage} alt="Bee" className="bee-image" />
        <a href="https://web.facebook.com/CetproSanLuisGonzaga/?locale=es_LA&_rdc=1&_rdr" target="_blank" rel="noopener noreferrer" className="contact-link">
          Si te interesaron algunos de estos cursos comunícate con nosotros
        </a>
      </div>
    </div>
  );
};

export default Courses;
