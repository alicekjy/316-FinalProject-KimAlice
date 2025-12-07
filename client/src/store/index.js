import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import api from './requests'
import AuthContext from '../auth'

const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
    LOAD_PLAYLISTS: "LOAD_PLAYLISTS",
    SET_CURRENT_PLAYLIST: "SET_CURRENT_PLAYLIST",
    CLOSE_CURRENT_PLAYLIST: "CLOSE_CURRENT_PLAYLIST",
    LOAD_SONGS: "LOAD_SONGS",
    SET_CURRENT_SONG: "SET_CURRENT_SONG"
}

function GlobalStoreContextProvider(props) {
    const history = useHistory();
    
    const [store, setStore] = useState({
        playlists: [],
        currentPlaylist: null,
        songs: [],
        currentSong: null
    });

    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case GlobalStoreActionType.LOAD_PLAYLISTS:
                return setStore({
                    ...store,
                    playlists: payload
                });
            case GlobalStoreActionType.SET_CURRENT_PLAYLIST:
                return setStore({
                    ...store,
                    currentPlaylist: payload
                });
            case GlobalStoreActionType.CLOSE_CURRENT_PLAYLIST:
                return setStore({
                    ...store,
                    currentPlaylist: null
                });
            case GlobalStoreActionType.LOAD_SONGS:
                return setStore({
                    ...store,
                    songs: payload
                });
            case GlobalStoreActionType.SET_CURRENT_SONG:
                return setStore({
                    ...store,
                    currentSong: payload
                });
            default:
                return store;
        }
    }

    //playlist functions
    store.loadPlaylists = async function (filters = {}) {
        try {
            const response = await api.getPlaylists(filters);
            if (response.status === 200) {
                storeReducer({
                    type: GlobalStoreActionType.LOAD_PLAYLISTS,
                    payload: response.data.playlists
                });
            }
        } catch (error) {
            console.error('Failed to load playlists:', error);
        }
    }

    store.createPlaylist = async function () {
        try {
            const response = await api.createPlaylist();
            if (response.status === 201) {
                store.loadPlaylists();
            }
        } catch (error) {
            console.error('Failed to create playlist:', error);
        }
    }

    store.deletePlaylist = async function (id) {
        try {
            const response = await api.deletePlaylistById(id);
            if (response.status === 200) {
                store.loadPlaylists();
            }
        } catch (error) {
            console.error('Failed to delete playlist:', error);
        }
    }

    store.setCurrentPlaylist = async function (id) {
        try {
            const response = await api.getPlaylistById(id);
            if (response.status === 200) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_PLAYLIST,
                    payload: response.data.playlist
                });
                history.push(`/playlist/${id}`);
            }
        } catch (error) {
            console.error('Failed to load playlist:', error);
        }
    }

    store.updatePlaylist = async function (id, name, songs) {
        try {
            const response = await api.updatePlaylistById(id, name, songs);
            if (response.status === 200) {
                store.loadPlaylists();
                if (store.currentPlaylist && store.currentPlaylist._id === id) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_PLAYLIST,
                        payload: response.data.playlist
                    });
                }
            }
        } catch (error) {
            console.error('Failed to update playlist:', error);
        }
    }

    store.copyPlaylist = async function (id) {
        try {
            const response = await api.copyPlaylist(id);
            if (response.status === 201) {
                store.loadPlaylists();
            }
        } catch (error) {
            console.error('Failed to copy playlist:', error);
        }
    }

    store.closeCurrentPlaylist = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_PLAYLIST,
            payload: null
        });
        history.push('/home');
    }

    //song functions
    store.loadSongs = async function () {
        try {
            const response = await api.getSongs();
            if (response.status === 200) {
                storeReducer({
                    type: GlobalStoreActionType.LOAD_SONGS,
                    payload: response.data.songs
                });
            }
        } catch (error) {
            console.error('Failed to load songs:', error);
        }
    }

    store.createSong = async function (title, artist, year, youtubeId) {
        try {
            const response = await api.createSong(title, artist, year, youtubeId);
            if (response.status === 201) {
                store.loadSongs();
            }
        } catch (error) {
            console.error('Failed to create song:', error);
        }
    }

    store.deleteSong = async function (id) {
        try {
            const response = await api.deleteSong(id);
            if (response.status === 200) {
                store.loadSongs();
            }
        } catch (error) {
            console.error('Failed to delete song:', error);
        }
    }

    return (
        <GlobalStoreContext.Provider value={{ store }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
