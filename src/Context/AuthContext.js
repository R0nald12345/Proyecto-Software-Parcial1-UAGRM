// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { auth, googleProvider } from '../firebase/firebase';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const signInWithEmailPassword = async (email, password) => {
//     try {
//       await auth.signInWithEmailAndPassword(email, password);
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   const signInWithGoogle = async () => {
//     try {
//       await auth.signInWithPopup(googleProvider);
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   const signOut = async () => {
//     try {
//       await auth.signOut();
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(user => {
//       setCurrentUser(user);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const value = {
//     currentUser,
//     signInWithEmailPassword,
//     signInWithGoogle,
//     signOut,
//     error
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

// Crea el contexto
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escucha los cambios en la autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Limpia el listener al desmontar el componente
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
