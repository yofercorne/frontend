import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import appfirebase from '../credenciales';

const auth = getAuth(appfirebase);

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {currentUser ? (
        <>
          <h2>Bienvenido, {currentUser.email}</h2>
          <button className="btn btn-primary" onClick={() => signOut(auth)}>Cerrar sesión</button>
        </>
      ) : (
        <h2>No has iniciado sesión</h2>
      )}
    </div>
  );
};

export default Home;
