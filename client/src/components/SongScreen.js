import { useContext, useEffect, useState } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export default function SongScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newSongTitle, setNewSongTitle] = useState('');
    const [newSongArtist, setNewSongArtist] = useState('');
    const [newSongYear, setNewSongYear] = useState('');
    const [newSongYoutubeId, setNewSongYoutubeId] = useState('');
    const [addToPlaylistDialogOpen, setAddToPlaylistDialogOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

    useEffect(() => {
        store.loadSongs();
        if (auth.loggedIn) {
            store.loadPlaylists();
        }
    }, [auth.loggedIn]);

    const handleCreateSong = () => {
        const year = parseInt(newSongYear);
        if (newSongTitle && newSongArtist && year && newSongYoutubeId) {
            store.createSong(newSongTitle, newSongArtist, year, newSongYoutubeId);
            setNewSongTitle('');
            setNewSongArtist('');
            setNewSongYear('');
            setNewSongYoutubeId('');
            setAddDialogOpen(false);
        }
    }

    const handleDeleteSong = (id) => {
        if (window.confirm('Are you sure you want to delete this song?')) {
            store.deleteSong(id);
        }
    }

    const handleOpenAddToPlaylist = (song) => {
        setSelectedSong(song);
        setAddToPlaylistDialogOpen(true);
    }

    const handleAddToPlaylist = async () => {
        if (selectedSong && selectedPlaylistId) {
            try {
                const api = require('../store/requests').default;
                await api.addSongToPlaylist(selectedPlaylistId, selectedSong._id);
                store.loadPlaylists();
                setAddToPlaylistDialogOpen(false);
                setSelectedSong(null);
                setSelectedPlaylistId('');
            } catch (error) {
                console.error('Failed to add song to playlist:', error);
            }
        }
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    Song Catalog
                </Typography>
                {auth.loggedIn && (
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => setAddDialogOpen(true)}
                    >
                        + Add Song
                    </Button>
                )}
            </Box>

            {store.songs.length === 0 ? (
                <Box sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    padding: 4,
                    textAlign: 'center'
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        No songs in the catalog yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {auth.loggedIn 
                            ? 'Click "Add Song" to add the first song!' 
                            : 'Login to add songs to the catalog'}
                    </Typography>
                </Box>
            ) : (
                <List sx={{ bgcolor: 'white', borderRadius: 2 }}>
                    {store.songs.map((song) => (
                        <ListItem
                            key={song._id}
                            sx={{
                                borderBottom: '1px solid #e0e0e0',
                                '&:last-child': { borderBottom: 'none' }
                            }}
                        >
                            <ListItemText
                                primary={song.title}
                                secondary={`${song.artist} • ${song.year} • Listens: ${song.numListens || 0} • In ${song.numPlaylists || 0} playlist(s)`}
                            />
                            {auth.loggedIn && (
                                <>
                                    <IconButton
                                        edge="end"
                                        aria-label="add to playlist"
                                        sx={{ mr: 1 }}
                                        onClick={() => handleOpenAddToPlaylist(song)}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                    {song.addedBy === auth.user?._id && (
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleDeleteSong(song._id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </>
                            )}
                        </ListItem>
                    ))}
                </List>
            )}

            {/* Add Song Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Song</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={newSongTitle}
                        onChange={(e) => setNewSongTitle(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Artist"
                        value={newSongArtist}
                        onChange={(e) => setNewSongArtist(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        value={newSongYear}
                        onChange={(e) => setNewSongYear(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="YouTube Video ID"
                        value={newSongYoutubeId}
                        onChange={(e) => setNewSongYoutubeId(e.target.value)}
                        margin="normal"
                        helperText="Example: dQw4w9WgXcQ (from youtube.com/watch?v=dQw4w9WgXcQ)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateSong} variant="contained">Add Song</Button>
                </DialogActions>
            </Dialog>

            {/* Add to Playlist Dialog */}
            <Dialog open={addToPlaylistDialogOpen} onClose={() => setAddToPlaylistDialogOpen(false)}>
                <DialogTitle>Add to Playlist</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Add "{selectedSong?.title}" to:
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Select Playlist</InputLabel>
                        <Select
                            value={selectedPlaylistId}
                            onChange={(e) => setSelectedPlaylistId(e.target.value)}
                            label="Select Playlist"
                        >
                            {store.playlists.map((playlist) => (
                                <MenuItem key={playlist._id} value={playlist._id}>
                                    {playlist.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddToPlaylistDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddToPlaylist} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}