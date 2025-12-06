import React, {createContext, useEffect, useState} from "react";
import {useHistory} from 'react-router-dom'
import authRequestSender from './requests'

const AuthContext = createContext();

export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER"
}
function AuthContextProvider(props){
    const[auth , setAuth] = useState({
        user:null,
        loggedIn: false,
        errorMessage: null
    });
    const history = useHistory();
    useEffect(()=> {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const {type , payload} = action;
        switch(type){
            case AuthActionType.GET_LOGGED_IN:{
                return setAuth({
                    user:payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: null
                });
            }
            case AuthActionType.LOGIN_USER:{
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            case AuthActionType.LOGOUT_USER:{
                return setAuth({
                    user: null,
                    loggedIn: false,
                    errorMessage: null
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            default:
                return auth; 
        }
    }
   
}
export default AuthContext;
export {AuthContextProvider};