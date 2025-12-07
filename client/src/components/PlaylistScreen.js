import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../auth';
import GlobalStoreContext from '../store';
import YouTubePlayer from './YouTubePlayer';
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
import Grid from '@mui/material/Grid';

export default function PlaylistScreen() {
    const { id } = useParams();
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [playlistName, setPlaylistName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);

    useEffect(() => {
        if (id) {
            store.setCurrentPlaylist(id);
        }
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        if (store.currentPlaylist) {
            setPlaylistName(store.currentPlaylist.name);
        }
    }, [store.currentPlaylist]);

    if (!auth.loggedIn) {
        return (
            <Box sx={{ padding: 3 }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    Please login to edit playlists
                </Typography>
            </Box>
        );
    }

    if (!store.currentPlaylist) {
        return (
            <Box sx={{ padding: 3 }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    Loading playlist...
                </Typography>
            </Box>
        );
    }

    const handleSaveName = async () => {
        if (playlistName.trim() && playlistName !== store.currentPlaylist.name) {
            const songIds = store.currentPlaylist.songs.map(s => s._id);
            await store.updatePlaylist(store.currentPlaylist._id, playlistName, songIds);
        }
        setIsEditingName(false);
    }

    const handleRemoveSong = async (songIndex) => {
        if (window.confirm('Remove this song from the playlist?')) {
            const newSongs = [...store.currentPlaylist.songs];
            newSongs.splice(songIndex, 1);
            const songIds = newSongs.map(s => s._id);
            await store.updatePlaylist(store.currentPlaylist._id, store.currentPlaylist.name, songIds);
            
            // Adjust current song index if needed
            if (currentSongIndex >= newSongs.length && newSongs.length > 0) {
                setCurrentSongIndex(newSongs.length - 1);
            } else if (newSongs.length === 0) {
                setCurrentSongIndex(0);
            }
        }
    }

    const handleMoveSongUp = async (songIndex) => {
        if (songIndex === 0) return;
        const newSongs = [...store.currentPlaylist.songs];
        [newSongs[songIndex - 1], newSongs[songIndex]] = [newSongs[songIndex], newSongs[songIndex - 1]];
        const songIds = newSongs.map(s => s._id);
        await store.updatePlaylist(store.currentPlaylist._id, store.currentPlaylist.name, songIds);
    }

    const handleMoveSongDown = async (songIndex) => {
        if (songIndex === store.currentPlaylist.songs.length - 1) return;
        const newSongs = [...store.currentPlaylist.songs];
        [newSongs[songIndex], newSongs[songIndex + 1]] = [newSongs[songIndex + 1], newSongs[songIndex]];
        const songIds = newSongs.map(s => s._id);
        await store.updatePlaylist(store.currentPlaylist._id, store.currentPlaylist.name, songIds);
    }

    const handleSongClick = (index) => {
        setCurrentSongIndex(index);
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ 
                bgcolor: 'white', 
                borderRadius: 2, 
                padding: 3,
                mb: 3
            }}>
                {isEditingName ? (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSaveName();
                                }
                            }}
                            autoFocus
                        />
                        <Button variant="contained" onClick={handleSaveName}>
                            Save
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={() => {
                                setPlaylistName(store.currentPlaylist.name);
                                setIsEditingName(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4">
                            {store.currentPlaylist.name}
                        </Typography>
                        <Button variant="outlined" onClick={() => setIsEditingName(true)}>
                            Rename
                        </Button>
                    </Box>
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, padding: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Songs ({store.currentPlaylist.songs.length})
                        </Typography>

                        {store.currentPlaylist.songs.length === 0 ? (
                            <Typography color="text.secondary">
                                No songs in this playlist yet. Add songs from the Songs tab!
                            </Typography>
                        ) : (
                            <List>
                                {store.currentPlaylist.songs.map((song, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            borderBottom: '1px solid #e0e0e0',
                                            '&:last-child': { borderBottom: 'none' },
                                            bgcolor: currentSongIndex === index ? '#e3f2fd' : 'transparent',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: currentSongIndex === index ? '#e3f2fd' : '#f5f5f5'
                                            }
                                        }}
                                        onClick={() => handleSongClick(index)}
                                    >
                                        <Box sx={{ mr: 2, minWidth: 30 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {index + 1}
                                            </Typography>
                                        </Box>
                                        
                                        <ListItemText
                                            primary={song.title}
                                            secondary={`${song.artist} • ${song.year}`}
                                        />

                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMoveSongUp(index);
                                            }}
                                            disabled={index === 0}
                                        >
                                            <ArrowUpwardIcon />
                                        </IconButton>
                                        
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMoveSongDown(index);
                                            }}
                                            disabled={index === store.currentPlaylist.songs.length - 1}
                                        >
                                            <ArrowDownwardIcon />
                                        </IconButton>

                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveSong(index);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <YouTubePlayer 
                        playlist={store.currentPlaylist} 
                        currentSongIndex={currentSongIndex}
                        onSongChange={setCurrentSongIndex}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}