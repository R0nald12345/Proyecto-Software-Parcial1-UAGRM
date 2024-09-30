import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../store/auth";
import { onAuthStateChanged } from "firebase/auth";
import { FirebaseAuth } from "../firebase/config";

export const useCheckAuth = () => {
    const {status} = useSelector(state=>state.auth);

    const dispath = useDispatch();
  
    useEffect(() => {
      onAuthStateChanged(FirebaseAuth, async(user)=>{
        if(!user) return dispath(logout())
  
          const {displayName, email, photoURL, uid} = user;
          dispath(login({ uid, email, displayName,  photoURL} ))
      })
    }, []);
  
    return {
        status
    }
}

