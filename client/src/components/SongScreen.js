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
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';

export default function SongsScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingSong, setEditingSong] = useState(null);
    const [newSongTitle, setNewSongTitle] = useState('');
    const [newSongArtist, setNewSongArtist] = useState('');
    const [newSongYear, setNewSongYear] = useState('');
    const [newSongYoutubeId, setNewSongYoutubeId] = useState('');
    const [addToPlaylistDialogOpen, setAddToPlaylistDialogOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    
    // Search/Filter states
    const [searchTitle, setSearchTitle] = useState('');
    const [searchArtist, setSearchArtist] = useState('');
    const [searchYear, setSearchYear] = useState('');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        store.loadSongs();
        if (auth.loggedIn) {
            store.loadPlaylists();
        }

    }, [auth.loggedIn]);

    const handleCreateSong = async () => {
        const year = parseInt(newSongYear);
        if (newSongTitle && newSongArtist && year && newSongYoutubeId) {
            await store.createSong(newSongTitle, newSongArtist, year, newSongYoutubeId);
            setNewSongTitle('');
            setNewSongArtist('');
            setNewSongYear('');
            setNewSongYoutubeId('');
            setAddDialogOpen(false);
        }
    }

    const handleEditSong = async () => {
        if (editingSong) {
            const year = parseInt(newSongYear);
            if (newSongTitle && newSongArtist && year && newSongYoutubeId) {
                await store.updateSong(editingSong._id, newSongTitle, newSongArtist, year, newSongYoutubeId);
                setEditDialogOpen(false);
                setEditingSong(null);
            }
        }
    }

    const handleOpenEdit = (song) => {
        setEditingSong(song);
        setNewSongTitle(song.title);
        setNewSongArtist(song.artist);
        setNewSongYear(song.year.toString());
        setNewSongYoutubeId(song.youtubeId);
        setEditDialogOpen(true);
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

    // Filter and sort songs
    const getFilteredSongs = () => {
        let filtered = [...store.songs];
        
        // Apply filters
        if (searchTitle) {
            filtered = filtered.filter(song => 
                song.title.toLowerCase().includes(searchTitle.toLowerCase())
            );
        }
        if (searchArtist) {
            filtered = filtered.filter(song => 
                song.artist.toLowerCase().includes(searchArtist.toLowerCase())
            );
        }
        if (searchYear) {
            filtered = filtered.filter(song => 
                song.year.toString().includes(searchYear)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'artist':
                    comparison = a.artist.localeCompare(b.artist);
                    break;
                case 'year':
                    comparison = a.year - b.year;
                    break;
                case 'listens':
                    comparison = (a.numListens || 0) - (b.numListens || 0);
                    break;
                case 'playlists':
                    comparison = (a.numPlaylists || 0) - (b.numPlaylists || 0);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }

    const filteredSongs = getFilteredSongs();

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    Song Catalog ({filteredSongs.length} songs)
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

            {/* Search/Filter Box */}
            <Box sx={{ bgcolor: 'white', borderRadius: 2, padding: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Search Title"
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Search Artist"
                            value={searchArtist}
                            onChange={(e) => setSearchArtist(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth
                            label="Year"
                            value={searchYear}
                            onChange={(e) => setSearchYear(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="title">Title</MenuItem>
                                <MenuItem value="artist">Artist</MenuItem>
                                <MenuItem value="year">Year</MenuItem>
                                <MenuItem value="listens">Listens</MenuItem>
                                <MenuItem value="playlists">Playlists</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Order</InputLabel>
                            <Select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                label="Order"
                            >
                                <MenuItem value="asc">Ascending</MenuItem>
                                <MenuItem value="desc">Descending</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {filteredSongs.length === 0 ? (
                <Box sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    padding: 4,
                    textAlign: 'center'
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        No songs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {store.songs.length === 0 
                            ? (auth.loggedIn ? 'Click "Add Song" to add the first song!' : 'Login to add songs')
                            : 'Try different search criteria'}
                    </Typography>
                </Box>
            ) : (
                <List sx={{ bgcolor: 'white', borderRadius: 2 }}>
                    {filteredSongs.map((song) => (
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
                                        <>
                                            <IconButton
                                                edge="end"
                                                aria-label="edit"
                                                sx={{ mr: 1 }}
                                                onClick={() => handleOpenEdit(song)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() => handleDeleteSong(song._id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateSong} variant="contained">Add Song</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Song Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Song</DialogTitle>
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSong} variant="contained">Save Changes</Button>
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