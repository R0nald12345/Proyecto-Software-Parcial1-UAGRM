import React from "react";
import { Link } from "react-router-dom";

const RegisterLogin = () => {
  return (
    <section className="flex items-center justify-center min-h-screen bg-red-600">
      <form className="bg-white shadow-md w-[35%] mx-auto rounded-md p-3">
        <div className="flex justify-center">
          <h3 className="text-3xl font-bold">Crear Cuenta</h3>
        </div>

        <h4 className="mt-2 text-xl">Nombre</h4>
        <input
          className="border-2 rounded-xl px-2 py-2 w-full"
          type="email"
          placeholder="Nombre"
        />

        <h4 className="mt-2 text-xl">Correo</h4>
        <input
          className="border-2 rounded-xl px-2 py-2 w-full"
          type="email"
          placeholder="Correo"
        />

        <h4 className="mt-2 text-xl">Contraseña</h4>
        <input
          className="border-2 rounded-xl px-2 py-2 w-full"
          type="password"
          placeholder="Contraseña"
        />
        <input
          className="mt-5 w-full text-white uppercase font-semibold text-xl py-2 rounded-md bg-red-500"
          type="submit"
        />

        <div className="mt-3 flex justify-end gap-3">
          <p4 className="text-xl" >¿Ya tienes cuenta?</p4>  
          <Link to="/" className="text-xl font-semibold underline">Ingresar</Link>
        </div>
      </form>
    </section>
  );
};

export default RegisterLogin;
