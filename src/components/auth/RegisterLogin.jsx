import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import { auth } from '../../firebase/config';  // Asegúrate de que la ruta de importación es correcta


const RegisterLogin = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Crea un nuevo usuario con correo electrónico y contraseña
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Usuario Creado:' ,user);

      // No hay `displayName` al crear un usuario. Debes actualizarlo después
      // Muestra la alerta de éxito y redirige al dashboard después de un registro exitoso
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Usuario creado con éxito",
        text: `¡Bienvenido, ${nombre}!`,
        showConfirmButton: false,
        timer: 3000
      });

      // Redirige a la ruta de inicio de sesión o dashboard
      navigate("/");
    } catch (err) {
      setError(err.message);

      Swal.fire({
        position: "center",
        icon: "error",
        title: "Error",
        text: err.message,
      });
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-red-600">
      <form 
        onSubmit={(e)=>handleRegister(e)}
        className="bg-white shadow-md w-[35%] mx-auto rounded-md p-3">
        <div className="flex justify-center">
          <h3 className="text-3xl font-bold">Crear Cuenta</h3>
        </div>

        <h4 className="mt-2 text-xl">Nombre</h4>
        <input
          className="border-2 rounded-xl px-2 py-2 w-full"
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e)=>setNombre(e.target.value)}
        />

        <p className="mt-2 text-xl">Correo</p>
        <input
          className="border-2 rounded-xl px-2 py-2 w-full"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <p className="mt-2 text-xl">Contraseña</p>
        <input
          className="border-2 rounded-xl px-2 py-2 w-full"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        <input
          className="mt-5 w-full text-white uppercase font-semibold text-xl py-2 rounded-md bg-red-500"
          type="submit"
        />

        <div className="mt-3 flex justify-end gap-3">
          <p4 className="text-xl">¿Ya tienes cuenta?</p4>
          <Link to="/" className="text-xl font-semibold underline">
            Ingresar
          </Link>
        </div>
      </form>
    </section>
  );
};

export default RegisterLogin;
