import { useContext, useEffect, useState } from 'react';
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
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';

export default function HomeScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        if (auth.loggedIn) {
            store.loadPlaylists();
        }

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

    const handlePlayPlaylist = async (id, event) => {
        event.stopPropagation();
        try {
            const api = require('../store/requests').default;
            await api.playPlaylist(id);
        } catch (error) {
            console.error('Failed to play playlist:', error);
        }
    }

    const handlePlaylistClick = (id) => {
        store.setCurrentPlaylist(id);
    }

    //filter and sort playlist
    const getFilteredPlaylists = () => {
        let filtered = [...store.playlists];
        
        // Apply search
        if (searchText) {
            filtered = filtered.filter(playlist => 
                playlist.name.toLowerCase().includes(searchText.toLowerCase()) ||
                (playlist.owner && playlist.owner.username && 
                 playlist.owner.username.toLowerCase().includes(searchText.toLowerCase()))
            );
        }

        //sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'songs':
                    comparison = a.songs.length - b.songs.length;
                    break;
                case 'listens':
                    comparison = (a.playedBy?.length || 0) - (b.playedBy?.length || 0);
                    break;
                case 'owner':
                    const ownerA = a.owner?.username || a.ownerEmail || '';
                    const ownerB = b.owner?.username || b.ownerEmail || '';
                    comparison = ownerA.localeCompare(ownerB);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }

    const filteredPlaylists = getFilteredPlaylists();

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
                    My Playlists ({filteredPlaylists.length})
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleCreatePlaylist}
                >
                    + New Playlist
                </Button>
            </Box>

            {/* Search and Sort Box */}
            <Box sx={{ bgcolor: 'white', borderRadius: 2, padding: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Search Playlists"
                            placeholder="Search by name or owner..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="name">Name</MenuItem>
                                <MenuItem value="songs">Song Count</MenuItem>
                                <MenuItem value="listens">Listens</MenuItem>
                                <MenuItem value="owner">Owner</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
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

            {filteredPlaylists.length === 0 ? (
                <Box sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    padding: 4,
                    textAlign: 'center'
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {store.playlists.length === 0 
                            ? "You don't have any playlists yet"
                            : "No playlists found"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {store.playlists.length === 0 
                            ? 'Click "New Playlist" to create your first playlist!'
                            : 'Try different search criteria'}
                    </Typography>
                </Box>
            ) : (
                <List sx={{ bgcolor: 'white', borderRadius: 2 }}>
                    {filteredPlaylists.map((playlist) => (
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
                                secondary={
                                    <>
                                        {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                                        {playlist.playedBy && playlist.playedBy.length > 0 && 
                                            ` • ${playlist.playedBy.length} listener${playlist.playedBy.length !== 1 ? 's' : ''}`
                                        }
                                    </>
                                }
                            />
                            <IconButton
                                edge="end"
                                aria-label="play"
                                sx={{ mr: 1 }}
                                onClick={(e) => handlePlayPlaylist(playlist._id, e)}
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