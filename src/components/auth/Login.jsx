import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Swal from 'sweetalert2'
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth,googleProvider  } from "../../firebase/config";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();



   // Función para login con Google
   const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirige al dashboard después de un login exitoso
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Usuario Correcto",
        text: `¡Bienvenido!`,
        showConfirmButton: false,
        timer: 3000
      });
      navigate("/graficador");
    } catch (err) {
      setError(err.message);
    }
  };


  // Función para login con email y contraseña
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirige al dashboard después de un login exitoso
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Usuario Correcto",
        text: `¡Bienvenido!`,
        showConfirmButton: false,
        timer: 3000
      });

      navigate("/graficador");
    } catch (err) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Usuario Incorrecto",
        text: `¡Crendecial Incorrecto!`,
        showConfirmButton: false,
        timer: 3000
      });
      setError(err.message);
    }
  };


  return (
    <section className="flex items-center justify-center min-h-screen bg-red-600">
      <form 
        className="bg-white shadow-md w-[35%] mx-auto rounded-md p-3"
        onSubmit={handleEmailLogin}
      >
        <div className="flex justify-center">
          <h3 className="text-3xl font-bold">Login</h3>
        </div>
        <h4 className="mt-2 text-xl">Correo</h4>
        <input 
          className="border-2 rounded-xl px-2 py-2 w-full" 
          type="email" 
          placeholder="Correo"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <h4 className="mt-2 text-xl">Contraseña</h4>
        <input 
          className="border-2 rounded-xl px-2 py-2 w-full" 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        <section className="mt-5 flex gap-5">
          <div className="w-1/2">
            <input 
              className="w-full text-white uppercase font-semibold text-xl py-2 rounded-md bg-red-500 hover:bg-red-600" 
              type="submit"
            />
          </div>
          <div className="w-1/2 rounded-md py-2  bg-gray-400/20 hover:bg-gray-400/50  flex justify-center">
            <FcGoogle className="text-2xl mt-1" />
            <button 
              onClick={handleGoogleLogin}
              className="uppercase font-semibold text-xl"
            >Google</button>
          </div>
        </section>
        <div className="mt-3 flex justify-end">
          <Link to="/registro" className="text-xl underline hover:font-semibold">Crear una Cuenta</Link>
        </div>
      </form>
    </section>
  );
};

export default Login;