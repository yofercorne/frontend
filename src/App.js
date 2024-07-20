import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Login from './components/login';
import Register from './components/register';
import Inicio from './Inicio';
import { AuthProvider, useAuth } from './AuthContext';
import PostJob from './post-job';
import PostService from './post-service';
import FindWork from './find-work';
import Footer from './Footer';
import UserProfile from './UserProfile';
import VerifyEmail from './components/verify-email';
import ServiceList from './ServiceList';
import ServiceDetails from './ServiceDetails';
import JobDetails from './jobDetails';
import Courses from './Courses';
import Chatbot from './ChatbotComponent'; // Importa el componente del chatbot

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/find-work" element={<FindWork />} />
            <Route path="/post-job" element={<ProtectedRoute component={PostJob} />} />
            <Route path="/post-service" element={<ProtectedRoute component={PostService} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/UserProfile" element={<ProtectedRoute component={UserProfile} />} />
            <Route path="/" element={<Inicio />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/service-details/:id" element={<ServiceDetails />} />
            <Route path="/job-details/:id" element={<JobDetails />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/Courses" element={<Courses />} />
          </Routes>
          {/* Añade el componente del chatbot   <Chatbot />*/}
          <Chatbot /> 
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

function ProtectedRoute({ component: Component }) {
  const { isAuthenticated } = useAuth();
  console.log('ProtectedRoute isAuthenticated:', isAuthenticated); // Debug message
  return isAuthenticated ? <Component /> : <Navigate to="/login" replace />;
}

export default App;
