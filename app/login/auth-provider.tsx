
import React from "react";
import { useNavigate } from "react-router";


export default   function AuthProvider() {

    const nav = useNavigate();
    const login = () => {
        const username = sessionStorage.getItem('username');
        if (username) {
            return true;
        }else {
            return false;
        }
    }

    const logout = () => {
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('access');
        nav('/');
    }   
  
    return (
        
    <div>
        {login() ? (
            <button onClick={() => logout()}  type="button">
                  
                  <img src="/images/pp.png" alt={'PP'} width="30" height="30" className="inline-block" />
                  <a href="#s">Logout</a>
                  
                </button>
        ) : (
           <button onClick={() => nav('/')}  type="button" >
                  
                  <a href="#">Login</a>
                  
            </button>
        )}
    </div>
    );
}   