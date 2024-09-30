import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "../../hook/useForm";
import { useDispatch, useSelector,  } from 'react-redux';


const Login = () => {

  const dispatch = useDispatch();

  const {status,errorMessage} = useSelector(state => state.auth);

  const { email, password, onInputChange} = useForm({
    email: 'fernando@gmail.com',
    password: '123456'
  });


  const isAuthenticating = useMemo(
    () => status === "checking", [status]
  );


  const onSubmit = (e) => {
    e.preventDefault();
    console.log({email,password});
    //!No es la accion a despachar
    dispatch(startLoginWithEmailPassword({email, password}));
  }

  const onGoogleSingIn = () => {
    // console.log('Google Sing In');
    dispatch(startGoogleSingIn());
  }

  return (
    <section className="flex items-center justify-center min-h-screen bg-red-600">
      
      <form 
        className="bg-white shadow-md w-[35%] mx-auto rounded-md p-3"
        onSubmit={(e)=>onSubmit(e)}
      >

        <div className="flex justify-center">
          <h3 className="text-3xl font-bold">Login</h3>
        </div>
        <h4 className="mt-2 text-xl">Correo</h4>

        <input 
          className="border-2 rounded-xl px-2 py-2 w-full" 
          type="email" 
          placeholder="Correo"
          name="email"
          value={email}
          onChange={onInputChange}
        />
        
        <h4 className="mt-2 text-xl">Contraseña</h4>
        <input 
          className="border-2 rounded-xl px-2 py-2 w-full" 
          type="password" 
          placeholder="Contraseña" 
          name="password"
          value={password}
          onChange={onInputChange}
        />
        <section className="mt-5 flex gap-5">
          
          <div className="w-1/2">
            <input 
              disabled={isAuthenticating}
              className="w-full text-white uppercase font-semibold text-xl py-2 rounded-md bg-red-500 hover:bg-red-600" 
              type="submit"
            />

          </div>

          <div className="w-1/2 rounded-md py-2  bg-gray-400/20 hover:bg-gray-400/50  flex justify-center">
            <FcGoogle className="text-2xl mt-1" />
            <button 
              disabled={isAuthenticating}
              onclick={onGoogleSingIn}
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
