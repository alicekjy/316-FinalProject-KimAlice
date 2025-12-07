import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../auth';
import GlobalStoreContext from '../store';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function PlaylistScreen () {
    const {id} = useParams();
    const {auth} = useContext(AuthContext);
    const {store} = useContext(GlobalStoreContext);
    const [playlistName, setPlaylistName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);

    useEffect (() =>{
        if(id){
            store.setCurrentPlaylist(id);
        }
    }, [id]);

    useEffect(()=>{
        if(store.currentPlaylist){
            setPlaylistName(store.currentPlaylist.name);
        }
    }, [store.currentPlaylist]);
    if(!auth.loggedIn){
        return(
            <Box sx = {{padding: 3}}>
                <Typography variant = "h5" sx = {{color: 'white'}}>
                    Please login to edit playlists
                </Typography>
            </Box>
        );
    }

    if(!store.currentPlaylist){
        return(
            <Box sx = {{padding: 3}}>
                <Typography variant= "h5" sx = {{color: 'white'}}>
                    Loading playlist...
                </Typography>
            </Box>
        )
    }
    const handleSaveName = () => {
        if(playlistName.trim() && playlistName !== store.currentPlaylist.name){
            const songIds = store.currentPlaylist.songs.map(s => s._id);
            store.updatePlaylist(store.currentPlaylist._id, playlistName, songIds);
        }
        setIsEditingName(false);
    }

    const handleRemoveSong = (songIndex) => {
        const newSongs = [...store.currentPlaylist.songs];
        newSongs.splice(songIndex,1);
        const songIds = newSongs.map(s => s._id);
        store.updatePlaylist(store.currentPlaylist._id, store.currentPlaylist.name, songIds);
    }

    const handleMoveSongUp = (songIndex) => {
        if(songIndex ===0) return;
        const newSongs = [...store.currentPlaylist.songs];
        [newSongs[songIndex -1], newSongs[songIndex]] =[newSongs[songIndex], newSongs[songIndex -1]];
        const songIds = newSongs.map(s => s._id);
        store.updatePlaylist(store.currentPlaylist._id, store.currentPlaylist.name, songIds);
    }

    const handleMoveSongDown = (songIndex) => {
        if(songIndex === store.currentPlaylist.songs.length -1) return;
        const newSongs = [...store.currentPlaylist.songs];
        [newSongs[songIndex], newSongs[songIndex +1]] = [newSongs[songIndex +1] , newSongs[songIndex]];
        const songIds = newSongs.map(s => s._id);
        store.updatePlaylist(store.currentPlaylist._id, store.currentPlaylist.name, songIds);
    }

    return()
}