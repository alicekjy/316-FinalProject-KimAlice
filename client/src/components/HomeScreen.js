import { useContext, useEffect } from 'react';
import AuthContext from '../auth';
import GlobalStoreContext from '../store';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function HomeScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);

    useEffect(() => {
        if (auth.loggedIn) {
            store.loadPlaylists();
        }
        // eslint-disable-next-line
    }, [auth.loggedIn]);

    const handleCreatePlaylist = () => {
        store.createPlaylist();
    }

    const handleDeletePlaylist = (id, event) => {
        event.stopPropagation();
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            store.deletePlaylist(id);
        }
    }

    const handleCopyPlaylist = (id, event) => {
        event.stopPropagation();
        store.copyPlaylist(id);
    }

    const handlePlaylistClick = (id) => {
        store.setCurrentPlaylist(id);
    }

    //guest view
    if (!auth.loggedIn) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                padding: 3
            }}>
                <Typography variant="h4" sx={{ color: 'white', mb: 3 }}>
                    Welcome, Guest!
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
                    You're browsing as a guest. Create an account or login to manage your own playlists.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" href="/login">
                        Login
                    </Button>
                    <Button variant="contained" color="secondary" href="/register">
                        Create Account
                    </Button>
                </Box>
            </Box>
        );
    }

    //logged in view
    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    My Playlists
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleCreatePlaylist}
                >
                    + New Playlist
                </Button>
            </Box>

            {store.playlists.length === 0 ? (
                <Box sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    padding: 4,
                    textAlign: 'center'
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        You don't have any playlists yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Click "New Playlist" to create your first playlist!
                    </Typography>
                </Box>
            ) : (
                <List sx={{ bgcolor: 'white', borderRadius: 2 }}>
                    {store.playlists.map((playlist) => (
                        <ListItem
                            key={playlist._id}
                            sx={{
                                borderBottom: '1px solid #e0e0e0',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: '#f5f5f5'
                                }
                            }}
                            onClick={() => handlePlaylistClick(playlist._id)}
                        >
                            <ListItemText
                                primary={playlist.name}
                                secondary={`${playlist.songs.length} song${playlist.songs.length !== 1 ? 's' : ''}`}
                            />
                            <IconButton
                                edge="end"
                                aria-label="play"
                                sx={{ mr: 1 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implement play
                                }}
                            >
                                <PlayArrowIcon />
                            </IconButton>
                            <IconButton
                                edge="end"
                                aria-label="copy"
                                sx={{ mr: 1 }}
                                onClick={(e) => handleCopyPlaylist(playlist._id, e)}
                            >
                                <ContentCopyIcon />
                            </IconButton>
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
}