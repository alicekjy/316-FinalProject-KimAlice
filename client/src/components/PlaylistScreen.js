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
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AppBanner from './AppBanner';

export default function PlaylistScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [allPlaylists, setAllPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    
    //modal states
    const [playDialogOpen, setPlayDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [editPlaylistName, setEditPlaylistName] = useState('');
    const isLoggedIn = auth.loggedIn;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const api = require('../store/requests').default;
                const response = await api.getPlaylists();
                if (response.ok) {
                    if (auth.loggedIn) {
                        await store.loadPlaylists();
                    } else {
                        setAllPlaylists(response.data.playlists || []);
                    }
                }
            } catch (error) {
                console.error('Error loading playlists:', error);
            }
            setLoading(false);
        };
        loadData();
    }, [auth.loggedIn]);

    const handleCreatePlaylist = () => {
        store.createPlaylist();
    }

    const handleOpenPlay = (playlist, event) => {
        event.stopPropagation();
        setSelectedPlaylist(playlist);
        setPlayDialogOpen(true);
    }

    const handlePlay = async () => {
        if (selectedPlaylist) {
            try {
                const api = require('../store/requests').default;
                await api.playPlaylist(selectedPlaylist._id);
                setPlayDialogOpen(false);
                // Reload playlists
                const response = await api.getPlaylists();
                if (response.ok) {
                    if (!auth.loggedIn) {
                        setAllPlaylists(response.data.playlists || []);
                    } else {
                        await store.loadPlaylists();
                    }
                }
            } catch (error) {
                console.error('Failed to play playlist:', error);
            }
        }
    }

    const handleOpenEdit = (playlist, event) => {
        event.stopPropagation();
        setSelectedPlaylist(playlist);
        setEditPlaylistName(playlist.name);
        setEditDialogOpen(true);
    }

    const handleEdit = async () => {
        if (selectedPlaylist && editPlaylistName.trim()) {
            const songIds = selectedPlaylist.songs.map(s => 
                typeof s === 'object' ? s._id : s
            );
            await store.updatePlaylist(selectedPlaylist._id, editPlaylistName, songIds);
            setEditDialogOpen(false);
            setEditPlaylistName('');
        }
    }

    const handleOpenDelete = (playlist, event) => {
        event.stopPropagation();
        setSelectedPlaylist(playlist);
        setDeleteDialogOpen(true);
    }

    const handleDelete = async () => {
        if (selectedPlaylist) {
            await store.deletePlaylist(selectedPlaylist._id);
            setDeleteDialogOpen(false);
        }
    }

    const handleCopyPlaylist = async (id, event) => {
        event.stopPropagation();
        await store.copyPlaylist(id);
    }

    const handlePlaylistClick = (playlist) => {
        if (auth.loggedIn) {
            setSelectedPlaylist(playlist);
            setEditPlaylistName(playlist.name);
            setEditDialogOpen(true);
        } else {
            alert('Please login to view and edit playlist details');
        }
    }

    // filter and sort playlists
    const getFilteredPlaylists = () => {
        const source = auth.loggedIn ? store.playlists : allPlaylists;
        let filtered = [...source];
        
        if (searchText) {
            filtered = filtered.filter(playlist => {
                const matchName = playlist.name.toLowerCase().includes(searchText.toLowerCase());
                const matchOwner = playlist.owner?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                                 playlist.ownerEmail?.toLowerCase().includes(searchText.toLowerCase());
                return matchName || matchOwner;
            });
        }

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

    if (loading) {
        return (
            <Box sx={{ padding: 3 }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    Loading playlists...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 3, minHeight: '100vh', bgcolor: '#d7e9ff' }}>
            <Box
                sx={{
                    bgcolor: '#f8fbff',
                    border: '2px solid #b5c7e0',
                    borderRadius: 1,
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                    width: 'calc(100% - 48px)',
                    maxWidth: '1200px',
                    minHeight: '800px',
                    margin: '0 auto',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <AppBanner 
                    title="The Playlister" 
                    onHome={() => store.closeCurrentPlaylist()} 
                    mode="nav"
                    navButtons={[
                        { label: 'Playlists', to: '/playlists' },
                        { label: 'Song Catalog', to: '/songs', bgcolor: '#0d47a1', color: 'white', hoverBg: '#1565c0' }
                    ]}
                />

                <Box sx={{ padding: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 1
                    }}>
                        <Typography variant="h6">
                            {auth.loggedIn 
                                ? `My Playlists (${filteredPlaylists.length})`
                                : `All Playlists (${filteredPlaylists.length})`
                            }
                        </Typography>
                        {auth.loggedIn ? (
                            <Button 
                                variant="contained" 
                                sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' } }}
                                onClick={handleCreatePlaylist}
                            >
                                + New Playlist
                            </Button>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="contained" size="small" href="/login" sx={{ bgcolor: '#205697' }}>
                                    Login
                                </Button>
                                <Button variant="contained" color="secondary" size="small" href="/register">
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Search and Sort */}
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, padding: 2 }}>
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
                            textAlign: 'center',
                            flexGrow: 1
                        }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                No playlists found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchText ? 'Try different search criteria' : 'No playlists available yet'}
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ bgcolor: 'white', borderRadius: 2, flexGrow: 1, overflowY: 'auto' }}>
                            {filteredPlaylists.map((playlist) => {
                                const isOwner = auth.loggedIn && auth.user && playlist.owner?._id === auth.user._id;
                                
                                return (
                                    <ListItem
                                        key={playlist._id}
                                        sx={{
                                            borderBottom: '1px solid #e0e0e0',
                                            cursor: isOwner ? 'pointer' : 'default',
                                            '&:hover': {
                                                bgcolor: isOwner ? '#f5f5f5' : 'transparent'
                                            },
                                            '&:last-child': { borderBottom: 'none' }
                                        }}
                                        onClick={() => isOwner && handlePlaylistClick(playlist)}
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
                                            onClick={(e) => handleOpenPlay(playlist, e)}
                                        >
                                            <PlayArrowIcon />
                                        </IconButton>
                                        {isOwner && (
                                            <>
                                                <IconButton
                                                    edge="end"
                                                    aria-label="edit"
                                                    sx={{ mr: 1 }}
                                                    onClick={(e) => handleOpenEdit(playlist, e)}
                                                >
                                                    <EditIcon />
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
                                                    onClick={(e) => handleOpenDelete(playlist, e)}
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
            </Box>

            {/* Play Playlist Modal */}
            <Dialog open={playDialogOpen} onClose={() => setPlayDialogOpen(false)}>
                <DialogTitle>Play Playlist</DialogTitle>
                <DialogContent>
                    <Typography>
                        Play "{selectedPlaylist?.name}"?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This will increment the play count and listen count.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPlayDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handlePlay} variant="contained">Play</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Playlist Modal */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Playlist</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Playlist Name"
                        value={editPlaylistName}
                        onChange={(e) => setEditPlaylistName(e.target.value)}
                        margin="normal"
                        autoFocus
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Songs: {selectedPlaylist?.songs.length || 0}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEdit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Playlist Modal */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Playlist</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedPlaylist?.name}"?
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
