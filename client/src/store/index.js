import {createContext, useContext, useState} from 'react'
import {useHistory} from 'react-router-dom'
import api from './requests'
import AuthContext from '../auth'

const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
    LOAD_PLAYLISTS: "LOAD_PLAYLISTS",
    SET_CURRENT_PLAYLIST: "SET_CURRENT_PLAYLIST",
    CLOSE_CURRENT_PLAYLIST: "CLOSE_CURRENT_PLAYLIST",
    LOAD_SONGS: "LOAD_SONGS",
    SET_CURRENT_PLAYLIST: "SET_CURRENT_SONG"
}