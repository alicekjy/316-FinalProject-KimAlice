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
    const [allPlaylists, setAllPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const api = require('../store/requests').default;
                const response = await api.getPlaylists();
                if (response.ok) {
                    if (auth.loggedIn) {
                        // For logged-in users, also load through store
                        await store.loadPlaylists();
                    } else {
                        // For guests, use the fetched playlists
                        setAllPlaylists(response.data.playlists || []);
                    }
                }
            } catch (error) {
                console.error('Error loading playlists:', error);
            }
            setLoading(false);
        };
        loadData();
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

    const handlePlayPlaylist = async (id, event) => {
        event.stopPropagation();
        try {
            const api = require('../store/requests').default;
            await api.playPlaylist(id);
            // Reload playlists to update play count
            const response = await api.getPlaylists();
            if (response.ok) {
                if (!auth.loggedIn) {
                    setAllPlaylists(response.data.playlists || []);
                }
            }
        } catch (error) {
            console.error('Failed to play playlist:', error);
        }
    }

    const handlePlaylistClick = (id) => {
        if (auth.loggedIn) {
            store.setCurrentPlaylist(id);
        } else {
            alert('Please login to view and edit playlist details');
        }
    }

    // Filter and sort playlists
    const getFilteredPlaylists = () => {
        // Get the right playlist source
        const source = auth.loggedIn ? store.playlists : allPlaylists;
        let filtered = [...source];
        
        // Apply search filter
        if (searchText) {
            filtered = filtered.filter(playlist => {
                const matchName = playlist.name.toLowerCase().includes(searchText.toLowerCase());
                const matchOwner = playlist.owner?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                                 playlist.ownerEmail?.toLowerCase().includes(searchText.toLowerCase());
                return matchName || matchOwner;
            });
        }

        // Apply sorting
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

    // LOADING STATE
    if (loading) {
        return (
            <Box sx={{ padding: 3 }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    Loading playlists...
                </Typography>
            </Box>
        );
    }

    // PLAYLISTS VIEW (works for both guest and logged-in)
    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    {auth.loggedIn 
                        ? `My Playlists (${filteredPlaylists.length})`
                        : `All Playlists (${filteredPlaylists.length})`
                    }
                </Typography>
                {auth.loggedIn ? (
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleCreatePlaylist}
                    >
                        + New Playlist
                    </Button>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" size="small" href="/login">
                            Login
                        </Button>
                        <Button variant="contained" color="secondary" size="small" href="/register">
                            Sign Up
                        </Button>
                    </Box>
                )}
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

            {/* Playlists List */}
            {filteredPlaylists.length === 0 ? (
                <Box sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    padding: 4,
                    textAlign: 'center'
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {auth.loggedIn && store.playlists.length === 0
                            ? "You don't have any playlists yet"
                            : !auth.loggedIn && allPlaylists.length === 0
                            ? "No playlists available yet"
                            : "No playlists found"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {auth.loggedIn && store.playlists.length === 0
                            ? 'Click "New Playlist" to create your first playlist!'
                            : searchText
                            ? 'Try different search criteria'
                            : 'Check back later for new playlists'}
                    </Typography>
                </Box>
            ) : (
                <List sx={{ bgcolor: 'white', borderRadius: 2 }}>
                    {filteredPlaylists.map((playlist) => {
                        const isOwner = auth.loggedIn && auth.user && playlist.owner?._id === auth.user._id;
                        
                        return (
                            <ListItem
                                key={playlist._id}
                                sx={{
                                    borderBottom: '1px solid #e0e0e0',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: '#f5f5f5'
                                    },
                                    '&:last-child': { borderBottom: 'none' }
                                }}
                                onClick={() => handlePlaylistClick(playlist._id)}
                            >
                                <ListItemText
                                    primary={playlist.name}
                                    secondary={
                                        <>
                                            By: {playlist.owner?.username || playlist.ownerEmail || 'Unknown'}
                                            {' • '}
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
                                {isOwner && (
                                    <>
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
                                    </>
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </Box>
    );
}