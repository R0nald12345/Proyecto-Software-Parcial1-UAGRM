import React from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";


const Login = () => {
  return (
    <section className="flex items-center justify-center min-h-screen bg-red-600">
      <form className="bg-white shadow-md w-[35%] mx-auto rounded-md p-3">

        <div className="flex justify-center">
          <h3 className="text-3xl font-bold">Login</h3>
        </div>
        <h4 className="mt-2 text-xl">Correo</h4>
        <input className="border-2 rounded-xl px-2 py-2 w-full" type="email" placeholder="Correo" />
        <h4 className="mt-2 text-xl">Contraseña</h4>
        <input className="border-2 rounded-xl px-2 py-2 w-full" type="password" placeholder="Contraseña" />
        <section className="mt-5 flex gap-5">
          
          <div className="w-1/2">
            <input className="w-full text-white uppercase font-semibold text-xl py-2 rounded-md bg-red-500 hover:bg-red-600" type="submit"/>

          </div>

          <div className="w-1/2 rounded-md py-2  bg-gray-400/20 hover:bg-gray-400/50  flex justify-center">
            <FcGoogle className="text-2xl mt-1" />
            <button className="uppercase font-semibold text-xl">Google</button>
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
